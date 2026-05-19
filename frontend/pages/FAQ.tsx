import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

const FAQS = [
  {
    category: 'Payments & Escrow',
    items: [
      {
        q: 'How does escrow work on Verifind?',
        a: 'When you pay for a property, your money goes into a secure Paystack escrow account — not directly to the agent. It\'s only released to the agent after you confirm you\'ve moved in. If anything goes wrong, we can initiate a refund.',
      },
      {
        q: 'What happens if I change my mind after paying?',
        a: 'Funds held in escrow can be refunded if a dispute is raised before move-in is confirmed. Contact us immediately at Verifindestates@gmail.com or 08144878842 and we will guide you through the process.',
      },
      {
        q: 'How long does it take for funds to release to the agent?',
        a: 'Funds are released as soon as you confirm move-in through your dashboard. Once you tap "I\'ve Moved In", the release is processed and the agent receives the funds.',
      },
      {
        q: 'Are my payment details secure?',
        a: 'All payments are processed by Paystack, a CBN-regulated payments company and subsidiary of Stripe. Verifind never stores your card details.',
      },
    ],
  },
  {
    category: 'Listings & Verification',
    items: [
      {
        q: 'What does a "Verified Listing" mean?',
        a: 'A verified listing has been reviewed by our admin team. The agent\'s KYC has been approved, the property details have been checked, and the listing has been cleared to go live on the platform.',
      },
      {
        q: 'Why do all listings require a video walkthrough?',
        a: 'To eliminate fake or misrepresented listings. Before we show any property to tenants, we require a real video of the actual property — not stock photos. This is one of our core anti-fraud measures.',
      },
      {
        q: 'How do I know an agent is legitimate?',
        a: 'Every agent must submit their identity documents and go through KYC review before their listings appear on the platform. Look for the blue "KYC Verified Agent" badge on any listing or agent profile.',
      },
    ],
  },
  {
    category: 'For Agents',
    items: [
      {
        q: 'How do I list a property on Verifind?',
        a: 'Register as an agent at getverifind.com/register, complete your KYC (submit your NIN and other documents), then go to your agent dashboard and click "+ New Listing". All listings require a video walkthrough URL to be submitted.',
      },
      {
        q: 'When do I receive payment from a tenant?',
        a: 'Payment is released to your registered bank account as soon as the tenant confirms move-in on their dashboard. Make sure your bank account is set up under the "Bank Setup" tab in your agent dashboard.',
      },
      {
        q: 'What documents do I need for KYC?',
        a: 'You need to provide your NIN (National Identification Number). A Driver\'s Licence number and CAC RC number are optional but recommended as they increase your credibility and chances of KYC approval.',
      },
    ],
  },
  {
    category: 'Account & General',
    items: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot password?" on the login page, enter your registered email address, and follow the link in the email you receive. The reset link is valid for 15 minutes.',
      },
      {
        q: 'Is Verifind available outside Abuja?',
        a: 'Currently Verifind focuses exclusively on Abuja FCT. We plan to expand to other Nigerian cities — follow us for updates.',
      },
      {
        q: 'How do I contact support?',
        a: 'Email us at Verifindestates@gmail.com or call/WhatsApp 08144878842. We\'re available Mon–Fri, 8am–6pm WAT and aim to respond within 2 hours.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '18px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: 'var(--text-muted)', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, paddingRight: 32 }}>{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader activePage="faq" />

      <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '60px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, margin: '0 0 12px', color: 'var(--text-primary)' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>
            Can't find what you're looking for?{' '}
            <Link to="/contact" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Contact us directly →</Link>
          </p>
        </div>

        {FAQS.map(section => (
          <div key={section.category} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {section.category}
            </h2>
            <div className="glass-card" style={{ borderRadius: 18, padding: '0 24px' }}>
              {section.items.map(item => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="glass-card" style={{ borderRadius: 18, padding: '32px 28px', textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <h3 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 8px', color: 'var(--text-primary)' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', fontSize: 14 }}>Reach us on email or WhatsApp — we're quick.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:Verifindestates@gmail.com" style={{ padding: '10px 22px', background: 'var(--color-primary)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Email Us
            </a>
            <a href="https://wa.me/2348144878842" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 22px', background: 'none', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
