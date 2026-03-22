import React, { useState } from 'react';
import { Property, VerificationStage } from '../types';
import {
  X, MapPin, ShieldCheck, Calendar, User, FileText,
  ClipboardList, Eye, PhoneCall, Loader2, Check,
  Map, Bed, Bath, Maximize2, Car, Sofa, Play, Heart,
  ChevronLeft, ChevronRight as ChevronRightIcon, MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LiveCallOverlay } from './LiveCallOverlay';
import { PaymentModal } from './PaymentModal';

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  onContactAgent: () => void;
  isAuthenticated: boolean;
  onUpdate?: (property: Property) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property, onClose, onContactAgent, isAuthenticated, onUpdate,
  isFavorited = false, onToggleFavorite
}) => {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'idle' | 'calling' | 'confirmed'>('idle');
  const [showLiveCall, setShowLiveCall] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [favLoading, setFavLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const stages: { key: VerificationStage; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'listing_created',      label: 'Listing',      icon: <FileText size={16} />,     desc: 'Initial listing submitted' },
    { key: 'docs_uploaded',        label: 'Documents',    icon: <ClipboardList size={16} />, desc: 'Papers verified' },
    { key: 'agent_vetted',         label: 'Agent Vetted', icon: <User size={16} />,          desc: 'Profile checked' },
    { key: 'inspection_scheduled', label: 'Inspection',   icon: <Eye size={16} />,           desc: 'Physical check' },
    { key: 'verified',             label: 'Verified',     icon: <ShieldCheck size={16} />,   desc: 'Verifind Shield' },
  ];

  const currentIdx = stages.findIndex(s => s.key === property.verificationStage);

  const handleBookInspection = async () => {
    if (!isAuthenticated) return onContactAgent();
    setBookingStep('calling');
    setIsBooking(true);
    try {
      const response = await api.post(`/properties/${property._id}/book-inspection`, {}) as any;
      if (response.success) {
        setBookingStep('confirmed');
        if (onUpdate) onUpdate(response.data);
      }
    } catch {
      setBookingStep('idle');
    } finally {
      setIsBooking(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return onContactAgent();
    if (favLoading || !onToggleFavorite) return;
    setFavLoading(true);
    try { await onToggleFavorite(property._id); }
    finally { setFavLoading(false); }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    return url;
  };

  const nextImg = () => setImgIdx(i => (i + 1) % property.images.length);
  const prevImg = () => setImgIdx(i => (i - 1 + property.images.length) % property.images.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">

      {showLiveCall && <LiveCallOverlay property={property} onClose={() => setShowLiveCall(false)} />}

      <div className="w-full max-w-6xl h-[94vh] bg-[var(--bg-surface)] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-[var(--border-color)]">

        {/* Booking call overlay */}
        {bookingStep !== 'idle' && (
          <div className="absolute inset-0 z-[70] bg-primary text-white flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-400">
            <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mb-10">
              {bookingStep === 'calling'
                ? <PhoneCall size={48} className="animate-pulse" />
                : <Check size={48} className="text-emerald-300" />
              }
            </div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">
              {bookingStep === 'calling' ? 'Calling Agent...' : 'Agent Notified'}
            </h2>
            <p className="max-w-sm text-white/70 font-medium text-base leading-relaxed mb-12">
              {bookingStep === 'calling'
                ? 'Connecting to the agent\'s verified line. Securing your inspection slot.'
                : 'Agent accepted. You\'ll receive WhatsApp confirmation shortly.'}
            </p>
            {bookingStep === 'confirmed' && (
              <button
                onClick={() => setBookingStep('idle')}
                className="px-10 py-3.5 bg-white text-primary font-black rounded-2xl uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-105 transition-all"
              >
                Confirm & Return
              </button>
            )}
          </div>
        )}

        {/* ── LEFT: Media Panel ── */}
        <div className="w-full md:w-1/2 flex-shrink-0 flex flex-col relative bg-slate-950">

          {/* Image gallery */}
          <div className="relative flex-1 overflow-hidden min-h-[220px] md:min-h-0">
            <img
              src={property.images[imgIdx] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* Nav arrows */}
            {property.images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all backdrop-blur-sm">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all backdrop-blur-sm">
                  <ChevronRightIcon size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {property.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Top row: close + favorite */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
              <button onClick={onClose} className="w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/90 backdrop-blur-sm transition-all">
                <X size={17} />
              </button>
              <button
                onClick={handleFavorite}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isFavorited ? 'bg-red-500 text-white' : 'bg-black/60 text-white/70 hover:bg-red-500 hover:text-white backdrop-blur-sm'
                }`}
              >
                {favLoading ? <Loader2 size={15} className="animate-spin" /> : <Heart size={15} className={isFavorited ? 'fill-white' : ''} />}
              </button>
            </div>

            {/* Video tour button */}
            {property.videoUrl && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 text-white text-xs font-bold px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-primary transition-all"
              >
                <Play size={13} className="fill-white" /> Watch Tour
              </button>
            )}

            {/* Verification badge */}
            <div className={`absolute bottom-3 left-3 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur border border-white/20 ${
              property.isVerified ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              <ShieldCheck size={11} />
              {property.isVerified ? 'Verified' : 'Vetting in Progress'}
            </div>
          </div>

          {/* Video embed */}
          {showVideo && property.videoUrl && (
            <div className="h-52 md:h-64 bg-black relative">
              <iframe
                src={getYoutubeEmbedUrl(property.videoUrl)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              />
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Thumbnail strip */}
          {property.images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900">
              {property.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-primary' : 'border-transparent opacity-60'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Info Panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

            {/* Title & address */}
            <div>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{property.type}</span>
              <h1 className="text-2xl md:text-3xl font-black leading-tight mt-1 text-[var(--text-primary)]">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] mt-2 font-medium">
                <MapPin size={13} className="text-primary" />
                {property.address}, {property.district}
              </div>
            </div>

            {/* ── Key specs (Zillow-style) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Bed size={18} />, val: `${property.bedrooms ?? '—'}`, label: 'Bedrooms' },
                { icon: <Bath size={18} />, val: `${property.bathrooms ?? '—'}`, label: 'Bathrooms' },
                { icon: <Maximize2 size={16} />, val: property.sqm > 0 ? `${property.sqm}m²` : '—', label: 'Size' },
                { icon: <Calendar size={16} />, val: new Date(property.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }), label: 'Listed' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)] text-center">
                  <div className="text-primary flex justify-center mb-1">{item.icon}</div>
                  <div className="text-base font-black text-[var(--text-primary)]">{item.val}</div>
                  <div className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Amenity badges */}
            <div className="flex flex-wrap gap-2">
              {property.furnished && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <Sofa size={12} /> Furnished
                </span>
              )}
              {property.parking && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                  <Car size={12} /> Parking
                </span>
              )}
              <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                property.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                property.status === 'under-offer' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {property.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">About this property</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{property.description}</p>
              </div>
            )}

            {/* ── TRUE ABUJA COST BREAKDOWN ── */}
            <div className="bg-[var(--bg-app)] p-5 rounded-2xl border border-[var(--border-color)]">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">True Abuja Cost Breakdown</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Base Rent',      val: property.baseRent,          note: 'Annual rent' },
                  { label: 'Agency Fee',     val: property.agencyFee,         note: '10% of base' },
                  { label: 'Legal Fee',      val: property.legalFee,          note: '10% of base' },
                  { label: 'Service Charge', val: property.serviceCharge,     note: 'Annual' },
                  { label: 'Caution Fee',    val: property.cautionFee,        note: 'Refundable' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">{item.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2">{item.note}</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">₦{item.val.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between">
                  <span className="font-black text-[var(--text-primary)]">Total Initial Payment</span>
                  <span className="text-xl font-black text-primary">₦{property.totalInitialPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ── Verification Pipeline ── */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Verification Pipeline</h3>
              <div className="space-y-2">
                {stages.map((stage, i) => {
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  return (
                    <div key={stage.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      current ? 'bg-primary/10 border-primary/30' :
                      done    ? 'bg-emerald-500/5 border-emerald-500/20' :
                                'bg-[var(--bg-app)] border-[var(--border-color)] opacity-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        property.isVerified && done ? 'bg-emerald-500 text-white' :
                        done ? 'bg-primary text-white' :
                        'bg-[var(--bg-surface-solid)] text-[var(--text-muted)]'
                      }`}>
                        {stage.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-[var(--text-primary)]">{stage.label}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{stage.desc}</div>
                      </div>
                      {done && <Check size={14} className={property.isVerified ? 'text-emerald-400' : 'text-primary'} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-3 p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)]">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <User size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-[var(--text-primary)]">{property.agentName}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Verified Agent</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck size={12} /> Vetted
              </div>
            </div>

            {/* Google Maps link */}
            {property.lat && property.lng && (
              <a
                href={`https://maps.google.com/?q=${property.lat},${property.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                <Map size={14} /> Open in Google Maps
              </a>
            )}
          </div>

          {/* ── Action Footer ── */}
          <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated) return onContactAgent();
                  const phone = (property as any).agentPhone || '2348000000000';
                  window.open(`https://wa.me/${phone}?text=Hi%20${encodeURIComponent(property.agentName)},%20I'm%20interested%20in%20your%20property:%20${encodeURIComponent(property.title)}`, '_blank');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-[#25D366] text-white text-sm font-black hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                <MessageSquare size={16} /> Contact Agent
              </button>
              <button
                onClick={handleBookInspection}
                disabled={isBooking || property.status === 'rented'}
                className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {isBooking ? <Loader2 size={15} className="animate-spin" /> : <Calendar size={15} />}
                {property.status === 'rented' ? 'Rented' : 'Tour'}
              </button>
            </div>
            
            <button
              onClick={() => { if (!isAuthenticated) return onContactAgent(); setShowPayment(true); }}
              disabled={property.status !== 'available'}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              <ShieldCheck size={16} /> Secure This Property
            </button>
            
            <button
              onClick={() => { if (!isAuthenticated) return onContactAgent(); setShowLiveCall(true); }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-[11px] font-bold text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200"
            >
              <PhoneCall size={13} /> Request AI Voice Call
            </button>
            {!isAuthenticated && (
              <p className="text-center text-[10px] text-[var(--text-muted)] font-medium">
                <button onClick={onContactAgent} className="text-primary font-bold hover:underline">Sign in</button> to book inspections and save properties
              </p>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          property={property}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            if (onUpdate) {
              onUpdate({ ...property, status: 'under-offer' });
            }
          }}
          onNeedAuth={onContactAgent}
        />
      )}
    </div>
  );
};
