import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NinVerificationModal({ onClose, onSuccess }: Props) {
  const { refreshUser } = useAuth();
  const [nin, setNin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const cleanNin = nin.trim();
    if (!/^\d{11}$/.test(cleanNin)) {
      setError('Please enter a valid 11-digit NIN (numbers only).');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/auth/me', { nin: cleanNin });
      await refreshUser();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to verify NIN. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-overlay)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '32px 28px',
          borderRadius: 24,
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(27,79,216,0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              🛡️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>NIN Verification Required</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Agent Identity Verification</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--glass-bg-subtle)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
          National Identity Number (NIN) verification is required before listing properties on Verifind to protect tenants and maintain platform trust.
        </p>

        {error && (
          <div style={{ background: 'rgba(232,76,61,.12)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              National Identity Number (NIN) *
            </label>
            <input
              type="text"
              value={nin}
              onChange={e => setNin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 11-digit NIN"
              maxLength={11}
              required
              autoFocus
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 16,
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', background: 'var(--glass-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || nin.length !== 11}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                cursor: loading || nin.length !== 11 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                opacity: loading || nin.length !== 11 ? 0.6 : 1,
              }}
            >
              {loading ? 'Verifying…' : 'Submit & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
