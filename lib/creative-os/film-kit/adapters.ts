/**
 * Test-only execution adapters.
 * In Slice 3C, provider execution is NOT reachable from the production path.
 * See tests/support/mock-provider.ts for test-only mock provider infrastructure.
 */
export const IS_PRODUCTION_EXECUTION_ENABLED = false
