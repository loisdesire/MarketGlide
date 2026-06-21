'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Trash2, Printer, ArrowRight } from 'lucide-react';

interface LineItem { desc: string; qty: string; price: string; }

interface FormData {
  biz_name:    string;
  biz_address: string;
  biz_email:   string;
  client_name: string;
  client_addr: string;
  inv_number:  string;
  inv_date:    string;
  due_date:    string;
  currency:    string;
  tax:         string;
  discount:    string;
  notes:       string;
  items:       LineItem[];
}

const CURRENCIES = ['USD', 'GBP', 'EUR', 'NGN', 'CNY', 'AED', 'GHS', 'KES', 'ZAR'];

const empty = (): LineItem => ({ desc: '', qty: '1', price: '' });

function today() {
  return new Date().toISOString().split('T')[0];
}

function dueIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function InvoiceGeneratorPage() {
  const [form, setForm] = useState<FormData>({
    biz_name: '', biz_address: '', biz_email: '',
    client_name: '', client_addr: '',
    inv_number: 'INV-001', inv_date: today(), due_date: dueIn(14),
    currency: 'USD', tax: '0', discount: '0', notes: '',
    items: [empty()],
  });
  const [preview, setPreview] = useState(false);

  function setField(key: keyof Omit<FormData, 'items'>) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function setItem(i: number, key: keyof LineItem, val: string) {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [key]: val };
      return { ...f, items };
    });
  }

  function addItem() { setForm(f => ({ ...f, items: [...f.items, empty()] })); }
  function removeItem(i: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  const subtotal  = form.items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), 0);
  const discAmt   = subtotal * ((parseFloat(form.discount) || 0) / 100);
  const taxAmt    = (subtotal - discAmt) * ((parseFloat(form.tax) || 0) / 100);
  const total     = subtotal - discAmt + taxAmt;
  const sym       = form.currency;

  function fmt(n: number) { return `${sym} ${n.toFixed(2)}`; }

  if (preview) {
    return (
      <>
        <section className="fd-tool-page-hero">
          <div className="fd-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Invoice Preview</h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="fd-btn fd-btn-outline fd-btn-sm" onClick={() => setPreview(false)}>← Edit</button>
              <button className="fd-btn fd-btn-primary fd-btn-sm" onClick={() => window.print()}>
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          </div>
        </section>

        <section className="fd-section">
          <div className="fd-container">
            <div className="fd-tool-widget" style={{ maxWidth: 760, fontFamily: 'inherit' }}>
              {/* Invoice header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--fd-navy)' }}>{form.biz_name || 'Your Business'}</div>
                  <div style={{ fontSize: 13, color: 'var(--fd-muted)', marginTop: 4, whiteSpace: 'pre-line' }}>{form.biz_address}</div>
                  <div style={{ fontSize: 13, color: 'var(--fd-muted)' }}>{form.biz_email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--fd-orange)', letterSpacing: '.02em' }}>INVOICE</div>
                  <div style={{ fontSize: 13, color: 'var(--fd-muted)', marginTop: 6 }}>#{form.inv_number}</div>
                  <div style={{ fontSize: 13, color: 'var(--fd-muted)' }}>Date: {form.inv_date}</div>
                  <div style={{ fontSize: 13, color: 'var(--fd-muted)' }}>Due: {form.due_date}</div>
                </div>
              </div>

              {/* Bill to */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--fd-muted)', marginBottom: 6 }}>Bill To</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fd-navy)' }}>{form.client_name || 'Client Name'}</div>
                <div style={{ fontSize: 13, color: 'var(--fd-muted)', whiteSpace: 'pre-line' }}>{form.client_addr}</div>
              </div>

              {/* Line items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--fd-border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', width: 60 }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', width: 110 }}>Unit Price</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', width: 110 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--fd-border)' }}>
                      <td style={{ padding: '10px 0', fontSize: 14 }}>{it.desc || '-'}</td>
                      <td style={{ padding: '10px 0', fontSize: 14, textAlign: 'right' }}>{it.qty}</td>
                      <td style={{ padding: '10px 0', fontSize: 14, textAlign: 'right' }}>{fmt(parseFloat(it.price) || 0)}</td>
                      <td style={{ padding: '10px 0', fontSize: 14, textAlign: 'right' }}>{fmt((parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ maxWidth: 280, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14 }}>
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                {parseFloat(form.discount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14, color: '#16a34a' }}>
                    <span>Discount ({form.discount}%)</span><span>-{fmt(discAmt)}</span>
                  </div>
                )}
                {parseFloat(form.tax) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14 }}>
                    <span>Tax ({form.tax}%)</span><span>{fmt(taxAmt)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 17, fontWeight: 800, color: 'var(--fd-navy)', borderTop: '2px solid var(--fd-navy)', marginTop: 4 }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>

              {form.notes && (
                <div style={{ marginTop: 24, padding: '14px 18px', background: 'var(--fd-bg-alt)', borderRadius: 8, fontSize: 13, color: 'var(--fd-muted)' }}>
                  <strong style={{ color: 'var(--fd-navy)' }}>Notes: </strong>{form.notes}
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="fd-tool-page-hero">
        <div className="fd-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="fd-tool-icon"><FileText size={22} /></div>
            <div className="fd-section-label" style={{ margin: 0 }}>Invoice Generator</div>
          </div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 10 }}>Create a professional invoice</h1>
          <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: 0, lineHeight: 1.7 }}>Fill in the details below and preview your invoice. Print or save as PDF.</p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-tool-widget" style={{ maxWidth: 760 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 12px' }}>Your Business</p>
                <div className="fd-tool-field"><label>Business name</label><input value={form.biz_name} onChange={setField('biz_name')} placeholder="Acme Stores" /></div>
                <div className="fd-tool-field"><label>Address</label><input value={form.biz_address} onChange={setField('biz_address')} placeholder="Lagos, Nigeria" /></div>
                <div className="fd-tool-field"><label>Email</label><input type="email" value={form.biz_email} onChange={setField('biz_email')} placeholder="you@email.com" /></div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 12px' }}>Client Details</p>
                <div className="fd-tool-field"><label>Client name</label><input value={form.client_name} onChange={setField('client_name')} placeholder="Client Name" /></div>
                <div className="fd-tool-field"><label>Client address</label><input value={form.client_addr} onChange={setField('client_addr')} placeholder="Abuja, Nigeria" /></div>
              </div>
            </div>

            <hr className="fd-tool-divider" />

            <div className="fd-tool-field-row" style={{ marginBottom: 16 }}>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Invoice #</label><input value={form.inv_number} onChange={setField('inv_number')} /></div>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Currency</label>
                <select value={form.currency} onChange={setField('currency')}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="fd-tool-field-row" style={{ marginBottom: 24 }}>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Invoice date</label><input type="date" value={form.inv_date} onChange={setField('inv_date')} /></div>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Due date</label><input type="date" value={form.due_date} onChange={setField('due_date')} /></div>
            </div>

            <hr className="fd-tool-divider" />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 12px' }}>Line Items</p>

            {form.items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div className="fd-tool-field" style={{ margin: 0 }}>
                  {i === 0 && <label>Description</label>}
                  <input value={it.desc} onChange={e => setItem(i, 'desc', e.target.value)} placeholder="Item description" />
                </div>
                <div className="fd-tool-field" style={{ margin: 0 }}>
                  {i === 0 && <label>Qty</label>}
                  <input type="number" min="1" value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} />
                </div>
                <div className="fd-tool-field" style={{ margin: 0 }}>
                  {i === 0 && <label>Unit price</label>}
                  <input type="number" min="0" step="0.01" value={it.price} onChange={e => setItem(i, 'price', e.target.value)} placeholder="0.00" />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={form.items.length === 1}
                  style={{ height: 44, width: 36, border: '1.5px solid var(--fd-border)', borderRadius: 8, background: 'none', cursor: 'pointer', color: 'var(--fd-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button type="button" className="fd-btn fd-btn-outline fd-btn-sm" onClick={addItem} style={{ marginBottom: 24 }}>
              <Plus size={15} /> Add line item
            </button>

            <hr className="fd-tool-divider" />

            <div className="fd-tool-field-row">
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Discount (%)</label><input type="number" min="0" max="100" value={form.discount} onChange={setField('discount')} /></div>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Tax (%)</label><input type="number" min="0" max="100" value={form.tax} onChange={setField('tax')} /></div>
            </div>

            <div className="fd-tool-field" style={{ marginTop: 16 }}>
              <label>Notes / Payment instructions</label>
              <textarea
                value={form.notes}
                onChange={setField('notes')}
                placeholder="e.g. Bank: GTBank · Account: 0123456789 · Payment due within 14 days."
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minHeight: 80, resize: 'vertical', outline: 'none' }}
              />
            </div>

            <div className="fd-tool-result" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="fd-tool-result-label">Total</div>
                <div className="fd-tool-result-value">{fmt(total)}</div>
              </div>
              <button className="fd-btn fd-btn-primary" onClick={() => setPreview(true)}>
                <FileText size={16} /> Preview Invoice
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="fd-related">
        <div className="fd-container">
          <div className="fd-related-title">Other free tools</div>
          <div className="fd-related-row">
            <Link href="/business-tools/receipt-generator"  className="fd-related-link"><ArrowRight size={14} />Receipt Generator</Link>
            <Link href="/business-tools/shipping-calculator" className="fd-related-link"><ArrowRight size={14} />Shipping Calculator</Link>
            <Link href="/business-tools/currency-converter" className="fd-related-link"><ArrowRight size={14} />Currency Converter</Link>
          </div>
        </div>
      </div>
    </>
  );
}
