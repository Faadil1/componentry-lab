# Failure Model

## Overview
The Sandbox treats execution failures (e.g. network errors, external rejection) as deterministic bounds, not system panics.

## Invariant
A failed execution (`PROVIDER_ERROR`) must still return a receipt containing the correct `executionIntentFingerprint` so it is permanently logged, but its `providerOutputFingerprint` must be strictly `null`.

## Evidence
Test 12 configures a simulated failure. The result status becomes `PROVIDER_ERROR` and the returned receipt explicitly lacks fabricated outputs. Project Brain remains unmodified (Test 11).
