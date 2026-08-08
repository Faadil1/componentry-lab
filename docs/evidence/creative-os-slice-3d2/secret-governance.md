# Secret Governance

## Secret Name
`CINEPROMPT_API_KEY`

## Rules (All Enforced)

| Rule | Status |
|---|---|
| Never committed to source control | ✅ ENFORCED |
| Never placed in fixtures | ✅ ENFORCED |
| Never snapshotted | ✅ ENFORCED |
| Never logged | ✅ ENFORCED |
| Never included in errors | ✅ ENFORCED (error messages use code only) |
| Never included in receipts | ✅ ENFORCED |
| Never included in continuation | ✅ ENFORCED |
| Never included in fingerprints | ✅ ENFORCED |

## SECRET_REQUIRED Behavior
If `CINEPROMPT_API_KEY` is absent or empty:
- Adapter returns `BLOCKED` with code `SECRET_REQUIRED`
- Transport call count: 0
- Network calls: 0

## Test Proof
Tests 18, 19, 20 assert that `process.env.CINEPROMPT_API_KEY` value does not appear anywhere in serialized execution results, error outputs, or continuation provenance.

## Real Key Values Observed by Automated Tests
**0** — Tests use the literal string `"test-key-placeholder"` which is not a real key.
