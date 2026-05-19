import React, { useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', category: 'tenant', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setSending(false);
  }

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 32, alignItems: 'start' }}>

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

          {/* Contact form */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '32px 28px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontWeight: 800, fontSize: 20, margin: '0 0 10px', color: 'var(--text-primary)' }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>We'll get back to you within 2 hours. Check your email for a confirmation.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', category: 'tenant', message: '' }); }}
                  style={{ marginTop: 20, padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 24px', color: 'var(--text-primary)' }}>Send Us a Message</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>I am a</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="tenant">Tenant</option>
                      <option value="agent">Agent</option>
                      <option value="landlord">Landlord</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Message *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} placeholder="How can we help?" required style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" disabled={sending} style={{ padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
