# Verifind V2 — QA Test Tasks (Junior Dev)

Test against: **getverifind.com** (production)
Date: 2026-05-07

Complete every checkbox. If anything fails, note the URL, user role, exact steps, and screenshot.
Report all bugs to Philemon via Slack with tag `[BUG]`.

---

## 1. Tenant Registration & OTP Flow

- [ ] Go to /register, confirm default tab is "Tenant"
- [ ] Fill in: Full Name, Email, Password (min 8 chars), Confirm Password → click Continue
- [ ] Confirm OTP email arrives at the address used
- [ ] Enter wrong OTP → confirm an error message appears (not a crash)
- [ ] Enter correct OTP → confirm redirect to /dashboard
- [ ] Try registering again with the same email → confirm error "email already in use" (or similar)
- [ ] Try submitting the form with passwords that don't match → confirm inline error, no OTP sent
- [ ] Try a password shorter than 8 characters → confirm it is blocked

---

## 2. Agent Registration & KYC Fields

- [ ] Go to /register, select "Agent" tab
- [ ] Fill in: Full Name, Business Name (optional), Email, Phone, NIN (11 digits), Driver's Licence Number, CAC RC Number, Password
- [ ] Complete OTP step → confirm redirect to /agent
- [ ] Log in to admin at /admin → open the agent's card
- [ ] Confirm NIN is masked as `****XXXXX` (only last 5 digits visible)
- [ ] Confirm Driver's Licence and CAC RC numbers are displayed correctly
- [ ] Register a second agent with NIN only (no Driver's Licence or CAC) → admin card should only show NIN
- [ ] Register a third agent with no KYC fields at all → admin card should show no KYC document fields

---

## 3. Login & Session

- [ ] Log in with correct credentials → lands on the correct dashboard for the role (tenant → /dashboard, agent → /agent, admin → /admin)
- [ ] Log in with wrong password → confirm error message, not a crash
- [ ] Log in with an unregistered email → confirm error
- [ ] Log in as tenant → click Sign Out → confirm redirect to / or /login
- [ ] After signing out, try navigating back to /dashboard directly → should redirect to login
- [ ] Open two browser tabs, sign out in one → the other should also lose access on next API call or refresh

---

## 4. Agent Dashboard — Create Listing

- [ ] Log in as agent → click "+ New Listing"
- [ ] Try submitting with no video URL → confirm error "A video walkthrough is required"
- [ ] Fill all required fields including a YouTube video URL, Latitude `9.0579`, Longitude `7.4951`
- [ ] Submit → listing appears in the agent's listings tab
- [ ] Confirm the listing shows the correct status badge (should be "Available")
- [ ] Create a second listing without lat/lng → submit successfully
- [ ] Create a third listing with a Vimeo URL
- [ ] Confirm all three listings appear in the list

---

## 5. Agent Dashboard — Edit & Delete Listing

- [ ] Click Edit on the first listing
- [ ] Confirm all previously entered fields (including lat/lng) are pre-filled correctly
- [ ] Change the title and save → confirm updated title appears in the list
- [ ] Change the base rent and confirm the percentage-based fee fields recalculate automatically
- [ ] Click Delete on a listing → confirm the confirmation prompt appears before deleting
- [ ] Confirm deleted listing no longer appears in the list

---

## 6. Google Maps Embed

- [ ] As a tenant, open the listing with lat/lng (9.0579, 7.4951) from the test above
- [ ] Scroll to the location section — confirm an embedded Google Maps iframe appears
- [ ] The map should show the Maitama area of Abuja
- [ ] Confirm "Open in Google Maps →" link opens the correct location in a new tab
- [ ] Open the listing without lat/lng → confirm no map section appears at all (not even a placeholder)

---

## 7. Video Walkthroughs

- [ ] Open the listing with the YouTube URL → confirm the video embeds inline (not just a link)
- [ ] Open the listing with the Vimeo URL → confirm the Vimeo player embeds correctly
- [ ] Open the listing with a non-YouTube/Vimeo URL → confirm a plain "▶ Watch Video Walkthrough" link appears (no broken iframe)

---

## 8. Property Details — Fee Breakdown

- [ ] Open any listing as a tenant
- [ ] Confirm the "Total Package Breakdown" section shows all fees correctly (Base Rent, Service Charge, Caution Fee, Agency Fee if present, Legal Fee if present)
- [ ] Confirm the Total at the bottom matches the sum of all fees shown
- [ ] Confirm the agent info section shows the agent's name
- [ ] If the agent is KYC verified: confirm the blue "✓ KYC Verified Agent" badge appears
- [ ] If the listing is admin-verified: confirm the green "✓ Verified Listing" badge appears

---

## 9. Tenant Profile Banner & Address Gate

- [ ] Register a new tenant (skip adding any address)
- [ ] Log in → confirm the yellow banner appears: "Add your current address to unlock payments"
- [ ] Type an address and click Save → banner disappears without a page reload
- [ ] Re-open the dashboard (refresh) → banner should NOT reappear (address is persisted)
- [ ] Open an available listing → click "Pay Escrow" → Paystack modal opens successfully
- [ ] Now register a **second** tenant, do NOT fill the address banner, and click "Pay Escrow" on a listing
  → confirm the request fails with a message about completing your profile (backend blocks it)

---

## 10. Booking Flow — Full Cycle

- [ ] As a tenant, open an available listing → click "Book Inspection"
- [ ] Select a date at least 1 day in the future → confirm booking
- [ ] Log in as the listing's agent → Booking Requests tab should show a numbered badge
- [ ] Open the booking → click Accept → confirm status changes to "Accepted"
- [ ] Book a second inspection, then as agent click Reschedule → enter a new date in YYYY-MM-DD format → confirm status changes to "Rescheduled"
- [ ] Book a third inspection, then as agent click Cancel → confirm status changes to "Cancelled"
- [ ] Log back in as tenant → confirm the booking statuses are visible on the tenant's side

---

## 11. Favourites (Saved Properties)

- [ ] Log in as tenant → confirm each property card shows a heart button (♡) in the bottom-right of the image
- [ ] Click the heart on a listing → it turns red (❤) immediately without page reload
- [ ] Click the "♡ Saved (1)" button in the search bar → Saved tab opens showing the favourited listing
- [ ] Heart button on the card in the Saved tab is also filled red
- [ ] Click the red heart to un-favourite → card reverts to ♡, listing is removed from Saved tab
- [ ] Favourite two more listings → counter shows "(2)"
- [ ] Refresh the page → confirm favourites are still filled red (persisted in DB)
- [ ] Log out and log back in → confirm favourites survive the session
- [ ] Log in as an agent → confirm there are no heart buttons on property cards in the agent dashboard

---

## 12. Admin Dashboard — KYC & Verification

- [ ] Log in as admin at /admin
- [ ] Confirm stat cards show correct counts (Total Agents, Pending KYC, Total Listings, Pending Verify)
- [ ] Open the Agents tab → find the test agent → click "Approve KYC" → badge changes to green "✓ KYC Approved"
- [ ] Confirm the Pending KYC stat count decreases by 1
- [ ] Click "Revoke KYC" on the same agent → badge returns to red "✗ KYC Pending"
- [ ] Open the Properties tab → click a property card → confirm the full detail modal opens
- [ ] Click "Verify" on an unverified property → green "Verified" badge appears on the card
- [ ] Click "Unverify" → badge reverts to red "Pending"
- [ ] Confirm that after admin approves agent KYC, the blue "✓ KYC Verified Agent" badge appears on their listings in the tenant dashboard

---

## 13. Dark Mode / Theme Toggle

- [ ] On every page (/dashboard, /agent, /admin, /login, /register), click the moon/sun button
- [ ] Confirm the entire page switches theme with no broken colours or invisible text
- [ ] Confirm the theme preference persists after a page refresh
- [ ] Confirm modals (PropertyDetail, PaymentModal, BookingCalendar) also switch theme correctly

---

## 14. Home Page & District Navigation

- [ ] Open / (home page) without being logged in
- [ ] Confirm district cards are displayed with gradient colours (not a broken grid)
- [ ] Click any district card → confirm redirect to /dashboard?district=X with the correct district pre-filtered
- [ ] Confirm the search bar on the home page works and navigates to /dashboard?search=X

---

## 15. Security Spot Tests

- [ ] Open browser DevTools (Network tab) and trigger a 500 error (e.g. submit an invalid payment) → confirm the response body does NOT contain a stack trace, internal error message, or database detail
- [ ] Try accessing `/admin` while logged in as a tenant → should be blocked (redirected or 403)
- [ ] Try accessing `/agent` while logged in as a tenant → should be blocked
- [ ] Try accessing `/dashboard` while not logged in → should redirect to login
- [ ] Open DevTools Console on any page → confirm no passwords, NINs, or JWT tokens are printed to the console
- [ ] In the Network tab, confirm all API calls go over HTTPS (no plain HTTP)
- [ ] Confirm rate limiting: submit the login form with a wrong password 21 times in quick succession → confirm a "Too many attempts" error on the 21st try

---

## 16. Mobile Responsiveness (use Chrome DevTools device mode or a real phone)

- [ ] Home page: district grid stacks cleanly on 375px width, no horizontal scroll
- [ ] /register: all form fields are full width and readable, OTP input centred
- [ ] /dashboard: search bar wraps, property cards stack to 1 column, heart button still visible
- [ ] Property detail modal: scrollable, images display correctly, fee table doesn't overflow
- [ ] /agent: listing form modal scrolls correctly, all fields accessible
- [ ] /admin: stat cards wrap to 2 columns, agent/property rows readable

---

## Reporting Issues

For any bug found:
1. Note the **URL**, **user role**, and **exact steps** to reproduce
2. Screenshot both the visible error and the browser console
3. Send to Philemon via Slack with tag `[BUG]`
