import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { PROPERTY_TYPE_LABELS, type Property, type PropertyType } from '../types';

type Tab = 'agents' | 'properties';

interface Agent {
  id: string;
  username: string;
  email: string;
  phone?: string;
  businessName?: string;
  isKycVerified: boolean;
  nin?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, pRes] = await Promise.all([
        api.get<{ agents: Agent[] }>('/api/admin/agents'),
        api.get<{ properties: Property[] }>('/api/admin/properties'),
      ]);
      setAgents(aRes.agents);
      setProperties(pRes.properties);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleKyc(agentId: string, approved: boolean) {
    try {
      await api.put(`/api/admin/agents/${agentId}/kyc`, { approved });
      loadData();
    } catch (err: any) { alert(err.message); }
  }

  async function handleVerify(propertyId: string, verified: boolean) {
    try {
      await api.put(`/api/admin/properties/${propertyId}/verify`, { verified });
      loadData();
    } catch (err: any) { alert(err.message); }
  }

  const pendingKyc = agents.filter(a => !a.isKycVerified).length;
  const pendingVerify = properties.filter(p => !p.isVerified).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', marginRight: 'auto' }}>
            <span style={{ color: '#1B3068' }}>Veri</span><span style={{ color: '#2D8B1E' }}>find</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</span>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{user?.username}</span>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button onClick={logout} style={{ fontSize: 13, background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 9, padding: '6px 13px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}>Sign out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Agents', value: agents.length, color: 'var(--color-primary)' },
            { label: 'Pending KYC', value: pendingKyc, color: '#f59e0b' },
            { label: 'Total Listings', value: properties.length, color: '#8b5cf6' },
            { label: 'Pending Verify', value: pendingVerify, color: '#E84C3D' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '18px 16px', borderRadius: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1.5px solid var(--border-color)' }}>
          {([['agents', 'Agents & KYC'], ['properties', 'Properties']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, marginBottom: -1.5,
              color: tab === t ? 'var(--color-primary)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
          <>
            {/* Agents tab */}
            {tab === 'agents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agents.length === 0 && <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No agents yet</p>}
                {agents.map(a => (
                  <div key={a.id} className="glass-card" style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{a.businessName || a.username}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{a.email} · {a.phone || 'No phone'}</div>
                      {a.nin && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>NIN: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.nin}</span></div>}
                      <div style={{ marginTop: 8 }}>
                        <KycBadge verified={a.isKycVerified} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {!a.isKycVerified ? (
                        <button onClick={() => handleKyc(a.id, true)} style={{ padding: '7px 14px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                          Approve KYC
                        </button>
                      ) : (
                        <button onClick={() => handleKyc(a.id, false)} style={{ padding: '7px 14px', background: 'rgba(232,76,61,.1)', border: '1.5px solid rgba(232,76,61,.25)', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#E84C3D' }}>
                          Revoke KYC
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Properties tab */}
            {tab === 'properties' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {properties.length === 0 && <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No properties yet</p>}
                {properties.map(p => (
                  <div key={p.id} className="glass-card" style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    {p.images[0] && <img src={p.images[0]} alt="" style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {PROPERTY_TYPE_LABELS[p.type as PropertyType]} · {p.district} · ₦{p.baseRent.toLocaleString()}/yr
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <KycBadge verified={p.isVerified} label="Verified" />
                        <span style={{ fontSize: 11, background: 'var(--glass-bg-subtle)', color: 'var(--text-secondary)', borderRadius: 99, padding: '2px 9px', fontWeight: 600 }}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {!p.isVerified ? (
                        <button onClick={() => handleVerify(p.id, true)} style={{ padding: '7px 14px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                          Verify
                        </button>
                      ) : (
                        <button onClick={() => handleVerify(p.id, false)} style={{ padding: '7px 14px', background: 'rgba(232,76,61,.1)', border: '1.5px solid rgba(232,76,61,.25)', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#E84C3D' }}>
                          Unverify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KycBadge({ verified, label = 'KYC' }: { verified: boolean; label?: string }) {
  return (
    <span style={{ borderRadius: 99, fontSize: 11, padding: '2px 9px', fontWeight: 700, background: verified ? '#dcfce7' : '#fee2e2', color: verified ? '#166534' : '#991b1b' }}>
      {verified ? `✓ ${label} Approved` : `✗ ${label} Pending`}
    </span>
  );
}

