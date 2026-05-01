import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingCalendar from './BookingCalendar';
import { PROPERTY_TYPE_LABELS, type Property } from '../types';

interface Props {
  property: Property;
  onClose: () => void;
  onPay: () => void;
}

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function PropertyDetail({ property: p, onClose, onPay }: Props) {
  const { user } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  const embedUrl = getVideoEmbedUrl(p.videoUrl);
  const fees = [
    { label: 'Base Rent', value: p.baseRent },
    { label: 'Service Charge', value: p.serviceCharge },
    { label: 'Caution Fee', value: p.cautionFee },
    p.agencyFee ? { label: 'Agency Fee', value: p.agencyFee } : null,
    p.legalFee ? { label: 'Legal Fee', value: p.legalFee } : null,
  ].filter(Boolean) as { label: string; value: number }[];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 740, maxHeight: '92vh', overflowY: 'auto', borderRadius: 24 }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ flex: 1, margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{p.title}</h2>
          <button onClick={onClose} style={{ background: 'var(--glass-bg-subtle)', border: 'none', borderRadius: 99, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '16px 24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Images */}
          {p.images.length > 0 && (
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 240 }}>
              <img src={p.images[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {p.images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {p.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === imgIdx ? 'var(--color-primary)' : 'rgba(255,255,255,.5)', padding: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video walkthrough */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>▶ Video Walkthrough</h3>
            {embedUrl ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                <iframe src={embedUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                ▶ Watch Video Walkthrough
              </a>
            )}
          </div>

          {/* Details row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {[
              { label: 'Type', value: PROPERTY_TYPE_LABELS[p.type] },
              { label: 'District', value: p.district },
              p.bedrooms ? { label: 'Bedrooms', value: p.bedrooms } : null,
              p.bathrooms ? { label: 'Bathrooms', value: p.bathrooms } : null,
              p.sqm ? { label: 'Size', value: `${p.sqm} sqm` } : null,
              { label: 'Furnished', value: p.furnished ? 'Yes' : 'No' },
              { label: 'Parking', value: p.parking ? 'Yes' : 'No' },
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} style={{ background: 'var(--glass-bg-subtle)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Address + map link */}
          {p.address && (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              📍 {p.address}, {p.district}, Abuja
              {p.lat && p.lng && (
                <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 10, color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>
                  View on Map →
                </a>
              )}
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>About this property</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.description}</p>
            </div>
          )}

          {/* Total Package breakdown */}
          <div style={{ background: 'var(--glass-bg-subtle)', borderRadius: 16, padding: '18px 20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Total Package Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fees.map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₦{f.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--color-primary)' }}>
                  ₦{(p.totalInitialPayment || fees.reduce((s, f) => s + f.value, 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Agent info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--glass-bg-subtle)', borderRadius: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
              {(p.agentName || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.agentName || 'Agent'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Listed by agent</div>
            </div>
            {p.isVerified && <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', borderRadius: 99, fontSize: 11, padding: '3px 10px', fontWeight: 700 }}>✓ Verified Listing</span>}
          </div>

          {/* CTAs */}
          {user?.role === 'tenant' && p.status === 'available' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowBooking(true)} style={{ flex: 1, padding: '13px', border: '2px solid var(--color-primary)', background: 'transparent', borderRadius: 14, color: 'var(--color-primary)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                📅 Book Inspection
              </button>
              <button onClick={onPay} style={{ flex: 1, padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                💳 Pay Escrow
              </button>
            </div>
          )}
        </div>
      </div>

      {showBooking && (
        <BookingCalendar property={p} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}
