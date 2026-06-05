'use strict';
const request = require('supertest');
const { app } = require('../server');
const { __reset, __store } = require('@prisma/client');
const { registerAndLogin } = require('./helpers/auth');

beforeEach(() => __reset());

const LISTING = {
  title: '2 Bed in Wuse', district: 'Wuse', type: 'Two_bedroom',
  baseRent: '1500000', videoUrl: 'https://youtu.be/abc12345678',
};

describe('GET /api/stats', () => {
  it('returns real counts from the data', async () => {
    __store.property.push({ id: 'p1', status: 'available', isVerified: true, agentId: 'a1' });
    __store.property.push({ id: 'p2', status: 'rented', isVerified: false, agentId: 'a1' });
    __store.user.push({ id: 'a1', role: 'agent', isKycVerified: true, email: 'x', isEmailVerified: true });
    const r = await request(app).get('/api/stats');
    expect(r.status).toBe(200);
    expect(r.body.stats).toEqual({ activeListings: 1, verifiedProperties: 1, certifiedAgents: 1 });
  });

  it('is public (no auth required)', async () => {
    const r = await request(app).get('/api/stats');
    expect(r.status).toBe(200);
  });
});

describe('POST /api/properties (role + validation)', () => {
  it('403 for a tenant', async () => {
    const { token } = await registerAndLogin(app, { username: 'T', email: 't@test.com', role: 'tenant' });
    const r = await request(app).post('/api/properties').set('Authorization', `Bearer ${token}`).send(LISTING);
    expect(r.status).toBe(403);
  });

  it('401 with no token', async () => {
    const r = await request(app).post('/api/properties').send(LISTING);
    expect(r.status).toBe(401);
  });

  it('201 for an agent with valid data', async () => {
    const { token } = await registerAndLogin(app, { username: 'A', email: 'a@test.com', role: 'agent' });
    const r = await request(app).post('/api/properties').set('Authorization', `Bearer ${token}`).send(LISTING);
    expect(r.status).toBe(201);
    expect(r.body.property.title).toBe(LISTING.title);
  });

  it('400 when the mandatory video walkthrough is missing', async () => {
    const { token } = await registerAndLogin(app, { username: 'A', email: 'a@test.com', role: 'agent' });
    const r = await request(app).post('/api/properties').set('Authorization', `Bearer ${token}`).send({ ...LISTING, videoUrl: '' });
    expect(r.status).toBe(400);
  });
});

describe('Property listing + ownership', () => {
  it('GET /api/properties lists created listings', async () => {
    const { token } = await registerAndLogin(app, { username: 'A', email: 'a@test.com', role: 'agent' });
    await request(app).post('/api/properties').set('Authorization', `Bearer ${token}`).send(LISTING);
    const r = await request(app).get('/api/properties');
    expect(r.status).toBe(200);
    expect(r.body.properties).toHaveLength(1);
    expect(r.body.total).toBe(1);
  });

  it('an agent cannot delete another agent\'s listing', async () => {
    const a1 = await registerAndLogin(app, { username: 'A1', email: 'a1@test.com', role: 'agent' });
    const created = await request(app).post('/api/properties').set('Authorization', `Bearer ${a1.token}`).send(LISTING);
    const a2 = await registerAndLogin(app, { username: 'A2', email: 'a2@test.com', role: 'agent' });
    const r = await request(app).delete(`/api/properties/${created.body.property.id}`).set('Authorization', `Bearer ${a2.token}`);
    expect(r.status).toBe(403);
  });
});
