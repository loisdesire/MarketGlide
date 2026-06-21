'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Receipt, Plus, Trash2, Printer, ArrowRight } from 'lucide-react';

interface LineItem { desc: string; qty: string; price: string; }

interface FormData {
  biz_name:  string;
  biz_phone: string;
  biz_addr:  string;
  cashier:   string;
  receipt_no: string;
  date:      string;
  currency:  string;
  items:     LineItem[];
  notes:     string;
}

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR', 'AED'];

const empty = (): LineItem => ({ desc: '', qty: '1', price: '' });

function today() { return new Date().toISOString().split('T')[0]; }

export default function ReceiptGeneratorPage() {
  const [form, setForm] = useState<FormData>({
    biz_name: '', biz_phone: '', biz_addr: '', cashier: '',
    receipt_no: 'RCP-001', date: today(), currency: 'NGN',
    items: [empty()], notes: 'Thank you for your business!',
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

  function addItem()         { setForm(f => ({ ...f, items: [...f.items, empty()] })); }
  function removeItem(i: number) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }

  const total = form.items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), 0);
  const fmt   = (n: number) => `${form.currency} ${n.toFixed(2)}`;

  if (preview) {
    return (
      <>
        <section className="fd-tool-page-hero">
          <div className="fd-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Receipt Preview</h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="fd-btn fd-btn-outline fd-btn-sm" onClick={() => setPreview(false)}>← Edit</button>
              <button className="fd-btn fd-btn-primary fd-btn-sm" onClick={() => window.print()}>
                <Printer size={15} /> Print
              </button>
            </div>
          </div>
        </section>

        <section className="fd-section">
          <div className="fd-container">
            <div className="fd-tool-widget" style={{ maxWidth: 380, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--fd-navy)', marginBottom: 4 }}>{form.biz_name || 'Your Business'}</div>
              {form.biz_addr  && <div style={{ fontSize: 12, color: 'var(--fd-muted)' }}>{form.biz_addr}</div>}
              {form.biz_phone && <div style={{ fontSize: 12, color: 'var(--fd-muted)' }}>{form.biz_phone}</div>}
              <hr style={{ border: 'none', borderTop: '1px dashed var(--fd-border)', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fd-muted)', marginBottom: 4 }}>
                <span>Receipt #{form.receipt_no}</span>
                <span>{form.date}</span>
              </div>
              {form.cashier && <div style={{ fontSize: 12, color: 'var(--fd-muted)', textAlign: 'left', marginBottom: 10 }}>Cashier: {form.cashier}</div>}
              <hr style={{ border: 'none', borderTop: '1px dashed var(--fd-border)', margin: '10px 0' }} />
              {form.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--fd-border)' }}>
                  <span>{it.desc || '-'} ×{it.qty}</span>
                  <span>{fmt((parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0))}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--fd-navy)', padding: '14px 0 0' }}>
                <span>TOTAL</span><span>{fmt(total)}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px dashed var(--fd-border)', margin: '14px 0' }} />
              {form.notes && <div style={{ fontSize: 12, color: 'var(--fd-muted)' }}>{form.notes}</div>}
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
            <div className="fd-tool-icon"><Receipt size={22} /></div>
            <div className="fd-section-label" style={{ margin: 0 }}>Receipt Generator</div>
          </div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 10 }}>Generate a point-of-sale receipt</h1>
          <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: 0, lineHeight: 1.7 }}>Fill in the details and preview a clean, printable receipt.</p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-tool-widget">
            <div className="fd-tool-field-row">
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Business name</label><input value={form.biz_name} onChange={setField('biz_name')} placeholder="Acme Store" /></div>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Phone</label><input value={form.biz_phone} onChange={setField('biz_phone')} placeholder="+234 800 000 0000" /></div>
            </div>
            <div className="fd-tool-field" style={{ marginTop: 16 }}><label>Address</label><input value={form.biz_addr} onChange={setField('biz_addr')} placeholder="Shop 12, Lagos Market" /></div>

            <hr className="fd-tool-divider" />

            <div className="fd-tool-field-row">
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Receipt #</label><input value={form.receipt_no} onChange={setField('receipt_no')} /></div>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Date</label><input type="date" value={form.date} onChange={setField('date')} /></div>
            </div>
            <div className="fd-tool-field-row" style={{ marginTop: 16 }}>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Currency</label>
                <select value={form.currency} onChange={setField('currency')}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="fd-tool-field" style={{ margin: 0 }}><label>Cashier</label><input value={form.cashier} onChange={setField('cashier')} placeholder="Staff name (optional)" /></div>
            </div>

            <hr className="fd-tool-divider" />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 12px' }}>Items</p>

            {form.items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div className="fd-tool-field" style={{ margin: 0 }}>
                  {i === 0 && <label>Item</label>}
                  <input value={it.desc} onChange={e => setItem(i, 'desc', e.target.value)} placeholder="Item name" />
                </div>
                <div className="fd-tool-field" style={{ margin: 0 }}>
                  {i === 0 && <label>Qty</label>}
                  <input type="number" min="1" value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} />
                </div>
                <div className="fd-tool-field" style={{ margin: 0 }}>
                  {i === 0 && <label>Price</label>}
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
              <Plus size={15} /> Add item
            </button>

            <div className="fd-tool-field"><label>Footer message</label><input value={form.notes} onChange={setField('notes')} placeholder="Thank you for your business!" /></div>

            <div className="fd-tool-result" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="fd-tool-result-label">Total</div>
                <div className="fd-tool-result-value">{fmt(total)}</div>
              </div>
              <button className="fd-btn fd-btn-primary" onClick={() => setPreview(true)}>
                <Receipt size={16} /> Preview Receipt
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="fd-related">
        <div className="fd-container">
          <div className="fd-related-title">Other free tools</div>
          <div className="fd-related-row">
            <Link href="/business-tools/invoice-generator"   className="fd-related-link"><ArrowRight size={14} />Invoice Generator</Link>
            <Link href="/business-tools/shipping-calculator" className="fd-related-link"><ArrowRight size={14} />Shipping Calculator</Link>
            <Link href="/business-tools/currency-converter"  className="fd-related-link"><ArrowRight size={14} />Currency Converter</Link>
          </div>
        </div>
      </div>
    </>
  );
}
