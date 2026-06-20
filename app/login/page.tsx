'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand" style={{ border: 'none', padding: '0 0 18px', marginBottom: 18 }}>
          <div className="brand-mark">
            <span className="brand-dot" style={{ background: 'var(--gold)' }} />
            <h1 style={{ color: 'var(--purple-dark)' }}>Market Glide<br />Solutions</h1>
          </div>
          <div className="brand-sub" style={{ color: 'var(--grey-500)' }}>
            Sales &amp; Inventory Tracker
          </div>
        </div>

        <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Sign in to your account</h3>
        <p style={{ fontSize: 12.5, color: 'var(--grey-500)', margin: '0 0 18px' }}>
          Use your email and password. Contact your Administrator to set up your account.
        </p>

        {error && (
          <div className="alertbox" style={{ marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}>
              <path d="M10.3 3.86l-8.18 14.18A1.5 1.5 0 0 0 3.4 20.5h17.2a1.5 1.5 0 0 0 1.28-2.46L13.7 3.86a1.5 1.5 0 0 0-2.6 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 13 }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 11 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
