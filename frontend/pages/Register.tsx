import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Loader2, Home, Briefcase, User, Phone,
  Check, CheckCircle2, Building2, ShieldCheck,
  RefreshCw, AlertCircle, X
} from 'lucide-react';
import { Logo } from '../components/Logo';

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return w;
}

type Role   = 'tenant' | 'agent';
type Screen = 'role' | 'details' | 'password' | 'verify';

/* ── Password rules ── */
const RULES = [
  { id: 'len',     label: 'At least 8 characters',         test: (p: string) => p.length >= 8          },
  { id: 'upper',   label: 'One uppercase letter',           test: (p: string) => /[A-Z]/.test(p)        },
  { id: 'number',  label: 'One number',                     test: (p: string) => /[0-9]/.test(p)        },
  { id: 'special', label: 'One special character (!@#…)',   test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

/* ── 6-box OTP input ── */
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const digits = value.padEnd(6, ' ').split('');

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      onChange(value.slice(0, i));
      if (i > 0) refs[i - 1].current?.focus();
    }
  };
  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = char;
    const next = arr.join('').replace(/ /g, '').slice(0, 6);
    onChange(next);
    if (i < 5) refs[i + 1].current?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(paste);
    refs[Math.min(paste.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {refs.map((ref, i) => (
        <input key={i} ref={ref} type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: '44px', height: '52px', textAlign: 'center',
            fontSize: '20px', fontWeight: 900,
            background: digits[i]?.trim() ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)',
            border: `1.5px solid ${digits[i]?.trim() ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '14px', color: '#fff', outline: 'none', transition: 'all .2s',
          }} />
      ))}
    </div>
  );
};

/* ── Progress dots ── */
const Dots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div className="flex gap-1.5 justify-center mb-7">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="rounded-full transition-all duration-300"
        style={{ width: i === current ? '20px' : '6px', height: '6px', background: i <= current ? '#3B82F6' : 'rgba(255,255,255,0.15)' }} />
    ))}
  </div>
);

/* ── Shared input style ── */
const inp: React.CSSProperties = {
  width: '100%', padding: '13px 14px 13px 44px',
  background: 'rgba(255,255,255,0.07)',
  border: '1.5px solid rgba(255,255,255,0.14)',
  borderRadius: '16px', color: '#fff',
  fontSize: '14px', fontFamily: 'inherit', outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
};
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.42)';
  e.target.style.boxShadow   = '0 0 0 3px rgba(255,255,255,0.06)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.14)';
  e.target.style.boxShadow   = 'none';
};

/* ══════════════════════════════════════════════════════════ */
const Register: React.FC = () => {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const w = useWindowWidth();
  const isMobile = w < 640;

  const params    = new URLSearchParams(location.search);
  const returnTo  = params.get('returnTo')  || '/dashboard';
  const listingId = params.get('listingId') || '';

  /* ── Form state ── */
  const [screen,      setScreen]      = useState<Screen>('role');
  const [role,        setRole]        = useState<Role>('tenant');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [agencyName,  setAgencyName]  = useState('');
  const [nin,         setNin]         = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [otp,         setOtp]         = useState('');
  const [timer,       setTimer]       = useState(60);
  const [canResend,   setCanResend]   = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [ready,       setReady]       = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  /* ── Resend countdown ── */
  useEffect(() => {
    if (screen !== 'verify') return;
    setTimer(60); setCanResend(false);
    const id = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(id); setCanResend(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [screen]);

  /* ── Password checks ── */
  const ruleResults = RULES.map(r => ({ ...r, ok: r.test(password) }));
  const passValid   = ruleResults.every(r => r.ok);
  const passMatch   = password === confirm && confirm.length > 0;
  const passStrength = ruleResults.filter(r => r.ok).length;
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'][passStrength];

  const go = (s: Screen) => { setError(''); setScreen(s); };

  /* ── Step handlers ── */
  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())                                   return setError('Full name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))     return setError('Enter a valid email');
    if (role === 'agent' && !agencyName.trim())         return setError('Agency name is required');
    go('password');
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passValid) return setError('Password does not meet all requirements');
    if (!passMatch) return setError('Passwords do not match');

    setLoading(true); setError('');
    const res = await sendOtp(name, email, password, role);

    if (!res.sent) {
      setError(res.message);
      setLoading(false);
    } else {
      setLoading(false);
      go('verify');
      if (res.devOtp) {
        // Auto-fill the OTP in development mode so the user doesn't have to hunt for it
        setOtp(res.devOtp);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return setError('Enter the 6-digit code sent to your email');
    setLoading(true); setError('');
    const res = await verifyOtp(email, otp);
    if (res.success) {
      navigate(returnTo, {
        replace: true,
        state: listingId ? { openListingId: listingId } : undefined,
      });
    } else {
      setError(res.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  /* ── Card backdrop ── */
  const cardStyle: React.CSSProperties = {
    opacity:    ready ? 1 : 0,
    transform:  ready ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
    transition: 'opacity 0.4s cubic-bezier(0.34,1.26,0.64,1), transform 0.4s cubic-bezier(0.34,1.26,0.64,1)',
  };
  const glassStyle: React.CSSProperties = {
    background:           'rgba(255,255,255,0.08)',
    backdropFilter:       'blur(60px) saturate(180%)',
    WebkitBackdropFilter: 'blur(60px) saturate(180%)',
    border:               '1px solid rgba(255,255,255,0.16)',
    borderRadius:         isMobile ? '24px' : '32px',
    boxShadow:            '0 1px 0 rgba(255,255,255,0.22) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 40px 100px rgba(0,0,0,0.55)',
    padding:              isMobile ? '20px 16px 16px' : '36px 32px 32px',
    position:             'relative', overflow: 'hidden',
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: `
          radial-gradient(ellipse 80% 60% at 20% 15%, rgba(30,58,138,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 80% 80%, rgba(15,23,42,0.9) 0%, transparent 60%),
          #050D1E
        `,
      }}>

      {/* Ambient glows */}
      <div className="fixed pointer-events-none" style={{ width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', top: '-140px', left: '-140px', filter: 'blur(60px)' }} />
      <div className="fixed pointer-events-none" style={{ width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', bottom: '-100px', right: '-100px', filter: 'blur(60px)' }} />

    

      <div style={{ padding: isMobile ? '16px' : '24px', width: '100%' }}>
        <div className="w-full relative z-10" style={{ margin: '0 auto', maxWidth: isMobile ? '100%' : '420px', ...cardStyle }}>
        <div className="vf-reg-card" style={glassStyle}>
          {/* Shimmer */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)', borderRadius: '32px' }} />

          {/* Logo */}
          <div className="vf-reg-logo flex justify-center" style={{ marginBottom: isMobile ? 10 : 24 }}>
            <Logo showText size={isMobile ? 22 : 28} light />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-4"
              style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={13} style={{ color: '#F87171', flexShrink: 0 }} />
              <p className="text-[12px] font-semibold flex-1" style={{ color: '#FCA5A5' }}>{error}</p>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* ══ ROLE PICKER ══ */}
          {screen === 'role' && (
            <div>
            <div className="vf-reg-dots" style={{ marginBottom: isMobile ? 10 : 0 }}><Dots total={3} current={0} /></div>
              <div className="vf-reg-heading text-center" style={{ marginBottom: isMobile ? 10 : 24 }}>
                <h1 style={{ fontSize: isMobile ? 20 : 24 }} className="font-black text-white mb-1">Join Verifind</h1>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>How will you use Verifind?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {([
                  { id: 'tenant' as Role, title: 'Tenant / Buyer', sub: 'Find & secure a verified property', icon: <Home size={22} />,
                    perks: ['Browse 2,400+ listings · Escrow payments · Book inspections'] },
                  { id: 'agent'  as Role, title: 'Property Agent', sub: 'List, verify & manage rentals', icon: <Briefcase size={22} />,
                    perks: ['Post verified listings · Manage pipeline · Commission payouts'] },
                ] as const).map(opt => {
                  const active = role === opt.id;
                  return (
                    <button key={opt.id} type="button" onClick={() => setRole(opt.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 18px', borderRadius: 20, textAlign: 'left',
                        background: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${active ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.12)'}`,
                        cursor: 'pointer',
                        boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                        transition: 'all 0.18s',
                        width: '100%',
                      }}>
                      {/* Icon */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                        color: active ? '#93C5FD' : 'rgba(255,255,255,0.4)',
                      }}>
                        {opt.icon}
                      </div>
                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                          <p style={{ fontWeight: 800, fontSize: 14, color: '#fff', margin: 0 }}>{opt.title}</p>
                          {active && <CheckCircle2 size={15} style={{ color: '#60A5FA', flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>{opt.sub}</p>
                        <p style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.5 }}>
                          {opt.perks[0]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button type="button" onClick={() => go('details')}
                className="w-full flex items-center justify-center gap-2 py-[14px] rounded-2xl font-black text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', letterSpacing: '0.03em' }}>
                Continue <ArrowRight size={16} />
              </button>

              <p className="text-center text-[12px] mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Already have an account?{' '}
                <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}${listingId ? `&listingId=${listingId}` : ''}`}
                  className="font-black" style={{ color: '#93C5FD', textDecoration: 'none' }}>
                  Sign in →
                </Link>
              </p>
            </div>
          )}

          {/* ══ DETAILS ══ */}
          {screen === 'details' && (
            <form onSubmit={handleDetails}>
              <Dots total={3} current={1} />
              <button type="button" onClick={() => go('role')}
                className="flex items-center gap-1.5 mb-5 text-[11px] font-bold"
                style={{ color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={13} /> Back
              </button>
              <div className="mb-5">
                <h1 className="text-2xl font-black text-white mb-1">{role === 'agent' ? 'Agent details' : 'Your details'}</h1>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Tell us a bit about yourself</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Full name" style={inp} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address" style={inp} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 rounded-2xl shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                    🇳🇬 +234
                  </div>
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" style={inp} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
                {role === 'agent' && (
                  <>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} required placeholder="Agency / company name" style={inp} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div className="relative">
                      <ShieldCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <input type="text" value={nin} onChange={e => setNin(e.target.value)} placeholder="NIN — optional, speeds up verification" style={inp} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </>
                )}
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-[14px] rounded-2xl font-black text-sm text-white mt-4"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', letterSpacing: '0.03em' }}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ══ PASSWORD ══ */}
          {screen === 'password' && (
            <form onSubmit={handlePassword}>
              <Dots total={3} current={2} />
              <button type="button" onClick={() => go('details')}
                className="flex items-center gap-1.5 mb-5 text-[11px] font-bold"
                style={{ color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={13} /> Back
              </button>
              <div className="mb-5">
                <h1 className="text-2xl font-black text-white mb-1">Create password</h1>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Make it strong and unique</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="Create password" style={{ ...inp, paddingRight: '44px' }} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type={showConf ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                    required placeholder="Confirm password"
                    style={{ ...inp, paddingRight: '44px', borderColor: confirm && !passMatch ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.14)' }}
                    onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{ background: i <= passStrength ? strengthColor : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: strengthColor }}>
                      {['','Weak','Fair','Good','Strong'][passStrength]} password
                    </p>
                  </div>
                )}
              </div>

              {/* Rules checklist */}
              <div className="p-4 rounded-2xl mb-4 space-y-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {ruleResults.map(r => (
                  <div key={r.id} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{ background: r.ok ? '#22C55E' : 'rgba(255,255,255,0.08)', border: `1px solid ${r.ok ? '#22C55E' : 'rgba(255,255,255,0.18)'}` }}>
                      {r.ok && <Check size={9} color="#fff" />}
                    </div>
                    <span className="text-[11px] transition-colors" style={{ color: r.ok ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.32)' }}>{r.label}</span>
                  </div>
                ))}
                {confirm.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{ background: passMatch ? '#22C55E' : 'rgba(255,255,255,0.08)', border: `1px solid ${passMatch ? '#22C55E' : 'rgba(255,255,255,0.18)'}` }}>
                      {passMatch && <Check size={9} color="#fff" />}
                    </div>
                    <span className="text-[11px] transition-colors" style={{ color: passMatch ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.32)' }}>Passwords match</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={!passValid || !passMatch}
                className="w-full flex items-center justify-center gap-2 py-[14px] rounded-2xl font-black text-sm text-white transition-all"
                style={{
                  background: passValid && passMatch ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : 'rgba(255,255,255,0.1)',
                  border: 'none', cursor: passValid && passMatch ? 'pointer' : 'not-allowed',
                  boxShadow: passValid && passMatch ? '0 4px 20px rgba(37,99,235,0.4)' : 'none',
                  letterSpacing: '0.03em', opacity: passValid && passMatch ? 1 : 0.6,
                }}>
                Create Account <ArrowRight size={16} />
              </button>
              <p className="text-[10px] text-center mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                By continuing you agree to Verifind's Terms & Privacy Policy
              </p>
            </form>
          )}

          {/* ══ VERIFY EMAIL OTP ══ */}
          {screen === 'verify' && (
            <form onSubmit={handleRegister}>
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Mail size={24} style={{ color: '#4ADE80' }} />
                </div>
                <h1 className="text-2xl font-black text-white mb-1">Check your email</h1>
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  We sent a 6-digit code to<br />
                  <span className="font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</span>
                </p>
              </div>

              <div className="mb-5">
                <OtpInput value={otp} onChange={setOtp} />
              </div>

              <button type="submit" disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-[14px] rounded-2xl font-black text-sm text-white transition-all mb-4"
                style={{
                  background: otp.length === 6 && !loading ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : 'rgba(255,255,255,0.1)',
                  border: 'none', cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed',
                  boxShadow: otp.length === 6 && !loading ? '0 4px 20px rgba(37,99,235,0.4)' : 'none',
                  letterSpacing: '0.03em', opacity: otp.length < 6 ? 0.6 : 1,
                }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : <>Verify & Finish <ArrowRight size={16} /></>}
              </button>

              <div className="text-center">
                {canResend ? (
                  <button type="button" onClick={() => { setOtp(''); setCanResend(false); setTimer(60); }}
                    className="flex items-center gap-1.5 mx-auto text-[11px] font-bold"
                    style={{ color: '#93C5FD', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <RefreshCw size={11} /> Resend code
                  </button>
                ) : (
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    Resend in <span className="font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{timer}s</span>
                  </p>
                )}
              </div>

              <button type="button" onClick={() => go('password')}
                className="flex items-center gap-1.5 mx-auto mt-3 text-[11px] font-bold"
                style={{ color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={11} /> Wrong email? Go back
              </button>
            </form>
          )}
        </div>

        {/* Escape hatch */}
        {screen === 'role' && (
          <div className="text-center mt-4">
            <button onClick={() => navigate('/dashboard')}
              className="text-[11px] font-bold transition-all"
              style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)'}>
              ← Continue browsing without signing in
            </button>
          </div>
        )}
        </div>
      </div>

    
    </div>
  );
};

export default Register;
