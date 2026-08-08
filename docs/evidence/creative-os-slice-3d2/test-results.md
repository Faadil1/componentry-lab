# Test Results

## CinePrompt Pilot Test Suite (3D.2)
- File: `tests/creative-os-cineprompt.test.ts`
- Direct test count: 29
- Passed: 29
- Failed: 0
- Skipped: 0
- Placeholder tests (`assert.ok(true)` proxies): 0
- Real HTTP requests: 0

## Test Names
1. missing secret → SECRET_REQUIRED, zero transport calls
2. invalid approval → sandbox blocks, zero adapter calls
3. stale Project Brain / stale plan → PLAN_STALE, zero calls
4. insufficient authority (PREPARE) → AUTHORITY_BLOCKED, zero calls
5. cost blocked (UNKNOWN incremental cost for PRODUCTION) → COST_BLOCKED, zero calls
6. privacy blocked → BLOCKED with PRIVACY_BLOCKED, zero transport calls
7. wrong provider adapter in approval → APPROVAL_INVALID, zero calls
8. valid mocked response → EXECUTED, share URL in receipt
9. malformed response → FAILED with INVALID_RESPONSE
10. 401 → AUTHENTICATION_FAILED
11. 403 subscription condition → SUBSCRIPTION_REQUIRED
12. 429 rate limit → RATE_LIMITED
13. timeout → TIMEOUT
14. network failure before request accepted → NETWORK_ERROR
15. uncertain network outcome → PROVIDER_OUTCOME_UNKNOWN in error
16. PROVIDER_OUTCOME_UNKNOWN → no automatic retry (callCount stays 1)
17. duplicate execution intent → ALREADY_EXECUTED, one transport call only
18. secret absent from receipt
19. secret absent from errors
20. secret absent from continuation provenance
21. Project Brain immutable after successful execution
22. Project Brain immutable after provider error
23. full automated suite → zero real HTTP requests (tripwire)
24. production endpoint is fixed — arbitrary URL injection impossible
25. CinePrompt adapter existence does NOT change resource lifecycle state
26. production adapter NOT auto-registered in test environment
27. approval binding capabilityId mismatch → APPROVAL_INVALID, zero calls
28. continuation provenance: all required fields recorded after mock success
29. PROVIDER_OUTCOME_UNKNOWN → providerOutputFingerprint not fabricated

## Full Suite Count
179 (3D.1 baseline) + 29 (3D.2) = **208 tests**
Pass: 208 · Fail: 0 · Skipped: 0
