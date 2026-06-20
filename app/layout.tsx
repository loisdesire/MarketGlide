import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Market Glide Solutions — Sales & Inventory Tracker',
  description: 'Multi-user sales and inventory management for Market Glide Solutions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
