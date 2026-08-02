'use strict';
/**
 * In-memory mock of @prisma/client used by the integration tests.
 *
 * The point of these tests is to exercise the REAL Express routes in server.js
 * (auth, role guards, request/response shape, status contracts) without needing
 * a live PostgreSQL. This mock implements just enough of the Prisma query API
 * that server.js relies on: findUnique / findFirst / findMany / create / update /
 * delete / count / upsert, plus the where-operators the routes use
 * (equality, OR, contains, gte/lte, in, and composite unique keys).
 */

const crypto = require('crypto');

const MODELS = ['user', 'property', 'booking', 'payment', 'agentBank', 'favorite', 'pendingReg', 'tenantRequest'];
const store = {};
function reset() { MODELS.forEach(m => { store[m] = []; }); }
reset();

function uuid() { return crypto.randomUUID(); }

// Does a single record satisfy one where-clause value?
function fieldMatches(recordVal, cond) {
  if (cond === null || typeof cond !== 'object') return recordVal === cond;
  // operator object: { gte, lte, contains, in, mode, equals }
  if ('equals' in cond) return recordVal === cond.equals;
  let ok = true;
  if ('in' in cond) ok = ok && Array.isArray(cond.in) && cond.in.includes(recordVal);
  if ('gte' in cond) ok = ok && recordVal >= cond.gte;
  if ('lte' in cond) ok = ok && recordVal <= cond.lte;
  if ('contains' in cond) {
    const hay = cond.mode === 'insensitive' ? String(recordVal ?? '').toLowerCase() : String(recordVal ?? '');
    const needle = cond.mode === 'insensitive' ? String(cond.contains).toLowerCase() : String(cond.contains);
    ok = ok && hay.includes(needle);
  }
  return ok;
}

function matches(record, where = {}) {
  return Object.entries(where).every(([key, val]) => {
    if (key === 'OR') return val.some(sub => matches(record, sub));
    if (key === 'AND') return val.every(sub => matches(record, sub));
    // composite unique key like tenantId_propertyId: { tenantId, propertyId }
    if (val && typeof val === 'object' && !Array.isArray(val) && key.includes('_') && !('contains' in val) && !('gte' in val) && !('lte' in val) && !('in' in val) && !('equals' in val)) {
      return Object.entries(val).every(([k, v]) => record[k] === v);
    }
    return fieldMatches(record[key], val);
  });
}

function applyOrderBy(rows, orderBy) {
  if (!orderBy) return rows;
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const clause of clauses) {
      const [field, dir] = Object.entries(clause)[0];
      if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
      if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
    }
    return 0;
  });
}

function makeDelegate(model) {
  const rows = () => store[model];
  return {
    findUnique: async ({ where }) => rows().find(r => matches(r, where)) || null,
    findFirst:  async ({ where }) => rows().find(r => matches(r, where || {})) || null,
    findMany:   async ({ where, orderBy, skip = 0, take } = {}) => {
      let res = rows().filter(r => matches(r, where || {}));
      res = applyOrderBy(res, orderBy);
      if (skip) res = res.slice(skip);
      if (take != null) res = res.slice(0, take);
      return res.map(r => ({ ...r }));
    },
    count: async ({ where } = {}) => rows().filter(r => matches(r, where || {})).length,
    create: async ({ data }) => {
      const now = new Date();
      const rec = { id: data.id || uuid(), createdAt: now, updatedAt: now, ...data };
      rows().push(rec);
      return { ...rec };
    },
    update: async ({ where, data }) => {
      const rec = rows().find(r => matches(r, where));
      if (!rec) throw new Error(`Record to update not found in ${model}`);
      for (const [k, v] of Object.entries(data)) {
        if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && ('increment' in v || 'decrement' in v)) {
          rec[k] = (rec[k] || 0) + (v.increment || 0) - (v.decrement || 0);
        } else {
          rec[k] = v;
        }
      }
      rec.updatedAt = new Date();
      return { ...rec };
    },
    delete: async ({ where }) => {
      const i = rows().findIndex(r => matches(r, where));
      if (i === -1) throw new Error(`Record to delete not found in ${model}`);
      return rows().splice(i, 1)[0];
    },
    deleteMany: async ({ where } = {}) => {
      const before = rows().length;
      store[model] = rows().filter(r => !matches(r, where || {}));
      return { count: before - store[model].length };
    },
    upsert: async ({ where, create, update }) => {
      const rec = rows().find(r => matches(r, where));
      if (rec) { Object.assign(rec, update, { updatedAt: new Date() }); return { ...rec }; }
      const now = new Date();
      const created = { id: uuid(), createdAt: now, updatedAt: now, ...create };
      rows().push(created);
      return { ...created };
    },
  };
}

class PrismaClient {
  constructor() {
    MODELS.forEach(m => { this[m] = makeDelegate(m); });
  }
  async $disconnect() {}
}

module.exports = { PrismaClient, __store: store, __reset: reset };
