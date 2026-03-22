import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Logo } from './Logo';

const Z = {
  blue: "#1B4FD8",
  blueDark: "#0E3A6E",
  blueLight: "#E8F0FE",
  black: "#111116",
  gray: "#535364",
  grayLight: "#CDCDD3",
  grayBg: "#F5F5F7",
  white: "#FFFFFF",
  green: "#34D399",
  font: "'DM Sans', sans-serif",
  fontDisplay: "'Fraunces', Georgia, serif",
};

const RTB_CARDS = [
  {
    id: "buy",
    title: "Buy a home",
    body: "Connect with verified agents who can provide a clear breakdown of costs so you can avoid surprise expenses.",
    cta: "Find properties",
    href: "/dashboard",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rent",
    title: "Rent a home",
    body: "We're creating a seamless online experience – from shopping on the largest verified rental network, to applying securely.",
    cta: "Find rentals",
    href: "/dashboard",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sell",
    title: "List a property",
    body: "No matter what path you take to list your property or short-let, we can help you navigate a successful process.",
    cta: "See your options",
    href: "/dashboard",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
];

const BROWSE_SECTIONS = [
  {
    label: "Abuja Real Estate",
    links: [
      "Maitama real estate", "Asokoro real estate", "Wuse II real estate",
      "Gwarimpa real estate", "Jabi real estate", "Guzape real estate",
      "Katampe real estate", "Life Camp real estate", "Lugbe real estate"
    ],
  },
  {
    label: "Lagos Real Estate",
    links: [
      "Ikoyi apartments for rent", "Victoria Island apartments",
      "Lekki Phase 1 rentals", "Ikeja GRA properties",
      "Yaba apartments for rent", "Surulere rentals",
      "Ajah properties", "Magodo houses for sale"
    ],
  },
  {
    label: "Top Nigerian Cities",
    links: [
      "Port Harcourt real estate", "Ibadan real estate",
      "Kano real estate", "Enugu real estate",
      "Asaba real estate", "Uyo real estate",
      "Owerri real estate", "Calabar real estate"
    ],
  },
];

const FOOTER_LINKS = [
  "About", "VeriEstimates", "News", "Research", "Careers",
  "Applicant Privacy Notice", "Help", "Advertise", "Fair Housing Guide",
  "Advocacy", "Terms of use", "Privacy Notice", "Ad Choices",
  "Cookie Preference", "Learn", "AI Assistant", "Mobile Apps",
];

function BudgetMatchCard({ onAction }: { onAction: () => void }) {
  const [started, setStarted] = useState(false);

  return (
    <div
      style={{
        background: Z.white,
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: 24,
        fontFamily: Z.font,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: Z.blue,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Verifind Finance
        </span>
      </div>
      <h5
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: Z.black,
          margin: "0 0 10px",
          fontFamily: Z.fontDisplay,
          letterSpacing: '-0.02em'
        }}
      >
        Find homes you can afford with VeriMatch℠
      </h5>
      <p style={{ fontSize: 14, color: Z.gray, margin: "0 0 24px", lineHeight: 1.6 }}>
        Answer a few questions. We'll highlight properties in Nigeria you're likely to qualify for based on your budget.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Suggested target price", value: "₦ - -" },
          { label: "VeriMatch℠", value: "₦ - -" },
          { label: "Est. yearly rent", value: "₦ - -" },
          { label: "Agency/Legal fees", value: "- - %" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: Z.grayBg,
              borderRadius: 8,
              padding: "12px 14px",
              border: '1px solid rgba(0,0,0,0.03)'
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: Z.black,
                fontFamily: Z.fontDisplay,
              }}
            >
              {item.value}
            </div>
            <div style={{ fontSize: 12, color: Z.gray, marginTop: 4, fontWeight: 500 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setStarted(true); setTimeout(onAction, 600); }}
        style={{
          width: "100%",
          padding: "14px",
          background: started ? Z.green : Z.blue,
          color: Z.white,
          border: "none",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: Z.font,
          transition: "background 0.2s",
        }}
        className="hover:scale-[1.02] active:scale-95 transition-transform"
      >
        {started ? "✓ Getting started..." : "Let's get started"}
      </button>

      <p style={{ fontSize: 11, color: Z.gray, marginTop: 12, textAlign: "center", fontWeight: 500 }}>
        Powered by Verifind Partners · Verified Properties Only
      </p>
    </div>
  );
}

function RecommendationsCard({ onAction }: { onAction: () => void }) {
  return (
    <div
      style={{
        background: Z.white,
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        fontFamily: Z.font,
        display: "flex",
        flexDirection: "column",
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ padding: 28, flex: 1 }}>
        <h5
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: "0 0 12px",
            color: Z.black,
            fontFamily: Z.fontDisplay,
            letterSpacing: '-0.02em'
          }}
        >
          Get personalized recommendations
        </h5>
        <p style={{ fontSize: 14, color: Z.gray, margin: "0 0 24px", lineHeight: 1.6 }}>
          Sign in for a more customized experience, tailored exactly to the districts and budgets you care about.
        </p>
        <button
          onClick={onAction}
          style={{
            padding: "12px 24px",
            background: Z.white,
            color: Z.blue,
            border: `2px solid ${Z.blue}`,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: Z.font,
          }}
          className="hover:bg-blue-50 transition-colors"
        >
          Sign in or join
        </button>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 100%)",
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: '1px solid rgba(0,0,0,0.04)'
        }}
      >
        <svg viewBox="0 0 120 80" width="120" height="80" opacity="0.9">
          <rect x="20" y="35" width="80" height="45" fill="#c8d6f5" rx="2" />
          <polygon points="60,5 10,38 110,38" fill="#9db5ea" />
          <rect x="45" y="50" width="30" height="30" fill="#7a9cd9" rx="2" />
          <rect x="22" y="45" width="18" height="15" fill="#a8c0f0" rx="1" />
          <rect x="80" y="45" width="18" height="15" fill="#a8c0f0" rx="1" />
        </svg>
      </div>
    </div>
  );
}

const RTBCard: React.FC<{ card: any; onClick: () => void }> = ({ card, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: Z.white,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "pointer",
        fontFamily: Z.font,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        style={{
          height: 200,
          background: `url(${card.img}) center/cover`,
          backgroundColor: "#e8f0fe",
        }}
      />
      <div style={{ padding: "24px", display: 'flex', flexDirection: 'column', height: 'calc(100% - 200px)' }}>
        <h4
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: "0 0 12px",
            color: Z.black,
            fontFamily: Z.fontDisplay,
            letterSpacing: '-0.02em'
          }}
        >
          {card.title}
        </h4>
        <p
          style={{
            fontSize: 14,
            color: Z.gray,
            lineHeight: 1.6,
            margin: "0 0 24px",
            flex: 1,
          }}
        >
          {card.body}
        </p>
        <button
          style={{
            padding: "12px 20px",
            background: "transparent",
            color: Z.blue,
            border: `2px solid ${Z.blue}`,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: Z.font,
            width: 'fit-content'
          }}
          className="hover:bg-blue-600 hover:text-white transition-colors"
        >
          {card.cta}
        </button>
      </div>
    </div>
  );
}

const BrowseSection: React.FC<{ section: any }> = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? section.links : section.links.slice(0, 7);

  return (
    <div style={{ fontFamily: Z.font }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          color: Z.black,
          padding: "8px 0",
          fontFamily: Z.font,
        }}
        className="hover:text-blue-600 transition-colors"
      >
        {section.label}
        <span style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <ChevronDown size={16} />
        </span>
      </button>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, columns: 1, gap: 16, borderTop: `1px solid ${Z.grayLight}`, paddingTop: 12 }}>
        {visible.map((link: string) => (
          <li key={link} style={{ marginBottom: 10 }}>
            <a href="#" style={{ fontSize: 13, color: Z.gray, textDecoration: "none", fontWeight: 500 }} className="hover:text-blue-600 hover:underline">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardFooter({ isAuthenticated, onAuthRequired }: { isAuthenticated: boolean, onAuthRequired: () => void }) {
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (!isAuthenticated) {
      onAuthRequired();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ background: Z.white, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px" }}>
        
        {/* Two-col: Recommendations + BuyAbility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <RecommendationsCard onAction={handleAuthAction} />
          <BudgetMatchCard onAction={handleAuthAction} />
        </div>

        {/* RTB Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 text-left">
          {RTB_CARDS.map((card) => (
            <RTBCard key={card.id} card={card} onClick={handleAuthAction} />
          ))}
        </div>

        {/* About recommendations & Browse Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-10 border-t border-gray-200">
          <div className="lg:col-span-1">
            <h6 style={{ fontSize: 18, fontWeight: 600, color: Z.black, margin: "0 0 16px", fontFamily: Z.fontDisplay, letterSpacing: '-0.02em' }}>
              About Verifind's Recommendations
            </h6>
            <p style={{ fontSize: 14, color: Z.gray, lineHeight: 1.7, margin: 0 }}>
              Recommendations are based on your location and search activity throughout Nigeria, such as the verified homes
              you've viewed and saved. We use this information to instantly bring similar fraud-free properties to your attention.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
            {BROWSE_SECTIONS.map((section) => (
              <BrowseSection key={section.label} section={section} />
            ))}
          </div>
        </div>

      </div>

      {/* Global Footer */}
      <footer style={{ background: '#F9FAFB', borderTop: `1px solid ${Z.grayLight}`, padding: '40px 24px 60px', fontFamily: Z.font }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", marginBottom: 32 }}>
            {FOOTER_LINKS.map((link) => (
              <a key={link} href="#" style={{ fontSize: 13, color: Z.gray, textDecoration: "none", fontWeight: 500 }} className="hover:text-blue-600 hover:underline">
                {link}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.6, maxWidth: 800, margin: "0 auto 16px" }}>
            Verifind is committed to ensuring digital accessibility and a 100% fraud-free real estate experience for everyone across Nigeria.
            All properties are physically verified by our team of agents before listing.
          </p>
          <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.6, maxWidth: 800, margin: "0 auto 32px" }}>
            Verifind holds real estate brokerage licenses across multiple states in Nigeria.
            All property matches and financial estimators are provided by Verifind Partners, LLC. 
            Maitama, Abuja, FCT | Equal Housing Partner
          </p>

          <div style={{ borderTop: `1px solid ${Z.grayLight}`, paddingTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Logo size={24} showText={true} />
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span style={{ fontSize: 13, color: Z.gray, fontWeight: 500 }}>Follow us:</span>
              {["Facebook", "Instagram", "X (Twitter)"].map((s) => (
                <a key={s} href="#" style={{ textDecoration: "none", fontSize: 13, color: Z.blue, fontWeight: 600 }}>{s}</a>
              ))}
              <span style={{ fontSize: 13, color: Z.gray, fontWeight: 500, marginLeft: 10 }}>© 2026 Verifind Inc.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
