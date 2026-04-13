import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { generateContentStream } from '../services/geminiService';
import { AppMode, ChatMessage, MessageRole, Property, Attachment } from '../types';
import { Search, Map as MapIcon, Grid, ShieldCheck, X, User as UserIcon, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import { Sidebar }        from '../components/Sidebar';
import { BottomNav }      from '../components/BottomNav';
import { MessageList }    from '../components/MessageList';
import { InputArea }      from '../components/InputArea';
import { PropertyCard }   from '../components/PropertyCard';
import { MapView }        from '../components/MapView';
import { PropertyDetail } from '../components/PropertyDetail';
import ListingForm        from '../components/ListingForm';
import { LoadingWave }    from '../components/LoadingWave';
import { ProfileView }    from '../components/ProfileView';
import { PaymentsView }   from '../components/PaymentsView';
import { SavedHomes }     from '../components/SavedHomes';
import { AdminDashboard } from '../components/AdminDashboard';
import { Logo }           from '../components/Logo';
import { DashboardFooter }from '../components/DashboardFooter';

// ─── TYPEWRITER ANIMATED PLACEHOLDER ────────────────────────────────────────

const SUGGESTIONS = [
  '3 bedroom flat in Maitama',
  '2 bedroom apartment Wuse II',
  '4 bedroom duplex Asokoro',
  'self contain Jabi near lake',
  'furnished apartment Life Camp',
  '3 bedroom terrace Guzape',
  'mini flat Garki Area 11',
  '5 bedroom house Katampe',
  '2 bedroom Gwarimpa estate',
  'serviced apartment Central Area',
];

const useTypewriter = () => {
  const [display, setDisplay]   = useState('');
  const [cursor,  setCursor]    = useState(true);
  const idx    = useRef(0);
  const phase  = useRef<'typing' | 'pausing' | 'erasing'>('typing');
  const charI  = useRef(0);
  const timer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      const word = SUGGESTIONS[idx.current];

      if (phase.current === 'typing') {
        charI.current += 1;
        setDisplay(word.slice(0, charI.current));
        if (charI.current >= word.length) {
          phase.current = 'pausing';
          timer.current = setTimeout(tick, 1800);
        } else {
          timer.current = setTimeout(tick, 65 + Math.random() * 40);
        }
      } else if (phase.current === 'pausing') {
        phase.current = 'erasing';
        timer.current = setTimeout(tick, 50);
      } else {
        charI.current -= 1;
        setDisplay(word.slice(0, charI.current));
        if (charI.current <= 0) {
          idx.current   = (idx.current + 1) % SUGGESTIONS.length;
          phase.current = 'typing';
          timer.current = setTimeout(tick, 400);
        } else {
          timer.current = setTimeout(tick, 28);
        }
      }
    };

    timer.current = setTimeout(tick, 800);

    // Cursor blink
    const blink = setInterval(() => setCursor(c => !c), 530);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      clearInterval(blink);
    };
  }, []);

  return { display, cursor };
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const DISTRICTS = [
  'Maitama','Asokoro','Central Area','Wuse','Jabi','Guzape','Katampe',
  'Life Camp','Apo','Gwarimpa','Lokogoma','Galadimawa','Dawaki','Lugbe','Kubwa','Bwari','Mpape',
];
const PRICE_RANGES = [
  { label:'Any Price',   min:0,         max:Infinity },
  { label:'Under ₦500k', min:0,         max:500_000 },
  { label:'₦500k–₦1M',   min:500_000,   max:1_000_000 },
  { label:'₦1M–₦3M',     min:1_000_000, max:3_000_000 },
  { label:'₦3M–₦6M',     min:3_000_000, max:6_000_000 },
  { label:'₦6M+',        min:6_000_000, max:Infinity },
];
const PROP_TYPES = ['Apartment','House','Duplex','Bungalow'];
const BED_OPTIONS = ['Any','1','2','3','4','5+'];

// ─── AUTH GATE MODAL ─────────────────────────────────────────────────────────

const AuthGate: React.FC<{ onLogin: () => void; onRegister: () => void; onClose: () => void }> = ({
  onLogin, onRegister, onClose,
}) => (
  <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.70)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }}>
    <div style={{ width:'100%', maxWidth:380, background:'var(--bg-surface)', borderRadius:28, border:'1px solid var(--glass-border)', boxShadow:'0 40px 80px rgba(0,0,0,0.4)', padding:'36px 32px', textAlign:'center', position:'relative' }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%', background:'var(--bg-surface)', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}>
        <X size={16} />
      </button>

      <div style={{ width:64, height:64, borderRadius:20, background:'rgba(27,79,216,0.10)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'1px solid rgba(27,79,216,0.18)' }}>
        <ShieldCheck size={28} style={{ color:'var(--color-primary)' }} />
      </div>

      <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:400, color:'var(--text-primary)', letterSpacing:'-0.02em', margin:'0 0 8px' }}>
        Login to continue
      </h2>
      <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, margin:'0 0 24px' }}>
        Full property details, photos, videos, and agent contact are available to registered users. It takes 30 seconds to join.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={onLogin}
          style={{ padding:'13px', borderRadius:14, background:'var(--color-primary)', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, boxShadow:'0 4px 166px rgba(27,79,216,0.28)' }}>
          Sign In
        </button>
        <button onClick={onRegister}
          style={{ padding:'13px', borderRadius:14, background:'transparent', border:'1.5px solid var(--border-color)', color:'var(--text-primary)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, transition:'border-color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor='var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor='var(--border-color)')}>
          Create Free Account
        </button>
      </div>
    </div>
  </div>
);

// ─── FILTER PILL ─────────────────────────────────────────────────────────────

const FilterPill: React.FC<{ label:string; onRemove:()=>void }> = ({ label, onRemove }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px 3px 12px', borderRadius:99, background:'rgba(27,79,216,0.10)', border:'1px solid rgba(27,79,216,0.25)', fontSize:12, fontWeight:600, color:'#1B4FD8', whiteSpace:'nowrap' }}>
    {label}
    <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'#1B4FD8', padding:0, display:'flex', alignItems:'center' }}><X size={11}/></button>
  </span>
);

// ─── HERO SEARCH BAR ─────────────────────────────────────────────────────────

const HeroSearch: React.FC<{
  keyword:string; district:string; type:string; priceIdx:number; beds:string;
  setKeyword:(v:string)=>void; setDistrict:(v:string)=>void; setType:(v:string)=>void;
  setPriceIdx:(v:number)=>void; setBeds:(v:string)=>void;
  onSearch:()=>void;
}> = ({ keyword, district, type, priceIdx, beds, setKeyword, setDistrict, setType, setPriceIdx, setBeds, onSearch }) => {
  const { display, cursor } = useTypewriter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const sel: React.CSSProperties = {
    background:'transparent', border:'none', outline:'none',
    fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:14,
    color:'#111827', cursor:'pointer', width:'100%', appearance:'none' as any,
  };
  const div = <div style={{ width:1, background:'rgba(0,0,0,0.07)', margin:'10px 0', flexShrink:0 }} />;
  const field = (label:string, child:React.ReactNode) => (
    <div style={{ flex:1, minWidth:90, padding:'10px 14px' }}>
      <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase' as any, letterSpacing:'0.12em', color:'#9CA3AF', marginBottom:3 }}>{label}</div>
      {child}
    </div>
  );

  return (
    <div style={{ maxWidth:820, margin:'0 auto', borderRadius:20, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(40px) saturate(200%)', WebkitBackdropFilter:'blur(40px) saturate(200%)', border:'1px solid rgba(255,255,255,0.98)', boxShadow:'0 4px 12px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,1)', display:'flex', alignItems:'stretch', overflow:'hidden', flexWrap:'wrap' }}>

      {/* Animated keyword input */}
      <div style={{ flex:'2 0 140px', minWidth:140, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <Search size={15} color="#9CA3AF" style={{ flexShrink:0 }} />
        <div style={{ flex:1, position:'relative' }}>
          <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase' as any, letterSpacing:'0.12em', color:'#9CA3AF', marginBottom:3 }}>Search</div>
          <div style={{ position:'relative' }}>
            <input
              ref={inputRef}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch()}
              onFocus={() => setFocused(true)}
              onBlur={()  => setFocused(false)}
              style={{ background:'transparent', border:'none', outline:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:14, color:'#111827', width:'100%' }}
            />
            {/* Animated placeholder — shown only when input is empty and not focused */}
            {!keyword && !focused && (
              <div
                onClick={() => inputRef.current?.focus()}
                style={{ position:'absolute', top:0, left:0, pointerEvents:'none', fontSize:14, fontWeight:500, color:'#9CA3AF', whiteSpace:'nowrap', overflow:'hidden', maxWidth:'100%' }}
              >
                {display}
                <span style={{ opacity: cursor ? 1 : 0, transition:'opacity .1s', color:'#1B4FD8', fontWeight:400 }}>|</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {div}
      {field('Location',
        <select value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
      {div}
      {field('Type',
        <select value={type} onChange={e => setType(e.target.value)} style={sel}>
          <option value="">Any</option>
          {PROP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
      {div}
      {field('Beds',
        <select value={beds} onChange={e => setBeds(e.target.value)} style={sel}>
          {BED_OPTIONS.map(b => <option key={b} value={b}>{b==='Any'?'Any beds':`${b} bed${b==='1'?'':'s'}`}</option>)}
        </select>
      )}
      {div}
      {field('Price',
        <select value={priceIdx} onChange={e => setPriceIdx(Number(e.target.value))} style={sel}>
          {PRICE_RANGES.map((p,i) => <option key={i} value={i}>{p.label}</option>)}
        </select>
      )}

      <div style={{ padding:'8px 10px 8px 0', display:'flex', alignItems:'center' }}>
        <button onClick={onSearch}
          className="hover:scale-105 active:scale-95 group"
          style={{ height:48, paddingInline:28, background:'#1B4FD8', color:'#fff', border:'none', borderRadius:14, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow:'0 8px 24px rgba(27,79,216,0.3)', whiteSpace:'nowrap', position:'relative', overflow:'hidden' }}>
          <Search size={16} className="group-hover:animate-pulse" /> Search
        </button>
      </div>
    </div>
  );
};

// ─── BROWSE HERO ─────────────────────────────────────────────────────────────

const BrowseHero: React.FC<{
  propertyCount:number; user:any; isLive:boolean|null;
  onModeChange:(m:any)=>void;
  intent:string; setIntent:(v:string)=>void;
  keyword:string; district:string; type:string; priceIdx:number; beds:string;
  setKeyword:(v:string)=>void; setDistrict:(v:string)=>void; setType:(v:string)=>void;
  setPriceIdx:(v:number)=>void; setBeds:(v:string)=>void;
  onSearch:()=>void;
}> = ({ propertyCount, user, isLive, onModeChange, intent, setIntent, ...searchProps }) => {
  const navigate = useNavigate();
  return (
    <div style={{ position:'relative', height: 488, overflow:'hidden', borderBottom:'1px solid rgba(0,0,0,0.1)' }}>
      {/* ── ZILLOW STYLE HERO BACKGROUND ── */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1B4FD8 0%, #0E3A6E 40%, #095D50 100%)" }}>
        <svg viewBox="0 0 1920 488" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" opacity="0.45">
          <rect width="1920" height="488" fill="url(#sky)" />
          <defs>
            <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a8c8f0" />
              <stop offset="100%" stopColor="#d4e8f8" />
            </linearGradient>
            <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5a9e3a" />
              <stop offset="100%" stopColor="#3d7a28" />
            </linearGradient>
          </defs>
          <rect x="0" y="360" width="1920" height="128" fill="url(#grass)" />
          {[100, 340, 580, 820, 1060, 1300, 1540, 1720].map((x, i) => (
            <g key={x} transform={`translate(${x}, ${240 + (i % 2) * 20})`}>
              <rect x="0" y="70" width="140" height="120" fill={["#e8d5c4","#d4e8c4","#c4d4e8","#e8c4d4"][i%4]} />
              <polygon points="70,0 -10,70 150,70" fill={["#b8947a","#8ab87a","#7a8ab8","#b87a94"][i%4]} />
              <rect x="45" y="110" width="50" height="80" fill={["#8b6a50","#6a8b50","#506a8b","#8b506a"][i%4]} />
              <rect x="10" y="90" width="30" height="30" fill="white" opacity="0.6" />
              <rect x="100" y="90" width="30" height="30" fill="white" opacity="0.6" />
            </g>
          ))}
          {[80, 300, 520, 760, 1000, 1240, 1480].map((x) => (
             <g key={x} transform={`translate(${x}, 300)`}>
               <rect x="12" y="60" width="6" height="40" fill="#7a5c3a" />
               <circle cx="15" cy="50" r="30" fill="#4a8a30" opacity="0.9" />
             </g>
          ))}
        </svg>
      </div>

      {/* Gradient overlay for readability */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,31,61,0.85) 0%, rgba(10,31,61,0.3) 50%, rgba(10,31,61,0.1) 100%)" }} />

      {/* ── TOP NAV — absolute so it overlays the hero ── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', position:'absolute', top:0, left:0, right:0, zIndex:20, flexWrap:'wrap', gap:8 }}>
        <Logo showText size={26} />
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {isLive !== null && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:99, background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.14)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:isLive?'#34D399':'#FCD34D', display:'inline-block', boxShadow:isLive?'0 0 8px rgba(52,211,153,0.8)':'none' }}/>
              <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.55)', textTransform:'uppercase' as any, letterSpacing:'0.1em' }}>{isLive?'Live':'Local'}</span>
            </div>
          )}
          {user ? (
            <button onClick={() => onModeChange('profile')} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:99, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)', color:'#fff', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer' }}>
              <UserIcon size={14}/> {user.username}
            </button>
          ) : (
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => navigate('/login')}    style={{ padding:'7px 14px', borderRadius:99, background:'transparent', border:'1px solid rgba(255,255,255,0.28)', color:'rgba(255,255,255,0.9)', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>Sign in</button>
              <button onClick={() => navigate('/register')} style={{ padding:'7px 14px', borderRadius:99, background:'rgba(255,255,255,0.92)', border:'none', color:'#1B4FD8', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>Get started</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── CONTENT CONTAINER ── */}
      <div style={{ position:'relative', zIndex:10, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', paddingTop:60 }}>
        
        <h1 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 700, color: "#FFFFFF", margin: "0 0 12px", fontFamily: '"Ivar Headline", Georgia, serif', lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.6)", textAlign:'center', padding:'0 16px' }}>
          Rentals. Homes.<br />Agents. Verified.
        </h1>
        
        <p style={{ color:'rgba(255,255,255,0.9)', fontSize:15, maxWidth:400, margin:'0 auto 20px', lineHeight:1.6, textShadow:'0 1px 4px rgba(0,0,0,0.8)', textAlign:'center', padding:'0 16px' }}>
          Zero ghost listings. {propertyCount > 0 ? `${propertyCount} verified` : 'Thousands of'} homes in Abuja.
        </p>

        {/* Zillow Style Tabs */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <div style={{ display:'inline-flex', background:'rgba(10,31,61,0.6)', padding:5, borderRadius:99, backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.2)' }}>
            {(['Buy','Rent','Short-let']).map(tab => (
              <button
                key={tab}
                onClick={() => setIntent(tab)}
                style={{ padding:'8px 26px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, transition:'all .3s cubic-bezier(0.4, 0, 0.2, 1)', background: intent === tab ? '#fff' : 'transparent', color: intent === tab ? '#1B4FD8' : '#fff', boxShadow: intent === tab ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding:'0 16px', width:'100%', maxWidth:820 }}>
          <HeroSearch {...searchProps} />
        </div>

        <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'6px 20px', marginTop:24 }}>
          {[{n:propertyCount>0?`${propertyCount}+`:'0',l:'Verified listings'},{n:'17',l:'Districts'},{n:'100%',l:'Fraud-free'}].map((s,i,a) => (
            <React.Fragment key={s.l}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:500, color:'#fff' }}>{s.n}</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.42)', fontWeight:500 }}>{s.l}</span>
              </div>
              {i < a.length-1 && <span style={{ color:'rgba(255,255,255,0.15)', fontSize:18, lineHeight:1 }}>·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode,             setMode]             = useState<AppMode | 'profile'>(AppMode.BROWSE);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation,     setUserLocation]     = useState<{lat:number;lng:number}|null>(null);
  const [messages,         setMessages]         = useState<ChatMessage[]>([]);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [properties,       setProperties]       = useState<Property[]>([]);
  const [loadingProps,     setLoadingProps]     = useState(false);
  const [isLive,           setIsLive]           = useState<boolean|null>(null);
  const [showAuthGate,     setShowAuthGate]     = useState(false);

  // Search state
  const [sIntent,   setSIntent]   = useState('Buy');
  const [sKeyword,  setSKeyword]  = useState('');
  const [sDistrict, setSDistrict] = useState('');
  const [sType,     setSType]     = useState('');
  const [sPriceIdx, setSPriceIdx] = useState(0);
  const [sBeds,     setSBeds]     = useState('Any');
  const [aIntent,   setAIntent]   = useState('Buy');
  const [aKeyword,  setAKeyword]  = useState('');
  const [aDistrict, setADistrict] = useState('');
  const [aType,     setAType]     = useState('');
  const [aPriceIdx, setAPriceIdx] = useState(0);
  const [aBeds,     setABeds]     = useState('Any');
  const [viewMode,  setViewMode]  = useState<'grid'|'map'>('grid');

  /* ── AI chat FAB state ── */
  const [chatOpen,   setChatOpen]   = useState(false);
  const scrollRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProperties();
    // Fix: isLiveMode is a direct check, not a promise in this version
    const live = (api as any).isLiveMode();
    if (typeof live === 'boolean') setIsLive(live);
    else if (live && typeof live.then === 'function') live.then(setIsLive);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat:pos.coords.latitude, lng:pos.coords.longitude }),
        () => {}, { enableHighAccuracy:true },
      );
    }
  }, []);

  const fetchProperties = async () => {
    setLoadingProps(true);
    try {
      const res = await api.get<Property[]>('/api/properties');
      if (res.data) setProperties(res.data);
    } catch(e) { console.error(e); }
    finally { setTimeout(() => setLoadingProps(false), 400); }
  };

  const handlePropertyUpdate = (updated: Property) => {
    setProperties(prev => prev.map(p => p._id === updated._id ? updated : p));
    if (selectedProperty?._id === updated._id) setSelectedProperty(updated);
  };

  const handleSearch = () => {
    setAIntent(sIntent); setAKeyword(sKeyword); setADistrict(sDistrict);
    setAType(sType);     setAPriceIdx(sPriceIdx); setABeds(sBeds);
  };

  const clearFilter = (f: string) => {
    if (f==='keyword')  { setAKeyword('');   setSKeyword(''); }
    if (f==='district') { setADistrict('');  setSDistrict(''); }
    if (f==='type')     { setAType('');      setSType(''); }
    if (f==='price')    { setAPriceIdx(0);   setSPriceIdx(0); }
    if (f==='beds')     { setABeds('Any');   setSBeds('Any'); }
  };
  const clearAll = () => ['keyword','district','type','price','beds'].forEach(clearFilter);

  const pr = PRICE_RANGES[aPriceIdx];
  const filtered = properties.filter(p => {
    if (aDistrict && p.district !== aDistrict) return false;
    if (aType     && p.type     !== aType)     return false;
    if (aBeds !== 'Any') {
      const b = parseInt(aBeds);
      if (aBeds.endsWith('+')) { if ((p as any).bedrooms < b) return false; }
      else { if ((p as any).bedrooms !== b) return false; }
    }
    if (aPriceIdx > 0 && (p.baseRent < pr.min || p.baseRent > pr.max)) return false;
    if (aKeyword) {
      const q = aKeyword.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q) && !p.district.toLowerCase().includes(q) && !p.address?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const hasFilters = !!(aKeyword || aDistrict || aType || aPriceIdx > 0 || aBeds !== 'Any');

  const modeChange = useCallback((m: AppMode | 'profile') => {
    const protected_ = ['profile', AppMode.WALLET, AppMode.MANAGE_LISTINGS, AppMode.INSPECTIONS, AppMode.SAVED, AppMode.ADMIN];
    if ((protected_ as string[]).includes(m as string) && !isAuthenticated) { navigate('/login'); return; }
    if (m === AppMode.ADMIN && user?.role !== 'admin') return;
    setMode(m);
  }, [isAuthenticated, user, navigate]);

  const handleAuthRequired = useCallback(() => setShowAuthGate(true), []);

  const handleSendMessage = (text: string, attachments: Attachment[]) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text, attachments };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    const botId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botId, role: MessageRole.MODEL, text: '', isThinking: false }]);
    let full = '';
    generateContentStream({ prompt: text, attachments, mode: AppMode.CHAT_ASSISTANT }, {
      onChunk:          c   => { full += c; setMessages(p => p.map(m => m.id === botId ? { ...m, text: full } : m)); },
      onThinking:       isT => setMessages(p => p.map(m => m.id === botId ? { ...m, isThinking: isT } : m)),
      onImageGenerated: ()  => {},
      onGrounding:      s   => setMessages(p => p.map(m => m.id === botId ? { ...m, groundingSources: s } : m)),
      onComplete:       ()  => setIsGenerating(false),
      onError:          ()  => setIsGenerating(false),
    });
  };

  if (authLoading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-mesh)' }}>
      <LoadingWave text="Loading…" />
    </div>
  );



  const [favPos, setFavPos] = useState({ x: 0, y: 0 });

  const PropOverlay = selectedProperty && (
    <PropertyDetail
      property={selectedProperty}
      onClose={() => setSelectedProperty(null)}
      onContactAgent={() => { setSelectedProperty(null); setShowAuthGate(true); }}
      isAuthenticated={isAuthenticated}
      onUpdate={handlePropertyUpdate}
    />
  );

  const FloatingSaved = (
    <motion.button
      drag
      dragMomentum={false}
      animate={{ x: favPos.x, y: favPos.y }}
      onDragEnd={(e, info) => {
        const currentX = info.point.x;
        const isLeftEdge = currentX < window.innerWidth / 2;
        setFavPos({
          x: isLeftEdge ? -(window.innerWidth - 100) : 0, 
          y: favPos.y + info.offset.y 
        });
      }}
      onClick={() => { if (!isAuthenticated) return setShowAuthGate(true); modeChange(AppMode.SAVED); }}
      title="Saved homes"
      style={{
        position: 'fixed',
        bottom: 240,
        right: 20,
        zIndex: 60,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'var(--color-primary)',
        border: '2px solid rgba(255,255,255,0.25)',
        boxShadow: '0 4px 20px rgba(27,79,216,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        color: '#fff',
        opacity: 1,
        touchAction: 'none'
      }}
      whileHover={{ scale: 1.10, boxShadow: '0 8px 28px rgba(27,79,216,0.55), inset 0 1px 0 rgba(255,255,255,0.25)' }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
    >
      <Heart size={20} fill={mode === AppMode.SAVED ? '#fff' : 'none'} />
    </motion.button>
  );

  if (mode === AppMode.BROWSE) return (
    <div ref={scrollRef} style={{ height:'100vh', overflowY:'auto', overflowX:'hidden', background:'var(--bg-mesh)' }} className="custom-scrollbar">
      {PropOverlay}
      {showAuthGate && (
        <AuthGate
          onLogin={()    => { setShowAuthGate(false); navigate('/login'); }}
          onRegister={() => { setShowAuthGate(false); navigate('/register'); }}
          onClose={()    => setShowAuthGate(false)}
        />
      )}
      {FloatingSaved}

      <BrowseHero
        propertyCount={properties.length} user={user} isLive={isLive} onModeChange={modeChange}
        intent={sIntent} setIntent={setSIntent}
        keyword={sKeyword} district={sDistrict} type={sType} priceIdx={sPriceIdx} beds={sBeds}
        setKeyword={setSKeyword} setDistrict={setSDistrict} setType={setSType} setPriceIdx={setSPriceIdx} setBeds={setSBeds}
        onSearch={handleSearch}
      />

      <div style={{ position:'sticky', top:0, zIndex:30, background:'rgba(245,242,237,0.88)', backdropFilter:'blur(24px) saturate(180%)', WebkitBackdropFilter:'blur(24px) saturate(180%)', borderBottom:'1px solid rgba(0,0,0,0.06)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
            {loadingProps ? 'Loading…' : `${filtered.length} home${filtered.length!==1?'s':''}`}
          </span>
          <FilterPill label={aIntent} onRemove={() => {}} />
          {aKeyword      && <FilterPill label={`"${aKeyword}"`}            onRemove={() => clearFilter('keyword')}/>}
          {aDistrict     && <FilterPill label={aDistrict}                  onRemove={() => clearFilter('district')}/>}
          {aType         && <FilterPill label={aType}                      onRemove={() => clearFilter('type')}/>}
          {aBeds!=='Any' && <FilterPill label={`${aBeds} bed${aBeds==='1'?'':'s'}`} onRemove={() => clearFilter('beds')}/>}
          {aPriceIdx>0   && <FilterPill label={PRICE_RANGES[aPriceIdx].label} onRemove={() => clearFilter('price')}/>}
          {hasFilters    && <button onClick={clearAll} style={{ fontSize:12, color:'#1B4FD8', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>Clear all</button>}
        </div>
        <div style={{ display:'flex', background:'rgba(0,0,0,0.06)', borderRadius:10, padding:3, gap:2 }}>
          {(['grid','map'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', background:viewMode===v?'#fff':'transparent', color:viewMode===v?'#1B4FD8':'#6B7280', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, boxShadow:viewMode===v?'0 1px 4px rgba(0,0,0,0.10)':'none', display:'flex', alignItems:'center', gap:5, transition:'all .15s' }}>
              {v==='grid' ? <Grid size={13}/> : <MapIcon size={13}/>}
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 20px 120px' }}>
        {loadingProps ? (
          <LoadingWave text="Finding verified homes…" />
        ) : viewMode==='map' ? (
          <div style={{ height:'65vh', borderRadius:24, overflow:'hidden' }}>
            <MapView properties={filtered} onViewDetails={p => { if (!isAuthenticated) { handleAuthRequired(); return; } setSelectedProperty(p); }} userLocation={userLocation} />
          </div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'72px 20px', color:'var(--text-secondary)' }}>
            <ShieldCheck size={44} style={{ margin:'0 auto 16px', opacity:0.18, display:'block' }}/>
            <p style={{ fontWeight:700, fontSize:17, color:'var(--text-primary)', margin:0 }}>{hasFilters?'No listings match your filters':'No listings yet'}</p>
            <p style={{ fontSize:14, marginTop:6 }}>{hasFilters?'Try adjusting your search.':'Listings are being verified — check back soon.'}</p>
            {hasFilters && <button onClick={clearAll} style={{ marginTop:20, padding:'10px 24px', borderRadius:12, background:'#1B4FD8', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14 }}>Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p, i) => (
              <div key={p._id} className="animate-fade-up" style={{ animationDelay:`${Math.min(i*35,350)}ms` }}>
                <PropertyCard
                  property={p}
                  onViewDetails={setSelectedProperty}
                  onVerified={handlePropertyUpdate}
                  onAuthRequired={handleAuthRequired}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentMode={AppMode.BROWSE} onModeChange={modeChange} user={user} onFindAgentClick={() => { if (!isAuthenticated) return setShowAuthGate(true); modeChange(AppMode.FIND_AGENT); }} />

      {/* ══════════════════════════════════════════════════════
          AI CHAT FAB — bottom-right, fades on scroll,
          expands into a glass chat tray when clicked
          ══════════════════════════════════════════════════════ */}
      <>
        {/* Expanded chat tray */}
        {chatOpen && (
          <div
            className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 flex flex-col rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
            style={{
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(520px, 65vh)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
            {/* Tray header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--color-primary)' }}>
                  <ShieldCheck size={14} color="#fff" />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Verifind AI</p>
                  <p className="text-[10px] text-green-500 font-bold">Online</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList messages={messages} isGenerating={isGenerating} />
            </div>

            {/* Input */}
            <div className="shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
              <InputArea onSend={handleSendMessage} disabled={isGenerating} />
            </div>
          </div>
        )}

        {/* FAB button */}
        <motion.button
          onClick={() => setChatOpen(o => !o)}
          className="fixed bottom-24 md:bottom-24 right-4 md:right-6 z-50 flex items-center gap-2.5 transition-all duration-500"
          style={{
            opacity: 1,
            transform: chatOpen ? 'scale(1.05)' : 'scale(1)',
            background: 'var(--color-primary)',
            border: '2px solid rgba(255,255,255,.25)',
            borderRadius: '50px',
            padding: '12px 18px',
            color: '#fff',
            cursor: 'grab',
            boxShadow: '0 8px 32px rgba(27,79,216,0.45)',
            touchAction: 'none'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search size={18} />
          <span className="text-xs font-bold uppercase tracking-wide hidden md:inline">AI Agent</span>
        </motion.button>
      </>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', position:'fixed', inset:0, background:'var(--bg-mesh)', fontFamily:"'DM Sans',sans-serif" }}>
      {PropOverlay}
      {showAuthGate && (
        <AuthGate
          onLogin={()    => { setShowAuthGate(false); navigate('/login'); }}
          onRegister={() => { setShowAuthGate(false); navigate('/register'); }}
          onClose={()    => setShowAuthGate(false)}
        />
      )}

      <Sidebar currentMode={mode} onModeChange={modeChange} user={user} />
      <main style={{ flex:1, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        <header style={{ height:60, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px 0 28px', borderBottom:'1px solid var(--border-color)', background:'var(--glass-bg)', backdropFilter:'var(--glass-blur)', WebkitBackdropFilter:'var(--glass-blur)' }}>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', textTransform:'capitalize' as any }}>
            {mode==='profile' ? 'My Profile' : (mode as string).replace(/_/g,' ')}
          </span>
          <button onClick={() => setMode(AppMode.BROWSE)} style={{ fontSize:13, fontWeight:600, color:'var(--color-primary)', background:'none', border:'none', cursor:'pointer' }}>← Back to listings</button>
        </header>
        <div style={{ flex:1, overflowY:'auto' }} className="custom-scrollbar">
          <div style={{ padding:'24px 28px 80px', maxWidth:1100, margin:'0 auto' }}>
            {mode==='profile'               && <ProfileView />}
            {mode===AppMode.SAVED           && <SavedHomes onViewDetails={setSelectedProperty} />}
            {mode===AppMode.WALLET          && <PaymentsView />}
            {mode===AppMode.ADMIN           && <AdminDashboard />}
            {mode===AppMode.CHAT_ASSISTANT  && (
              <div style={{ display:'flex', flexDirection:'column', height:'72vh', borderRadius:24, overflow:'hidden', border:'1px solid var(--border-color)', background:'var(--glass-bg)', backdropFilter:'var(--glass-blur)' }}>
                <MessageList messages={messages} isGenerating={isGenerating} />
                <InputArea onSend={handleSendMessage} disabled={isGenerating} />
              </div>
            )}
            {mode===AppMode.MANAGE_LISTINGS && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div><ListingForm onPropertyCreated={() => fetchProperties()} /></div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {properties.filter(p => p.agentId === user?._id).map(p => (
                    <PropertyCard key={p._id} property={p} onViewDetails={setSelectedProperty} onVerified={handlePropertyUpdate} onAuthRequired={handleAuthRequired} />
                  ))}
                </div>
              </div>
            )}
            {mode===AppMode.INSPECTIONS && (
              <div style={{ textAlign:'center', padding:'72px 0', color:'var(--text-secondary)' }}>
                <p style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:'var(--text-primary)', marginBottom:8 }}>Inspection Calendar</p>
                <p style={{ fontSize:14 }}>Your scheduled visits will appear here.</p>
              </div>
            )}
            {mode===AppMode.FIND_AGENT && (
               <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                   <UserIcon size={32} className="text-blue-500" />
                 </div>
                 <h2 className="text-3xl font-bold mb-4 font-['Fraunces'] text-[var(--text-primary)]">Agent Directory</h2>
                 <p className="text-[var(--text-muted)] max-w-md mx-auto">Connect with top-rated real estate professionals. Our verified agent list is coming shortly.</p>
               </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav currentMode={mode} onModeChange={modeChange} user={user} />
    </div>
  );
};

export default Dashboard;
