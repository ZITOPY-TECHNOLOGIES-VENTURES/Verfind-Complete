import React, { useState } from 'react';
import { Property, VerificationStage } from '../types';
import {
  ShieldCheck, Video, MapPin, Loader2, AlertTriangle,
  Heart, ChevronRight, ChevronLeft, Lock, MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface PropertyCardProps {
  property:      Property;
  onViewDetails: (property: Property) => void;
  onVerified?:   (property: Property) => void;
  onAuthRequired?: () => void;
}

const FMT = (n: number) => '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 });

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property, onViewDetails, onVerified, onAuthRequired,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const [imgIdx,      setImgIdx]      = useState(0);

  const isOwner   = user?._id === property.agentId;
  const isAdmin   = user?.role === 'admin';
  const isAgent   = user?.role === 'agent';
  const canVerify = (isAdmin || (isAgent && isOwner)) && !property.isVerified;

  const stages: VerificationStage[] = [
    'listing_created','docs_uploaded','agent_vetted','inspection_scheduled','verified',
  ];
  const trustPct = Math.round(
    ((stages.indexOf(property.verificationStage) + 1) / stages.length) * 100,
  );

  const requireAuth = (e: React.MouseEvent, then?: () => void) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return false;
    }
    then?.();
    return true;
  };

  const handleCardClick = () => {
    if (!isAuthenticated) { onAuthRequired?.(); return; }
    onViewDetails(property);
  };

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await api.post(`/api/properties/${property._id}/verify`, {}) as any;
      if (onVerified && res.success) onVerified(res.data);
    } catch {}
    finally { setIsVerifying(false); }
  };

  const hue = property.district.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const placeholderBg = `linear-gradient(135deg, hsl(${hue},45%,35%), hsl(${(hue+60)%360},50%,25%))`;

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)'
          : '0 2px 8px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.92)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow .22s ease, transform .22s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ position:'relative', height:210, overflow:'hidden', flexShrink:0 }}>
        {property.images?.[0] ? (
          <>
            <img
              src={property.images[imgIdx]}
              alt={property.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .5s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            />
            {/* Carousel Controls */}
            {property.images.length > 1 && hovered && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + property.images.length) % property.images.length); }} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,0.4)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', backdropFilter:'blur(4px)' }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % property.images.length); }} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,0.4)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', backdropFilter:'blur(4px)' }}>
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            {/* Dots */}
            {property.images.length > 1 && (
              <div style={{ position:'absolute', bottom:40, left:0, right:0, display:'flex', justifyContent:'center', gap:4, zIndex:10 }}>
                {property.images.map((_, i) => (
                  <div key={i} style={{ width:6, height:6, borderRadius:'50%', background: i===imgIdx ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow:'0 1px 3px rgba(0,0,0,0.3)', transition:'background .2s' }} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ width:'100%', height:'100%', background:placeholderBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:36, color:'rgba(255,255,255,0.25)', fontWeight:300 }}>
              {property.district.charAt(0)}
            </span>
          </div>
        )}

        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)', pointerEvents:'none' }} />

        <div style={{ position:'absolute', bottom:12, left:14, pointerEvents:'none' }}>
          <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', lineHeight:1, fontFamily:"'DM Sans',sans-serif", textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
            {FMT(property.totalInitialPayment)}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.60)', fontWeight:500, marginTop:2 }}>
            {FMT(property.baseRent)}/yr base
          </div>
        </div>

        <div style={{ position:'absolute', top:10, left:10, pointerEvents:'none' }}>
          {property.isVerified ? (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:99, fontSize:10, fontWeight:700, background:'rgba(5,150,105,0.88)', backdropFilter:'blur(12px)', border:'1px solid rgba(52,211,153,0.40)', color:'#fff', letterSpacing:'0.04em' }}>
              <ShieldCheck size={10} /> VERIFIED
            </span>
          ) : (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:99, fontSize:10, fontWeight:700, background:'rgba(180,83,9,0.82)', backdropFilter:'blur(12px)', border:'1px solid rgba(252,211,77,0.30)', color:'#fff', letterSpacing:'0.04em' }}>
              <AlertTriangle size={10} /> {trustPct}% VETTED
            </span>
          )}
        </div>

        <div style={{ position:'absolute', top:10, right:10, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
          {/* Zillow style favorite button */}
          <button
            onClick={e => requireAuth(e, () => setSaved(s => !s))}
            style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(16px)', border:'1.5px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: saved ? '#F43F5E' : '#fff', transition:'all .15s', boxShadow:'0 2px 10px rgba(0,0,0,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={16} fill={saved ? '#F43F5E' : 'rgba(0,0,0,0.2)'} />
          </button>

          {property.videoUrl && (
            <button
              onClick={e => requireAuth(e, () => window.open(property.videoUrl, '_blank', 'noopener'))}
              style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:99, fontSize:9, fontWeight:700, background:'rgba(0,0,0,0.52)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.18)', color:'#fff', cursor:'pointer' }}
            >
              {isAuthenticated ? <Video size={10}/> : <Lock size={10}/>}
              {isAuthenticated ? 'TOUR' : 'LOG IN'}
            </button>
          )}
        </div>

        {!isAuthenticated && hovered && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.28)', display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity .2s' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.30)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Lock size={16} color="#fff" />
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'#fff', textShadow:'0 1px 4px rgba(0,0,0,0.5)', letterSpacing:'0.05em' }}>
                Login to view
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:'14px 16px 16px', flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--color-primary)' }}>
            {property.type}
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text-secondary)', fontWeight:500 }}>
            <MapPin size={11} style={{ color:'var(--color-primary)', flexShrink:0 }} />
            {property.district}
          </span>
        </div>

        <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', lineHeight:1.3, letterSpacing:'-0.01em', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any }}>
          {property.title}
        </div>

        {property.address && (
          <div style={{ fontSize:12, color:'var(--text-muted)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
            {property.address}
          </div>
        )}

        {/* Fees row */}
        <div style={{ display:'flex', gap:12, paddingTop:8, borderTop:'1px solid var(--border-color)', marginTop:2 }}>
          {[
            { l:'Agency', v: FMT(property.agencyFee || property.baseRent * 0.1) },
            { l:'Legal',  v: FMT(property.legalFee  || property.baseRent * 0.1) },
            { l:'Caution',v: FMT(property.cautionFee || 0) },
          ].map(f => (
            <div key={f.l} style={{ flex:1 }}>
              <div style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:2 }}>{f.l}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)' }}>{f.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)' }}>Agent</div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {property.agentName || 'Verified Agent'}
            </div>
          </div>

          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {/* WhatsApp Contact Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                requireAuth(e, () => {
                  const phone = (property as any).agentPhone || '2348000000000';
                  window.open(`https://wa.me/${phone}?text=Hi%20${encodeURIComponent(property.agentName)},%20I'm%20interested%20in%20your%20property:%20${encodeURIComponent(property.title)}`, '_blank');
                });
              }}
              onMouseEnter={e => (e.currentTarget.style.transform='scale(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}
              style={{ width:32, height:32, borderRadius:10, background:'rgba(37,211,102,0.12)', color:'#25D366', border:'1px solid rgba(37,211,102,0.25)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'transform .15s' }}
              title="Message Agent"
            >
              <MessageSquare size={13} strokeWidth={2.5} />
            </button>

            {/* View Button */}
            <button
              onClick={e => { e.stopPropagation(); handleCardClick(); }}
              onMouseEnter={e => (e.currentTarget.style.filter='brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter='brightness(1)')}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:10, background:'var(--color-primary)', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12, transition:'filter .15s', boxShadow:'0 3px 12px rgba(27,79,216,0.28)' }}
            >
              {isAuthenticated ? 'View' : <><Lock size={11}/> Login</>} <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {canVerify && (
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            style={{ width:'100%', padding:'9px', borderRadius:12, marginTop:2, background:'rgba(5,150,105,0.10)', border:'1px solid rgba(5,150,105,0.25)', color:'#059669', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(5,150,105,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background='rgba(5,150,105,0.10)')}
          >
            {isVerifying ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
            Advance Verification
          </button>
        )}
      </div>
    </div>
  );
};
