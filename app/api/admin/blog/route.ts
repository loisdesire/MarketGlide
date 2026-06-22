import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, status, published_at, read_time_min, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json() as Record<string, unknown>;
  if (!body.title) return jsonError('Title is required.');
  if (!body.slug)  return jsonError('Slug is required.');

  const ALLOWED = new Set(['slug','title','excerpt','content','cover_url','category','tags','read_time_min','status','published_at']);
  const safeBody = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.has(k)));

  // Auto-set published_at when publishing for the first time
  if (safeBody.status === 'published' && !safeBody.published_at) {
    safeBody.published_at = new Date().toISOString();
  }

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('blog_posts')
    .insert(safeBody)
    .select()
    .single();

  if (dbErr) return jsonError(dbErr.message);
  return jsonOk(data, 201);
}
