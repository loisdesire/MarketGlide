import type { Metadata } from 'next';
import '../marketing.css';

export const metadata: Metadata = {
  title: 'Checkout | Flom Digital',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--fd-bg-alt)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {children}
    </div>
  );
}
