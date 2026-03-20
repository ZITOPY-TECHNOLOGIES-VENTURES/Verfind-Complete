
import React, { useEffect, useState, useRef } from 'react';
import { LiveSession } from '../services/geminiService';
import { PhoneOff, Mic, MicOff, Volume2, Activity, ShieldCheck, User } from 'lucide-react';
import { Property } from '../types';

interface LiveCallOverlayProps {
  property: Property;
  onClose: () => void;
}

export const LiveCallOverlay: React.FC<LiveCallOverlayProps> = ({ property, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState('Initializing Bridge...');
  const sessionRef = useRef<LiveSession | null>(null);

  useEffect(() => {
    const session = new LiveSession();
    sessionRef.current = session;

    session.onConnect = () => {
      setIsActive(true);
      setStatus('Connected to Agent Bridge');
    };

    session.onDisconnect = () => {
      setIsActive(false);
      setStatus('Call Ended');
      setTimeout(onClose, 1500);
    };

    session.onVolume = (v) => setVolume(v);
    session.onError = (e) => setStatus('Connection Error');

    session.connect();

    return () => {
      session.disconnect();
    };
  }, []);

  const handleEndCall = () => {
    sessionRef.current?.disconnect();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-between p-8 md:p-12 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="w-full max-w-lg flex items-center justify-between opacity-60">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Verifind Line</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Bridge</span>
        </div>
      </div>

      {/* Main Pulse Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative mb-12">
          {/* Pulsing rings */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            </>
          )}
          
          <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col items-center justify-center shadow-2xl transition-transform duration-75 ${isActive ? 'scale-105' : 'scale-100'}`}
               style={{ transform: `scale(${1 + volume * 2})` }}>
            <User size={64} className="text-white/20 mb-2" />
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1 bg-white rounded-full transition-all`} 
                     style={{ height: isActive ? `${12 + Math.random() * 24}px` : '4px' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase">{property.title}</h2>
          <p className="text-blue-400 font-black text-sm uppercase tracking-widest animate-pulse">
            {status}
          </p>
          <p className="text-white/40 text-xs max-w-xs mx-auto leading-relaxed">
            State your name and preferred inspection time when the AI assistant greets you.
          </p>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="w-full max-w-2xl h-16 flex items-center justify-center gap-1.5 mb-12">
        {Array.from({ length: 40 }).map((_, i) => {
          const h = isActive ? 4 + Math.random() * (volume * 150 + 10) : 4;
          return (
            <div key={i} 
                 className={`w-1 rounded-full transition-all duration-75 ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`} 
                 style={{ height: `${h}px` }} />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mb-8">
        <button className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <MicOff size={24} />
        </button>
        <button 
          onClick={handleEndCall}
          className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-600/40 hover:bg-red-700 active:scale-90 transition-all"
        >
          <PhoneOff size={32} />
        </button>
        <button className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <Volume2 size={24} />
        </button>
      </div>

      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
        Powered by Gemini 2.5 Native Audio
      </div>
    </div>
  );
};
