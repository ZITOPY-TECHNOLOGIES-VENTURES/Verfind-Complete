import React, { useMemo } from 'react';

const LiquidBackground: React.FC = () => {
  // Stable configuration for 6 large organic liquid blobs
  const blobs = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const size = Math.random() * 50 + 40; // Size between 40vw and 90vw
      const top = Math.random() * 80 - 10;
      const left = Math.random() * 80 - 10;
      const duration = Math.random() * 15 + 25; // Slower, liquid-like movement
      const delay = Math.random() * -30;
      const isPrimary = i % 2 === 0;

      return (
        <div
          key={i}
          className="liquid-blob"
          style={{
            width: `${size}vw`,
            height: `${size}vw`,
            top: `${top}%`,
            left: `${left}%`,
            background: isPrimary 
              ? 'radial-gradient(circle at 30% 30%, var(--bubble-1) 0%, transparent 60%)' 
              : 'radial-gradient(circle at 70% 70%, var(--bubble-2) 0%, transparent 60%)',
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    });
  }, []);

  return (
    <div className="liquid-bg-container">
      {blobs}
    </div>
  );
};

export default LiquidBackground;