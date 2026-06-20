import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppProvider } from '@/context/AppContext';
import { DialogProvider } from '@/context/DialogContext';
import Sidebar from '@/components/layout/Sidebar';
import type { UserRole } from '@/lib/permissions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  const [{ data: profile }, { data: products }] = await Promise.all([
    admin.from('user_profiles').select('id, full_name, role').eq('id', user.id).single(),
    admin.from('products').select('stock_qty, reorder_level'),
  ]);

  if (!profile) redirect('/login');

  const lowStockCount = (products ?? []).filter(
    (p: { stock_qty: number; reorder_level: number }) => p.stock_qty <= p.reorder_level,
  ).length;

  const userProfile = {
    id: profile.id as string,
    full_name: profile.full_name as string,
    role: profile.role as UserRole,
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
