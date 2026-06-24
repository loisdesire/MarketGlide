'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Package, MessageSquare, ShoppingBag } from 'lucide-react';

const NAV = [
  { label: 'Dashboard',  href: '/admin',           Icon: LayoutDashboard },
  { label: 'Blog Posts', href: '/admin/blog',       Icon: FileText },
  { label: 'Products',   href: '/admin/products',   Icon: Package },
  { label: 'Purchases',  href: '/admin/purchases',  Icon: ShoppingBag },
  { label: 'Enquiries',  href: '/admin/enquiries',  Icon: MessageSquare },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <ul className="adm-nav">
      {NAV.map(({ label, href, Icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link href={href} className={`adm-nav-link${active ? ' active' : ''}`}>
              <Icon size={16} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
