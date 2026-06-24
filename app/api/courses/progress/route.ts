import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Not authenticated.', 401);

  const { lesson_id, completed } = await req.json() as { lesson_id: string; completed: boolean };
  if (!lesson_id) return jsonError('lesson_id is required.');

  const admin = createAdminClient();
  const { error } = await admin
    .from('lesson_progress')
    .upsert(
      { user_id: user.id, lesson_id, completed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' }
    );

  if (error) return jsonError(error.message);
  return jsonOk({ ok: true });
}
