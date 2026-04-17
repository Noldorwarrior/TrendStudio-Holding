/**
 * Jest config for Phase 2C cinematic tests and i18n symmetry test.
 *
 * Mixed runner mode approved by Cowork 2026-04-17:
 * - This jest config ONLY picks up Phase 2C new tests.
 * - Phase 2A/2B tests (src/*.test.js, src/charts/*.test.js, src/controls.test.js,
 *   src/drilldown.test.js) run via scripts/run-legacy-tests.js and are explicitly
 *   excluded here via testPathIgnorePatterns.
 *
 * Full migration of Phase 2A/2B to jest — deferred Chore-PR after Wave 6.
 * See: Handoff_Phase2C/00_infra/INFRA_PROMPT.md §10.1
 */

module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/cinematic/__tests__/*.test.js',
    '<rootDir>/src/slides/__tests__/*.test.js',
    '<rootDir>/src/__tests__/*.test.js',
    '<rootDir>/qa/__tests__/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Exclude legacy Phase 2A/2B tests (handled by scripts/run-legacy-tests.js)
    '<rootDir>/src/components.test.js',
    '<rootDir>/src/charts.test.js',
    '<rootDir>/src/charts/.*\\.test\\.js',
    '<rootDir>/src/controls.test.js',
    '<rootDir>/src/drilldown.test.js',
    '<rootDir>/tests/e2e_phase2b.js'
  ],
  verbose: false,
  moduleFileExtensions: ['js', 'json'],
  // Shared helpers live in src/cinematic/__tests__/test-helpers.js; not transpiled
  transform: {}
};
