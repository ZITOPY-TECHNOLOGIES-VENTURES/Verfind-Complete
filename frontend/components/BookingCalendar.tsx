import React, { useState } from 'react';
import api from '../services/api';
import type { Property } from '../types';

interface Props {
  property: Property;
  onClose: () => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingCalendar({ property, onClose }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function isDisabled(day: number) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (d <= t) return true;
    if (d.getDay() === 0) return true; // No Sundays
    return false;
  }

  async function handleBook() {
    if (!selected) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/api/bookings', {
        propertyId: property.id,
        requestedDate: selected.toISOString(),
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to book inspection');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 380, padding: '28px 24px', borderRadius: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <h3 style={{ flex: 1, margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Book Inspection</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>Inspection requested!</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {selected?.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
              <br />The agent will confirm or reschedule.
            </p>
            <button onClick={onClose} style={{ padding: '11px 28px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              📍 {property.title}, {property.district}
            </div>

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-secondary)', padding: '4px 8px' }}>‹</button>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{monthName}</span>
              <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-secondary)', padding: '4px 8px' }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const disabled = isDisabled(day);
                const isSelected = selected?.getDate() === day && selected?.getMonth() === month && selected?.getFullYear() === year;
                return (
                  <button key={day} onClick={() => !disabled && setSelected(date)} disabled={disabled}
                    style={{
                      padding: '7px 2px', textAlign: 'center', border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
                      fontWeight: isSelected ? 800 : 500, fontSize: 13,
                      background: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: disabled ? 'var(--text-muted)' : isSelected ? '#fff' : 'var(--text-primary)',
                      opacity: disabled ? 0.4 : 1,
                      transition: 'background .1s',
                    }}>
                    {day}
                  </button>
                );
              })}
            </div>

            {error && <div style={{ marginTop: 14, color: '#E84C3D', fontSize: 13, fontWeight: 600 }}>{error}</div>}

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Cancel</button>
              <button onClick={handleBook} disabled={!selected || loading} style={{ flex: 1, padding: '12px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: (!selected || loading) ? 'not-allowed' : 'pointer', opacity: (!selected || loading) ? 0.6 : 1 }}>
                {loading ? 'Booking…' : selected ? `Book ${selected.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}` : 'Select a date'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
