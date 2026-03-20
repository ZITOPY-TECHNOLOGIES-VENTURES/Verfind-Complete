import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import api from '../services/api.ts';
import { generateContentStream } from '../services/geminiService.ts';
import { AppMode, ChatMessage, MessageRole, Property, Attachment, AbujaDistrict } from '../types.ts';
import { Map as MapIcon, Grid, ShieldCheck, Navigation, Home, Tag, TrendingUp } from 'lucide-react';

import { Sidebar }          from '../components/Sidebar.tsx';
import { BottomNav }        from '../components/BottomNav.tsx';
import { MessageList }      from '../components/MessageList.tsx';
import { InputArea }        from '../components/InputArea.tsx';
import { DistrictGrid }     from '../components/DistrictGrid.tsx';
import { PropertyCard }     from '../components/PropertyCard.tsx';
import { MapView }          from '../components/MapView.tsx';
import { PropertyDetail }   from '../components/PropertyDetail.tsx';
import ListingForm          from '../components/ListingForm.tsx';
import { LoadingWave }      from '../components/LoadingWave.tsx';
import { ProfileView }      from '../components/ProfileView.tsx';
import { Logo }             from '../components/Logo.tsx';
import { AnimatedSearchBar } from '../components/AnimatedSearchBar.tsx';

type ListingMode = 'rent' | 'buy' | 'sell';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]                     = useState<AppMode | 'profile'>(AppMode.BROWSE);
  const [listingMode, setListingMode]       = useState<ListingMode>('rent');
  const [selectedDistrict, setSelectedDistrict] = useState<AbujaDistrict | null>(null);
  const [viewType, setViewType]             = useState<'list' | 'map'>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation]     = useState<{ lat: number; lng: number } | null>(null);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating]     = useState(false);
  const [properties, setProperties]         = useState<Property[]>([]);
  const [loadingProps, setLoadingProps]     = useState(false);
  const [searchInput, setSearchInput]       = useState('');

  useEffect(() => { fetchProperties(); initGeolocation(); }, []);

  const initGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true },
      );
    }
  };

  const fetchProperties = async () => {
    try {
      setLoadingProps(true);
      const res = await api.get<Property[]>('/properties');
      if (res.data) setProperties(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoadingProps(false), 600);
    }
  };

  const filteredProperties = properties.filter(p => {
    if (mode === AppMode.BROWSE) {
      if (selectedDistrict && p.district !== selectedDistrict) return false;
      if (searchInput) {
        const q = searchInput.toLowerCase();
        return (p.title + p.address + p.district + (p.description ?? '')).toLowerCase().includes(q);
      }
      return true;
    }
    if (mode === AppMode.MANAGE_LISTINGS) return p.agentId === user?._id;
    return true;
  });

  const handlePropertyUpdate = (updated: Property) => {
    setProperties(prev => prev.map(p => p._id === updated._id ? updated : p));
    if (selectedProperty?._id === updated._id) setSelectedProperty(updated);
  };

  const handleSendMessage = (text: string, attachments: Attachment[]) => {
    const newMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text, attachments };
    setMessages(prev => [...prev, newMsg]);
    setIsGenerating(true);
    const botId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botId, role: MessageRole.MODEL, text: '', isThinking: false }]);
    let full = '';
    generateContentStream({ prompt: text, attachments, mode: AppMode.CHAT_ASSISTANT }, {
      onChunk:          chunk    => { full += chunk; setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: full } : m)); },
      onThinking:       thinking => { setMessages(prev => prev.map(m => m.id === botId ? { ...m, isThinking: thinking } : m)); },
      onImageGenerated: ()       => {},
      onGrounding:      sources  => { setMessages(prev => prev.map(m => m.id === botId ? { ...m, groundingSources: sources } : m)); },
      onComplete:       ()       => setIsGenerating(false),
      onError:          ()       => setIsGenerating(false),
    });
  };

  if (authLoading) return (
    <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <LoadingWave text="Verifying session..." />
    </div>
  );

  const isBrowse = mode === AppMode.BROWSE;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden fixed inset-0"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onContactAgent={() => navigate('/register')}
          isAuthenticated={isAuthenticated}
          onUpdate={handlePropertyUpdate}
        />
      )}

      <Sidebar currentMode={mode} onModeChange={m => { setMode(m); setSelectedDistrict(null); }} user={user} />

      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">

        {/* ── Header ── */}
        <header className="h-16 md:h-18 shrink-0 flex items-center justify-between px-4 md:px-8 gap-3 z-40 backdrop-blur-xl"
          style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}>

          {/* Left: logo + breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo showText size={26} />
            <div className="hidden md:block w-px h-5" style={{ background: 'var(--border-color)' }} />
            <span className="hidden md:block text-[9px] font-black uppercase tracking-[0.4em]"
              style={{ color: 'var(--text-muted)' }}>
              {isBrowse ? (selectedDistrict || 'FCT Marketplace') : String(mode).replace('_', ' ')}
            </span>
          </div>

          {/* Centre: animated search */}
          {isBrowse && (
            <AnimatedSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={() => setSelectedDistrict(null)}
              listingMode={listingMode}
            />
          )}

          {/* Right: view toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {isBrowse && (
              <div className="flex p-1 rounded-xl gap-0.5" style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)' }}>
                <button onClick={() => setViewType('list')}
                  className="p-2 rounded-lg transition-all"
                  style={viewType === 'list'
                    ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 8px rgba(var(--color-primary-rgb),.3)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }}>
                  <Grid size={15} />
                </button>
                <button onClick={() => setViewType('map')}
                  className="p-2 rounded-lg transition-all"
                  style={viewType === 'map'
                    ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 8px rgba(var(--color-primary-rgb),.3)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }}>
                  <MapIcon size={15} />
                </button>
              </div>
            )}
            {viewType === 'map' && (
              <button onClick={initGeolocation} className="p-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--color-primary)', border: '1px solid var(--border-color)' }}>
                <Navigation size={15} />
              </button>
            )}
          </div>
        </header>

        {/* ── Main scroll area ── */}
        <div className="flex-1 w-full overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-28 md:pb-10">

              {mode === 'profile' && <ProfileView />}

              {/* ── BROWSE MODE ── */}
              {isBrowse && (
                <div className="space-y-5">

                  {/* Buy / Rent / Sell tabs */}
                  <div className="flex items-center justify-center">
                    <div className="inline-flex p-1 rounded-2xl gap-1"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
                      {([
                        { id: 'rent' as ListingMode, label: 'Rent',  Icon: Home       },
                        { id: 'buy'  as ListingMode, label: 'Buy',   Icon: Tag        },
                        { id: 'sell' as ListingMode, label: 'Sell',  Icon: TrendingUp },
                      ]).map(({ id, label, Icon }) => (
                        <button key={id}
                          onClick={() => { setListingMode(id); setSelectedDistrict(null); setSearchInput(''); }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all"
                          style={listingMode === id
                            ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 12px rgba(var(--color-primary-rgb),.3)' }
                            : { background: 'transparent', color: 'var(--text-muted)' }}>
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sell CTA panel */}
                  {listingMode === 'sell' && (
                    <div className="p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-1.5" style={{ color: 'var(--text-primary)' }}>List Your Property</h3>
                        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                          Join Verifind's verified marketplace and reach thousands of qualified buyers and tenants across the FCT.
                        </p>
                        <ul className="space-y-1.5">
                          {['Physical verification by our ground team', 'Assigned verified agent', 'AI-powered pricing insights'].map(pt => (
                            <li key={pt} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <ShieldCheck size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} /> {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button onClick={() => setMode(AppMode.MANAGE_LISTINGS)}
                        className="shrink-0 px-8 py-4 text-white font-black rounded-2xl text-sm uppercase tracking-wide transition-all"
                        style={{ background: 'var(--color-primary)', boxShadow: '0 4px 16px rgba(var(--color-primary-rgb),.3)' }}>
                        Post a Listing →
                      </button>
                    </div>
                  )}

                  {/* Verification notice (rent/buy only) */}
                  {listingMode !== 'sell' && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(var(--color-primary-rgb),.1)' }}>
                        <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Abuja Property Shield — every listing is physically verified by our team before placement.
                      </p>
                      <span className="ml-auto text-[9px] font-black uppercase tracking-widest shrink-0"
                        style={{ color: 'var(--text-muted)' }}>
                        {filteredProperties.length} listing{filteredProperties.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Map or list */}
                  {viewType === 'map' ? (
                    <div className="w-full h-[500px] md:h-[620px] rounded-3xl overflow-hidden">
                      <MapView properties={properties} onViewDetails={setSelectedProperty} userLocation={userLocation} />
                    </div>
                  ) : !selectedDistrict ? (
                    <DistrictGrid onSelect={setSelectedDistrict} listingMode={listingMode} />
                  ) : (
                    <div className="space-y-5">
                      <button onClick={() => setSelectedDistrict(null)}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all hover:-translate-x-1"
                        style={{ color: 'var(--color-primary)' }}>
                        ← Back to all districts
                      </button>
                      {loadingProps ? (
                        <div className="flex items-center justify-center py-20">
                          <LoadingWave text="Loading properties..." />
                        </div>
                      ) : filteredProperties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'var(--bg-surface-alt)' }}>
                            <ShieldCheck size={28} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <p className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>No listings yet</p>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No properties found in {selectedDistrict}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
                          {filteredProperties.map(p => (
                            <PropertyCard key={p._id} property={p} onViewDetails={setSelectedProperty} onVerified={handlePropertyUpdate} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── MANAGE LISTINGS ── */}
              {mode === AppMode.MANAGE_LISTINGS && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <ListingForm onPropertyCreated={fetchProperties} />
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
                    {filteredProperties.map(p => (
                      <PropertyCard key={p._id} property={p} onViewDetails={setSelectedProperty} onVerified={handlePropertyUpdate} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── CHAT ASSISTANT ── */}
              {mode === AppMode.CHAT_ASSISTANT && (
                <div className="flex flex-col rounded-3xl overflow-hidden" style={{ height: '70vh', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                  <MessageList messages={messages} isGenerating={isGenerating} />
                  <InputArea onSend={handleSendMessage} disabled={isGenerating} />
                </div>
              )}

              {/* ── INSPECTIONS ── */}
              {mode === AppMode.INSPECTIONS && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>Inspection Calendar</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upcoming property inspections will appear here.</p>
                </div>
              )}

              {/* ── WALLET ── */}
              {mode === AppMode.WALLET && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>Escrow Nexus</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Secure escrow payments coming soon.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <BottomNav currentMode={mode} onModeChange={m => { setMode(m); setSelectedDistrict(null); }} user={user} />
    </div>
  );
};

export default Dashboard;
