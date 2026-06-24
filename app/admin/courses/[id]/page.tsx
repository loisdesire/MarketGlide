'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, Edit2, Check, X, Video, Eye } from 'lucide-react';

type Lesson = {
  id: string; title: string; description: string; video_url: string;
  duration_s: number; is_preview: boolean; sort_order: number;
};
type Module = { id: string; title: string; sort_order: number; course_lessons: Lesson[] };

const BASE = (productId: string) => `/api/admin/courses/${productId}`;

export default function CourseBuilderPage() {
  const { id: productId } = useParams<{ id: string }>();

  const [modules,   setModules]   = useState<Module[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [msg,       setMsg]       = useState('');

  // New module form
  const [newModTitle,    setNewModTitle]    = useState('');
  const [addingModule,   setAddingModule]   = useState(false);

  // Edit module inline
  const [editingModId,   setEditingModId]   = useState<string | null>(null);
  const [editingModText, setEditingModText] = useState('');

  // New lesson form (per module)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', video_url: '', description: '', is_preview: false, sort_order: 0 });

  // Edit lesson
  const [editingLessonId,   setEditingLessonId]   = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({});

  async function load() {
    setLoading(true);
    const res = await fetch(BASE(productId));
    const data = await res.json() as { data: Module[] };
    setModules(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [productId]);

  function flash(text: string) { setMsg(text); setTimeout(() => setMsg(''), 3000); }
  function toggle(id: string) { setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function addModule() {
    if (!newModTitle.trim()) return;
    const res = await fetch(BASE(productId), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newModTitle.trim(), sort_order: modules.length }),
    });
    if (res.ok) { setNewModTitle(''); setAddingModule(false); load(); flash('Module added.'); }
  }

  async function saveModuleTitle(moduleId: string) {
    if (!editingModText.trim()) return;
    await fetch(`${BASE(productId)}/modules/${moduleId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingModText.trim() }),
    });
    setEditingModId(null);
    load();
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Delete this module and all its lessons?')) return;
    await fetch(`${BASE(productId)}/modules/${moduleId}`, { method: 'DELETE' });
    load(); flash('Module deleted.');
  }

  async function addLesson(moduleId: string) {
    if (!newLesson.title.trim()) return;
    const res = await fetch(`${BASE(productId)}/lessons`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLesson, module_id: moduleId }),
    });
    if (res.ok) {
      setAddingLessonTo(null);
      setNewLesson({ title: '', video_url: '', description: '', is_preview: false, sort_order: 0 });
      load(); flash('Lesson added.');
    }
  }

  async function saveLesson(lessonId: string) {
    await fetch(`${BASE(productId)}/lessons/${lessonId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingLesson),
    });
    setEditingLessonId(null);
    load(); flash('Lesson updated.');
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return;
    await fetch(`${BASE(productId)}/lessons/${lessonId}`, { method: 'DELETE' });
    load(); flash('Lesson deleted.');
  }

  return (
    <>
      <div className="adm-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/admin/products" className="adm-btn adm-btn-ghost adm-btn-sm"><ArrowLeft size={14} /></Link>
          <span className="adm-topbar-title">Course Content</span>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => setAddingModule(true)}>
          <Plus size={14} /> Add module
        </button>
      </div>

      <div className="adm-page">
        {msg && <div className="adm-alert adm-alert-success">{msg}</div>}

        {loading ? (
          <div className="adm-empty"><p>Loading…</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {modules.map((mod, mi) => (
              <div key={mod.id} className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Module header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#f9fafb', borderBottom: expanded.has(mod.id) ? '1px solid var(--adm-border)' : 'none' }}>
                  <button onClick={() => toggle(mod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280', padding: 0 }}>
                    {expanded.has(mod.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', minWidth: 24 }}>M{mi + 1}</span>

                  {editingModId === mod.id ? (
                    <>
                      <input
                        autoFocus value={editingModText}
                        onChange={e => setEditingModText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveModuleTitle(mod.id); if (e.key === 'Escape') setEditingModId(null); }}
                        style={{ flex: 1, padding: '5px 10px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 14 }}
                      />
                      <button onClick={() => saveModuleTitle(mod.id)} className="adm-btn adm-btn-primary adm-btn-sm"><Check size={13} /></button>
                      <button onClick={() => setEditingModId(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X size={13} /></button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5, color: 'var(--adm-text)' }}>{mod.title}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{mod.course_lessons.length} lesson{mod.course_lessons.length !== 1 ? 's' : ''}</span>
                      <button onClick={() => { setEditingModId(mod.id); setEditingModText(mod.title); }} className="adm-btn adm-btn-ghost adm-btn-sm"><Edit2 size={13} /></button>
                      <button onClick={() => deleteModule(mod.id)} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                    </>
                  )}
                </div>

                {/* Lessons */}
                {expanded.has(mod.id) && (
                  <div>
                    {mod.course_lessons.map((lesson, li) => (
                      <div key={lesson.id} style={{ borderBottom: '1px solid var(--adm-border)' }}>
                        {editingLessonId === lesson.id ? (
                          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input placeholder="Lesson title" value={editingLesson.title ?? ''} onChange={e => setEditingLesson(l => ({ ...l, title: e.target.value }))}
                              style={{ padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                            <input placeholder="Video URL (YouTube, Vimeo, or direct link)" value={editingLesson.video_url ?? ''} onChange={e => setEditingLesson(l => ({ ...l, video_url: e.target.value }))}
                              style={{ padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                            <textarea placeholder="Description (optional)" value={editingLesson.description ?? ''} onChange={e => setEditingLesson(l => ({ ...l, description: e.target.value }))} rows={2}
                              style={{ padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13, resize: 'vertical' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                                <input type="checkbox" checked={editingLesson.is_preview ?? false} onChange={e => setEditingLesson(l => ({ ...l, is_preview: e.target.checked }))} />
                                Free preview
                              </label>
                              <input type="number" placeholder="Sort #" min={0} value={editingLesson.sort_order ?? 0} onChange={e => setEditingLesson(l => ({ ...l, sort_order: Number(e.target.value) }))}
                                style={{ width: 72, padding: '6px 10px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => saveLesson(lesson.id)} className="adm-btn adm-btn-primary adm-btn-sm">Save</button>
                              <button onClick={() => setEditingLessonId(null)} className="adm-btn adm-btn-ghost adm-btn-sm">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '12px 18px 12px 52px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 28 }}>{mi + 1}.{li + 1}</span>
                            <Video size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 13.5, color: 'var(--adm-text)' }}>{lesson.title}</span>
                            {lesson.is_preview && <span style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', borderRadius: 4, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> Preview</span>}
                            {!lesson.video_url && <span style={{ fontSize: 11, color: '#f97316' }}>No video</span>}
                            <button onClick={() => { setEditingLessonId(lesson.id); setEditingLesson({ ...lesson }); }} className="adm-btn adm-btn-ghost adm-btn-sm"><Edit2 size={13} /></button>
                            <button onClick={() => deleteLesson(lesson.id)} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add lesson form */}
                    {addingLessonTo === mod.id ? (
                      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fafafa' }}>
                        <input autoFocus placeholder="Lesson title" value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))}
                          style={{ padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                        <input placeholder="Video URL (YouTube, Vimeo, or direct link)" value={newLesson.video_url} onChange={e => setNewLesson(l => ({ ...l, video_url: e.target.value }))}
                          style={{ padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                        <textarea placeholder="Description (optional)" value={newLesson.description} onChange={e => setNewLesson(l => ({ ...l, description: e.target.value }))} rows={2}
                          style={{ padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13, resize: 'vertical' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={newLesson.is_preview} onChange={e => setNewLesson(l => ({ ...l, is_preview: e.target.checked }))} />
                            Free preview
                          </label>
                          <input type="number" placeholder="Sort #" min={0} value={newLesson.sort_order} onChange={e => setNewLesson(l => ({ ...l, sort_order: Number(e.target.value) }))}
                            style={{ width: 72, padding: '6px 10px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => addLesson(mod.id)} className="adm-btn adm-btn-primary adm-btn-sm">Add lesson</button>
                          <button onClick={() => setAddingLessonTo(null)} className="adm-btn adm-btn-ghost adm-btn-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 18px' }}>
                        <button onClick={() => { setAddingLessonTo(mod.id); setExpanded(s => new Set([...s, mod.id])); }} className="adm-btn adm-btn-ghost adm-btn-sm">
                          <Plus size={13} /> Add lesson
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add module form */}
            {addingModule ? (
              <div className="adm-card" style={{ padding: '14px 18px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input autoFocus placeholder="Module title (e.g. Getting Started)" value={newModTitle} onChange={e => setNewModTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addModule(); if (e.key === 'Escape') setAddingModule(false); }}
                  style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--adm-border)', borderRadius: 6, fontSize: 13 }} />
                <button onClick={addModule} className="adm-btn adm-btn-primary adm-btn-sm">Add</button>
                <button onClick={() => setAddingModule(false)} className="adm-btn adm-btn-ghost adm-btn-sm">Cancel</button>
              </div>
            ) : (
              modules.length === 0 && (
                <div className="adm-empty">
                  <p>No modules yet. Click <strong>Add module</strong> to build your curriculum.</p>
                </div>
              )
            )}

          </div>
        )}
      </div>
    </>
  );
}
