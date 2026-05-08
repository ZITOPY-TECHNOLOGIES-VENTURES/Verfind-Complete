import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SiteFooter from '../components/SiteFooter';

type Role = 'tenant' | 'agent';

const TENANT_STEPS = [
  { icon: '🔍', title: 'Browse Verified Listings', body: 'Filter by Abuja district, price range, and property type. Every result on Verifind has been reviewed and has a real video walkthrough.' },
  { icon: '📅', title: 'Book an Inspection', body: 'Pick a date directly through the platform. The agent confirms the inspection via their dashboard. No back-and-forth over WhatsApp.' },
  { icon: '💳', title: 'Pay into Escrow', body: 'Your payment goes into a Paystack escrow account. It never goes directly to the agent until after you confirm everything is as described.' },
  { icon: '🏠', title: 'Confirm Move-In', body: 'Once you\'ve moved in and are satisfied, tap "Confirm Move-In" in your dashboard. Funds are then released to the agent. Simple.' },
];

const AGENT_STEPS = [
  { icon: '✅', title: 'Register & Complete KYC', body: 'Sign up as an agent, submit your NIN and any other identity documents. Our team reviews and approves your account before you can list.' },
  { icon: '🏦', title: 'Set Up Your Bank Account', body: 'Link your bank account under the Bank Setup tab in your dashboard. All escrow releases go directly here — no manual requests needed.' },
  { icon: '📹', title: 'List Your Property', body: 'Create a listing with full details, images, and a mandatory video walkthrough. Optionally pin the exact location with lat/lng coordinates.' },
  { icon: '💰', title: 'Receive Secure Payment', body: 'When a tenant confirms move-in, funds are automatically released to your registered bank account. No chasing payments, no bounced cheques.' },
];

export default function HowItWorks() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('tenant');

  const steps = role === 'tenant' ? TENANT_STEPS : AGENT_STEPS;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/"><img src="/verifind-logo.png" alt="Verifind" style={{ height: 40, width: 'auto', marginRight: 'auto' }} /></Link>
          <Link to="/about" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>About</Link>
          <Link to="/how-it-works" style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>How It Works</Link>
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, margin: '0 0 12px', color: 'var(--text-primary)' }}>How Verifind Works</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>
            Money and keys only change hands once the property is confirmed real.
          </p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-alt)', borderRadius: 14, padding: 4, marginBottom: 40, maxWidth: 320, margin: '0 auto 40px' }}>
          {(['tenant', 'agent'] as Role[]).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 10, cursor: 'pointer',
              fontWeight: 700, fontSize: 14, transition: 'all .15s',
              background: role === r ? 'var(--color-primary)' : 'transparent',
              color: role === r ? '#fff' : 'var(--text-muted)',
            }}>
              {r === 'tenant' ? '🏠 I\'m a Tenant' : '🏢 I\'m an Agent'}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 60 }}>
          {steps.map((step, i) => (
            <div key={step.title} className="glass-card" style={{ borderRadius: 18, padding: '24px 24px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {step.icon} {step.title}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust pillars */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', margin: '0 0 24px', color: 'var(--text-primary)' }}>Why tenants trust Verifind</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔒', title: 'Escrow Protection', body: 'Your money never reaches the agent until you confirm the property is real and as described.' },
              { icon: '🪪', title: 'Agent KYC', body: 'Every agent has submitted identity documents and been manually verified by our team.' },
              { icon: '📹', title: 'Video Proof', body: 'Every listing requires a real video of the actual property before it goes live.' },
              { icon: '📍', title: 'Google Maps Pin', body: 'Properties are pinned to exact coordinates so you can verify the location before you even book.' },
            ].map(c => (
              <div key={c.title} className="glass-card" style={{ borderRadius: 18, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 28px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Browse Listings
            </button>
            <button onClick={() => navigate('/register?role=agent')} style={{ padding: '13px 28px', background: 'none', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              List a Property
            </button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
