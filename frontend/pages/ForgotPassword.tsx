import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, otp, password });
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  const stepTitles: Record<Step, string> = {
    email: 'Reset your password',
    otp: `Enter the code sent to ${email}`,
    password: 'Set new password',
    done: 'Password updated!',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-page)' }}>
      <div className="liquid-bg-container">
        <div className="liquid-blob" style={{ width: 400, height: 400, top: '-80px', left: '-100px', background: 'var(--bubble-1)' }} />
      </div>

      <div className="glass-card zoom-in-95" style={{ width: '100%', maxWidth: 400, padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#1B3068' }}>Veri</span><span style={{ color: '#2D8B1E' }}>find</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>{stepTitles[step]}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 18, color: '#E84C3D', fontSize: 14 }}>
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            <button type="submit" disabled={loading} style={{ padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={submitOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" maxLength={6} style={{ textAlign: 'center', fontSize: 26, letterSpacing: 8, fontWeight: 700 }} required />
            <button type="submit" disabled={loading || otp.length !== 6} style={{ padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verifying…' : 'Verify code'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={submitPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min. 8 chars)" required minLength={8} />
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" required />
            <button type="submit" disabled={loading} style={{ padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your password has been updated. You can now sign in.</p>
            <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Sign in
            </button>
          </div>
        )}

        {step !== 'done' && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Remember it?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
