import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Bed, Building2, TrendingUp } from 'lucide-react';

interface AnimatedSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  listingMode?: 'rent' | 'buy' | 'sell';
  className?: string;
}

const SUGGESTIONS: Record<string, string[]> = {
  rent: [
    'Search in Maitama...',
    '3 bedroom in Gwarimpa...',
    'Furnished apartment in Jabi...',
    'Duplex under ₦2M in Asokoro...',
    'Studio near Central Area...',
    'Self-contain in Wuse Zone 5...',
    'Serviced flat in Katampe...',
    '2 bed in Life Camp...',
    'Verified listings in Guzape...',
  ],
  buy: [
    'Buy a home in Maitama...',
    '4 bedroom house in Asokoro...',
    'Plot for sale in Katampe...',
    'Duplex in Guzape under ₦120M...',
    'Investment property in Wuse...',
    'Family home in Gwarimpa...',
    'New development in Dawaki...',
  ],
  sell: [
    'List your Maitama property...',
    'Sell your apartment fast...',
    'Post a verified listing...',
    'Reach 10,000+ verified buyers...',
    'Get agent match in Gwarimpa...',
    'List a duplex in Jabi...',
  ],
};

const QUICK_SEARCHES = [
  { label: 'Maitama',    icon: <MapPin size={12} />      },
  { label: 'Jabi',       icon: <MapPin size={12} />      },
  { label: '3 bedrooms', icon: <Bed size={12} />         },
  { label: 'Verified',   icon: <Building2 size={12} />   },
  { label: 'Furnished',  icon: <TrendingUp size={12} />  },
];

const TRENDING = ['Maitama', 'Jabi', 'Gwarimpa', 'Asokoro', 'Guzape'];

export const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
  value, onChange, onSubmit, listingMode = 'rent', className = '',
}) => {
  const suggestions = SUGGESTIONS[listingMode] ?? SUGGESTIONS.rent;

  const [displayed,     setDisplayed]     = useState('');
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [phase,         setPhase]         = useState<'typing' | 'pausing' | 'deleting' | 'waiting'>('typing');
  const [charIdx,       setCharIdx]       = useState(0);
  const [isFocused,     setIsFocused]     = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown,  setShowDropdown]  = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const tick = useCallback(() => {
    const target = suggestions[suggestionIdx];
    if (phase === 'typing') {
      if (charIdx < target.length) {
        setDisplayed(target.slice(0, charIdx + 1));
        setCharIdx(i => i + 1);
        timerRef.current = setTimeout(tick, 45 + Math.random() * 20);
      } else {
        setPhase('pausing');
        timerRef.current = setTimeout(() => setPhase('deleting'), 2200);
      }
    } else if (phase === 'deleting') {
      if (charIdx > 0) {
        setDisplayed(target.slice(0, charIdx - 1));
        setCharIdx(i => i - 1);
        timerRef.current = setTimeout(tick, 22);
      } else {
        setDisplayed('');
        setPhase('waiting');
        timerRef.current = setTimeout(() => {
          setSuggestionIdx(i => (i + 1) % suggestions.length);
          setPhase('typing');
        }, 400);
      }
    }
  }, [phase, charIdx, suggestionIdx, suggestions]);

  useEffect(() => {
    if (isFocused) return;
    timerRef.current = setTimeout(tick, 45);
    return () => clearTimeout(timerRef.current);
  }, [tick, isFocused]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    setDisplayed(''); setCharIdx(0); setSuggestionIdx(0); setPhase('typing');
  }, [listingMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setRecentSearches(prev => [value, ...prev.filter(s => s !== value)].slice(0, 3));
    onSubmit();
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleQuickSearch = (label: string) => {
    onChange(label);
    setShowDropdown(false);
    setTimeout(onSubmit, 0);
  };

  return (
    <div className={`relative flex-1 max-w-xl ${className}`}>
      <form onSubmit={handleSubmit}
        className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 transition-all duration-200"
        style={{
          background:   isFocused ? 'var(--bg-surface)' : 'var(--bg-surface-alt)',
          border:       `1.5px solid ${isFocused ? 'var(--color-primary)' : 'var(--border-color)'}`,
          boxShadow:    isFocused ? '0 0 0 3px rgba(var(--color-primary-rgb),.1)' : 'var(--shadow-xs)',
        }}>

        {/* Icon */}
        <div className="shrink-0 transition-colors" style={{ color: isFocused ? 'var(--color-primary)' : 'var(--text-muted)' }}>
          <Search size={15} />
        </div>

        {/* Input + animated ghost placeholder */}
        <div className="relative flex-1 h-5">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => { setIsFocused(true); setShowDropdown(true); }}
            onBlur={() => setTimeout(() => { setIsFocused(false); setShowDropdown(false); }, 150)}
            className="absolute inset-0 w-full bg-transparent outline-none border-none p-0 text-sm"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
            autoComplete="off"
          />
          {/* Ghost placeholder — only when input empty */}
          {!value && (
            <div aria-hidden className="absolute inset-0 flex items-center pointer-events-none select-none">
              <span className="text-sm whitespace-nowrap overflow-hidden" style={{ color: 'var(--text-muted)' }}>
                {displayed}
                {!isFocused && (
                  <span className="inline-block w-[1.5px] h-[13px] ml-[1px] align-middle"
                    style={{ background: 'var(--color-primary)', animation: 'cursor-blink 1s step-end infinite' }} />
                )}
              </span>
            </div>
          )}
        </div>

        {/* Clear */}
        {value && (
          <button type="button" onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="shrink-0 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        )}

        {/* Search button */}
        <button type="submit" disabled={!value}
          className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all"
          style={value
            ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 8px rgba(var(--color-primary-rgb),.35)' }
            : { background: 'var(--border-color)', color: 'var(--text-muted)', opacity: 0.5 }
          }>
          <Search size={12} />
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-150"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>

          {recentSearches.length > 0 && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>Recent</p>
              {recentSearches.map(s => (
                <button key={s} onMouseDown={() => handleQuickSearch(s)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-alt)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <Search size={12} style={{ color: 'var(--text-muted)' }} /> {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <p className="text-[9px] font-black uppercase tracking-widest px-2 mb-2" style={{ color: 'var(--text-muted)' }}>Quick Search</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_SEARCHES.map(qs => (
                <button key={qs.label} onMouseDown={() => handleQuickSearch(qs.label)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all"
                  style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-active-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-alt)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
                  <span style={{ color: 'var(--color-primary)' }}>{qs.icon}</span> {qs.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <p className="text-[9px] font-black uppercase tracking-widest px-2 mb-2" style={{ color: 'var(--text-muted)' }}>Trending</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {TRENDING.map((d, i) => (
                <button key={d} onMouseDown={() => handleQuickSearch(d)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full transition-all"
                  style={{ background: 'var(--nav-active-bg)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb),.15)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>#{i + 1}</span> {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
};
