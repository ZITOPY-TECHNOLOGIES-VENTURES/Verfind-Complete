const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
require('dotenv').config();

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

// FIX 4: Reduce body limit from 50 MB to 2 MB.
// 50 MB was a single-packet DoS. Images belong on Cloudinary, not in the DB.
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
  isKycVerified:  { type: Boolean, default: false },
  whatsappNumber: { type: String, maxlength: 20 },
}, { timestamps: true });

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

const User        = mongoose.model('User', UserSchema);
const Property    = mongoose.model('Property', PropertySchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

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

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (username.trim().length > 60)
      return res.status(400).json({ message: 'Username too long (max 60 chars)' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (password.length > 128)
      return res.status(400).json({ message: 'Password too long' });

    // FIX 9: Prevent role escalation. Public registration only allows
    // tenant or agent. Admin accounts must be seeded or granted by an admin.
    if (!['tenant','agent'].includes(role)) role = 'tenant';

    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({
      username: username.trim(),
      email:    email.toLowerCase().trim(),
      password: hashed,
      role,
    });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: safeFmt(user) });
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

// ─── ESCROW ROUTES ────────────────────────────────────────────────────────────

app.get('/api/escrow/balance', auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const [credits, debits] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: uid, type: { $in: ['deposit','escrow_release'] }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: uid, type: { $in: ['withdrawal','escrow_hold'] }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    res.json({ balance: (credits[0]?.total || 0) - (debits[0]?.total || 0) });
  } catch (err) { serverError(res, err); }
});

app.get('/api/escrow/transactions', auth, async (req, res) => {
  try {
    const txns = await Transaction
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(txns.map(t => ({ ...t.toObject(), _id: t._id.toString() })));
  } catch (err) { serverError(res, err); }
});

app.post('/api/escrow/deposit', auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0 || amount > 50_000_000)
      return res.status(400).json({ message: 'Amount must be between ₦1 and ₦50,000,000' });

    const desc = String(req.body.description || 'Wallet top-up').slice(0, 200);
    const txn  = await Transaction.create({
      userId:      req.user.id,
      type:        'deposit',
      amount,
      status:      'completed',
      description: desc,
      reference:   `VF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    });
    res.status(201).json({ ...txn.toObject(), _id: txn._id.toString() });
  } catch (err) { serverError(res, err); }
});

app.post('/api/escrow/hold', auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' });

    const balance = await getBalance(req.user.id);
    if (amount > balance)
      return res.status(400).json({ message: 'Insufficient balance' });

    const txn = await Transaction.create({
      userId:      req.user.id,
      propertyId:  req.body.propertyId,
      type:        'escrow_hold',
      amount,
      status:      'completed',
      description: String(req.body.description || 'Escrow hold').slice(0, 200),
      reference:   `VF-ESC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    });
    res.status(201).json({ ...txn.toObject(), _id: txn._id.toString() });
  } catch (err) { serverError(res, err); }
});

async function getBalance(userId) {
  const [c, d] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, type: { $in: ['deposit','escrow_release'] }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { userId, type: { $in: ['withdrawal','escrow_hold'] }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);
  return (c[0]?.total || 0) - (d[0]?.total || 0);
}

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
