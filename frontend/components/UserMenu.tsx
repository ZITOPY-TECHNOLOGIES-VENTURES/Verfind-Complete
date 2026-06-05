import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem { label: string; icon?: string; onClick: () => void; }

interface Props {
  /** Extra items shown above "Sign out" (e.g. My Profile). */
  items?: MenuItem[];
}

/**
 * Premium account control: an avatar button that opens a dropdown with the
 * user's name/email and account actions — replaces the cramped
 * username-chip + separate Sign-out button in dashboard headers.
 */
export default function UserMenu({ items = [] }: Props) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const initial = (user.username || 'U')[0].toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        style={{
          width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--border-color)',
          background: 'var(--color-primary)', color: '#fff', fontWeight: 800, fontSize: 15,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}
      >
        {initial}
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
          <div className="glass-card" style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 101,
            minWidth: 220, borderRadius: 16, padding: 8, boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
          }}>
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            {items.map(item => (
              <button key={item.label} onClick={() => { setOpen(false); item.onClick(); }} style={menuItemStyle}>
                {item.icon && <span style={{ fontSize: 15 }}>{item.icon}</span>}{item.label}
              </button>
            ))}
            <button onClick={() => { setOpen(false); logout(); }} style={{ ...menuItemStyle, color: '#E84C3D' }}>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
  background: 'none', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
  fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
};
