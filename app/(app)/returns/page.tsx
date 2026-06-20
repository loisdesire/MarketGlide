'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { RETURN_REASONS, RETURN_STATUSES, CURRENCY_CODES } from '@/lib/constants';

interface Sale { id: string; invoice_number: string; product_id: string; }
interface ReturnRecord {
  id: string; sale_id: string; date: string; qty: number; reason: string;
  refund_amount: number; currency: string; status: string; restock: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ReturnsPage() {
  const { fmt, displayCurrency } = useApp();
  const [returns, setReturns]   = useState<ReturnRecord[]>([]);
  const [sales, setSales]       = useState<Sale[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState<Partial<ReturnRecord>>({});
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const [r, s, p] = await Promise.all([
      supabase.from('returns').select('*').order('date', { ascending: false }),
      supabase.from('sales').select('id,invoice_number,product_id').order('date', { ascending: false }),
      supabase.from('products').select('id,name'),
    ]);
    setReturns((r.data ?? []) as ReturnRecord[]);
    setSales((s.data ?? []) as Sale[]);
    setProducts((p.data ?? []) as { id: string; name: string }[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openModal() {
    setForm({
      sale_id: sales[0]?.id ?? '', date: today(), qty: 1,
      reason: RETURN_REASONS[0], refund_amount: 0, currency: displayCurrency,
      status: 'Pending', restock: true,
    });
    setError('');
    setModal(true);
  }

  const str = (k: keyof ReturnRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));
  const num = (k: keyof ReturnRecord) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }));

  async function save() {
    if (!form.sale_id) { setError('Please select a sale.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setModal(false); setSaving(false); load();
  }

  const productMap = Object.fromEntries(products.map(p => [p.id, p.name]));
  const saleMap    = Object.fromEntries(sales.map(s => [s.id, s]));

  return (
    <div>
      <Topbar page="returns" />
      <div className="page-content">
        <div className="toolbar">
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={openModal} disabled={!sales.length}>
            <Plus size={14} /> New Return
          </button>
        </div>

        <div className="panel">
          <div className="panel-body flush scroll-x">
            {returns.length ? (
              <table>
                <thead>
                  <tr><th>Date</th><th>Sale Invoice</th><th>Product</th><th>Qty</th><th>Reason</th><th>Refund Amount</th><th>Restock</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {returns.map(r => {
                    const sale = saleMap[r.sale_id];
                    return (
                      <tr key={r.id}>
                        <td className="muted">{r.date}</td>
                        <td>{sale?.invoice_number ?? '—'}</td>
                        <td>{sale ? (productMap[sale.product_id] ?? '—') : '—'}</td>
                        <td className="tnum">{r.qty}</td>
                        <td>{r.reason}</td>
                        <td className="tnum">{fmt(r.refund_amount, r.currency)}</td>
                        <td>{r.restock ? '✓' : '—'}</td>
                        <td><Badge status={r.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <EmptyState message="No returns logged." />}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title="New Return" onClose={() => setModal(false)}>
          {error && <div className="alertbox" style={{ marginBottom: 12 }}><span>{error}</span></div>}
          <div className="form-grid">
            <div className="field field-span2"><label>Original Sale</label>
              <select value={form.sale_id ?? ''} onChange={str('sale_id')}>
                {sales.map(s => {
                  const prod = productMap[s.product_id];
                  return <option key={s.id} value={s.id}>{s.invoice_number}{prod ? ` — ${prod}` : ''}</option>;
                })}
              </select>
            </div>
            <div className="field"><label>Date Returned</label><input type="date" value={form.date ?? ''} onChange={str('date')} /></div>
            <div className="field"><label>Quantity Returned</label><input type="number" value={form.qty ?? 1} onChange={num('qty')} min={1} /></div>
            <div className="field"><label>Reason</label>
              <select value={form.reason ?? RETURN_REASONS[0]} onChange={str('reason')}>
                {RETURN_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field"><label>Refund Amount</label><input type="number" step="0.01" value={form.refund_amount ?? 0} onChange={num('refund_amount')} /></div>
            <div className="field"><label>Currency</label>
              <select value={form.currency ?? 'USD'} onChange={str('currency')}>
                {CURRENCY_CODES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Refund Status</label>
              <select value={form.status ?? 'Pending'} onChange={str('status')}>
                {RETURN_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 18, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.restock ?? true}
                  onChange={e => setForm(prev => ({ ...prev, restock: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                Return item to stock
              </label>
            </div>
          </div>
          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Return'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
