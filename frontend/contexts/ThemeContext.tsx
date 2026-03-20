import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';  // 'auto' = follow OS
export type AccentColor = 'blue' | 'red' | 'purple' | 'orange' | 'teal' | 'black';
export type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: ThemeMode;             // current user preference ('light' | 'dark' | 'auto')
  resolvedTheme: 'light' | 'dark'; // what's actually being displayed
  accent: AccentColor;
  fontSize: FontSize;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setAccent: (c: AccentColor) => void;
  setFontSize: (f: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
export const useTheme = () => useContext(ThemeContext);

/* ── Accent palettes ─────────────────────────────────────── */
const PALETTES: Record<AccentColor, { primary: string; rgb: string }> = {
  blue:   { primary: '#0A66C2', rgb: '10,102,194'  },
  red:    { primary: '#D92D20', rgb: '217,45,32'   },
  purple: { primary: '#7C3AED', rgb: '124,58,237'  },
  orange: { primary: '#EA580C', rgb: '234,88,12'   },
  teal:   { primary: '#0D9488', rgb: '13,148,136'  },
  black:  { primary: '#18181B', rgb: '24,24,27'    },
};

const FONT_SIZES: Record<FontSize, string> = {
  small: '13px', medium: '15px', large: '17px',
};

/* ── OS preference helper ────────────────────────────────── */
const getOSPreference = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /* Saved preference: 'light' | 'dark' | 'auto' (follow OS) */
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('vf-theme') as ThemeMode) ?? 'auto';
  });

  /* What's actually rendered (resolved from theme + OS) */
  const [osTheme, setOsTheme] = useState<'light' | 'dark'>(getOSPreference);

  const resolvedTheme: 'light' | 'dark' = theme === 'auto' ? osTheme : theme;

  const [accent, setAccentState]     = useState<AccentColor>(() =>
    (localStorage.getItem('vf-accent') as AccentColor) ?? 'blue'
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(() =>
    (localStorage.getItem('vf-font') as FontSize) ?? 'medium'
  );

  /* ── Live-listen to OS/browser colour-scheme changes ── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setOsTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ── Apply resolved theme to DOM ── */
  useEffect(() => {
    const t = resolvedTheme;
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.body.setAttribute('data-theme', t);
  }, [resolvedTheme]);

  /* ── Persist user preference ── */
  useEffect(() => {
    localStorage.setItem('vf-theme', theme);
  }, [theme]);

  /* ── Apply accent colour ── */
  useEffect(() => {
    localStorage.setItem('vf-accent', accent);
    const p = PALETTES[accent];
    const r = document.documentElement;
    r.style.setProperty('--color-primary', p.primary);
    r.style.setProperty('--color-primary-rgb', p.rgb);
    r.style.setProperty('--bubble-1', `rgba(${p.rgb},.12)`);
  }, [accent]);

  /* ── Apply font size ── */
  useEffect(() => {
    localStorage.setItem('vf-font', fontSize);
    document.body.style.fontSize = FONT_SIZES[fontSize];
    document.body.setAttribute('data-font', fontSize);
  }, [fontSize]);

  const setTheme = (t: ThemeMode) => setThemeState(t);

  /* Toggle cycles: auto → light → dark → auto */
  const toggleTheme = () =>
    setThemeState(prev =>
      prev === 'auto'  ? 'light' :
      prev === 'light' ? 'dark'  : 'auto'
    );

  return (
    <ThemeContext.Provider value={{
      theme, resolvedTheme, accent, fontSize,
      setTheme, toggleTheme,
      setAccent: setAccentState,
      setFontSize: setFontSizeState,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
