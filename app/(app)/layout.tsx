import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppProvider } from '@/context/AppContext';
import { DialogProvider } from '@/context/DialogContext';
import Sidebar from '@/components/layout/Sidebar';
import type { UserRole } from '@/lib/permissions';

type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  business_id: string | null;
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: rawProfile } = await admin
    .from('user_profiles')
    .select('id, full_name, role, business_id')
    .eq('id', user.id)
    .single();

  const profile = rawProfile as ProfileRow | null;

  if (!profile) redirect('/login');
  if (!profile.business_id) redirect('/register');

  const { data: rawProducts } = await admin
    .from('products')
    .select('stock_qty, reorder_level')
    .eq('business_id', profile.business_id);

  const products = (rawProducts ?? []) as { stock_qty: number; reorder_level: number }[];

  const lowStockCount = products.filter(p => p.stock_qty <= p.reorder_level).length;

  const userProfile = {
    id:         profile.id,
    full_name:  profile.full_name,
    role:       profile.role as UserRole,
    businessId: profile.business_id,
  };

  return (
    <AppProvider initialProfile={userProfile}>
      <DialogProvider>
        <div className="main-shell">
          <Sidebar lowStockCount={lowStockCount} />
          <div className="main-content">{children}</div>
        </div>
      </DialogProvider>
    </AppProvider>
  );
}
