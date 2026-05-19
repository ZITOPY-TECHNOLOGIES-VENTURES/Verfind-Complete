import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') navigate('/admin', { replace: true });
      else if (loggedInUser.role === 'agent') navigate('/agent', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const darkInput: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
    color: '#fff', fontSize: 14, outline: 'none',
  };
  const darkLabel: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at 20% 50%, rgba(27,79,216,0.22) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(109,40,217,0.18) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(5,150,105,0.12) 0%, transparent 50%), #060D1F',
    }}>
      <div style={{
        width: '100%', maxWidth: 420, padding: '40px 36px', borderRadius: 24,
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 48px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <img src="/verifind-logo.png" alt="Verifind" style={{ height: 64, width: 'auto' }} />
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 15 }}>Welcome back</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(232,76,61,.12)', border: '1px solid rgba(232,76,61,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, color: '#f87171', fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={darkLabel}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required style={darkInput} />
          </div>
          <div>
            <label style={darkLabel}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...darkInput, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#6ee7b7', textDecoration: 'none', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: 4, padding: '13px', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6ee7b7', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
