import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { MapPin, Navigation, User as UserIcon, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface MapViewProps {
  properties: Property[];
  onViewDetails: (property: Property) => void;
  userLocation: { lat: number; lng: number } | null;
}

export const MapView: React.FC<MapViewProps> = ({ properties, onViewDetails, userLocation }) => {
  const [selectedPin, setSelectedPin] = useState<Property | null>(null);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const nearestProperty = useMemo(() => {
    if (!userLocation || properties.length === 0) return null;
    return properties.reduce((prev, curr) =>
      getDistance(userLocation.lat, userLocation.lng, curr.lat, curr.lng) <
      getDistance(userLocation.lat, userLocation.lng, prev.lat, prev.lng) ? curr : prev
    );
  }, [userLocation, properties]);

  const mapToXY = (lat: number, lng: number) => {
    const x = 50 + (lng - 7.49508) * 2500;
    const y = 50 - (lat - 9.05785) * 2500;
    return { x: `${x}%`, y: `${y}%` };
  };

  const handleNavigate = (prop: Property) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${prop.lat},${prop.lng}`, '_blank');
  };

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-[2rem] overflow-hidden"
      style={{ background: 'var(--map-bg, #E8EDF5)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-40"
        style={{ backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Road-like stripes for visual interest */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--color-primary) 25%, transparent 25%, transparent 50%, var(--color-primary) 50%, var(--color-primary) 75%, transparent 75%)', backgroundSize: '120px 120px' }} />

      {/* Map content */}
      <div className="absolute inset-0">
        {/* User location marker */}
        {userLocation && (
          <div className="absolute z-20 transition-all duration-700"
            style={{ top: mapToXY(userLocation.lat, userLocation.lng).y, left: mapToXY(userLocation.lat, userLocation.lng).x }}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full animate-ping" style={{ background: 'rgba(10,102,194,.2)' }} />
              <div className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}>
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="absolute top-full mt-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full text-white tracking-widest whitespace-nowrap shadow-md"
                style={{ background: 'var(--color-primary)' }}>
                You
              </div>
            </div>
          </div>
        )}

        {/* Property pins */}
        {properties.map(prop => {
          const pos      = mapToXY(prop.lat, prop.lng);
          const isNearest = nearestProperty?._id === prop._id;
          return (
            <div key={prop._id}
              className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: pos.y, left: pos.x }}
              onClick={() => setSelectedPin(prop)}>
              <div className="relative group">
                {isNearest && (
                  <div className="absolute -inset-4 rounded-full animate-ping"
                    style={{ background: 'rgba(var(--color-primary-rgb),.12)', border: '1px solid rgba(var(--color-primary-rgb),.2)' }} />
                )}
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg border-2"
                  style={isNearest
                    ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'white', transform: 'scale(1.1)' }
                    : { background: 'var(--bg-surface)', color: 'var(--color-primary)', borderColor: 'var(--border-strong)' }
                  }>
                  <MapPin size={16} fill={isNearest ? 'white' : 'none'} />
                </div>
                {isNearest && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap"
                    style={{ background: 'var(--color-primary)' }}>
                    <ShieldCheck size={8} /> Nearest
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top-left status badge */}
      <div className="absolute top-5 left-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
          {userLocation ? 'GPS Active' : 'Map View'}
        </div>
        {!userLocation && (
          <div className="px-4 py-3 rounded-2xl text-[10px] font-medium leading-relaxed max-w-[220px]"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            Enable GPS to find the nearest verified property to your location.
          </div>
        )}
      </div>

      {/* Selected property drawer */}
      {selectedPin && (
        <div className="absolute bottom-5 left-5 right-5 md:left-auto md:w-[380px] rounded-2xl p-5 animate-in slide-in-from-bottom-8 duration-300 z-30"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
          <button onClick={() => setSelectedPin(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full transition-all"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-surface-alt)' }}>
            <X size={16} />
          </button>

          <div className="flex gap-4 mb-4">
            {selectedPin.images?.[0] && (
              <img src={selectedPin.images[0]} alt=""
                className="w-20 h-20 rounded-xl object-cover shrink-0"
                style={{ border: '1px solid var(--border-color)' }} />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{selectedPin.title}</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{selectedPin.district}</p>
              <div className="flex items-center gap-2 p-2 rounded-xl"
                style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)' }}>
                <UserIcon size={12} style={{ color: 'var(--color-primary)' }} />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Agent</p>
                  <p className="text-[10px] font-black truncate" style={{ color: 'var(--text-primary)' }}>{selectedPin.agentName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleNavigate(selectedPin)}
              className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
              style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              <Navigation size={13} /> Navigate
            </button>
            <button onClick={() => onViewDetails(selectedPin)}
              className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 text-white transition-all"
              style={{ background: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(var(--color-primary-rgb),.3)' }}>
              Details <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Nearest property badge */}
      {userLocation && nearestProperty && !selectedPin && (
        <div className="absolute bottom-5 left-5 px-4 py-3 rounded-2xl hidden md:flex flex-col gap-0.5 pointer-events-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Nearest Listing</span>
          <span className="text-sm font-black truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>{nearestProperty.title}</span>
          <span className="text-[10px] font-black" style={{ color: 'var(--color-primary)' }}>
            {getDistance(userLocation.lat, userLocation.lng, nearestProperty.lat, nearestProperty.lng).toFixed(1)} km away
          </span>
        </div>
      )}
    </div>
  );
};
