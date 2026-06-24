'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function NewsletterStrip() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, source: 'homepage' }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,.09)', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
      <div style={{ maxWidth: 'var(--fd-max)', margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Stay in the loop</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>Business tips, new resources, and product updates — no spam.</div>
        </div>

        {done ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#86efac', fontWeight: 600 }}>
            <CheckCircle size={16} /> You&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 280 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: 13.5, outline: 'none' }}
              />
              <button type="submit" disabled={loading}
                style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--fd-orange)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? .7 : 1, whiteSpace: 'nowrap' }}>
                {loading ? 'Saving…' : <> Subscribe <ArrowRight size={13} /></>}
              </button>
            </div>
            {error && <p style={{ fontSize: 12, color: '#fca5a5', margin: 0 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
