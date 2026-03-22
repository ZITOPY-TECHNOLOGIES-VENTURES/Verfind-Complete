import React from 'react';
import { Logo } from './Logo';

interface LoadingWaveProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingWave: React.FC<LoadingWaveProps> = ({ text, size = 'md' }) => {
  const logoSize = size === 'sm' ? 32 : size === 'md' ? 64 : 100;
  const fontSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg';

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full min-h-[200px]">
      <div className="mb-4">
        {/* Render the fully animated Logo, without the Verifind text to keep it minimal as a loader */}
        <Logo size={logoSize} showText={false} animated={true} />
      </div>
      {text && (
        <p className={`${fontSize} font-medium text-[var(--text-secondary)] animate-pulse`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {text}
        </p>
      )}
    </div>
  );
};