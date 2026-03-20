import React from 'react';
import { AbujaDistrict } from '../types';
import { MapPin, ArrowUpRight, Home, TrendingUp, Building2 } from 'lucide-react';

interface DistrictGridProps {
  onSelect: (district: AbujaDistrict) => void;
  listingMode?: 'rent' | 'buy' | 'sell';
}

interface DistrictInfo {
  name: AbujaDistrict;
  desc: string;
  gradient: string;
  image: string;         // Unsplash photo URL
  avgRent: string;       // average rent label
  avgBuy: string;        // average buy price label
  listings: number;      // mock listing count
  tier: 'Elite' | 'Mid' | 'Value';
}

const districts: DistrictInfo[] = [
  {
    name: 'Maitama',
    desc: 'Elite Diplomatic District',
    gradient: 'from-emerald-900/70 to-teal-950/80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    avgRent: '₦4.5M/yr',
    avgBuy: '₦180M+',
    listings: 24,
    tier: 'Elite',
  },
  {
    name: 'Asokoro',
    desc: 'VIP Security Residential',
    gradient: 'from-slate-800/70 to-slate-950/80',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    avgRent: '₦3.8M/yr',
    avgBuy: '₦150M+',
    listings: 18,
    tier: 'Elite',
  },
  {
    name: 'Guzape',
    desc: 'Hilly Luxury Estates',
    gradient: 'from-rose-900/70 to-pink-950/80',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    avgRent: '₦3.2M/yr',
    avgBuy: '₦120M+',
    listings: 31,
    tier: 'Elite',
  },
  {
    name: 'Katampe',
    desc: 'Modern Heights',
    gradient: 'from-amber-800/70 to-orange-950/80',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
    avgRent: '₦2.8M/yr',
    avgBuy: '₦95M+',
    listings: 15,
    tier: 'Elite',
  },
  {
    name: 'Wuse',
    desc: 'Commercial Center',
    gradient: 'from-orange-800/70 to-red-950/80',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    avgRent: '₦2.2M/yr',
    avgBuy: '₦75M+',
    listings: 42,
    tier: 'Mid',
  },
  {
    name: 'Central Area',
    desc: 'Admin & Business Hub',
    gradient: 'from-blue-800/70 to-indigo-950/80',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    avgRent: '₦2.0M/yr',
    avgBuy: '₦70M+',
    listings: 28,
    tier: 'Mid',
  },
  {
    name: 'Jabi',
    desc: 'Lakeside Serenity',
    gradient: 'from-cyan-800/70 to-blue-950/80',
    image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600&q=80',
    avgRent: '₦1.8M/yr',
    avgBuy: '₦65M+',
    listings: 33,
    tier: 'Mid',
  },
  {
    name: 'Gwarimpa',
    desc: 'Largest Housing Estate',
    gradient: 'from-purple-800/70 to-indigo-950/80',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
    avgRent: '₦1.5M/yr',
    avgBuy: '₦55M+',
    listings: 57,
    tier: 'Mid',
  },
  {
    name: 'Life Camp',
    desc: 'Quiet Expat Favorite',
    gradient: 'from-lime-800/70 to-green-950/80',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
    avgRent: '₦1.4M/yr',
    avgBuy: '₦50M+',
    listings: 22,
    tier: 'Mid',
  },
  {
    name: 'Apo',
    desc: 'Growing Community',
    gradient: 'from-violet-800/70 to-fuchsia-950/80',
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80',
    avgRent: '₦1.1M/yr',
    avgBuy: '₦38M+',
    listings: 19,
    tier: 'Value',
  },
  {
    name: 'Lokogoma',
    desc: 'Estate Family Living',
    gradient: 'from-sky-800/70 to-blue-950/80',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    avgRent: '₦900K/yr',
    avgBuy: '₦32M+',
    listings: 38,
    tier: 'Value',
  },
  {
    name: 'Galadimawa',
    desc: 'Mid-Range Living',
    gradient: 'from-emerald-800/70 to-green-950/80',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    avgRent: '₦800K/yr',
    avgBuy: '₦28M+',
    listings: 26,
    tier: 'Value',
  },
  {
    name: 'Dawaki',
    desc: 'Scenic Development',
    gradient: 'from-yellow-800/70 to-orange-950/80',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80',
    avgRent: '₦750K/yr',
    avgBuy: '₦25M+',
    listings: 14,
    tier: 'Value',
  },
  {
    name: 'Lugbe',
    desc: 'Strategic Link Hub',
    gradient: 'from-red-800/70 to-stone-950/80',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
    avgRent: '₦700K/yr',
    avgBuy: '₦22M+',
    listings: 45,
    tier: 'Value',
  },
  {
    name: 'Kubwa',
    desc: 'Rail Community',
    gradient: 'from-indigo-800/70 to-blue-950/80',
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=80',
    avgRent: '₦650K/yr',
    avgBuy: '₦20M+',
    listings: 52,
    tier: 'Value',
  },
  {
    name: 'Bwari',
    desc: 'Legal & University Area',
    gradient: 'from-teal-800/70 to-emerald-950/80',
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80',
    avgRent: '₦600K/yr',
    avgBuy: '₦18M+',
    listings: 17,
    tier: 'Value',
  },
  {
    name: 'Mpape',
    desc: 'Rugged Heights',
    gradient: 'from-neutral-700/70 to-neutral-950/80',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80',
    avgRent: '₦500K/yr',
    avgBuy: '₦15M+',
    listings: 11,
    tier: 'Value',
  },
];

const TIER_COLORS = {
  Elite: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Mid:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Value: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

export const DistrictGrid: React.FC<DistrictGridProps> = ({ onSelect, listingMode = 'rent' }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {listingMode === 'buy'  && 'Buy in Abuja'}
            {listingMode === 'rent' && 'Rent in Abuja'}
            {listingMode === 'sell' && 'Sell Your Property'}
          </h2>
          <p className="text-sm text-white/40 font-medium mt-0.5">
            {districts.length} districts · {districts.reduce((a, d) => a + d.listings, 0)} verified listings
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-white/30 uppercase tracking-widest">
          <Building2 size={14} /> FCT
        </div>
      </div>

      {/* Tier legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['Elite', 'Mid', 'Value'] as const).map(tier => (
          <div key={tier} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${TIER_COLORS[tier]}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {tier}
          </div>
        ))}
        <span className="text-[10px] text-white/25 font-semibold ml-auto hidden md:block">
          Prices show {listingMode === 'buy' ? 'purchase' : 'annual rent'} averages
        </span>
      </div>

      {/* District grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pb-8">
        {districts.map((d, i) => (
          <button
            key={d.name}
            onClick={() => onSelect(d.name)}
            style={{ animationDelay: `${i * 40}ms` }}
            className="group relative overflow-hidden rounded-2xl md:rounded-3xl h-44 md:h-60 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-white/5 outline-none focus:ring-2 focus:ring-primary/50 animate-in fade-in zoom-in-95"
          >
            {/* Real property photo background */}
            <img
              src={d.image}
              alt={d.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
              onError={e => {
                // Fallback to gradient if image fails
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />

            {/* Dark overlay gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t ${d.gradient} transition-opacity duration-500 group-hover:opacity-80`} />

            {/* Tier badge */}
            <div className={`absolute top-3 right-3 z-10 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border backdrop-blur-sm ${TIER_COLORS[d.tier]}`}>
              {d.tier}
            </div>

            {/* Listing count badge */}
            <div className="absolute top-3 left-3 z-10 bg-black/50 text-white text-[9px] font-black px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
              {d.listings} listed
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end text-white text-left z-10">
              <div className="flex justify-between items-end gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1.5">
                    <MapPin size={9} className="text-white/60 shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60">Abuja, FCT</span>
                  </div>
                  <h3 className="text-base md:text-xl font-black tracking-tight leading-tight drop-shadow-md truncate">
                    {d.name}
                  </h3>
                  <p className="hidden md:block text-[10px] text-white/65 font-semibold mt-0.5 leading-snug drop-shadow-sm">
                    {d.desc}
                  </p>
                  {/* Price indicator */}
                  <div className="mt-2 text-[10px] font-black text-white/90 drop-shadow-sm">
                    {listingMode === 'buy' ? (
                      <span>From <span className="text-amber-300">{d.avgBuy}</span></span>
                    ) : (
                      <span>Avg <span className="text-emerald-300">{d.avgRent}</span></span>
                    )}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-400 shrink-0">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
