import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager', 'Sales Staff'].includes(session.role)) return jsonError('Forbidden', 403);

  const body = await request.json() as Record<string, unknown>;
  if (!body.name) return jsonError('Customer name is required.');

  const ALLOWED = new Set(['name', 'phone', 'email', 'address', 'notes']);
  const safeBody = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.has(k)));

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('customers')
    .insert({ ...safeBody, business_id: session.businessId, created_by: session.userId })
    .select()
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data, 201);
}
