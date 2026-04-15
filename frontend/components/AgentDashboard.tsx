import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Star,
  Plus,
  ShieldCheck,
  MapPin,
  ChevronRight,
  TrendingUp,
  Clock,
  LayoutGrid,
  FileText,
  Upload,
  X,
  CreditCard,
  UserCheck,
  ShieldAlert,
  Loader2,
  Zap,
  Wallet
} from 'lucide-react';
import { Property, User } from '../types';
import api from '../services/api';
import ListingForm from './ListingForm';

interface AgentDashboardProps {
  user: User;
  onViewProperty: (p: Property) => void;
  onCreateListing: () => void;
}

const PROPERTY_STAGES = ['listing_created', 'docs_uploaded', 'agent_vetted', 'inspection_scheduled', 'verified'];
const PROPERTY_STEPS = [
  { id: 'docs', label: 'Documents Uploaded', req: ['CAC Certificate', 'Survey Plan'], cost: 0 },
  { id: 'legal', label: 'Legal Title Search', req: ['AGIS Verification Entry'], cost: 5000 },
  { id: 'physical', label: 'Physical Site Audit', req: ['Site Inspection Report'], cost: 15000 },
  { id: 'published', label: 'Final Verification', req: [], cost: 0 },
];

const KYC_STEPS = [
  { id: 'id_upload', label: 'Identity Verification', icon: <CreditCard size={18} />, desc: 'Upload Government Issued ID' },
  { id: 'license',   label: 'Real Estate License', icon: <FileText size={18} />, desc: 'Certified Agent License (REDAN/NIESV)' },
  { id: 'office',    label: 'Office Verification', icon: <MapPin size={18} />, desc: 'Physical Office Address Audit' },
  { id: 'final',     label: 'Agent Certification', icon: <UserCheck size={18} />, desc: 'Final Trust Badge Assignment' },
];

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ user, onViewProperty, onCreateListing }) => {
  type AgentView = 'hub' | 'property' | 'new-listing' | 'kyc';
  
  const [currentView, setCurrentView] = useState<AgentView>('hub');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [walletBalance, setWalletBalance] = useState(450230);
  
  const [kycStage, setKycStage] = useState(user.isKycVerified ? 4 : 0);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get<Property[]>('/properties');
      if (res.data) setProperties(res.data.filter(p => p.agentId === user._id));
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, [user._id]);

  const verifiedCount = properties.filter(p => p.isVerified).length;
  const pendingCount  = properties.filter(p => !p.isVerified).length;

  const handleMockUpload = async () => {
    if (!selectedProp) return;
    
    // Check for costs
    const currentIdx = PROPERTY_STAGES.indexOf(selectedProp.verificationStage || 'listing_created');
    const cost = PROPERTY_STEPS[currentIdx]?.cost || 0;
    
    if (cost > 0 && walletBalance < cost) {
       alert("Insufficient balance in Verifind Wallet. Please top up.");
       return;
    }

    setIsUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    if (cost > 0) setWalletBalance(prev => prev - cost);

    const res = await api.post(`/properties/${selectedProp._id}/verify`, {});
    if (res.success && res.data) {
      const updated = res.data as Property;
      setProperties(prev => prev.map(p => p._id === updated._id ? updated : p));
      setSelectedProp(updated);
    }
    setIsUploading(false);
  };

  const handleKycProgress = async () => {
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 1000));
    setKycStage(prev => Math.min(prev + 1, 4));
    setIsUploading(false);
  };

  const handlePropertyCreated = () => {
    setCurrentView('hub');
    fetchProperties();
    if (onCreateListing) onCreateListing();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* ── BREADCRUMB NAVIGATION ── */}
      {currentView !== 'hub' && (
        <div className="flex items-center gap-2 mb-2 text-sm font-bold text-muted animate-in fade-in slide-in-from-top-2 duration-300">
          <button onClick={() => { setCurrentView('hub'); setSelectedProp(null); }} className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <LayoutGrid size={16} /> Console Hub
          </button>
          <ChevronRight size={14} className="opacity-40" />
          <span style={{ color: 'var(--text-primary)' }}>
            {currentView === 'property' && selectedProp?.title}
            {currentView === 'new-listing' && 'Create New Listing'}
            {currentView === 'kyc' && 'Agent KYC Certification'}
          </span>
        </div>
      )}

      {/* ── HUB VIEW (Dashboard Main) ── */}
      {currentView === 'hub' && (
        <>
          {/* ── BRICK 1 & 8: Agent Hero & Wallet Quick Look ── */}
      <section className="relative overflow-hidden p-8 rounded-[2.5rem]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center font-black text-3xl text-white shadow-xl rotate-1">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {kycStage === 4 && (
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-black rounded-full p-1 shadow-lg border-2 border-primary">
                  <ShieldCheck size={28} className="text-primary fill-primary/10" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{user.username}</h1>
                {kycStage === 4 ? (
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">Certified Agent</span>
                ) : (
                  <button onClick={() => setCurrentView('kyc')} className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer">Complete KYC</button>
                )}
              </div>
              <p className="text-xs font-bold text-muted mb-4">Abuja HQ · ID #VF-{user._id.slice(0,6)}</p>
              <div className="flex items-center gap-4 text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                <div className="flex items-center gap-1.5"><Star size={14} className="text-amber-500 fill-amber-500" /> 4.98</div>
                <div className="w-1 h-3 bg-border-color" />
                <div className="flex items-center gap-1.5"><Building2 size={14} className="text-primary" /> {properties.length} Active</div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto p-6 rounded-[2rem] bg-surface-alt border border-border-color flex flex-col items-center md:items-end">
             <div className="flex items-center gap-2 mb-1">
                <Wallet size={12} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Escrow Balance</span>
             </div>
             <p className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>₦{walletBalance.toLocaleString()}</p>
             <button onClick={() => setCurrentView('new-listing')} className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer">
                New Listing +
             </button>
          </div>
        </div>
      </section>

      {/* ── BRICK 2: Property Verification Pipeline ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <LayoutGrid size={20} className="inline mr-2 text-primary" /> Verification Pipeline
          </h2>
          <div className="flex gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">{verifiedCount} Verified</span>
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-orange-500/10 text-orange-500">{pendingCount} Waiting</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? [1, 2].map(i => <div key={i} className="h-48 rounded-[2.5rem] bg-surface-alt animate-pulse" />) : properties.length === 0 ? (
            <div className="col-span-full p-20 text-center rounded-[3rem]" style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-color)' }}>
              <Building2 size={48} className="mx-auto mb-4 text-muted opacity-20" />
              <p className="font-bold text-lg mb-4 text-muted">Start by adding a property brick.</p>
              <button onClick={() => setCurrentView('new-listing')} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest cursor-pointer hover:scale-105 transition-all">Post First Listing</button>
            </div>
          ) : properties.map(p => {
            const currentIdx = PROPERTY_STAGES.indexOf(p.verificationStage || 'listing_created');
            const pct = Math.round(((currentIdx + 1) / PROPERTY_STAGES.length) * 100);
            return (
              <div key={p._id} onClick={() => { setSelectedProp(p); setCurrentView('property'); }} className="group p-6 rounded-[2.5rem] cursor-pointer transition-all hover:bg-surface-alt border border-transparent hover:border-border-color bg-surface shadow-sm overflow-hidden relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted border border-border-color">{p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}</div>
                    <div>
                      <h3 className="font-black text-base group-hover:text-primary transition-colors" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                      <p className="text-[10px] font-bold text-muted mt-1 uppercase tracking-widest leading-none"><MapPin size={10} className="inline mr-1" /> {p.district}</p>
                    </div>
                  </div>
                  {p.isVerified ? <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500"><ShieldCheck size={20} /></div> : <div className="text-right text-primary font-black text-sm">{pct}%</div>}
                </div>
                <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden mb-4"><div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} /></div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{p.isVerified ? 'Fully Vetted' : `Current: ${PROPERTY_STEPS[currentIdx]?.label}`}</span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-xl">Manage <ChevronRight size={14} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
        </>
      )}

      {/* ── BREADCRUMB VIEW: Property Verification Action ── */}
      {currentView === 'property' && selectedProp && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full rounded-[3rem] bg-surface border border-border-color shadow-sm overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <div className="p-10 border-b border-border-color flex items-center justify-between">
              <div><h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Lay the Next Brick</h3><p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">{selectedProp.title}</p></div>
              <button onClick={() => { setCurrentView('hub'); setSelectedProp(null); }} className="p-3 rounded-full hover:bg-surface-alt transition-colors text-muted cursor-pointer"><X size={20} /></button>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="flex justify-between items-center relative">
                 <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-color -translate-y-1/2 z-0" />
                 {PROPERTY_STEPS.map((step, i) => {
                   const currentIdx = PROPERTY_STAGES.indexOf(selectedProp.verificationStage || 'listing_created');
                   const done = i <= currentIdx;
                   const active = i === currentIdx + 1;
                   return (
                     <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : active ? 'bg-primary text-white scale-125 shadow-2xl' : 'bg-surface-alt text-muted border border-border-color'}`}>
                           {done ? <CheckCircle2 size={24} /> : <FileText size={20} />}
                        </div>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-muted'}`}>{step.label.split(' ')[0]}</p>
                     </div>
                   );
                 })}
              </div>

              <div className="p-8 rounded-[2.5rem] bg-surface-alt border border-border-color relative overflow-hidden">
                {selectedProp.isVerified ? (
                  <div className="text-center py-6"><ShieldCheck size={64} className="text-emerald-500 mx-auto mb-4" /><p className="text-xl font-black">Abuja True Verified</p><p className="text-xs text-muted font-bold mt-2">Listing is now live on the marketplace.</p></div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Zap size={24} /></div>
                       <div>
                          <p className="font-black text-lg">Verification Action</p>
                          <p className="text-xs font-bold text-muted">Upload and process {PROPERTY_STEPS[PROPERTY_STAGES.indexOf(selectedProp.verificationStage)]?.label}</p>
                       </div>
                    </div>
                    <ul className="space-y-3">
                       {PROPERTY_STEPS[PROPERTY_STAGES.indexOf(selectedProp.verificationStage)]?.req?.map(r => <li key={r} className="text-sm font-bold text-secondary flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary" /> {r}</li>)}
                    </ul>
                    
                    {/* COST SECTION */}
                    <div className="pt-6 border-t border-border-color">
                       <div className="flex justify-between items-center mb-6">
                          <div>
                             <p className="text-[10px] font-black uppercase text-muted tracking-widest">Audit Fee</p>
                             <p className="text-xl font-black">₦{(PROPERTY_STEPS[PROPERTY_STAGES.indexOf(selectedProp.verificationStage || 'listing_created')]?.cost || 0).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase text-muted tracking-widest">Wallet Balance</p>
                             <p className="text-sm font-bold text-primary">₦{walletBalance.toLocaleString()}</p>
                          </div>
                        <button onClick={handleMockUpload} disabled={isUploading} className="w-full py-5 rounded-[1.5rem] bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer">
                          {isUploading ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'Confirm & Pay Verification Fee'}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BREADCRUMB VIEW: CREATE LISTING ── */}
      {currentView === 'new-listing' && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="w-full rounded-[3rem] bg-surface border border-border-color shadow-sm custom-scrollbar" style={{ background: 'var(--bg-surface)' }}>
              <div className="p-10 border-b border-border-color flex items-center justify-between sticky top-0 bg-surface/90 backdrop-blur-xl z-20">
                <div><h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>List Property</h3><p className="text-xs font-bold text-muted uppercase tracking-widest">Brick-by-brick verification starts here.</p></div>
                <button onClick={() => setCurrentView('hub')} className="p-3 rounded-full hover:bg-surface-alt transition-colors text-muted cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-10"><ListingForm onPropertyCreated={handlePropertyCreated} /></div>
           </div>
        </div>
      )}

      {/* ── BREADCRUMB VIEW: KYC ── */}
      {currentView === 'kyc' && (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="w-full rounded-[3rem] bg-surface border border-border-color shadow-sm p-10 space-y-8" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <div><h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Agent KYC</h3><p className="text-xs font-bold text-muted uppercase tracking-widest">Earn your Abuja Trust Badge.</p></div>
              <button onClick={() => setCurrentView('hub')} className="p-3 rounded-full hover:bg-surface-alt transition-colors text-muted cursor-pointer"><X size={20} /></button>
            </div>d"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {KYC_STEPS.map((step, i) => {
                const done = i < kycStage;
                const active = i === kycStage;
                return (
                  <div key={step.id} className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${done ? 'bg-emerald-500/5 border-emerald-500/20' : active ? 'border-primary bg-primary/5 shadow-lg' : 'opacity-40 border-border-color'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white' : 'bg-muted text-muted'}`}>{done ? <CheckCircle2 size={24} /> : step.icon}</div>
                    <div className="flex-1"><p className="font-black text-base" style={{ color: 'var(--text-primary)' }}>{step.label}</p><p className="text-[10px] font-bold text-muted uppercase tracking-widest">{step.desc}</p></div>
                  </div>
                );
              })}
              {kycStage < 4 ? <button onClick={handleKycProgress} disabled={isUploading} className="w-full py-5 mt-6 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] disabled:opacity-50 cursor-pointer">{isUploading ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'Next Identity Brick'}</button> : <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 text-center"><ShieldCheck size={64} className="text-emerald-500 mx-auto mb-6" /><p className="text-xl font-black text-emerald-600">Certified Agent</p><button onClick={() => setCurrentView('hub')} className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary cursor-pointer">Return to Console</button></div>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
