'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    setError('');

    // Server creates the account without email confirmation
    const res  = await fetch('/api/platform/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ full_name: fullName, email, password }),
    });
    const data = await res.json() as { error?: string };

    if (!res.ok) {
      setError(data.error ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // Sign in immediately after account creation
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setError('Account created but sign-in failed — please go to the login page.');
      setLoading(false);
      return;
    }

    router.push('/members');
    router.refresh();
  }

  return (
    <>
      {/* Brand */}
      <Link href="/" style={{ marginBottom: 28, textDecoration: 'none' }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--fd-navy)', letterSpacing: '-.04em' }}>
          flom<span style={{ color: 'var(--fd-orange)' }}>digital</span>
        </span>
      </Link>

      {/* Card */}
      <div style={{
        background: '#fff',
        border: '1.5px solid var(--fd-border)',
        borderRadius: 16,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 4px 24px rgba(0,0,0,.06)',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fd-navy)', margin: '0 0 6px', letterSpacing: '-.03em' }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--fd-muted)', margin: '0 0 28px' }}>
          Access courses, guides, and tools from Flom Digital.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 18 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fd-navy)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Full name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: 'var(--fd-navy)' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fd-navy)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: 'var(--fd-navy)' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fd-navy)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ width: '100%', padding: '10px 42px 10px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: 'var(--fd-navy)' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fd-muted)', padding: 0, display: 'flex' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="fd-btn fd-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1 }}
          >
            <UserPlus size={16} />
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: 'var(--fd-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--fd-orange)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--fd-muted)' }}>
        <Link href="/" style={{ color: 'var(--fd-muted)', textDecoration: 'none' }}>← Back to site</Link>
      </p>
    </>
  );
}
