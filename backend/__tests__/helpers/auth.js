'use strict';
const request = require('supertest');

/**
 * Registers a user through the REAL send-otp → verify-email routes (reading the
 * OTP back out of the mock store), returning { token, user }. Exercises the full
 * registration path rather than seeding the DB directly.
 */
async function registerAndLogin(app, { username, email, password = 'password123', role = 'tenant' }) {
  const store = require('@prisma/client').__store;

  await request(app).post('/api/auth/send-otp')
    .send({ username, email, password, role })
    .expect(200);

  const pending = store.pendingReg.find(p => p.email === email);
  if (!pending) throw new Error('registerAndLogin: no pending registration created');

  const res = await request(app).post('/api/auth/verify-email')
    .send({ email, otp: pending.otp })
    .expect(200);

  return { token: res.body.token, user: res.body.user };
}

module.exports = { registerAndLogin };
