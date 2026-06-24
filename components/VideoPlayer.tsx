'use client';

import { PlayCircle } from 'lucide-react';

function getEmbed(url: string): { type: 'iframe' | 'video'; src: string } | null {
  if (!url?.trim()) return null;

  // Already an embed URL
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com') || url.includes('iframe.mediadelivery.net')) {
    return { type: 'iframe', src: url };
  }

  // YouTube watch or short URL
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?color=f97316&title=0&byline=0&portrait=0` };

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return { type: 'video', src: url };

  // Fallback: treat as iframe (Bunny.net stream, etc.)
  return { type: 'iframe', src: url };
}

export default function VideoPlayer({ url, title }: { url: string; title?: string }) {
  const embed = getEmbed(url);

  if (!embed) {
    return (
      <div style={{ aspectRatio: '16/9', background: '#0f172a', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'rgba(255,255,255,.3)' }}>
        <PlayCircle size={48} />
        <span style={{ fontSize: 13 }}>No video attached to this lesson</span>
      </div>
    );
  }

  if (embed.type === 'video') {
    return (
      <video
        src={embed.src}
        controls
        controlsList="nodownload"
        style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, background: '#000', display: 'block' }}
        title={title}
      />
    );
  }

  return (
    <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <iframe
        src={embed.src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
