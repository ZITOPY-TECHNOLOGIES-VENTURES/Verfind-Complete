const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const path      = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

// ─── OTP STORE (In-memory for demo) ───────────────────────────────────────────
const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (to, name, otp) => {
  const BREVO_KEY = process.env.BREVO_API_KEY;
  const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@verifind.ng';
  const FROM_NAME  = process.env.EMAIL_FROM_NAME || 'Verifind';

  if (!BREVO_KEY) {
    console.error('❌ BREVO_API_KEY is missing. Code delivery failed.');
    return false;
  }

  try {
    const body = {
      sender:      { name: FROM_NAME, email: FROM_EMAIL },
      to:          [{ email: to, name }],
      subject:     `Your Verifind verification code is ${otp}`,
      htmlContent: `
        <div style="font-family:'Inter',system-ui,sans-serif;max-width:500px;margin:0 auto;padding:40px 32px;background:#050D1E;border-radius:24px;border:1px solid #1e293b">
          <div style="text-align:center;margin-bottom:32px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);border-radius:12px;margin:0 auto 20px;line-height:48px;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-1px">
              V
            </div>
            <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 8px">Verify your identity</h1>
            <p style="color:#94a3b8;font-size:15px;margin:0;line-height:1.5">Hi ${name}, use the secure code below to access your Verifind account.</p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
            <div style="font-size:48px;font-weight:900;letter-spacing:0.25em;color:#60A5FA;font-family:monospace;text-shadow:0 0 20px rgba(96,165,250,0.4)">${otp}</div>
            <p style="font-size:13px;color:#64748b;margin:16px 0 0;font-weight:500">Code expires in <strong style="color:#94a3b8">10 minutes</strong></p>
          </div>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0" />
          <p style="font-size:12px;color:#475569;text-align:center;margin:0;line-height:1.5">If you didn't request this code, you can safely ignore this email.<br/>Secure Real Estate, verified by Verifind.</p>
        </div>
      `,
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('❌ Brevo HTTP Error:', errData);
      return false; // Crucial fix: return false on failure!
    }
    return true; // Successfully delivered via Brevo
  } catch (err) {
    console.error('❌ Brevo Network Error:', err.message);
    return false; // Crucial fix: return false on crash!
  }
};

const sendPaymentEmail = async (to, subject, message) => {
  const BREVO_KEY  = process.env.BREVO_API_KEY;
  const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@verifind.ng';
  const FROM_NAME  = process.env.EMAIL_FROM_NAME || 'Verifind';
  if (!BREVO_KEY) {
    console.error('❌ BREVO_API_KEY is missing. Email delivery failed.');
    return;
  }
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        sender:      { name: FROM_NAME, email: FROM_EMAIL },
        to:          [{ email: to }],
        subject,
        htmlContent: `<div style="font-family:sans-serif;padding:24px;background:#f9f9f9;border-radius:12px;color:#333">
                <h2 style="color:#1B4FD8">${subject}</h2>
                <p style="font-size:16px;line-height:1.5">${message}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
                <p style="font-size:12px;color:#999">Verifind Escrow — Secure Real Estate Payments</p>
               </div>`,
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
    const due = await prisma.payment.findMany({
      where: { status: 'confirmed', releaseDate: { lte: new Date() } },
      take: 10,
    });
    for (const payment of due) {
      try {
        let recipientCode = payment.recipientCode;
        if (!recipientCode) {
          const agentBank = await prisma.agentBank.findUnique({ where: { agentId: payment.agentId } });
          if (!agentBank) continue;
          recipientCode = agentBank.recipientCode;
        }

        // Attempt Paystack transfer
        try {
          const transferData = await paystackRequest('POST', '/transfer', {
            source: 'balance',
            amount: Math.round(payment.amount * 0.9 * 100),
            recipient: recipientCode,
            reason: `Rent payment: ${payment.propertyTitle}`,
          });
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'releasing', transferReference: transferData.transfer_code },
          });
        } catch (transferErr) {
          console.error(`Transfer failed for ${payment.reference}:`, transferErr.message);
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'released' },
          });
        }

        await prisma.property.update({
          where: { id: payment.propertyId },
          data: { status: 'rented' },
        });

        await prisma.transaction.create({
          data: {
            userId:      payment.agentId,
            propertyId:  payment.propertyId,
            type:        'escrow_release',
            amount:      payment.amount * 0.9,
            status:      'completed',
            description: `Auto-released funds for ${payment.propertyTitle}`,
            reference:   payment.reference,
          },
        });
      } catch (err) {
        console.error(`Scheduled release failed for ${payment.reference}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Release scheduler error:', err.message);
  }
};

// Run scheduled releases every 30 minutes
setInterval(processScheduledReleases, 30 * 60 * 1000);

// ─── STARTUP GUARD ────────────────────────────────────────────────────────────
// FIX 1: Crash hard if JWT_SECRET is missing.
// The old code silently fell back to a hardcoded string anyone could use to
// forge tokens for any user. Now we refuse to start instead.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}

const app        = express();
const PORT       = process.env.PORT || 5000;
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
      const payment = await prisma.payment.findUnique({ where: { reference } });
      if (payment && payment.status === 'pending') {
        await prisma.payment.update({
          where: { reference },
          data: { status: 'confirmed', paystackData: event.data }
        });
        await prisma.transaction.create({
          data: {
            userId: payment.tenantId,
            propertyId: payment.propertyId,
            type: 'escrow_hold',
            amount: payment.amount,
            status: 'completed',
            description: `Rent payment for ${payment.propertyTitle} (Reference: ${reference})`,
            reference,
          }
        });
        if (metadata?.propertyId) await prisma.property.update({ where: { id: metadata.propertyId }, data: { status: 'under-offer' } });
        
        await sendPaymentEmail(payment.tenantEmail, 'Payment Confirmed', 
          `Your payment for <b>${payment.propertyTitle}</b> has been confirmed. The agent will contact you shortly.`);
      }
    }

    if (event.event === 'transfer.success') {
      const payment = await prisma.payment.findFirst({ where: { transferReference: event.data.transfer_code } });
      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: 'released' } });
        await prisma.property.update({ where: { id: payment.propertyId }, data: { status: 'rented' } });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(200);
  }
});

app.use(express.json({ limit: '2mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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

const PROPERTY_ALLOWED_FIELDS = [
  'title','description','district','address','type',
  'baseRent','serviceCharge','cautionFee','images','videoUrl',
  'bedrooms','bathrooms','sqm','furnished','parking',
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

async function checkDb() {
  try {
    await prisma.$connect();
    console.log('✅ Postgres (Prisma) connected');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
}
checkDb();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const safeFmt = (user) => {
  const { password, ...safe } = user;
  return safe;
};

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

const agentOnly = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
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

    if (await prisma.user.findUnique({ where: { email: emailClean } }))
      return res.status(400).json({ message: 'An account with this email already exists' });

    const existing = await prisma.pendingReg.findUnique({ where: { email: emailClean } });
    if (existing) {
      const age = Date.now() - new Date(existing.createdAt).getTime();
      if (age < 60_000)
        return res.status(429).json({ message: 'Please wait 60 seconds before requesting a new code' });
      await prisma.pendingReg.delete({ where: { email: emailClean } });
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashed    = await bcrypt.hash(password, 12);

    await prisma.pendingReg.create({
      data: {
        username: username.trim(),
        email:    emailClean,
        password: hashed,
        role:     role === 'agent' ? 'agent' : 'tenant',
        otp,
        otpExpiry,
      }
    });

    const emailSent = await sendOtpEmail(emailClean, username.trim(), otp);
    
    if (!emailSent) {
      // If we couldn't send the email (missing API key or Brevo failure)
      return res.status(500).json({ 
        sent: false, 
        message: 'Failed to send verification email. Please check server email delivery settings.' 
      });
    }

    res.json({ 
      sent: true, 
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined, // Useful if the user tests without Mailer
      message: `Verification code sent to ${emailClean}`
    });
  } catch (err) { serverError(res, err); }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });

    const match = user ? await bcrypt.compare(String(password), user.password) : false;

    if (!user || !match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: safeFmt(user) });
  } catch (err) { serverError(res, err); }
});

app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and verification code are required' });

    const emailClean = email.toLowerCase().trim();
    const pending    = await prisma.pendingReg.findUnique({ where: { email: emailClean } });

    if (!pending)
      return res.status(400).json({ message: 'No pending registration found or code expired.', expired: true });

    if (new Date() > pending.otpExpiry)
      return res.status(400).json({ message: 'Verification code has expired.', expired: true });

    if (pending.attempts >= 5) {
      await prisma.pendingReg.delete({ where: { email: emailClean } });
      return res.status(400).json({ message: 'Too many incorrect attempts. Please start again.', expired: true });
    }

    if (pending.otp !== String(otp).trim()) {
      await prisma.pendingReg.update({
        where: { email: emailClean },
        data: { attempts: { increment: 1 } }
      });
      return res.status(400).json({ message: `Incorrect code.` });
    }

    const user = await prisma.user.create({
      data: {
        username: pending.username,
        email:    emailClean,
        password: pending.password,
        role:     pending.role,
        isEmailVerified: true,
      }
    });

    await prisma.pendingReg.delete({ where: { email: emailClean } });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: safeFmt(user) });
  } catch (err) { serverError(res, err); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 600000, purpose: 'reset' });
    
    if (user) {
      await sendOtpEmail(email, user.username || 'User', otp);
    }
    
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
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await prisma.user.update({
      where: { email },
      data: { password: await bcrypt.hash(newPassword, 12) }
    });
    otpStore.delete(email);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { serverError(res, err); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safeFmt(user));
  } catch (err) { serverError(res, err); }
});

// ─── PROPERTY ROUTES ─────────────────────────────────────────────────────────

app.get('/api/properties', async (req, res) => {
  try {
    const where = {};
    const { district, type, status, minRent, maxRent } = req.query;

    if (district !== undefined) {
      if (!VALID_DISTRICTS.includes(district)) return res.status(400).json({ message: 'Invalid district' });
      where.district = district;
    }
    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) return res.status(400).json({ message: 'Invalid type' });
      where.type = type;
    }
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
      where.status = status;
    }
    if (minRent !== undefined || maxRent !== undefined) {
      where.baseRent = {};
      if (minRent !== undefined) where.baseRent.gte = Number(minRent);
      if (maxRent !== undefined) where.baseRent.lte = Number(maxRent);
    }

    const props = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    res.json(props);
  } catch (err) { serverError(res, err); }
});

app.post('/api/properties', auth, agentOnly, async (req, res) => {
  try {
    const allowed = pickAllowed(req.body, PROPERTY_ALLOWED_FIELDS);

    if (!allowed.title?.trim())
      return res.status(400).json({ message: 'Title is required' });
    if (!VALID_DISTRICTS.includes(allowed.district))
      return res.status(400).json({ message: 'Valid Abuja district is required' });

    const base    = Number(allowed.baseRent) || 0;
    const svc     = Number(allowed.serviceCharge) || 0;
    const caution = Number(allowed.cautionFee)    || 0;
    const coords  = DISTRICT_COORDS[allowed.district] || { lat: 9.05, lng: 7.49 };

    const property = await prisma.property.create({
      data: {
        ...allowed,
        baseRent:    base,
        serviceCharge: svc,
        cautionFee:  caution,
        agencyFee:   base * 0.1,
        legalFee:    base * 0.1,
        totalInitialPayment: base + svc + caution + base * 0.2,
        lat: coords.lat + (Math.random() - 0.5) * 0.02,
        lng: coords.lng + (Math.random() - 0.5) * 0.02,
        agentId:           req.dbUser.id,
        agentName:         req.dbUser.username,
        isVerified:        false,
        verificationStage: 'listing_created',
        status:            'available',
      }
    });
    res.status(201).json(property);
  } catch (err) { serverError(res, err); }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    res.json(prop);
  } catch (err) { serverError(res, err); }
});

app.put('/api/properties/:id', auth, agentOnly, async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (prop.agentId !== req.dbUser.id && req.dbUser.role !== 'admin')
      return res.status(403).json({ message: 'Not your listing' });

    const allowed = pickAllowed(req.body, PROPERTY_ALLOWED_FIELDS);
    
    if (allowed.baseRent !== undefined) {
      const base  = Number(allowed.baseRent) || 0;
      allowed.agencyFee  = base * 0.1;
      allowed.legalFee   = base * 0.1;
      allowed.totalInitialPayment = base + (prop.serviceCharge || 0) + (prop.cautionFee || 0) + base * 0.2;
    }
    
    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: allowed
    });
    res.json(updated);
  } catch (err) { serverError(res, err); }
});

app.delete('/api/properties/:id', auth, agentOnly, async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (prop.agentId !== req.dbUser.id && req.dbUser.role !== 'admin')
      return res.status(403).json({ message: 'Not your listing' });
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { serverError(res, err); }
});

app.post('/api/properties/:id/verify', auth, agentOnly, async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (req.dbUser.role === 'agent' && prop.agentId !== req.dbUser.id)
      return res.status(403).json({ message: 'Not your listing' });

    const idx  = VERIFICATION_STAGES.indexOf(prop.verificationStage);
    const next = VERIFICATION_STAGES[idx + 1];
    if (!next) return res.status(400).json({ message: 'Already fully verified' });

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: { verificationStage: next, isVerified: next === 'verified' }
    });
    res.json(updated);
  } catch (err) { serverError(res, err); }
});

app.post('/api/properties/:id/book-inspection', auth, async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, property: prop });
  } catch (err) { serverError(res, err); }
});

// ─── PAYSTACK PAYMENTS ────────────────────────────────────────────────────────

app.post('/api/payments/initialize', auth, async (req, res) => {
  try {
    if (!PAYSTACK_SECRET) return res.status(500).json({ message: 'Payment not configured' });
    const { propertyId, inspectionDate } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'Property ID required' });

    // Fetch full user record (auth middleware only decodes the JWT)
    const tenant = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!tenant) return res.status(404).json({ message: 'User not found' });

    const insDate = inspectionDate ? new Date(inspectionDate) : null;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'available') return res.status(400).json({ message: 'This property is no longer available' });

    const amountMajor = property.totalInitialPayment;
    const amount = amountMajor * 100;
    const reference = `VF-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const paystackData = await paystackRequest('POST', '/transaction/initialize', {
      email: tenant.email, amount, reference,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/#/payment/verify/${reference}`,
      metadata: { propertyId, propertyTitle: property.title, tenantId: tenant.id, agentId: property.agentId }
    });

    const releaseDate = new Date(Date.now() + (insDate ? 0 : 24 * 60 * 60 * 1000) + RELEASE_HOURS * 60 * 60 * 1000);

    await prisma.payment.create({
      data: {
        reference,
        propertyId,
        tenantId:   tenant.id,
        agentId:    property.agentId,
        amount:     amountMajor,
        amountKobo: amount,
        status:     'pending',
        inspectionDate: insDate,
        releaseDate,
        propertyTitle: property.title,
        agentName:     property.agentName,
        tenantEmail:   tenant.email
      }
    });

    res.json({ reference, authorizationUrl: paystackData.authorization_url, accessCode: paystackData.access_code, amount: amountMajor, propertyTitle: property.title, releaseDate: releaseDate.toISOString() });
  } catch (err) { serverError(res, err); }
});

app.get('/api/payments/verify/:reference', auth, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { reference: req.params.reference } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.tenantId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (payment.status !== 'pending') return res.json({ status: payment.status, payment });

    const txData = await paystackRequest('GET', `/transaction/verify/${req.params.reference}`);
    if (txData.status === 'success') {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'confirmed', paystackData: txData } });
      await prisma.property.update({ where: { id: payment.propertyId }, data: { status: 'under-offer' } });
      return res.json({ status: 'confirmed', payment });
    }
    res.json({ status: txData.status, payment });
  } catch (err) { serverError(res, err); }
});

app.get('/api/payments', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const payments = await prisma.payment.findMany({
      where: user.role === 'agent' ? { agentId: user.id } : { tenantId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
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
    const bank = await prisma.agentBank.findUnique({ where: { agentId: req.dbUser.id } });
    if (bank) return res.status(409).json({ message: 'Bank details already exist' });

    const newBank = await prisma.agentBank.create({
      data: {
        agentId:       req.dbUser.id,
        bankCode,
        bankName,
        accountNumber,
        accountName,
        recipientCode: recipient.recipient_code,
      }
    });
    res.status(201).json(newBank);
  } catch (err) { serverError(res, err); }
});

app.get('/api/banks/setup', auth, agentOnly, async (req, res) => {
  try {
    const bank = await prisma.agentBank.findUnique({ where: { agentId: req.dbUser.id } });
    if (!bank) return res.json({ configured: false });
    res.json({ configured: true, bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber.replace(/\d(?=\d{4})/g, '*') });
  } catch (err) { serverError(res, err); }
});

// ─── STATUS ───────────────────────────────────────────────────────────────────
// ─── SERVE FRONTEND (PRODUCTION) ────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.get('/api/status', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'running', version: '2.0.0', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'running', version: '2.0.0', db: 'disconnected' });
  }
});

// React fallback routing MUST be after all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>⚠️ Frontend Build Not Found</h2>
          <p>The backend API is running successfully, but the React frontend (<code>index.html</code>) is missing.</p>
          <p>To fix this, go to your <b>Render Dashboard</b>, open this Web Service, and change the <b>Build Command</b> to:</p>
          <code style="background: #eee; padding: 8px; border-radius: 4px; font-size: 16px;">npm install && npm run build</code>
        </div>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Verifind API  →  http://localhost:${PORT}`);
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}\n`);
});
