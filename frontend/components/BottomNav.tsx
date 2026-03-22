import React, { useState } from 'react';
import { AppMode, User } from '../types';
import { Search, MessageSquare, Wallet, User as UserIcon, Settings, Users, LogOut, ChevronDown } from 'lucide-react';
import { useTheme, AccentColor, FontSize } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavProps {
  currentMode: AppMode | 'profile';
  onModeChange: (mode: any) => void;
  user: User | null;
  onFindAgentClick?: (e: React.MouseEvent) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentMode, onModeChange, user, onFindAgentClick }) => {
  const { theme, resolvedTheme, toggleTheme, setTheme, accent, setAccent, fontSize, setFontSize } = useTheme();
  const { logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { id: AppMode.BROWSE,           icon: <Search size={20} />,       label: 'Explore' },
    { id: AppMode.FIND_AGENT,       icon: <Users size={20} />,        label: 'Agents' },
    { id: AppMode.CHAT_ASSISTANT,   icon: <MessageSquare size={20} />, label: 'AI Chat' },
    { id: 'profile',                icon: <UserIcon size={20} />,     label: 'Profile' },
  ];

  const colors: { id: AccentColor; hex: string }[] = [
    { id: 'blue',   hex: '#0A66C2' },
    { id: 'red',    hex: '#D92D20' },
    { id: 'purple', hex: '#7C3AED' },
    { id: 'orange', hex: '#EA580C' },
    { id: 'teal',   hex: '#0D9488' },
    { id: 'black',  hex: '#18181B' },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: 'small', label: 'A' }, { id: 'medium', label: 'Aa' }, { id: 'large', label: 'AAA' },
  ];

  return (
    <>
      {/* Settings overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'var(--bg-overlay)' }}
          onClick={() => setShowSettings(false)}>
          <div className="absolute bottom-24 left-4 right-4 rounded-3xl p-6 space-y-5 animate-in slide-in-from-bottom-10"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-full"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronDown size={18} />
              </button>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Accent Colour</p>
              <div className="grid grid-cols-6 gap-2">
                {colors.map(c => (
                  <button key={c.id} onClick={() => setAccent(c.id)}
                    className="h-9 rounded-xl transition-all"
                    style={{ background: c.hex, opacity: accent === c.id ? 1 : 0.45,
                      outline: accent === c.id ? `2.5px solid ${c.hex}` : 'none',
                      outlineOffset: '2px', transform: accent === c.id ? 'scale(1.1)' : 'scale(1)' }} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Font Size</p>
              <div className="flex p-1.5 rounded-2xl gap-1.5" style={{ background: 'var(--bg-surface-alt)' }}>
                {fontSizes.map(s => (
                  <button key={s.id} onClick={() => setFontSize(s.id)}
                    className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all"
                    style={{ background: fontSize === s.id ? 'var(--color-primary)' : 'transparent',
                      color: fontSize === s.id ? '#fff' : 'var(--text-muted)' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
                Appearance {theme === 'auto' && '· Auto'}
              </p>
              <div className="flex p-1.5 rounded-2xl gap-1.5" style={{ background: 'var(--bg-surface-alt)' }}>
                {([
                  { id: 'auto',  label: 'Auto',  icon: '⚙️' },
                  { id: 'light', label: 'Light', icon: '☀️' },
                  { id: 'dark',  label: 'Dark',  icon: '🌙' },
                ] as { id: 'auto'|'light'|'dark'; label: string; icon: string }[]).map(opt => (
                  <button key={opt.id} onClick={() => setTheme(opt.id)}
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: theme === opt.id ? 'var(--color-primary)' : 'transparent',
                      color: theme === opt.id ? '#fff' : 'var(--text-muted)',
                    }}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {user && (
              <button onClick={logout}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                style={{ background: '#FEF2F2', color: '#DC2626' }}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 h-[68px] rounded-[2.5rem] z-50 flex items-center justify-around px-2"
        style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
        {navItems.map(item => {
          const active = currentMode === item.id;
          return (
            <button key={item.id}
              onClick={(e) => { 
                if (item.id === AppMode.FIND_AGENT && onFindAgentClick) {
                  onFindAgentClick(e);
                } else {
                  onModeChange(item.id); 
                }
                setShowSettings(false); 
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-3xl transition-all"
              style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              <div className="p-2 rounded-2xl transition-all"
                style={{ background: active ? 'var(--nav-active-bg)' : 'transparent',
                  transform: active ? 'scale(1.1) translateY(-2px)' : 'scale(1)' }}>
                {item.icon}
              </div>
              {!active && <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>}
            </button>
          );
        })}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-3xl transition-all"
          style={{ color: showSettings ? 'var(--color-primary)' : 'var(--text-muted)' }}>
          <div className="p-2 rounded-2xl" style={{ background: showSettings ? 'var(--nav-active-bg)' : 'transparent' }}>
            <Settings size={20} />
          </div>
          {!showSettings && <span className="text-[9px] font-bold uppercase tracking-widest">More</span>}
        </button>
      </div>
    </>
  );
};
