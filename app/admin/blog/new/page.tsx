'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import FileUpload from '@/app/admin/FileUpload';

const CATEGORIES = [
  { value: 'importation',        label: 'Importation' },
  { value: 'entrepreneurship',   label: 'Entrepreneurship' },
  { value: 'business-ideas',     label: 'Business Ideas' },
  { value: 'ai-automation',      label: 'AI & Automation' },
  { value: 'marketing',          label: 'Marketing' },
  { value: 'sales',              label: 'Sales' },
  { value: 'financial-literacy', label: 'Financial Literacy' },
  { value: 'wealth-building',    label: 'Wealth Building' },
  { value: 'productivity',       label: 'Productivity' },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    cover_url: '', category: 'business', tags: '',
    read_time_min: 5, status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function set(field: string, value: string | number) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !prev.slug) next.slug = slugify(value as string);
      return next;
    });
  }

  async function submit(status: 'draft' | 'published') {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.slug.trim())  { setError('Slug is required.'); return; }
    setSaving(true); setError('');

    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        slug: slugify(form.slug),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/blog/${data.id}`);
    } else {
      const d = await res.json().catch(() => ({}));
      setError((d as { error?: string }).error ?? 'Failed to save post.');
    }
    setSaving(false);
  }

  return (
    <>
      <div className="adm-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/blog" className="adm-btn adm-btn-ghost adm-btn-sm">
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="adm-topbar-title">New Post</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn adm-btn-outline" disabled={saving} onClick={() => submit('draft')}>
            <Save size={14} /> Save draft
          </button>
          <button className="adm-btn adm-btn-primary" disabled={saving} onClick={() => submit('published')}>
            <Eye size={14} /> Publish
          </button>
        </div>
      </div>

      <div className="adm-page">
        {error && <div className="adm-alert adm-alert-error">{error}</div>}

        <div className="adm-form-grid">
          {/* Main editor */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="adm-field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. How I Imported My First Product for Under $500"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
            </div>

            <div className="adm-field">
              <label>Slug</label>
              <input
                type="text"
                placeholder="how-i-imported-my-first-product"
                value={form.slug}
                onChange={e => set('slug', slugify(e.target.value))}
              />
              <div className="adm-field-hint">Auto-filled from title. URL: /blog/{form.slug || 'your-slug'}</div>
            </div>

            <div className="adm-field">
              <label>Excerpt</label>
              <textarea
                rows={2}
                placeholder="A short summary shown in the blog listing (1–2 sentences)"
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
              />
            </div>

            <div className="adm-field">
              <label>Content (Markdown)</label>
              <div className="adm-editor-toolbar">
                {['**bold**', '*italic*', '## Heading', '> Quote', '- List item', '```code```'].map(snippet => (
                  <button
                    key={snippet}
                    className="adm-btn adm-btn-outline adm-btn-sm"
                    onClick={() => set('content', form.content + snippet)}
                    type="button"
                  >
                    {snippet}
                  </button>
                ))}
              </div>
              <textarea
                className="adm-editor-content"
                placeholder="Write your post in Markdown..."
                value={form.content}
                onChange={e => set('content', e.target.value)}
              />
              <div className="adm-editor-hint">
                Supports Markdown: **bold**, *italic*, ## headings, - lists, [link](url), ![alt](image-url)
              </div>
            </div>
          </div>

          {/* Sidebar meta */}
          <div>
            <div className="adm-card">
              <div className="adm-card-title">Post settings</div>

              <div className="adm-field">
                <label>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="adm-field">
                <label>Tags</label>
                <input
                  type="text"
                  placeholder="importation, china, tips"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                />
                <div className="adm-field-hint">Comma-separated</div>
              </div>

              <div className="adm-field">
                <label>Read time (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={form.read_time_min}
                  onChange={e => set('read_time_min', parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <FileUpload
                label="Cover image"
                type="image"
                folder="blog"
                currentUrl={form.cover_url}
                onUpload={url => set('cover_url', url)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
