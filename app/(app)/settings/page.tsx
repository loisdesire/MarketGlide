'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import Modal from '@/components/ui/Modal';
import { ROLE_DESCRIPTIONS } from '@/lib/permissions';

interface Business    { name: string; email: string; address: string; }
interface UserProfile { id: string; full_name: string; role: string; }

const ROLES = ['Administrator', 'Manager', 'Sales Staff', 'Warehouse Staff'] as const;

const BLANK_INVITE = { email: '', full_name: '', password: '', role: 'Sales Staff' as string };

export default function SettingsPage() {
  const { user } = useApp();
  const dialog   = useDialog();

  const [biz, setBiz]         = useState<Business>({ name: '', email: '', address: '' });
  const [users, setUsers]     = useState<UserProfile[]>([]);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [bizError, setBizError] = useState('');

  const [inviteModal, setInviteModal] = useState(false);
  const [invite, setInvite]     = useState(BLANK_INVITE);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  async function loadUsers() {
    const supabase = createClient();
    const { data } = await supabase.from('user_profiles').select('id,full_name,role').order('full_name');
    setUsers((data ?? []) as UserProfile[]);
  }

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('business_settings').select('name,email,address').eq('id', 1).single(),
    ]).then(([b]) => {
      if (b.data) setBiz(b.data as Business);
    });
    loadUsers();
  }, []);

  async function saveBiz() {
    setSaving(true); setBizError(''); setSaved(false);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(biz),
    });
    if (!res.ok) { setBizError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
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
    loadUsers();
  }

  async function removeUser(u: UserProfile) {
    if (!await dialog.confirm(
      `Remove ${u.full_name || u.role} from the team? They will lose all access immediately.`,
      { title: 'Remove User', confirmLabel: 'Remove', variant: 'danger' },
    )) return;
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
    if (!res.ok) { await dialog.alert((await res.json()).error ?? 'Failed.', { title: 'Error' }); return; }
    loadUsers();
  }

  async function sendInvite() {
    if (!invite.email) { setInviteError('Email is required.'); return; }
    setInviting(true); setInviteError('');
    const res = await fetch('/api/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invite),
    });
    if (!res.ok) { setInviteError((await res.json()).error ?? 'Invite failed.'); setInviting(false); return; }
    setInviteModal(false);
    setInvite(BLANK_INVITE);
    setInviting(false);
    loadUsers();
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

        {/* Business Profile */}
        <div className="panel" style={{ maxWidth: 560 }}>
          <div className="panel-head"><h3>Business Profile</h3></div>
          <div className="panel-body">
            <p className="footnote" style={{ marginTop: 0, marginBottom: 16 }}>
              This information appears on every invoice and receipt you generate.
            </p>
            {bizError && <div className="alertbox" style={{ marginBottom: 12 }}><span>{bizError}</span></div>}
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

        {/* Team Members */}
        <div className="panel" style={{ maxWidth: 760 }}>
          <div className="panel-head">
            <h3>Team Members</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setInvite(BLANK_INVITE); setInviteError(''); setInviteModal(true); }}>
              <Plus size={13} /> Add User
            </button>
          </div>
          <div className="panel-body flush scroll-x">
            {users.length ? (
              <table>
                <thead>
                  <tr><th>Name</th><th>Role</th><th>Change Role</th><th></th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><b>{u.full_name || <span className="muted">No name yet</span>}</b></td>
                      <td>{u.role}</td>
                      <td>
                        {u.id !== user?.id ? (
                          <select
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            {ROLES.map(r => <option key={r}>{r}</option>)}
                          </select>
                        ) : (
                          <span className="muted" style={{ fontSize: 12 }}>(you)</span>
                        )}
                      </td>
                      <td>
                        {u.id !== user?.id && (
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => removeUser(u)}
                            title="Remove user"
                          >
                            <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">No team members yet. Invite someone to get started.</p>}
          </div>
        </div>

        {/* Role Permissions Reference */}
        <div className="panel" style={{ maxWidth: 760 }}>
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

      {/* Invite User Modal */}
      {inviteModal && (
        <Modal onClose={() => setInviteModal(false)} title="Add Team Member">
          <p className="footnote" style={{ marginTop: 0, marginBottom: 16 }}>
            Create the account and share the credentials with the user directly.
          </p>
          {inviteError && <div className="alertbox" style={{ marginBottom: 12 }}><span>{inviteError}</span></div>}
          <div className="form-grid">
            <div className="field field-span2">
              <label>Full Name</label>
              <input
                placeholder="Jane Smith"
                value={invite.full_name}
                onChange={e => setInvite(i => ({ ...i, full_name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="field field-span2">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="colleague@example.com"
                value={invite.email}
                onChange={e => setInvite(i => ({ ...i, email: e.target.value }))}
              />
            </div>
            <div className="field field-span2">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={invite.password}
                onChange={e => setInvite(i => ({ ...i, password: e.target.value }))}
              />
            </div>
            <div className="field field-span2">
              <label>Role</label>
              <select value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <span className="hint">{ROLE_DESCRIPTIONS[invite.role as keyof typeof ROLE_DESCRIPTIONS]}</span>
            </div>
          </div>
          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setInviteModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={sendInvite} disabled={inviting}>
              {inviting ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
