# Network Policy

## Endpoint Binding
Production transport is hard-bound to:
`https://cineprompt.io/api/share`

This is a `const` in `cineprompt-transport.ts`. It cannot be overridden at runtime.
No URL may be supplied by Project Brain or external input.

## Method
`POST` only.

## Timeout
10 000ms. Non-configurable. AbortController enforced.

## Retry Policy
**No automatic retries.** Per spec:
- Timeout → `TIMEOUT` → no retry
- Network error before request → `NETWORK_ERROR` → no retry
- Uncertain outcome → `PROVIDER_OUTCOME_UNKNOWN` → no retry

## Redirect Policy
No redirect following. CinePrompt endpoint must respond at the bound URL.

## CI / Automated Test Policy
All automated tests (`npm run test`, `npm run build`, `npm run lint`, `npx tsc --noEmit`) use `FakeCinePromptTransport`.
Real HTTP calls: **0**.

## Test Proof (Tripwire)
Test 23 calls `getRealHttpCallCount()` and asserts it equals 0.
Test 24 imports `CINEPROMPT_SHARE_ENDPOINT` and verifies it equals `"https://cineprompt.io/api/share"`.
