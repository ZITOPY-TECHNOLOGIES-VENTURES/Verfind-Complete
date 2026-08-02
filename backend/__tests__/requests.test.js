'use strict';
const request = require('supertest');
const { app } = require('../server');
const { __reset } = require('@prisma/client');
const { registerAndLogin } = require('./helpers/auth');

beforeEach(() => __reset());

describe('Tenant Property Requests API', () => {
  it('allows a tenant to submit a property request', async () => {
    const { token, user } = await registerAndLogin(app, { username: 'Tenant1', email: 'tenant1@test.com', role: 'tenant' });
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        preferredLocation: 'Maitama',
        budget: 2500000,
        propertyType: 'Two_bedroom',
        notes: 'Needs reliable water supply',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.request.preferredLocation).toBe('Maitama');
    expect(res.body.request.budget).toBe(2500000);
    expect(res.body.request.tenantId).toBe(user.id);
  });

  it('rejects property request when missing mandatory fields', async () => {
    const { token } = await registerAndLogin(app, { username: 'Tenant2', email: 'tenant2@test.com', role: 'tenant' });
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        preferredLocation: '',
        budget: null,
      });

    expect(res.status).toBe(400);
  });

  it('fetches property requests for authenticated users', async () => {
    const { token: tenantToken } = await registerAndLogin(app, { username: 'Tenant3', email: 'tenant3@test.com', role: 'tenant' });
    await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        preferredLocation: 'Gwarinpa',
        budget: 1200000,
        propertyType: 'Self_contain',
      });

    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${tenantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requests).toHaveLength(1);
    expect(res.body.requests[0].preferredLocation).toBe('Gwarinpa');
  });
});
