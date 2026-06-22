import { jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { email, password, full_name } = await request.json();

  if (!email?.trim())                   return jsonError('Email is required.');
  if (!password || password.length < 6) return jsonError('Password must be at least 6 characters.');

  const admin = createAdminClient();

  // Create the auth user without sending a confirmation email.
  // No business is created — this is a platform member account only.
  const { data, error: authErr } = await admin.auth.admin.createUser({
    email:         email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name?.trim() ?? '' },
  });

  if (authErr) {
    // Surface friendly duplicate-email message
    if (authErr.message.toLowerCase().includes('already')) {
      return jsonError('An account with this email already exists. Try signing in.');
    }
    return jsonError(authErr.message);
  }

  return jsonOk({ id: data.user.id });
}
