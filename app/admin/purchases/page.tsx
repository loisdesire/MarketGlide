'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

type Purchase = {
  id: string;
  email: string;
  amount_usd: number;
  payment_provider: string;
  status: string;
  created_at: string;
  platform_products: { title: string; slug: string } | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/admin/purchases')
      .then(r => r.json())
      .then((res: { data: Purchase[] }) => setPurchases(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const total = purchases.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount_usd : 0), 0);

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Purchases</span>
        {purchases.length > 0 && (
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Total revenue: <strong style={{ color: 'var(--adm-text)' }}>${total.toFixed(2)}</strong>
          </span>
        )}
      </div>

      <div className="adm-page">
        <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="adm-empty"><p>Loading…</p></div>
          ) : purchases.length === 0 ? (
            <div className="adm-empty">
              <ShoppingBag size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
              <p>No purchases yet — they'll appear here once Stripe is live.</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--adm-text)' }}>{p.email}</td>
                      <td>
                        <div className="adm-table-title">{p.platform_products?.title ?? '—'}</div>
                        {p.platform_products?.slug && (
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.platform_products.slug}</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>${p.amount_usd.toFixed(2)}</td>
                      <td style={{ textTransform: 'capitalize', color: '#6b7280' }}>{p.payment_provider}</td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, borderRadius: 5, padding: '2px 8px',
                          background: p.status === 'completed' ? '#dcfce7' : p.status === 'refunded' ? '#fee2e2' : '#fef9c3',
                          color:      p.status === 'completed' ? '#15803d' : p.status === 'refunded' ? '#b91c1c' : '#a16207',
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
