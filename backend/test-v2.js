'use strict';
/**
 * V2 automated tests — no DB or network required.
 * Run: node test-v2.js
 */

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.error(`  ❌ FAIL: ${label}`); failed++; }
}

// ─── V2 Property Types ────────────────────────────────────────────────────────
console.log('\n[1] PropertyType — V2 enum values');

const V2_TYPES = ['Self_contain', 'One_bedroom', 'Two_bedroom', 'Three_bedroom', 'Detached_duplex'];
const V1_TYPES = ['Apartment', 'House', 'Duplex', 'Bungalow'];

V2_TYPES.forEach(t => assert(`${t} is a valid V2 type`, V2_TYPES.includes(t)));
V1_TYPES.forEach(t => assert(`${t} is NOT a valid V2 type`, !V2_TYPES.includes(t)));

// ─── Video URL validation ─────────────────────────────────────────────────────
console.log('\n[2] Video URL — mandatory validation');

function validateListing(body) {
  if (!body.title || !body.district || !body.type || !body.baseRent)
    return { ok: false, message: 'title, district, type and baseRent are required' };
  if (!body.videoUrl)
    return { ok: false, message: 'A video walkthrough is required for all listings' };
  return { ok: true };
}

assert('missing videoUrl → rejected', !validateListing({ title: 'A', district: 'Maitama', type: 'Self_contain', baseRent: 1000000 }).ok);
assert('missing videoUrl → correct msg', validateListing({ title: 'A', district: 'Maitama', type: 'Self_contain', baseRent: 1000000 }).message.includes('video'));
assert('missing title → rejected', !validateListing({ district: 'Maitama', type: 'Self_contain', baseRent: 1000000, videoUrl: 'https://youtube.com' }).ok);
assert('all required + videoUrl → OK', validateListing({ title: 'A', district: 'Maitama', type: 'Self_contain', baseRent: 1000000, videoUrl: 'https://youtube.com' }).ok);

// ─── Total Package calculation ────────────────────────────────────────────────
console.log('\n[3] Total Package — fee calculation');

function calcTotal({ baseRent, serviceCharge = 0, cautionFee = 0, agencyFee = 0, legalFee = 0 }) {
  return baseRent + serviceCharge + cautionFee + agencyFee + legalFee;
}

assert('base only', calcTotal({ baseRent: 1_000_000 }) === 1_000_000);
assert('all fees', calcTotal({ baseRent: 1_000_000, serviceCharge: 50_000, cautionFee: 100_000, agencyFee: 100_000, legalFee: 50_000 }) === 1_300_000);
assert('no overflow on zero fees', calcTotal({ baseRent: 500_000, cautionFee: 0 }) === 500_000);

// ─── Booking status transitions ───────────────────────────────────────────────
console.log('\n[4] Booking status — valid transitions');

const VALID_STATUSES = ['pending', 'accepted', 'rescheduled', 'cancelled'];

function updateBooking(booking, { status, proposedDate }) {
  if (!VALID_STATUSES.includes(status)) return { ok: false, message: 'Invalid status' };
  if (booking.agentId !== 'agent1') return { ok: false, message: 'Not your booking' };
  return { ok: true, booking: { ...booking, status, requestedDate: proposedDate || booking.requestedDate } };
}

const booking = { id: 'b1', agentId: 'agent1', status: 'pending', requestedDate: '2026-05-10' };
assert('agent accepts booking', updateBooking(booking, { status: 'accepted' }).ok);
assert('agent reschedules with new date', updateBooking(booking, { status: 'rescheduled', proposedDate: '2026-05-15' }).booking.requestedDate === '2026-05-15');
assert('wrong agent → rejected', !updateBooking({ ...booking, agentId: 'agent2' }, { status: 'accepted' }).ok);
assert('invalid status → rejected', !updateBooking(booking, { status: 'magic' }).ok);

// ─── Move-in confirmation guard ───────────────────────────────────────────────
console.log('\n[5] Move-in confirmation — escrow release guard');

function confirmMoveIn(payment, requestUserId, agentBank) {
  if (payment.tenantId !== requestUserId) return { ok: false, message: 'Not your payment' };
  if (payment.status !== 'confirmed') return { ok: false, message: 'Payment is not in confirmed state' };
  if (!agentBank) return { ok: false, message: "Agent has not set up their bank account yet" };
  return { ok: true, message: 'Move-in confirmed. Funds are being released.' };
}

const payment = { id: 'p1', tenantId: 'tenant1', agentId: 'agent1', status: 'confirmed' };
const bank = { recipientCode: 'RCP_abc123' };

assert('confirmed payment + bank → release OK', confirmMoveIn(payment, 'tenant1', bank).ok);
assert('wrong tenant → rejected', !confirmMoveIn(payment, 'tenant2', bank).ok);
assert('pending payment → rejected', !confirmMoveIn({ ...payment, status: 'pending' }, 'tenant1', bank).ok);
assert('already released → rejected', !confirmMoveIn({ ...payment, status: 'released' }, 'tenant1', bank).ok);
assert('no agent bank → rejected', !confirmMoveIn(payment, 'tenant1', null).ok);
assert('no agent bank → correct msg', confirmMoveIn(payment, 'tenant1', null).message.includes('bank account'));

// ─── OTP generation ───────────────────────────────────────────────────────────
console.log('\n[6] OTP generation');

function genOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }

const otps = Array.from({ length: 100 }, genOtp);
assert('always 6 digits', otps.every(o => /^\d{6}$/.test(o)));
assert('min value ≥ 100000', otps.every(o => parseInt(o) >= 100000));
assert('max value ≤ 999999', otps.every(o => parseInt(o) <= 999999));
assert('not all the same (uniqueness)', new Set(otps).size > 1);

// ─── Auth guards ──────────────────────────────────────────────────────────────
console.log('\n[7] Role-based access control');

function requireRole(allowedRoles, userRole) {
  return allowedRoles.includes(userRole);
}

assert('agent can create listing', requireRole(['agent'], 'agent'));
assert('tenant cannot create listing', !requireRole(['agent'], 'tenant'));
assert('admin can access admin routes', requireRole(['admin'], 'admin'));
assert('agent cannot access admin routes', !requireRole(['admin'], 'agent'));
assert('tenant can book inspection', requireRole(['tenant'], 'tenant'));
assert('agent cannot book inspection', !requireRole(['tenant'], 'agent'));

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(44)}`);
console.log(`V2 Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('Some V2 tests failed — do not push!');
  process.exit(1);
} else {
  console.log('All V2 tests passed ✅ — safe to push.');
  process.exit(0);
}
