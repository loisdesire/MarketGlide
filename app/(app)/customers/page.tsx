'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';

interface Customer {
  id: string; name: string; phone: string; email: string; address: string;
  preferred_currency: string; total_orders: number; total_spent_usd: number;
  last_purchase_date: string | null; classification: string; notes: string;
}

export default function CustomersPage() {
  const { fmt } = useApp();
  const dialog  = useDialog();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('customers').select('*').order('name');
    setCustomers((data ?? []) as Customer[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const str = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function save() {
    if (!form.name) { setError('Customer name is required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setModal(false); setSaving(false);
    setForm({ name: '', phone: '', email: '', address: '', notes: '' });
    load();
  }

  async function del(id: string) {
    if (!await dialog.confirm('Delete this customer? This cannot be undone.', { title: 'Delete Customer', confirmLabel: 'Delete', variant: 'danger' })) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <Topbar page="customers" />
      <div className="page-content">
        <div className="toolbar">
          <div className="searchbox search">
            <Search size={14} />
            <input placeholder="Search customers" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setError(''); setModal(true); }}>
            <Plus size={14} /> Add Customer
          </button>
        </div>

        <div className="panel">
          <div className="panel-body flush scroll-x">
            {filtered.length ? (
              <table>
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Total Spent (USD)</th><th>Last Purchase</th><th>Type</th><th /></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><b>{c.name}</b></td>
                      <td className="muted">{c.phone || '—'}</td>
                      <td className="muted">{c.email || '—'}</td>
                      <td className="tnum">{c.total_orders}</td>
                      <td className="tnum">{fmt(c.total_spent_usd, 'USD')}</td>
                      <td className="muted">{c.last_purchase_date ?? '—'}</td>
                      <td><Badge status={c.classification} /></td>
                      <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => del(c.id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState message="No customers yet. Add one, or they will be linked automatically when a sale is recorded." />}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title="Add Customer" onClose={() => setModal(false)}>
          {error && <div className="alertbox" style={{ marginBottom: 12 }}><span>{error}</span></div>}
          <div className="form-grid">
            <div className="field field-span2"><label>Full Name</label><input value={form.name} onChange={str('name')} placeholder="Customer name" /></div>
            <div className="field"><label>Phone</label><input value={form.phone} onChange={str('phone')} /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={str('email')} /></div>
            <div className="field field-span2"><label>Address</label><input value={form.address} onChange={str('address')} /></div>
            <div className="field field-span2"><label>Notes</label><input value={form.notes} onChange={str('notes')} placeholder="Optional" /></div>
          </div>
          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Add Customer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
