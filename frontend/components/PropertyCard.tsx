import React, { useState } from 'react';
import { PROPERTY_TYPE_LABELS, type Property } from '../types';
import { formatRelativeTime } from '../utils/formatTime';

interface Props {
  property: Property;
  onClick: () => void;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function PropertyCard({ property: p, onClick, onFavorite, isFavorited }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hasImages = p.images && p.images.length > 0;
  const multi = hasImages && p.images.length > 1;

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIdx(i => (i - 1 + p.images.length) % p.images.length);
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIdx(i => (i + 1) % p.images.length);
  }

  const relativeTime = formatRelativeTime(p.createdAt);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border-outer)',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'transform .22s, box-shadow .22s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image area ── */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: 'linear-gradient(135deg, #1B3068 0%, #2563EB 100%)', flexShrink: 0 }}>
        {hasImages ? (
          <img
            src={p.images[imgIdx]}
            alt={p.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform .4s ease' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Dark gradient vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Top row: verification badge + video badge + relative time */}
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{
              background: p.isVerified ? 'rgba(5,150,105,0.88)' : 'rgba(180,83,9,0.82)',
              color: '#fff', borderRadius: 99, fontSize: 10, padding: '3px 10px', fontWeight: 700,
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', letterSpacing: '0.04em',
            }}>
              {p.isVerified ? '✓ Verified' : '• Pending'}
            </div>
            {relativeTime && (
              <div style={{
                background: 'rgba(0,0,0,0.52)', color: '#fff', borderRadius: 99, fontSize: 10, padding: '3px 9px', fontWeight: 600,
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              }}>
                🕒 {relativeTime}
              </div>
            )}
          </div>
          {p.videoUrl && (
            <div style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: '#fff', borderRadius: 99, fontSize: 10, padding: '3px 9px', fontWeight: 700 }}>
              ▶ Video
            </div>
          )}
        </div>

        {/* Price overlay — bottom left */}
        <div style={{ position: 'absolute', bottom: 12, left: 14, lineHeight: 1 }}>
          <div style={{ fontSize: 21, fontWeight: 800, color: '#fff', fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif", textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            ₦{p.baseRent.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: 600, marginTop: 2 }}>/year</div>
        </div>

        {/* Heart button — bottom right */}
        {onFavorite && (
          <button
            onClick={e => { e.stopPropagation(); onFavorite(p.id); }}
            title={isFavorited ? 'Remove from saved' : 'Save property'}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: isFavorited ? '#f43f5e' : '#fff', transition: 'color .15s',
            }}
          >
            {isFavorited ? '❤' : '♡'}
          </button>
        )}

        {/* Carousel dots */}
        {multi && (
          <div style={{ position: 'absolute', bottom: 42, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, pointerEvents: 'none' }}>
            {p.images.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'background .15s' }} />
            ))}
          </div>
        )}

        {/* Carousel chevrons (show on hover) */}
        {multi && hovered && (
          <>
            <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, backdropFilter: 'blur(4px)', lineHeight: 1 }}>‹</button>
            <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, backdropFilter: 'blur(4px)', lineHeight: 1 }}>›</button>
          </>
        )}
      </div>

      {/* ── Content area ── */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {/* Type · District */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {PROPERTY_TYPE_LABELS[p.type]} · {p.district}
        </div>

        {/* Title */}
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.title}
        </div>

        {/* Specs */}
        {(p.bedrooms || p.bathrooms || p.sqm) && (
          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            {p.bedrooms && <span>🛏 {p.bedrooms} bd</span>}
            {p.bathrooms && <span>🚿 {p.bathrooms} ba</span>}
            {p.sqm && <span>📐 {p.sqm}m²</span>}
          </div>
        )}

        {/* Total package */}
        {p.totalInitialPayment && p.totalInitialPayment !== p.baseRent && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Total: <strong style={{ color: 'var(--text-secondary)' }}>₦{p.totalInitialPayment.toLocaleString()}</strong>
          </div>
        )}

        {/* Agent row / Source */}
        <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.listedBy || `by ${p.agentName || 'Agent'}`}
          </span>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {p.agentIsKycVerified && (
              <span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 99, padding: '2px 8px', fontWeight: 700, fontSize: 10 }}>✓ KYC</span>
            )}
            {p.isVerified && (
              <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 99, padding: '2px 8px', fontWeight: 700, fontSize: 10 }}>✓ Listed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
