'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid, Package, Layers, Truck, ShoppingCart, Undo2,
  Users, FileText, BarChart2, Settings, LogOut, X,
} from 'lucide-react';
import { useApp, signOut } from '@/context/AppContext';
import { ROLE_PERMISSIONS } from '@/lib/permissions';

const NAV = [
  { sec: 'Overview',       items: [{ id: 'dashboard', label: 'Dashboard',          Icon: LayoutGrid }] },
  { sec: 'Catalog',        items: [{ id: 'products',  label: 'Products',            Icon: Package   },
                                    { id: 'inventory', label: 'Inventory',           Icon: Layers    }] },
  { sec: 'Transactions',   items: [{ id: 'purchases', label: 'Purchases',           Icon: Truck     },
                                    { id: 'sales',     label: 'Sales',              Icon: ShoppingCart },
                                    { id: 'returns',   label: 'Returns',            Icon: Undo2     }] },
  { sec: 'Relationships',  items: [{ id: 'customers', label: 'Customers',           Icon: Users     }] },
  { sec: 'Documents',      items: [{ id: 'invoices',  label: 'Invoice & Receipt',  Icon: FileText  }] },
  { sec: 'Insights',       items: [{ id: 'reports',   label: 'Reports',            Icon: BarChart2 }] },
  { sec: 'Admin',          items: [{ id: 'settings',  label: 'Business Settings',  Icon: Settings  }] },
];

interface Props {
  lowStockCount: number;
}

export default function Sidebar({ lowStockCount }: Props) {
  const { user, sidebarOpen, setSidebarOpen } = useApp();
  const pathname = usePathname();
  const router   = useRouter();

  const allowed  = ROLE_PERMISSIONS[user?.role ?? 'Sales Staff'] ?? [];
  const initials = (user?.full_name || user?.role || 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  function navigate(id: string) {
    router.push(`/${id}`);
    setSidebarOpen(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <span className="brand-dot" />
            <h1>Market Glide<br />Solutions</h1>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          <div className="brand-sub">Sales &amp; Inventory Tracker</div>
        </div>

        <nav>
          {NAV.map(group => {
            const visible = group.items.filter(it => allowed.includes(it.id));
            if (!visible.length) return null;
            return (
              <div key={group.sec}>
                <div className="navsec">{group.sec}</div>
                {visible.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    className={`navbtn ${pathname === `/${id}` ? 'active' : ''}`}
                    onClick={() => navigate(id)}
                  >
                    <Icon className="ic" />
                    <span>{label}</span>
                    {id === 'inventory' && lowStockCount > 0 && (
                      <span className="badge">{lowStockCount}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidefoot">
          {user && (
            <div className="userbadge" style={{ marginBottom: 8 }}>
              <div className="av">{initials}</div>
              <div>
                <div className="nm">{user.full_name || user.role}</div>
                <div className="rl">{user.role}</div>
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={signOut}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
