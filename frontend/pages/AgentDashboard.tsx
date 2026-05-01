import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import AgentBankSetup from '../components/AgentBankSetup';
import { ABUJA_DISTRICTS, PROPERTY_TYPE_LABELS, type Property, type Booking, type PropertyType } from '../types';

type Tab = 'listings' | 'bookings' | 'bank';

const EMPTY_FORM = {
  title: '', description: '', district: '', address: '',
  type: 'Self_contain' as PropertyType,
  baseRent: '', serviceCharge: '', cautionFee: '', agencyFee: '', legalFee: '',
  videoUrl: '', images: '',
  bedrooms: '', bathrooms: '', sqm: '',
  furnished: false, parking: false, listingMode: 'Rent',
};

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [percents, setPercents] = useState({ serviceCharge: '', cautionFee: '', agencyFee: '', legalFee: '' });

  function fmtMoney(val: string) {
    const n = val.replace(/,/g, '');
    if (!n || isNaN(Number(n))) return val;
    return Number(n).toLocaleString();
  }
  function calcPct(base: string, pct: string) {
    const b = Number(base.replace(/,/g, '')); const p = Number(pct);
    return b && p ? String(Math.round(b * p / 100)) : '';
  }
  function backCalcPct(base: number, fee: number) {
    return base ? String(Math.round(fee / base * 1000) / 10) : '';
  }
  function onBaseRentChange(val: string) {
    const digits = val.replace(/,/g, '').replace(/\D/g, '');
    setForm(f => ({
      ...f, baseRent: digits,
      serviceCharge: calcPct(digits, percents.serviceCharge),
      cautionFee: calcPct(digits, percents.cautionFee),
      agencyFee: calcPct(digits, percents.agencyFee),
      legalFee: calcPct(digits, percents.legalFee),
    }));
  }
  function onPctChange(key: keyof typeof percents, pct: string) {
    setPercents(p => ({ ...p, [key]: pct }));
    setForm(f => ({ ...f, [key]: calcPct(f.baseRent, pct) }));
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, bRes] = await Promise.all([
        api.get<{ properties: Property[] }>(`/api/properties?agentId=${user!.id}`),
        api.get<{ bookings: Booking[] }>('/api/bookings'),
      ]);
      setProperties(pRes.properties);
      setBookings(bRes.bookings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setPercents({ serviceCharge: '', cautionFee: '', agencyFee: '', legalFee: '' });
    setEditProp(null); setShowForm(true); setFormError('');
  }
  function openEdit(p: Property) {
    setPercents({
      serviceCharge: backCalcPct(p.baseRent, p.serviceCharge),
      cautionFee: backCalcPct(p.baseRent, p.cautionFee),
      agencyFee: backCalcPct(p.baseRent, p.agencyFee || 0),
      legalFee: backCalcPct(p.baseRent, p.legalFee || 0),
    });
    setForm({
      title: p.title, description: p.description || '', district: p.district, address: p.address || '',
      type: p.type, baseRent: String(p.baseRent), serviceCharge: String(p.serviceCharge),
      cautionFee: String(p.cautionFee), agencyFee: String(p.agencyFee || ''),
      legalFee: String(p.legalFee || ''), videoUrl: p.videoUrl,
      images: p.images.join(','), bedrooms: String(p.bedrooms || ''), bathrooms: String(p.bathrooms || ''),
      sqm: String(p.sqm || ''), furnished: p.furnished, parking: p.parking, listingMode: p.listingMode,
    });
    setEditProp(p); setShowForm(true); setFormError('');
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.videoUrl) { setFormError('A video walkthrough is required'); return; }
    setFormLoading(true);
    try {
      const body = {
        ...form,
        baseRent: form.baseRent.replace(/,/g, ''),
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (editProp) {
        await api.put(`/api/properties/${editProp.id}`, body);
      } else {
        await api.post('/api/properties', body);
      }
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save listing');
    } finally {
      setFormLoading(false);
    }
  }

  async function deleteProp(id: string) {
    if (!confirm('Delete this listing?')) return;
    try { await api.delete(`/api/properties/${id}`); loadData(); }
    catch (err: any) { alert(err.message); }
  }

  async function handleBookingAction(id: string, status: string, proposedDate?: string) {
    try {
      await api.put(`/api/bookings/${id}`, { status, proposedDate });
      loadData();
    } catch (err: any) { alert(err.message); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', marginRight: 'auto' }}>
            <span style={{ color: '#1B3068' }}>Ver</span><span style={{ color: '#2D8B1E' }}>Find</span>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {user?.businessName || user?.username}
          </span>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button onClick={logout} style={{ fontSize: 13, background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 9, padding: '6px 13px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}>Sign out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1.5px solid var(--border-color)', paddingBottom: 0 }}>
          {([['listings', 'My Listings'], ['bookings', 'Booking Requests'], ['bank', 'Bank Setup']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, color: tab === t ? 'var(--color-primary)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
              marginBottom: -1.5,
            }}>
              {label}
              {t === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--color-accent)', color: '#fff', borderRadius: 99, fontSize: 11, padding: '1px 6px', fontWeight: 800 }}>
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Listings tab */}
        {tab === 'listings' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={openCreate} style={{ padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                + New Listing
              </button>
            </div>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
              properties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                  <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No listings yet</p>
                  <p style={{ fontSize: 14 }}>Create your first listing above</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {properties.map(p => (
                    <div key={p.id} className="glass-card" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start', borderRadius: 18 }}>
                      {p.images[0] && <img src={p.images[0]} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          {PROPERTY_TYPE_LABELS[p.type]} · {p.district} · ₦{p.baseRent.toLocaleString()}/yr
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <StatusBadge status={p.status} />
                          {p.isVerified && <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 99, fontSize: 11, padding: '2px 9px', fontWeight: 700 }}>Verified</span>}
                          {p.isFeatured && <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 99, fontSize: 11, padding: '2px 9px', fontWeight: 700 }}>Featured</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => openEdit(p)} style={{ padding: '7px 14px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Edit</button>
                        <button onClick={() => deleteProp(p.id)} style={{ padding: '7px 14px', background: 'rgba(232,76,61,.1)', border: '1.5px solid rgba(232,76,61,.25)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#E84C3D' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No booking requests yet</p>
            ) : bookings.map(b => (
              <div key={b.id} className="glass-card" style={{ padding: 18, borderRadius: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.propertyTitle}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  From: {b.tenantName} · Requested: {new Date(b.requestedDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <StatusBadge status={b.status} />
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handleBookingAction(b.id, 'accepted')} style={{ padding: '6px 14px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Accept</button>
                      <button onClick={() => {
                        const d = prompt('Propose a new date (YYYY-MM-DD):');
                        if (d) handleBookingAction(b.id, 'rescheduled', d);
                      }} style={{ padding: '6px 14px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        Reschedule
                      </button>
                      <button onClick={() => handleBookingAction(b.id, 'cancelled')} style={{ padding: '6px 14px', background: 'rgba(232,76,61,.1)', border: '1.5px solid rgba(232,76,61,.25)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#E84C3D' }}>Cancel</button>
                    </>
                  )}
                  {b.agentNote && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Note: {b.agentNote}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'bank' && <AgentBankSetup />}
      </div>

      {/* Listing form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: '32px 28px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 20px', color: 'var(--text-primary)' }}>
              {editProp ? 'Edit Listing' : 'New Listing'}
            </h2>
            {formError && <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#E84C3D', fontSize: 14 }}>{formError}</div>}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormRow label="Title *"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></FormRow>
              <FormRow label="District *">
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} required>
                  <option value="">Select district</option>
                  {ABUJA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormRow>
              <FormRow label="Address"><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street / estate name" /></FormRow>
              <FormRow label="Property Type *">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PropertyType }))} required>
                  {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(t => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
                </select>
              </FormRow>
              <FormRow label="Base Rent (₦/yr) *">
                <input value={fmtMoney(form.baseRent)} onChange={e => onBaseRentChange(e.target.value)} placeholder="e.g. 500,000" required />
              </FormRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(['serviceCharge', 'cautionFee', 'agencyFee', 'legalFee'] as const).map(key => {
                  const labels = { serviceCharge: 'Service Charge', cautionFee: 'Caution Fee', agencyFee: 'Agency Fee', legalFee: 'Legal Fee' };
                  const base = Number(form.baseRent.replace(/,/g, ''));
                  const amt = base && percents[key] ? Math.round(base * Number(percents[key]) / 100) : 0;
                  return (
                    <FormRow key={key} label={labels[key]}>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={percents[key]} onChange={e => onPctChange(key, e.target.value)} placeholder="0" min="0" max="100" step="0.1" style={{ paddingRight: 28 }} />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>%</span>
                      </div>
                      {amt > 0 && <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 3, fontWeight: 600 }}>= ₦{amt.toLocaleString()}</div>}
                    </FormRow>
                  );
                })}
              </div>
              <FormRow label="Video Walkthrough URL *">
                <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="YouTube, Vimeo or direct URL" required />
              </FormRow>
              <FormRow label="Image URLs (comma-separated)"><input value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://..., https://..." /></FormRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormRow label="Bedrooms"><input type="number" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} /></FormRow>
                <FormRow label="Bathrooms"><input type="number" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} /></FormRow>
                <FormRow label="Size (sqm)"><input type="number" value={form.sqm} onChange={e => setForm(f => ({ ...f, sqm: e.target.value }))} /></FormRow>
              </div>
              <FormRow label="Description"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the property…" /></FormRow>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.furnished} onChange={e => setForm(f => ({ ...f, furnished: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--color-primary)' }} />
                  Furnished
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.parking} onChange={e => setForm(f => ({ ...f, parking: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--color-primary)' }} />
                  Parking
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit" disabled={formLoading} style={{ flex: 1, padding: '12px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, opacity: formLoading ? 0.7 : 1 }}>
                  {formLoading ? 'Saving…' : (editProp ? 'Save Changes' : 'Create Listing')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    available: { bg: '#dcfce7', color: '#166534' },
    under_offer: { bg: '#fef3c7', color: '#92400e' },
    rented: { bg: '#e0e7ff', color: '#3730a3' },
    pending: { bg: '#fef3c7', color: '#92400e' },
    accepted: { bg: '#dcfce7', color: '#166534' },
    rescheduled: { bg: '#e0e7ff', color: '#3730a3' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
  };
  const s = styles[status] || { bg: 'var(--glass-bg-subtle)', color: 'var(--text-secondary)' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 99, fontSize: 11, padding: '2px 9px', fontWeight: 700, textTransform: 'capitalize' }}>
      {status.replace('_', ' ')}
    </span>
  );
}
