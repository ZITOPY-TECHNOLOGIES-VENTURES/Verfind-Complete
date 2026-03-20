
import React, { useState, FormEvent, ChangeEvent, useRef } from 'react';
import api from '../services/api';
import { Property, AbujaDistrict } from '../types';
import { Video, Image as ImageIcon, AlertCircle, ShieldAlert, Bed, Bath, Maximize2, Car, Sofa, X } from 'lucide-react';

interface ListingFormProps {
  onPropertyCreated: (property?: Property) => void;
}

const districts: AbujaDistrict[] = [
  'Wuse', 'Maitama', 'Gwarimpa', 'Lugbe', 'Kubwa', 'Bwari', 'Asokoro', 'Jabi',
  'Central Area', 'Apo', 'Dawaki', 'Galadimawa', 'Lokogoma', 'Guzape', 'Katampe', 'Life Camp', 'Mpape'
];

const ListingForm: React.FC<ListingFormProps> = ({ onPropertyCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    district: 'Wuse' as AbujaDistrict,
    address: '',
    type: 'Apartment' as Property['type'],
    baseRent: '',
    serviceCharge: '',
    cautionFee: '',
    videoUrl: '',
    bedrooms: '2',
    bathrooms: '1',
    sqm: '',
    furnished: false,
    parking: false,
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseRent     = Number(formData.baseRent)     || 0;
  const serviceCharge = Number(formData.serviceCharge) || 0;
  const cautionFee   = Number(formData.cautionFee)   || 0;
  const agencyFee    = baseRent * 0.10;
  const legalFee     = baseRent * 0.10;
  const total        = baseRent + serviceCharge + cautionFee + agencyFee + legalFee;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox'
      ? (target as HTMLInputElement).checked
      : target.value;
    setFormData(prev => ({ ...prev, [target.name]: value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newImages: string[] = [];
    for (const file of Array.from(e.target.files)) {
      const dataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target!.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(dataUrl);
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.videoUrl)  return setError('A video walkthrough URL is mandatory for Verifind listings.');
    if (images.length === 0) return setError('At least one high-quality image is required.');

    setLoading(true);
    try {
      const response = await api.post('/properties', {
        ...formData,
        baseRent,
        serviceCharge,
        cautionFee,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        sqm: Number(formData.sqm) || 0,
        images,
      }) as any;

      if (response.success) {
        setSuccess(true);
        onPropertyCreated(response.data as Property);
        setFormData({
          title: '', description: '', district: 'Wuse', address: '',
          type: 'Apartment', baseRent: '', serviceCharge: '', cautionFee: '',
          videoUrl: '', bedrooms: '2', bathrooms: '1', sqm: '',
          furnished: false, parking: false,
        });
        setImages([]);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(response.message || 'Failed to create listing');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6 border-b border-[var(--border-color)] pb-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Add New Listing</h3>
        <div className="mt-2 flex items-center gap-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <ShieldAlert size={15} className="text-blue-500 shrink-0" />
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-relaxed">
            Placements restricted to Verified & Admin Agents.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-xl text-xs flex items-center gap-2 border border-red-500/20">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20">
          ✓ Listing published successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Property Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Luxury 3 Bed Flat in Maitama" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Property Type *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option>Apartment</option>
              <option>House</option>
              <option>Duplex</option>
              <option>Bungalow</option>
            </select>
          </div>
        </div>

        {/* District + Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">District *</label>
            <select name="district" value={formData.district} onChange={handleChange}>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Address *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Street & house number" />
          </div>
        </div>

        {/* ── NEW: Bedrooms / Bathrooms / SQM ── */}
        <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-color)]">
          <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-3">Property Specs</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Bed size={12} /> Bedrooms *
              </label>
              <select name="bedrooms" value={formData.bedrooms} onChange={handleChange}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Bath size={12} /> Bathrooms *
              </label>
              <select name="bathrooms" value={formData.bathrooms} onChange={handleChange}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Maximize2 size={11} /> Size (m²)
              </label>
              <input type="number" name="sqm" value={formData.sqm} onChange={handleChange} placeholder="e.g. 120" />
            </div>
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} className="w-4 h-4 rounded accent-primary" />
                <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                  <Sofa size={12} /> Furnished
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} className="w-4 h-4 rounded accent-primary" />
                <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                  <Car size={12} /> Parking
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-color)]">
          <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-3">Cost Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Base Rent (₦/yr) *</label>
              <input type="number" name="baseRent" value={formData.baseRent} onChange={handleChange} required placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Service Charge (₦)</label>
              <input type="number" name="serviceCharge" value={formData.serviceCharge} onChange={handleChange} placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Caution Fee (₦)</label>
              <input type="number" name="cautionFee" value={formData.cautionFee} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-color)] text-xs">
            {[
              { label: 'Agency (10%)', val: agencyFee },
              { label: 'Legal (10%)', val: legalFee },
            ].map(item => (
              <div key={item.label}>
                <span className="block text-[var(--text-secondary)] mb-0.5">{item.label}</span>
                <span className="font-bold">₦{item.val.toLocaleString()}</span>
              </div>
            ))}
            <div className="col-span-2 text-right">
              <span className="block text-[var(--text-secondary)] mb-0.5">True Abuja Cost</span>
              <span className="text-lg font-black text-[var(--color-primary)]">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the property, nearby amenities, access roads..."
            className="w-full resize-none"
          />
        </div>

        {/* Video URL */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
            <Video size={13} /> Video Walkthrough URL *
          </label>
          <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} required placeholder="https://youtube.com/watch?v=..." />
          <p className="text-[10px] text-[var(--text-muted)]">Required — YouTube or Vimeo links preferred.</p>
        </div>

        {/* Images */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
            <ImageIcon size={13} /> Property Images * (min 1)
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt="preview" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={10} />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded">COVER</div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-xs gap-1"
            >
              <ImageIcon size={18} />
              <span className="text-[9px] font-bold">Add</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
        </div>

        <button
          type="submit"
          className="w-full btn btn-primary py-3.5 text-sm font-black uppercase tracking-wider"
          disabled={loading}
        >
          {loading ? 'Publishing...' : '🛡️ Publish Verified Listing'}
        </button>
      </form>
    </div>
  );
};

export default ListingForm;
