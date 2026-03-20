# Verifind Production Launch Guide

**Target Scale:** 100,000+ Users  
**Region:** Abuja, Nigeria  
**Architecture:** React SPA (Frontend) + Supabase (Backend/Auth/DB) + IndexedDB (Offline Cache)

---

## 1. Email Setup: Google Workspace & DNS Configuration

**Why:** Ensure 99.9% deliverability for password resets and verification emails.
**Warning:** DNS propagation takes 24-48 hours. Do this first.

### Step 1: DNS Records
Add these to your domain registrar (Namecheap/GoDaddy/WhoGoHost):

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | @ | aspmx.l.google.com | 10 |
| MX | @ | alt1.aspmx.l.google.com | 20 |
| TXT | @ | `v=spf1 include:_spf.google.com include:resend.com ~all` | - |
| TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:admin@verifind.com` | - |

### Step 2: Automated Email Service (Resend)
Direct Gmail API limits are too low (~2,000/day). Use Resend for transactional emails.
1.  Sign up at [Resend.com](https://resend.com).
2.  Add domain & verify DKIM records.
3.  **Env Var:** `VITE_RESEND_API_KEY=re_123...` (Use via Edge Function, do not expose in frontend).

---

## 2. Backend Architecture: Supabase Setup

**Why:** Replaces `MockApi` and local `idb` with a scalable, real-time cloud database.

### Step 1: Project & Schema
1.  Create Supabase Project (Region: UK/London for best latency to Nigeria).
2.  Run this SQL in the SQL Editor:

```sql
-- 1. PROFILES (Extends Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  role text check (role in ('tenant', 'agent', 'admin')),
  is_verified boolean default false,
  whatsapp_number text,
  created_at timestamptz default now()
);

-- 2. PROPERTIES
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  district text not null, -- Indexed for Abuja filtering
  address text,
  price numeric not null,
  images text[], -- Array of URLs
  video_url text,
  agent_id uuid references public.profiles(id),
  is_verified boolean default false,
  status text default 'available',
  created_at timestamptz default now()
);

-- 3. INDEXES (Performance)
create index idx_props_district on public.properties(district);
create index idx_props_price on public.properties(price);
create index idx_props_agent on public.properties(agent_id);

-- 4. RLS POLICIES (Security)
alter table public.properties enable row level security;

-- Public Read
create policy "Public properties are viewable by everyone"
  on public.properties for select using (true);

-- Agent Insert (Only their own)
create policy "Agents can insert own properties"
  on public.properties for insert with check (auth.uid() = agent_id);

-- Agent Update (Only their own)
create policy "Agents can update own properties"
  on public.properties for update using (auth.uid() = agent_id);
```

---

## 3. Frontend Integration: Migration from MockApi

**Why:** Connects your React app to the cloud.

### Step 1: Install SDK
```bash
npm install @supabase/supabase-js
```

### Step 2: Initialize Client (`services/supabase.ts`)
Create this file to replace the core logic of `api.ts`.

```typescript
import { createClient } from '@supabase/supabase-js';

// Env vars must start with VITE_ in Vite apps
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 3: Refactor Fetch Logic
Update your data fetching in `Dashboard.tsx` or `api.ts`:

```typescript
// OLD (Local)
// const response = await api.get('/properties');

// NEW (Cloud with Filters)
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('district', selectedDistrict) // Server-side filtering
  .order('created_at', { ascending: false });
```

---

## 4. IndexedDB Strategy: Offline-First Sync

**Why:** Nigeria's network is unstable. Users need to view content offline.

### Strategy: "Stale-While-Revalidate"
1.  **Read:** Always read from `idb` (instant load).
2.  **Background:** Fetch new data from Supabase.
3.  **Write:** Update `idb` with new data & refresh UI.

### Implementation Snippet (`services/sync.ts`)

```typescript
import { db } from './db'; // Your existing idb instance
import { supabase } from './supabase';

export async function syncProperties() {
  // 1. Fetch latest from Cloud
  const { data: cloudProps } = await supabase.from('properties').select('*');
  
  if (cloudProps) {
    // 2. Update Local DB
    const tx = db.transaction('properties', 'readwrite');
    await tx.store.clear(); // Simple strategy: replace all
    for (const prop of cloudProps) {
      await tx.store.add(prop);
    }
    await tx.done;
  }
}
```

---

## 5. Abuja-Specific Features & Optimization

**Why:** Local market fit.

### WhatsApp Integration
Nigerian users prefer WhatsApp over email. Add this to `PropertyCard.tsx`:

```typescript
const handleWhatsApp = () => {
  const message = `Hi, I'm interested in ${property.title} in ${property.district}.`;
  const url = `https://wa.me/${agentWhatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
```

### Image Optimization (Cloudinary)
Don't store Base64 in Supabase (it bloats the DB).
1.  Create Cloudinary account.
2.  Add Upload Widget in `ListingForm.tsx`.
3.  Store only the `secure_url` in Supabase `images` array.
4.  Use auto-format in URLs: `image_url.replace('/upload/', '/upload/w_800,f_auto,q_auto/')`.

---

## 6. Security Checklist

1.  **RLS is Mandatory:** Ensure every table in Supabase has `ENABLE ROW LEVEL SECURITY` on.
2.  **Env Var Isolation:** Never commit `.env` files. `SERVICE_ROLE_KEY` must **never** appear in client-side code.
3.  **Input Sanitization:** Although React escapes HTML, ensure API inputs (if using Edge Functions) validate types strictly (e.g. `price` must be number).
4.  **Bot Protection:** Add Google Recaptcha to the Login/Register forms to prevent bot spam.
