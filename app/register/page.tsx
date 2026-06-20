'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    business_name: '',
    full_name: '',
    email: '',
    password: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.business_name.trim()) { setError('Business name is required.'); return; }
    if (!form.email.trim())         { setError('Email is required.'); return; }
    if (form.password.length < 6)   { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);

    const supabase = createClient();

    // Step 1: create auth account
    const { error: signUpErr } = await supabase.auth.signUp({
      email:    form.email.trim(),
      password: form.password,
      options:  { data: { full_name: form.full_name.trim() } },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    // Step 2: create business + link user as Administrator
    const res = await fetch('/api/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        business_name: form.business_name.trim(),
        full_name:     form.full_name.trim(),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="brand" style={{ border: 'none', padding: '0 0 18px', marginBottom: 18 }}>
          <div className="brand-mark">
            <span className="brand-dot" style={{ background: 'var(--gold)' }} />
            <h1 style={{ color: 'var(--purple-dark)' }}>Market Glide<br />Solutions</h1>
          </div>
          <div className="brand-sub" style={{ color: 'var(--grey-500)' }}>
            Sales &amp; Inventory Tracker
          </div>
        </div>

        <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Create your business account</h3>
        <p style={{ fontSize: 12.5, color: 'var(--grey-500)', margin: '0 0 18px' }}>
          You'll be the Administrator. Add your team from Settings after logging in.
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
            <label>Business Name *</label>
            <input
              value={form.business_name}
              onChange={set('business_name')}
              placeholder="Acme Stores"
              required
              autoFocus
            />
          </div>
          <div className="field" style={{ marginBottom: 13 }}>
            <label>Your Full Name</label>
            <input
              value={form.full_name}
              onChange={set('full_name')}
              placeholder="Jane Smith"
            />
          </div>
          <div className="field" style={{ marginBottom: 13 }}>
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 11 }}
            disabled={loading}
          >
            {loading ? 'Setting up…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--grey-500)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--purple)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
