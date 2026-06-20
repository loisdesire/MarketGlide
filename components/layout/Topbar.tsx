'use client';

import { Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRENCY_CODES, CURRENCIES } from '@/lib/constants';

const PAGE_META: Record<string, [string, string]> = {
  dashboard:  ['Dashboard',              "Today's snapshot across your whole business"],
  products:   ['Products',              'Your master catalog of every product you sell'],
  inventory:  ['Inventory',             'Stock levels, valuation, and reorder alerts'],
  purchases:  ['Purchases',             'Orders placed with your suppliers, including importation costs'],
  sales:      ['Sales',                 'Every sale, across every channel'],
  returns:    ['Returns & Refunds',     'Track returned items and refund status'],
  customers:  ['Customers',            'Your buyer relationships and purchase history'],
  invoices:   ['Invoice & Receipt',    'Generate and print documents from a sale'],
  reports:    ['Reports',              'Performance over time, by product, and by customer'],
  settings:   ['Business Settings',   'Edit your business profile used across invoices and receipts'],
};

export default function Topbar({ page }: { page: string }) {
  const { displayCurrency, setDisplayCurrency, ratesLive, setSidebarOpen } = useApp();
  const [title, sub] = PAGE_META[page] ?? ['', ''];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2>{title}</h2>
          <div className="pagesub">{sub}</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="ratepill">
          <span className={ratesLive ? 'dot-live' : 'dot-off'} />
          <span className="rate-label">{ratesLive ? 'Live rates' : 'Offline rates'}</span>
        </div>
        <div className="curwrap">
          <label>Display in</label>
          <select
            value={displayCurrency}
            onChange={e => setDisplayCurrency(e.target.value)}
            style={{ width: 'auto' }}
          >
            {CURRENCY_CODES.map(c => (
              <option key={c} value={c}>{c} — {CURRENCIES[c].name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
