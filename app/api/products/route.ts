import { getSessionUserWithRole, jsonOk, jsonError } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*')
    .eq('business_id', session.businessId)
    .order('name');
  if (error) return jsonError(error.message);
  return jsonOk(data);
}

export async function POST(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session) return jsonError('Unauthorized', 401);
  if (!['Administrator', 'Manager'].includes(session.role)) return jsonError('Forbidden', 403);

  const body = await request.json();
  if (!body.name) return jsonError('Product name is required.');

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .insert({ ...body, business_id: session.businessId, created_by: session.userId })
    .select()
    .single();
  if (error) return jsonError(error.message);
  return jsonOk(data, 201);
}
