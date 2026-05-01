import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import PropertyDetail from '../components/PropertyDetail';
import PaymentModal from '../components/PaymentModal';
import { ABUJA_DISTRICTS, PROPERTY_TYPE_LABELS, type Property, type PropertyType, type PropertyFilters, DEFAULT_FILTERS } from '../types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  function setFilter(key: keyof PropertyFilters, value: string) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', marginRight: 'auto' }}>
            <span style={{ color: '#1B3068' }}>Ver</span><span style={{ color: '#2D8B1E' }}>Find</span>
          </span>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {user?.username}
          </span>
          <button onClick={logout} style={{ fontSize: 13, background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 9, padding: '6px 13px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '20px' }}>
        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search properties…"
            style={{ flex: 1, minWidth: 200 }}
            onKeyDown={e => e.key === 'Enter' && loadProperties()}
          />
          <button onClick={() => setShowFilters(f => !f)} style={{ padding: '11px 16px', background: 'var(--glass-bg)', border: '1.5px solid var(--border-color)', borderRadius: 14, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Filters {showFilters ? '▲' : '▼'}
          </button>
          <button onClick={loadProperties} style={{ padding: '11px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
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
        <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
          {loading ? 'Loading…' : `${total} propert${total === 1 ? 'y' : 'ies'} found`}
          {filters.district && ` in ${filters.district}`}
        </div>

        {/* Property grid */}
        {loading ? (
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
              <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
