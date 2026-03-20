import React from 'react';

interface LoadingWaveProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingWave: React.FC<LoadingWaveProps> = ({ text, size = 'md' }) => {
  
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6';
  const fontSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg';

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full min-h-[200px]">
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`wave-dot rounded-full bg-[var(--color-primary)] ${dotSize}`}
            style={{ 
              animationDelay: `${i * 0.1}s`,
              boxShadow: `0 0 10px rgba(var(--color-primary-rgb), 0.5)`
            }}
          />
        ))}
      </div>
      {text && (
        <p className={`${fontSize} font-medium text-[var(--text-secondary)] animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};