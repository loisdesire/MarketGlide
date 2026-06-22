'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';

type Enquiry = {
  id: string; name: string; email: string; phone: string;
  service_type: string; message: string; status: string; created_at: string;
};

const STATUS_OPTIONS = ['new', 'contacted', 'closed'] as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [saving, setSaving]       = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/enquiries')
      .then(r => r.json())
      .then(d => { setEnquiries(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    }
    setSaving(null);
  }

  const newCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <>
      <div className="adm-topbar">
        <span className="adm-topbar-title">
          Service Enquiries
          {newCount > 0 && (
            <span style={{ marginLeft: 8, background: '#f97316', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 8px' }}>
              {newCount} new
            </span>
          )}
        </span>
      </div>

      <div className="adm-page">
        <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="adm-empty"><p>Loading...</p></div>
          ) : enquiries.length === 0 ? (
            <div className="adm-empty">
              <MessageSquare size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
              <p>No enquiries yet. They will appear here when someone submits the services form.</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(e => (
                    <>
                      <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                        <td>
                          <div className="adm-table-title">{e.name}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{e.email}</div>
                          {e.phone && <div style={{ fontSize: 12, color: '#9ca3af' }}>{e.phone}</div>}
                        </td>
                        <td style={{ color: '#6b7280' }}>{e.service_type || 'General'}</td>
                        <td><span className={`adm-badge adm-badge-${e.status}`}>{e.status}</span></td>
                        <td style={{ color: '#9ca3af', fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Clock size={12} />{fmtDate(e.created_at)}
                          </div>
                        </td>
                        <td>
                          <select
                            value={e.status}
                            disabled={saving === e.id}
                            onClick={ev => ev.stopPropagation()}
                            onChange={ev => updateStatus(e.id, ev.target.value)}
                            style={{ padding: '4px 8px', border: '1.5px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#fff' }}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                      {expanded === e.id && (
                        <tr key={`${e.id}-msg`}>
                          <td colSpan={5} style={{ background: '#f9fafb', padding: '12px 16px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Message</div>
                            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{e.message}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Click a row to expand the full message.</p>
      </div>
    </>
  );
}
