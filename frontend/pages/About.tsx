import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SiteFooter from '../components/SiteFooter';

export default function About() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 88, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/"><img src="/verifind-logo.png" alt="Verifind" style={{ height: 80, width: 'auto', marginRight: 'auto' }} /></Link>
          <Link to="/about" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>About</Link>
          <Link to="/how-it-works" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>How It Works</Link>
          <Link to="/contact" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>Contact</Link>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          {user ? (
            <button onClick={() => navigate(user.role === 'agent' ? '/agent' : '/dashboard')} style={{ padding: '8px 18px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Dashboard</button>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Sign In</button>
          )}
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '60px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(27,48,104,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>🏠</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px', color: 'var(--text-primary)' }}>
            We built Verifind because<br />the fraud has to stop.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Abuja renters lose billions every year to fake listings, forged documents, and unregulated agents. Verifind exists to end that.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 60 }}>
          {[
            { value: '412+', label: 'Verified Listings' },
            { value: '87', label: 'Certified Agents' },
            { value: '₦0', label: 'Tenant Fraud Since Launch' },
            { value: '17', label: 'Abuja Districts' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '24px 20px', borderRadius: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-primary)', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="glass-card" style={{ borderRadius: 20, padding: '36px 32px', marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)' }}>The Problem We're Solving</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, margin: '0 0 16px' }}>
            Abuja has a structural rental fraud problem. Unregulated agents, fake Certificates of Occupancy, and WhatsApp-coordinated double lettings cost FCT residents billions annually.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            Existing platforms display listings but never verify them. We built Verifind with verification at the core — agent KYC, mandatory video walkthroughs, and Paystack escrow protection — so that trust is built into the product, not left to chance.
          </p>
        </div>

        {/* What makes us different */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 60 }}>
          {[
            { icon: '🔒', title: 'Escrow Protection', body: 'Tenant funds are held securely and released to the agent only after move-in is confirmed. No more lost deposits.' },
            { icon: '✅', title: 'Agent KYC', body: 'Every agent on Verifind has submitted their identity documents and been reviewed by our team before going live.' },
            { icon: '📹', title: 'Video Walkthroughs', body: 'Every listing requires a real video tour. No more showing up to find a property that doesn\'t match the photos.' },
            { icon: '📍', title: 'Location Verified', body: 'Property coordinates are pinned to Google Maps so tenants can confirm the exact location before booking.' },
          ].map(c => (
            <div key={c.title} className="glass-card" style={{ borderRadius: 18, padding: '24px 20px' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>Have questions? We'd love to hear from you.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/contact')} style={{ padding: '13px 28px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Contact Us</button>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 28px', background: 'none', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Browse Listings</button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
