import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

interface Props {
  activePage?: 'about' | 'how-it-works' | 'contact' | 'faq';
  homeVariant?: boolean;
}

const NAV_LINKS = [
  { label: 'About', to: '/about', key: 'about' },
  { label: 'How It Works', to: '/how-it-works', key: 'how-it-works' },
  { label: 'Contact', to: '/contact', key: 'contact' },
];

export default function SiteHeader({ activePage, homeVariant }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function close() { setOpen(false); }

  function authButton(fullWidth = false) {
    const style: React.CSSProperties = {
      padding: fullWidth ? '12px' : '8px 18px',
      background: 'var(--color-primary)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 14,
      ...(fullWidth ? { width: '100%', borderRadius: 12, fontSize: 15 } : {}),
    };
    if (user) {
      return (
        <button onClick={() => { navigate(user.role === 'agent' ? '/agent' : '/dashboard'); close(); }} style={style}>
          Dashboard
        </button>
      );
    }
    if (homeVariant && !fullWidth) {
      return (
        <>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            Log in
          </button>
          <button onClick={() => navigate('/register')} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff' }}>
            Sign up
          </button>
        </>
      );
    }
    return (
      <button onClick={() => { navigate('/login'); close(); }} style={style}>
        Sign In
      </button>
    );
  }

  return (
    <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', height: 88, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" onClick={close}>
          <img src="/verifind-logo.png" alt="Verifind" style={{ height: 80, width: 'auto', marginRight: 'auto', display: 'block' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="site-nav-links" style={{ marginLeft: 'auto' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.key} to={l.to} style={{
              fontSize: 14,
              color: activePage === l.key ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: activePage === l.key ? 700 : 600,
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          {authButton()}
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
          <div style={{ display: 'flex', gap: 12, paddingTop: 16, alignItems: 'center' }}>
            <ThemeToggle size={40} />
            <div style={{ flex: 1 }}>
              {authButton(true)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
