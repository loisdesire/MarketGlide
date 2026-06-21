import type { Metadata } from 'next';
import '../marketing.css';
import AnnouncementBar from '@/components/marketing/AnnouncementBar';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Flom Digital: Learn. Build. Automate. Profit.',
    template: '%s | Flom Digital',
  },
  description:
    'Business education, importation training, and productivity tools for serious business builders.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fd-page">
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
