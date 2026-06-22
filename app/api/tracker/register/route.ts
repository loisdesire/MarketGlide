import { jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { email, password, business_name, full_name } = await request.json();

  if (!email?.trim())           return jsonError('Email is required.');
  if (!password || password.length < 6) return jsonError('Password must be at least 6 characters.');
  if (!business_name?.trim())   return jsonError('Business name is required.');

  const admin = createAdminClient();

  // Create auth user — email_confirm: true skips the verification email entirely.
  // role in user_metadata is read by the handle_new_user() trigger in 0003_triggers.sql,
  // which creates the user_profiles row. Passing 'Administrator' here ensures the trigger
  // creates the profile with the correct role rather than defaulting to 'Sales Staff'.
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email:         email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name?.trim() ?? '', role: 'Administrator' },
  });
  if (authErr) return jsonError(authErr.message);

  const userId = authData.user.id;

  // Create the business
  const { data: business, error: bizErr } = await admin
    .from('businesses')
    .insert({ name: business_name.trim() })
    .select('id')
    .single();
  if (bizErr || !business) {
    await admin.auth.admin.deleteUser(userId);
    return jsonError(bizErr?.message ?? 'Failed to create business.');
  }

  // Link user to the business as Administrator
  const { error: profileErr } = await admin
    .from('user_profiles')
    .upsert(
      {
        id:          userId,
        full_name:   full_name?.trim() ?? '',
        role:        'Administrator',
        business_id: business.id,
      },
      { onConflict: 'id' },
    );
  if (profileErr) {
    await admin.auth.admin.deleteUser(userId);
    return jsonError(profileErr.message);
  }

  return jsonOk({ business_id: business.id });
}
