'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Sale { id: string; date: string; net_sales: number; currency: string; product_id: string; qty: number; }
interface Customer { id: string; name: string; total_orders: number; total_spent_usd: number; classification: string; }
interface Product { id: string; name: string; cost_price: number; currency: string; stock_qty: number; reorder_level: number; }

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: '7 Days' },
  { key: 'month', label: '30 Days' },
  { key: 'year',  label: '12 Months' },
];

function within(dateStr: string, range: string): boolean {
  const d = new Date(dateStr); const now = new Date();
  if (range === 'today') return dateStr === now.toISOString().slice(0, 10);
  if (range === 'week')  { const p = new Date(now); p.setDate(now.getDate() - 7);  return d >= p; }
  if (range === 'month') { const p = new Date(now); p.setDate(now.getDate() - 30); return d >= p; }
  if (range === 'year')  { const p = new Date(now); p.setFullYear(now.getFullYear() - 1); return d >= p; }
  return true;
}

export default function ReportsPage() {
  const { fmt, fmtNative, convert, displayCurrency } = useApp();
  const [sales, setSales]         = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [range, setRange]         = useState('month');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('sales').select('id,date,net_sales,currency,product_id,qty').not('status', 'in', '("Cancelled","Refunded")'),
      supabase.from('customers').select('id,name,total_orders,total_spent_usd,classification').order('total_spent_usd', { ascending: false }),
      supabase.from('products').select('id,name,cost_price,currency,stock_qty,reorder_level'),
    ]).then(([s, c, p]) => {
      setSales((s.data ?? []) as Sale[]);
      setCustomers((c.data ?? []) as Customer[]);
      setProducts((p.data ?? []) as Product[]);
      setLoading(false);
    });
  }, []);

  const inRange = sales.filter(s => within(s.date, range));

  // Sales by day
  const byDay: Record<string, number> = {};
  inRange.forEach(s => {
    byDay[s.date] = (byDay[s.date] ?? 0) + convert(s.net_sales, s.currency);
  });
  const dayEntries = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]));
  const maxRev = Math.max(1, ...dayEntries.map(x => x[1]));

  // Top products
  const productRevMap: Record<string, { qty: number; revenue: number }> = {};
  inRange.forEach(s => {
    if (!productRevMap[s.product_id]) productRevMap[s.product_id] = { qty: 0, revenue: 0 };
    productRevMap[s.product_id].qty     += s.qty;
    productRevMap[s.product_id].revenue += convert(s.net_sales, s.currency);
  });
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const topProducts = Object.entries(productRevMap)
    .map(([pid, v]) => ({ product: productMap[pid], ...v }))
    .filter(x => x.product)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const topCustomers = [...customers].slice(0, 8);
  const lowStock = products.filter(p => p.stock_qty <= p.reorder_level);

  if (loading) return (
    <div>
      <Topbar page="reports" />
      <div className="page-content"><p className="muted">Loading…</p></div>
    </div>
  );

  return (
    <div>
      <Topbar page="reports" />
      <div className="page-content">
        <div className="tabs">
          {RANGES.map(r => (
            <button key={r.key} className={`tabbtn ${range === r.key ? 'active' : ''}`} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid2">
          <div className="panel">
            <div className="panel-head"><h3>Sales Over Time</h3></div>
            <div className="panel-body">
              {dayEntries.length ? (
                <>
                  <div className="bar-chart">
                    {dayEntries.map(([date, val]) => (
                      <div key={date} className="bar-col">
                        <div
                          className="bar"
                          style={{ height: Math.max(4, (val / maxRev) * 120) }}
                          title={`${fmtNative(val, displayCurrency)} on ${date}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="footnote">{dayEntries.length} day(s) with sales · peak {fmtNative(maxRev, displayCurrency)}</p>
                </>
              ) : <EmptyState message="No sales in this period." />}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Top Customers</h3></div>
            <div className="panel-body flush scroll-x">
              {topCustomers.length ? (
                <table>
                  <thead><tr><th>Customer</th><th>Orders</th><th>Total Spent</th><th>Type</th></tr></thead>
                  <tbody>
                    {topCustomers.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td className="tnum">{c.total_orders}</td>
                        <td className="tnum">{fmt(c.total_spent_usd, 'USD')}</td>
                        <td><Badge status={c.classification} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <EmptyState message="No customer data yet." />}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Best-Selling Products ({RANGES.find(r => r.key === range)?.label})</h3>
          </div>
          <div className="panel-body flush scroll-x">
            {topProducts.length ? (
              <table>
                <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Est. Profit</th></tr></thead>
                <tbody>
                  {topProducts.map(x => {
                    const costUsd = convert((x.product.cost_price ?? 0) * x.qty, x.product.currency);
                    const profit = x.revenue - costUsd;
                    return (
                      <tr key={x.product.id}>
                        <td>{x.product.name}</td>
                        <td className="tnum">{x.qty}</td>
                        <td className="tnum">{fmtNative(x.revenue, displayCurrency)}</td>
                        <td className="tnum" style={{ color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {fmtNative(profit, displayCurrency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <EmptyState message="No sales in this period." />}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Reorder Report</h3></div>
          <div className="panel-body flush scroll-x">
            {lowStock.length ? (
              <table>
                <thead><tr><th>Product</th><th>Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
                <tbody>
                  {lowStock.map(p => (
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
    </div>
  );
}
