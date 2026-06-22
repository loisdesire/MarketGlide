'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  slug:       string;
  className?: string;
  label?:     string;
}

export default function BuyButton({ slug, className, label }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/stripe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug }),
      });
      const { url, error } = await res.json() as { url?: string; error?: string };
      if (url) {
        window.location.href = url;
      } else {
        alert(error ?? 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={className ?? 'fd-btn fd-btn-primary fd-btn-sm'}
      style={{ opacity: loading ? .7 : 1 }}
    >
      {loading ? (
        'Redirecting…'
      ) : (
        <>{label ?? 'Buy now'} <ArrowRight size={13} /></>
      )}
    </button>
  );
}
