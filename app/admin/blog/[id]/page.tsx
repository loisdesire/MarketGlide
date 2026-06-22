'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Trash2 } from 'lucide-react';
import FileUpload from '@/app/admin/FileUpload';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'importation',       label: 'Importation' },
  { value: 'entrepreneurship',  label: 'Entrepreneurship' },
  { value: 'business-ideas',    label: 'Business Ideas' },
  { value: 'ai-automation',     label: 'AI & Automation' },
  { value: 'marketing',         label: 'Marketing' },
  { value: 'sales',             label: 'Sales' },
  { value: 'financial-literacy',label: 'Financial Literacy' },
  { value: 'wealth-building',   label: 'Wealth Building' },
  { value: 'productivity',      label: 'Productivity' },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type Post = {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover_url: string; category: string; tags: string[]; read_time_min: number;
  status: string; published_at: string | null;
};

type FormState = Omit<Partial<Post>, 'tags'> & { tags: string };

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [post, setPost]     = useState<Post | null>(null);
  const [form, setForm]     = useState<FormState>({ tags: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then(r => r.json())
      .then((data: Post) => {
        setPost(data);
        const { tags: rawTags, ...rest } = data;
        setForm({ ...rest, tags: Array.isArray(rawTags) ? rawTags.join(', ') : '' });
      });
  }, [id]);

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function save(overrideStatus?: string) {
    setSaving(true); setError(''); setSuccess('');
    const tags = typeof form.tags === 'string'
      ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : form.tags;

    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        slug: slugify(form.slug ?? ''),
        tags,
        status: overrideStatus ?? form.status,
      }),
    });

    if (res.ok) {
      const data = await res.json() as Post;
      setPost(data);
      const { tags: rawTags2, ...rest2 } = data;
      setForm({ ...rest2, tags: Array.isArray(rawTags2) ? rawTags2.join(', ') : '' });
      setSuccess('Saved.');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      const d = await res.json().catch(() => ({}));
      setError((d as { error?: string }).error ?? 'Failed to save.');
    }
    setSaving(false);
  }

  async function deletePost() {
    if (!confirm('Delete this post permanently? This cannot be undone.')) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/blog');
    else setError('Failed to delete.');
    setDeleting(false);
  }

  if (!post) return (
    <>
      <div className="adm-topbar"><span className="adm-topbar-title">Loading...</span></div>
      <div className="adm-page"><div className="adm-empty"><p>Loading post...</p></div></div>
    </>
  );

  const isPublished = form.status === 'published';

  return (
    <>
      <div className="adm-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/blog" className="adm-btn adm-btn-ghost adm-btn-sm">
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="adm-topbar-title">Edit Post</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isPublished ? (
            <button className="adm-btn adm-btn-unpublish" disabled={saving} onClick={() => save('draft')}>
              <EyeOff size={14} /> Unpublish
            </button>
          ) : (
            <button className="adm-btn adm-btn-publish" disabled={saving} onClick={() => save('published')}>
              <Eye size={14} /> Publish
            </button>
          )}
          <button className="adm-btn adm-btn-outline" disabled={saving} onClick={() => save()}>
            <Save size={14} /> Save
          </button>
          <button className="adm-btn adm-btn-danger" disabled={deleting} onClick={deletePost}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="adm-page">
        {error   && <div className="adm-alert adm-alert-error">{error}</div>}
        {success && <div className="adm-alert adm-alert-success">{success}</div>}

        <div className="adm-form-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="adm-field">
              <label>Title</label>
              <input type="text" value={form.title ?? ''} onChange={e => set('title', e.target.value)} />
            </div>

            <div className="adm-field">
              <label>Slug</label>
              <input type="text" value={form.slug ?? ''} onChange={e => set('slug', slugify(e.target.value))} />
              <div className="adm-field-hint">URL: /blog/{form.slug ?? ''}</div>
            </div>

            <div className="adm-field">
              <label>Excerpt</label>
              <textarea rows={2} value={form.excerpt ?? ''} onChange={e => set('excerpt', e.target.value)} />
            </div>

            <div className="adm-field">
              <label>Content (Markdown)</label>
              <div className="adm-editor-toolbar">
                {['**bold**', '*italic*', '## Heading', '> Quote', '- List item', '```code```'].map(snippet => (
                  <button key={snippet} className="adm-btn adm-btn-outline adm-btn-sm" type="button"
                    onClick={() => set('content', (form.content ?? '') + snippet)}>
                    {snippet}
                  </button>
                ))}
              </div>
              <textarea
                className="adm-editor-content"
                value={form.content ?? ''}
                onChange={e => set('content', e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="adm-card">
              <div className="adm-card-title">Post settings</div>

              <div className="adm-field">
                <label>Status</label>
                <span className={`adm-badge adm-badge-${form.status}`}>{form.status}</span>
                {post.published_at && (
                  <div className="adm-field-hint" style={{ marginTop: 6 }}>
                    Published {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              <div className="adm-field">
                <label>Category</label>
                <select value={form.category ?? 'importation'} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="adm-field">
                <label>Tags</label>
                <input type="text" placeholder="importation, china, tips"
                  value={form.tags ?? ''} onChange={e => set('tags', e.target.value)} />
                <div className="adm-field-hint">Comma-separated</div>
              </div>

              <div className="adm-field">
                <label>Read time (min)</label>
                <input type="number" min={1} value={form.read_time_min ?? 5}
                  onChange={e => set('read_time_min', parseInt(e.target.value, 10) || 1)} />
              </div>

              <FileUpload
                label="Cover image"
                type="image"
                folder="blog"
                currentUrl={form.cover_url ?? ''}
                onUpload={url => set('cover_url', url)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
