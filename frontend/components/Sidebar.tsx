import React, { useState } from 'react';
import { AppMode, User } from '../types';
import {
  Search, Building, Wallet, Calendar, MessageSquare,
  LogOut, Settings, Sun, Moon, LogIn, Globe, Database
} from 'lucide-react';
import { useTheme, AccentColor, FontSize } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Logo } from './Logo';

interface SidebarProps {
  currentMode: AppMode | 'profile';
  onModeChange: (mode: any) => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, user }) => {
  const { theme, resolvedTheme, toggleTheme, setTheme, accent, setAccent, fontSize, setFontSize } = useTheme();
  const { logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const isAgent = user?.role === 'agent' || user?.role === 'admin';
  const isLive  = api.isLiveMode();

  const modes = [
    { id: AppMode.BROWSE,           label: 'Browse',    icon: <Search size={18} />        },
    ...(isAgent ? [{ id: AppMode.MANAGE_LISTINGS, label: 'Listings', icon: <Building size={18} /> }] : []),
    ...(user ? [
      { id: AppMode.INSPECTIONS,    label: 'Calendar',  icon: <Calendar size={18} />      },
      { id: AppMode.WALLET,         label: 'Escrow',    icon: <Wallet size={18} />        },
      { id: AppMode.CHAT_ASSISTANT, label: 'AI Helper', icon: <MessageSquare size={18} /> },
    ] : []),
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
    { id: 'small', label: 'A' }, { id: 'medium', label: 'Aa' }, { id: 'large', label: 'AA' },
  ];

  const s = (active: boolean) => ({
    background: active ? 'var(--nav-active-bg)' : 'transparent',
    color:      active ? 'var(--color-primary)'  : 'var(--nav-text)',
  });

  return (
    <div className="hidden md:flex w-64 flex-shrink-0 h-full z-20 flex-col p-4">
      <div className="flex-1 flex flex-col overflow-hidden rounded-3xl"
        style={{ background: 'var(--nav-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>

        {/* Brand */}
        <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <Logo showText size={30} />
        </div>

        {/* Profile area */}
        <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          {user ? (
            <button onClick={() => onModeChange('profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all"
              style={s(currentMode === 'profile')}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{ background: 'var(--color-primary)' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
              </div>
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all"
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--nav-active-bg)' }}>
                <LogIn size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">Guest User</p>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Click to Login</p>
              </div>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {modes.map(mode => {
            const active = currentMode === mode.id;
            return (
              <button key={mode.id}
                onClick={() => { onModeChange(mode.id); setShowSettings(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm"
                style={{ ...s(active), fontWeight: active ? '700' : '500' }}>
                <span style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>{mode.icon}</span>
                {mode.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Bridge status */}
        <div className="px-5 py-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: isLive ? '#22C55E' : '#F59E0B' }} />
            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {isLive ? <Globe size={9} /> : <Database size={9} />}
              {isLive ? 'Live Bridge' : 'Local Engine'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 relative" style={{ borderTop: '1px solid var(--border-color)' }}>
          {showSettings && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 rounded-2xl p-4 space-y-4 animate-in slide-in-from-bottom-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)', zIndex: 50 }}>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Accent</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {colors.map(c => (
                    <button key={c.id} onClick={() => setAccent(c.id)}
                      className="h-6 rounded-lg transition-all"
                      style={{ background: c.hex, opacity: accent === c.id ? 1 : 0.45,
                        outline: accent === c.id ? `2.5px solid ${c.hex}` : 'none',
                        outlineOffset: '2px', transform: accent === c.id ? 'scale(1.1)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Text Size</p>
                <div className="flex p-1 rounded-xl gap-1" style={{ background: 'var(--bg-surface-alt)' }}>
                  {fontSizes.map(s => (
                    <button key={s.id} onClick={() => setFontSize(s.id)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
                      style={{ background: fontSize === s.id ? 'var(--bg-surface)' : 'transparent',
                        color: fontSize === s.id ? 'var(--color-primary)' : 'var(--text-muted)',
                        boxShadow: fontSize === s.id ? 'var(--shadow-xs)' : 'none' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Theme — 3-way: Auto / Light / Dark */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Appearance {theme === 'auto' && <span style={{ color: 'var(--color-primary)' }}>· Auto</span>}
                </p>
                <div className="flex p-1 rounded-xl gap-1" style={{ background: 'var(--bg-surface-alt)' }}>
                  {([
                    { id: 'auto',  label: 'Auto', icon: '⚙️' },
                    { id: 'light', label: 'Light', icon: '☀️' },
                    { id: 'dark',  label: 'Dark',  icon: '🌙' },
                  ] as { id: 'auto' | 'light' | 'dark'; label: string; icon: string }[]).map(opt => (
                    <button key={opt.id} onClick={() => setTheme(opt.id)}
                      className="flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                      style={{
                        background: theme === opt.id ? 'var(--bg-surface)' : 'transparent',
                        color: theme === opt.id ? 'var(--color-primary)' : 'var(--text-muted)',
                        boxShadow: theme === opt.id ? 'var(--shadow-xs)' : 'none',
                      }}>
                      <span style={{ fontSize: '10px' }}>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(!showSettings)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              style={{ background: showSettings ? 'var(--color-primary)' : 'var(--bg-surface-alt)',
                color: showSettings ? '#fff' : 'var(--text-secondary)' }}>
              <Settings size={15} /> Settings
            </button>
            {user && (
              <button onClick={logout} title="Logout" className="p-2.5 rounded-xl transition-all"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2' }}>
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
