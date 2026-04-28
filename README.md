# Verifind

> Nigeria's first fully verified real estate marketplace — Serving Abuja, FCT.

![Status](https://img.shields.io/badge/Status-Active-10B981?style=flat-square) ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

Verifind connects tenants with verified agents and verified property listings across Abuja's key districts. Every listing undergoes a **5-stage verification pipeline** before being published, and all payments are protected through **Paystack-powered escrow**.

**Live URL:** https://verfind-production.onrender.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL (hosted on Render) |
| **Payments** | Paystack (escrow, transfers, recipient setup) |
| **Auth** | JWT, bcrypt, OTP via email |
| **Email** | Brevo (transactional email REST API) |
| **Deployment** | Render (monorepo — backend serves frontend static build) |

---

## Architecture

```
Render Web Service
├── backend/server.js          Express API + serves frontend/dist as static
├── frontend/dist/             Built React SPA (served by Express)
└── backend/prisma/schema.prisma  PostgreSQL schema via Prisma

Routes:
  GET/POST  /api/auth/*         Auth (OTP register, login, password reset)
  GET/POST  /api/properties/*   Property CRUD + verification pipeline
  POST      /api/payments/*     Paystack escrow + webhook
  GET/POST  /api/banks/*        Agent bank setup (Paystack recipients)
  GET       /api/status         Health check
```

---

## Key Features

### 5-Stage Verification Pipeline
| Stage | Description |
|-------|-------------|
| 1. Listing Created | Agent submits property details |
| 2. Documents Uploaded | C-of-O, survey plan, agent licence |
| 3. Agent Vetted | Agent credentials verified |
| 4. Inspection Scheduled | Physical site visit booked |
| 5. Verified | Abuja True Verified™ badge awarded |

### Escrow Payment System
- Paystack integration for secure fund holding
- Funds auto-released to agent after configurable hold period (default 48h)
- Bank account resolution and Paystack transfer recipient setup
- Full transaction history per user

### Role-Based Auth
- **Tenant**: Browse, save, book inspections, make escrow payments
- **Agent**: List properties, upload docs, track verification, receive payouts
- **Admin**: Platform oversight (in progress)
- JWT tokens (7-day expiry), OTP email verification on registration

---

## Local Development

### Prerequisites
- Node.js v18+
- PostgreSQL (local or remote)

### 1. Clone & install
```bash
git clone https://github.com/ZITOPY-TECHNOLOGIES-VENTURES/Verfind-Complete.git
cd Verfind-Complete
cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend `.env`
Create `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/verifind
JWT_SECRET=your_strong_random_secret_here
NODE_ENV=development

# Email (Brevo REST API key — not SMTP credentials)
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=hello@getverifind.com
EMAIL_FROM_NAME=Verifind

# Payments
PAYSTACK_SECRET_KEY=sk_test_...

# CORS (comma-separated, no trailing slash)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Paystack callback redirect
FRONTEND_URL=http://localhost:5173
```

### 3. Database setup
```bash
cd backend
npx prisma migrate deploy
```

### 4. Run
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
# → http://localhost:5173
```

---

## Render Deployment

The app is a monorepo deployed as a single Render Web Service. The backend builds the frontend and serves it as static files.

**Build Command:**
```
cd backend && npm install && npx prisma generate && cd ../frontend && npm install && npm run build
```

**Start Command:**
```
cd backend && node server.js
```

**Required Render Environment Variables:**
```
DATABASE_URL
JWT_SECRET
BREVO_API_KEY
EMAIL_FROM=hello@getverifind.com
EMAIL_FROM_NAME=Verifind
PAYSTACK_SECRET_KEY
ALLOWED_ORIGINS=https://verfind-production.onrender.com
FRONTEND_URL=https://verfind-production.onrender.com
NODE_ENV=production
RELEASE_HOURS=48
```

---

## Contributing (Junior Dev Workflow)

Branch protection is active on `main`. Direct pushes are restricted to project leads.

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Push your branch: `git push origin feature/your-feature-name`
4. Open a Pull Request on GitHub — do NOT push directly to `main`
5. A lead will review and merge

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Backend dev | `cd backend && npm run dev` | nodemon auto-restart |
| Backend prod | `cd backend && npm start` | production server |
| Frontend dev | `cd frontend && npm run dev` | Vite dev server |
| Frontend build | `cd frontend && npm run build` | production build |
| DB migrate | `cd backend && npm run migrate` | apply Prisma migrations |

---

## Legal

**Verifind Ltd** — Abuja, FCT, Nigeria.
© 2026 Verifind Technologies Ltd. All rights reserved.
