'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { CHANNELS, PAYMENT_METHODS, SALE_STATUSES, CURRENCY_CODES, RESTOCK_STATUSES } from '@/lib/constants';

interface Product { id: string; name: string; sku: string; sell_price: number; currency: string; stock_qty: number; }
interface Customer { id: string; name: string; }
interface Sale {
  id: string; invoice_number: string; date: string; customer_id: string | null;
  product_id: string; qty: number; unit_price: number; discount: number; tax: number;
  shipping_fee: number; gross_sales: number; net_sales: number; currency: string;
  payment_method: string; channel: string; status: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const STATUS_STYLE: Record<string, string> = {
  Pending:    'background:var(--warn-bg);color:var(--warn);border:1px solid var(--gold-light);',
  Processing: 'background:var(--warn-bg);color:var(--warn);border:1px solid var(--gold-light);',
  Shipped:    'background:var(--purple-soft);color:var(--purple);border:1px solid var(--grey-300);',
  Delivered:  'background:var(--success-bg);color:var(--success);border:1px solid var(--success);',
  Cancelled:  'background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger);',
  Refunded:   'background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger);',
};

export default function SalesPage() {
  const { fmt, fmtNative, displayCurrency } = useApp();
  const dialog                              = useDialog();
  const [sales, setSales]         = useState<Sale[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState<Partial<Sale & { _productPrice: number; _productCur: string }>>({});
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const [s, p, c] = await Promise.all([
      supabase.from('sales').select('*').order('date', { ascending: false }),
      supabase.from('products').select('id,name,sku,sell_price,currency,stock_qty').order('name'),
      supabase.from('customers').select('id,name').order('name'),
    ]);
    setSales((s.data ?? []) as Sale[]);
    setProducts((p.data ?? []) as Product[]);
    setCustomers((c.data ?? []) as Customer[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openModal() {
    const p = products[0];
    setForm({
      date: today(), customer_id: '', product_id: p?.id ?? '',
      qty: 1, unit_price: p?.sell_price ?? 0, discount: 0, tax: 0, shipping_fee: 0,
      currency: p?.currency ?? displayCurrency, payment_method: PAYMENT_METHODS[0],
      channel: CHANNELS[0], status: 'Pending',
    });
    setError('');
    setModal(true);
  }

  const netSales = (f: typeof form) =>
    ((f.qty ?? 1) * (f.unit_price ?? 0)) - (f.discount ?? 0) + (f.tax ?? 0) + (f.shipping_fee ?? 0);

  const num = (k: keyof Sale) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }));
  const str = (k: keyof Sale) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  function onProductChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = products.find(x => x.id === e.target.value);
    setForm(prev => ({ ...prev, product_id: e.target.value, unit_price: p?.sell_price ?? 0, currency: p?.currency ?? displayCurrency }));
  }

  async function save() {
    if (!form.product_id) { setError('Please select a product.'); return; }
    setSaving(true); setError('');
    const body = { ...form, customer_id: form.customer_id || null };
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setModal(false); setSaving(false); load();
  }

  async function changeStatus(saleId: string, newStatus: string) {
    const res = await fetch(`/api/sales/${saleId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const err = await res.json();
      if (err.confirm) {
        if (await dialog.confirm(err.confirm, { title: 'Low Stock Warning', confirmLabel: 'Continue Anyway', variant: 'danger' })) {
          await fetch(`/api/sales/${saleId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, force: true }),
          });
        }
      } else {
        await dialog.alert(err.error ?? 'Failed to update status.', { title: 'Error' });
      }
    }
    load();
  }

  async function del(id: string) {
    if (!await dialog.confirm('Delete this sale record? This cannot be undone.', { title: 'Delete Sale', confirmLabel: 'Delete', variant: 'danger' })) return;
    await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    load();
  }

  const productMap  = Object.fromEntries(products.map(p => [p.id, p.name]));
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  return (
    <div>
      <Topbar page="sales" />
      <div className="page-content">
        <div className="toolbar">
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={openModal} disabled={!products.length}>
            <Plus size={14} /> Record Sale
          </button>
        </div>

        <div className="panel">
          <div className="panel-body flush scroll-x">
            {sales.length ? (
              <table>
                <thead>
                  <tr><th>Invoice #</th><th>Date</th><th>Product</th><th>Customer</th><th>Qty</th><th>Channel</th><th>Payment</th><th>Net Sales</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s.id}>
                      <td><b>{s.invoice_number}</b></td>
                      <td className="muted">{s.date}</td>
                      <td>{productMap[s.product_id] ?? '—'}</td>
                      <td>{s.customer_id ? (customerMap[s.customer_id] ?? '—') : 'Walk-in'}</td>
                      <td className="tnum">{s.qty}</td>
                      <td>{s.channel}</td>
                      <td>{s.payment_method}</td>
                      <td className="tnum">{fmt(s.net_sales, s.currency)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={s.status}
                          onChange={e => changeStatus(s.id, e.target.value)}
                          style={{ cssText: STATUS_STYLE[s.status] ?? '' } as React.CSSProperties}
                        >
                          {SALE_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => del(s.id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState message="No sales recorded yet." />}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title="Record Sale" onClose={() => setModal(false)}>
          {error && <div className="alertbox" style={{ marginBottom: 12 }}><span>{error}</span></div>}
          <div className="form-grid">
            <div className="field">
              <label>Invoice Number</label>
              <input value="Auto-generated" disabled style={{ background: 'var(--grey-100)', color: 'var(--grey-500)', cursor: 'not-allowed' }} />
              <span className="hint">Auto-generated on save, cannot be edited</span>
            </div>
            <div className="field"><label>Date</label><input type="date" value={form.date ?? ''} onChange={str('date')} /></div>
            <div className="field field-span2"><label>Customer</label>
              <select value={form.customer_id ?? ''} onChange={str('customer_id')}>
                <option value="">Walk-in / one-time customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Product</label>
              <select value={form.product_id ?? ''} onChange={onProductChange}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock_qty} in stock)</option>)}
              </select>
            </div>
            <div className="field"><label>Quantity Sold</label><input type="number" value={form.qty ?? 1} onChange={num('qty')} min={1} /></div>
            <div className="field"><label>Unit Price</label><input type="number" step="0.01" value={form.unit_price ?? 0} onChange={num('unit_price')} /></div>
            <div className="field"><label>Discount (amount)</label><input type="number" step="0.01" value={form.discount ?? 0} onChange={num('discount')} /></div>
            <div className="field"><label>Tax</label><input type="number" step="0.01" value={form.tax ?? 0} onChange={num('tax')} /></div>
            <div className="field"><label>Shipping Fee Charged</label><input type="number" step="0.01" value={form.shipping_fee ?? 0} onChange={num('shipping_fee')} /></div>
            <div className="field"><label>Currency</label>
              <select value={form.currency ?? 'USD'} onChange={str('currency')}>
                {CURRENCY_CODES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Payment Method</label>
              <select value={form.payment_method ?? PAYMENT_METHODS[0]} onChange={str('payment_method')}>
                {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field"><label>Sales Channel</label>
              <select value={form.channel ?? CHANNELS[0]} onChange={str('channel')}>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Order Status</label>
              <select value={form.status ?? 'Pending'} onChange={str('status')}>
                {SALE_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="panel info-panel" style={{ marginTop: 14 }}>
            <div className="panel-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--purple-dark)' }}>Net Sales</span>
              <span className="tnum" style={{ fontSize: 18, color: 'var(--purple-dark)' }}>
                {fmtNative(netSales(form), form.currency ?? 'USD')}
              </span>
            </div>
          </div>
          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Sale'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
