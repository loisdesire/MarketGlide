'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { CATEGORIES, CURRENCY_CODES, PRODUCT_STATUSES } from '@/lib/constants';

interface Product {
  id: string; sku: string; name: string; category: string; supplier: string;
  country_of_origin: string; cost_price: number; sell_price: number; currency: string;
  stock_qty: number; reorder_level: number; status: string;
}

const BLANK: Omit<Product, 'id'> = {
  sku: '', name: '', category: CATEGORIES[0], supplier: '', country_of_origin: '',
  cost_price: 0, sell_price: 0, currency: 'USD', stock_qty: 0, reorder_level: 5, status: 'Active',
};

export default function ProductsPage() {
  const { fmtNative, displayCurrency } = useApp();
  const dialog                         = useDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<'add' | 'edit' | null>(null);
  const [form, setForm]         = useState<Omit<Product, 'id'> & { id?: string }>(BLANK);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts((data ?? []) as Product[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p =>
    !search || [p.name, p.sku, p.category].join(' ').toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm({ ...BLANK, currency: displayCurrency });
    setError('');
    setModal('add');
  }

  function openEdit(p: Product) {
    const { id, ...rest } = p;
    setForm({ ...rest, id });
    setError('');
    setModal('edit');
  }

  async function save() {
    if (!form.name) { setError('Product name is required.'); return; }
    setSaving(true); setError('');
    const res = await fetch(
      modal === 'edit' ? `/api/products/${form.id}` : '/api/products',
      {
        method: modal === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      },
    );
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setModal(null);
    setSaving(false);
    load();
  }

  async function del(id: string) {
    if (!await dialog.confirm('Delete this product? This cannot be undone.', { title: 'Delete Product', confirmLabel: 'Delete', variant: 'danger' })) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  }

  function stockStatus(p: Product) {
    if (p.stock_qty <= 0) return 'Out of stock';
    if (p.stock_qty <= p.reorder_level) return 'Low stock';
    return 'In stock';
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }));

  return (
    <div>
      <Topbar page="products" />
      <div className="page-content">
        <div className="toolbar">
          <div className="searchbox search">
            <Search size={14} />
            <input placeholder="Search by name, SKU, or category" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Product</button>
        </div>

        <div className="panel">
          <div className="panel-body flush scroll-x">
            {filtered.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Product</th><th>SKU</th><th>Category</th><th>Supplier</th>
                    <th>Cost</th><th>Sell Price</th><th>Stock</th><th>Status</th><th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <b>{p.name}</b>
                        {p.country_of_origin && <div className="muted" style={{ fontSize: 11.5 }}>{p.country_of_origin}</div>}
                      </td>
                      <td className="muted">{p.sku}</td>
                      <td>{p.category}</td>
                      <td>{p.supplier}</td>
                      <td className="tnum">{fmtNative(p.cost_price, p.currency)}</td>
                      <td className="tnum">{fmtNative(p.sell_price, p.currency)}</td>
                      <td className="tnum">{p.stock_qty}</td>
                      <td><Badge status={stockStatus(p)} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(p.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState message={search ? 'No products match your search.' : 'No products yet. Add your first product to get started.'} />}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}>
          {error && <div className="alertbox" style={{ marginBottom: 12 }}><span>{error}</span></div>}
          <div className="form-grid">
            <div className="field"><label>Product Name</label><input value={form.name} onChange={f('name')} placeholder="e.g. Wireless Earbuds Pro" /></div>
            <div className="field"><label>SKU</label><input value={form.sku} onChange={f('sku')} placeholder="e.g. WEP-001" /></div>
            <div className="field"><label>Category</label>
              <select value={form.category} onChange={f('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Supplier</label><input value={form.supplier} onChange={f('supplier')} placeholder="e.g. Shenzhen Tech Co." /></div>
            <div className="field"><label>Country of Origin</label><input value={form.country_of_origin} onChange={f('country_of_origin')} placeholder="e.g. China" /></div>
            <div className="field"><label>Status</label>
              <select value={form.status} onChange={f('status')}>
                {PRODUCT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field"><label>Currency</label>
              <select value={form.currency} onChange={f('currency')}>
                {CURRENCY_CODES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Unit Cost Price</label><input type="number" step="0.01" value={form.cost_price} onChange={f('cost_price')} /></div>
            <div className="field"><label>Sell Price</label><input type="number" step="0.01" value={form.sell_price} onChange={f('sell_price')} /></div>
            <div className="field"><label>Stock Quantity</label><input type="number" value={form.stock_qty} onChange={f('stock_qty')} /></div>
            <div className="field">
              <label>Reorder Level</label>
              <input type="number" value={form.reorder_level} onChange={f('reorder_level')} />
              <span className="hint">Low-stock alert at or below this number</span>
            </div>
          </div>
          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
