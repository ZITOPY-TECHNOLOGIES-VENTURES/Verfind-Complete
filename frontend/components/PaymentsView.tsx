import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowDownCircle, ArrowUpCircle, RefreshCw, Building2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AgentBankSetup } from './AgentBankSetup';

interface Payment {
  _id:              string;
  reference:        string;
  propertyId:       string;
  propertyTitle:    string;
  agentName:        string;
  amount:           number;
  status:           string;
  inspectionDate:   string | null;
  releaseDate:      string | null;
  transferReference: string | null;
  createdAt:        string;
}

const FMT = (n: number) => '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 });

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Awaiting Payment', color: '#D97706', bg: 'rgba(180,83,9,0.10)' },
  confirmed: { label: 'Payment Confirmed', color: '#1D4ED8', bg: 'rgba(27,79,216,0.10)' },
  releasing: { label: 'Releasing to Agent', color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
  released:  { label: 'Released to Agent', color: '#059669', bg: 'rgba(5,150,105,0.10)' },
  failed:    { label: 'Failed',            color: '#DC2626', bg: 'rgba(220,38,38,0.10)' },
  refunded:  { label: 'Refunded',          color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
};

const Countdown: React.FC<{ releaseDate: string }> = ({ releaseDate }) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(releaseDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Releasing now…'); return; }
      const hrs  = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${hrs}h ${mins}m remaining`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [releaseDate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#1D4ED8', fontWeight: 500 }}>
      <Clock size={12} /> {remaining}
    </div>
  );
};

export const PaymentsView: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<'payments' | 'bank'>('payments');

  const isAgent = user?.role === 'agent' || user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/payments');
      setPayments(res.data as Payment[] || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const tabSty = (t: string): React.CSSProperties => ({
    padding: '7px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13,
    background: tab === t ? 'var(--color-primary)' : 'transparent',
    color: tab === t ? '#fff' : 'var(--text-secondary)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {isAgent ? 'Incoming Payments' : 'My Payments'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {isAgent
              ? 'Payments from tenants — funds release automatically 48hrs after inspection'
              : 'Track your property payments and scheduled releases'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAgent && (
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 12 }}>
              <button onClick={() => setTab('payments')} style={tabSty('payments')}>Payments</button>
              <button onClick={() => setTab('bank')}     style={tabSty('bank')}><Building2 size={13} style={{ display:'inline',marginRight:5 }} />Payout Account</button>
            </div>
          )}
          <button onClick={load} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:10,border:'1px solid var(--border-color)',background:'transparent',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,color:'var(--text-primary)' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Bank setup tab (agents only) */}
      {tab === 'bank' && <AgentBankSetup />}

      {/* Payments tab */}
      {tab === 'payments' && (
        loading ? (
          <div style={{ display:'flex',justifyContent:'center',padding:48 }}>
            <Loader2 size={24} className="animate-spin" style={{ color:'var(--color-primary)' }} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign:'center',padding:'60px 20px',color:'var(--text-secondary)' }}>
            <ArrowDownCircle size={40} style={{ margin:'0 auto 14px',opacity:0.15,display:'block' }} />
            <p style={{ fontWeight:700,fontSize:16,color:'var(--text-primary)',margin:'0 0 6px' }}>No payments yet</p>
            <p style={{ fontSize:13 }}>
              {isAgent
                ? 'Payments will appear here when tenants pay for your listings.'
                : 'When you pay for a property, it will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {payments.map(p => {
              const cfg    = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              const isConf = p.status === 'confirmed';
              const isRel  = p.status === 'released';
              return (
                <div key={p._id} style={{ borderRadius:18,background:'var(--glass-bg)',backdropFilter:'var(--glass-blur)',WebkitBackdropFilter:'var(--glass-blur)',border:'1px solid var(--glass-border)',boxShadow:'var(--glass-shadow),var(--glass-inner)',overflow:'hidden' }}>

                  {/* Top strip — status colour */}
                  <div style={{ height:3, background: isRel ? '#059669' : isConf ? '#1D4ED8' : cfg.color, opacity: 0.7 }} />

                  <div style={{ padding:'16px 18px' }}>
                    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
                          {isAgent
                            ? <ArrowDownCircle size={16} style={{ color:'#059669',flexShrink:0 }} />
                            : <ArrowUpCircle   size={16} style={{ color:'var(--color-primary)',flexShrink:0 }} />}
                          <span style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                            {p.propertyTitle}
                          </span>
                        </div>
                        <div style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:6 }}>
                          {isAgent ? 'From tenant' : `Agent: ${p.agentName}`} · Ref: <code style={{ fontFamily:'monospace',fontSize:11 }}>{p.reference.slice(0,20)}…</code>
                        </div>
                        <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'2px 9px',borderRadius:99,fontSize:10,fontWeight:700,background:cfg.bg,color:cfg.color,letterSpacing:'0.03em' }}>
                          {cfg.label}
                        </span>
                      </div>

                      <div style={{ textAlign:'right',flexShrink:0 }}>
                        <div style={{ fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:500,color:'var(--text-primary)',letterSpacing:'-0.02em' }}>
                          {FMT(p.amount)}
                        </div>
                        <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:2 }}>
                          {new Date(p.createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}
                        </div>
                      </div>
                    </div>

                    {/* Release info for confirmed payments */}
                    {isConf && p.releaseDate && (
                      <div style={{ marginTop:12,padding:'10px 14px',borderRadius:10,background:'rgba(27,79,216,0.06)',border:'1px solid rgba(27,79,216,0.14)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap' }}>
                        <div>
                          <div style={{ fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--color-primary)',marginBottom:3 }}>
                            {isAgent ? 'You receive funds' : 'Agent receives funds'}
                          </div>
                          <div style={{ fontSize:12,color:'var(--text-secondary)' }}>
                            {new Date(p.releaseDate).toLocaleDateString('en-NG',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
                          </div>
                        </div>
                        <Countdown releaseDate={p.releaseDate} />
                      </div>
                    )}

                    {/* Inspection date */}
                    {p.inspectionDate && (
                      <div style={{ marginTop:10,fontSize:12,color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:6 }}>
                        <CheckCircle2 size={12} style={{ color:'#059669' }} />
                        Inspection: {new Date(p.inspectionDate).toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short'})}
                      </div>
                    )}

                    {/* Transfer reference for released */}
                    {isRel && p.transferReference && (
                      <div style={{ marginTop:10,fontSize:11,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6 }}>
                        <CheckCircle2 size={11} style={{ color:'#059669' }} />
                        Transfer: <code style={{ fontFamily:'monospace' }}>{p.transferReference}</code>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
