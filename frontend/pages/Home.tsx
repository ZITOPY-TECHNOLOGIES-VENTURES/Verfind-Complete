import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ABUJA_DISTRICTS } from '../types';

const DISTRICT_EMOJIS: Record<string, string> = {
  Maitama: '🏛️', Asokoro: '🌿', Wuse: '🏙️', Jabi: '✈️',
  Gwarimpa: '🏘️', 'Life Camp': '🌳', Katampe: '⛰️', Guzape: '🌄',
  Apo: '🏗️', Galadimawa: '🏡', Dawaki: '🌾', Lugbe: '🛣️',
  Kubwa: '🌆', Bwari: '🌿', Lokogoma: '🏠', 'Central Area': '🏢',
  Mpape: '🏔️',
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
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#1B3068' }}>Ver</span><span style={{ color: '#2D8B1E' }}>Find</span>
          </span>
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

      {/* Districts grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
          Browse by district
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {ABUJA_DISTRICTS.map(district => (
            <button
              key={district}
              onClick={() => handleDistrictClick(district)}
              className="glass-card"
              style={{
                border: 'none', cursor: 'pointer', padding: '18px 12px',
                textAlign: 'center', borderRadius: 20, background: 'var(--glass-bg)',
                transition: 'transform .15s, box-shadow .15s', color: 'var(--text-primary)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{DISTRICT_EMOJIS[district] || '📍'}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{district}</div>
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
    </div>
  );
}
