'use client';

import { ArrowRight } from 'lucide-react';

export default function EmailForm() {
  return (
    <form
      style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
      onSubmit={e => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="your@email.com"
        required
        style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--fd-border)', fontSize: 14, outline: 'none' }}
      />
      <button type="submit" className="fd-btn fd-btn-primary" style={{ whiteSpace: 'nowrap' }}>
        Notify me <ArrowRight size={14} />
      </button>
    </form>
  );
}
