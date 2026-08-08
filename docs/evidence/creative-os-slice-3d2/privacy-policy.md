# Privacy Policy

## Scope
Narrow pilot policy. Not a universal DLP system.

## Blocked Content Categories (Pilot)

| Category | Detection Method |
|---|---|
| Credentials / secrets | Pattern: `api[_-]?key`, `secret`, `password`, `token`, `bearer`, `auth` |
| Personal identifiers | Email regex, phone regex, `SSN` |
| Client confidential | Pattern: `confidential`, `client confidential` |
| Proprietary markers | Pattern: `proprietary`, `internal use only` |
| Private user assets | Pattern: `unreleased`, (planned) |

## Behavior When Blocked
- Adapter returns `BLOCKED` with code `PRIVACY_BLOCKED`
- Transport call count: 0
- No network call made

## Pilot Input Policy
- Synthetic content only
- No PII required in prompt
- Inputs are Creative OS project metadata only (subjectType, shot, lens, camera, mood, etc.)

## Test Proof
Test 6 injects a `cinepromptInput.subject` containing `api_key=sk-12345 secret credentials embedded` and verifies `PRIVACY_BLOCKED` is returned with zero transport calls.
