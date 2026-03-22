const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
require('dotenv').config();

// ─── OTP STORE (In-memory for demo) ───────────────────────────────────────────
const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (to, name, otp) => {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM       = process.env.EMAIL_FROM || 'noreply@verifind.ng';

  if (!RESEND_KEY) {
    console.log(`\n📧 [DEV] OTP for ${to}: ${otp}\n`);
    return true;
  }

  try {
    const body = {
      from:    FROM,
      to:      [to],
      subject: `${otp} is your Verifind verification code`,
      html: `
        <div style="font-family:'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#F5F2ED;border-radius:20px">
          <div style="text-align:center;margin-bottom:28px">
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:12px 0 4px">Verify your email</h1>
            <p style="color:#6B7280;font-size:14px;margin:0">Hi ${name}, here's your Verifind verification code</p>
          </div>
          <div style="background:#fff;border-radius:16px;padding:28px;text-align:center;margin-bottom:20px">
            <div style="font-size:42px;font-weight:800;letter-spacing:0.2em;color:#1B4FD8;font-family:monospace">${otp}</div>
            <p style="font-size:12px;color:#9CA3AF;margin:12px 0 0">Expires in <strong>10 minutes</strong></p>
          </div>
        </div>
      `,
    };

    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('❌ Resend Error:', errData);
    }
    return true;
  } catch (err) {
    console.error('❌ Email Error:', err.message);
    return true; 
  }
};

const sendPaymentEmail = async (to, subject, message) => {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM       = process.env.EMAIL_FROM || 'noreply@verifind.ng';
  if (!RESEND_KEY) {
    console.log(`\n📧 [DEV EMAIL] To: ${to} | Subject: ${subject}\n   ${message}\n`);
    return;
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from: FROM, to: [to], subject,
        html: `<div style="font-family:sans-serif;padding:24px;background:#f9f9f9;border-radius:12px;color:#333">
                <h2 style="color:#1B4FD8">${subject}</h2>
                <p style="font-size:16px;line-height:1.5">${message}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
                <p style="font-size:12px;color:#999">Verifind Escrow — Secure Real Estate Payments</p>
               </div>`
      }),
    });
  } catch (err) { console.error('❌ Email Error:', err.message); }
};

// ─── PAYSTACK CONFIG ──────────────────────────────────────────────────────────
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE   = 'https://api.paystack.co';
const RELEASE_HOURS   = Number(process.env.RELEASE_HOURS || 48);

const paystackRequest = async (method, path, body = null) => {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Paystack request failed');
  return data.data;
};

const processScheduledReleases = async () => {
  try {
    // Note: models must be defined before calling this
    const Payment = mongoose.model('Payment');
    const AgentBank = mongoose.model('AgentBank');
    const Property = mongoose.model('Property');

    const due = await Payment.find({ status: 'confirmed', releaseDate: { $lte: new Date() } }).limit(10);
    for (const payment of due) {
      try {
        let recipientCode = payment.recipientCode;
        if (!recipientCode) {
          const bank = await AgentBank.findOne({ agentId: payment.agentId });
          if (!bank) continue;
          recipientCode = bank.recipientCode;
        }
        payment.status = 'releasing';
        await payment.save();
        const transfer = await paystackRequest('POST', '/transfer', {
          source: 'balance', amount: payment.amountKobo, recipient: recipientCode,
          reason: `Verifind release — ${payment.propertyTitle}`, reference: `VF-TRF-${payment.reference}`
        });
        payment.status = 'released';
        payment.transferReference = transfer.transfer_code;
        await payment.save();
        await Property.findByIdAndUpdate(payment.propertyId, { status: 'rented' });
        console.log(`✅ Released ₦${payment.amount} for ${payment.propertyTitle}`);
      } catch (e) { console.error(`❌ Release error [${payment._id}]:`, e.message); payment.status = 'confirmed'; await payment.save(); }
    }
  } catch (e) { console.error('Scheduled release task error:', e.message); }
};

// ─── STARTUP GUARD ────────────────────────────────────────────────────────────
// FIX 1: Crash hard if JWT_SECRET is missing.
// The old code silently fell back to a hardcoded string anyone could use to
// forge tokens for any user. Now we refuse to start instead.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}

const app        = express();
const PORT       = process.env.PORT       || 5000;
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/verifind';
const JWT_SECRET = process.env.JWT_SECRET;

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
).split(',').map(o => o.trim());

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────

// FIX 2: Helmet sets 11 protective response headers (X-Frame-Options,
// X-Content-Type-Options, HSTS, Referrer-Policy, etc.) in one call.
app.use(helmet());

// FIX 3: Restrict CORS to known origins.
// The old config had origin:'*' + credentials:true — browsers reject that
// combination, and wildcarding defeats the purpose of CORS entirely.
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// FIX 4b: Paystack Webhook — MUST come before express.json() for signature verification
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET) return res.sendStatus(200);

    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.body).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.status(400).json({ message: 'Invalid signature' });

    const event = JSON.parse(req.body);
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      const payment = await Payment.findOne({ reference });
      if (payment && payment.status === 'pending') {
        payment.status = 'confirmed';
        payment.paystackData = event.data;
        await payment.save();
        if (metadata?.propertyId) await Property.findByIdAndUpdate(metadata.propertyId, { status: 'under-offer' });
        
        // Notify tenant via email (User requested outside-app notification)
        await sendPaymentEmail(payment.tenantEmail, 'Payment Confirmed', 
          `Your payment for <b>${payment.propertyTitle}</b> has been confirmed. The agent will contact you shortly.`);
      }
    }

    if (event.event === 'transfer.success') {
      const payment = await Payment.findOne({ transferReference: event.data.transfer_code });
      if (payment) {
        payment.status = 'released';
        await payment.save();
        await Property.findByIdAndUpdate(payment.propertyId, { status: 'rented' });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(200);
  }
});

app.use(express.json({ limit: '2mb' }));

// FIX 5: Rate-limit auth endpoints to block brute-force and credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: { message: 'Too many attempts — please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts — please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── VALID VALUES ─────────────────────────────────────────────────────────────

const VALID_DISTRICTS = [
  'Central Area','Maitama','Asokoro','Wuse','Gwarimpa','Jabi','Guzape',
  'Katampe','Life Camp','Apo','Lokogoma','Galadimawa','Dawaki',
  'Lugbe','Kubwa','Bwari','Mpape',
];
const VALID_TYPES     = ['Apartment','House','Duplex','Bungalow'];
const VALID_STATUSES  = ['available','under-offer','rented'];
const VERIFICATION_STAGES = [
  'listing_created','docs_uploaded','agent_vetted','inspection_scheduled','verified',
];

// FIX 6: Whitelist of fields agents are allowed to set on a property.
// This prevents mass-assignment attacks such as isVerified:true or
// verificationStage:'verified' being injected via the request body.
const PROPERTY_ALLOWED_FIELDS = [
  'title','description','district','address','type',
  'baseRent','serviceCharge','cautionFee','images','videoUrl',
];

const DISTRICT_COORDS = {
  'Central Area': { lat: 9.053, lng: 7.489 },
  'Maitama':      { lat: 9.088, lng: 7.498 },
  'Wuse':         { lat: 9.066, lng: 7.456 },
  'Asokoro':      { lat: 9.035, lng: 7.518 },
  'Gwarimpa':     { lat: 9.102, lng: 7.391 },
  'Jabi':         { lat: 9.068, lng: 7.425 },
  'Guzape':       { lat: 9.015, lng: 7.502 },
  'Lugbe':        { lat: 8.972, lng: 7.368 },
  'Kubwa':        { lat: 9.133, lng: 7.346 },
  'Bwari':        { lat: 9.238, lng: 7.382 },
  'Apo':          { lat: 9.004, lng: 7.527 },
  'Katampe':      { lat: 9.099, lng: 7.463 },
  'Dawaki':       { lat: 9.116, lng: 7.349 },
  'Galadimawa':   { lat: 9.019, lng: 7.447 },
  'Lokogoma':     { lat: 8.992, lng: 7.415 },
  'Life Camp':    { lat: 9.083, lng: 7.423 },
  'Mpape':        { lat: 9.156, lng: 7.418 },
};

// ─── DATABASE ────────────────────────────────────────────────────────────────

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── MODELS ──────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  username:       { type: String, required: true, trim: true, maxlength: 60 },
  email:          { type: String, required: true, unique: true, lowercase: true, maxlength: 254 },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['tenant','agent','admin'], default: 'tenant' },
  isEmailVerified: { type: Boolean, default: false },
  isKycVerified:  { type: Boolean, default: false },
  phone:          { type: String, maxlength: 20 },
  agencyName:     { type: String, maxlength: 100 },
  nin:            { type: String, maxlength: 20 },
  whatsappNumber: { type: String, maxlength: 20 },
}, { timestamps: true });

const PendingRegSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },  // bcrypt hash stored here
  role:      { type: String, enum: ['tenant', 'agent'], default: 'tenant' },
  otp:       { type: String, required: true },
  otpExpiry: { type: Date,   required: true },
  attempts:  { type: Number, default: 0 },      // max 5 wrong tries
}, { timestamps: true });

// Auto-delete the whole document after 10 minutes regardless of status
PendingRegSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const PendingReg = mongoose.model('PendingReg', PendingRegSchema);

const PropertySchema = new mongoose.Schema({
  title:               { type: String, required: true, maxlength: 200 },
  description:         { type: String, maxlength: 2000 },
  district:            { type: String, required: true, enum: VALID_DISTRICTS },
  address:             { type: String, maxlength: 300 },
  type:                { type: String, enum: VALID_TYPES, default: 'Apartment' },
  lat:                 Number,
  lng:                 Number,
  baseRent:            { type: Number, required: true, min: 0 },
  serviceCharge:       { type: Number, default: 0, min: 0 },
  cautionFee:          { type: Number, default: 0, min: 0 },
  agencyFee:           { type: Number, min: 0 },
  legalFee:            { type: Number, min: 0 },
  totalInitialPayment: { type: Number, min: 0 },
  images:              [String],
  videoUrl:            { type: String, maxlength: 500 },
  agentId:             { type: String, required: true },
  agentName:           String,
  isVerified:          { type: Boolean, default: false },
  verificationStage:   { type: String, enum: VERIFICATION_STAGES, default: 'listing_created' },
  status:              { type: String, enum: VALID_STATUSES, default: 'available' },
}, { timestamps: true });

const TransactionSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  propertyId:  String,
  type:        { type: String, enum: ['deposit','withdrawal','escrow_hold','escrow_release'], required: true },
  amount:      { type: Number, required: true, min: 0 },
  status:      { type: String, enum: ['pending','completed','failed'], default: 'completed' },
  description: { type: String, maxlength: 500 },
  reference:   String,
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  reference:      { type: String, required: true, unique: true },
  propertyId:     { type: String, required: true },
  tenantId:       { type: String, required: true },
  agentId:        { type: String, required: true },
  amount:         { type: Number, required: true },
  amountKobo:     { type: Number, required: true },
  description:    String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'releasing', 'released', 'failed', 'refunded'],
    default: 'pending',
  },
  inspectionDate: Date,
  releaseDate:    Date,
  paystackData:     Object,
  transferReference: String,
  recipientCode:    String,
  propertyTitle: String,
  agentName:     String,
  tenantEmail:   String,
}, { timestamps: true });

const AgentBankSchema = new mongoose.Schema({
  agentId:       { type: String, required: true, unique: true },
  bankCode:      { type: String, required: true },
  bankName:      { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName:   { type: String, required: true },
  recipientCode: { type: String, required: true },
}, { timestamps: true });

const User        = mongoose.model('User', UserSchema);
const Property    = mongoose.model('Property', PropertySchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Payment     = mongoose.model('Payment',   PaymentSchema);
const AgentBank   = mongoose.model('AgentBank', AgentBankSchema);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const safeFmt = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  const { password, __v, ...safe } = obj;
  safe._id = safe._id?.toString();
  return safe;
};

// FIX 7: Sanitize all 500 errors before they reach the client.
// Sending err.message exposes MongoDB field names, schema structure, and stack
// frames. We log the real error server-side but send only a generic message.
const serverError = (res, err) => {
  console.error('[server error]', err);
  res.status(500).json({ message: 'An internal error occurred' });
};

const pickAllowed = (body, allowedFields) => {
  const result = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) result[field] = body[field];
  }
  return result;
};

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// FIX 8: Re-fetch role from DB on every protected request.
// JWT payloads are signed at login — a role change after that won't be reflected
// in old tokens if you only read from req.user.role. The DB is the truth.
const agentOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('role username');
    if (!user || !['agent','admin'].includes(user.role))
      return res.status(403).json({ message: 'Agents and admins only' });
    req.dbUser = user;
    next();
  } catch (err) { serverError(res, err); }
};

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/auth/send-otp', authLimiter, async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (username.trim().length > 60)
      return res.status(400).json({ message: 'Name too long (max 60 characters)' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!['tenant', 'agent'].includes(role)) role = 'tenant';

    const emailClean = email.toLowerCase().trim();

    if (await User.findOne({ email: emailClean }))
      return res.status(400).json({ message: 'An account with this email already exists' });

    const existing = await PendingReg.findOne({ email: emailClean });
    if (existing) {
      const age = Date.now() - new Date(existing.createdAt).getTime();
      if (age < 60_000)
        return res.status(429).json({ message: 'Please wait 60 seconds before requesting a new code' });
      await existing.deleteOne();
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashed    = await bcrypt.hash(password, 12);

    await PendingReg.create({
      username: username.trim(),
      email:    emailClean,
      password: hashed,
      role,
      otp,
      otpExpiry,
    });

    await sendOtpEmail(emailClean, username.trim(), otp);
    res.json({ 
      sent: true, 
      message: `Verification code sent to ${emailClean}`,
      devOtp: !process.env.RESEND_API_KEY ? otp : undefined
    });
  } catch (err) { serverError(res, err); }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    // Constant-time compare: always run bcrypt even if user not found,
    // so response time doesn't reveal whether an email exists (user enumeration).
    const sentinel = '$2a$12$invalidhashusedtoblindtimingXXXXXXXXXXXXXXXXXXXXXXX';
    const match = user
      ? await bcrypt.compare(String(password), user.password)
      : (await bcrypt.compare(String(password), sentinel), false);

    if (!user || !match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: safeFmt(user) });
  } catch (err) { serverError(res, err); }
});

// ─── NEW OTP & PASSWORD RESET ROUTES ─────────────────────────────────────────

app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and verification code are required' });

    const emailClean = email.toLowerCase().trim();
    const pending    = await PendingReg.findOne({ email: emailClean });

    if (!pending)
      return res.status(400).json({ message: 'No pending registration found or code expired.', expired: true });

    if (new Date() > pending.otpExpiry)
      return res.status(400).json({ message: 'Verification code has expired.', expired: true });

    if (pending.attempts >= 5) {
      await pending.deleteOne();
      return res.status(400).json({ message: 'Too many incorrect attempts. Please start again.', expired: true });
    }

    if (pending.otp !== String(otp).trim()) {
      pending.attempts += 1;
      await pending.save();
      return res.status(400).json({ message: `Incorrect code. ${5 - pending.attempts} attempts left.` });
    }

    if (await User.findOne({ email: emailClean })) {
      await pending.deleteOne();
      return res.status(400).json({ message: 'Account already exists.' });
    }

    const user = await User.create({
      username: pending.username,
      email:    emailClean,
      password: pending.password,
      role:     pending.role,
      isEmailVerified: true,
    });

    await pending.deleteOne();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: safeFmt(user) });
  } catch (err) { serverError(res, err); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Don't reveal if user exists for security, but we'll simulate for demo
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 600000, purpose: 'reset' });
    console.log(`[OTP] Password Reset for ${email}: ${otp}`);
    res.json({ message: 'If an account exists, a reset code was sent' });
  } catch (err) { serverError(res, err); }
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore.get(email);
  if (!entry || entry.otp !== otp || Date.now() > entry.expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired code' });
  }
  res.json({ success: true });
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const entry = otpStore.get(email);
    if (!entry || entry.otp !== otp || Date.now() > entry.expires || entry.purpose !== 'reset') {
      return res.status(400).json({ message: 'Invalid session' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    otpStore.delete(email);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { serverError(res, err); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safeFmt(user));
  } catch (err) { serverError(res, err); }
});

// ─── PROPERTY ROUTES ─────────────────────────────────────────────────────────

app.get('/api/properties', async (req, res) => {
  try {
    const filter = {};
    const { district, type, status, minRent, maxRent } = req.query;

    // FIX 10: Validate every query param against a strict allowlist.
    // Without this, ?district[$ne]=Maitama passes a Mongoose operator object
    // directly and the attacker can bypass your filters or dump all records.
    if (district !== undefined) {
      if (!VALID_DISTRICTS.includes(district))
        return res.status(400).json({ message: 'Invalid district' });
      filter.district = district;
    }
    if (type !== undefined) {
      if (!VALID_TYPES.includes(type))
        return res.status(400).json({ message: 'Invalid property type' });
      filter.type = type;
    }
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status))
        return res.status(400).json({ message: 'Invalid status' });
      filter.status = status;
    }
    if (minRent !== undefined || maxRent !== undefined) {
      const min = Number(minRent), max = Number(maxRent);
      if ((minRent !== undefined && isNaN(min)) || (maxRent !== undefined && isNaN(max)))
        return res.status(400).json({ message: 'Rent values must be numbers' });
      filter.baseRent = {};
      if (!isNaN(min)) filter.baseRent.$gte = min;
      if (!isNaN(max)) filter.baseRent.$lte = max;
    }

    const props = await Property.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(props.map(p => ({ ...p.toObject(), _id: p._id.toString() })));
  } catch (err) { serverError(res, err); }
});

app.post('/api/properties', auth, agentOnly, async (req, res) => {
  try {
    // FIX 6 (applied): Only pick whitelisted fields — blocks isVerified:true injection.
    const allowed = pickAllowed(req.body, PROPERTY_ALLOWED_FIELDS);

    if (!allowed.title?.trim())
      return res.status(400).json({ message: 'Title is required' });
    if (!VALID_DISTRICTS.includes(allowed.district))
      return res.status(400).json({ message: 'Valid Abuja district is required' });

    const base    = Number(allowed.baseRent) || 0;
    const svc     = Number(allowed.serviceCharge) || 0;
    const caution = Number(allowed.cautionFee)    || 0;
    const coords  = DISTRICT_COORDS[allowed.district] || { lat: 9.05, lng: 7.49 };

    const property = await Property.create({
      ...allowed,
      baseRent:    base,
      serviceCharge: svc,
      cautionFee:  caution,
      agencyFee:   base * 0.1,
      legalFee:    base * 0.1,
      totalInitialPayment: base + svc + caution + base * 0.2,
      lat: coords.lat + (Math.random() - 0.5) * 0.02,
      lng: coords.lng + (Math.random() - 0.5) * 0.02,
      // These are always server-assigned — never trusted from the client
      agentId:           req.dbUser._id.toString(),
      agentName:         req.dbUser.username,
      isVerified:        false,
      verificationStage: 'listing_created',
      status:            'available',
    });
    res.status(201).json({ ...property.toObject(), _id: property._id.toString() });
  } catch (err) { serverError(res, err); }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    res.json({ ...prop.toObject(), _id: prop._id.toString() });
  } catch (err) { serverError(res, err); }
});

app.put('/api/properties/:id', auth, agentOnly, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (prop.agentId !== req.dbUser._id.toString() && req.dbUser.role !== 'admin')
      return res.status(403).json({ message: 'Not your listing' });

    // FIX 6 (applied): Only update whitelisted fields.
    // The old Object.assign(prop, req.body) let an attacker flip isVerified to true.
    const allowed = pickAllowed(req.body, PROPERTY_ALLOWED_FIELDS);
    Object.assign(prop, allowed);

    if (allowed.baseRent !== undefined) {
      const base  = Number(allowed.baseRent) || 0;
      prop.agencyFee  = base * 0.1;
      prop.legalFee   = base * 0.1;
      prop.totalInitialPayment = base + (prop.serviceCharge || 0) + (prop.cautionFee || 0) + base * 0.2;
    }
    await prop.save();
    res.json({ ...prop.toObject(), _id: prop._id.toString() });
  } catch (err) { serverError(res, err); }
});

app.delete('/api/properties/:id', auth, agentOnly, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (prop.agentId !== req.dbUser._id.toString() && req.dbUser.role !== 'admin')
      return res.status(403).json({ message: 'Not your listing' });
    await prop.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { serverError(res, err); }
});

// FIX: /verify now requires agent/admin role AND ownership check.
// Previously any authenticated user — even a tenant — could call this and
// push their rented listing to "verified" status.
app.post('/api/properties/:id/verify', auth, agentOnly, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (req.dbUser.role === 'agent' && prop.agentId !== req.dbUser._id.toString())
      return res.status(403).json({ message: 'Not your listing' });

    const idx  = VERIFICATION_STAGES.indexOf(prop.verificationStage);
    const next = VERIFICATION_STAGES[idx + 1];
    if (!next) return res.status(400).json({ message: 'Already fully verified' });

    prop.verificationStage = next;
    prop.isVerified        = next === 'verified';
    await prop.save();
    res.json({ ...prop.toObject(), _id: prop._id.toString() });
  } catch (err) { serverError(res, err); }
});

app.post('/api/properties/:id/book-inspection', auth, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, property: { ...prop.toObject(), _id: prop._id.toString() } });
  } catch (err) { serverError(res, err); }
});

// ─── PAYSTACK PAYMENTS ────────────────────────────────────────────────────────

// 1. Initialize payment — tenant starts paying for a property
app.post('/api/payments/initialize', auth, async (req, res) => {
  try {
    if (!PAYSTACK_SECRET) return res.status(500).json({ message: 'Payment not configured' });
    const { propertyId, inspectionDate } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'Property ID required' });

    const insDate = inspectionDate ? new Date(inspectionDate) : null;
    if (insDate && isNaN(insDate.getTime())) return res.status(400).json({ message: 'Invalid inspection date' });
    if (insDate && insDate < new Date()) return res.status(400).json({ message: 'Inspection date must be in the future' });

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'available') return res.status(400).json({ message: 'This property is no longer available' });

    const tenant = await User.findById(req.user.id).select('email username');
    const amountNaira = property.totalInitialPayment;
    const amountKobo  = amountNaira * 100;
    if (amountKobo < 10000) return res.status(400).json({ message: 'Payment amount too small' });

    const reference = `VF-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const paystackData = await paystackRequest('POST', '/transaction/initialize', {
      email: tenant.email, amount: amountKobo, reference,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/#/payment/verify/${reference}`,
      metadata: { propertyId, propertyTitle: property.title, tenantId: req.user.id, agentId: property.agentId }
    });

    const baseDate = insDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
    const releaseDate = new Date(baseDate.getTime() + RELEASE_HOURS * 60 * 60 * 1000);

    await Payment.create({
      reference, propertyId, tenantId: req.user.id, agentId: property.agentId,
      amount: amountNaira, amountKobo, description: `Payment for ${property.title}`,
      status: 'pending', inspectionDate: insDate, releaseDate,
      propertyTitle: property.title, agentName: property.agentName, tenantEmail: tenant.email
    });

    res.json({ reference, authorizationUrl: paystackData.authorization_url, accessCode: paystackData.access_code, amount: amountNaira, propertyTitle: property.title, releaseDate: releaseDate.toISOString() });
  } catch (err) { serverError(res, err); }
});

// 2. Verify payment
app.get('/api/payments/verify/:reference', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ reference: req.params.reference });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.tenantId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (payment.status !== 'pending') return res.json({ status: payment.status, payment: safeFmt(payment) });

    const txData = await paystackRequest('GET', `/transaction/verify/${req.params.reference}`);
    if (txData.status === 'success') {
      payment.status = 'confirmed';
      payment.paystackData = txData;
      await payment.save();
      await Property.findByIdAndUpdate(payment.propertyId, { status: 'under-offer' });
      return res.json({ status: 'confirmed', payment: safeFmt(payment) });
    }
    res.json({ status: txData.status, payment: safeFmt(payment) });
  } catch (err) { serverError(res, err); }
});

// 3. List payments
app.get('/api/payments', auth, async (req, res) => {
  try {
    await processScheduledReleases();
    const filter = req.user.role === 'agent' || req.user.role === 'admin'
      ? { agentId: req.user.id } : { tenantId: req.user.id };
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(payments.map(paymentFmt));
  } catch (err) { serverError(res, err); }
});

// ─── AGENT BANK ROUTES ────────────────────────────────────────────────────────

app.get('/api/banks', async (req, res) => {
  try {
    const data = await paystackRequest('GET', '/bank?currency=NGN&country=nigeria');
    res.json({ banks: data.map(b => ({ code: b.code, name: b.name })) });
  } catch (err) { serverError(res, err); }
});

app.post('/api/banks/resolve', auth, async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const data = await paystackRequest('GET', `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
    res.json({ accountName: data.account_name });
  } catch (err) { res.status(400).json({ message: 'Could not verify account.' }); }
});

app.post('/api/banks/setup', auth, agentOnly, async (req, res) => {
  try {
    const { bankCode, bankName, accountNumber, accountName } = req.body;
    const recipient = await paystackRequest('POST', '/transferrecipient', {
      type: 'nuban', name: accountName, account_number: accountNumber, bank_code: bankCode, currency: 'NGN'
    });
    const bank = await AgentBank.findOneAndUpdate(
      { agentId: req.dbUser._id.toString() },
      { agentId: req.dbUser._id.toString(), bankCode, bankName, accountNumber, accountName, recipientCode: recipient.recipient_code },
      { upsert: true, new: true }
    );
    res.json({ message: 'Bank account saved', bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber.replace(/\d(?=\d{4})/g, '*') });
  } catch (err) { serverError(res, err); }
});

app.get('/api/banks/setup', auth, agentOnly, async (req, res) => {
  try {
    const bank = await AgentBank.findOne({ agentId: req.dbUser._id.toString() });
    if (!bank) return res.json({ configured: false });
    res.json({ configured: true, bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber.replace(/\d(?=\d{4})/g, '*') });
  } catch (err) { serverError(res, err); }
});

const paymentFmt = (p) => ({
  _id: p._id.toString(), reference: p.reference, propertyId: p.propertyId, propertyTitle: p.propertyTitle,
  agentName: p.agentName, amount: p.amount, status: p.status, inspectionDate: p.inspectionDate,
  releaseDate: p.releaseDate, transferReference: p.transferReference, createdAt: p.createdAt,
});

// ─── STATUS ───────────────────────────────────────────────────────────────────

// Only expose DB state in non-production environments.
app.get('/api/status', (req, res) => {
  const payload = { status: 'running', version: '2.0.0' };
  if (process.env.NODE_ENV !== 'production')
    payload.db = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json(payload);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Verifind API  →  http://localhost:${PORT}`);
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}\n`);
});
