'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Eye, EyeOff, Play, Download, Lock } from 'lucide-react';

type ProductInfo = { id: string; file_url: string; type: string; price_usd: number };
type UIState     = 'loading' | 'owned' | 'member' | 'guest';

type Props = {
  slug:     string;
  label?:   string; // e.g. "Enroll Now", "Get the Guide"
};

export default function ProductCTA({ slug, label = 'Get Access' }: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [uiState,  setUiState]  = useState<UIState>('loading');
  const [product,  setProduct]  = useState<ProductInfo | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Registration form state
  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState('');

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase
        .from('platform_products')
        .select('id, file_url, type, price_usd')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      setProduct(p ?? null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setUiState('guest'); return; }

      if (!p) { setUiState('member'); return; } // product not in DB yet

      const { data: purchase } = await supabase
        .from('user_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', p.id)
        .maybeSingle();

      setUiState(purchase ? 'owned' : 'member');
    })();
  }, [slug]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setFormError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    setFormError('');

    const res  = await fetch('/api/platform/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ full_name: fullName, email, password }),
    });
    const data = await res.json() as { error?: string };

    if (!res.ok) {
      setFormError(data.error ?? 'Registration failed. Please try again.');
      setSubmitting(false);
      return;
    }

    await supabase.auth.signInWithPassword({ email, password });
    router.push(`/checkout?product=${slug}`);
  }

  /* ── Owned: show access ── */
  if (uiState === 'owned' && product) {
    if (!product.file_url) {
      return <span style={{ fontSize: 14, color: '#86efac', fontWeight: 600 }}>✓ You have access</span>;
    }
    return (
      <a href={product.file_url} target="_blank" rel="noopener noreferrer"
        className="fd-btn fd-btn-primary" style={{ fontSize: 15, padding: '12px 24px', textDecoration: 'none' }}>
        {product.type === 'course' ? <><Play size={15} /> Watch Course</> : <><Download size={15} /> Download Now</>}
      </a>
    );
  }

  /* ── Logged-in, not purchased ── */
  if (uiState === 'member') {
    return (
      <button onClick={() => router.push(`/checkout?product=${slug}`)}
        className="fd-btn fd-btn-primary"
        style={{ fontSize: 15, padding: '12px 24px', border: 'none', cursor: 'pointer' }}>
        <Lock size={14} /> {label}{product ? ` — $${product.price_usd}` : ''} <ArrowRight size={14} />
      </button>
    );
  }

  /* ── Loading skeleton ── */
  if (uiState === 'loading') {
    return <div style={{ height: 50, width: 200, background: 'rgba(255,255,255,.12)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />;
  }

  /* ── Guest: button → inline register form ── */
  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="fd-btn fd-btn-primary"
          style={{ fontSize: 15, padding: '12px 24px', border: 'none', cursor: 'pointer' }}>
          {label}{product ? ` — $${product.price_usd}` : ''} <ArrowRight size={15} />
        </button>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,.07)',
          border: '1px solid rgba(255,255,255,.16)',
          borderRadius: 14,
          padding: '22px 24px',
          maxWidth: 370,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            Create your account to continue
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 18px' }}>
            Already have one?{' '}
            <a href="/login" style={{ color: 'var(--fd-orange)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
          </p>

          {formError && (
            <div style={{ background: '#fee2e2', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#b91c1c', marginBottom: 14 }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { placeholder: 'Full name',      value: fullName,  set: setFullName,  type: 'text',     auto: 'name' },
              { placeholder: 'Email address',  value: email,     set: setEmail,     type: 'email',    auto: 'email' },
            ].map(f => (
              <input key={f.placeholder}
                type={f.type} required autoComplete={f.auto}
                placeholder={f.placeholder} value={f.value}
                onChange={e => f.set(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: 13.5, outline: 'none', width: '100%', boxSizing: 'border-box' }}
              />
            ))}

            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} required minLength={6}
                autoComplete="new-password" placeholder="Password (min 6 characters)"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.45)', padding: 0, display: 'flex' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button type="submit" disabled={submitting}
              className="fd-btn fd-btn-primary"
              style={{ justifyContent: 'center', border: 'none', cursor: 'pointer', opacity: submitting ? .7 : 1, marginTop: 4 }}>
              {submitting ? 'Creating account…' : <>Continue to payment <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
