'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { PLATFORMS, CURRENCY_CODES } from '@/lib/constants';

interface Product { id: string; name: string; sku: string; }
interface PO {
  id: string; po_number: string; date_ordered: string; expected_delivery: string;
  supplier: string; platform: string; product_id: string; qty: number;
  shipping_agent: string; tracking_number: string; currency: string;
  product_cost: number; local_delivery: number; warehouse_fee: number;
  shipping_cost: number; customs_duty: number; clearing_charges: number;
  total_landed_cost: number; unit_landed_cost: number; status: string; notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function PurchasesPage() {
  const { fmt, fmtNative, displayCurrency } = useApp();
  const dialog                              = useDialog();
  const [pos, setPos]           = useState<PO[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState<Partial<PO>>({});
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const [p, po] = await Promise.all([
      supabase.from('products').select('id,name,sku').order('name'),
      supabase.from('purchase_orders').select('*').order('date_ordered', { ascending: false }),
    ]);
    setProducts((p.data ?? []) as Product[]);
    setPos((po.data ?? []) as PO[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openModal() {
    setForm({
      po_number: 'PO-' + Math.floor(1000 + Math.random() * 9000),
      date_ordered: today(),
      expected_delivery: '',
      supplier: '',
      platform: PLATFORMS[0],
      product_id: products[0]?.id ?? '',
      qty: 1,
      shipping_agent: '',
      tracking_number: '',
      currency: displayCurrency,
      product_cost: 0,
      local_delivery: 0,
      warehouse_fee: 0,
      shipping_cost: 0,
      customs_duty: 0,
      clearing_charges: 0,
      notes: '',
      status: 'Pending',
    });
    setError('');
    setModal(true);
  }

  const totalLanded = (f: Partial<PO>) =>
    (f.product_cost ?? 0) + (f.local_delivery ?? 0) + (f.warehouse_fee ?? 0) +
    (f.shipping_cost ?? 0) + (f.customs_duty ?? 0) + (f.clearing_charges ?? 0);

  const num = (k: keyof PO) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }));
  const str = (k: keyof PO) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function save() {
    if (!form.supplier) { setError('Supplier name is required.'); return; }
    if (!form.product_id) { setError('Please select a product.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, total_landed_cost: totalLanded(form), unit_landed_cost: totalLanded(form) / (form.qty || 1) }),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setModal(false); setSaving(false); load();
  }

  async function receive(id: string) {
    if (!await dialog.confirm('Mark this order as Received? This will add stock and update the product cost price.', { title: 'Receive Order', confirmLabel: 'Mark Received' })) return;
    const res = await fetch(`/api/purchases/${id}/receive`, { method: 'POST' });
    if (!res.ok) { await dialog.alert((await res.json()).error ?? 'Failed.', { title: 'Error' }); return; }
    load();
  }

  async function del(id: string) {
    if (!await dialog.confirm('Delete this purchase order? This cannot be undone.', { title: 'Delete Order', confirmLabel: 'Delete', variant: 'danger' })) return;
    await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
    load();
  }

  const productMap = Object.fromEntries(products.map(p => [p.id, `${p.name} (${p.sku})`]));
  const landed = totalLanded(form);

  return (
    <div>
      <Topbar page="purchases" />
      <div className="page-content">
        <div className="toolbar">
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={openModal} disabled={!products.length}>
            <Plus size={14} /> New Purchase Order
          </button>
        </div>

        {!products.length && (
          <div className="alertbox"><AlertTriangle size={15} /><div>Add products first before creating purchase orders.</div></div>
        )}

        <div className="panel">
          <div className="panel-body flush scroll-x">
            {pos.length ? (
              <table>
                <thead>
                  <tr><th>PO #</th><th>Date</th><th>Supplier</th><th>Platform</th><th>Product</th><th>Qty</th><th>Landed Cost</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {pos.map(po => (
                    <tr key={po.id}>
                      <td><b>{po.po_number}</b></td>
                      <td className="muted">{po.date_ordered}</td>
                      <td>{po.supplier}</td>
                      <td>{po.platform}</td>
                      <td>{productMap[po.product_id] ?? '—'}</td>
                      <td className="tnum">{po.qty}</td>
                      <td className="tnum">{fmt(po.total_landed_cost, po.currency)}</td>
                      <td><Badge status={po.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {po.status !== 'Received' && po.status !== 'Cancelled' ? (
                            <button className="btn btn-gold btn-sm" onClick={() => receive(po.id)}>Receive</button>
                          ) : (
                            <span className="muted" style={{ fontSize: 11.5 }}>{po.status}</span>
                          )}
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(po.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState message="No purchase orders yet. Create one when you order from a supplier." />}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title="New Purchase Order" onClose={() => setModal(false)} maxWidth={700}>
          {error && <div className="alertbox" style={{ marginBottom: 12 }}><span>{error}</span></div>}
          <div className="form-grid cols3">
            <div className="field"><label>PO Number</label><input value={form.po_number ?? ''} onChange={str('po_number')} /></div>
            <div className="field"><label>Date Ordered</label><input type="date" value={form.date_ordered ?? ''} onChange={str('date_ordered')} /></div>
            <div className="field"><label>Expected Delivery</label><input type="date" value={form.expected_delivery ?? ''} onChange={str('expected_delivery')} /></div>
            <div className="field"><label>Supplier Name</label><input value={form.supplier ?? ''} onChange={str('supplier')} placeholder="e.g. Guangzhou Trading Co." /></div>
            <div className="field"><label>Sourcing Platform</label>
              <select value={form.platform ?? PLATFORMS[0]} onChange={str('platform')}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field"><label>Shipping Agent</label><input value={form.shipping_agent ?? ''} onChange={str('shipping_agent')} placeholder="Optional" /></div>
            <div className="field field-span2"><label>Product</label>
              <select value={form.product_id ?? ''} onChange={str('product_id')}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="field"><label>Quantity Ordered</label><input type="number" value={form.qty ?? 1} onChange={num('qty')} min={1} /></div>
            <div className="field"><label>Tracking Number</label><input value={form.tracking_number ?? ''} onChange={str('tracking_number')} placeholder="Optional" /></div>
            <div className="field"><label>Currency</label>
              <select value={form.currency ?? 'USD'} onChange={str('currency')}>
                {CURRENCY_CODES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field field-span2"><label>Notes</label><input value={form.notes ?? ''} onChange={str('notes')} placeholder="Optional notes" /></div>
          </div>

          <h4 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--grey-500)', margin: '18px 0 10px' }}>
            Landed Cost Breakdown
          </h4>
          <div className="form-grid cols3">
            <div className="field"><label>Product Cost (total)</label><input type="number" step="0.01" value={form.product_cost ?? 0} onChange={num('product_cost')} /></div>
            <div className="field"><label>Local Delivery</label><input type="number" step="0.01" value={form.local_delivery ?? 0} onChange={num('local_delivery')} /></div>
            <div className="field"><label>Warehouse Fee</label><input type="number" step="0.01" value={form.warehouse_fee ?? 0} onChange={num('warehouse_fee')} /></div>
            <div className="field"><label>Shipping Cost</label><input type="number" step="0.01" value={form.shipping_cost ?? 0} onChange={num('shipping_cost')} /></div>
            <div className="field"><label>Customs Duty</label><input type="number" step="0.01" value={form.customs_duty ?? 0} onChange={num('customs_duty')} /></div>
            <div className="field"><label>Clearing Charges</label><input type="number" step="0.01" value={form.clearing_charges ?? 0} onChange={num('clearing_charges')} /></div>
          </div>

          <div className="panel info-panel" style={{ marginTop: 14 }}>
            <div className="panel-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--purple-dark)' }}>Total Landed Cost</span>
              <span className="tnum" style={{ fontSize: 18, color: 'var(--purple-dark)' }}>
                {fmtNative(landed, form.currency ?? 'USD')}
              </span>
            </div>
          </div>
          <p className="footnote">Product Cost + Local Delivery + Warehouse Fee + Shipping + Customs Duty + Clearing Charges. All indicative.</p>

          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving || !products.length}>
              {saving ? 'Saving…' : 'Save Purchase Order'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
