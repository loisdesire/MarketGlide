import type { Metadata } from 'next';
import '../marketing.css';

export const metadata: Metadata = {
  title: 'My Account | Flom Digital',
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh', background: 'var(--fd-bg-alt)' }}>
      {children}
    </div>
  );
}
