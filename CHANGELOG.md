# Changelog

All notable changes to Verifind are recorded here.
Format: `[Date] — Change description (Author)`

Lead: rraammsseeyy (Zitopy Tech)
Junior Dev: zimaofficial-web

---

## 2026-04-28 — V2 REBUILD

### Architecture
- **V1 archived as `v1` git tag** — preserved forever.
- **V2 branch created** — all development now happens on `v2`. main = V1.
- Change Render deploy branch to `v2` after this push.

### Backend (backend/server.js — complete rewrite)
- **No legacy cruft** — clean Express server, ~500 lines
- Auth: send-otp, verify-email, login (verified users only), me, update-me, forgot-password, verify-otp, reset-password (all 8 routes fully implemented)
- Properties: CRUD + mandatory video validation (400 if no videoUrl)
- Bookings: tenant requests, agent accept/reschedule/cancel
- Payments: Paystack escrow + tenant move-in confirmation before fund release
- Banks: list, verify-account, setup (Paystack recipient), my
- Admin: agents KYC approve/revoke, property verify/unverify

### Prisma schema (backend/prisma/schema.prisma — updated)
- **PropertyType enum** updated to match original brief:
  `Self_contain | One_bedroom | Two_bedroom | Three_bedroom | Detached_duplex`
- **User model**: added `businessName`, `isPhoneVerified`, `driverLicenseUrl`, `cacDocUrl`, `currentAddress`, `ninUrl`
- **PendingReg model**: added `phone`, `nin`
- **Property model**: `videoUrl` now required (NOT NULL); added `listingMode`, `isFeatured`
- **Payment model**: added `tenantConfirmedMoveIn`, `moveInConfirmedAt` (escrow release trigger)
- **Booking model**: new — `propertyId`, `tenantId`, `agentId`, `requestedDate`, `status`, `agentNote`

> ⚠️ DB MIGRATION: Schema changes require `prisma migrate reset` against a fresh DB.
> On Render: reset the PostgreSQL database, then redeploy — `prisma migrate deploy` runs automatically.

### Frontend (complete rewrite — no mock engine)
- `frontend/services/api.ts` — thin fetch wrapper, no offline fallback
- `frontend/contexts/AuthContext.tsx` — clean, JWT-based
- `frontend/contexts/ThemeContext.tsx` — clean dark/light toggle
- `frontend/App.tsx` — route guards (PrivateRoute, PublicRoute)
- **Pages**: Home, Login, Register (role-split), ForgotPassword (3-step), Dashboard, AgentDashboard, AdminDashboard
- **Components**: PropertyCard, PropertyDetail (video embed + Total Package), PaymentModal, BookingCalendar, AgentBankSetup
- Removed: IndexedDB mock engine (idb), Gemini AI service, react-markdown
- `frontend/package.json` — removed `@google/genai`, `idb`, `react-markdown`

### Key correctness fixes vs V1
- Property types now match the original brief (Self-contain, 1-Bed, 2-Bed, 3-Bed, Detached Duplex)
- Video walkthrough is now **mandatory** — agents can't list without it
- Escrow releases on **tenant move-in confirmation**, not 48h timer
- Forgot password is fully implemented (was a stub in V1)
- Admin dashboard fully implemented (was an empty div in V1)

(rraammsseeyy / Claude)

---

## 2026-05-01

### Fixed
- **CRITICAL — `under-offer` Prisma enum mismatch** (`backend/server.js`)
  DB stores `under_obj` but server was writing `'under-offer'` (hyphen) to Prisma, causing
  silent validation errors on the payment webhook and payment verify routes — property status
  never updated after payment. Fixed: added `fmtProp`/`fmtProps`/`toDbStatus` helpers.
  All property reads normalise `under_obj` → `under-offer` for the frontend. All writes use
  `under_obj`. (rraammsseeyy / Claude)

- **SECURITY — Login allowed unverified users** (`backend/server.js`)
  Login route never checked `isEmailVerified`, so a user who bypassed OTP (e.g. via mock
  engine) could log in with a real DB account. Added `isEmailVerified` check — returns 403
  with clear message if not verified. (rraammsseeyy / Claude)

### Added
- **CodeRabbit config** (`.coderabbit.yaml`) — AI code review on all PRs from junior dev.
  Focused on logic/security issues, not style. Auto-reviews on PR open. (rraammsseeyy / Claude)

- **Cloudflare Worker** (`cloudflare-worker.js`) — proxies `getverifind.com` →
  `verfind-production.onrender.com`. Includes full deploy instructions in file header.
  (rraammsseeyy / Claude)

---

## 2026-04-28

### Fixed
- **CRITICAL — BACKEND_URL double-prefix bug** (`frontend/services/api.ts`)
  Production was building URLs like `/api/api/auth/send-otp` instead of `/api/auth/send-otp`.
  Every API call in production silently 404'd — this is why OTP emails never fired and no Render
  logs appeared. Fixed: production BACKEND_URL is now `''` (empty string), localhost stays
  `http://localhost:5000`. (rraammsseeyy / Claude)

- **OTP error silently swallowed** (`frontend/contexts/AuthContext.tsx`)
  `sendOtp()` always returned `sent: true` regardless of backend response. Now correctly
  surfaces delivery failures to the user. (rraammsseeyy / Claude)

- **Backend errors fell back to mock engine** (`frontend/services/api.ts`)
  `bridgeRequest` was falling back to the offline mock engine when the real backend returned
  any error (4xx/5xx). Now only falls back on network failure (backend unreachable). Backend
  errors are surfaced correctly. (rraammsseeyy / Claude)

- **`id` vs `_id` mismatch** (`frontend/services/api.ts`)
  Prisma returns `id` (UUID string) but all frontend code expected `_id` (MongoDB convention).
  Added `normalizeId()` in `bridgeRequest` to map `id → _id` on all backend responses.
  Fixes: property card ownership checks, agent listing filter, favorites, user profile matching.
  (rraammsseeyy / Claude)

- **AgentDashboard wrong API endpoints** (`frontend/components/AgentDashboard.tsx`)
  Was calling `/properties` and `/properties/:id/verify` — missing `/api/` prefix.
  Fixed to `/api/properties` and `/api/properties/:id/verify`. (rraammsseeyy / Claude)

### Infrastructure
- **Branch protection enabled on `main`**
  Only `rraammsseeyy` can push directly to main. `zimaofficial-web` must open a PR for review
  before any changes merge. (rraammsseeyy)

- **README rewritten** — removed stale references to MongoDB, Supabase, Resend, Vercel.
  Now accurately reflects: PostgreSQL/Prisma, Brevo, Render monorepo deployment. (rraammsseeyy / Claude)

---

## Pre-2026-04-28 (Junior Dev — zimaofficial-web)

### Implemented
- Express backend with Prisma + PostgreSQL schema
- JWT auth with OTP-based email verification (2-step registration)
- Property CRUD with district/type/status/price filtering
- Paystack escrow: initialize, webhook handler, auto-release scheduler
- Agent bank setup with Paystack recipient creation
- Brevo transactional email (OTP + payment confirmation templates)
- React frontend: Home, Dashboard, AuthFlow, Register, Login pages
- Role-based access: tenant / agent / admin
- Glass-morphism dark UI with Tailwind + Framer Motion
- Offline mock engine fallback (IndexedDB + in-memory store)
- Helmet security headers, CORS restriction, rate limiting

### Known remaining gaps (as of 2026-04-28)
- Forgot password flow is a placeholder stub (backend endpoints exist, frontend not wired)
- Admin dashboard is an empty div
- Inspections tab is an empty placeholder
- Find Agent tab shows "coming shortly"
- KYC flow: NIN collected in Register but never sent to backend
- Property images stored as base64 in DB (no Cloudinary/S3)
- Password reset OTP stored in-memory only (lost on server restart)
- Favorites endpoints not implemented on backend
