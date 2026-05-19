import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const colHead: React.CSSProperties = { fontWeight: 800, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em' };
  const linkStyle: React.CSSProperties = { fontSize: 14, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 };

  return (
    <footer style={{ background: '#0a1628', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <Link to="/">
              <img src="/verifind-logo.png" alt="Verifind" style={{ height: 48, width: 'auto', marginBottom: 12 }} />
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
              Nigeria's first fully verified real estate marketplace. Every listing passes a multi-stage verification before it goes live.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div style={colHead}>Explore</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Browse Listings', to: '/dashboard' },
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'List a Property', to: '/register?role=agent' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={colHead}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'About Verifind', to: '/about' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact', to: '/contact' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={colHead}>Contact Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="mailto:Verifindestates@gmail.com" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                ✉ Verifindestates@gmail.com
              </a>
              <a href="tel:+2348144878842" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                📞 08144878842
              </a>
              <a href="https://wa.me/2348144878842" target="_blank" rel="noopener noreferrer" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                💬 WhatsApp Us
              </a>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Mon–Fri, 8am–6pm WAT</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Verifind Technologies Ltd. Abuja, FCT, Nigeria.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use'].map(t => (
              <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'default' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
