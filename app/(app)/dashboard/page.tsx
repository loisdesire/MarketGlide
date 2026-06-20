'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import Topbar from '@/components/layout/Topbar';
import KpiCard from '@/components/ui/KpiCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Product { id: string; name: string; cost_price: number; sell_price: number; currency: string; stock_qty: number; reorder_level: number; }
interface Sale { id: string; invoice_number: string; date: string; net_sales: number; currency: string; channel: string; status: string; product_id: string; customer_id: string | null; }
interface Customer { id: string; name: string; }
interface PurchaseOrder { total_landed_cost: number; currency: string; date_ordered: string; }

function within(dateStr: string, range: string): boolean {
  const d = new Date(dateStr); const now = new Date();
  if (range === 'today') return dateStr === now.toISOString().slice(0, 10);
  if (range === 'week')  { const p = new Date(now); p.setDate(now.getDate() - 7);  return d >= p; }
  if (range === 'month') { const p = new Date(now); p.setDate(now.getDate() - 30); return d >= p; }
  if (range === 'year')  { const p = new Date(now); p.setFullYear(now.getFullYear() - 1); return d >= p; }
  return true;
}

export default function DashboardPage() {
  const { fmt, fmtNative, convert, displayCurrency } = useApp();
  const router = useRouter();
  const [products, setProducts]     = useState<Product[]>([]);
  const [sales, setSales]           = useState<Sale[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [purchases, setPurchases]   = useState<PurchaseOrder[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('products').select('id,name,cost_price,sell_price,currency,stock_qty,reorder_level'),
      supabase.from('sales').select('id,invoice_number,date,net_sales,currency,channel,status,product_id,customer_id').order('date', { ascending: false }),
      supabase.from('customers').select('id,name'),
      supabase.from('purchase_orders').select('total_landed_cost,currency,date_ordered'),
    ]).then(([p, s, c, po]) => {
      setProducts((p.data ?? []) as Product[]);
      setSales((s.data ?? []) as Sale[]);
      setCustomers((c.data ?? []) as Customer[]);
      setPurchases((po.data ?? []) as PurchaseOrder[]);
      setLoading(false);
    });
  }, []);

  const salesTotal = (range: string) =>
    sales
      .filter(s => !['Cancelled','Refunded'].includes(s.status) && within(s.date, range))
      .reduce((sum, s) => sum + convert(s.net_sales, s.currency), 0);

  const invValue   = products.reduce((a, p) => a + convert(p.stock_qty * p.cost_price, p.currency), 0);
  const lowStock   = products.filter(p => p.stock_qty <= p.reorder_level && p.stock_qty > 0);
  const outStock   = products.filter(p => p.stock_qty <= 0);

  const cogsMonth  = sales
    .filter(s => within(s.date, 'month') && !['Cancelled','Refunded'].includes(s.status))
    .reduce((a, s) => {
      const p = products.find(x => x.id === s.product_id);
      return a + convert((p?.cost_price ?? 0) * (s as unknown as { qty: number }).qty, p?.currency ?? s.currency);
    }, 0);
  const revMonth   = salesTotal('month');
  const netProfit  = revMonth - cogsMonth;

  const recentSales = sales.slice(0, 6);
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));
  const productMap  = Object.fromEntries(products.map(p => [p.id, p.name]));

  if (loading) return (
    <div>
      <Topbar page="dashboard" />
      <div className="page-content"><p className="muted">Loading…</p></div>
    </div>
  );

  return (
    <div>
      <Topbar page="dashboard" />
      <div className="page-content">
        <div className="kpi-row">
          <KpiCard label="Today's Sales"  value={fmtNative(salesTotal('today'), displayCurrency)} />
          <KpiCard label="This Week"      value={fmtNative(salesTotal('week'),  displayCurrency)} />
          <KpiCard label="This Month"     value={fmtNative(salesTotal('month'), displayCurrency)} />
          <KpiCard label="This Year"      value={fmtNative(salesTotal('year'),  displayCurrency)} />
        </div>
        <div className="kpi-row">
          <KpiCard label="Inventory Value"     value={fmtNative(invValue, displayCurrency)} sub={`${products.length} products · ${products.reduce((a,p)=>a+p.stock_qty,0)} units`} />
          <KpiCard label="Low Stock Alerts"    value={lowStock.length}  variant={lowStock.length  ? 'warn'   : 'default'} />
          <KpiCard label="Out of Stock"        value={outStock.length}  variant={outStock.length  ? 'danger' : 'default'} />
          <KpiCard label="Est. Net Profit (30d)" value={fmtNative(netProfit, displayCurrency)} sub="Revenue minus cost of goods sold" />
        </div>

        <div className="grid2">
          <div className="panel">
            <div className="panel-head">
              <h3>Recent Sales</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => router.push('/sales')}>View all</button>
            </div>
            <div className="panel-body flush scroll-x">
              {recentSales.length ? (
                <table>
                  <thead><tr><th>Date</th><th>Product</th><th>Customer</th><th>Channel</th><th style={{ textAlign: 'right' }}>Net Sales</th></tr></thead>
                  <tbody>
                    {recentSales.map(s => (
                      <tr key={s.id}>
                        <td className="muted">{s.date}</td>
                        <td>{productMap[s.product_id] ?? '—'}</td>
                        <td>{s.customer_id ? (customerMap[s.customer_id] ?? '—') : 'Walk-in'}</td>
                        <td>{s.channel}</td>
                        <td className="tnum" style={{ textAlign: 'right' }}>{fmt(s.net_sales, s.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <EmptyState message="No sales recorded yet." />}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Reorder Alerts</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => router.push('/inventory')}>View inventory</button>
            </div>
            <div className="panel-body flush scroll-x">
              {[...lowStock, ...outStock].length ? (
                <table>
                  <thead><tr><th>Product</th><th>Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
                  <tbody>
                    {[...lowStock, ...outStock].map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td className="tnum">{p.stock_qty}</td>
                        <td className="tnum">{p.reorder_level}</td>
                        <td><Badge status={p.stock_qty <= 0 ? 'Out of stock' : 'Low stock'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <EmptyState message="Stock levels look healthy. Nothing to reorder." />}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Financial Snapshot (last 30 days)</h3></div>
          <div className="panel-body">
            <div className="form-grid cols3">
              <div>
                <div className="lbl" style={{ fontSize: 11, color: 'var(--grey-500)', fontWeight: 600 }}>Revenue</div>
                <div className="tnum" style={{ fontSize: 17 }}>{fmtNative(revMonth, displayCurrency)}</div>
              </div>
              <div>
                <div className="lbl" style={{ fontSize: 11, color: 'var(--grey-500)', fontWeight: 600 }}>Cost of Goods Sold</div>
                <div className="tnum" style={{ fontSize: 17 }}>{fmtNative(cogsMonth, displayCurrency)}</div>
              </div>
              <div>
                <div className="lbl" style={{ fontSize: 11, color: 'var(--grey-500)', fontWeight: 600 }}>Purchases (Stock Bought In)</div>
                <div className="tnum" style={{ fontSize: 17 }}>
                  {fmtNative(
                    purchases.filter(p => within(p.date_ordered, 'month')).reduce((a,p)=>a+convert(p.total_landed_cost,p.currency),0),
                    displayCurrency,
                  )}
                </div>
              </div>
            </div>
            <p className="footnote">Figures convert each record&apos;s original currency into your display currency. Treat all converted totals as indicative.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
