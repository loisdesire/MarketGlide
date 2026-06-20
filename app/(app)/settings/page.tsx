'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';
import Topbar from '@/components/layout/Topbar';
import Modal from '@/components/ui/Modal';
import { ROLE_DESCRIPTIONS } from '@/lib/permissions';

interface Business    { name: string; email: string; address: string; }
interface TeamMember  { id: string; full_name: string; email: string; role: string; }

const ROLES = ['Administrator', 'Manager', 'Sales Staff', 'Warehouse Staff'] as const;

const BLANK_INVITE = { email: '', full_name: '', password: '', role: 'Sales Staff' as string };
const BLANK_EDIT   = { full_name: '', email: '', role: '' as string, password: '' };

export default function SettingsPage() {
  const { user } = useApp();
  const dialog   = useDialog();

  // Business profile
  const [biz, setBiz]           = useState<Business>({ name: '', email: '', address: '' });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [bizError, setBizError] = useState('');

  // User list
  const [users, setUsers]       = useState<TeamMember[]>([]);

  // Add user modal
  const [addModal, setAddModal]     = useState(false);
  const [invite, setInvite]         = useState(BLANK_INVITE);
  const [inviting, setInviting]     = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Edit user modal
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [edit, setEdit]             = useState(BLANK_EDIT);
  const [editing, setEditing]       = useState(false);
  const [editError, setEditError]   = useState('');

  async function loadBiz() {
    const res = await fetch('/api/settings');
    if (res.ok) setBiz(await res.json());
  }

  async function loadUsers() {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    loadBiz();
    loadUsers();
  }, []);

  // ── Business profile ────────────────────────────────────────
  async function saveBiz() {
    setSaving(true); setBizError(''); setSaved(false);
    const res = await fetch('/api/settings', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(biz),
    });
    if (!res.ok) { setBizError((await res.json()).error ?? 'Save failed.'); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Add user ────────────────────────────────────────────────
  async function sendInvite() {
    if (!invite.email)    { setInviteError('Email is required.'); return; }
    if (!invite.password) { setInviteError('Password is required.'); return; }
    setInviting(true); setInviteError('');
    const res = await fetch('/api/users/invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(invite),
    });
    if (!res.ok) { setInviteError((await res.json()).error ?? 'Failed.'); setInviting(false); return; }
    setAddModal(false);
    setInvite(BLANK_INVITE);
    setInviting(false);
    loadUsers();
  }

  // ── Edit user ───────────────────────────────────────────────
  function openEdit(u: TeamMember) {
    setEditTarget(u);
    setEdit({ full_name: u.full_name, email: u.email, role: u.role, password: '' });
    setEditError('');
  }

  async function saveEdit() {
    if (!editTarget) return;
    if (edit.password && edit.password.length < 6) {
      setEditError('Password must be at least 6 characters, or leave blank to keep current.');
      return;
    }
    setEditing(true); setEditError('');

    const payload: Record<string, string> = {
      full_name: edit.full_name,
      email:     edit.email,
      role:      edit.role,
    };
    if (edit.password) payload.password = edit.password;

    const res = await fetch(`/api/users/${editTarget.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) { setEditError((await res.json()).error ?? 'Update failed.'); setEditing(false); return; }
    setEditing(false);
    setEditTarget(null);
    loadUsers();
  }

  // ── Remove user ─────────────────────────────────────────────
  async function removeUser(u: TeamMember) {
    if (!await dialog.confirm(
      `Remove ${u.full_name || u.email} from the team? They will lose all access immediately.`,
      { title: 'Remove User', confirmLabel: 'Remove', variant: 'danger' },
    )) return;
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
    if (!res.ok) { await dialog.alert((await res.json()).error ?? 'Failed.', { title: 'Error' }); return; }
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

        {/* ── Business Profile ───────────────────────────────── */}
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

        {/* ── Team Management ────────────────────────────────── */}
        <div className="panel" style={{ maxWidth: 860 }}>
          <div className="panel-head">
            <h3>Team Management</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setInvite(BLANK_INVITE); setInviteError(''); setAddModal(true); }}>
              <Plus size={13} /> Add User
            </button>
          </div>
          <div className="panel-body flush scroll-x">
            {users.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isMe = u.id === user?.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <b>{u.full_name || <span className="muted">—</span>}</b>
                          {isMe && <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>(you)</span>}
                        </td>
                        <td className="muted" style={{ fontSize: 12.5 }}>{u.email}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: u.role === 'Administrator' ? 'var(--purple-light,#ede9fe)' : 'var(--grey-100)',
                            color: u.role === 'Administrator' ? 'var(--purple-dark)' : 'var(--grey-700)',
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {!isMe && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                className="btn btn-ghost btn-sm btn-icon"
                                onClick={() => openEdit(u)}
                                title="Edit user"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm btn-icon"
                                onClick={() => removeUser(u)}
                                title="Remove user"
                              >
                                <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <p className="muted">No team members yet.</p>}
          </div>
        </div>

        {/* ── Role Permissions Reference ─────────────────────── */}
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

      {/* ── Add User Modal ───────────────────────────────────── */}
      {addModal && (
        <Modal onClose={() => setAddModal(false)} title="Add Team Member">
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
            <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={sendInvite} disabled={inviting}>
              {inviting ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Edit User Modal ──────────────────────────────────── */}
      {editTarget && (
        <Modal onClose={() => setEditTarget(null)} title="Edit Team Member">
          {editError && <div className="alertbox" style={{ marginBottom: 12 }}><span>{editError}</span></div>}
          <div className="form-grid">
            <div className="field field-span2">
              <label>Full Name</label>
              <input
                value={edit.full_name}
                onChange={e => setEdit(v => ({ ...v, full_name: e.target.value }))}
                placeholder="Jane Smith"
                autoFocus
              />
            </div>
            <div className="field field-span2">
              <label>Email Address</label>
              <input
                type="email"
                value={edit.email}
                onChange={e => setEdit(v => ({ ...v, email: e.target.value }))}
              />
            </div>
            <div className="field field-span2">
              <label>Role</label>
              <select value={edit.role} onChange={e => setEdit(v => ({ ...v, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <span className="hint">{ROLE_DESCRIPTIONS[edit.role as keyof typeof ROLE_DESCRIPTIONS]}</span>
            </div>
            <div className="field field-span2">
              <label>New Password</label>
              <input
                type="password"
                value={edit.password}
                onChange={e => setEdit(v => ({ ...v, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
          <div className="formfoot">
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={editing}>
              {editing ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
