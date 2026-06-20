import { getSessionUser, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);

  const { business_name, full_name } = await request.json();
  if (!business_name?.trim()) return jsonError('Business name is required.');

  const admin = createAdminClient();

  // Idempotency: if user already has a business, return it
  const { data: existing } = await admin
    .from('user_profiles')
    .select('business_id')
    .eq('id', user.id)
    .single();
  if (existing?.business_id) return jsonOk({ business_id: existing.business_id });

  // Create the business
  const { data: business, error: bizErr } = await admin
    .from('businesses')
    .insert({ name: business_name.trim() })
    .select('id')
    .single();
  if (bizErr || !business) return jsonError(bizErr?.message ?? 'Failed to create business.');

  // Link user to the new business as the first Administrator
  const { error: profileErr } = await admin
    .from('user_profiles')
    .update({
      business_id: business.id,
      role: 'Administrator',
      full_name: full_name?.trim() ?? '',
    })
    .eq('id', user.id);
  if (profileErr) return jsonError(profileErr.message);

  return jsonOk({ business_id: business.id });
}
