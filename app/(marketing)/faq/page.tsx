import type { Metadata } from 'next';
import FAQAccordion from '@/components/marketing/FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about Flom Digital products, courses, importation, shipping, refunds, and business tools.',
};

const FAQS = [
  // Digital Products
  { question: 'How do I access my purchased course or guide after buying?',
    answer: 'After your payment is confirmed, you will receive an email with your access details. You can also log in to the Members area on this site to find all your purchases in one place.' },
  { question: 'Are the digital products available immediately after purchase?',
    answer: 'Yes. Digital downloads (guides, templates) are available immediately after payment. Course access is also granted instantly.' },
  { question: 'Can I get a refund if I change my mind?',
    answer: 'We offer refunds within 7 days of purchase if you have not accessed more than 20% of the course or downloaded the guide. Contact us at info@flomtechnology.com with your order details.' },
  { question: 'Do I get lifetime access to courses I purchase?',
    answer: 'Yes. All course and guide purchases include lifetime access, including any future updates made to that product.' },

  // Importation
  { question: 'Is mini importation still profitable in Nigeria?',
    answer: 'Yes. Mini importation remains one of the most accessible ways to build a product-based business in Nigeria. The key is knowing how to source correctly, calculate real landed costs, and price for profit. That is exactly what our courses cover.' },
  { question: 'Where can I source products for importation?',
    answer: 'The most common sourcing platforms are Alibaba, 1688, Taobao, and DHgate for China-based suppliers. Our Mini Importation Mastery Course covers how to evaluate and negotiate with suppliers on each of these platforms.' },
  { question: 'What is the minimum capital needed to start importation?',
    answer: 'You can start mini importation with as little as $100-$200 depending on the product category. The key is starting small, learning the process, and scaling once you understand your costs and margins.' },

  // Shipping
  { question: 'How do I calculate my landed cost?',
    answer: 'Your landed cost includes product cost, international shipping, customs duties, port charges, and local delivery. Use our free Landed Cost Calculator under Business Tools to estimate this before placing any order.' },
  { question: 'How long does shipping from China take to Nigeria?',
    answer: 'Air freight typically takes 7-14 days. Sea freight takes 4-8 weeks depending on the route and port conditions. Air is more expensive but faster; sea is cheaper but requires more planning.' },

  // Business Tools
  { question: 'Is the Sales and Inventory Tracker a subscription?',
    answer: 'The Tracker is a paid tool. Pricing details and access instructions are available on the Business Tools page.' },
  { question: 'Can multiple team members use the same tracker account?',
    answer: 'Yes. The tracker supports multiple user roles: Administrator, Manager, Sales Staff, and Warehouse Staff. You can invite your team from the Settings section after registering.' },
  { question: 'Are the business tools accessible on mobile?',
    answer: 'Yes. All tools including the tracker, invoice generator, and calculators are fully responsive and work on phones and tablets.' },

  // Services
  { question: 'How do I book a consulting session?',
    answer: 'Go to the Services page and click "Get in touch." Send us a message describing the service you need and your current situation. We will respond within 24 hours with availability and pricing.' },
  { question: 'Do you offer group coaching or training?',
    answer: 'Yes. We offer both individual and group coaching sessions. Group sessions are typically more affordable and are announced via our newsletter and social media pages.' },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '64px 0 48px' }}>
        <div className="fd-container" style={{ textAlign: 'center' }}>
          <div className="fd-section-label">FAQ</div>
          <h1 className="fd-section-title" style={{ marginBottom: 12 }}>Frequently asked questions</h1>
          <p style={{ fontSize: 15, color: 'var(--fd-muted)', margin: '0 auto', maxWidth: 480, lineHeight: 1.7 }}>
            Can't find what you're looking for? Reach out at{' '}
            <a href="mailto:info@flomtechnology.com" style={{ color: 'var(--fd-orange)', fontWeight: 600 }}>
              info@flomtechnology.com
            </a>
          </p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-container" style={{ maxWidth: 720 }}>
          <FAQAccordion items={FAQS} />
        </div>
      </section>
    </>
  );
}
