import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PropertyDetail from '../components/PropertyDetail';
import PaymentModal from '../components/PaymentModal';
import { type Property } from '../types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<{ property: Property }>(`/api/properties/${id}`)
      .then(res => setProperty(res.property))
      .catch(err => setError(err.message || 'Failed to load property details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div className="animate-spin" style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)' }} />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader />
        <div style={{ flex: 1, maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>Property Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The property listing you are looking for is no longer available or does not exist.</p>
          <Link to="/properties" style={{ padding: '12px 24px', background: 'var(--color-primary)', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            ← View All Properties
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />

      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '24px 20px', flex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => navigate('/properties')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0 }}
          >
            ← Back to All Properties
          </button>
        </div>

        <PropertyDetail
          property={property}
          onClose={() => navigate('/properties')}
          onPay={() => {
            if (!user) {
              navigate(`/login?redirect=${encodeURIComponent(`/properties/${property.id}`)}`);
              return;
            }
            setShowPay(true);
          }}
        />
      </div>

      {showPay && (
        <PaymentModal
          property={property}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            navigate('/dashboard');
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
}
