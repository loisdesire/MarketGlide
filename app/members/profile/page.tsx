'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const supabase = createClient();

  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');
  const [err,       setErr]       = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return; }
      setFullName(user.user_metadata?.full_name ?? '');
      setEmail(user.email ?? '');
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(''); setMsg('');

    const updates: Record<string, unknown> = { data: { full_name: fullName } };
    if (newPw) {
      if (newPw.length < 6) { setErr('Password must be at least 6 characters.'); setSaving(false); return; }
      updates.password = newPw;
    }

    const { error } = await supabase.auth.updateUser(updates);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setMsg('Profile updated.');
    setNewPw('');
    setTimeout(() => setMsg(''), 3000);
  }

  if (loading) return null;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Link href="/members" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fd-muted)', textDecoration: 'none', marginBottom: 28 }}>
        <ArrowLeft size={14} /> Back to my account
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fd-navy)', margin: '0 0 4px', letterSpacing: '-.03em' }}>
        Edit profile
      </h1>
      <p style={{ fontSize: 13.5, color: 'var(--fd-muted)', margin: '0 0 28px' }}>{email}</p>

      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: '#15803d', marginBottom: 20 }}>
          <CheckCircle size={15} /> {msg}
        </div>
      )}
      {err && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: '#dc2626', marginBottom: 20 }}>
          {err}
        </div>
      )}

      <form onSubmit={handleSave} style={{ background: '#fff', border: '1.5px solid var(--fd-border)', borderRadius: 14, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fd-navy)' }}>Full name</label>
          <input
            type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Your name"
            style={{ padding: '10px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fd-navy)' }}>Email</label>
          <input
            type="email" value={email} disabled
            style={{ padding: '10px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
          />
          <span style={{ fontSize: 11.5, color: '#9ca3af' }}>Contact support to change your email.</span>
        </div>

        <div style={{ borderTop: '1px solid var(--fd-border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fd-navy)' }}>New password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(leave blank to keep current)</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="Min. 6 characters" minLength={6} autoComplete="new-password"
              style={{ width: '100%', padding: '10px 42px 10px 14px', border: '1.5px solid var(--fd-border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 20px', borderRadius: 8, border: 'none', background: 'var(--fd-navy)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
