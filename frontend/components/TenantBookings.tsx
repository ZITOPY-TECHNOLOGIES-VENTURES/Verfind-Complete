import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Booking } from '../types';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  accepted:    { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  rescheduled: { bg: '#e0e7ff', color: '#3730a3', label: 'Rescheduled' },
  cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

export default function TenantBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ bookings: Booking[] }>('/api/bookings')
      .then(res => setBookings(res.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card" style={{ height: 96, background: 'var(--glass-bg)', animation: 'shimmer-sweep 1.5s infinite', backgroundSize: '200% 100%' }} />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-secondary)' }}>No inspection bookings yet</p>
        <p>Book an inspection on any listing and track its status here</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bookings.map(b => {
        const s = STATUS_STYLES[b.status] || { bg: 'var(--glass-bg-subtle)', color: 'var(--text-secondary)', label: b.status };
        return (
          <div key={b.id} className="glass-card" style={{ padding: 18, borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>{b.propertyTitle || 'Property'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Inspection: {new Date(b.requestedDate).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {b.agentNote && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 6 }}>
                    Agent note: {b.agentNote}
                  </div>
                )}
              </div>
              <span style={{ background: s.bg, color: s.color, borderRadius: 99, fontSize: 12, padding: '4px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {b.status === 'rescheduled' && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#3730a3', background: '#e0e7ff', borderRadius: 10, padding: '8px 12px' }}>
                The agent proposed a new date — see the inspection date above.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
