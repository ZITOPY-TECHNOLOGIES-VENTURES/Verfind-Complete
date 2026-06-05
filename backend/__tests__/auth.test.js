'use strict';
const request = require('supertest');
const { app } = require('../server');
const { __reset, __store } = require('@prisma/client');

beforeEach(() => __reset());

describe('POST /api/auth/send-otp', () => {
  it('400 when required fields missing', async () => {
    const r = await request(app).post('/api/auth/send-otp').send({ email: 'a@b.com' });
    expect(r.status).toBe(400);
  });

  it('200 + creates a pending registration on valid input', async () => {
    const r = await request(app).post('/api/auth/send-otp')
      .send({ username: 'Ada', email: 'ada@test.com', password: 'password123', role: 'tenant' });
    expect(r.status).toBe(200);
    expect(__store.pendingReg).toHaveLength(1);
    expect(__store.pendingReg[0].otp).toMatch(/^\d{6}$/);
  });

  it('409 when email already registered', async () => {
    await __store.user.push({ id: 'u1', email: 'dup@test.com', password: 'x', role: 'tenant', isEmailVerified: true });
    const r = await request(app).post('/api/auth/send-otp')
      .send({ username: 'D', email: 'dup@test.com', password: 'password123' });
    expect(r.status).toBe(409);
  });

  it('never grants admin role via registration', async () => {
    await request(app).post('/api/auth/send-otp')
      .send({ username: 'X', email: 'x@test.com', password: 'password123', role: 'admin' });
    expect(__store.pendingReg[0].role).toBe('tenant');
  });
});

describe('POST /api/auth/verify-email', () => {
  it('400 when no pending registration', async () => {
    const r = await request(app).post('/api/auth/verify-email').send({ email: 'none@test.com', otp: '123456' });
    expect(r.status).toBe(400);
  });

  it('400 on wrong OTP and increments attempts', async () => {
    await request(app).post('/api/auth/send-otp').send({ username: 'A', email: 'a@test.com', password: 'password123' });
    const r = await request(app).post('/api/auth/verify-email').send({ email: 'a@test.com', otp: '000000' });
    expect(r.status).toBe(400);
    expect(__store.pendingReg[0].attempts).toBe(1);
  });

  it('200 + token + creates verified user on correct OTP', async () => {
    await request(app).post('/api/auth/send-otp').send({ username: 'A', email: 'a@test.com', password: 'password123' });
    const otp = __store.pendingReg[0].otp;
    const r = await request(app).post('/api/auth/verify-email').send({ email: 'a@test.com', otp });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeTruthy();
    expect(r.body.user.isEmailVerified).toBe(true);
    expect(r.body.user.password).toBeUndefined();   // never leak password
    expect(__store.pendingReg).toHaveLength(0);      // pending cleared
  });
});

describe('POST /api/auth/login', () => {
  async function seedVerified() {
    await request(app).post('/api/auth/send-otp').send({ username: 'A', email: 'a@test.com', password: 'password123' });
    const otp = __store.pendingReg[0].otp;
    await request(app).post('/api/auth/verify-email').send({ email: 'a@test.com', otp });
  }

  it('401 on wrong password', async () => {
    await seedVerified();
    const r = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'wrong' });
    expect(r.status).toBe(401);
  });

  it('401 on unknown email', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'ghost@test.com', password: 'password123' });
    expect(r.status).toBe(401);
  });

  it('200 + token on valid credentials', async () => {
    await seedVerified();
    const r = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'password123' });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeTruthy();
    expect(r.body.user.password).toBeUndefined();
  });

  it('403 when email not verified', async () => {
    const bcrypt = require('bcryptjs');
    __store.user.push({ id: 'u9', username: 'U', email: 'u@test.com', password: await bcrypt.hash('password123', 12), role: 'tenant', isEmailVerified: false });
    const r = await request(app).post('/api/auth/login').send({ email: 'u@test.com', password: 'password123' });
    expect(r.status).toBe(403);
  });
});
