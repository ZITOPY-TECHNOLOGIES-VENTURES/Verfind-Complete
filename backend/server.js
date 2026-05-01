'use strict';
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// ── Security & CORS ────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin not allowed — ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// ── JWT ────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// ── Brevo email ────────────────────────────────────────────────────────────
async function sendEmail(to, subject, htmlContent) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Verifind',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@getverifind.com',
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error: ${err}`);
  }
}

function otpEmail(code) {
  return `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#F8FAFF;border-radius:16px">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:28px;font-weight:900;letter-spacing:-1px">
        <span style="color:#1B3068">Ver</span><span style="color:#2D8B1E">Find</span>
      </span>
    </div>
    <h2 style="color:#1B3068;margin:0 0 12px">Verify your email</h2>
    <p style="color:#555;margin:0 0 28px">Enter this code in the Verifind app:</p>
    <div style="background:#fff;border:2px solid #0A66C2;border-radius:12px;padding:20px;text-align:center;letter-spacing:10px;font-size:38px;font-weight:800;color:#0A66C2">${code}</div>
    <p style="color:#888;font-size:13px;margin:20px 0 0">Expires in 15 minutes. Don't share this with anyone.</p>
  </div>`;
}

function resetEmail(code) {
  return `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#F8FAFF;border-radius:16px">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:28px;font-weight:900;letter-spacing:-1px">
        <span style="color:#1B3068">Ver</span><span style="color:#2D8B1E">Find</span>
      </span>
    </div>
    <h2 style="color:#1B3068;margin:0 0 12px">Password reset</h2>
    <p style="color:#555;margin:0 0 28px">Your reset code:</p>
    <div style="background:#fff;border:2px solid #0A66C2;border-radius:12px;padding:20px;text-align:center;letter-spacing:10px;font-size:38px;font-weight:800;color:#0A66C2">${code}</div>
    <p style="color:#888;font-size:13px;margin:20px 0 0">Expires in 15 minutes. If you didn't request this, ignore it.</p>
  </div>`;
}

// ── OTP helpers ────────────────────────────────────────────────────────────
function genOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }

// In-memory password-reset OTPs (acceptable — lost on restart, short-lived)
const resetOtps = new Map();

// ── Paystack ───────────────────────────────────────────────────────────────
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PS = 'https://api.paystack.co';

async function psPost(path, body) {
  const r = await fetch(`${PS}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!d.status) throw new Error(d.message || 'Paystack error');
  return d.data;
}

async function psGet(path) {
  const r = await fetch(`${PS}${path}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const d = await r.json();
  if (!d.status) throw new Error(d.message || 'Paystack error');
  return d.data;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/send-otp — register step 1
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { username, email, password, role, phone, nin } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'username, email and password are required' });

    // admin role can only be assigned via the seeder script, never via registration
    const safeRole = role === 'agent' ? 'agent' : 'tenant';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const otp = genOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.pendingReg.upsert({
      where: { email },
      create: { username, email, password: hashed, role: safeRole, phone, nin, otp, otpExpiry },
      update: { username, password: hashed, role: safeRole, phone, nin, otp, otpExpiry, attempts: 0 },
    });

    await sendEmail(email, 'Your Verifind verification code', otpEmail(otp));
    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('send-otp:', err.message);
    res.status(500).json({ message: err.message || 'Failed to send verification code' });
  }
});

// POST /api/auth/verify-email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pending = await prisma.pendingReg.findUnique({ where: { email } });
    if (!pending) return res.status(400).json({ message: 'No pending registration for this email' });
    if (pending.attempts >= 5) return res.status(429).json({ message: 'Too many attempts. Request a new code.' });
    if (new Date() > pending.otpExpiry) return res.status(400).json({ message: 'Code expired. Request a new one.' });
    if (pending.otp !== otp) {
      await prisma.pendingReg.update({ where: { email }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ message: 'Invalid code' });
    }

    const user = await prisma.user.create({
      data: {
        username: pending.username,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        phone: pending.phone,
        nin: pending.nin,
        isEmailVerified: true,
      },
    });

    await prisma.pendingReg.delete({ where: { email } });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('verify-email:', err.message);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isEmailVerified)
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('login:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// PUT /api/auth/me — update profile (phone, businessName, currentAddress, etc.)
app.put('/api/auth/me', auth, async (req, res) => {
  try {
    const { username, phone, businessName, currentAddress, nin, ninUrl, driverLicenseUrl, cacDocUrl } = req.body;
    const data = {};
    if (username) data.username = username;
    if (phone !== undefined) data.phone = phone;
    if (businessName !== undefined) data.businessName = businessName;
    if (currentAddress !== undefined) data.currentAddress = currentAddress;
    if (nin !== undefined) data.nin = nin;
    if (ninUrl !== undefined) data.ninUrl = ninUrl;
    if (driverLicenseUrl !== undefined) data.driverLicenseUrl = driverLicenseUrl;
    if (cacDocUrl !== undefined) data.cacDocUrl = cacDocUrl;
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const otp = genOtp();
      resetOtps.set(email, { otp, expiry: Date.now() + 15 * 60 * 1000, verified: false });
      await sendEmail(email, 'Reset your Verifind password', resetEmail(otp));
    }
    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If this email is registered, a reset code was sent.' });
  } catch (err) {
    console.error('forgot-password:', err.message);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = resetOtps.get(email);
    if (!record || Date.now() > record.expiry) return res.status(400).json({ message: 'Code expired or not found' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid code' });
    resetOtps.set(email, { ...record, verified: true });
    res.json({ success: true, message: 'Code verified' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const record = resetOtps.get(email);
    if (!record || !record.verified || Date.now() > record.expiry)
      return res.status(400).json({ message: 'Invalid or expired reset session' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid code' });
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    resetOtps.delete(email);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('reset-password:', err.message);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/properties
app.get('/api/properties', async (req, res) => {
  try {
    const { district, type, status, listingMode, agentId, search, page = '1', limit = '20' } = req.query;
    const { minRent, maxRent } = req.query;

    const where = {};
    if (district) where.district = district;
    if (type) where.type = type;
    if (status) where.status = status;
    if (listingMode) where.listingMode = listingMode;
    if (agentId) where.agentId = agentId;
    if (minRent || maxRent) {
      where.baseRent = {};
      if (minRent) where.baseRent.gte = parseFloat(minRent);
      if (maxRent) where.baseRent.lte = parseFloat(maxRent);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({ where, skip, take, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }] }),
    ]);

    res.json({ success: true, properties, total, page: parseInt(page), pages: Math.ceil(total / take) });
  } catch (err) {
    console.error('GET /api/properties:', err.message);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch property' });
  }
});

// POST /api/properties
app.post('/api/properties', auth, requireRole('agent'), async (req, res) => {
  try {
    const {
      title, description, district, address, type,
      lat, lng, baseRent, serviceCharge, cautionFee, agencyFee, legalFee,
      images, videoUrl, bedrooms, bathrooms, sqm, furnished, parking, listingMode,
    } = req.body;

    if (!title || !district || !type || !baseRent)
      return res.status(400).json({ message: 'title, district, type and baseRent are required' });
    if (!videoUrl)
      return res.status(400).json({ message: 'A video walkthrough is required for all listings' });

    const rent = parseFloat(baseRent) || 0;
    const svc = parseFloat(serviceCharge) || 0;
    const caution = parseFloat(cautionFee) || 0;
    const agency = parseFloat(agencyFee) || 0;
    const legal = parseFloat(legalFee) || 0;
    const totalInitialPayment = rent + svc + caution + agency + legal;

    const agent = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { username: true, businessName: true },
    });

    const property = await prisma.property.create({
      data: {
        title, description, district, address, type,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        baseRent: rent,
        serviceCharge: svc,
        cautionFee: caution,
        agencyFee: agency || null,
        legalFee: legal || null,
        totalInitialPayment,
        images: images || [],
        videoUrl,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        sqm: sqm ? parseFloat(sqm) : null,
        furnished: Boolean(furnished),
        parking: Boolean(parking),
        listingMode: listingMode || 'Rent',
        agentId: req.user.id,
        agentName: agent?.businessName || agent?.username,
      },
    });

    res.status(201).json({ success: true, property });
  } catch (err) {
    console.error('POST /api/properties:', err.message);
    res.status(500).json({ message: 'Failed to create listing' });
  }
});

// PUT /api/properties/:id
app.put('/api/properties/:id', auth, requireRole('agent', 'admin'), async (req, res) => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role === 'agent' && property.agentId !== req.user.id)
      return res.status(403).json({ message: 'Not your listing' });

    const {
      title, description, district, address, type,
      lat, lng, baseRent, serviceCharge, cautionFee, agencyFee, legalFee,
      images, videoUrl, bedrooms, bathrooms, sqm, furnished, parking, listingMode, status,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (district !== undefined) data.district = district;
    if (address !== undefined) data.address = address;
    if (type !== undefined) data.type = type;
    if (lat !== undefined) data.lat = parseFloat(lat);
    if (lng !== undefined) data.lng = parseFloat(lng);
    if (baseRent !== undefined) data.baseRent = parseFloat(baseRent);
    if (serviceCharge !== undefined) data.serviceCharge = parseFloat(serviceCharge);
    if (cautionFee !== undefined) data.cautionFee = parseFloat(cautionFee);
    if (agencyFee !== undefined) data.agencyFee = parseFloat(agencyFee);
    if (legalFee !== undefined) data.legalFee = parseFloat(legalFee);
    if (images !== undefined) data.images = images;
    if (videoUrl !== undefined) data.videoUrl = videoUrl;
    if (bedrooms !== undefined) data.bedrooms = parseInt(bedrooms);
    if (bathrooms !== undefined) data.bathrooms = parseInt(bathrooms);
    if (sqm !== undefined) data.sqm = parseFloat(sqm);
    if (furnished !== undefined) data.furnished = Boolean(furnished);
    if (parking !== undefined) data.parking = Boolean(parking);
    if (listingMode !== undefined) data.listingMode = listingMode;
    if (status !== undefined) data.status = status;

    if (data.baseRent || data.serviceCharge || data.cautionFee || data.agencyFee || data.legalFee) {
      const r = data.baseRent ?? property.baseRent;
      const s = data.serviceCharge ?? property.serviceCharge;
      const c = data.cautionFee ?? property.cautionFee;
      const a = data.agencyFee ?? property.agencyFee ?? 0;
      const l = data.legalFee ?? property.legalFee ?? 0;
      data.totalInitialPayment = r + s + c + a + l;
    }

    const updated = await prisma.property.update({ where: { id: req.params.id }, data });
    res.json({ success: true, property: updated });
  } catch (err) {
    console.error('PUT /api/properties:', err.message);
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

// DELETE /api/properties/:id
app.delete('/api/properties/:id', auth, requireRole('agent', 'admin'), async (req, res) => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role === 'agent' && property.agentId !== req.user.id)
      return res.status(403).json({ message: 'Not your listing' });
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BOOKING ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/bookings
app.post('/api/bookings', auth, requireRole('tenant'), async (req, res) => {
  try {
    const { propertyId, requestedDate } = req.body;
    if (!propertyId || !requestedDate)
      return res.status(400).json({ message: 'propertyId and requestedDate are required' });

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const tenant = await prisma.user.findUnique({ where: { id: req.user.id }, select: { username: true } });

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        tenantId: req.user.id,
        agentId: property.agentId,
        requestedDate: new Date(requestedDate),
        propertyTitle: property.title,
        tenantName: tenant?.username,
      },
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('POST /api/bookings:', err.message);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// GET /api/bookings
app.get('/api/bookings', auth, async (req, res) => {
  try {
    const where = req.user.role === 'tenant' ? { tenantId: req.user.id } : { agentId: req.user.id };
    const bookings = await prisma.booking.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// PUT /api/bookings/:id
app.put('/api/bookings/:id', auth, requireRole('agent'), async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.agentId !== req.user.id) return res.status(403).json({ message: 'Not your booking' });

    const { status, agentNote, proposedDate } = req.body;
    const data = {};
    if (status) data.status = status;
    if (agentNote !== undefined) data.agentNote = agentNote;
    if (proposedDate) data.requestedDate = new Date(proposedDate);

    const updated = await prisma.booking.update({ where: { id: req.params.id }, data });
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT / ESCROW ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/payments/initialize
app.post('/api/payments/initialize', auth, requireRole('tenant'), async (req, res) => {
  try {
    const { propertyId } = req.body;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (!property.totalInitialPayment) return res.status(400).json({ message: 'Property has no price set' });

    const amountKobo = Math.round(property.totalInitialPayment * 100);
    const reference = `vrf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const description = `Escrow: ${property.title}`;

    const paystackData = await psPost('/transaction/initialize', {
      email: req.user.email,
      amount: amountKobo,
      reference,
      callback_url: `${process.env.FRONTEND_URL || ''}/payment/callback`,
      metadata: { propertyId, tenantId: req.user.id, agentId: property.agentId },
    });

    await prisma.payment.create({
      data: {
        reference,
        propertyId,
        tenantId: req.user.id,
        agentId: property.agentId,
        amount: property.totalInitialPayment,
        amountKobo,
        description,
        propertyTitle: property.title,
        agentName: property.agentName,
        tenantEmail: req.user.email,
        paystackData,
      },
    });

    res.json({ success: true, authorizationUrl: paystackData.authorization_url, reference });
  } catch (err) {
    console.error('payment/initialize:', err.message);
    res.status(500).json({ message: err.message || 'Failed to initialize payment' });
  }
});

// GET /api/payments/verify/:reference
app.get('/api/payments/verify/:reference', auth, async (req, res) => {
  try {
    const paystackData = await psGet(`/transaction/verify/${req.params.reference}`);
    const payment = await prisma.payment.findUnique({ where: { reference: req.params.reference } });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    if (paystackData.status === 'success' && payment.status === 'pending') {
      await Promise.all([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'confirmed', paystackData },
        }),
        prisma.property.update({
          where: { id: payment.propertyId },
          data: { status: 'under_offer' },
        }),
      ]);
    }

    res.json({ success: true, payment: { ...payment, paystackData } });
  } catch (err) {
    console.error('payment/verify:', err.message);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// POST /api/payments/confirm-movein/:paymentId
app.post('/api/payments/confirm-movein/:paymentId', auth, requireRole('tenant'), async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.paymentId } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.tenantId !== req.user.id) return res.status(403).json({ message: 'Not your payment' });
    if (payment.status !== 'confirmed') return res.status(400).json({ message: 'Payment is not in confirmed state' });

    const agentBank = await prisma.agentBank.findUnique({ where: { agentId: payment.agentId } });
    if (!agentBank) return res.status(400).json({ message: "Agent has not set up their bank account yet" });

    const transfer = await psPost('/transfer', {
      source: 'balance',
      amount: payment.amountKobo,
      recipient: agentBank.recipientCode,
      reason: `Verifind escrow release: ${payment.propertyTitle || payment.propertyId}`,
      reference: `rel_${payment.reference}`,
    });

    await Promise.all([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'releasing',
          tenantConfirmedMoveIn: true,
          moveInConfirmedAt: new Date(),
          transferReference: transfer.reference || `rel_${payment.reference}`,
          recipientCode: agentBank.recipientCode,
        },
      }),
      prisma.property.update({
        where: { id: payment.propertyId },
        data: { status: 'rented' },
      }),
    ]);

    res.json({ success: true, message: 'Move-in confirmed. Funds are being released to the agent.' });
  } catch (err) {
    console.error('confirm-movein:', err.message);
    res.status(500).json({ message: err.message || 'Failed to confirm move-in' });
  }
});

// GET /api/payments
app.get('/api/payments', auth, async (req, res) => {
  try {
    const where = req.user.role === 'tenant'
      ? { tenantId: req.user.id }
      : { agentId: req.user.id };
    const payments = await prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// POST /api/payments/webhook
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.body).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.status(400).send('Bad signature');

    const event = JSON.parse(req.body.toString());
    console.log('Webhook event:', event.event);

    if (event.event === 'charge.success') {
      const ref = event.data?.reference;
      const payment = await prisma.payment.findUnique({ where: { reference: ref } });
      if (payment && payment.status === 'pending') {
        await Promise.all([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'confirmed', paystackData: event.data },
          }),
          prisma.property.update({
            where: { id: payment.propertyId },
            data: { status: 'under_offer' },
          }),
        ]);
      }
    }

    if (event.event === 'transfer.success') {
      const ref = event.data?.reference;
      const payment = await prisma.payment.findFirst({ where: { transferReference: ref } });
      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: 'released' } });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('webhook:', err.message);
    res.sendStatus(500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BANK ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/banks
app.get('/api/banks', auth, async (_req, res) => {
  try {
    const banks = await psGet('/bank?country=nigeria&perPage=100');
    res.json({ success: true, banks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch banks' });
  }
});

// POST /api/banks/verify-account
app.post('/api/banks/verify-account', auth, async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const data = await psGet(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
    res.json({ success: true, accountName: data.account_name });
  } catch (err) {
    res.status(400).json({ message: 'Could not verify account' });
  }
});

// POST /api/banks/setup
app.post('/api/banks/setup', auth, requireRole('agent'), async (req, res) => {
  try {
    const { bankCode, bankName, accountNumber, accountName } = req.body;
    if (!bankCode || !bankName || !accountNumber || !accountName)
      return res.status(400).json({ message: 'All bank fields are required' });

    const recipient = await psPost('/transferrecipient', {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    });

    const agentBank = await prisma.agentBank.upsert({
      where: { agentId: req.user.id },
      create: {
        agentId: req.user.id,
        bankCode, bankName, accountNumber, accountName,
        recipientCode: recipient.recipient_code,
      },
      update: {
        bankCode, bankName, accountNumber, accountName,
        recipientCode: recipient.recipient_code,
      },
    });

    res.json({ success: true, agentBank });
  } catch (err) {
    console.error('bank/setup:', err.message);
    res.status(500).json({ message: err.message || 'Failed to setup bank account' });
  }
});

// GET /api/banks/my
app.get('/api/banks/my', auth, requireRole('agent'), async (req, res) => {
  try {
    const agentBank = await prisma.agentBank.findUnique({ where: { agentId: req.user.id } });
    res.json({ success: true, agentBank });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bank details' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/admin/agents
app.get('/api/admin/agents', auth, requireRole('admin'), async (_req, res) => {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'agent' },
      select: {
        id: true, username: true, email: true, phone: true,
        businessName: true, isKycVerified: true, nin: true,
        driverLicenseUrl: true, cacDocUrl: true,
        isEmailVerified: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, agents });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

// PUT /api/admin/agents/:id/kyc
app.put('/api/admin/agents/:id/kyc', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isKycVerified: Boolean(req.body.approved) },
    });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update KYC' });
  }
});

// GET /api/admin/properties
app.get('/api/admin/properties', auth, requireRole('admin'), async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// PUT /api/admin/properties/:id/verify
app.put('/api/admin/properties/:id/verify', auth, requireRole('admin'), async (req, res) => {
  try {
    const { verified, verificationStage } = req.body;
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        isVerified: Boolean(verified),
        verificationStage: verificationStage || (verified ? 'verified' : 'listing_created'),
      },
    });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update verification' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// STATIC SERVE
// ═══════════════════════════════════════════════════════════════════════════
const DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(DIST));
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));

// ═══════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Verifind V2 — port ${PORT}`));
