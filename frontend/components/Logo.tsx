
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32, showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="fold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Main Folding Path: Arrow turned Building */}
        <path 
          d="M20 80 L20 40 L50 15 L80 40 L80 25 L90 25 L90 50 L80 50 L80 80 Z" 
          fill="url(#logo-gradient)"
        />
        
        {/* Origami Fold Detail: The 'Upward Arrow' element */}
        <path 
          d="M20 40 L50 45 L80 40 L50 15 Z" 
          fill="url(#fold-gradient)"
          className="opacity-80"
        />
        
        {/* The Arrow Head Tip pointing up-right */}
        <path 
          d="M65 15 L85 15 L85 35" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M50 50 L85 15" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
      </svg>
      {showText && (
        <span className="font-black text-xl tracking-tighter text-[var(--text-primary)]">
          Veri<span className="text-primary">find</span>
        </span>
      )}
    </div>
  );
};
