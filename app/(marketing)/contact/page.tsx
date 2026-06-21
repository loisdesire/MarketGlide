import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import FAQAccordion, { type FAQItem } from '@/components/marketing/FAQAccordion';
import ContactForm from '@/components/marketing/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Flom Digital team. We respond within 24–48 hours.',
};

const FAQS: FAQItem[] = [
  {
    question: 'How do I access the Sales & Inventory Tracker?',
    answer: 'Go to Business Tools, click "Sales & Inventory Tracker," and register your business account. Once you\'re in, you can add your team from Business Settings.',
  },
  {
    question: 'What do I get with the Mini Importation Mastery Guide?',
    answer: 'The Guide covers the full importation journey, from identifying profitable products and finding reliable suppliers to customs clearance, pricing, and making your first sale. 22 chapters, worksheets, and bonus checklists included.',
  },
  {
    question: 'Is there a difference between the Book and the Course?',
    answer: 'Yes. The Book is a written guide you can read at your own pace. The Course adds video lessons, live Q&A sessions, real supplier contacts, and access to our community of business builders.',
  },
  {
    question: 'Do I need prior business experience to benefit from the content?',
    answer: 'No. Both the Book and the Course are designed to take you from zero to your first import order, and then from there to a scalable operation. Complete beginners are welcome.',
  },
  {
    question: 'Can I get a refund?',
    answer: "We offer a 7-day satisfaction guarantee on digital products. If you're not happy with your purchase, contact us within 7 days and we'll issue a full refund, no questions asked.",
  },
  {
    question: 'How do I add my team to the Tracker?',
    answer: "After logging in, go to Business Settings → Team & Users → Invite User. Enter their email, assign a role (Sales Staff, Manager, or Viewer), and they'll receive an email to set up their account.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Page hero */}
      <section style={{ background: 'var(--fd-bg-alt)', borderBottom: '1px solid var(--fd-border)', padding: '64px 0 48px' }}>
        <div className="fd-container">
          <div className="fd-section-label">Get in Touch</div>
          <h1 className="fd-section-title" style={{ textAlign: 'left', marginBottom: 12 }}>
            We'd love to hear from you
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fd-muted)', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
            Have a question about the book, course, or tools? Our team responds within 24–48 hours.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="fd-section">
        <div className="fd-container">
          <div className="fd-contact-grid">
            {/* Info column */}
            <div>
              <h2 className="fd-contact-info-title">Contact information</h2>

              <div className="fd-contact-info-item">
                <Mail size={18} />
                <div>
                  <strong>Email</strong><br />
                  <a href="mailto:hello@flomdigital.com" style={{ color: 'var(--fd-orange)', textDecoration: 'none' }}>
                    hello@flomdigital.com
                  </a>
                </div>
              </div>

              <div className="fd-contact-info-item">
                <Phone size={18} />
                <div>
                  <strong>WhatsApp</strong><br />
                  <a href="https://wa.me/2348000000000" style={{ color: 'var(--fd-orange)', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                    +234 800 000 0000
                  </a>
                </div>
              </div>

              <div className="fd-contact-info-item">
                <MapPin size={18} />
                <div>
                  <strong>Location</strong><br />
                  Lagos, Nigeria
                </div>
              </div>

              <div className="fd-contact-info-item">
                <Clock size={18} />
                <div>
                  <strong>Response time</strong><br />
                  Within 24–48 hours (Mon–Sat)
                </div>
              </div>
            </div>

            {/* Form column */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="fd-section" style={{ background: 'var(--fd-bg-alt)', borderTop: '1px solid var(--fd-border)' }}>
        <div className="fd-container">
          <div className="fd-section-heading">
            <div className="fd-section-label">FAQ</div>
            <h2 className="fd-section-title">Frequently asked questions</h2>
            <p className="fd-section-sub">Can't find what you're looking for? Use the contact form above.</p>
          </div>
          <FAQAccordion items={FAQS} />
        </div>
      </section>
    </>
  );
}
