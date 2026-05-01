/**
 * Quick sanity tests for the bug fixes — no DB or network required.
 * Run: node test-fixes.js
 */

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// ─── Copy helpers exactly as they appear in server.js ─────────────────────────
const fmtProp  = (p) => ({ ...p, status: p.status === 'under_offer' ? 'under-offer' : p.status });
const fmtProps = (arr) => arr.map(fmtProp);
const toDbStatus = (s) => s === 'under-offer' ? 'under_offer' : s;

// ─── 1. fmtProp ───────────────────────────────────────────────────────────────
console.log('\n[1] fmtProp — normalise under_offer → under-offer');
assert('under_offer → under-offer', fmtProp({ status: 'under_offer' }).status === 'under-offer');
assert('available unchanged',       fmtProp({ status: 'available' }).status === 'available');
assert('rented unchanged',          fmtProp({ status: 'rented' }).status === 'rented');
assert('other fields preserved',    fmtProp({ status: 'available', title: 'Test' }).title === 'Test');

// ─── 2. fmtProps ──────────────────────────────────────────────────────────────
console.log('\n[2] fmtProps — array normalisation');
const arr = [
  { id: '1', status: 'under_offer' },
  { id: '2', status: 'available' },
  { id: '3', status: 'rented' },
];
const result = fmtProps(arr);
assert('first item → under-offer', result[0].status === 'under-offer');
assert('second item → available',  result[1].status === 'available');
assert('third item → rented',      result[2].status === 'rented');
assert('array length preserved',   result.length === 3);

// ─── 3. toDbStatus ────────────────────────────────────────────────────────────
console.log('\n[3] toDbStatus — frontend value → DB enum value');
assert('under-offer → under_offer', toDbStatus('under-offer') === 'under_offer');
assert('available unchanged',       toDbStatus('available') === 'available');
assert('rented unchanged',          toDbStatus('rented') === 'rented');

// ─── 4. Login isEmailVerified guard (logic only) ──────────────────────────────
console.log('\n[4] Login guard — isEmailVerified check');

function simulateLogin(user, password, hashedPasswordMatch) {
  if (!user || !hashedPasswordMatch) return { status: 401, body: { message: 'Invalid email or password' } };
  if (!user.isEmailVerified) return { status: 403, body: { message: 'Please verify your email before logging in.' } };
  return { status: 200, body: { token: 'jwt', user } };
}

const unverifiedUser = { id: '1', email: 'test@test.com', isEmailVerified: false };
const verifiedUser   = { id: '2', email: 'ok@ok.com',   isEmailVerified: true };

assert('unverified user → 403',              simulateLogin(unverifiedUser, 'pw', true).status === 403);
assert('unverified user gets correct msg',   simulateLogin(unverifiedUser, 'pw', true).body.message.includes('verify'));
assert('verified user → 200',               simulateLogin(verifiedUser, 'pw', true).status === 200);
assert('wrong password → 401',              simulateLogin(verifiedUser, 'bad', false).status === 401);
assert('user not found → 401',              simulateLogin(null, 'pw', false).status === 401);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('Some tests failed — do not push!');
  process.exit(1);
} else {
  console.log('All tests passed ✅ — safe to push.');
  process.exit(0);
}
