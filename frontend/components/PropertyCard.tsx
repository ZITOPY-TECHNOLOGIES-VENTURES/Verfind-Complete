import React, { useState } from 'react';
import { Property, VerificationStage } from '../types';
import {
  ShieldCheck, Video, MapPin, Loader2, AlertTriangle,
  ChevronRight, Heart, Bed, Bath, Maximize2, Car, Sofa
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onVerified?: (updatedProperty: Property) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property, onViewDetails, onVerified, isFavorited = false, onToggleFavorite
}) => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  const isOwner = user?._id === property.agentId;
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const canVerify = (isAdmin || (isAgent && isOwner)) && !property.isVerified;

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const response = await api.post(`/properties/${property._id}/verify`, {}) as any;
      if (onVerified && response.success) onVerified(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavLoading || !onToggleFavorite) return;
    setIsFavLoading(true);
    try {
      await onToggleFavorite(property._id);
    } finally {
      setIsFavLoading(false);
    }
  };

  const getStagePercentage = (stage: VerificationStage): number => {
    const stages: VerificationStage[] = [
      'listing_created', 'docs_uploaded', 'agent_vetted', 'inspection_scheduled', 'verified'
    ];
    return ((stages.indexOf(stage) + 1) / stages.length) * 100;
  };

  const statusColors: Record<Property['status'], string> = {
    'available':   'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    'under-offer': 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    'rented':      'bg-red-500/20 text-red-400 border-red-500/20',
  };

  const statusLabels: Record<Property['status'], string> = {
    'available': 'Available',
    'under-offer': 'Under Offer',
    'rented': 'Rented',
  };

  return (
    <div
      className="glass-card group overflow-hidden flex flex-col h-full hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border-0 cursor-pointer"
      onClick={() => onViewDetails(property)}
    >
      {/* ── Media ── */}
      <div className="relative aspect-[4/3] overflow-hidden">

        {/* Verified / Vetting badge */}
        <div className={`absolute top-3 left-3 z-10 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl backdrop-blur border border-white/20 ${
          property.isVerified ? 'bg-emerald-600' : 'bg-amber-600'
        }`}>
          {property.isVerified
            ? <><ShieldCheck size={11} className="fill-white/20" /> Verified</>
            : <><AlertTriangle size={11} /> Vetting</>
          }
        </div>

        {/* Status badge */}
        <div className={`absolute top-3 right-3 z-10 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-full border backdrop-blur ${statusColors[property.status]}`}>
          {statusLabels[property.status]}
        </div>

        {/* Video tour badge */}
        {property.videoUrl && (
          <div className="absolute bottom-12 right-3 z-10 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
            <Video size={11} /> Tour
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={`absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isFavorited
              ? 'bg-red-500 text-white scale-110'
              : 'bg-black/50 text-white/70 hover:bg-red-500 hover:text-white backdrop-blur-sm border border-white/10'
          }`}
        >
          {isFavLoading
            ? <Loader2 size={13} className="animate-spin" />
            : <Heart size={13} className={isFavorited ? 'fill-white' : ''} />
          }
        </button>

        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'; }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80 mb-0.5">Total Initial</div>
          <div className="text-xl font-black tracking-tighter drop-shadow-md">
            ₦{property.totalInitialPayment.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex-1 flex flex-col bg-[var(--bg-surface)]">

        {/* Title & Location */}
        <div className="mb-3">
          <span className="text-[9px] uppercase font-black text-primary tracking-[0.2em] mb-1 block">{property.type}</span>
          <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-1.5">
            <MapPin size={11} className="text-primary" />
            <span className="font-semibold">{property.district}</span>
          </div>
        </div>

        {/* ── KEY SPECS (like Zillow) ── */}
        <div className="flex items-center gap-3 py-3 border-y border-[var(--border-color)] mb-3 flex-wrap">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-semibold">
              <Bed size={13} className="text-primary/70" />
              <span>{property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-semibold">
              <Bath size={13} className="text-primary/70" />
              <span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.sqm > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-semibold">
              <Maximize2 size={11} className="text-primary/70" />
              <span>{property.sqm}m²</span>
            </div>
          )}
          {property.furnished && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <Sofa size={11} /> Furnished
            </div>
          )}
          {property.parking && (
            <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold">
              <Car size={11} /> Parking
            </div>
          )}
        </div>

        {/* Verification progress */}
        {!property.isVerified && (
          <div className="mb-4 p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Trust Score</span>
              <span className="text-[10px] font-black text-primary">{Math.round(getStagePercentage(property.verificationStage))}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-surface-solid)] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 shadow-[0_0_8px_rgba(10,102,194,0.5)]"
                style={{ width: `${getStagePercentage(property.verificationStage)}%` }}
              />
            </div>
            <p className="text-[9px] text-[var(--text-muted)] mt-1 capitalize">
              Stage: {property.verificationStage.replace(/_/g, ' ')}
            </p>
          </div>
        )}

        {/* Footer: Price + CTA */}
        <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <div>
            <span className="text-[var(--text-muted)] text-[9px] uppercase font-black tracking-widest mb-0.5 block">Base Rent / yr</span>
            <span className="font-bold text-[var(--text-primary)] text-sm">₦{property.baseRent.toLocaleString()}</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onViewDetails(property); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all border border-primary/20"
          >
            View <ChevronRight size={14} />
          </button>
        </div>

        {/* Verify button (agents/admins) */}
        {canVerify && (
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isVerifying ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
            Approve Stage
          </button>
        )}
      </div>
    </div>
  );
};
