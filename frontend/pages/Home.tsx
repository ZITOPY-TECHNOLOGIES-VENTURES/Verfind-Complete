import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ABUJA_DISTRICTS } from '../types';
import SiteFooter from '../components/SiteFooter';

const DISTRICT_GRADIENTS: Record<string, string> = {
  Maitama:        'linear-gradient(135deg, #1B3068 0%, #2563EB 100%)',
  Asokoro:        'linear-gradient(135deg, #4338CA 0%, #1B3068 100%)',
  Wuse:           'linear-gradient(135deg, #0F766E 0%, #1B3068 100%)',
  Jabi:           'linear-gradient(135deg, #1B3068 0%, #0F766E 100%)',
  Gwarimpa:       'linear-gradient(135deg, #2D8B1E 0%, #16A34A 100%)',
  'Life Camp':    'linear-gradient(135deg, #065F46 0%, #2D8B1E 100%)',
  Katampe:        'linear-gradient(135deg, #1B3068 0%, #4338CA 100%)',
  Guzape:         'linear-gradient(135deg, #0F766E 0%, #2D8B1E 100%)',
  Apo:            'linear-gradient(135deg, #1B3068 0%, #2563EB 100%)',
  Galadimawa:     'linear-gradient(135deg, #2D8B1E 0%, #0F766E 100%)',
  Dawaki:         'linear-gradient(135deg, #16A34A 0%, #2D8B1E 100%)',
  Lugbe:          'linear-gradient(135deg, #065F46 0%, #16A34A 100%)',
  Kubwa:          'linear-gradient(135deg, #4338CA 0%, #1B3068 100%)',
  Bwari:          'linear-gradient(135deg, #2D8B1E 0%, #065F46 100%)',
  Lokogoma:       'linear-gradient(135deg, #0F766E 0%, #065F46 100%)',
  'Central Area': 'linear-gradient(135deg, #1B3068 0%, #1e3a8a 100%)',
  Mpape:          'linear-gradient(135deg, #1B3068 0%, #0F766E 100%)',
};

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/dashboard?search=${encodeURIComponent(search)}`);
  }

  function handleDistrictClick(district: string) {
    navigate(`/dashboard?district=${encodeURIComponent(district)}`);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Liquid background blobs */}
      <div className="liquid-bg-container">
        <div className="liquid-blob" style={{ width: 500, height: 500, top: '-100px', left: '-150px', background: 'var(--bubble-1)' }} />
        <div className="liquid-blob" style={{ width: 400, height: 400, bottom: '-80px', right: '-100px', background: 'var(--bubble-2)', animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/"><img src="/verifind-logo.png" alt="Verifind" style={{ height: 42, width: 'auto', marginRight: 'auto' }} /></Link>
          <Link to="/about" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>About</Link>
          <Link to="/how-it-works" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>How It Works</Link>
          <Link to="/contact" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>Contact</Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <button className="btn-primary" onClick={() => navigate(user.role === 'agent' ? '/agent' : '/dashboard')}
                style={{ padding: '8px 18px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                  Log in
                </button>
                <button onClick={() => navigate('/register')} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '72px 24px 48px', maxWidth: 720, margin: '0 auto' }}>
        <div className="slide-in-from-bottom-4" style={{ display: 'inline-block', background: 'rgba(10,102,194,.1)', border: '1px solid rgba(10,102,194,.25)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Verified Abuja Real Estate
        </div>
        <h1 className="slide-in-from-bottom-6" style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', margin: '0 0 20px', color: 'var(--text-primary)' }}>
          Find verified homes<br />in <span style={{ color: 'var(--color-primary)' }}>Abuja</span>
        </h1>
        <p className="slide-in-from-bottom-8" style={{ fontSize: 18, color: 'var(--text-secondary)', margin: '0 0 36px', lineHeight: 1.6 }}>
          Browse listings with video walkthroughs, book inspections, and pay securely via escrow.
        </p>

        <form onSubmit={handleSearch} className="slide-in-from-bottom-10" style={{ display: 'flex', gap: 10, maxWidth: 520, margin: '0 auto' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by district, title or address..."
            style={{ flex: 1, borderRadius: 14, padding: '13px 16px', fontSize: 15 }}
          />
          <button type="submit" style={{ padding: '13px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 15 }}>
            Search
          </button>
        </form>
      </section>

      {/* Stats bar */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { value: '553+', label: 'Active Listings' },
            { value: '412', label: 'Verified Properties' },
            { value: '87', label: 'Certified Agents' },
            { value: '17', label: 'FCT Districts' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '20px 16px', borderRadius: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Value props */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { icon: '🏠', accent: '#2D8B1E', title: 'Rent in Abuja', body: 'Browse verified rentals with escrow protection. Pay securely — funds released only after you confirm move-in.', cta: 'Find Rentals', to: '/dashboard' },
            { icon: '📹', accent: '#1B3068', title: 'Video Walkthroughs', body: 'Every listing on Verifind includes a real video tour. No more arriving to find a property that doesn\'t match the photos.', cta: 'Browse Properties', to: '/dashboard' },
            { icon: '🏢', accent: '#4338CA', title: 'List & Get Verified', body: 'Post your property, complete KYC, and earn the Verifind Verified badge. Verified listings build tenant trust instantly.', cta: 'List Your Property', to: '/register?role=agent' },
          ].map(c => (
            <div key={c.title} className="glass-card" style={{ borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${c.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>{c.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>{c.body}</div>
              <button onClick={() => navigate(c.to)} style={{ alignSelf: 'flex-start', marginTop: 4, padding: '9px 18px', background: c.accent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {c.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Districts grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
          Browse by district
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {ABUJA_DISTRICTS.map(district => (
            <button
              key={district}
              onClick={() => handleDistrictClick(district)}
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: 20,
                height: 120,
                background: DISTRICT_GRADIENTS[district] || 'linear-gradient(135deg, #1B3068 0%, #2563EB 100%)',
                transition: 'transform .18s, filter .18s',
                position: 'relative',
                overflow: 'hidden',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.filter = 'brightness(1.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.filter = '';
              }}
            >
              {/* Subtle pattern overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>
                {district}
              </div>
              <div style={{ position: 'absolute', bottom: 14, right: 16, color: 'rgba(255,255,255,0.6)', fontSize: 16, zIndex: 1 }}>
                →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA for agents */}
      <section style={{ background: 'var(--glass-bg)', borderTop: '1px solid var(--border-color)', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 12px', color: 'var(--text-primary)' }}>
          Are you a property agent?
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px', fontSize: 16 }}>
          List your properties with verified video walkthroughs and receive escrow payments.
        </p>
        <button onClick={() => navigate('/register?role=agent')} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          List a Property
        </button>
      </section>

      <SiteFooter />
    </div>
  );
}
