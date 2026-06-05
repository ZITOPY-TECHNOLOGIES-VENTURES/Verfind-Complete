'use strict';
/**
 * Custom Jest environment.
 *
 * Node 22.4+/25 expose an experimental `localStorage`/`sessionStorage` global
 * that throws ("Cannot initialize local storage without a --localstorage-file
 * path") the moment it's accessed. Jest's global handling touches it, which
 * crashes every suite. We don't use web storage in backend tests, so we replace
 * those globals with harmless in-memory stubs — no Node flags required, works on
 * any Node version.
 */
const { TestEnvironment } = require('jest-environment-node');

function memoryStorage() {
  let s = Object.create(null);
  return {
    getItem: k => (k in s ? s[k] : null),
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: k => { delete s[k]; },
    clear: () => { s = Object.create(null); },
    key: i => Object.keys(s)[i] ?? null,
    get length() { return Object.keys(s).length; },
  };
}

class NoWebStorageEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    Object.defineProperty(this.global, 'localStorage', { configurable: true, value: memoryStorage() });
    Object.defineProperty(this.global, 'sessionStorage', { configurable: true, value: memoryStorage() });
  }
}

module.exports = NoWebStorageEnvironment;
