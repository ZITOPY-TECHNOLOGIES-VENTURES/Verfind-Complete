import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  size?: number;
  /** When set, renders icon + this label as one clickable control (e.g. mobile menu row). */
  label?: string;
}

/**
 * Premium icon-based light/dark toggle — replaces the ☀️/🌙 emoji buttons.
 * Icon-only by default; pass `label` to render "[icon] label" as one button.
 */
export default function ThemeToggle({ size = 36, label }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const title = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  const icon = (
    <span style={{
      width: size, height: size, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '50%', border: '1.5px solid var(--border-color)',
      background: 'var(--glass-bg-subtle)',
    }}>
      {isDark ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </span>
  );

  return (
    <button
      onClick={toggleTheme}
      aria-label={title}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: label ? 12 : 0,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        color: 'var(--text-secondary)', transition: 'color .18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      {icon}
      {label && <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>}
    </button>
  );
}
