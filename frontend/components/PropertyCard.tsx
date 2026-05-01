import React from 'react';
import { PROPERTY_TYPE_LABELS, type Property } from '../types';

interface Props {
  property: Property;
  onClick: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  available:   { bg: '#dcfce7', color: '#166534', label: 'Available' },
  under_offer: { bg: '#fef3c7', color: '#92400e', label: 'Under Offer' },
  rented:      { bg: '#e0e7ff', color: '#3730a3', label: 'Rented' },
};

export default function PropertyCard({ property: p, onClick }: Props) {
  const status = STATUS_STYLES[p.status] || STATUS_STYLES.available;
  const hasImage = p.images && p.images.length > 0;

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}
    >
      {/* Image / video indicator */}
      <div style={{ position: 'relative', height: 180, background: 'var(--bg-surface-alt)', overflow: 'hidden' }}>
        {hasImage ? (
          <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--text-muted)' }}>🏠</div>
        )}
        {/* Video badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 99, fontSize: 11, padding: '4px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          ▶ Video tour
        </div>
        {/* Status badge */}
        <div style={{ position: 'absolute', top: 10, right: 10, background: status.bg, color: status.color, borderRadius: 99, fontSize: 11, padding: '4px 10px', fontWeight: 700 }}>
          {status.label}
        </div>
        {p.isFeatured && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: '#f59e0b', color: '#fff', borderRadius: 99, fontSize: 10, padding: '3px 9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>📍 {p.district}</span>
          <span style={{ color: 'var(--border-color)' }}>·</span>
          <span>{PROPERTY_TYPE_LABELS[p.type]}</span>
        </div>

        {/* Specs row */}
        {(p.bedrooms || p.bathrooms || p.sqm) && (
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            {p.bedrooms && <span>🛏 {p.bedrooms} bed{p.bedrooms !== 1 ? 's' : ''}</span>}
            {p.bathrooms && <span>🚿 {p.bathrooms} bath{p.bathrooms !== 1 ? 's' : ''}</span>}
            {p.sqm && <span>📐 {p.sqm}sqm</span>}
          </div>
        )}

        {/* Price */}
        <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--color-primary)' }}>
            ₦{p.baseRent.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>/yr</span>
          </div>
          {p.totalInitialPayment && p.totalInitialPayment !== p.baseRent && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Total package: ₦{p.totalInitialPayment.toLocaleString()}
            </div>
          )}
        </div>

        {/* Agent + verified */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>by {p.agentName || 'Agent'}</span>
          {p.isVerified && (
            <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 99, padding: '2px 9px', fontWeight: 700 }}>✓ Verified</span>
          )}
        </div>
      </div>
    </div>
  );
}
