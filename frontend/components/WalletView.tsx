import React from 'react';
import { 
  Wallet, ShieldCheck, ArrowUpRight, ArrowDownRight, Clock, 
  CreditCard, Zap, Sparkles, ShieldEllipsis, AlertCircle 
} from 'lucide-react';

interface WalletViewProps {
  userEmail: string;
  userName: string;
}

export const WalletView: React.FC<WalletViewProps> = ({ userEmail, userName }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* ── LUXURY BALANCE CARD ── */}
      <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 text-white shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-white/15 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Total Escrow Balance</p>
                 <ShieldCheck size={14} className="text-white/40" />
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-1">₦450,230<span className="text-white/40">.00</span></h2>
              <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                 <Zap size={14} className="text-amber-300" /> +₦2,400 pending escrow
              </div>
            </div>
            <div className="w-16 h-16 rounded-[2rem] bg-white/20 backdrop-blur-2xl flex items-center justify-center border border-white/30 shadow-xl group-hover:rotate-6 transition-all duration-500">
              <Wallet size={32} />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-[9px] text-white/50 font-black uppercase mb-1">Authenticated Holder</p>
              <p className="text-sm font-black">{userName}</p>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-[9px] text-white/50 font-black uppercase mb-1">ID Verification</p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-300" />
                <p className="text-sm font-black tracking-tight">Killed it · 100%</p>
              </div>
            </div>
            <button className="ml-auto flex items-center gap-2 px-8 py-4 rounded-3xl bg-white text-primary font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
               <ArrowUpRight size={18} /> Top Up
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── TRANSACTION LEDGER ── */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
               <Clock size={20} className="text-primary" /> Active Ledger
            </h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Download PDF</button>
          </div>

          <div className="space-y-2">
            {[
              { id: 1, type: 'credit', label: 'Escrow Release - Maitama Unit 4', amount: '₦1,250,000', date: 'Mar 18', status: 'Verifying' },
              { id: 2, type: 'debit', label: 'Land Registry Search Fee (AGIS)', amount: '₦25,000', date: 'Mar 12', status: 'Completed' },
              { id: 3, type: 'debit', label: 'Site Inspection Fuel & Logistics', amount: '₦12,500', date: 'Mar 10', status: 'Completed' },
              { id: 4, type: 'credit', label: 'Security Deposit Refund', amount: '₦50,000', date: 'Mar 05', status: 'Completed' }
            ].map((tx, i) => (
              <div key={tx.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-surface-alt transition-colors duration-300 border border-transparent hover:border-border-color">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{tx.label}</p>
                    <p className="text-[10px] font-bold text-muted flex items-center gap-1">
                       {tx.date} <span className="w-1 h-1 rounded-full bg-border-color" /> {tx.status}
                    </p>
                  </div>
                </div>
                <p className={`font-black text-base ${tx.type === 'credit' ? 'text-emerald-500' : 'text-primary'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECURITY DRAWER ── */}
        <div className="space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-surface-alt border border-border-color relative group overflow-hidden">
              <ShieldEllipsis className="text-primary/20 absolute -top-4 -right-4 group-hover:rotate-12 transition-transform duration-700" size={100} />
              <div className="relative z-10">
                 <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <ShieldCheck size={16} className="text-primary" /> Multi-Sig Guard
                 </h4>
                 <p className="text-xs font-semibold leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Funds are secured via 2-of-3 multi-signature escrow. Verifind only releases payments upon physical asset validation.
                 </p>
                 <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                    <AlertCircle size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-primary">Escrow Protocol v2.1 Active</span>
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-alt border border-border-color flex items-center justify-center mb-4">
                 <CreditCard className="text-muted" size={24} />
              </div>
              <h4 className="font-black text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Quick Withdraw</h4>
              <p className="text-[10px] font-bold text-muted mb-6 px-4">Standard 24-hour settlement to any Nigerian bank.</p>
              <button disabled className="w-full py-4 rounded-2xl bg-surface-alt text-muted font-black text-[10px] uppercase tracking-widest border border-border-color cursor-not-allowed">
                 Minimum: ₦50,000
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
