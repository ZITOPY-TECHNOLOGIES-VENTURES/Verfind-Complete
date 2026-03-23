# Verifind

> Nigeria's first fully verified real estate marketplace — Serving Abuja, FCT.

![Verifind](https://img.shields.io/badge/Status-Active-10B981?style=flat-square) ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

Verifind connects tenants with verified agents and verified property listings across Abuja's key districts. Every listing undergoes a **4-stage AGIS verification** pipeline before being published, and all payments are protected through **Paystack-powered escrow**.

---

## ✨ Key Features

### 🏠 Zillow-Inspired Homepage
- Animated search bar with typewriter suggestions
- Rent / Buy / Sell mode tabs
- Interactive district grid with 12 Abuja districts (Maitama, Asokoro, Guzape, Jabi…)
- RTB (Rent-Buy-Sell) action cards
- Fully responsive — hamburger menu on mobile, stacking grids on tablet/phone

### 🔒 4-Stage Verification Pipeline
| Stage | Description |
|-------|-------------|
| 1. Listing Created | Agent submits property details |
| 2. Documents Uploaded | C-of-O, survey plan, agent licence |
| 3. Legal Title Search | Cross-checked against AGIS database |
| 4. Physical Site Audit | Certified inspector visits property |
| ✅ **Abuja True Verified™** | Badge awarded, listing goes live |

### 💰 Escrow Payment System
- Paystack integration for secure fund holding
- Funds released to agent only after tenant inspection
- Bank account resolution and transfer recipient setup
- Full transaction history and wallet view

### 👤 Role-Based Authentication
- **Tenant**: Browse, save, book inspections, escrow payments
- **Agent**: List properties, upload documents, track verification, receive payouts
- JWT-based auth with OTP verification
- Offline Mock Engine for development without backend

### 🎨 Premium UI
- Liquid Glass design system with dark/light/auto themes
- AI Chat FAB (floating action button)
- Saved Homes FAB with edge-snapping
- Fraunces + DM Sans typography

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Lucide React |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **Payments** | Paystack (escrow, transfers, recipients) |
| **Auth** | JWT, bcrypt, Helmet, Rate Limiting |
| **Email** | Resend API |
| **Deployment** | Vercel (frontend), Render/Railway (backend) |

---

## 🏛 Architecture

```
┌──────────────────────────────────────────────────────┐
│            VERIFIND PLATFORM                         │
│                                                      │
│  Frontend (React + Vite)                             │
│    /              → Home (Zillow-style landing)      │
│    /dashboard     → Dashboard (listings, map, FABs)  │
│    /login         → AuthFlow (Login/Register/Reset)  │
│                                                      │
│  Backend (Express + MongoDB)                         │
│    GET  /api/properties                              │
│    POST /api/properties/:id/verify                   │
│    GET  /api/banks                                   │
│    POST /api/banks/resolve                           │
│    POST /api/banks/setup                             │
│    GET  /api/chat (AI assistant)                     │
│                                                      │
│  Verification Pipeline:                              │
│    listing → docs → title_search → site_audit → ✅   │
│                                                      │
│  Trust: REDAN / NIESV certified agents               │
│  Location: Abuja, FCT, Nigeria                       │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)

### Backend
```bash
cd backend
npm install
# Create .env file (see below)
npm run dev
```

**`.env` configuration:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/verifind
JWT_SECRET=your_super_secret_jwt_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
NODE_ENV=development

# Optional
# RESEND_API_KEY=
# EMAIL_FROM=
# PAYSTACK_SECRET_KEY=
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` (backend) | Starts Express with nodemon |
| `npm start` (backend) | Production server |
| `npm run dev` (frontend) | Vite dev server |
| `npm run build` (frontend) | Production build |
| `npm run preview` (frontend) | Preview production build |

---

## 📄 Legal

**Verifind Ltd** — Registered under CAMA 2020 with the Corporate Affairs Commission (CAC), Nigeria. RC Number pending.

© 2026 Verifind Technologies Ltd. Abuja, FCT, Nigeria.
