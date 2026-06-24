'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

type Lesson = { id: string; title: string; description: string; video_url: string; duration_s: number; is_preview: boolean; sort_order: number };
type Module = { id: string; title: string; sort_order: number; course_lessons: Lesson[] };
type CourseData = { product: { id: string; title: string }; modules: Module[]; completedIds: string[] };

function fmtDuration(s: number) {
  if (!s) return '';
  const m = Math.floor(s / 60), sec = s % 60;
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
}

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data,        setData]        = useState<CourseData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [completed,   setCompleted]   = useState<Set<string>>(new Set());
  const [activeLessonId, setActive]   = useState<string | null>(searchParams.get('lesson'));
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());
  const [marking,     setMarking]     = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${slug}`)
      .then(r => r.json())
      .then((res: { data?: CourseData; error?: string }) => {
        if (res.error) { setError(res.error); return; }
        setData(res.data!);
        setCompleted(new Set(res.data!.completedIds));
        // Expand all modules and set first lesson active
        const allModuleIds = new Set(res.data!.modules.map(m => m.id));
        setExpanded(allModuleIds);
        if (!activeLessonId && res.data!.modules[0]?.course_lessons[0]) {
          setActive(res.data!.modules[0].course_lessons[0].id);
        }
      })
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const allLessons = data?.modules.flatMap(m => m.course_lessons) ?? [];
  const activeLesson = allLessons.find(l => l.id === activeLessonId) ?? null;
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter(l => completed.has(l.id)).length;

  function selectLesson(lessonId: string) {
    setActive(lessonId);
    router.replace(`/members/courses/${slug}?lesson=${lessonId}`, { scroll: false });
  }

  async function markComplete(lessonId: string, isComplete: boolean) {
    setMarking(true);
    setCompleted(prev => {
      const next = new Set(prev);
      isComplete ? next.add(lessonId) : next.delete(lessonId);
      return next;
    });
    await fetch('/api/courses/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, completed: isComplete }),
    });
    setMarking(false);
  }

  function nextLesson() {
    const idx = allLessons.findIndex(l => l.id === activeLessonId);
    if (idx < allLessons.length - 1) selectLesson(allLessons[idx + 1].id);
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 14, color: '#6b7280' }}>Loading…</div>;

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24 }}>
      <Lock size={40} color="#e5e7eb" />
      <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center' }}>{error === 'Not purchased.' ? "You don't have access to this course." : error}</p>
      <Link href="/members" style={{ fontSize: 14, color: 'var(--fd-orange)', fontWeight: 600, textDecoration: 'none' }}>← Back to my account</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ height: 52, background: 'var(--fd-navy)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <Link href="/members" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> My account
        </Link>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,.2)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data?.product.title}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', flexShrink: 0 }}>{completedCount}/{totalLessons} complete</span>
        {/* Progress bar */}
        <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 2, flexShrink: 0 }}>
          <div style={{ height: '100%', background: 'var(--fd-orange)', borderRadius: 2, width: totalLessons ? `${(completedCount / totalLessons) * 100}%` : '0%', transition: 'width .3s' }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--fd-border)', overflowY: 'auto', background: '#fff' }}>
          {data?.modules.map((mod, mi) => (
            <div key={mod.id}>
              <button
                onClick={() => setExpanded(s => { const n = new Set(s); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n; })}
                style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: 'none', borderBottom: '1px solid var(--fd-border)', cursor: 'pointer', textAlign: 'left' }}
              >
                {expanded.has(mod.id) ? <ChevronDown size={14} color="#9ca3af" /> : <ChevronRight size={14} color="#9ca3af" />}
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>MODULE {mi + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fd-navy)', flex: 1 }}>{mod.title}</span>
              </button>

              {expanded.has(mod.id) && mod.course_lessons.map((lesson, li) => {
                const isActive = lesson.id === activeLessonId;
                const isDone   = completed.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson.id)}
                    style={{
                      width: '100%', padding: '10px 16px 10px 28px', display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: isActive ? '#fff7ed' : '#fff', border: 'none', borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer', textAlign: 'left', borderLeft: isActive ? '3px solid var(--fd-orange)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {isDone
                        ? <CheckCircle2 size={14} color="#16a34a" />
                        : <Circle size={14} color={isActive ? 'var(--fd-orange)' : '#d1d5db'} />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, color: isActive ? 'var(--fd-orange)' : 'var(--fd-navy)', fontWeight: isActive ? 700 : 500, lineHeight: 1.4 }}>
                        {mi + 1}.{li + 1} {lesson.title}
                      </div>
                      {lesson.duration_s > 0 && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{fmtDuration(lesson.duration_s)}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: 900 }}>
          {activeLesson ? (
            <>
              <VideoPlayer url={activeLesson.video_url} title={activeLesson.title} />

              <div style={{ marginTop: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fd-navy)', margin: '0 0 8px', letterSpacing: '-.02em' }}>
                  {activeLesson.title}
                </h1>
                {activeLesson.description && (
                  <p style={{ fontSize: 14.5, color: 'var(--fd-muted)', lineHeight: 1.7, margin: '0 0 24px' }}>
                    {activeLesson.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {completed.has(activeLesson.id) ? (
                    <button onClick={() => markComplete(activeLesson.id, false)} disabled={marking}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      <CheckCircle2 size={15} /> Completed
                    </button>
                  ) : (
                    <button onClick={() => markComplete(activeLesson.id, true)} disabled={marking}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--fd-orange)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      <CheckCircle2 size={15} /> Mark as complete
                    </button>
                  )}
                  {allLessons.findIndex(l => l.id === activeLessonId) < allLessons.length - 1 && (
                    <button onClick={nextLesson}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: '1.5px solid var(--fd-border)', background: '#fff', color: 'var(--fd-navy)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Next lesson →
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--fd-muted)' }}>
              <p>Select a lesson from the sidebar to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
