'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, RotateCcw } from 'lucide-react';

type Purchase = {
  id: string;
  email: string;
  amount_usd: number;
  payment_provider: string;
  stripe_payment_intent: string | null;
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
  const [refunding, setRefunding] = useState<string | null>(null);
  const [msg,       setMsg]       = useState('');
  const [err,       setErr]       = useState('');

  async function load() {
    const res = await fetch('/api/admin/purchases');
    const data = await res.json() as { data: Purchase[] };
    setPurchases(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleRefund(p: Purchase) {
    if (!confirm(`Refund $${p.amount_usd.toFixed(2)} to ${p.email}? This cannot be undone.`)) return;
    setRefunding(p.id); setErr(''); setMsg('');
    const res = await fetch(`/api/admin/purchases/${p.id}/refund`, { method: 'POST' });
    const data = await res.json() as { error?: string };
    setRefunding(null);
    if (!res.ok) { setErr(data.error ?? 'Refund failed.'); return; }
    setMsg(`Refund issued to ${p.email}.`);
    load();
  }

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
        {msg && <div className="adm-alert adm-alert-success">{msg}</div>}
        {err && <div className="adm-alert adm-alert-error">{err}</div>}

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
                    <th></th>
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
                      <td>
                        {p.status === 'completed' && (
                          <button
                            onClick={() => handleRefund(p)}
                            disabled={refunding === p.id}
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            style={{ color: '#ef4444' }}
                            title="Issue refund"
                          >
                            <RotateCcw size={13} />
                            {refunding === p.id ? 'Refunding…' : 'Refund'}
                          </button>
                        )}
                      </td>
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
