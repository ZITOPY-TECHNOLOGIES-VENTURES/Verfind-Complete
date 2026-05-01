# Verifind — Product Requirements Document

**Version:** 2.0  
**Market:** Abuja, Nigeria  
**Owner:** Zitopy Tech (rraammsseeyy)  
**Status:** V2 in active development

---

## 1. Overview

Verifind is a real estate marketplace for Abuja that solves three problems tenants face:
- **Fraud** — agents collect rent then disappear
- **Wasted trips** — inspecting properties that don't match listings
- **Unsafe payments** — no protection after handing over cash

Every listing requires a **video walkthrough** before it can publish. Payments go into **escrow** and are only released to the agent after the tenant physically confirms they've moved in.

---

## 2. User Roles

| Role | Description |
|---|---|
| **Tenant** | Browses listings, books inspections, pays via escrow, confirms move-in |
| **Agent** | Creates and manages listings (video required), receives bookings, gets paid via escrow |
| **Admin** | Verifies agent KYC, approves property listings, platform oversight |

---

## 3. Property Types

These are the only valid types in V2 (matches how properties are actually described in Abuja):

| Enum value | Display label |
|---|---|
| `Self_contain` | Self-contain |
| `One_bedroom` | 1 Bedroom |
| `Two_bedroom` | 2 Bedroom |
| `Three_bedroom` | 3 Bedroom |
| `Detached_duplex` | Detached Duplex |

---

## 4. Listing Modes

| Mode | Status |
|---|---|
| `Rent` | **Active** — primary mode |
| `Shortlet` | Future (infrastructure built, hidden behind feature flag) |
| `Sale` | Future (infrastructure built, hidden behind feature flag) |

---

## 5. Core Features

### 5.1 Property Listings

- **Video walkthrough is MANDATORY** — a listing cannot be published without a video URL
- Required fields: title, district, property type, base rent, video URL
- Financial fields: base rent, service charge, caution fee, agency fee, legal fee → all shown as a "Total Package" breakdown to the tenant
- Media: images (URL array) + video (YouTube/Vimeo/direct URL — auto-embeds)
- Location: Abuja district (dropdown) + optional address + optional lat/lng for Google Maps pin
- Specs: bedrooms, bathrooms, sqm, furnished, parking
- Status lifecycle: `available` → `under_offer` (after escrow payment) → `rented` (after move-in confirmed)
- Featured flag (`isFeatured`) — for future Premium tier, already in DB

### 5.2 Agent KYC

Agents must be KYC-verified before their listings appear as "verified."  
Fields collected:
- Full name + business name (optional)
- Phone number
- NIN (National Identity Number — 11 digits)
- Driver's Licence URL *or* NIN document URL (uploaded image)
- CAC document URL (Corporate Affairs Commission registration, optional)

Admin approves or rejects KYC in the Admin Dashboard → sets `isKycVerified = true/false`.

> **Current implementation:** Documents are stored as URLs (agent self-uploads the file to a hosting service and pastes the URL). A Cloudinary/S3 integration for direct uploads is a future improvement.

### 5.3 Tenant KYC

Required before a tenant can complete an escrow payment:
- Valid ID (NIN, PVC, or International Passport) — stored as `ninUrl`
- Current address — stored as `currentAddress`

> **Current implementation:** These fields are on the User model. Enforcement (blocking payment if KYC incomplete) is a Phase C enhancement — currently not enforced at the API level.

### 5.4 Inspection Booking

- Tenant picks a date from a calendar (no Sundays, no past dates)
- Request goes to the agent as a "pending" booking
- Agent can **Accept**, **Reschedule** (with a proposed new date), or **Cancel**
- Tenant sees the booking status update in their dashboard

### 5.5 Escrow Payment Flow

```
Tenant initiates payment
        ↓
Paystack payment page (redirect)
        ↓
Payment confirmed (Paystack webhook fires)
        ↓
Property status → under_offer
        ↓
Tenant moves in physically
        ↓
Tenant taps "I've moved in — Release funds"
        ↓
Paystack transfer to agent's bank account
        ↓
Property status → rented
```

- Funds are held in Paystack balance, not released until tenant confirms move-in
- Agent must have a bank account set up (Paystack recipient) to receive the transfer
- If agent has no bank account, the move-in confirmation is blocked with a clear error

### 5.6 Admin Functions

- View all agents → approve or revoke KYC
- View all properties → verify or unverify listings
- Stats: total agents, pending KYC, total listings, pending verification

---

## 6. Authentication

- Email + OTP (6-digit code, 15-minute expiry, max 5 attempts)
- Registration is 2-step: fill form → receive OTP → verify → account created
- Login is blocked for unverified emails (403 with clear message)
- Forgot password: 3-step (email → OTP → new password)
- JWT tokens, 30-day expiry
- Future: Google OAuth social login for tenants

---

## 7. Abuja Districts

```
Wuse, Maitama, Gwarimpa, Lugbe, Kubwa, Asokoro, Jabi, Apo,
Dawaki, Galadimawa, Lokogoma, Guzape, Katampe, Life Camp,
Mpape, Central Area
```

Home page shows a district grid — clicking any district filters the browse view.

---

## 8. Revenue Model

**Current:** Free for all agents (no charge to list).

**Future infrastructure (already in DB):**
- `isFeatured` flag on Property — Featured listings appear at the top of browse results
- Agent subscription tier — infrastructure only, not yet charged

**Planned tiers (not yet implemented):**
- Free: up to N listings, no featured slots
- Premium: unlimited listings + featured slots in search results
- Agent Subscription: monthly fee for continued access to the platform

---

## 9. Technical Stack

| Layer | Technology |
|---|---|
| Backend | Node.js (Express), Prisma ORM |
| Database | PostgreSQL (Render managed) |
| Email | Brevo (transactional email REST API) |
| Payments | Paystack (escrow + bank transfers) |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Hosting | Render (monorepo — backend serves frontend static files) |
| Domain proxy | Cloudflare Worker (`getverifind.com` → Render) |
| Design system | Glass-morphism, iOS 26 Liquid Glass tokens, dark/light mode |

---

## 10. Known Gaps / Future Work

| Item | Priority | Notes |
|---|---|---|
| Google Maps embed | Medium | lat/lng stored in DB, not yet rendered in UI |
| Tenant KYC enforcement | Medium | Fields in DB, not yet blocking payment |
| Cloudinary/S3 for KYC docs | Medium | Currently URL-paste only |
| Social login (Google OAuth) | Low | Planned for tenant registration |
| Mobile responsiveness audit | Medium | Desktop-first, needs mobile pass |
| Shortlet / Sale listing mode | Low | Feature-flagged |
| Featured listing admin UI | Low | `isFeatured` field exists, no toggle in admin yet |
| Agent subscription billing | Low | Infrastructure only |
| Favourites / saved properties | Low | No backend endpoints |
| In-app notifications | Low | No websocket/push setup |

---

## 11. Git & Deployment

- `main` branch = V1 (archived, tag: `v1`)  
- `v2` branch = active development  
- Render deploy branch: `v2`  
- Junior dev (zimaofficial-web) must open PRs against `v2` — cannot push directly  
- Lead (rraammsseeyy) reviews and merges  
- CodeRabbit auto-reviews all PRs (`.coderabbit.yaml` configured)
