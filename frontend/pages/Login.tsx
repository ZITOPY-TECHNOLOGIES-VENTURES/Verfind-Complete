import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [ready,    setReady]    = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  /* ── Parse return destination from query string ──
     e.g. /login?returnTo=%2Fdashboard&listingId=abc123
  */
  const params      = new URLSearchParams(location.search);
  const returnTo    = params.get('returnTo') || '/dashboard';
  const listingId   = params.get('listingId');
  const reason      = params.get('reason');  // e.g. "contact" | "inspect" | "call"

  const reasonLabel: Record<string, string> = {
    contact: 'contact the agent',
    inspect: 'book an inspection',
    call:    'start a live call',
  };

  useEffect(() => {
    /* Slight delay so the card entrance feels deliberate */
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      /* Build the destination URL — if we have a listingId, pass it as state
         so Dashboard can reopen the property detail straight away */
      navigate(returnTo, {
        replace: true,
        state: listingId ? { openListingId: listingId } : undefined,
      });
    } else {
      setError(result.message || 'Incorrect email or password.');
      setLoading(false);
    }
  };

  /* ── Shared input style (inline so it picks up CSS vars) ── */
  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px 13px 44px',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.14)',
    borderRadius: '16px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.45)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(255,255,255,0.08)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.14)';
    e.target.style.boxShadow   = 'none';
  };

  return (
    /* ── Full-screen ambient backdrop ── */
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{
        /* Layered radial gradients — rich dark navy/ink atmosphere */
        background: `
          radial-gradient(ellipse 80% 60% at 20% 20%, rgba(30,58,138,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 70%, rgba(17,24,39,0.9) 0%, transparent 55%),
          radial-gradient(ellipse 100% 80% at 50% 50%, rgba(10,15,40,1) 0%, transparent 100%)
        `,
        backgroundColor: '#060D1F',
      }}>

      {/* Subtle animated grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize:   '128px 128px',
        }} />

      {/* Soft glow blobs */}
      <div className="absolute pointer-events-none"
        style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', top: '-100px', left: '-100px', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none"
        style={{ width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)', bottom: '-80px', right: '-80px', filter: 'blur(40px)' }} />

      {/* ══════════════════════════════════════
          THE SINGLE GLASS CARD
          iOS 26 liquid glass — frosted, iridescent edge, specular highlight
          ══════════════════════════════════════ */}
      <div
        className="relative w-full"
        style={{
          maxWidth: '400px',
          /* Entrance animation */
          opacity:   ready ? 1 : 0,
          transform: ready ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.45s cubic-bezier(0.34,1.26,0.64,1), transform 0.45s cubic-bezier(0.34,1.26,0.64,1)',
        }}>

        {/* Glass surface */}
        <div style={{
          background:    'rgba(255,255,255,0.09)',
          backdropFilter:'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          border:        '1px solid rgba(255,255,255,0.18)',
          borderRadius:  '32px',
          boxShadow: `
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 -1px 0 rgba(0,0,0,0.2) inset,
            0 32px 80px rgba(0,0,0,0.55),
            0 8px 24px rgba(0,0,0,0.3)
          `,
          padding: '36px 32px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Iridescent shimmer layer (top-left sweep) */}
          <div className="absolute inset-0 pointer-events-none rounded-[32px]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(147,197,253,0.04) 30%, transparent 60%)',
            }} />

          {/* ── Logo ── */}
          <div className="flex items-center justify-center mb-6">
            <Logo showText size={30} lightOverride />
          </div>

          {/* ── Context hint — why are they being asked to log in? ── */}
          {reason && reasonLabel[reason] && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-5"
              style={{
                background: 'rgba(59,130,246,0.15)',
                border:     '1px solid rgba(59,130,246,0.25)',
              }}>
              <ShieldCheck size={14} style={{ color: '#93C5FD', flexShrink: 0 }} />
              <p className="text-[11px] font-semibold leading-snug" style={{ color: '#BFDBFE' }}>
                Sign in to {reasonLabel[reason]} for this property
              </p>
            </div>
          )}

          {/* ── Heading ── */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {reason ? 'You need to be signed in to continue' : 'Sign in to your Verifind account'}
            </p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-4"
              style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <p className="text-[11px] font-semibold text-red-300 flex-1">{error}</p>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="Email address"
                style={inputBase} onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type={showPass ? 'text' : 'password'} name="password"
                value={formData.password} onChange={handleChange}
                required placeholder="Password"
                style={{ ...inputBase, paddingRight: '44px' }}
                onFocus={onFocus} onBlur={onBlur}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button type="button" className="text-[11px] font-bold"
                style={{ color: 'rgba(147,197,253,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-sm transition-all mt-1"
              style={{
                background: loading
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color:      '#fff',
                border:     'none',
                cursor:     loading ? 'not-allowed' : 'pointer',
                boxShadow:  loading ? 'none' : '0 4px 20px rgba(37,99,235,0.5), 0 1px 0 rgba(255,255,255,0.2) inset',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* ── Register link ── */}
          <p className="text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            No account?{' '}
            <Link
              to={`/register${listingId ? `?returnTo=${encodeURIComponent(returnTo)}&listingId=${listingId}&reason=${reason || ''}` : ''}`}
              className="font-black"
              style={{ color: '#93C5FD', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>
              Create one →
            </Link>
          </p>

        </div>{/* end glass card */}

        {/* ── "Continue browsing" escape hatch ── */}
        <div className="text-center mt-4">
          <button onClick={() => navigate('/dashboard')}
            className="text-[11px] font-bold transition-all"
            style={{ color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'}>
            ← Continue browsing without signing in
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
