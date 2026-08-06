# ADR-008: Source import versioning

## Status
PROPOSED

## Context

The August 6 source bundles must not silently overwrite July canonical imports. The audit found changed, missing, and exact-match documents across the attached Hackathon and UI/UX bundles.

## Decision

Source import is versioned, provenance-preserving, and review-gated. Exact matches may be linked, changed content must be reviewed, and no silent overwrite is allowed.

## Decision details

Source identity:
- bundle name;
- logical source family;
- source hash;
- import timestamp;
- canonical status;
- imported status;
- supersession status.

Handling rules:
- exact-match documents can be linked to the canonical record;
- substantive differences must create a reviewed import candidate;
- archived operational state remains archived;
- duplicated bundles are retained for traceability;
- silent replacement is prohibited;
- human review is required before canon change.

Migration workflow for the 26 changed Hackathon documents and 23 changed UI/UX documents:
1. record the August bundle as a new import with hash and provenance;
2. classify each document as exact match, changed content, missing, or new;
3. retain July canonical versions unchanged;
4. create reviewed diff records for changed documents;
5. map changed documents to adapters or superseding records;
6. mark superseded documents explicitly;
7. preserve archived operational state and prior bundle identity;
8. require human review before any canonical promotion.

Failure behavior:
- if source identity is ambiguous, stop and ask for review;
- if a canonical record would be overwritten, block the import;
- if hashes differ, treat the change as substantive until reviewed.

## Alternatives considered

- Overwrite older imports with the latest bundle: rejected because it erases provenance.
- Merge bundles automatically by filename: rejected because filenames alone are not authoritative.

## Consequences

### Positive

- Full provenance trail.
- Safer historical comparison.
- Clear review workflow.

### Negative

- More import bookkeeping.
- More review overhead.

### Risks

- High-volume changed imports may take time to reconcile.
- Incomplete source metadata could delay adoption.

## Compatibility and migration

July canonical imports remain stable. August imports land beside them as reviewed candidates until promoted. Existing consumers continue to read canonical records through adapters.

## Validation criteria

- No silent overwrite is possible.
- Exact matches are handled differently from substantive changes.
- Every canonical promotion has provenance and review.

## Open questions

- Whether source hashes should be stored at document and bundle levels.
- Whether archive retention is time-based or forever.

## Source evidence

- Audit inventory of the August 6 Hackathon and UI/UX bundles.
- Repository canonicalization report and source manifest.
