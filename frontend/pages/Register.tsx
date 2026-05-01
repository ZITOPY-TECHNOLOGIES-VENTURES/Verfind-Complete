import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

type Step = 'form' | 'otp' | 'done';
type Role = 'tenant' | 'agent';

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const RESEND_SECONDS = 60;

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('form');
  const [role, setRole] = useState<Role>((searchParams.get('role') as Role) || 'tenant');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [nin, setNin] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startResendTimer() {
    setResendCountdown(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendCountdown(s => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', {
        username: role === 'agent' && businessName ? businessName : username,
        email, password, role,
        phone: phone || undefined,
        nin: nin || undefined,
      });
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: any }>('/api/auth/verify-email', { email, otp });
      localStorage.setItem('verifind_token', res.token);
      navigate(role === 'agent' ? '/agent' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', { username, email, password, role, phone: phone || undefined, nin: nin || undefined });
      startResendTimer();
    } catch (err: any) {
      setError(err.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  }

  const pwFieldStyle: React.CSSProperties = { position: 'relative' };
  const eyeBtnStyle: React.CSSProperties = {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-page)' }}>
      <div className="liquid-bg-container">
        <div className="liquid-blob" style={{ width: 450, height: 450, top: '-120px', right: '-100px', background: 'var(--bubble-1)' }} />
        <div className="liquid-blob" style={{ width: 350, height: 350, bottom: '-80px', left: '-80px', background: 'var(--bubble-2)', animationDelay: '1.8s' }} />
      </div>

      <div className="glass-card zoom-in-95" style={{ width: '100%', maxWidth: 460, padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#1B3068' }}>Veri</span><span style={{ color: '#2D8B1E' }}>find</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
            {step === 'form' ? 'Create your account' : `Enter the code sent to ${email}`}
          </p>
        </div>

        {step === 'form' && (
          <div style={{ display: 'flex', background: 'var(--bg-surface-alt)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['tenant', 'agent'] as Role[]).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: 9, cursor: 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all .15s',
                background: role === r ? 'var(--glass-bg-strong)' : 'transparent',
                color: role === r ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: role === r ? 'var(--shadow-xs)' : 'none',
              }}>
                {r === 'tenant' ? '🏠 Tenant' : '🏢 Agent'}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(232,76,61,.1)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 18, color: '#E84C3D', fontSize: 14 }}>
            {error}
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {role === 'agent' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Full Name *</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your full name" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Business Name <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your agency / business name" />
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Full Name *</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your full name" required />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
            </div>
            {role === 'agent' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>NIN <span style={{ color: 'var(--text-muted)' }}>(for KYC)</span></label>
                <input value={nin} onChange={e => setNin(e.target.value)} placeholder="11-digit NIN" maxLength={11} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Password *</label>
              <div style={pwFieldStyle}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} style={{ paddingRight: 40 }} />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowPass(v => !v)}><EyeIcon open={showPass} /></button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Confirm Password *</label>
              <div style={pwFieldStyle}>
                <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required style={{ paddingRight: 40 }} />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowConfirm(v => !v)}><EyeIcon open={showConfirm} /></button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 6, padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending code…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>6-digit verification code</label>
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" maxLength={6} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }} required />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} style={{ padding: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
            <button type="button" onClick={resendOtp} disabled={loading || resendCountdown > 0} style={{ background: 'none', border: 'none', color: resendCountdown > 0 ? 'var(--text-muted)' : 'var(--color-primary)', fontWeight: 600, cursor: resendCountdown > 0 ? 'default' : 'pointer', fontSize: 14 }}>
              {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
