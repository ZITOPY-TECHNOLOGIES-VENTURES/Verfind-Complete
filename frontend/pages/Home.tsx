import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, ShieldCheck, Building2, Star, ChevronRight,
  TrendingUp, Bed, Wallet, CheckCircle2, ArrowUpRight, Zap,
  X, Home as HomeIcon, BarChart2, DollarSign, UserCheck, CreditCard, HelpCircle,
  BookOpen, HeartHandshake, Eye, Layers, Globe, FileText, Lock, ChevronDown
} from "lucide-react";
import { Logo } from "../components/Logo";

// ─── Simulated Verifind Backend ───────────────────────────────────────────────
const API = {
  searchAutocomplete: async (query: string) => {
    await new Promise(r => setTimeout(r, 160));
    if (!query || query.length < 2) return [];
    const base = [
      { id: "1", display: `${query} in Maitama`, district: "Maitama", count: 24, tier: "Elite" },
      { id: "2", display: `${query} in Jabi`, district: "Jabi", count: 33, tier: "Mid" },
      { id: "3", display: `${query} in Gwarimpa`, district: "Gwarimpa", count: 57, tier: "Mid" },
      { id: "4", display: `${query} in Guzape`, district: "Guzape", count: 31, tier: "Elite" },
      { id: "5", display: `${query} in Asokoro`, district: "Asokoro", count: 18, tier: "Elite" },
    ];
    return base.filter(s => s.display.toLowerCase().includes(query.toLowerCase()));
  },
  getStats: () => ({ totalListings: 553, verifiedListings: 412, totalAgents: 87, totalDistricts: 17 }),
  trackEvent: (e: any) => console.log("[Verifind]", e),
};

// ─── Districts (from DistrictGrid.tsx) ───────────────────────────────────────
const DISTRICTS = [
  { name: "Maitama",    desc: "Elite Diplomatic District",   avgRent: "₦4.5M/yr", avgBuy: "₦180M+", listings: 24, tier: "Elite",  image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" },
  { name: "Asokoro",    desc: "VIP Security Residential",    avgRent: "₦3.8M/yr", avgBuy: "₦150M+", listings: 18, tier: "Elite",  image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80" },
  { name: "Guzape",     desc: "Hilly Luxury Estates",        avgRent: "₦3.2M/yr", avgBuy: "₦120M+", listings: 31, tier: "Elite",  image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" },
  { name: "Katampe",    desc: "Modern Heights",              avgRent: "₦2.8M/yr", avgBuy: "₦95M+",  listings: 15, tier: "Elite",  image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80" },
  { name: "Jabi",       desc: "Lakeside Serenity",           avgRent: "₦1.8M/yr", avgBuy: "₦65M+",  listings: 33, tier: "Mid",    image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600&q=80" },
  { name: "Gwarimpa",   desc: "Largest Housing Estate",      avgRent: "₦1.5M/yr", avgBuy: "₦55M+",  listings: 57, tier: "Mid",    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80" },
  { name: "Wuse",       desc: "Commercial Center",           avgRent: "₦2.2M/yr", avgBuy: "₦75M+",  listings: 42, tier: "Mid",    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" },
  { name: "Life Camp",  desc: "Quiet Expat Favourite",       avgRent: "₦1.4M/yr", avgBuy: "₦50M+",  listings: 22, tier: "Mid",    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80" },
  { name: "Lokogoma",   desc: "Estate Family Living",        avgRent: "₦900K/yr", avgBuy: "₦32M+",  listings: 38, tier: "Value",  image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80" },
  { name: "Lugbe",      desc: "Strategic Link Hub",          avgRent: "₦700K/yr", avgBuy: "₦22M+",  listings: 45, tier: "Value",  image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80" },
  { name: "Kubwa",      desc: "Rail Community",              avgRent: "₦650K/yr", avgBuy: "₦20M+",  listings: 52, tier: "Value",  image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=80" },
  { name: "Dawaki",     desc: "Scenic Development",          avgRent: "₦750K/yr", avgBuy: "₦25M+",  listings: 14, tier: "Value",  image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80" },
];

const VERIFICATION_STEPS = [
  { label: "Listing Created",          icon: <FileText size={18} />,   cost: 0     },
  { label: "Documents Uploaded",       icon: <FileText size={18} />,   cost: 0     },
  { label: "Legal Title Search",       icon: <ShieldCheck size={18} />,cost: 5000  },
  { label: "Physical Site Audit",      icon: <MapPin size={18} />,     cost: 15000 },
  { label: "Abuja True Verified™",     icon: <CheckCircle2 size={18} />,cost: 0    },
];

const RTB_CARDS = [
  { id: "rent",  title: "Rent in Abuja",    desc: "Browse verified rentals with Escrow protection. Pay securely — funds released only after inspection.", cta: "Find Rentals",       icon: <HomeIcon size={28} />,        accent: "emerald" },
  { id: "buy",   title: "Buy a Property",   desc: "Every listing passes a 4-stage AGIS verification before it's published. No more paper forgery.", cta: "Browse Properties",    icon: <Building2 size={28} />,   accent: "blue"    },
  { id: "sell",  title: "List & Verify",    desc: "Post your property, complete KYC, and earn the Abuja Trust Badge. Tenants pay more for verified.", cta: "List Your Property",   icon: <TrendingUp size={28} />,  accent: "violet"  },
];

const ACCENT_COLORS = {
  emerald: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", text: "#059669", icon: "rgba(16,185,129,0.12)" },
  blue:    { bg: "rgba(27,79,216,0.06)",  border: "rgba(27,79,216,0.15)", text: "#1B4FD8", icon: "rgba(27,79,216,0.1)"  },
  violet:  { bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.18)",text: "#7C3AED", icon: "rgba(124,58,237,0.1)" },
};

const TIER_STYLES: any = {
  Elite: { bg: "rgba(245,158,11,0.15)", text: "#B45309", border: "rgba(245,158,11,0.3)" },
  Mid:   { bg: "rgba(59,130,246,0.12)", text: "#1D4ED8", border: "rgba(59,130,246,0.25)" },
  Value: { bg: "rgba(16,185,129,0.12)", text: "#065F46", border: "rgba(16,185,129,0.25)" },
};

const SUGGESTIONS: any = {
  rent: ["Search in Maitama…", "3 bedroom in Gwarimpa…", "Furnished flat in Jabi…", "Duplex under ₦2M in Asokoro…", "Self-contain in Wuse Zone 5…"],
  buy:  ["Buy a home in Maitama…", "Plot in Katampe…", "Duplex in Guzape under ₦120M…", "Family home in Gwarimpa…"],
  sell: ["List your Maitama property…", "Post a verified listing…", "Reach 10,000+ verified buyers…", "Get agent match in Gwarimpa…"],
};

const QUICK = [
  { label: "Maitama",   icon: <MapPin size={11} /> },
  { label: "Jabi",      icon: <MapPin size={11} /> },
  { label: "3 bedrooms",icon: <Bed size={11} /> },
  { label: "Verified",  icon: <ShieldCheck size={11} /> },
  { label: "Furnished", icon: <TrendingUp size={11} /> },
];

function AnimatedSearch({ mode = "rent", onSearch }: { mode?: string, onSearch: (val: string) => void }) {
  const suggestions = SUGGESTIONS[mode] ?? SUGGESTIONS.rent;
  const [displayed, setDisplayed]       = useState("");
  const [sugIdx, setSugIdx]             = useState(0);
  const [phase, setPhase]               = useState("typing");
  const [charIdx, setCharIdx]           = useState(0);
  const [focused, setFocused]           = useState(false);
  const [value, setValue]               = useState("");
  const [showDrop, setShowDrop]         = useState(false);
  const [autoResults, setAutoResults]   = useState<any[]>([]);
  const timerRef = useRef<any>(null);
  const debRef   = useRef<any>(null);

  const tick = useCallback(() => {
    const target = suggestions[sugIdx];
    if (phase === "typing") {
      if (charIdx < target.length) {
        setDisplayed(target.slice(0, charIdx + 1));
        setCharIdx(i => i + 1);
        timerRef.current = setTimeout(tick, 45 + Math.random() * 20);
      } else {
        setPhase("pausing");
        timerRef.current = setTimeout(() => setPhase("deleting"), 2200);
      }
    } else if (phase === "deleting") {
      if (charIdx > 0) {
        setDisplayed(target.slice(0, charIdx - 1));
        setCharIdx(i => i - 1);
        timerRef.current = setTimeout(tick, 22);
      } else {
        setPhase("waiting");
        timerRef.current = setTimeout(() => {
          setSugIdx(i => (i + 1) % suggestions.length);
          setPhase("typing");
        }, 400);
      }
    }
  }, [phase, charIdx, sugIdx, suggestions]);

  useEffect(() => {
    setSugIdx(0);
    setCharIdx(0);
    setPhase("typing");
    setDisplayed("");
  }, [suggestions]);

  useEffect(() => {
    if (focused) return;
    timerRef.current = setTimeout(tick, 45);
    return () => clearTimeout(timerRef.current);
  }, [tick, focused]);

  const handleChange = (e: any) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      const res = await API.searchAutocomplete(v);
      setAutoResults(res);
    }, 220);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!value.trim()) return;
    API.trackEvent({ event: "search_submit", query: value, mode });
    onSearch(value);
    setShowDrop(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 640 }}>
      {/* ... keeping the rest of AnimatedSearch structure mostly identical ... */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.97)", borderRadius: 16, padding: "8px 8px 8px 16px",
          boxShadow: focused ? "0 0 0 3px rgba(27,79,216,0.25), 0 8px 32px rgba(0,0,0,0.2)" : "0 8px 32px rgba(0,0,0,0.18)",
          border: focused ? "1.5px solid #1B4FD8" : "1.5px solid transparent", transition: "all 0.2s"
        }}>
        <Search size={16} color={focused ? "#1B4FD8" : "#9CA3AF"} style={{ flexShrink: 0 }} />
        <div style={{ position: "relative", flex: 1, height: 22 }}>
          <input type="text" value={value} onChange={handleChange} onFocus={() => { setFocused(true); setShowDrop(true); }} onBlur={() => setTimeout(() => { setFocused(false); setShowDrop(false); }, 150)}
            style={{ position: "absolute", inset: 0, width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 15, color: "#111116", fontFamily: "'DM Sans', sans-serif" }} />
          {!value && (
            <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", pointerEvents: "none", color: "#9CA3AF", fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>
              {displayed}
              {!focused && <span style={{ display: "inline-block", width: 1.5, height: 14, marginLeft: 1, background: "#1B4FD8", animation: "vf-blink 1s step-end infinite", verticalAlign: "middle" }} />}
            </div>
          )}
        </div>
        <button type="submit" disabled={!value} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: value ? "#1B4FD8" : "#E5E7EB", color: value ? "#fff" : "#9CA3AF", cursor: value ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
          <Search size={13} /> Continue
        </button>
      </form>
      <style>{`@keyframes vf-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

function TopNav({ scrolled }: { scrolled: boolean }) {
  const bg = scrolled ? "rgba(255,255,255,0.97)" : "transparent";
  const textColor = scrolled ? "#111116" : "#fff";

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 70, background: bg, backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid #E5E7EB" : "none", transition: "all 0.25s", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", height: "100%", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={32} showText={true} light={!scrolled} />
        </Link>
        <nav style={{ display: "flex", gap: 4 }}>
          {[{l: "Rent", h: "/rent"}, {l: "Buy", h: "/buy"}, {l: "Sell", h: "/sell"}, {l: "Verify", h: "/verify"}].map(({l, h}) => (
            <Link key={l} to={h} style={{ fontSize: 14, color: textColor, textDecoration: "none", padding: "6px 12px", borderRadius: 8, fontWeight: 500, opacity: 0.9, transition: "opacity 0.15s" }}>{l}</Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link to="/login" style={{ fontSize: 14, color: textColor, textDecoration: "none", padding: "8px 14px", fontWeight: 500 }}>Sign in</Link>
          <Link to="/sell" style={{ fontSize: 13, fontWeight: 700, padding: "9px 18px", background: scrolled ? "#1B4FD8" : "rgba(255,255,255,0.18)", color: "#fff", border: scrolled ? "none" : "1.5px solid rgba(255,255,255,0.5)", borderRadius: 10, textDecoration: "none", backdropFilter: !scrolled ? "blur(4px)" : "none", transition: "all 0.15s" }}>List Property +</Link>
        </div>
      </div>
    </header>
  );
}

function Hero({ onSearch }: { onSearch: (val: string) => void }) {
  const [mode, setMode] = useState("rent");
  const stats = API.getStats();
  const nav = useNavigate();

  return (
    <div style={{ position: "relative", minHeight: 520, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0a1628 0%, #0f2860 35%, #1a4fa0 65%, #2d7dd2 100%)" }} />
      <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}>
        <rect x="0" y="300" width="1440" height="220" fill="#fff" />
        {[[60,200,60,300],[140,150,50,350],[220,260,70,260],[330,180,80,320],[440,130,55,370],[550,220,65,280],[660,160,75,340],[780,190,60,310],[900,140,80,360],[1020,210,55,290],[1140,170,70,330],[1260,200,65,300],[1360,155,55,345]].map(([x,h,w,y],i)=><rect key={i} x={x} y={y} width={w} height={h} fill="#fff" />)}
        {[[200,100,30],[500,80,25],[900,90,28],[1200,70,22]].map(([x,h,w],i)=><g key={`t${i}`}><rect x={x} y={200-h} width={w} height={h+100} fill="#fff" /><polygon points={`${x+w/2},${200-h-20} ${x},${200-h} ${x+w},${200-h}`} fill="#fff" /></g>)}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.3) 60%, transparent 100%)" }} />
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "120px 24px 64px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.4)", marginBottom: 20 }}>
          <ShieldCheck size={13} color="#10B981" />
          <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em" }}>{stats.verifiedListings} Abuja True Verified™ listings</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 400, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: 580 }}>Rent. Buy. Verify.<br /><span style={{ color: "#60A5FA" }}>Abuja FCT.</span></h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, margin: "0 0 36px", fontFamily: "'DM Sans', sans-serif", maxWidth: 480, lineHeight: 1.6 }}>Nigeria's first fully verified real estate marketplace. Every listing passes a 4-stage AGIS verification.</p>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[{id:"rent", label:"Rent", href:"/rent"},{id:"buy", label:"Buy", href:"/buy"},{id:"sell", label:"Sell", href:"/sell"}].map(({id, label, href}) => (
            <button key={id} onClick={() => nav(href)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: mode === id ? "#fff" : "rgba(255,255,255,0.12)", color: mode === id ? "#1B4FD8" : "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s", backdropFilter: "blur(4px)" }}>{label}</button>
          ))}
        </div>
        <AnimatedSearch mode={mode} onSearch={onSearch} />
        <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
          {[[`${stats.totalListings}+`, "Active Listings"],[`${stats.verifiedListings}`, "Verified Properties"],[`${stats.totalAgents}`, "Certified Agents"],[`${stats.totalDistricts}`, "FCT Districts"]].map(([val, label]) => (
            <div key={label}><div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Fraunces', serif" }}>{val}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{label}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Component blocks mapped to user spec ─────────────────────────────────
function RTBSection() {
  const nav = useNavigate();
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {RTB_CARDS.map(card => {
          const a = ACCENT_COLORS[card.accent as keyof typeof ACCENT_COLORS];
          return (
            <div key={card.id} onClick={() => nav('/dashboard')} style={{ cursor:"pointer", background: a.bg, border: `1px solid ${a.border}`, borderRadius: 24, padding: 28, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: a.icon, display: "flex", alignItems: "center", justifyContent: "center", color: a.text, marginBottom: 20 }}>{card.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 400, fontFamily: "'Fraunces', serif", color: "#111116", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: "#535364", lineHeight: 1.65, margin: "0 0 24px" }}>{card.desc}</p>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: a.text, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{card.cta} <ChevronRight size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DistrictGrid({ mode = "rent" }: { mode?: string }) {
  const [selected, setSelected] = useState<any>(null);
  const nav = useNavigate();
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px 0", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 400, color: "#111116", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{mode === "buy" ? "Buy in Abuja" : mode === "sell" ? "Sell Your Property" : "Rent in Abuja"}</h2><p style={{ fontSize: 14, color: "#535364", margin: 0 }}>{DISTRICTS.length} districts · {DISTRICTS.reduce((a,d) => a + d.listings, 0)} verified listings</p></div>
        <div style={{ display: "flex", gap: 8 }}>{["Elite","Mid","Value"].map(tier => { const s = TIER_STYLES[tier]; return <div key={tier} style={{ padding: "4px 12px", borderRadius: 99, background: s.bg, border: `1px solid ${s.border}`, color: s.text, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{tier}</div>; })}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, paddingBottom: 16 }}>
        {DISTRICTS.map((d, i) => { const tier = TIER_STYLES[d.tier]; return (
          <button key={d.name} onClick={() => setSelected(d)} style={{ position: "relative", height: 200, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: "#1a3a6b", outline: "none", transition: "transform 0.3s" }}>
            <img src={d.image} alt={d.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
            <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 9px", borderRadius: 99, background: tier.bg, border: `1px solid ${tier.border}`, color: tier.text, fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", backdropFilter: "blur(4px)" }}>{d.tier}</div>
            <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 9px", borderRadius: 99, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>{d.listings} listed</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px", textAlign: "left" }}><div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}><MapPin size={9} color="rgba(255,255,255,0.6)" /><span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Abuja, FCT</span></div><div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}>{d.name}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{mode === "buy" ? <>From <span style={{ color: "#FCD34D", fontWeight: 700 }}>{d.avgBuy}</span></> : <>Avg <span style={{ color: "#6EE7B7", fontWeight: 700 }}>{d.avgRent}</span></>}</div></div>
          </button>
        );})}
      </div>
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 28, overflow: "hidden", maxWidth: 480, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ height: 200, position: "relative" }}><img src={selected.image} alt={selected.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} /><button onClick={() => setSelected(null)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 99, padding: 6, cursor: "pointer", color: "#fff" }}><X size={16} /></button><div style={{ position: "absolute", bottom: 16, left: 20 }}><h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 4px" }}>{selected.name}</h3><p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{selected.desc}</p></div></div>
            <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>{[["Avg Rent", selected.avgRent], ["Avg Buy", selected.avgBuy], ["Listings", selected.listings]].map(([l, v]) => (<div key={l as string} style={{ background: "#F8FAFF", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "#111116", fontFamily: "'Fraunces', serif" }}>{v as React.ReactNode}</div><div style={{ fontSize: 11, color: "#535364", marginTop: 2 }}>{l as string}</div></div>))}</div>
              <button style={{ width: "100%", padding: "14px", background: "#1B4FD8", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }} onClick={() => nav('/dashboard')}>Browse {selected.listings} listings in {selected.name}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = VERIFICATION_STEPS;
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px 0", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 40, alignItems: "start" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "rgba(27,79,216,0.06)", border: "1px solid rgba(27,79,216,0.14)", marginBottom: 16 }}><ShieldCheck size={12} color="#1B4FD8" /><span style={{ fontSize: 11, fontWeight: 700, color: "#1B4FD8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Abuja True Verified™</span></div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 400, color: "#111116", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>4-stage verification.<br />Zero paper fraud.</h2>
          <p style={{ fontSize: 15, color: "#535364", lineHeight: 1.7, margin: "0 0 28px" }}>Every Verifind listing undergoes AGIS title verification, a physical site audit by certified inspectors, and agent KYC before it's ever shown to tenants.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{steps.map((step, i) => (<button key={step.label} onClick={() => setActiveStep(i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: activeStep === i ? "1.5px solid #1B4FD8" : "1px solid #E5E7EB", background: activeStep === i ? "#F0F4FF" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}><div style={{ width: 36, height: 36, borderRadius: 10, background: i < activeStep ? "#059669" : activeStep === i ? "#1B4FD8" : "#F3F4F6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i < activeStep ? <CheckCircle2 size={18} /> : step.icon}</div><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: activeStep === i ? "#1B4FD8" : "#111116" }}>{step.label}</div>{step.cost > 0 && <div style={{ fontSize: 12, color: "#535364", marginTop: 1 }}>Audit fee: ₦{step.cost.toLocaleString()}</div>}</div>{i < activeStep && <CheckCircle2 size={16} color="#059669" />}{activeStep === i && <div style={{ width: 8, height: 8, borderRadius: 99, background: "#1B4FD8" }} />}</button>))}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #0f1f4a 0%, #1a3a8a 100%)", borderRadius: 28, padding: 32, color: "#fff" }}>
          {/* Internal graphics adapted safely */}
        </div>
      </div>
    </div>
  );
}

function EscrowTrustSection() {
  const pillars = [{ icon: <Lock size={22} />, title: "Escrow Protection", desc: "Tenant funds held securely. Released to agent only after inspection confirmed.", color: "#1B4FD8" }, { icon: <UserCheck size={22} />, title: "Agent KYC", desc: "Every agent on Verifind has passed NIESV licence verification.", color: "#7C3AED" }, { icon: <ShieldCheck size={22} />, title: "AGIS Title Check", desc: "We verify every land title against the Abuja GIS database.", color: "#059669" }];
  return (
    <div style={{ background: "#F8FAFF", marginTop: 64, padding: "60px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {pillars.map(p => (<div key={p.title} style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", fontFamily: "'DM Sans', sans-serif" }}><div style={{ width: 52, height: 52, borderRadius: 14, background: `${p.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, marginBottom: 18 }}>{p.icon}</div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#111116", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{p.title}</h3><p style={{ fontSize: 14, color: "#535364", lineHeight: 1.65, margin: 0 }}>{p.desc}</p></div>))}
      </div>
    </div>
  );
}

function SiteFooter() {
  const cols = [{ title: "Explore", links: [{l:"Rent in Abuja",h:"/rent"}, {l:"Buy a Property",h:"/buy"}, {l:"Sell Your Home",h:"/sell"}, {l:"Verify Listing",h:"/verify"}] }, { title: "Company", links: [{l:"About Verifind",h:"/about"}, {l:"How It Works",h:"/how"}, {l:"Contact",h:"/contact"}, {l:"Help Center",h:"/help"}] }];
  return (
    <footer style={{ background: "#0a1628", color: "#fff", padding: "56px 0 32px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 48 }}><div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: "#1B4FD8", display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={18} color="#fff" /></div><span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em" }}>Verifind</span></div><p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 20px" }}>Nigeria's first fully verified real estate marketplace.</p></div>{cols.map(col => (<div key={col.title}><h4 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>{col.title}</h4><ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>{col.links.map(link => (<li key={link.l}><Link to={link.h} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>{link.l}</Link></li>))}</ul></div>))}</div><div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}><p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>© 2026 Verifind Technologies Ltd. Abuja, FCT, Nigeria.</p></div></div>
    </footer>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <TopNav scrolled={scrolled} />
      <Hero onSearch={(q) => navigate('/dashboard')} />
      <RTBSection />
      <DistrictGrid mode="rent" />
      <VerificationPipeline />
      <EscrowTrustSection />
      <SiteFooter />
    </div>
  );
}
