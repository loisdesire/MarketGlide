'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

type Product = {
  id: string; slug: string; title: string; type: string;
  price_usd: number; is_active: boolean; sort_order: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    setSaving(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
      setMsg(`Product ${!current ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setMsg(''), 3000);
    }
    setSaving(null);
  }

  async function updatePrice(id: string, price: number) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_usd: price }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, price_usd: price } : p));
      setMsg('Price updated.');
      setTimeout(() => setMsg(''), 3000);
    }
  }

  const TYPE_LABELS: Record<string, string> = {
    course: 'Course', guide: 'Guide', template: 'Template',
    tool_access: 'Tool Access', bundle: 'Bundle',
  };

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">Products</span>
      </div>

      <div className="adm-page">
        {msg && <div className="adm-alert adm-alert-success">{msg}</div>}

        <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="adm-empty"><p>Loading...</p></div>
          ) : products.length === 0 ? (
            <div className="adm-empty">
              <Package size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
              <p>No products yet. Run migration 0005 first.</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Price (USD)</th>
                    <th>Status</th>
                    <th>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="adm-table-title">{p.title}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.slug}</div>
                      </td>
                      <td style={{ color: '#6b7280' }}>{TYPE_LABELS[p.type] ?? p.type}</td>
                      <td>
                        <input
                          type="number"
                          defaultValue={p.price_usd}
                          min={0}
                          step={0.01}
                          style={{ width: 80, padding: '5px 8px', border: '1.5px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}
                          onBlur={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val !== p.price_usd) updatePrice(p.id, val);
                          }}
                        />
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge-${p.is_active ? 'active' : 'inactive'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="adm-btn adm-btn-ghost adm-btn-sm"
                          disabled={saving === p.id}
                          onClick={() => toggleActive(p.id, p.is_active)}
                          title={p.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {p.is_active
                            ? <ToggleRight size={20} color="#15803d" />
                            : <ToggleLeft  size={20} color="#9ca3af" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
          Tip: Tab out of a price field to save it. Toggle the switch to activate or deactivate a product on the site.
        </p>
      </div>
    </>
  );
}
