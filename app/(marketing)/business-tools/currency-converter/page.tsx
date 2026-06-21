'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { FALLBACK_RATES } from '@/lib/constants';

type Rates = Record<string, number>;

const CURRENCIES = ['USD', 'GBP', 'EUR', 'NGN', 'CNY', 'AED', 'GHS', 'KES', 'ZAR', 'CAD', 'AUD', 'JPY'];

export default function CurrencyConverterPage() {
  const [rates, setRates]     = useState<Rates>(FALLBACK_RATES as unknown as Rates);
  const [live, setLive]       = useState(false);
  const [amount, setAmount]   = useState('1');
  const [from, setFrom]       = useState('USD');
  const [to, setTo]           = useState('NGN');
  const [result, setResult]   = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then(d => { if (d.rates) { setRates(d.rates); setLive(d.live ?? false); } })
      .catch(() => {});
  }, []);

  function convert() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setResult(null); return; }
    const r     = rates as Record<string, number>;
    const inUSD = from === 'USD' ? amt : amt / (r[from] ?? 1);
    const out   = to   === 'USD' ? inUSD : inUSD * (r[to] ?? 1);
    setResult(Math.round(out * 10000) / 10000);
  }

  function swap() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  function fmt(n: number) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n);
  }

  return (
    <>
      <section className="fd-tool-page-hero">
        <div className="fd-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="fd-tool-icon"><DollarSign size={22} /></div>
            <div className="fd-section-label" style={{ margin: 0 }}>Currency Converter</div>
          </div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 10 }}>Live currency converter</h1>
          <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: 0, lineHeight: 1.7 }}>
            Convert between USD, NGN, GBP, EUR, CNY, and more.{' '}
            {live ? (
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Using live rates.</span>
            ) : (
              <span style={{ color: 'var(--fd-muted)' }}>Using cached rates.</span>
            )}
          </p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-tool-widget">
            <div className="fd-tool-field">
              <label>Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => { setAmount(e.target.value); setResult(null); }}
                placeholder="Enter amount"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end', marginBottom: 20 }}>
              <div className="fd-tool-field" style={{ margin: 0 }}>
                <label>From</label>
                <select value={from} onChange={e => { setFrom(e.target.value); setResult(null); }}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                type="button"
                onClick={swap}
                style={{ height: 44, width: 44, border: '1.5px solid var(--fd-border)', borderRadius: 8, background: 'var(--fd-bg-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fd-muted)', flexShrink: 0 }}
                aria-label="Swap currencies"
              >
                <ArrowLeftRight size={18} />
              </button>

              <div className="fd-tool-field" style={{ margin: 0 }}>
                <label>To</label>
                <select value={to} onChange={e => { setTo(e.target.value); setResult(null); }}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button className="fd-btn fd-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={convert}>
              Convert
            </button>

            {result !== null && (
              <div className="fd-tool-result">
                <div className="fd-tool-result-label">
                  {amount} {from} =
                </div>
                <div className="fd-tool-result-value">
                  {fmt(result)} <span style={{ fontSize: 20 }}>{to}</span>
                </div>
                <p className="fd-tool-result-note">
                  Rate: 1 {from} = {fmt((rates as Record<string,number>)[to] / ((rates as Record<string,number>)[from] || 1))} {to} ·{' '}
                  {live ? 'Live rate' : 'Cached rate, may be up to 24h old'}
                </p>
              </div>
            )}

            {/* Quick reference table */}
            <hr className="fd-tool-divider" />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', margin: '0 0 12px' }}>
              Quick reference: 1 USD in major currencies
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {['GBP', 'EUR', 'NGN', 'CNY', 'AED', 'GHS'].map(cur => {
                const r = rates as Record<string,number>;
                const rate = r[cur];
                return (
                  <div key={cur} style={{ background: 'var(--fd-bg-alt)', border: '1px solid var(--fd-border)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fd-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{cur}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fd-navy)' }}>{fmt(rate ?? 0)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="fd-related">
        <div className="fd-container">
          <div className="fd-related-title">Other business tools</div>
          <div className="fd-related-row">
            <Link href="/business-tools/shipping-calculator" className="fd-related-link"><ArrowRight size={14} />Shipping Calculator</Link>
            <Link href="/business-tools/invoice-generator"   className="fd-related-link"><ArrowRight size={14} />Invoice Generator</Link>
            <Link href="/business-tools/receipt-generator"   className="fd-related-link"><ArrowRight size={14} />Receipt Generator</Link>
            <Link href="/tracker/login"                      className="fd-related-link"><ArrowRight size={14} />Sales Tracker</Link>
          </div>
        </div>
      </div>
    </>
  );
}
