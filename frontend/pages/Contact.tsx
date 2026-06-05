import React from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export default function Contact() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader activePage="contact" />

      <div style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '60px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(27,48,104,0.1)', border: '1px solid rgba(27,48,104,0.2)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            We're in Abuja, FCT
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, margin: '0 0 12px', color: 'var(--text-primary)' }}>Get in Touch</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>We typically respond within 2 hours during business hours (Mon–Fri, 8am–6pm WAT).</p>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Contact cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                icon: '📞',
                title: 'Phone / WhatsApp',
                lines: ['08144878842', 'Mon–Fri, 8am–6pm WAT'],
                href: 'tel:+2348144878842',
                cta: 'Call Now',
              },
              {
                icon: '✉️',
                title: 'Email',
                lines: ['Verifindestates@gmail.com', 'We reply within 2 hours'],
                href: 'mailto:Verifindestates@gmail.com',
                cta: 'Send Email',
              },
              {
                icon: '💬',
                title: 'WhatsApp',
                lines: ['08144878842', 'Quick responses on WhatsApp'],
                href: 'https://wa.me/2348144878842',
                cta: 'Chat on WhatsApp',
              },
            ].map(c => (
              <div key={c.title} className="glass-card" style={{ borderRadius: 18, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{c.title}</div>
                    {c.lines.map((l, i) => (
                      <div key={i} style={{ fontSize: 14, color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === 0 ? 600 : 400 }}>{l}</div>
                    ))}
                  </div>
                  <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    style={{ padding: '7px 14px', background: 'var(--color-primary)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
