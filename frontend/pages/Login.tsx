import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [ready,    setReady]    = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const params    = new URLSearchParams(location.search);
  const returnTo  = params.get('returnTo')  || '/dashboard';
  const listingId = params.get('listingId') || '';
  const reason    = params.get('reason')    || '';

  const reasonLabel: Record<string, string> = {
    contact: 'contact the agent',
    inspect: 'book an inspection',
    call:    'start a live call',
  };

  React.useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(email, password, remember);
    if (res.success) {
      navigate(returnTo, {
        replace: true,
        state: listingId ? { openListingId: listingId } : undefined,
      });
    } else {
      setError(res.message || 'Incorrect email or password');
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 44px',
    background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.14)',
    borderRadius: '16px', color: '#fff',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
  };
  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.42)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(255,255,255,0.06)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.14)';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 20% 15%, rgba(30,58,138,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 80% 80%, rgba(15,23,42,0.9) 0%, transparent 60%),
          #050D1E
        `,
      }}>

      {/* Ambient glows */}
      <div className="fixed pointer-events-none" style={{ width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', top: '-140px', left: '-140px', filter: 'blur(60px)' }} />
      <div className="fixed pointer-events-none" style={{ width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', bottom: '-100px', right: '-100px', filter: 'blur(60px)' }} />

      {/* Card */}
      <div className="w-full relative z-10" style={{
        maxWidth: '400px',
        opacity:   ready ? 1 : 0,
        transform: ready ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'opacity 0.4s cubic-bezier(0.34,1.26,0.64,1), transform 0.4s cubic-bezier(0.34,1.26,0.64,1)',
      }}>

        {/* Glass surface */}
        <div style={{
          background:           'rgba(255,255,255,0.08)',
          backdropFilter:       'blur(60px) saturate(180%)',
          WebkitBackdropFilter: 'blur(60px) saturate(180%)',
          border:               '1px solid rgba(255,255,255,0.16)',
          borderRadius:         '32px',
          boxShadow:            '0 1px 0 rgba(255,255,255,0.22) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 40px 100px rgba(0,0,0,0.55)',
          padding:              '40px 32px 36px',
          position:             'relative', overflow: 'hidden',
        }}>
          {/* Shimmer */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)', borderRadius: '32px' }} />

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo showText size={30} lightOverride />
          </div>

          {/* Context hint from listing gate */}
          {reason && reasonLabel[reason] && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-6"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <ShieldCheck size={13} style={{ color: '#93C5FD', flexShrink: 0 }} />
              <p className="text-[11px] font-semibold" style={{ color: '#BFDBFE' }}>
                Sign in to {reasonLabel[reason]} for this property
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-5"
              style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#F87171' }} />
              <p className="text-[12px] font-semibold" style={{ color: '#FCA5A5' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="Email address"
                style={inp} onFocus={focus} onBlur={blur} />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="Password"
                style={{ ...inp, paddingRight: '44px' }} onFocus={focus} onBlur={blur} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setRemember(v => !v)}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                  style={{
                    background: remember ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                    border: `1.5px solid ${remember ? '#3B82F6' : 'rgba(255,255,255,0.2)'}`,
                    cursor: 'pointer',
                  }}>
                  {remember && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Remember me
                </span>
              </label>
              <Link to={`/forgot-password${listingId ? `?returnTo=${encodeURIComponent(returnTo)}&listingId=${listingId}` : ''}`}
                className="text-[12px] font-bold"
                style={{ color: 'rgba(147,197,253,0.85)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-[14px] rounded-2xl font-black text-sm text-white mt-1 transition-all"
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.45), 0 1px 0 rgba(255,255,255,0.18) inset',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Bottom links */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <p className="text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
            No account?{' '}
            <Link to={`/register${listingId ? `?returnTo=${encodeURIComponent(returnTo)}&listingId=${listingId}` : ''}`}
              className="font-black" style={{ color: '#93C5FD', textDecoration: 'none' }}>
              Create one →
            </Link>
            {' '}·{' '}
            <Link to="/pricing" className="font-bold" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              See plans
            </Link>
          </p>
        </div>

        {/* Escape hatch */}
        <div className="text-center mt-4">
          <button onClick={() => navigate('/dashboard')}
            className="text-[11px] font-bold transition-all"
            style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)'}>
            ← Continue browsing without signing in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
