
import { Property, ApiResponse, VerificationStage, Task, PropertyFilters } from '../types.ts';
import { db } from './db.ts';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DISTRICT_COORDS_SEED: Record<string, { lat: number, lng: number }> = {
  'Central Area': { lat: 9.053, lng: 7.489 },
  'Maitama':      { lat: 9.088, lng: 7.498 },
  'Wuse':         { lat: 9.066, lng: 7.456 },
  'Asokoro':      { lat: 9.035, lng: 7.518 },
  'Gwarimpa':     { lat: 9.102, lng: 7.391 },
  'Jabi':         { lat: 9.068, lng: 7.425 },
  'Guzape':       { lat: 9.015, lng: 7.502 },
  'Lugbe':        { lat: 8.972, lng: 7.368 },
  'Kubwa':        { lat: 9.138, lng: 7.346 },
  'Bwari':        { lat: 9.175, lng: 7.376 },
  'Apo':          { lat: 8.999, lng: 7.530 },
  'Dawaki':       { lat: 9.043, lng: 7.398 },
  'Galadimawa':   { lat: 9.016, lng: 7.436 },
  'Lokogoma':     { lat: 8.978, lng: 7.427 },
  'Katampe':      { lat: 9.101, lng: 7.459 },
  'Life Camp':    { lat: 9.093, lng: 7.410 },
  'Mpape':        { lat: 9.128, lng: 7.511 },
};

const STAGES: VerificationStage[] = [
  'listing_created', 'docs_uploaded', 'agent_vetted', 'inspection_scheduled', 'verified'
];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

// ── Real Unsplash property images pool ───────────────────────────────────────
const PROPERTY_IMAGES: Record<string, string[]> = {
  'Maitama': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  ],
  'Asokoro': [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  ],
  'Guzape': [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&q=80',
  ],
  'Wuse': [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
  ],
  'Jabi': [
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80',
  ],
  'Gwarimpa': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
  ],
};

function getImagesForDistrict(district: string): string[] {
  return PROPERTY_IMAGES[district] || PROPERTY_IMAGES['default'];
}

export const getUserId = () => {
  const userStr = localStorage.getItem('vf_user');
  if (userStr) {
    try { return JSON.parse(userStr)._id; } catch (e) {}
  }
  return 'guest';
};

// ── In-memory favorites for mock engine ──────────────────────────────────────
const mockFavorites: Map<string, Set<string>> = new Map();

class BridgeApi {
  private async delay(ms = 250) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('vf_token');
    const userStr = localStorage.getItem('vf_user');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        headers['x-user-id'] = user._id;
        headers['x-user-name'] = user.username;
        headers['x-user-role'] = user.role;
      } catch (e) {}
    }
    return headers;
  }

  private async bridgeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    if (BACKEND_URL) {
      try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method,
          headers: this.getAuthHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await response.json();
        return { data, success: response.ok, status: response.status };
      } catch (error) {
        console.warn('Live bridge failed, falling back to Mock Engine');
      }
    }
    return this.mockEngine<T>(method, endpoint, body);
  }

  // ── MOCK ENGINE ─────────────────────────────────────────────────────────────
  private async mockEngine<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    await this.delay();
    const headers = this.getAuthHeaders();
    const userId   = headers['x-user-id']   || 'guest';
    const userName = headers['x-user-name'] || 'Agent Verifind';
    const userRole = headers['x-user-role'] || 'tenant';

    try {
      // ── AUTH ──────────────────────────────────────────────────────────────
      if (endpoint === '/auth/login' && method === 'POST') {
        const user = await db.getFromIndex('users', 'by-email', body.email);
        if (user && user.password === body.password) {
          const { password, ...safeUser } = user;
          return { success: true, status: 200, data: { token: 'mock-jwt', user: safeUser } as any };
        }
        return { success: false, status: 401, message: 'Invalid credentials' };
      }

      if (endpoint === '/auth/register' && method === 'POST') {
        const existing = await db.getFromIndex('users', 'by-email', body.email);
        if (existing) return { success: false, status: 409, message: 'Email already registered' };
        const newUser = {
          _id: crypto.randomUUID(),
          username: body.username,
          email: body.email,
          password: body.password,
          role: body.role || 'tenant',
          isKycVerified: false,
          createdAt: new Date().toISOString(),
        };
        await db.add('users', newUser as any);
        const { password, ...safeUser } = newUser;
        return { success: true, status: 201, data: { token: 'mock-jwt', user: safeUser } as any };
      }

      // ── PROPERTIES (with search + filter) ─────────────────────────────────
      if (endpoint.startsWith('/properties') && method === 'GET') {
        // Single property by ID
        const idMatch = endpoint.match(/^\/properties\/([^/]+)$/);
        if (idMatch) {
          const prop = await db.get('properties', idMatch[1]);
          return prop
            ? { success: true, status: 200, data: prop as any }
            : { success: false, status: 404, message: 'Not found' };
        }

        // List with filters from query string in body
        let props = await db.getAll('properties');
        const f: Partial<PropertyFilters> = body || {};

        // Backfill legacy data
        props = props.map(p => {
          if (!p.lat) {
            const seed = DISTRICT_COORDS_SEED[p.district] || { lat: 9.05, lng: 7.49 };
            p.lat = seed.lat + rand(-0.01, 0.01);
            p.lng = seed.lng + rand(-0.01, 0.01);
          }
          if (!p.agentName) p.agentName = 'Verified Agent #01';
          if (p.bedrooms === undefined) p.bedrooms = 2;
          if (p.bathrooms === undefined) p.bathrooms = 1;
          if (p.sqm === undefined) p.sqm = 80;
          // Backfill real images if still placeholder
          if (!p.images || p.images.length === 0 || p.images[0].startsWith('data:')) {
            p.images = getImagesForDistrict(p.district);
          }
          return p;
        });

        if (f.search) {
          const q = f.search.toLowerCase();
          props = props.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.address.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q)
          );
        }
        if (f.district) props = props.filter(p => p.district === f.district);
        if (f.type)     props = props.filter(p => p.type === f.type);
        if (f.status)   props = props.filter(p => p.status === f.status);
        if (f.verified === true)  props = props.filter(p => p.isVerified);
        if (f.verified === false) props = props.filter(p => !p.isVerified);
        if (f.minRent)  props = props.filter(p => p.baseRent >= Number(f.minRent));
        if (f.maxRent)  props = props.filter(p => p.baseRent <= Number(f.maxRent));
        if (f.bedrooms) props = props.filter(p => p.bedrooms >= Number(f.bedrooms));
        if (f.bathrooms) props = props.filter(p => p.bathrooms >= Number(f.bathrooms));

        // Sort
        const sortBy = f.sortBy || 'createdAt';
        const sortDir = f.sortDir || 'desc';
        props.sort((a, b) => {
          const aVal = (a as any)[sortBy] ?? '';
          const bVal = (b as any)[sortBy] ?? '';
          return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });

        return { success: true, status: 200, data: props.reverse() as any };
      }

      if (endpoint === '/properties' && method === 'POST') {
        const baseRent = Number(body.baseRent) || 0;
        const seed = DISTRICT_COORDS_SEED[body.district] || { lat: 9.05, lng: 7.49 };
        const newProperty: Property = {
          _id: crypto.randomUUID(),
          ...body,
          baseRent,
          bedrooms: Number(body.bedrooms) || 1,
          bathrooms: Number(body.bathrooms) || 1,
          sqm: Number(body.sqm) || 0,
          furnished: Boolean(body.furnished),
          parking: Boolean(body.parking),
          lat: seed.lat + rand(-0.01, 0.01),
          lng: seed.lng + rand(-0.01, 0.01),
          agencyFee: baseRent * 0.1,
          legalFee: baseRent * 0.1,
          totalInitialPayment:
            baseRent + baseRent * 0.2 +
            (Number(body.serviceCharge) || 0) +
            (Number(body.cautionFee) || 0),
          // Use uploaded images if provided, otherwise fall back to district stock photos
          images: (body.images && body.images.length > 0 && !body.images[0].startsWith('data:'))
            ? body.images
            : (body.images && body.images.length > 0)
              ? body.images  // keep base64 uploads as-is
              : getImagesForDistrict(body.district),
          isVerified: false,
          verificationStage: 'listing_created',
          agentId: userId,
          agentName: userName,
          createdAt: new Date().toISOString(),
          status: 'available',
        };
        await db.add('properties', newProperty);
        return { success: true, status: 201, data: newProperty as any };
      }

      // ── VERIFY ─────────────────────────────────────────────────────────────
      const verifyMatch = endpoint.match(/^\/properties\/([^/]+)\/verify$/);
      if (verifyMatch && method === 'POST') {
        const prop = await db.get('properties', verifyMatch[1]);
        if (!prop) return { success: false, status: 404, message: 'Not found' };
        const idx = STAGES.indexOf(prop.verificationStage);
        if (idx === STAGES.length - 1)
          return { success: false, status: 400, message: 'Already verified' };
        const nextStage = STAGES[idx + 1];
        const updated = { ...prop, verificationStage: nextStage, isVerified: nextStage === 'verified' };
        await db.put('properties', updated);
        return { success: true, status: 200, data: updated as any };
      }

      // ── BOOK INSPECTION ────────────────────────────────────────────────────
      const bookMatch = endpoint.match(/^\/properties\/([^/]+)\/book-inspection$/);
      if (bookMatch && method === 'POST') {
        const prop = await db.get('properties', bookMatch[1]);
        if (!prop) return { success: false, status: 404, message: 'Not found' };
        const idx = STAGES.indexOf(prop.verificationStage);
        const targetIdx = STAGES.indexOf('inspection_scheduled');
        const newStage = idx < targetIdx ? STAGES[idx + 1] : prop.verificationStage;
        const updated = {
          ...prop,
          verificationStage: newStage,
          isVerified: newStage === 'verified',
          lastInspectionRequest: { tenantId: userId, tenantName: userName, requestedAt: new Date().toISOString() },
        };
        await db.put('properties', updated);
        return { success: true, status: 200, data: updated as any };
      }

      // ── FAVORITES ──────────────────────────────────────────────────────────
      if (endpoint === '/favorites' && method === 'GET') {
        const favIds = mockFavorites.get(userId) || new Set<string>();
        const favProps: Property[] = [];
        for (const id of favIds) {
          const p = await db.get('properties', id);
          if (p) favProps.push(p);
        }
        return { success: true, status: 200, data: favProps as any };
      }

      if (endpoint === '/favorites/ids' && method === 'GET') {
        const favIds = mockFavorites.get(userId) || new Set<string>();
        return { success: true, status: 200, data: [...favIds] as any };
      }

      const favAddMatch = endpoint.match(/^\/favorites\/([^/]+)$/);
      if (favAddMatch && method === 'POST') {
        if (!mockFavorites.has(userId)) mockFavorites.set(userId, new Set());
        mockFavorites.get(userId)!.add(favAddMatch[1]);
        return { success: true, status: 200, data: { propertyId: favAddMatch[1], saved: true } as any };
      }

      if (favAddMatch && method === 'DELETE') {
        mockFavorites.get(userId)?.delete(favAddMatch[1]);
        return { success: true, status: 200, data: { propertyId: favAddMatch[1], saved: false } as any };
      }

      // ── TASKS ──────────────────────────────────────────────────────────────
      if (endpoint.startsWith('/tasks') && method === 'GET') {
        const tasks = await db.getAll('tasks');
        return { success: true, status: 200, data: tasks.filter(t => t.userId === userId) as any };
      }

      if (endpoint === '/tasks' && method === 'POST') {
        const newTask: Task = {
          _id: crypto.randomUUID(),
          userId,
          ...body,
          status: body.status || 'todo',
          createdAt: new Date().toISOString(),
        };
        await db.add('tasks', newTask);
        return { success: true, status: 201, data: newTask as any };
      }

      if (endpoint.startsWith('/tasks/') && method === 'PUT') {
        const id = endpoint.split('/').pop()!;
        const existing = await db.get('tasks', id);
        if (!existing) return { success: false, status: 404, message: 'Task not found' };
        const updated = { ...existing, ...body };
        await db.put('tasks', updated);
        return { success: true, status: 200, data: updated as any };
      }

      if (endpoint.startsWith('/tasks/') && method === 'DELETE') {
        const id = endpoint.split('/').pop()!;
        await db.delete('tasks', id);
        return { success: true, status: 200, data: { id } as any };
      }

      return { success: false, status: 404, message: 'Not found' };
    } catch (e: any) {
      return { success: false, status: 500, message: e.message };
    }
  }

  public async get<T>(endpoint: string, filters?: any) {
    return this.bridgeRequest<T>('GET', endpoint, filters);
  }
  public async post<T>(endpoint: string, body: any) {
    return this.bridgeRequest<T>('POST', endpoint, body);
  }
  public async put<T>(endpoint: string, body: any) {
    return this.bridgeRequest<T>('PUT', endpoint, body);
  }
  public async delete<T>(endpoint: string) {
    return this.bridgeRequest<T>('DELETE', endpoint);
  }
  public isLiveMode(): boolean { return !!BACKEND_URL; }
}

const api = new BridgeApi();
export default api;

// ── Demo Seed: pre-populate with sample listings so the app isn't empty ───────
const SEED_PROPERTIES = [
  {
    title: 'Luxury 4-Bed Villa',         district: 'Maitama',    type: 'House',
    address: '14 Ministers Hill, Maitama', baseRent: 4500000,
    bedrooms: 4, bathrooms: 3, sqm: 320, furnished: true, parking: true,
    verificationStage: 'verified' as VerificationStage, isVerified: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Expansive 4-bedroom villa in the heart of Maitama with a private garden, generator, and 24/7 security estate.',
  },
  {
    title: 'Modern 3-Bed Duplex',         district: 'Asokoro',   type: 'Duplex',
    address: '8 Asokoro Extension',       baseRent: 3800000,
    bedrooms: 3, bathrooms: 2, sqm: 240, furnished: true, parking: true,
    verificationStage: 'verified' as VerificationStage, isVerified: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Premium duplex in a gated estate with BQ, fitted kitchen, and uninterrupted power supply.',
  },
  {
    title: 'Serviced 2-Bed Apartment',    district: 'Jabi',      type: 'Apartment',
    address: '33 Jabi Lake Road',         baseRent: 1800000,
    bedrooms: 2, bathrooms: 2, sqm: 120, furnished: true, parking: true,
    verificationStage: 'inspection_scheduled' as VerificationStage, isVerified: false,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Stylish serviced apartment overlooking Jabi Lake. Fully furnished with modern fittings.',
  },
  {
    title: 'Spacious 3-Bed Flat',         district: 'Gwarimpa',  type: 'Apartment',
    address: '5th Avenue Gwarimpa Estate', baseRent: 1500000,
    bedrooms: 3, bathrooms: 2, sqm: 160, furnished: false, parking: true,
    verificationStage: 'agent_vetted' as VerificationStage, isVerified: false,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Spacious 3-bedroom flat in Nigeria\'s largest housing estate with easy access to major roads.',
  },
  {
    title: 'Executive 5-Bed Mansion',     district: 'Guzape',    type: 'House',
    address: 'Plot 21 Guzape Hills',      baseRent: 5500000,
    bedrooms: 5, bathrooms: 4, sqm: 480, furnished: true, parking: true,
    verificationStage: 'verified' as VerificationStage, isVerified: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Grand mansion with panoramic views over Abuja city, swimming pool, and a staff quarters.',
  },
  {
    title: 'Cozy 1-Bed Studio',           district: 'Wuse',      type: 'Apartment',
    address: 'Zone 5, Wuse',              baseRent: 950000,
    bedrooms: 1, bathrooms: 1, sqm: 55,  furnished: true, parking: false,
    verificationStage: 'docs_uploaded' as VerificationStage, isVerified: false,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Compact studio apartment in the heart of Wuse. Ideal for young professionals.',
  },
  {
    title: '2-Bed Bungalow',              district: 'Life Camp',  type: 'Bungalow',
    address: 'Life Camp Extension',        baseRent: 1200000,
    bedrooms: 2, bathrooms: 1, sqm: 90,  furnished: false, parking: true,
    verificationStage: 'verified' as VerificationStage, isVerified: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Quiet bungalow in the expat-friendly Life Camp neighbourhood. Close to international schools.',
  },
  {
    title: 'Semi-Detached 4-Bed House',   district: 'Katampe',   type: 'House',
    address: 'Katampe Extension Phase 2', baseRent: 2800000,
    bedrooms: 4, bathrooms: 3, sqm: 270, furnished: false, parking: true,
    verificationStage: 'verified' as VerificationStage, isVerified: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Beautiful semi-detached house on Abuja\'s hilltop with fresh mountain breeze and modern finishings.',
  },
];

async function seedDemoData() {
  try {
    const existing = await db.getAll('properties');
    if (existing.length > 0) return; // Don't re-seed if data exists

    const agentId = 'demo-agent-001';
    const agentName = 'Verifind Demo Agent';
    const SEED_COORDS = DISTRICT_COORDS_SEED;

    for (const seed of SEED_PROPERTIES) {
      const coords = SEED_COORDS[seed.district] || { lat: 9.05, lng: 7.49 };
      const br = seed.baseRent;
      const sc = br * 0.05;
      const cf = br * 0.1;
      const prop: Property = {
        _id: crypto.randomUUID(),
        title: seed.title,
        description: seed.description,
        district: seed.district as any,
        address: seed.address,
        type: seed.type as any,
        baseRent: br,
        serviceCharge: sc,
        cautionFee: cf,
        agencyFee: br * 0.1,
        legalFee: br * 0.1,
        totalInitialPayment: br + br * 0.2 + sc + cf,
        bedrooms: seed.bedrooms,
        bathrooms: seed.bathrooms,
        sqm: seed.sqm,
        furnished: seed.furnished,
        parking: seed.parking,
        images: getImagesForDistrict(seed.district),
        videoUrl: seed.videoUrl,
        lat: coords.lat + rand(-0.008, 0.008),
        lng: coords.lng + rand(-0.008, 0.008),
        agentId,
        agentName,
        isVerified: seed.isVerified,
        verificationStage: seed.verificationStage,
        status: 'available',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await db.add('properties', prop);
    }
    console.log('✅ Verifind: Demo listings seeded successfully');
  } catch (e) {
    console.warn('Seed skipped:', e);
  }
}

// Run seed on app load
seedDemoData();

