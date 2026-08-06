import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

interface Props {
  activePage?: 'about' | 'how-it-works' | 'contact' | 'faq';
}

const NAV_LINKS = [
  { label: 'Properties', to: '/properties', key: 'properties' },
  { label: 'About', to: '/about', key: 'about' },
  { label: 'How It Works', to: '/how-it-works', key: 'how-it-works' },
  { label: 'Contact', to: '/contact', key: 'contact' },
];

export default function SiteHeader({ activePage }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function close() { setOpen(false); }

  const dashboardPath = user
    ? (user.role === 'agent' ? '/agent' : user.role === 'admin' ? '/admin' : '/dashboard')
    : '/login';

  const btnPrimary: React.CSSProperties = { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' };
  const btnOutline: React.CSSProperties = { background: 'var(--glass-bg-subtle)', color: 'var(--text-primary)', border: '1.5px solid var(--border-strong)', borderRadius: 10, padding: '9px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' };
  const full: React.CSSProperties = { width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, justifyContent: 'center' };

  // Auth controls — identical options on desktop and mobile (mobile = stacked, full-width).
  function authArea(mobile = false) {
    if (user) {
      return (
        <button className="btn-auth-primary" onClick={() => { navigate(dashboardPath); close(); }} style={mobile ? { ...btnPrimary, ...full } : btnPrimary}>
          Dashboard
        </button>
      );
    }
    return (
      <>
        <button className="btn-auth-outline" onClick={() => { navigate('/login'); close(); }} style={mobile ? { ...btnOutline, ...full } : btnOutline}>
          Log in
        </button>
        <button className="btn-auth-primary" onClick={() => { navigate('/register'); close(); }} style={mobile ? { ...btnPrimary, ...full } : btnPrimary}>
          Sign up
        </button>
      </>
    );
  }

  return (
    <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', height: 88, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" onClick={close}>
          <img src="/verifind-logo.png" alt="Verifind" style={{ height: 80, width: 'auto', marginRight: 'auto', display: 'block' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="site-nav-links" style={{ marginLeft: 'auto', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.key} to={l.to} className="site-nav-link" style={{
                fontSize: 14,
                color: activePage === l.key ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: activePage === l.key ? 700 : 600,
                textDecoration: 'none',
              }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            {authArea(false)}
          </div>
        </nav>

        {/* Hamburger (mobile only) */}
        <button
          className="hamburger-btn"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: 'auto' }}
        >
          <span style={{ width: 22, height: 2, background: 'var(--text-primary)', borderRadius: 2, display: 'block', transition: 'transform .2s', transform: open ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ width: 22, height: 2, background: 'var(--text-primary)', borderRadius: 2, display: 'block', margin: '5px 0', transition: 'opacity .2s', opacity: open ? 0 : 1 }} />
          <span style={{ width: 22, height: 2, background: 'var(--text-primary)', borderRadius: 2, display: 'block', transition: 'transform .2s', transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="site-nav-mobile-menu" style={{ padding: '8px 24px 20px', borderTop: '1px solid var(--border-color)' }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.key}
              to={l.to}
              onClick={close}
              style={{
                display: 'block',
                padding: '13px 0',
                borderBottom: '1px solid var(--border-color)',
                fontSize: 16,
                fontWeight: activePage === l.key ? 700 : 600,
                color: activePage === l.key ? 'var(--color-primary)' : 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 18 }}>
            {authArea(true)}
            <div style={{ paddingTop: 4 }}>
              <ThemeToggle size={40} label="Switch theme" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
