'use client';

import { useEffect, useState, useRef } from 'react';
import { Printer } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import Topbar from '@/components/layout/Topbar';
import { fmtNative } from '@/lib/currency';

interface Sale {
  id: string; invoice_number: string; date: string; customer_id: string | null;
  product_id: string; qty: number; unit_price: number; discount: number; tax: number;
  shipping_fee: number; gross_sales: number; net_sales: number; currency: string;
  payment_method: string; channel: string; status: string;
}
interface BusinessSettings { name: string; email: string; address: string; }
interface Customer { id: string; name: string; email: string; phone: string; address: string; }
interface Product { id: string; name: string; sku: string; }

export default function InvoicesPage() {
  const { } = useApp();
  const [sales, setSales]         = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [business, setBusiness]   = useState<BusinessSettings>({ name: 'Market Glide Solutions', email: '', address: '' });
  const [selectedId, setSelectedId] = useState('');
  const [docType, setDocType]     = useState<'invoice' | 'receipt'>('invoice');

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('sales').select('*').order('date', { ascending: false }),
      supabase.from('customers').select('id,name,email,phone,address'),
      supabase.from('products').select('id,name,sku'),
      supabase.from('business_settings').select('name,email,address').eq('id', 1).single(),
    ]).then(([s, c, p, b]) => {
      setSales((s.data ?? []) as Sale[]);
      setCustomers((c.data ?? []) as Customer[]);
      setProducts((p.data ?? []) as Product[]);
      if (b.data) setBusiness(b.data as BusinessSettings);
    });
  }, []);

  const sale     = sales.find(s => s.id === selectedId);
  const customer = sale?.customer_id ? customers.find(c => c.id === sale.customer_id) : null;
  const product  = sale ? products.find(p => p.id === sale.product_id) : null;

  const fn = (amt: number) => fmtNative(amt, sale?.currency ?? 'USD');

  return (
    <div>
      <Topbar page="invoices" />
      <div className="page-content">
        <div className="toolbar">
          <div className="field" style={{ minWidth: 280 }}>
            <label style={{ marginBottom: 5, fontSize: 11.5, fontWeight: 600, color: 'var(--grey-700)' }}>Select a sale to generate from</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">— Choose a sale —</option>
              {sales.map(s => {
                const p = products.find(x => x.id === s.product_id);
                return <option key={s.id} value={s.id}>{s.invoice_number} — {p?.name ?? ''} ({s.date})</option>;
              })}
            </select>
          </div>
          <div className="tabs" style={{ border: 'none', margin: '0 0 0 auto' }}>
            <button className={`tabbtn ${docType === 'invoice' ? 'active' : ''}`} onClick={() => setDocType('invoice')}>Invoice</button>
            <button className={`tabbtn ${docType === 'receipt' ? 'active' : ''}`} onClick={() => setDocType('receipt')}>Receipt</button>
          </div>
        </div>

        {!sale ? (
          <div className="panel">
            <div className="panel-body" style={{ textAlign: 'center', padding: 50, color: 'var(--grey-500)' }}>
              Select a sale above to generate a printable invoice or receipt.
            </div>
          </div>
        ) : docType === 'invoice' ? (
          <div className="invoice-sheet">
            <div className="inv-head">
              <div className="inv-logo">
                <div className="mark">MG</div>
                <div><div className="inv-title">{business.name}</div></div>
              </div>
              <div className="inv-meta">
                <div>{business.email}</div>
                <div>{business.address}</div>
              </div>
            </div>
            <div className="inv-parties">
              <div>
                <div className="label">Bill To</div>
                <b>{customer?.name ?? 'Walk-in Customer'}</b>
                {customer?.email && <div className="muted">{customer.email}</div>}
                {customer?.phone && <div className="muted">{customer.phone}</div>}
                {customer?.address && <div className="muted">{customer.address}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label">Invoice</div>
                <b>{sale.invoice_number}</b>
                <div className="muted">Date: {sale.date}</div>
                <div className="muted">Status: {sale.status}</div>
              </div>
            </div>
            <table className="inv-table">
              <thead><tr><th>Item</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
              <tbody>
                <tr>
                  <td>{product?.name ?? '—'}</td>
                  <td style={{ textAlign: 'right' }} className="tnum">{sale.qty}</td>
                  <td style={{ textAlign: 'right' }} className="tnum">{fn(sale.unit_price)}</td>
                  <td style={{ textAlign: 'right' }} className="tnum">{fn(sale.qty * sale.unit_price)}</td>
                </tr>
              </tbody>
            </table>
            <div className="inv-totals">
              <div className="row"><span>Subtotal</span><span>{fn(sale.gross_sales)}</span></div>
              <div className="row"><span>Discount</span><span>-{fn(sale.discount)}</span></div>
              <div className="row"><span>Tax</span><span>{fn(sale.tax)}</span></div>
              <div className="row"><span>Shipping</span><span>{fn(sale.shipping_fee)}</span></div>
              <div className="row grand"><span>Grand Total</span><span>{fn(sale.net_sales)}</span></div>
            </div>
            <div className="inv-foot">
              Thank you for your business. All amounts shown in {sale.currency}. {business.name} · {business.email}
            </div>
            <div className="noprint" style={{ textAlign: 'center', marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="invoice-sheet" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="inv-title" style={{ fontSize: 17 }}>{business.name}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{business.address}</div>
            </div>
            <div style={{ borderTop: '1px dashed var(--grey-300)', borderBottom: '1px dashed var(--grey-300)', padding: '10px 0', marginBottom: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Receipt #</span><b>{sale.invoice_number}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date</span><span>{sale.date}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Customer</span><span>{customer?.name ?? 'Walk-in'}</span></div>
            </div>
            <div style={{ fontSize: 12.5, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{product?.name ?? 'Item'} × {sale.qty}</span>
                <span>{fn(sale.qty * sale.unit_price)}</span>
              </div>
            </div>
            <div className="inv-totals" style={{ width: '100%', fontSize: 12.5 }}>
              <div className="row"><span>Amount Paid</span><span className="tnum">{fn(sale.net_sales)}</span></div>
              <div className="row"><span>Payment Method</span><span>{sale.payment_method}</span></div>
            </div>
            <div className="inv-foot">Thank you for shopping with us!</div>
            <div className="noprint" style={{ textAlign: 'center', marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
