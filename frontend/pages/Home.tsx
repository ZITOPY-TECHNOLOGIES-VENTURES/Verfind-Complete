import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ABUJA_DISTRICTS } from '../types';
import api from '../services/api';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

interface Stats { activeListings: number; verifiedProperties: number; certifiedAgents: number; }

const DISTRICT_IMAGES: Record<string, string> = {
  Maitama:        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  Asokoro:        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  Wuse:           'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  Jabi:           'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600&q=80',
  Gwarimpa:       'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
  'Life Camp':    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
  Katampe:        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
  Guzape:         'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  Apo:            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80',
  Galadimawa:     'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  Dawaki:         'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
  Lugbe:          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
  Kubwa:          'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=80',
  Bwari:          'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80',
  Lokogoma:       'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=80',
  'Central Area': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
  Mpape:          'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80',
};

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<{ stats: Stats }>('/api/stats')
      .then(res => setStats(res.stats))
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/dashboard?search=${encodeURIComponent(search)}`);
  }

  function handleDistrictClick(district: string) {
    navigate(`/dashboard?district=${encodeURIComponent(district)}`);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      <SiteHeader homeVariant />

      {/* Hero — real photo background */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundImage: "url('/abuja_hero.png')", backgroundSize: 'cover', backgroundPosition: 'center', padding: '80px 24px 96px' }}>
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.80) 50%, rgba(10,22,40,0.45) 100%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="slide-in-from-bottom-4" style={{ display: 'inline-block', background: 'rgba(45,139,30,0.2)', border: '1px solid rgba(45,139,30,0.45)', borderRadius: 99, padding: '5px 16px', fontSize: 11, fontWeight: 700, color: '#6ee7b7', marginBottom: 24, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Verified Abuja Real Estate
          </div>
          <h1 className="slide-in-from-bottom-6" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 22px', color: '#fff' }}>
            Find verified homes<br />in <span style={{ color: '#6ee7b7', fontWeight: 700 }}>Abuja</span>
          </h1>
          <p className="slide-in-from-bottom-8" style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', margin: '0 0 40px', lineHeight: 1.7 }}>
            Video walkthroughs, inspection booking, and escrow payments — all in one place.
          </p>

          <form onSubmit={handleSearch} className="slide-in-from-bottom-10" style={{ display: 'flex', gap: 0, maxWidth: 540, margin: '0 auto', background: 'rgba(255,255,255,0.97)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.1)' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by district, title or address..."
              style={{ flex: 1, borderRadius: 0, padding: '14px 18px', fontSize: 15, border: 'none', background: 'transparent', color: '#1C1C1E', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '14px 24px', background: '#1B3068', color: '#fff', border: 'none', borderRadius: 0, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 15 }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats bar — real counts, floats over the hero edge */}
      <div style={{ maxWidth: 900, margin: '-56px auto 0', padding: '0 24px 56px', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { value: stats ? stats.activeListings.toLocaleString() : '—', label: 'Active Listings' },
            { value: stats ? stats.verifiedProperties.toLocaleString() : '—', label: 'Verified Properties' },
            { value: stats ? stats.certifiedAgents.toLocaleString() : '—', label: 'Certified Agents' },
            { value: String(ABUJA_DISTRICTS.length), label: 'FCT Districts' },
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
                height: 200,
                backgroundImage: `url('${DISTRICT_IMAGES[district] || DISTRICT_IMAGES.Maitama}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform .18s, box-shadow .18s',
                position: 'relative',
                overflow: 'hidden',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Dark overlay for text legibility */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.22) 50%, transparent 100%)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.2, position: 'relative', zIndex: 1, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                {district}
              </div>
              <div style={{ position: 'absolute', bottom: 14, right: 16, color: 'rgba(255,255,255,0.65)', fontSize: 17, zIndex: 1 }}>
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
