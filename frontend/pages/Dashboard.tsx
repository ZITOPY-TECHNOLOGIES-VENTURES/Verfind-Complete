import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import PropertyDetail from '../components/PropertyDetail';
import PaymentModal from '../components/PaymentModal';
import TenantProfile from '../components/TenantProfile';
import TenantBookings from '../components/TenantBookings';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';
import { ABUJA_DISTRICTS, PROPERTY_TYPE_LABELS, type Property, type PropertyType, type PropertyFilters, DEFAULT_FILTERS } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilters>({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    district: searchParams.get('district') || '',
  });
  const [selected, setSelected] = useState<Property | null>(null);
  const [payProp, setPayProp] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const [addressInput, setAddressInput] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);

  // Feature 8: Tenant Property Request state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqLoc, setReqLoc] = useState('');
  const [reqBudget, setReqBudget] = useState('');
  const [reqType, setReqType] = useState<PropertyType>('Self_contain');
  const [reqNotes, setReqNotes] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSuccess, setReqSuccess] = useState('');
  const [reqError, setReqError] = useState('');

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.district) params.set('district', filters.district);
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);
      if (filters.minRent) params.set('minRent', filters.minRent);
      if (filters.maxRent) params.set('maxRent', filters.maxRent);
      const res = await api.get<{ properties: Property[]; total: number }>(`/api/properties?${params}`);
      setProperties(res.properties);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const loadFavorites = useCallback(async () => {
    if (user?.role !== 'tenant') return;
    setFavLoading(true);
    try {
      const res = await api.get<{ favorites: Property[] }>('/api/favorites');
      setFavorites(res.favorites);
      setFavIds(new Set(res.favorites.map((p: Property) => p.id)));
    } catch (err) { console.error(err); }
    finally { setFavLoading(false); }
  }, [user]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  async function toggleFavorite(propertyId: string) {
    const isFav = favIds.has(propertyId);
    setFavIds(prev => {
      const next = new Set(prev);
      isFav ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });
    try {
      if (isFav) {
        await api.delete(`/api/favorites/${propertyId}`);
        setFavorites(f => f.filter(p => p.id !== propertyId));
      } else {
        await api.post(`/api/favorites/${propertyId}`, {});
      }
    } catch (err) {
      setFavIds(prev => {
        const next = new Set(prev);
        isFav ? next.add(propertyId) : next.delete(propertyId);
        return next;
      });
    }
  }

  async function saveAddress() {
    if (!addressInput.trim()) return;
    setAddressSaving(true);
    try {
      await api.put('/api/auth/me', { currentAddress: addressInput.trim() });
      await refreshUser();
    } catch (err) { console.error(err); }
    finally { setAddressSaving(false); }
  }

  async function handlePropertyRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReqError('');
    setReqSuccess('');
    if (!reqLoc || !reqBudget) {
      setReqError('Preferred location and budget are required.');
      return;
    }
    setReqLoading(true);
    try {
      await api.post('/api/requests', {
        preferredLocation: reqLoc,
        budget: reqBudget.replace(/,/g, ''),
        propertyType: reqType,
        notes: reqNotes,
      });
      setReqSuccess('Property request submitted successfully! Verified agents will be notified.');
      setReqLoc(''); setReqBudget(''); setReqNotes('');
      setTimeout(() => { setShowRequestModal(false); setReqSuccess(''); }, 2500);
    } catch (err: any) {
      setReqError(err.message || 'Failed to submit request.');
    } finally {
      setReqLoading(false);
    }
  }

  function setFilter(key: keyof PropertyFilters, value: string) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 88, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} aria-label="Go to homepage" style={{ marginRight: 'auto', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <img src="/verifind-logo.png" alt="Verifind" style={{ height: 80, width: 'auto' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/properties')} style={{ padding: '8px 16px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>
              🌐 View All Properties
            </button>
            <ThemeToggle size={38} />
            <UserMenu items={[{ label: 'My Profile', icon: '👤', onClick: () => setShowProfile(true) }]} />
          </div>
        </div>
      </header>

      {/* Browse hero banner */}
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1B3068 0%, #0E3A6E 50%, #095D50 100%)', padding: '36px 24px 32px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,31,61,0.6) 0%, rgba(10,31,61,0.1) 100%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 400, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Browse verified properties
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.68)', margin: 0 }}>
            {total > 0 ? `${total} listing${total === 1 ? '' : 's'} across Abuja FCT` : 'Find your next home in Abuja'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '20px' }}>
        {/* Profile completion banner */}
        {user?.role === 'tenant' && !user?.currentAddress && (
          <div style={{ background: '#fefce8', border: '1.5px solid #fde047', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#854d0e', flex: 1, minWidth: 200 }}>
              📋 Add your current address to unlock payments
            </span>
            <input
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              placeholder="Your current residential address"
              style={{ flex: '2 1 240px', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #fde047', fontSize: 14, background: '#fff' }}
              onKeyDown={e => e.key === 'Enter' && saveAddress()}
            />
            <button onClick={saveAddress} disabled={addressSaving || !addressInput.trim()} style={{ padding: '9px 16px', background: '#854d0e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: addressSaving ? 0.7 : 1, whiteSpace: 'nowrap' }}>
              {addressSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}

        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search properties…"
            style={{ flex: 1, minWidth: 200 }}
            onKeyDown={e => e.key === 'Enter' && loadProperties()}
            disabled={showSaved || showBookings}
          />
          {user?.role === 'tenant' && (
            <>
              <button onClick={() => { setShowBookings(false); setShowSaved(s => { if (!s) loadFavorites(); return !s; }); }} style={{ padding: '11px 16px', background: showSaved ? 'var(--color-primary)' : 'var(--glass-bg)', border: '1.5px solid var(--border-color)', borderRadius: 14, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: showSaved ? '#fff' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                ♡ Saved {favIds.size > 0 && `(${favIds.size})`}
              </button>
              <button onClick={() => { setShowSaved(false); setShowBookings(b => !b); }} style={{ padding: '11px 16px', background: showBookings ? 'var(--color-primary)' : 'var(--glass-bg)', border: '1.5px solid var(--border-color)', borderRadius: 14, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: showBookings ? '#fff' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                📅 My Bookings
              </button>
              {/* Feature 8: Tenant Property Request Button */}
              <button onClick={() => setShowRequestModal(true)} style={{ padding: '11px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                📌 Request Property
              </button>
            </>
          )}
          <button onClick={() => setShowFilters(f => !f)} disabled={showSaved || showBookings} style={{ padding: '11px 16px', background: 'var(--glass-bg)', border: '1.5px solid var(--border-color)', borderRadius: 14, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', opacity: (showSaved || showBookings) ? 0.5 : 1 }}>
            Filters {showFilters ? '▲' : '▼'}
          </button>
          <button onClick={loadProperties} disabled={showSaved || showBookings} style={{ padding: '11px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', opacity: (showSaved || showBookings) ? 0.5 : 1 }}>
            Search
          </button>
        </div>

        {showFilters && (
          <div className="glass-card" style={{ padding: '20px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <select value={filters.district} onChange={e => setFilter('district', e.target.value)} style={{ flex: '1 1 160px' }}>
              <option value="">All Districts</option>
              {ABUJA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.type} onChange={e => setFilter('type', e.target.value as PropertyType | '')} style={{ flex: '1 1 160px' }}>
              <option value="">All Types</option>
              {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(t => (
                <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <select value={filters.status} onChange={e => setFilter('status', e.target.value)} style={{ flex: '1 1 140px' }}>
              <option value="">Any Status</option>
              <option value="available">Available</option>
              <option value="under_offer">Under Offer</option>
              <option value="rented">Rented</option>
            </select>
            <input value={filters.minRent} onChange={e => setFilter('minRent', e.target.value)} placeholder="Min rent (₦)" type="number" style={{ flex: '1 1 130px' }} />
            <input value={filters.maxRent} onChange={e => setFilter('maxRent', e.target.value)} placeholder="Max rent (₦)" type="number" style={{ flex: '1 1 130px' }} />
            <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Clear
            </button>
          </div>
        )}

        {/* Results header */}
        {!showSaved && !showBookings && (
          <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
            {loading ? 'Loading…' : `${total} propert${total === 1 ? 'y' : 'ies'} found`}
            {filters.district && ` in ${filters.district}`}
          </div>
        )}
        {showSaved && (
          <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
            {favLoading ? 'Loading…' : `${favorites.length} saved propert${favorites.length === 1 ? 'y' : 'ies'}`}
          </div>
        )}
        {showBookings && (
          <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>
            My inspection bookings
          </div>
        )}

        {/* Property grid */}
        {showBookings ? (
          <TenantBookings />
        ) : showSaved ? (
          favLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card" style={{ height: 280, background: 'var(--glass-bg)', animation: 'shimmer-sweep 1.5s infinite', backgroundSize: '200% 100%' }} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
              <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-secondary)' }}>No saved properties yet</p>
              <p>Tap the heart on any listing to save it here</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {favorites.map(p => (
                <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} onFavorite={toggleFavorite} isFavorited={favIds.has(p.id)} />
              ))}
            </div>
          )
        ) : loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card" style={{ height: 280, background: 'var(--glass-bg)', animation: 'shimmer-sweep 1.5s infinite', backgroundSize: '200% 100%' }} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-secondary)' }}>No properties found</p>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} onFavorite={user?.role === 'tenant' ? toggleFavorite : undefined} isFavorited={favIds.has(p.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Feature 8: Tenant Property Request Modal */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowRequestModal(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: '30px 26px', borderRadius: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>📌 Submit Property Request</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
              Can't find what you're looking for? Let verified Abuja agents know your criteria.
            </p>

            {reqError && <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, color: '#E84C3D', fontSize: 13 }}>{reqError}</div>}
            {reqSuccess && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '10px 14px', marginBottom: 14, color: '#166534', fontSize: 13, fontWeight: 600 }}>{reqSuccess}</div>}

            <form onSubmit={handlePropertyRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Preferred Location / District *</label>
                <select value={reqLoc} onChange={e => setReqLoc(e.target.value)} required>
                  <option value="">Select location</option>
                  {ABUJA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Maximum Budget (₦/yr) *</label>
                <input value={reqBudget} onChange={e => setReqBudget(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 1,500,000" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Property Type *</label>
                <select value={reqType} onChange={e => setReqType(e.target.value as PropertyType)} required>
                  {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(t => (
                    <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Additional Notes / Requirements</label>
                <textarea value={reqNotes} onChange={e => setReqNotes(e.target.value)} rows={3} placeholder="e.g. Needs balcony, upper floor, reliable water supply..." />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowRequestModal(false)} style={{ flex: 1, padding: '12px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit" disabled={reqLoading} style={{ flex: 1, padding: '12px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, opacity: reqLoading ? 0.7 : 1 }}>
                  {reqLoading ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property detail modal */}
      {selected && (
        <PropertyDetail
          property={selected}
          onClose={() => setSelected(null)}
          onPay={() => { setPayProp(selected); setSelected(null); }}
        />
      )}

      {/* Payment modal */}
      {payProp && (
        <PaymentModal
          property={payProp}
          onClose={() => setPayProp(null)}
          onSuccess={() => { setPayProp(null); loadProperties(); }}
        />
      )}

      {/* Profile modal */}
      {showProfile && <TenantProfile onClose={() => setShowProfile(false)} />}
    </div>
  );
}
