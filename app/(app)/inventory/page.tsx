'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import KpiCard from '@/components/ui/KpiCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Product { id: string; name: string; sku: string; cost_price: number; currency: string; stock_qty: number; reorder_level: number; }
interface Adjustment { id: string; date: string; product_id: string; qty_change: number; reason: string; }

export default function InventoryPage() {
  const { fmt, fmtNative, convert, displayCurrency } = useApp();
  const dialog                      = useDialog();
  const [setQtyTarget, setSetQtyTarget] = useState<{ product: Product; value: string } | null>(null);
  const [products, setProducts]         = useState<Product[]>([]);
  const [adjustments, setAdjustments]   = useState<Adjustment[]>([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [p, a] = await Promise.all([
      supabase.from('products').select('id,name,sku,cost_price,currency,stock_qty,reorder_level').order('name'),
      supabase.from('inventory_adjustments').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setProducts((p.data ?? []) as Product[]);
    setAdjustments((a.data ?? []) as Adjustment[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function adjust(productId: string, delta: number) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    if (p.stock_qty + delta < 0) return;
    await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, qty_change: delta, reason: delta > 0 ? 'Manual increase' : 'Manual decrease' }),
    });
    load();
  }

  function openSetQty(p: Product) {
    setSetQtyTarget({ product: p, value: String(p.stock_qty) });
  }

  async function confirmSetQty() {
    if (!setQtyTarget) return;
    const n = parseInt(setQtyTarget.value, 10);
    if (isNaN(n) || n < 0) {
      await dialog.alert('Please enter a valid non-negative number.', { title: 'Invalid Quantity' });
      return;
    }
    setSetQtyTarget(null);
    await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: setQtyTarget.product.id, qty_change: n - setQtyTarget.product.stock_qty, reason: 'Manual stock count adjustment' }),
    });
    load();
  }

  const filtered    = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const invValue    = products.reduce((a, p) => a + convert(p.stock_qty * p.cost_price, p.currency), 0);
  const lowCount    = products.filter(p => p.stock_qty <= p.reorder_level && p.stock_qty > 0).length;
  const outCount    = products.filter(p => p.stock_qty <= 0).length;
  const totalUnits  = products.reduce((a, p) => a + p.stock_qty, 0);

  const productMap  = Object.fromEntries(products.map(p => [p.id, p.name]));

  function stockStatus(p: Product) {
    if (p.stock_qty <= 0) return 'Out of stock';
    if (p.stock_qty <= p.reorder_level) return 'Low stock';
    return 'In stock';
  }

  if (loading) return (
    <div>
      <Topbar page="inventory" />
      <div className="page-content"><p className="muted">Loading…</p></div>
    </div>
  );

  return (
    <div>
      <Topbar page="inventory" />
      <div className="page-content">
        <div className="kpi-row">
          <KpiCard label="Total Inventory Value" value={fmtNative(invValue, displayCurrency)} />
          <KpiCard label="Low Stock"             value={lowCount}   variant={lowCount  ? 'warn'   : 'default'} />
          <KpiCard label="Out of Stock"          value={outCount}   variant={outCount  ? 'danger' : 'default'} />
          <KpiCard label="Total Units on Hand"   value={totalUnits} />
        </div>

        <div className="toolbar">
          <div className="searchbox search">
            <Search size={14} />
            <input placeholder="Search products" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-body flush scroll-x">
            {filtered.length ? (
              <table>
                <thead>
                  <tr><th>Product</th><th>SKU</th><th>Stock</th><th>Reorder Level</th><th>Unit Cost</th><th>Stock Value</th><th>Status</th><th>Adjust</th></tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td><b>{p.name}</b></td>
                      <td className="muted">{p.sku}</td>
                      <td className="tnum">{p.stock_qty}</td>
                      <td className="tnum">{p.reorder_level}</td>
                      <td className="tnum">{fmtNative(p.cost_price, p.currency)}</td>
                      <td className="tnum">{fmt(p.stock_qty * p.cost_price, p.currency)}</td>
                      <td><Badge status={stockStatus(p)} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          <button className="stockbtn" onClick={() => adjust(p.id, -1)}>−</button>
                          <button className="stockbtn" onClick={() => adjust(p.id, +1)}>+</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openSetQty(p)}>Set qty</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState message="No products to show. Add products first from the Products tab." />}
          </div>
        </div>

        {adjustments.length > 0 && (
          <div className="panel">
            <div className="panel-head"><h3>Recent Stock Adjustments</h3></div>
            <div className="panel-body flush scroll-x">
              <table>
                <thead><tr><th>Date</th><th>Product</th><th>Change</th><th>Reason</th></tr></thead>
                <tbody>
                  {adjustments.slice(0, 20).map(a => (
                    <tr key={a.id}>
                      <td className="muted">{a.date}</td>
                      <td>{productMap[a.product_id] ?? '—'}</td>
                      <td className="tnum" style={{ color: a.qty_change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {a.qty_change > 0 ? '+' : ''}{a.qty_change}
                      </td>
                      <td className="muted">{a.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {setQtyTarget && (
        <div className="modal-overlay" onClick={() => setSetQtyTarget(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{ margin: 0 }}>Set Stock Quantity</h3>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ margin: '0 0 0.75rem', color: 'var(--grey-700)' }}>
                New quantity for <b>{setQtyTarget.product.name}</b>
              </p>
              <input
                type="number"
                min={0}
                value={setQtyTarget.value}
                onChange={e => setSetQtyTarget(prev => prev ? { ...prev, value: e.target.value } : null)}
                onKeyDown={e => { if (e.key === 'Enter') confirmSetQty(); if (e.key === 'Escape') setSetQtyTarget(null); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--grey-300)', fontSize: '1rem' }}
                autoFocus
              />
            </div>
            <div className="formfoot">
              <button className="btn btn-ghost" onClick={() => setSetQtyTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSetQty}>Set Quantity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
