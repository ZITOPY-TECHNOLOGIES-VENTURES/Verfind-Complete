'use strict';
/**
 * Runs before server.js is required. Sets the env vars server.js needs at load
 * time, and stubs global.fetch so no real Paystack/Brevo network calls happen.
 */

process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.BREVO_API_KEY = 'brevo-dummy';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

// Smart fetch stub keyed on URL — returns plausible Paystack/Brevo payloads.
global.fetch = jest.fn(async (url) => {
  const u = String(url);
  const json = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) });

  if (u.includes('api.brevo.com')) return json({ messageId: 'mock' });

  if (u.includes('/transaction/initialize')) {
    return json({ status: true, data: { authorization_url: 'https://paystack.test/pay/mock', reference: 'mockref', access_code: 'mock' } });
  }
  if (u.includes('/transaction/verify/')) {
    return json({ status: true, data: { status: 'success', amount: 100000, reference: u.split('/').pop() } });
  }
  if (u.includes('/transferrecipient')) {
    return json({ status: true, data: { recipient_code: 'RCP_mock' } });
  }
  if (u.includes('/transfer')) {
    return json({ status: true, data: { reference: 'rel_mock', status: 'success' } });
  }
  if (u.includes('/bank/resolve')) {
    return json({ status: true, data: { account_name: 'MOCK ACCOUNT NAME', account_number: '0123456789' } });
  }
  if (u.includes('/bank')) {
    return json({ status: true, data: [{ name: 'Mock Bank', code: '001' }] });
  }
  return json({ status: true, data: {} });
});
