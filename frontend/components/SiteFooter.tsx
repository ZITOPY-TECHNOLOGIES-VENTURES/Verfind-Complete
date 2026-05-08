import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', padding: '48px 24px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <Link to="/">
              <img src="/verifind-logo.png" alt="Verifind" style={{ height: 48, width: 'auto', marginBottom: 12 }} />
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Nigeria's first fully verified real estate marketplace. Every listing passes a multi-stage verification before it goes live.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Explore</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Browse Listings', to: '/dashboard' },
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'List a Property', to: '/register?role=agent' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'About Verifind', to: '/about' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact', to: '/contact' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="mailto:Verifindestates@gmail.com" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                ✉ Verifindestates@gmail.com
              </a>
              <a href="tel:+2348144878842" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                📞 08144878842
              </a>
              <a href="https://wa.me/2348144878842" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                💬 WhatsApp Us
              </a>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mon–Fri, 8am–6pm WAT</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Verifind Technologies Ltd. Abuja, FCT, Nigeria.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use'].map(t => (
              <span key={t} style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'default' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
