import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Props {
  onClose: () => void;
}

export default function TenantProfile({ onClose }: Props) {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentAddress, setCurrentAddress] = useState(user?.currentAddress || '');
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
      await api.put('/api/auth/me', { username, phone, currentAddress });
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
    setPhone(user!.phone || '');
    setCurrentAddress(user!.currentAddress || '');
    setEditing(false);
    setError('');
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', borderRadius: 24, padding: '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <h2 style={{ flex: 1, margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>My Profile</h2>
          <button onClick={onClose} style={{ background: 'var(--glass-bg-subtle)', border: 'none', borderRadius: 99, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: 'var(--text-primary)' }}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>
            {(user.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{user.username}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#E84C3D', fontSize: 14 }}>{error}</div>
        )}
        {success && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#166534', fontSize: 14, fontWeight: 600 }}>{success}</div>
        )}

        {!editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Field label="Full name" value={user.username} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone || '—'} />
            <Field label="Current address" value={user.currentAddress || 'Not set — required for payments'} />
            {user.createdAt && <Field label="Member since" value={new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} last />}
            <button onClick={() => { setEditing(true); setSuccess(''); }} style={{ marginTop: 18, alignSelf: 'flex-start', padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full name</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="080..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Current address</label>
              <input value={currentAddress} onChange={e => setCurrentAddress(e.target.value)} placeholder="Your current residential address" />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Your email can't be changed here. Contact support if it needs updating.
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
