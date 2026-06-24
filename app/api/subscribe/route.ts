import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

const VALID_SOURCES = new Set(['homepage','resources','blog','academy','contact','manual']);

export async function POST(request: Request) {
  const { email, first_name, source } = await request.json() as {
    email:       string;
    first_name?: string;
    source?:     string;
  };

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return jsonError('A valid email address is required.');
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('email_subscribers')
    .upsert(
      {
        email:      email.trim().toLowerCase(),
        first_name: first_name?.trim() ?? '',
        source:     VALID_SOURCES.has(source ?? '') ? source : 'homepage',
      },
      { onConflict: 'email', ignoreDuplicates: false }
    );

  if (error) {
    console.error('subscribe insert failed:', error.message);
    return jsonError('Failed to subscribe. Please try again.');
  }

  return jsonOk({ ok: true });
}
