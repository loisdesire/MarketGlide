'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function EmailForm() {
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
        body:    JSON.stringify({ email, source: 'resources' }),
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

  if (done) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#15803d', fontWeight: 600 }}>
        <CheckCircle size={18} /> You're on the list — we'll notify you when resources drop.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--fd-border)', fontSize: 14, outline: 'none' }}
        />
        <button type="submit" disabled={loading} className="fd-btn fd-btn-primary" style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Saving…' : <> Notify me <ArrowRight size={14} /></>}
        </button>
      </div>
      {error && <p style={{ fontSize: 12.5, color: '#dc2626', margin: 0 }}>{error}</p>}
    </form>
  );
}
