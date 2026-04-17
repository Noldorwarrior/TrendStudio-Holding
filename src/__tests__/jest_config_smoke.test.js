/**
 * Jest configuration smoke test.
 * Verifies that jest + jsdom env load correctly and that jest.config.js
 * testMatch picks up files in src/__tests__/. Permanent guard — do not remove.
 */

describe('jest config smoke', () => {
  it('jsdom env provides document/window', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('jest globals available (describe/it/expect/jest)', () => {
    expect(typeof jest).toBe('object');
    expect(typeof jest.fn).toBe('function');
  });

  it('loads package.json via require (CJS mode)', () => {
    const pkg = require('../../package.json');
    expect(pkg.devDependencies.jest).toBeDefined();
    expect(pkg.devDependencies['jest-environment-jsdom']).toBeDefined();
  });
});
