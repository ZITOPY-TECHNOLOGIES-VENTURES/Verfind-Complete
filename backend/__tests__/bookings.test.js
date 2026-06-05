'use strict';
const request = require('supertest');
const { app } = require('../server');
const { __reset } = require('@prisma/client');
const { registerAndLogin } = require('./helpers/auth');

beforeEach(() => __reset());

/**
 * Regression guard for the "Invalid booking status" bug: the frontend sends
 * accepted / rescheduled / cancelled, and the backend must accept exactly those.
 * The old logic-only test passed while the real route rejected them — these
 * tests hit the real route, so the contract can't drift again unnoticed.
 */
async function setup() {
  const agent = await registerAndLogin(app, { username: 'Agent', email: 'agent@test.com', role: 'agent' });
  const tenant = await registerAndLogin(app, { username: 'Tenant', email: 'tenant@test.com', role: 'tenant' });
  const listing = await request(app).post('/api/properties').set('Authorization', `Bearer ${agent.token}`)
    .send({ title: 'Flat', district: 'Wuse', type: 'Two_bedroom', baseRent: '1000000', videoUrl: 'https://youtu.be/abc12345678' });
  const booking = await request(app).post('/api/bookings').set('Authorization', `Bearer ${tenant.token}`)
    .send({ propertyId: listing.body.property.id, requestedDate: '2026-07-01' });
  return { agent, tenant, propertyId: listing.body.property.id, bookingId: booking.body.booking.id };
}

describe('Booking lifecycle', () => {
  it('tenant can create a booking (201)', async () => {
    const { bookingId } = await setup();
    expect(bookingId).toBeTruthy();
  });

  it('agent cannot create a booking (403)', async () => {
    const agent = await registerAndLogin(app, { username: 'A', email: 'a@test.com', role: 'agent' });
    const r = await request(app).post('/api/bookings').set('Authorization', `Bearer ${agent.token}`)
      .send({ propertyId: 'x', requestedDate: '2026-07-01' });
    expect(r.status).toBe(403);
  });

  it('agent can ACCEPT a booking', async () => {
    const { agent, bookingId } = await setup();
    const r = await request(app).put(`/api/bookings/${bookingId}`).set('Authorization', `Bearer ${agent.token}`).send({ status: 'accepted' });
    expect(r.status).toBe(200);
    expect(r.body.booking.status).toBe('accepted');
  });

  it('agent can RESCHEDULE with a proposed date', async () => {
    const { agent, bookingId } = await setup();
    const r = await request(app).put(`/api/bookings/${bookingId}`).set('Authorization', `Bearer ${agent.token}`)
      .send({ status: 'rescheduled', proposedDate: '2026-08-15' });
    expect(r.status).toBe(200);
    expect(r.body.booking.status).toBe('rescheduled');
    expect(new Date(r.body.booking.requestedDate).toISOString().slice(0, 10)).toBe('2026-08-15');
  });

  it('agent can CANCEL a booking', async () => {
    const { agent, bookingId } = await setup();
    const r = await request(app).put(`/api/bookings/${bookingId}`).set('Authorization', `Bearer ${agent.token}`).send({ status: 'cancelled' });
    expect(r.status).toBe(200);
    expect(r.body.booking.status).toBe('cancelled');
  });

  it('rejects an unknown status (400)', async () => {
    const { agent, bookingId } = await setup();
    const r = await request(app).put(`/api/bookings/${bookingId}`).set('Authorization', `Bearer ${agent.token}`).send({ status: 'magic' });
    expect(r.status).toBe(400);
  });

  it('a different agent cannot act on the booking (403)', async () => {
    const { bookingId } = await setup();
    const other = await registerAndLogin(app, { username: 'Other', email: 'other@test.com', role: 'agent' });
    const r = await request(app).put(`/api/bookings/${bookingId}`).set('Authorization', `Bearer ${other.token}`).send({ status: 'accepted' });
    expect(r.status).toBe(403);
  });

  it('tenant sees their booking via GET /api/bookings', async () => {
    const { tenant } = await setup();
    const r = await request(app).get('/api/bookings').set('Authorization', `Bearer ${tenant.token}`);
    expect(r.status).toBe(200);
    expect(r.body.bookings).toHaveLength(1);
  });
});
