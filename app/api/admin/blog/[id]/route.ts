import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (dbErr) return jsonError(dbErr.message, 404);
  return jsonOk(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  const ALLOWED = new Set(['slug','title','excerpt','content','cover_url','category','tags','read_time_min','status','published_at']);
  const safeBody = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.has(k)));
  if (!Object.keys(safeBody).length) return jsonError('No valid fields to update.');

  // Auto-set published_at when publishing for the first time
  if (safeBody.status === 'published' && !safeBody.published_at) {
    const admin = createAdminClient();
    const { data: existing } = await admin.from('blog_posts').select('published_at').eq('id', id).single();
    if (!existing?.published_at) safeBody.published_at = new Date().toISOString();
  }

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('blog_posts')
    .update(safeBody)
    .eq('id', id)
    .select()
    .single();

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();
  const { error: dbErr } = await admin.from('blog_posts').delete().eq('id', id);
  if (dbErr) return jsonError(dbErr.message);
  return jsonOk({ success: true });
}
