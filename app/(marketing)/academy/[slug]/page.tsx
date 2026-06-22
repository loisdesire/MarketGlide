import type { Metadata } from 'next';
import type { ElementType } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, BookOpen, Video, FileText, Package, ArrowRight } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductCTA from '@/components/ProductCTA';

type Props = { params: Promise<{ slug: string }> };

const TYPE_META: Record<string, { badge: string; color: string; includes: string[]; Icon: ElementType }> = {
  course: {
    badge:    'Course',
    color:    '#3B82F6',
    Icon:     Video,
    includes: ['Full video lesson library', 'Lifetime access', 'Downloadable resources', 'Community support'],
  },
  guide: {
    badge:    'eBook / Guide',
    color:    'var(--fd-orange)',
    Icon:     BookOpen,
    includes: ['Instant digital download', 'Lifetime access', 'Printer-friendly format', 'Practical frameworks'],
  },
  template: {
    badge:    'Template',
    color:    '#8B5CF6',
    Icon:     FileText,
    includes: ['Instant download', 'Fully editable', 'Step-by-step instructions', 'Lifetime updates'],
  },
  bundle: {
    badge:    'Bundle',
    color:    '#16A34A',
    Icon:     Package,
    includes: ['Multiple resources', 'Instant access', 'Lifetime updates', 'Best value'],
  },
  tool_access: {
    badge:    'Tool Access',
    color:    '#0EA5E9',
    Icon:     ArrowRight,
    includes: ['Immediate access', 'Regular updates', 'Email support', 'No subscription'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from('platform_products').select('title, description').eq('slug', slug).maybeSingle();
  if (!data) return { title: 'Product | Flom Digital' };
  return {
    title:       `${data.title} | Flom Digital`,
    description: data.description?.slice(0, 160) ?? '',
  };
}

export default async function ProductSqueezePage({ params }: Props) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from('platform_products')
    .select('id, slug, title, description, type, category, price_usd, cover_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) notFound();

  const meta     = TYPE_META[product.type] ?? TYPE_META.guide;
  const { Icon } = meta;

  // Split description into lines — admin writes each benefit on its own line
  const lines = (product.description ?? '').split('\n').map((l: string) => l.trim()).filter(Boolean);
  const [intro, ...benefits] = lines;

  const ctaLabel = product.type === 'course' ? 'Enroll Now' : product.type === 'guide' ? 'Get the Guide' : 'Get Access';

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '72px 0 60px' }}>
        <div className="fd-container">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Link href="/academy" style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>Academy</Link>
            <span style={{ color: 'rgba(255,255,255,.25)' }}>/</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>{meta.badge}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            {/* Left: copy */}
            <div>
              <span style={{ display: 'inline-block', background: meta.color, color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', borderRadius: 6, padding: '3px 10px', marginBottom: 18 }}>
                {meta.badge}
              </span>
              <h1 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-.03em', margin: '0 0 18px', lineHeight: 1.15 }}>
                {product.title}
              </h1>
              {intro && (
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,.72)', lineHeight: 1.75, margin: '0 0 28px' }}>
                  {intro}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 38, fontWeight: 900 }}>${product.price_usd}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
                  {product.type === 'course' ? 'One-time payment · Lifetime access' : 'Instant download · Lifetime access'}
                </span>
              </div>
              <ProductCTA slug={product.slug} label={ctaLabel} />
            </div>

            {/* Right: what's included card */}
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: '28px 26px' }}>
              {product.cover_url ? (
                <img
                  src={product.cover_url}
                  alt={product.title}
                  style={{ width: '100%', borderRadius: 10, marginBottom: 22, objectFit: 'cover', maxHeight: 180, display: 'block' }}
                />
              ) : null}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 16px' }}>
                This {meta.badge.toLowerCase()} includes
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {meta.includes.map((item: string) => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,107,0,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="var(--fd-orange)" />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,.8)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      {benefits.length > 0 && (
        <section className="fd-section">
          <div className="fd-container" style={{ maxWidth: 760 }}>
            <div className="fd-section-label">What&apos;s inside</div>
            <h2 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 28 }}>
              What you will {product.type === 'course' ? 'learn' : 'get'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {benefits.map((b: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle size={16} color="var(--fd-orange)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 14, color: 'var(--fd-muted)', lineHeight: 1.65 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section style={{ background: 'var(--fd-navy)', padding: '64px 0' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-.03em', margin: '0 0 14px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', margin: '0 0 28px' }}>
            ${product.price_usd} · One-time payment · Lifetime access
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <ProductCTA slug={product.slug} label={ctaLabel} />
            <Link href="/academy" className="fd-btn fd-btn-outline-white">
              Browse all products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
