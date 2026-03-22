
import React from 'react';

interface LogoProps {
  size?: number | string;
  showText?: boolean;
  animated?: boolean;
  light?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  showText = true, 
  animated = false,
  light = false,
  className = "",
  style = {}
}) => {
  const numericSize = typeof size === 'string' ? parseInt(size) : size;
  const ratio = 360 / 288;
  const w = numericSize * ratio;
  const h = numericSize;

  const C1 = light ? "#ffffff" : "#1B3068";
  const TEXT = light ? "#ffffff" : "#111116";

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...style }} className={className}>
      {animated && (
        <style>
          {`
            @keyframes vf-inL  { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:none} }
            @keyframes vf-inR  { from{opacity:0;transform:translateX(30px)}  to{opacity:1;transform:none} }
            @keyframes vf-rise { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:none} }
            @keyframes vf-pop  { from{opacity:0;transform:scale(.70)}        to{opacity:1;transform:none} }
            @keyframes vf-draw { from{stroke-dashoffset:295} to{stroke-dashoffset:0} }
            @keyframes vf-drop {
              0%   { opacity:0; transform:translateY(-26px) scale(.6) }
              55%  { opacity:1; transform:translateY(5px)   scale(1.12) }
              80%  { transform:translateY(-2px) scale(.97) }
              100% { opacity:1; transform:none }
            }
            @keyframes vf-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
            @keyframes vf-idle { 0%,100%{transform:scale(1)} 50%{transform:scale(1.018)} }

            .vf-anim .rl { animation: vf-inL  .65s cubic-bezier(.22,1,.36,1) both  .05s }
            .vf-anim .rr { animation: vf-inR  .65s cubic-bezier(.22,1,.36,1) both  .15s }
            .vf-anim .sk { animation: vf-rise .5s  ease-out              both  .50s }
            .vf-anim .ho { animation: vf-pop  .42s ease-out              both  .85s }
            .vf-anim .ch {
              stroke-dasharray:  295;
              stroke-dashoffset: 295;
              animation: vf-draw 1.0s cubic-bezier(.4,0,.2,1) both  1.00s;
            }
            .vf-anim .lk { animation: vf-drop .55s cubic-bezier(.22,1,.36,1) both  1.65s }
            .vf-anim .tv { animation: vf-up   .45s ease-out              both  1.90s }
            .vf-anim .tf { animation: vf-up   .45s ease-out              both  2.10s }
            .vf-anim     { animation: vf-idle 4.0s ease-in-out       infinite  2.80s }
          `}
        </style>
      )}

      <svg 
        className={animated ? `vf-anim` : ""}
        width={w} 
        height={h}
        viewBox="0 0 360 288"
        style={{ display: 'block', overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── LEFT ASO ROCK ── */}
        <g className="rl">
          <path d="M 0,206
                   L 0,88
                   C 4,52 20,24 55,13
                   C 77,5  100,11 113,30
                   C 126,51 133,90 136,140
                   C 137,162 138,184 138,206 Z"
                fill={C1}/>
        </g>

        {/* ── RIGHT ASO ROCK ── */}
        <g className="rr">
          <path d="M 360,206
                   L 360,88
                   C 356,52 340,24 305,13
                   C 283,5  260,11 247,30
                   C 234,51 227,90 224,140
                   C 223,162 222,184 222,206 Z"
                fill={C1}/>
        </g>

        {/* ── CITY SKYLINE ── */}
        <g className="sk" fill={C1}>
          <rect x="141" y="177" width="9"  height="29"/>
          <rect x="152" y="166" width="10" height="40"/>
          <rect x="164" y="173" width="8"  height="33"/>
          <rect x="174" y="160" width="9"  height="46"/>
          <rect x="185" y="167" width="8"  height="39"/>
          <rect x="195" y="172" width="9"  height="34"/>
          <rect x="206" y="165" width="8"  height="41"/>
          <rect x="216" y="175" width="8"  height="31"/>
        </g>

        {/* ── CHECKMARK ── */}
        <polyline className="ch"
                  points="82,148 150,196 294,58"
                  fill="none"
                  stroke="#2D8B1E"
                  strokeWidth="21"
                  strokeLinecap="round"
                  strokeLinejoin="round"/>

        {/* ── HOUSE ── */}
        <g className="ho">
          <polygon points="128,174 150,153 172,174" fill="#C07818"/>
          <rect x="132" y="174" width="36" height="25" rx="2" fill="#C07818"/>
          <rect x="143" y="182" width="11" height="17" rx="1" fill="rgba(27,48,104,.50)"/>
          <rect x="134" y="178" width="7" height="6" rx="1" fill="rgba(27,48,104,.38)"/>
          <rect x="159" y="178" width="7" height="6" rx="1" fill="rgba(27,48,104,.38)"/>
        </g>

        {/* ── PADLOCK ── */}
        <g className="lk" transform="translate(285,45)">
          <path d="M -7,1 L -7,-9 A 7,10 0 0 1 7,-9 L 7,1"
                fill="none"
                stroke="#2D8B1E"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"/>
          <rect x="-12" y="1" width="24" height="20" rx="5" fill="#2D8B1E"/>
          <circle cx="0" cy="9.5" r="3.5" fill="rgba(255,255,255,.72)"/>
          <rect x="-1.6" y="11.5" width="3.2" height="5" rx="1" fill="rgba(255,255,255,.72)"/>
        </g>

        {/* ── WORDMARK ── */}
        {showText && (
          <>
            <text className="tv"
                  x="68" y="268"
                  fontFamily="'Arial Black','Franklin Gothic Heavy',Impact,sans-serif"
                  fontSize="56"
                  fontWeight="900"
                  fill="#1B3068"
                  letterSpacing="-1">Ver</text>
            <text className="tf"
                  x="178" y="268"
                  fontFamily="'Arial Black','Franklin Gothic Heavy',Impact,sans-serif"
                  fontSize="56"
                  fontWeight="900"
                  fill="#2D8B1E"
                  letterSpacing="-1">Find</text>
          </>
        )}
      </svg>
      {showText && (
        <span style={{ 
          fontFamily: "'Fraunces', serif", 
          fontSize: numericSize * 0.9, 
          fontWeight: 600, 
          color: TEXT,
          marginLeft: numericSize * 0.35,
          letterSpacing: '-0.02em',
        }}>
          Verifind
        </span>
      )}
    </div>
  );
};
