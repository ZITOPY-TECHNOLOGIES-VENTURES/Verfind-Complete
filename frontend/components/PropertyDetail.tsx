import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookingCalendar from './BookingCalendar';
import { PROPERTY_TYPE_LABELS, type Property, type CategorizedImage } from '../types';
import { formatRelativeTime } from '../utils/formatTime';

interface Props {
  property: Property;
  onClose: () => void;
  onPay: () => void;
}

function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&origin=https://getverifind.com`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function PropertyDetail({ property: p, onClose, onPay }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showBooking, setShowBooking] = useState(false);

  const embedUrl = getVideoEmbedUrl(p.videoUrl);
  const relativeTime = formatRelativeTime(p.createdAt);

  const catImages: CategorizedImage[] = p.categorizedImages || (p.images || []).map(url => ({ url, category: 'Other' }));
  const availableCategories = ['All', ...Array.from(new Set(catImages.map(ci => ci.category)))];

  const filteredImages = activeCategory === 'All'
    ? catImages
    : catImages.filter(ci => ci.category === activeCategory);

  const currentImagesList = filteredImages.length > 0 ? filteredImages : catImages;

  const fees = [
    { label: 'Base Rent', value: p.baseRent },
    { label: 'Service Charge', value: p.serviceCharge },
    { label: 'Caution Fee', value: p.cautionFee },
    p.agencyFee ? { label: 'Agency Fee', value: p.agencyFee } : null,
    p.legalFee ? { label: 'Legal Fee', value: p.legalFee } : null,
  ].filter(Boolean) as { label: string; value: number }[];

  function handleBookClick() {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}&action=book&propertyId=${p.id}`);
      return;
    }
    setShowBooking(true);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 740, maxHeight: '92vh', overflowY: 'auto', borderRadius: 24 }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{p.title}</h2>
            {relativeTime && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Listed {relativeTime}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'var(--glass-bg-subtle)', border: 'none', borderRadius: 99, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '16px 24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Categorized Images Gallery */}
          {catImages.length > 0 && (
            <div>
              {availableCategories.length > 2 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setImgIdx(0); }}
                      style={{
                        padding: '6px 14px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                        background: activeCategory === cat ? 'var(--color-primary)' : 'var(--glass-bg-subtle)',
                        color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 260 }}>
                <img
                  src={currentImagesList[imgIdx]?.url || p.images[0]}
                  alt={currentImagesList[imgIdx]?.category || p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  📷 {currentImagesList[imgIdx]?.category || 'View'}
                </div>
                {currentImagesList.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {currentImagesList.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === imgIdx ? 'var(--color-primary)' : 'rgba(255,255,255,.5)', padding: 0 }} />
                    ))}
                  </div>
                )}
              </div>
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

          {/* Overview Section (Feature 5) */}
          {p.overview && (
            <div style={{ background: 'var(--glass-bg-subtle)', borderRadius: 14, padding: '16px 18px', borderLeft: '4px solid var(--color-primary)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 600 }}>{p.overview}</p>
            </div>
          )}

          {/* Details grid */}
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

          {/* Address + map */}
          {p.address && (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              📍 {p.address}, {p.district}, Abuja
            </div>
          )}
          {p.lat && p.lng && (
            <div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#e5e7eb' }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&output=embed`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  title="Property location"
                  loading="lazy"
                />
              </div>
              <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 6, color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>
                Open in Google Maps →
              </a>
            </div>
          )}

          {/* Description / About Property (Feature 5) */}
          {(p.aboutProperty || p.description) && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>About this property</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {p.aboutProperty || p.description}
              </p>
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

          {/* Agent info & Property Source (Feature 6) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--glass-bg-subtle)', borderRadius: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
              {(p.agentName || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.agentName || 'Agent'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.listedBy || 'Listed by agent'}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {p.agentIsKycVerified && <span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 99, fontSize: 11, padding: '3px 10px', fontWeight: 700 }}>✓ KYC Verified Agent</span>}
              {p.isVerified && <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 99, fontSize: 11, padding: '3px 10px', fontWeight: 700 }}>✓ Verified Listing</span>}
            </div>
          </div>

          {/* CTAs (Feature 1: Delay User Signup Until Booking) */}
          {(!user || user?.role === 'tenant') && p.status === 'available' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleBookClick} style={{ flex: 1, padding: '13px', border: '2px solid var(--color-primary)', background: 'transparent', borderRadius: 14, color: 'var(--color-primary)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                📅 Book Inspection
              </button>
              {user && (
                <button onClick={onPay} style={{ flex: 1, padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  💳 Pay Escrow
                </button>
              )}
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
