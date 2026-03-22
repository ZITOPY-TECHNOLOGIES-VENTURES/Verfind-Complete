import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck, MapPin, Search, Building2, TrendingUp, Home,
  ChevronRight, CheckCircle2, Star, ArrowRight, Users, Lock,
  Clock, FileText, MessageSquare, Phone, Mail, ChevronDown,
  BarChart2, Wallet, UserCheck, CreditCard, HelpCircle, Eye, Layers, Globe, X
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "../components/Logo";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const P = "#1B4FD8";        // primary blue
const DARK = "#0a1628";
const FONT_SAN = "'DM Sans', sans-serif";
const FONT_SER = "'Fraunces', serif";

// ─── Auth Protection Components ───────────────────────────────────────────────
function LockedData({ children, type = "data", blur = false }: any) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <>{children}</>;

  if (blur) {
    return (
      <Link to="/login" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <span style={{ filter: 'blur(5px)', opacity: 0.6, userSelect: 'none' }}>{children}</span>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={14} color="#111" />
        </span>
      </Link>
    );
  }

  return (
    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(27,79,216,0.1)', color: P, padding: '2px 8px', borderRadius: 6, fontSize: '0.85em', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }} title={`Login to view ${type}`}>
      <Lock size={12} /> Login to view
    </Link>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function Badge({ children, color = P, bg }: any) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, background: bg || `${color}14`, border: `1px solid ${color}30`, color, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT_SAN }}>
      {children}
    </span>
  );
}

function Btn({ children, primary, small, onClick, style = {} }: any) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: small ? "9px 18px" : "13px 24px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: small ? 13 : 14, fontWeight: 700, fontFamily: FONT_SAN, background: primary ? (hov ? "#143EAE" : P) : hov ? "#F0F4FF" : "#F3F4F6", color: primary ? "#fff" : P, transition: "all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function SectionLabel({ children }: any) {
  return (
    <div style={{ marginBottom: 14 }}><Badge color={P}><ShieldCheck size={10} /> {children}</Badge></div>
  );
}

function H2({ children, light }: any) {
  return (
    <h2 style={{ fontFamily: FONT_SER, fontSize: "clamp(28px,4vw,40px)", fontWeight: 400, letterSpacing: "-0.03em", color: light ? "#fff" : "#111116", margin: "0 0 16px", lineHeight: 1.15 }}>
      {children}
    </h2>
  );
}

function SubText({ children, light, center }: any) {
  return (
    <p style={{ fontSize: 16, color: light ? "rgba(255,255,255,0.65)" : "#535364", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 560, textAlign: center ? "center" : undefined, marginLeft: center ? "auto" : undefined, marginRight: center ? "auto" : undefined, fontFamily: FONT_SAN }}>
      {children}
    </p>
  );
}

function Card({ children, style = {} }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${hov ? "#BFCFFF" : "#E5E7EB"}`, padding: 28, transition: "all 0.2s", boxShadow: hov ? "0 8px 28px rgba(27,79,216,0.1)" : "0 2px 8px rgba(0,0,0,0.05)", transform: hov ? "translateY(-2px)" : "none", ...style }}>
      {children}
    </div>
  );
}

function IconBox({ icon, color = P, size = 48 }: any) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: `${color}12`, color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, flexShrink: 0 }}>
      {icon}
    </div>
  );
}

export function TopNav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav style={{ background: DARK, padding: "12px 24px", display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 100 }}>
      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginRight: 16 }}>
        <Logo size={28} showText={true} light={true} />
      </Link>
      {[["Rent in Abuja", "/rent"], ["Buy a Property", "/buy"], ["Sell Your Home", "/sell"], ["Verify Listing", "/verify"], ["About", "/about"], ["How It Works", "/how"], ["Contact", "/contact"], ["Help Center", "/help"]].map(([label, href]) => (
        <Link key={href} to={href} style={{ color: "rgba(255,255,255,0.65)", textDecoration: 'none', padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: FONT_SAN }}>
          {label}
        </Link>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        {!isAuthenticated ? (
          <Link to="/login" style={{ fontSize: 13, fontWeight: 700, padding: "6px 14px", background: P, color: "#fff", borderRadius: 8, textDecoration: "none" }}>Sign In</Link>
        ) : (
          <Link to="/dashboard" style={{ fontSize: 13, fontWeight: 700, padding: "6px 14px", background: "#059669", color: "#fff", borderRadius: 8, textDecoration: "none" }}>Dashboard</Link>
        )}
      </div>
    </nav>
  );
}

// ─── DISTRICTS DATA ───────────────────────────────────────────────────────────
const DISTRICTS = [
  { name: "Maitama", tier: "Elite", listings: 24, rent: "₦4.5M/yr", buy: "₦180M+", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70" },
  { name: "Asokoro", tier: "Elite", listings: 18, rent: "₦3.8M/yr", buy: "₦150M+", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70" },
  { name: "Guzape", tier: "Elite", listings: 31, rent: "₦3.2M/yr", buy: "₦120M+", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70" },
  { name: "Jabi", tier: "Mid", listings: 33, rent: "₦1.8M/yr", buy: "₦65M+", img: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=400&q=70" },
  { name: "Gwarimpa", tier: "Mid", listings: 57, rent: "₦1.5M/yr", buy: "₦55M+", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=70" },
  { name: "Wuse", tier: "Mid", listings: 42, rent: "₦2.2M/yr", buy: "₦75M+", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70" },
  { name: "Kubwa", tier: "Value", listings: 52, rent: "₦650K/yr", buy: "₦20M+", img: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400&q=70" },
  { name: "Lugbe", tier: "Value", listings: 45, rent: "₦700K/yr", buy: "₦22M+", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=70" },
];

const TIER_C = {
  Elite: { bg: "rgba(245,158,11,0.12)", text: "#B45309", border: "rgba(245,158,11,0.3)" },
  Mid: { bg: "rgba(59,130,246,0.12)", text: "#1D4ED8", border: "rgba(59,130,246,0.25)" },
  Value: { bg: "rgba(16,185,129,0.12)", text: "#065F46", border: "rgba(16,185,129,0.25)" },
};

// ─── PAGE: RENT IN ABUJA ──────────────────────────────────────────────────────
export function RentPage() {
  const [search, setSearch] = useState("");
  const [bedrooms, setBedrooms] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("verified");
  const nav = useNavigate();

  const listings = [
    { id: 1, title: "3-Bed Serviced Duplex", district: "Maitama", price: "₦4.2M/yr", beds: 3, baths: 3, verified: true, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70", escrow: true, agent: "Emeka Obi", rating: 4.9, stage: "Verified" },
    { id: 2, title: "2-Bed Flat", district: "Jabi", price: "₦1.6M/yr", beds: 2, baths: 1, verified: true, img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=70", escrow: true, agent: "Fatima Bello", rating: 4.8, stage: "Verified" },
    { id: 3, title: "4-Bed Detached House", district: "Asokoro", price: "₦6.5M/yr", beds: 4, baths: 4, verified: true, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70", escrow: true, agent: "Chidi Eze", rating: 5.0, stage: "Verified" },
    { id: 4, title: "Studio Self-Contain", district: "Gwarimpa", price: "₦650K/yr", beds: 1, baths: 1, verified: false, img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=70", escrow: false, agent: "Usman Garba", rating: 4.2, stage: "Docs Uploaded" },
    { id: 5, title: "3-Bed Terrace", district: "Guzape", price: "₦3.0M/yr", beds: 3, baths: 2, verified: true, img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70", escrow: true, agent: "Ada Nwosu", rating: 4.7, stage: "Verified" },
    { id: 6, title: "2-Bed Apartment", district: "Wuse", price: "₦1.9M/yr", beds: 2, baths: 2, verified: true, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70", escrow: true, agent: "Kunle Adeyemi", rating: 4.6, stage: "Verified" },
  ];

  const filtered = listings.filter(l => {
    if (verifiedOnly && !l.verified) return false;
    if (bedrooms !== "any" && l.beds !== parseInt(bedrooms)) return false;
    if (search && !l.district.toLowerCase().includes(search.toLowerCase()) && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a3a8a 100%)`, padding: "56px 24px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionLabel>553 listings · Abuja FCT</SectionLabel>
          <H2 light>Rent in Abuja</H2>
          <SubText light>Every listing has been physically inspected and AGIS-verified. Your deposit is protected by Escrow.</SubText>

          {/* Search + Filters */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Search size={15} color="rgba(255,255,255,0.6)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="District, area or property type…" style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: FONT_SAN, width: "100%" }} />
            </div>
            {[
              { label: "Bedrooms", val: bedrooms, set: setBedrooms, opts: [["any", "Any beds"], ["1", "1 bed"], ["2", "2 beds"], ["3", "3 beds"], ["4", "4+ beds"]] },
              { label: "Max price", val: maxPrice, set: setMaxPrice, opts: [["any", "Any price"], ["1", "≤ ₦1M/yr"], ["2", "≤ ₦2M/yr"], ["4", "≤ ₦4M/yr"]] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontFamily: FONT_SAN, cursor: "pointer" }}>
                {f.opts.map(([v, l]) => <option key={v} value={v} style={{ color: "#111" }}>{l}</option>)}
              </select>
            ))}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
              <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
              Verified only
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "#535364", margin: 0 }}><strong style={{ color: "#111" }}>{filtered.length}</strong> listings found</p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 12px", borderRadius: 9, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: FONT_SAN }}>
            <option value="verified">Sort: Verified first</option>
            <option value="price_low">Price: Low to high</option>
            <option value="price_high">Price: High to low</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map(l => (
            <div key={l.id} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,79,216,0.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}
            >
              <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
                <img src={l.img} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  {l.verified && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 8, background: "rgba(5,150,105,0.9)", color: "#fff", fontSize: 10, fontWeight: 800 }}>
                      <ShieldCheck size={10} /> Verified
                    </span>
                  )}
                  {l.escrow && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 8, background: "rgba(27,79,216,0.9)", color: "#fff", fontSize: 10, fontWeight: 800 }}>
                      <Lock size={10} /> Escrow
                    </span>
                  )}
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111116", margin: "0 0 3px", fontFamily: FONT_SER }}>{l.title}</h3>
                    <div style={{ fontSize: 12, color: "#535364", display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={11} /> {l.district}
                    </div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: P, fontFamily: FONT_SER }}>
                    <LockedData type="price">{l.price}</LockedData>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#535364", marginBottom: 12 }}>
                  <span>🛏 {l.beds} beds</span>
                  <span>🚿 {l.baths} baths</span>
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" /> {l.rating} · <LockedData type="agent" blur>{l.agent}</LockedData>
                  </span>
                </div>
                <Btn primary small style={{ width: "100%", justifyContent: "center" }} onClick={() => nav('/dashboard')}>
                  View Property <ChevronRight size={13} />
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: BUY A PROPERTY ─────────────────────────────────────────────────────
export function BuyPage() {
  const [calcPrice, setCalcPrice] = useState(50000000);
  const [deposit, setDeposit] = useState(20);
  const [years, setYears] = useState(15);
  const rate = 0.22; // Nigerian mortgage rate ~22%
  const loanAmount = calcPrice * (1 - deposit / 100);
  const monthly = (loanAmount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -years * 12));

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #0f1f4a 0%, #1a3580 100%)`, padding: "56px 24px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionLabel>AGIS Title Verified · Every Listing</SectionLabel>
          <H2 light>Buy a Property in Abuja</H2>
          <SubText light>Every listing has passed a full AGIS land title search. No fake C-of-O. No double sales. Browse with confidence.</SubText>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* District grid */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontFamily: FONT_SER, fontSize: 24, fontWeight: 400, color: "#111116", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Browse by District</h3>
          <p style={{ fontSize: 14, color: "#535364", margin: "0 0 20px" }}>Average purchase prices across Abuja FCT</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {DISTRICTS.map(d => {
              const t = TIER_C[d.tier as keyof typeof TIER_C];
              return (
                <div key={d.name} style={{ position: "relative", height: 160, borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
                  <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }} />
                  <div style={{ position: "absolute", top: 8, right: 8, padding: "2px 8px", borderRadius: 99, background: t.bg, border: `1px solid ${t.border}`, color: t.text, fontSize: 9, fontWeight: 800 }}>{d.tier}</div>
                  <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: FONT_SER }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "#FCD34D", fontWeight: 700 }}>
                      <LockedData type="price">From {d.buy}</LockedData>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mortgage calculator */}
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 40 }}>
          <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a3a8a)`, padding: "24px 28px", color: "#fff" }}>
            <h3 style={{ fontFamily: FONT_SER, fontSize: 22, fontWeight: 400, margin: "0 0 4px" }}>Mortgage Calculator</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Estimate your monthly repayments at Nigerian mortgage rates</p>
          </div>
          <div style={{ padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
              {[
                { label: "Property Price (₦)", val: calcPrice, set: setCalcPrice, min: 5000000, max: 500000000, step: 1000000, fmt: (v: any) => `₦${(v / 1000000).toFixed(1)}M` },
                { label: "Deposit (%)", val: deposit, set: setDeposit, min: 10, max: 50, step: 5, fmt: (v: any) => `${v}%` },
                { label: "Loan Term (years)", val: years, set: setYears, min: 5, max: 25, step: 5, fmt: (v: any) => `${v} yrs` },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#535364", display: "block", marginBottom: 8 }}>{f.label}</label>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#111116", fontFamily: FONT_SER, marginBottom: 8 }}>{f.fmt(f.val)}</div>
                  <input type="range" min={f.min} max={f.max} step={f.step} value={f.val} onChange={e => f.set(Number(e.target.value))} style={{ width: "100%", accentColor: P }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { label: "Monthly Payment", value: `₦${Math.round(monthly).toLocaleString()}`, highlight: true },
                { label: "Loan Amount", value: `₦${Math.round(loanAmount / 1000000).toFixed(1)}M` },
                { label: "Interest Rate", value: "22% p.a." },
              ].map(item => (
                <div key={item.label} style={{ padding: "16px 18px", borderRadius: 14, background: item.highlight ? P : "#F8FAFF", border: `1px solid ${item.highlight ? P : "#E5E7EB"}` }}>
                  <div style={{ fontSize: 11, color: item.highlight ? "rgba(255,255,255,0.7)" : "#535364", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.highlight ? "#fff" : "#111116", fontFamily: FONT_SER }}>
                    <LockedData type="rates">{item.value}</LockedData>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: SELL YOUR HOME ─────────────────────────────────────────────────────
export function SellPage() {
  const [path, setPath] = useState<string | null>(null);
  const nav = useNavigate();
  const paths = [
    { id: "agent",    icon: <Users size={26} />,    title: "List with an Agent",   sub: "Get matched with a REDAN-certified Verifind agent. They handle verification, showings, and escrow.", cta: "Find an Agent",       color: P,       stats: "Sells 40% faster" },
    { id: "fsbo",     icon: <Home size={26} />,      title: "Self-List (FSBO)",    sub: "List directly and manage enquiries yourself. We still require full Abuja True Verified™ status before going live.", cta: "Start FSBO Listing", color: "#059669", stats: "Keep more profit" },
    { id: "valuation",icon: <BarChart2 size={26} />, title: "Get a Valuation First", sub: "Not sure what your property is worth? Get a free Veristimate based on AGIS records and comparable sales.", cta: "Get Free Valuation",  color: "#7C3AED", stats: "Free · Instant" },
  ];

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      <div style={{ background: `linear-gradient(135deg, #0f2040 0%, #1a4080 100%)`, padding: "56px 24px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionLabel>AGIS Verified Listings Sell Faster</SectionLabel>
          <H2 light>Sell Your Home on Verifind</H2>
          <SubText light>Verified listings on Verifind rent 40% faster and command up to 23% higher prices. The Trust Badge is worth real money.</SubText>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 44 }}>
          {[["Avg verified listing price", "₦2.8M"], ["Faster time-to-let", "40%"], ["Higher rental yield", "23%"], ["Active Abuja listings", "553"]].map(([l, v]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid #E5E7EB", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: P, fontFamily: FONT_SER }}>
                <LockedData type="stats" blur>{v}</LockedData>
              </div>
              <div style={{ fontSize: 12, color: "#535364", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: FONT_SER, fontSize: 24, fontWeight: 400, color: "#111116", margin: "0 0 6px" }}>How do you want to sell?</h3>
        <p style={{ fontSize: 14, color: "#535364", margin: "0 0 20px" }}>Choose the path that works for you — all three lead to a verified listing.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 44 }}>
          {paths.map(p => (
            <div key={p.id} onClick={() => setPath(p.id)} style={{ background: "#fff", borderRadius: 20, padding: 24, border: `2px solid ${path === p.id ? p.color : "#E5E7EB"}`, cursor: "pointer", transition: "all 0.15s", boxShadow: path === p.id ? `0 0 0 4px ${p.color}15` : "none" }}>
              <IconBox icon={p.icon} color={p.color} />
              <h4 style={{ fontFamily: FONT_SER, fontSize: 18, fontWeight: 400, color: "#111116", margin: "0 0 8px" }}>{p.title}</h4>
              <p style={{ fontSize: 13, color: "#535364", lineHeight: 1.6, margin: "0 0 16px" }}>{p.sub}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: p.color, padding: "3px 10px", borderRadius: 99, background: `${p.color}12` }}>{p.stats}</span>
                <ChevronRight size={16} color={p.color} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(27,79,216,0.04)", borderRadius: 20, border: "1px solid rgba(27,79,216,0.14)", padding: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${P}12`, color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontFamily: FONT_SER, fontSize: 18, fontWeight: 400, color: "#111116", margin: "0 0 6px" }}>All listings require Abuja True Verified™ status</h4>
              <p style={{ fontSize: 14, color: "#535364", lineHeight: 1.65, margin: "0 0 14px" }}>
                Before your listing goes live on Verifind, it must pass our 4-stage verification: document upload, legal title search (₦5,000), physical site audit (₦15,000), and final certification. This is what makes Verifind different — and why tenants trust and pay more for our listings.
              </p>
              <Btn primary onClick={() => nav("/verify")}>Start Verification Process <ArrowRight size={14} /></Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: VERIFY LISTING ─────────────────────────────────────────────────────
export function VerifyPage() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { id: 0, name: "Create Listing",    fee: 0,       duration: "5 mins",  icon: <FileText size={20} />,    color: "#059669", what: ["Upload property photos", "Set price and description", "Add location and property type"], req: [] },
    { id: 1, name: "Upload Documents",  fee: 0,       duration: "1–2 days",icon: <Layers size={20} />,      color: "#1B4FD8", what: ["CAC Certificate (for companies)", "Survey Plan", "Deed of Assignment or C-of-O"], req: ["CAC Certificate","Survey Plan","Deed of Assignment or C-of-O"] },
    { id: 2, name: "Legal Title Search",fee: 5000,    duration: "2–3 days",icon: <Eye size={20} />,          color: "#7C3AED", what: ["AGIS database verification", "Land use charge history", "Encumbrance check", "Ownership chain confirmation"], req: ["AGIS Verification Entry"] },
    { id: 3, name: "Physical Site Audit",fee: 15000,  duration: "1–2 days",icon: <MapPin size={20} />,      color: "#D97706", what: ["Licensed inspector visits property", "Confirms property matches listing", "Site Inspection Report issued", "Photos taken for verification"], req: ["Site Inspection Report", "Inspector Certification"] },
    { id: 4, name: "Abuja True Verified™", fee: 0,   duration: "Same day", icon: <ShieldCheck size={20} />, color: "#059669", what: ["Trust Badge applied to listing", "Listing goes live on marketplace", "Escrow payments enabled", "Certified agent profile updated"], req: [] },
  ];
  const totalCost = steps.reduce((a, s) => a + s.fee, 0);

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #0f2860 100%)`, padding: "56px 24px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <SectionLabel>4-Stage AGIS Verification</SectionLabel>
          <H2 light>The Abuja True Verified™ Process</H2>
          <SubText light>Every listing on Verifind must pass four independent verification stages before it goes live. This eliminates fake C-of-O, double sales, and misrepresented properties.</SubText>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              Total cost: <strong style={{ color: "#FCD34D" }}>₦{totalCost.toLocaleString()}</strong>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              Timeline: <strong style={{ color: "#6EE7B7" }}>5–10 business days</strong>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              Escrow protection: <strong style={{ color: "#60A5FA" }}>Enabled after verification</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, alignItems: "start" }}>
          {/* Step list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((s, i) => (
              <button key={s.id} onClick={() => setActiveStep(i)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16,
                border: `2px solid ${activeStep === i ? s.color : "#E5E7EB"}`,
                background: activeStep === i ? `${s.color}08` : "#fff",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                boxShadow: activeStep === i ? `0 0 0 3px ${s.color}20` : "none",
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: i <= activeStep ? s.color : "#F3F4F6", color: i <= activeStep ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {i < activeStep ? <CheckCircle2 size={20} /> : s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: activeStep === i ? s.color : "#111116" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#535364", display: "flex", gap: 10, marginTop: 2 }}>
                    <span>{s.fee > 0 ? `₦${s.fee.toLocaleString()}` : "Free"}</span>
                    <span>· {s.duration}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Step detail placeholder */}
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", padding: 28 }}>
            <h3>{steps[activeStep].name}</h3>
            <p>{steps[activeStep].what[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: ABOUT ──────────────────────────────────────────────────────────────
export function AboutPage() {
  const team = [
    { name: "Adaora Nwosu",   role: "CEO & Co-founder",     desc: "Former FCTA land registry officer. 8 years tracking property fraud in Abuja." },
    { name: "Emeka Obi",      role: "CTO & Co-founder",     desc: "Ex-Flutterwave engineer. Built Verifind's Paystack escrow integration." },
    { name: "Fatima Ibrahim", role: "Head of Verification", desc: "NIESV-certified surveyor. Designed the 4-stage AGIS verification pipeline." },
    { name: "Chidi Eze",      role: "Head of Agent Relations", desc: "REDAN Board member. Manages Verifind's certified agent network." },
  ];

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a3a8a 100%)`, padding: "72px 24px 56px", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: P, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <ShieldCheck size={34} color="#fff" />
          </div>
          <H2 light>We built Verifind because we got scammed.</H2>
          <SubText light center>
            In 2022, our co-founder Adaora paid ₦2.1M in rent advance for an Asokoro property — only to discover the "agent" had no title and three other people had already paid for the same flat. Verifind exists so that never happens again.
          </SubText>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
          {[["412", "Verified Listings", "#059669"], ["87", "Certified Agents", P], ["₦0", "Tenant Fraud Since Launch", "#7C3AED"], ["17", "Abuja Districts Covered", "#D97706"]].map(([v, l, c]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: "1px solid #E5E7EB", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: c, fontFamily: FONT_SER, marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: "#535364" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 56 }}>
          <div>
            <h3 style={{ fontFamily: FONT_SER, fontSize: 26, fontWeight: 400, color: "#111116", margin: "0 0 16px" }}>The Problem We're Solving</h3>
            <p style={{ fontSize: 15, color: "#535364", lineHeight: 1.75, margin: "0 0 14px" }}>Abuja has a structural rental fraud problem. Unregulated agents, fake Certificates of Occupancy, and Whatsapp-coordinated double lettings cost FCT residents an estimated ₦4.8 billion annually.</p>
            <p style={{ fontSize: 15, color: "#535364", lineHeight: 1.75, margin: 0 }}>Existing platforms display listings but never verify them. We built the verification pipeline — AGIS database access, certified inspector network, Paystack escrow — so that trust is built into the product, not left to chance.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: FONT_SER, fontSize: 26, fontWeight: 400, color: "#111116", margin: "0 0 16px" }}>Our Partnerships</h3>
            {[
              { name: "REDAN", full: "Real Estate Developers Association of Nigeria", role: "Agent certification and licensing" },
              { name: "NIESV", full: "Nigerian Institution of Estate Surveyors and Valuers", role: "Inspector certification" },
              { name: "AGIS",  full: "Abuja Geographic Information Systems", role: "Land title verification database" },
              { name: "Paystack", full: "Paystack (Stripe subsidiary)", role: "Escrow and transfer infrastructure" },
            ].map(p => (
              <div key={p.name} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${P}12`, color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: 11 }}>{p.name.slice(0,2)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111116" }}>{p.name} <span style={{ fontWeight: 400, color: "#535364" }}>— {p.full}</span></div>
                  <div style={{ fontSize: 12, color: "#535364", marginTop: 2 }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <h3 style={{ fontFamily: FONT_SER, fontSize: 26, fontWeight: 400, color: "#111116", margin: "0 0 20px" }}>The Team</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {team.map(m => (
            <Card key={m.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${P}15`, color: P, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, fontFamily: FONT_SER, flexShrink: 0 }}>{m.name[0]}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111116" }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: P, fontWeight: 600 }}>{m.role}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#535364", lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: HOW IT WORKS ───────────────────────────────────────────────────────
export function HowPage() {
  const [role, setRole] = useState("tenant");
  const flows: Record<string, any[]> = {
    tenant: [
      { n: 1, icon: <Search size={22} />,      title: "Search Verified Listings",     desc: "Filter by district, price, bedrooms and verified-only. Every result has passed all 4 stages.", color: P },
      { n: 2, icon: <Eye size={22} />,          title: "Schedule an Inspection",       desc: "Book directly through Verifind. A certified inspector accompanies your viewing.", color: "#7C3AED" },
      { n: 3, icon: <Wallet size={22} />,       title: "Pay into Escrow",              desc: "Your payment goes into your Verifind wallet — held securely. It never goes directly to the agent.", color: "#D97706" },
      { n: 4, icon: <ShieldCheck size={22} />,  title: "Inspection Confirmed",         desc: "Inspector confirms property matches listing. Funds are released to the agent 48 hours later.", color: "#059669" },
      { n: 5, icon: <Home size={22} />,         title: "Move In",                      desc: "Keys transferred. You get a digital tenancy record. Agent receives verified funds.", color: "#059669" },
    ],
    agent: [
      { n: 1, icon: <UserCheck size={22} />,    title: "Complete Agent KYC",           desc: "Submit Government ID, REDAN/NIESV licence, and physical office address for audit.", color: P },
      { n: 2, icon: <CreditCard size={22} />,   title: "Set Up Payout Account",        desc: "Register your bank account via Paystack. All escrow releases go directly here.", color: "#7C3AED" },
      { n: 3, icon: <FileText size={22} />,     title: "List & Verify Property",       desc: "Upload listing, pay verification fees (₦5k + ₦15k), and pass all 4 stages.", color: "#D97706" },
      { n: 4, icon: <Globe size={22} />,        title: "Go Live with Trust Badge",     desc: "Your verified listing appears in search with the Abuja True Verified™ badge and Escrow enabled.", color: "#059669" },
      { n: 5, icon: <Wallet size={22} />,       title: "Receive Secure Payments",      desc: "Tenant escrow is released to you 48 hours after inspection confirmation. No chasing payments.", color: "#059669" },
    ],
    landlord: [
      { n: 1, icon: <Building2 size={22} />,    title: "Register Your Property",       desc: "Add your property and choose whether to manage it yourself or assign to a Verifind agent.", color: P },
      { n: 2, icon: <ShieldCheck size={22} />,  title: "Verify Your Title",            desc: "We run an AGIS check on your land title and issue a Verifind Property Certificate.", color: "#7C3AED" },
      { n: 3, icon: <Users size={22} />,        title: "Get Matched with Tenants",     desc: "Verified tenants apply through the platform. View their rental history and references.", color: "#D97706" },
      { n: 4, icon: <Wallet size={22} />,       title: "Escrow-Protected Rent",        desc: "Every rental payment goes through escrow. You receive confirmed, cleared funds — no bounced cheques.", color: "#059669" },
    ],
  };

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      <div style={{ background: `linear-gradient(135deg, #0f2040 0%, #1a3a8a 100%)`, padding: "56px 24px 40px", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <SectionLabel>Step-by-Step Guide</SectionLabel>
          <H2 light>How Verifind Works</H2>
          <SubText light center>Everything is built around one idea: money and keys only change hands once the property is confirmed real.</SubText>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[["tenant","I'm a Tenant"],["agent","I'm an Agent"],["landlord","I'm a Landlord"]].map(([id, label]) => (
              <button key={id} onClick={() => setRole(id)} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: role === id ? "#fff" : "rgba(255,255,255,0.12)", color: role === id ? P : "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: FONT_SAN, transition: "all 0.15s" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {flows[role].map((step, i) => (
            <div key={step.n} style={{ display: "flex", gap: 20, paddingBottom: i < flows[role].length - 1 ? 0 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: step.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 16px ${step.color}40`, zIndex: 1 }}>{step.icon}</div>
                {i < flows[role].length - 1 && <div style={{ width: 2, flex: 1, minHeight: 32, background: "#E5E7EB", margin: "4px 0" }} />}
              </div>
              <div style={{ paddingBottom: 28, paddingTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: step.color, background: `${step.color}12`, padding: "2px 8px", borderRadius: 99 }}>Step {step.n}</span>
                </div>
                <h3 style={{ fontFamily: FONT_SER, fontSize: 20, fontWeight: 400, color: "#111116", margin: "0 0 8px" }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: "#535364", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 48 }}>
          <h3 style={{ fontFamily: FONT_SER, fontSize: 26, fontWeight: 400, color: "#111116", margin: "0 0 20px" }}>Frequently Asked Questions</h3>
          {[
            ["What happens if the inspection fails?", "If the inspector finds that the property doesn't match the listing — wrong size, different location, structural issues — your escrow funds are returned in full within 24 hours. The listing is suspended and the agent is flagged."],
            ["How long does escrow take to release?", "Funds are released to the agent exactly 48 hours after the inspector submits a passing confirmation report. This gives tenants time to raise any last issues."],
            ["What does the ₦20,000 verification cover?", "₦5,000 covers the AGIS legal title search (checks ownership history, encumbrances, and land-use compliance). ₦15,000 covers the physical site audit by a NIESV-certified inspector who visits the property in person."],
            ["Can I use Verifind if I'm outside Nigeria?", "Yes — diaspora buyers and renters use Verifind regularly. The escrow system is specifically designed for remote transactions where you can't personally inspect before paying."],
          ].map(([q, a]) => {
            const [open, setOpen] = useState(false);
            return (
              <div key={q} style={{ borderBottom: "1px solid #E5E7EB" }}>
                <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#111116", fontFamily: FONT_SAN }}>{q}</span>
                  <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", color: "#535364", flexShrink: 0, marginLeft: 12 }}><ChevronDown size={18} /></span>
                </button>
                {open && <p style={{ fontSize: 14, color: "#535364", lineHeight: 1.75, margin: "0 0 18px", paddingRight: 32 }}>{a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: CONTACT ────────────────────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "tenant", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      <TopNav />
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a3a8a 100%)`, padding: "56px 24px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <SectionLabel>We're in Abuja FCT</SectionLabel>
          <H2 light>Get in Touch</H2>
          <SubText light>Response time is typically under 2 hours during business hours (Mon–Fri, 8am–6pm WAT).</SubText>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 32 }}>
          {/* Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: <Phone size={18} />, label: "Phone / WhatsApp", value: <LockedData type="phone" blur>+234 803 000 0000</LockedData>, sub: "Mon–Fri, 8am–6pm WAT" },
              { icon: <Mail size={18} />,  label: "Email", value: <LockedData type="email" blur>hello@verifind.ng</LockedData>, sub: "We reply within 2 hours" },
              { icon: <MapPin size={18} />,label: "Office", value: "Plot 441, Cadastral Zone, Wuse II, Abuja FCT", sub: "By appointment" },
            ].map(c => (
              <Card key={c.label} style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: `${P}12`, color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#535364", marginBottom: 3 }}>{c.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111116" }}>{c.value}</div>
                    <div style={{ fontSize: 12, color: "#535364", marginTop: 2 }}>{c.sub}</div>
                  </div>
                </div>
              </Card>
            ))}

            <Card style={{ padding: "18px 20px", background: "rgba(27,79,216,0.04)", borderColor: "rgba(27,79,216,0.15)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P, marginBottom: 6 }}>Agent Onboarding Enquiries</div>
              <p style={{ fontSize: 13, color: "#535364", lineHeight: 1.6, margin: "0 0 10px" }}>Interested in listing on Verifind as a certified agent? Email <strong>agents@verifind.ng</strong> with your REDAN licence number.</p>
            </Card>
          </div>

          {/* Form */}
          {sent ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", textAlign: "center" }}>
              <CheckCircle2 size={48} color="#059669" style={{ marginBottom: 16 }} />
              <h3 style={{ fontFamily: FONT_SER, fontSize: 24, fontWeight: 400, color: "#111116", margin: "0 0 8px" }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: "#535364", lineHeight: 1.6 }}>We'll get back to you within 2 hours. Check your email for a confirmation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontFamily: FONT_SER, fontSize: 22, fontWeight: 400, color: "#111116", margin: 0 }}>Send a Message</h3>
              {[
                { label: "Your Name", key: "name", type: "text", placeholder: "Adaora Nwosu" },
                { label: "Email Address", key: "email", type: "email", placeholder: "adaora@example.com" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#535364", marginBottom: 6 }}>{f.label}</label>
                  <input required type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: FONT_SAN, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#535364", marginBottom: 6 }}>I am a</label>
                <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: FONT_SAN }}>
                  <option value="tenant">Tenant with a question</option>
                  <option value="agent">Agent — onboarding enquiry</option>
                  <option value="landlord">Landlord</option>
                  <option value="press">Press / Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#535364", marginBottom: 6 }}>Message</label>
                <textarea required rows={4} placeholder="How can we help?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: FONT_SAN, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
              <Btn primary onClick={() => {}} style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending…" : <><MessageSquare size={15} /> Send Message</>}
              </Btn>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: HELP CENTER ────────────────────────────────────────────────────────
export function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("escrow");
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const categories = [
    { id: "escrow",   icon: <Wallet size={16} />,      label: "Escrow & Payments",      count: 8  },
    { id: "verify",   icon: <ShieldCheck size={16} />, label: "Verification Process",   count: 6  },
    { id: "kyc",      icon: <UserCheck size={16} />,   label: "Agent KYC",              count: 5  },
    { id: "listings", icon: <Building2 size={16} />,   label: "Listing Issues",         count: 7  },
    { id: "account",  icon: <Lock size={16} />,        label: "Account & Login",        count: 4  },
  ];

  const articles: Record<string, any[]>  = {
    escrow: [
      { title: "What happens if my inspection fails?",              popular: true,  body: "If the inspector finds the property doesn't match the listing — wrong size, different location, structural issues — your escrow funds are returned in full within 24 hours. The listing is suspended and the agent is flagged for review. You'll receive an email confirmation once the refund is processed." },
      { title: "How long does escrow take to release?",             popular: true,  body: "Funds are released to the agent exactly 48 hours after the inspector submits a passing confirmation report. This cooling-off period gives tenants time to raise any last-minute issues. You'll see the status update in your wallet as 'Escrow Releasing'." },
      { title: "Can I withdraw money from my wallet?",              popular: false, body: "Yes — available funds (not held in escrow) can be withdrawn to your registered bank account at any time. Withdrawals are processed via Paystack and arrive within 1–2 business days. Escrow-held funds cannot be withdrawn until released." },
      { title: "What currencies does Verifind support?",            popular: false, body: "Verifind currently only supports Nigerian Naira (₦). All wallet transactions, listing prices, and escrow releases are denominated in NGN. International card holders can fund their wallets but the transaction will be converted to NGN by Paystack." },
      { title: "Is my wallet money insured?",                       popular: false, body: "Verifind wallet funds are held in a segregated Paystack escrow account, not commingled with company funds. Paystack is regulated by the CBN. While we are not a licensed bank, your funds are protected by Paystack's infrastructure and our contractual obligations." },
      { title: "How do I add my bank account for withdrawals?",     popular: false, body: "Go to Settings → Payout Account → Add Bank Account. You'll need your 10-digit account number and bank name. We'll auto-verify the account name via the Paystack NUBAN lookup. This is the same flow as agent payout setup." },
      { title: "I paid into escrow but the agent says they got nothing.", popular: true, body: "This is by design — Verifind escrow means agents receive funds only after inspection. Show the agent your wallet transaction ID. The funds will release automatically 48 hours after a passing inspection. If the inspection hasn't happened yet, funds are safely held and will not move." },
      { title: "Can I get a receipt for my escrow payment?",        popular: false, body: "Yes. Every wallet transaction generates a PDF receipt. Go to Wallet → Transaction History → tap any transaction → Download Receipt. The receipt includes the Paystack reference number for independent verification." },
    ],
    verify: [
      { title: "How long does the full verification take?",         popular: true,  body: "The full 4-stage process typically takes 5–10 business days. Stage 1 (document upload) is immediate. The AGIS title search (Stage 2) takes 2–3 days. The physical site audit (Stage 3) is scheduled within 48 hours of payment and takes 1–2 days. Final certification (Stage 4) is same-day once the audit passes." },
      { title: "What documents do I need to start verification?",   popular: true,  body: "You need: a valid Survey Plan, a Deed of Assignment or Certificate of Occupancy (C-of-O), and — for corporate-owned properties — a CAC Certificate. Scanned copies (minimum 300dpi) are accepted. The documents are reviewed by our legal team before AGIS lookup." },
      { title: "Can I verify a property I'm renting out, not owning?", popular: false, body: "You must be the legal owner or hold a valid Power of Attorney to list on Verifind. A tenancy agreement does not grant listing rights. We verify ownership at Stage 2 via the AGIS database. Fraudulent listings are reported to the FCTA." },
      { title: "What if AGIS shows a discrepancy in my title?",     popular: false, body: "If the AGIS records don't match your documents, we pause verification and send you a detailed discrepancy report. Common issues include outdated survey plans or incomplete transfer chains. You can resolve these through the FCTA and re-submit. The ₦5,000 fee is non-refundable but we waive it for re-submissions." },
      { title: "What does the physical inspector look at?",         popular: true,  body: "The inspector confirms: property exists at the listed address, dimensions match the listing, photos accurately represent the property, there are no occupancy disputes, and structural integrity is as described. They submit a signed report with photos. If anything doesn't match, verification is paused." },
      { title: "Do I need to be present during the site audit?",    popular: false, body: "Either the owner or an authorised representative must be present. The inspector will not enter an unoccupied property alone. If you're unable to attend, you can authorise a Verifind agent to represent you — there's no additional charge for this." },
    ],
    kyc: [
      { title: "What documents do I need for Agent KYC?",           popular: true,  body: "You need: a government-issued ID (NIN or International Passport), your REDAN or NIESV licence number, proof of registered office address (utility bill or lease agreement not older than 3 months), and a professional headshot." },
      { title: "How long does KYC approval take?",                  popular: true,  body: "Standard KYC review takes 2–3 business days. We may request a video call if documents need clarification. You'll receive an email at each stage. Once approved, your profile gets the 'Certified Agent' badge and you can begin listing." },
      { title: "Can I list properties before KYC is complete?",     popular: false, body: "No. All agents must complete KYC before listing. You can create a draft listing and upload documents in advance, but the listing will not go live until your KYC is approved and the property passes verification." },
      { title: "My REDAN licence has expired — what do I do?",      popular: false, body: "You must renew your REDAN licence before applying for Verifind KYC. We do not accept expired licences. If your licence is pending renewal, you can still list under a valid supervising principal agent while your renewal is processed." },
      { title: "Can I have a Verifind account as an individual, not a company?", popular: false, body: "Yes — individual agents can register. You'll need your personal NIN/passport and your REDAN/NIESV individual member number. Company accounts require an additional CAC registration document." },
    ],
    listings: [
      { title: "Why was my listing rejected?",                      popular: true,  body: "Listings are rejected if: documents don't match AGIS records, the inspection report flags discrepancies, the price is outside market range, or the listing contains false information. You'll receive a detailed rejection report. Most issues are correctable and we encourage resubmission." },
      { title: "Can I edit a live listing?",                        popular: false, body: "You can edit price and description freely. Any changes to property size, location, or key features require a new physical inspection (₦15,000) to maintain verification status. Photo updates are reviewed by our team within 4 hours." },
      { title: "How do I take my listing offline temporarily?",     popular: false, body: "Go to Agent Dashboard → Your Listings → Pause. The listing disappears from search but retains its verified status for 90 days. After 90 days of inactivity, you'll need a new site audit to reactivate." },
      { title: "A tenant reported my listing as inaccurate. What happens?", popular: true, body: "Our dispute team reviews flagged listings within 24 hours. We may request an emergency inspection. If the complaint is upheld, the listing is suspended pending correction. Repeated violations result in agent account suspension. We take accuracy seriously — it's the entire point of Verifind." },
      { title: "Can I list multiple properties?",                   popular: false, body: "Yes — there's no limit on listings per agent. Each property must complete the full verification pipeline independently. Bulk verification (5+ properties) is available at a 20% discount — contact agents@verifind.ng." },
      { title: "How do I feature my listing at the top of search?", popular: false, body: "Verified listings are ranked by recency, verification score, and agent rating. There are no paid promotions — rankings are purely merit-based. The best way to rank higher is to maintain a high agent rating and keep your listing information current." },
      { title: "My listing expired — can I renew?",                 popular: false, body: "Listings remain active for 12 months. Before renewal, we require a quick document refresh to confirm ownership hasn't changed. If the property hasn't been let in 12 months, we also recommend a new site audit to verify current condition." },
    ],
    account: [
      { title: "How do I reset my password?",                       popular: false, body: "Click 'Forgot Password' on the login page. Enter your registered email. You'll receive a reset link valid for 15 minutes. If you don't receive the email, check your spam folder or contact support." },
      { title: "Can I change my registered email address?",         popular: false, body: "Yes — go to Settings → Account → Email Address. You'll need to verify both the old and new email addresses. Note: your wallet is linked to your email, so this change takes effect after 24 hours." },
      { title: "How do I delete my account?",                       popular: false, body: "Account deletion is irreversible. If you have an active escrow balance or live listings, you must resolve those first. To request deletion, email privacy@verifind.ng from your registered email address. We'll process your request within 7 days in line with NDPR." },
      { title: "I can't log in — what do I do?",                    popular: true,  body: "First try resetting your password. If that doesn't work, check that you're using the email address you registered with (not a WhatsApp number). If the issue persists, contact support@verifind.ng with your wallet ID (VF-XXXXXX) and we'll investigate within 1 hour." },
    ],
  };

  const currentArticles = articles[activeCategory] || [];
  const filtered = search
    ? Object.values(articles).flat().filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : currentArticles;

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh", fontFamily: FONT_SAN }}>
      {/* Hero */}
      <TopNav />
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a3a8a 100%)`, padding: "56px 24px 40px", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <SectionLabel>Help Center</SectionLabel>
          <H2 light>How can we help?</H2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Search size={16} color="rgba(255,255,255,0.6)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for answers…" style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 15, fontFamily: FONT_SAN, flex: 1 }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}><X size={14} /></button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {!search && (
          /* Category chips */
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 12,
                border: `1.5px solid ${activeCategory === c.id ? P : "#E5E7EB"}`,
                background: activeCategory === c.id ? `${P}0d` : "#fff",
                color: activeCategory === c.id ? P : "#535364",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT_SAN, transition: "all 0.15s",
              }}>
                {c.icon} {c.label}
                <span style={{ fontSize: 11, background: activeCategory === c.id ? P : "#F3F4F6", color: activeCategory === c.id ? "#fff" : "#9CA3AF", padding: "1px 7px", borderRadius: 99, fontWeight: 700 }}>{c.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Popular articles */}
        {!search && (
          <div style={{ marginBottom: 10 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#535364", margin: "0 0 12px" }}>
              {search ? "Search Results" : `${categories.find(c => c.id === activeCategory)?.label}`}
            </h4>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((article, i) => (
            <div key={article.title} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${openArticle === i ? P + "40" : "#E5E7EB"}`, overflow: "hidden" }}>
              <button
                onClick={() => setOpenArticle(openArticle === i ? null : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <HelpCircle size={16} color={openArticle === i ? P : "#9CA3AF"} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#111116" }}>{article.title}</span>
                {article.popular && <span style={{ fontSize: 10, fontWeight: 800, color: "#D97706", background: "rgba(217,119,6,0.1)", padding: "2px 7px", borderRadius: 99 }}>Popular</span>}
                <span style={{ transform: openArticle === i ? "rotate(180deg)" : "none", transition: "0.2s", color: "#9CA3AF", flexShrink: 0 }}><ChevronDown size={16} /></span>
              </button>
              {openArticle === i && (
                <div style={{ padding: "0 20px 20px 50px", fontSize: 14, color: "#535364", lineHeight: 1.75 }}>
                  {article.body}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9CA3AF" }}>
              <HelpCircle size={32} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No articles found for "{search}"</div>
              <div style={{ fontSize: 13 }}>Try a different search term or contact us directly.</div>
            </div>
          )}
        </div>

        {/* Still need help */}
        <div style={{ marginTop: 40, background: `linear-gradient(135deg, ${P}0a, ${P}06)`, borderRadius: 20, border: `1px solid ${P}20`, padding: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h4 style={{ fontFamily: FONT_SER, fontSize: 20, fontWeight: 400, color: "#111116", margin: "0 0 6px" }}>Still need help?</h4>
            <p style={{ fontSize: 14, color: "#535364", margin: 0 }}>Our support team is online Mon–Fri, 8am–6pm WAT. We respond within 2 hours.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn small><MessageSquare size={14} /> WhatsApp</Btn>
            <Btn primary small><Mail size={14} /> Email Support</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}