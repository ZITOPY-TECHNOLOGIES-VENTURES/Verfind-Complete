import React, { useEffect, useState } from 'react';
import { Mic, PhoneOff, Activity } from 'lucide-react';

interface LivePulseProps {
  isActive: boolean;
  volume: number; // 0 to 1
  onDisconnect: () => void;
}

export const LivePulse: React.FC<LivePulseProps> = ({ isActive, volume, onDisconnect }) => {
  const [visualData, setVisualData] = useState<number[]>(new Array(5).fill(20));

  useEffect(() => {
    if (isActive) {
      // Simulate multiple bars based on single volume input for effect
      const multiplier = 50 + (volume * 300); 
      setVisualData(prev => prev.map(() => 20 + Math.random() * multiplier));
    } else {
      setVisualData(new Array(5).fill(20));
    }
  }, [volume, isActive]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className={`text-2xl font-light tracking-widest mb-12 transition-colors duration-500 ${isActive ? 'text-accent' : 'text-slate-600'}`}>
          {isActive ? 'LISTENING' : 'CONNECTING...'}
        </div>

        {/* Central Orb/Pulse */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer Ripples */}
          {isActive && (
            <>
              <div 
                className="absolute inset-0 rounded-full bg-primary/20 animate-ping" 
                style={{ animationDuration: '2s' }} 
              />
              <div 
                className="absolute inset-0 rounded-full bg-accent/20 animate-ping" 
                style={{ animationDuration: '3s', animationDelay: '0.5s' }} 
              />
            </>
          )}
          
          {/* Main Circle */}
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-full shadow-2xl shadow-primary/50 flex items-center justify-center relative z-20 transition-transform duration-100"
             style={{ transform: `scale(${1 + volume})` }}
          >
            <Mic className="text-white w-10 h-10" />
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="h-24 flex items-center justify-center gap-3 mt-12">
          {visualData.map((h, i) => (
             <div 
               key={i}
               className="w-4 bg-slate-500/50 rounded-full transition-all duration-75"
               style={{ 
                 height: `${Math.min(h, 96)}px`,
                 opacity: isActive ? 0.8 : 0.3
               }} 
             />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-16">
          <button 
            onClick={onDisconnect}
            className="flex items-center gap-3 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/30 transition-all hover:scale-105"
          >
            <PhoneOff size={24} />
            <span className="font-semibold">End Session</span>
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-xs text-slate-500 flex items-center gap-2">
        <Activity size={14} />
        <span>Gemini 2.5 Flash Native Audio</span>
      </div>
    </div>
  );
};
