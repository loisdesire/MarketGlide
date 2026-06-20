'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import { ROLE_DESCRIPTIONS } from '@/lib/permissions';

interface Business { name: string; email: string; address: string; }
interface UserProfile { id: string; full_name: string; role: string; email?: string; }

export default function SettingsPage() {
  const { user } = useApp();
  const dialog   = useDialog();
  const [biz, setBiz]         = useState<Business>({ name: '', email: '', address: '' });
  const [users, setUsers]     = useState<UserProfile[]>([]);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('business_settings').select('name,email,address').eq('id', 1).single(),
      supabase.from('user_profiles').select('id,full_name,role').order('full_name'),
    ]).then(([b, u]) => {
      if (b.data) setBiz(b.data as Business);
      setUsers((u.data ?? []) as UserProfile[]);
    });
  }, []);

  async function saveBiz() {
    setSaving(true); setError(''); setSaved(false);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(biz),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changeRole(userId: string, newRole: string) {
    if (!await dialog.confirm(`Change this user's role to "${newRole}"?`, { title: 'Change Role', confirmLabel: 'Change Role' })) return;
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) { await dialog.alert((await res.json()).error ?? 'Failed.', { title: 'Error' }); return; }
    const supabase = createClient();
    const { data } = await supabase.from('user_profiles').select('id,full_name,role').order('full_name');
    setUsers((data ?? []) as UserProfile[]);
  }

  if (user?.role !== 'Administrator') {
    return (
      <div>
        <Topbar page="settings" />
        <div className="page-content">
          <div className="alertbox"><span>Only Administrators can access Business Settings.</span></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar page="settings" />
      <div className="page-content">
        <div className="panel" style={{ maxWidth: 560 }}>
          <div className="panel-head"><h3>Business Profile</h3></div>
          <div className="panel-body">
            <p className="footnote" style={{ marginTop: 0, marginBottom: 16 }}>
              This information appears on every invoice and receipt you generate.
            </p>
            {error && <div className="alertbox" style={{ marginBottom: 12 }}><span>{error}</span></div>}
            <div className="form-grid">
              <div className="field field-span2">
                <label>Business Name</label>
                <input value={biz.name} onChange={e => setBiz(b => ({ ...b, name: e.target.value }))} />
              </div>
              <div className="field field-span2">
                <label>Email</label>
                <input type="email" value={biz.email} onChange={e => setBiz(b => ({ ...b, email: e.target.value }))} />
              </div>
              <div className="field field-span2">
                <label>Address</label>
                <input value={biz.address} onChange={e => setBiz(b => ({ ...b, address: e.target.value }))} />
              </div>
            </div>
            <div className="formfoot" style={{ justifyContent: 'flex-start' }}>
              <button className="btn btn-primary" onClick={saveBiz} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {saved && <span className="footnote" style={{ margin: '0 0 0 4px', color: 'var(--success)', fontStyle: 'normal', fontWeight: 600 }}>Saved ✓</span>}
            </div>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 700 }}>
          <div className="panel-head">
            <h3>Team Members</h3>
            <span className="muted" style={{ fontSize: 12 }}>Add users via Supabase Auth → invite user</span>
          </div>
          <div className="panel-body flush scroll-x">
            {users.length ? (
              <table>
                <thead><tr><th>Name</th><th>Role</th><th>Change Role</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><b>{u.full_name || '—'}</b></td>
                      <td>{u.role}</td>
                      <td>
                        {u.id !== user?.id ? (
                          <select
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            {Object.keys(ROLE_DESCRIPTIONS).map(r => <option key={r}>{r}</option>)}
                          </select>
                        ) : <span className="muted" style={{ fontSize: 12 }}>(you)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">No users found.</p>}
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 700 }}>
          <div className="panel-head"><h3>Role Permissions Reference</h3></div>
          <div className="panel-body flush scroll-x">
            <table>
              <thead><tr><th>Role</th><th>Access</th></tr></thead>
              <tbody>
                {(Object.entries(ROLE_DESCRIPTIONS) as [string, string][]).map(([role, desc]) => (
                  <tr key={role}><td><b>{role}</b></td><td className="muted">{desc}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
