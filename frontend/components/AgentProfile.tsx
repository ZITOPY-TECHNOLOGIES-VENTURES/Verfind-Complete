import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function AgentProfile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/api/auth/me', { username, businessName, phone });
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setUsername(user!.username || '');
    setBusinessName(user!.businessName || '');
    setPhone(user!.phone || '');
    setEditing(false);
    setError('');
  }

  const kyc = user.isKycVerified;

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 26, flexShrink: 0 }}>
          {(user.businessName || user.username || 'A')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)' }}>{user.businessName || user.username}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
        <span style={{
          background: kyc ? '#dcfce7' : '#fef3c7', color: kyc ? '#166534' : '#92400e',
          borderRadius: 99, fontSize: 12, padding: '4px 12px', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {kyc ? 'KYC Verified' : 'KYC Pending'}
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#E84C3D', fontSize: 14 }}>{error}</div>
      )}
      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#166534', fontSize: 14, fontWeight: 600 }}>{success}</div>
      )}

      {!editing ? (
        <div className="glass-card" style={{ borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Field label="Full name" value={user.username} />
          <Field label="Business name" value={user.businessName || '—'} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone || '—'} />
          <Field label="NIN" value={user.nin || '—'} />
          <Field label="KYC status" value={kyc ? 'Verified' : 'Pending review'} />
          {user.createdAt && <Field label="Member since" value={new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} last />}
          <button onClick={() => { setEditing(true); setSuccess(''); }} style={{ marginTop: 18, alignSelf: 'flex-start', padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="glass-card" style={{ borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full name</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Business name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your business / agency name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="080..." />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Your email and NIN can't be changed here. Contact support if they need updating.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={cancelEdit} style={{ flex: 1, padding: '12px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: last ? 'none' : '1px solid var(--border-color)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
