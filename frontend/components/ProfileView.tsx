import React from 'react';
import { User, ShieldCheck, Mail, MapPin, Award, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isAgent = user.role === 'agent' || user.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[var(--color-primary)] to-indigo-500 opacity-80" />
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-3xl bg-[var(--bg-surface-solid)] p-1 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-[var(--bg-app)] flex items-center justify-center overflow-hidden">
                <UserIcon size={64} className="text-[var(--text-secondary)]" />
              </div>
            </div>
            {isAgent && (
              <div className="absolute bottom-2 left-24 bg-green-500 text-white p-1.5 rounded-xl shadow-lg border-4 border-[var(--bg-surface-solid)]">
                <ShieldCheck size={20} />
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">{user.username}</h2>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  isAgent ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[var(--text-secondary)] text-sm font-medium">
                <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> Abuja, NG</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-[rgba(120,120,128,0.05)] border border-[var(--border-color)]">
              <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Verification Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">NIN Verification</span>
                  {user.isKycVerified ? (
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">VERIFIED <ShieldCheck size={12} /></span>
                  ) : (
                    <span className="text-[10px] font-bold text-orange-500">PENDING</span>
                  )}
                </div>
                {isAgent && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Business License</span>
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">ACTIVE <Award size={12} /></span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[rgba(120,120,128,0.05)] border border-[var(--border-color)]">
              <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Activity Status</h4>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online & Active
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};