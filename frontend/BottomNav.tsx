import React, { useState } from 'react';
import { AppMode, User } from '../types';
import { 
  Search, MessageSquare, Wallet, User as UserIcon, 
  Settings, Sun, Moon, LogOut, ChevronUp 
} from 'lucide-react';
import { useTheme, AccentColor, FontSize } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavProps {
  currentMode: AppMode | 'profile';
  onModeChange: (mode: any) => void;
  user: User | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentMode, onModeChange, user }) => {
  const { theme, toggleTheme, accent, setAccent, fontSize, setFontSize } = useTheme();
  const { logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Core Mobile Modes
  const navItems = [
    { id: AppMode.BROWSE, icon: <Search size={22} />, label: 'Explore' },
    { id: AppMode.CHAT_ASSISTANT, icon: <MessageSquare size={22} />, label: 'AI Chat' },
    { id: AppMode.WALLET, icon: <Wallet size={22} />, label: 'Escrow' },
    { id: 'profile', icon: <UserIcon size={22} />, label: 'Profile' },
  ];

  const colors: { id: AccentColor; hex: string }[] = [
    { id: 'red', hex: '#FF3B30' },
    { id: 'purple', hex: '#AF52DE' },
    { id: 'orange', hex: '#FF9500' },
    { id: 'black', hex: '#1C1C1E' },
    { id: 'white', hex: '#E5E5EA' },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: 'small', label: 'A' },
    { id: 'medium', label: 'AA' },
    { id: 'large', label: 'AAA' },
  ];

  return (
    <>
      {/* Settings Expandable Panel */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="absolute bottom-24 left-4 right-4 glass p-6 rounded-3xl animate-in slide-in-from-bottom-10 duration-300 shadow-2xl space-y-6 border border-[var(--border-color)] bg-[var(--bg-surface-solid)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">App Settings</h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="p-2 rounded-full hover:bg-black/5"
              >
                <ChevronUp size={20} className="rotate-180" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Accent Color</label>
              <div className="grid grid-cols-5 gap-3">
                {colors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAccent(c.id)}
                    className={`h-10 rounded-xl transition-all ${accent === c.id ? 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-105 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Font Size</label>
              <div className="flex bg-[var(--bg-app)] p-1.5 rounded-2xl gap-2">
                {fontSizes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${fontSize === s.id ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={toggleTheme}
                className="py-4 rounded-2xl bg-[var(--bg-app)] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-primary)] active:scale-95 transition-transform"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              <button 
                onClick={logout}
                className="py-4 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-20 glass rounded-[2.5rem] z-50 flex items-center justify-between px-2 shadow-2xl border border-white/20">
        
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { onModeChange(item.id); setShowSettings(false); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-3xl transition-all duration-300 ${
              currentMode === item.id 
                ? 'text-[var(--color-primary)] scale-110 -translate-y-2' 
                : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
            }`}
          >
            <div className={`p-2 rounded-2xl ${currentMode === item.id ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/30' : ''}`}>
              {item.icon}
            </div>
            {currentMode !== item.id && (
              <span className="text-[9px] font-bold uppercase tracking-widest scale-75 origin-top">{item.label}</span>
            )}
          </button>
        ))}

        {/* Settings Toggle Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-3xl transition-all duration-300 ${
            showSettings 
              ? 'text-[var(--text-primary)]' 
              : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
          }`}
        >
           <div className={`p-2 rounded-2xl ${showSettings ? 'bg-[var(--bg-app)]' : ''}`}>
             <Settings size={22} />
           </div>
           {!showSettings && <span className="text-[9px] font-bold uppercase tracking-widest scale-75 origin-top">Settings</span>}
        </button>

      </div>
    </>
  );
};