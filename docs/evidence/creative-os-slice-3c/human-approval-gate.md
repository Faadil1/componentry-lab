# Slice 3C — Human Approval Gate

## States
- `NOT_REQUIRED`
- `REQUIRED`
- `GRANTED`
- `DENIED`

## Invariant
The production path in Slice 3C may emit `humanApprovalState: "REQUIRED"`, but NEVER transitions itself to `GRANTED`. Human approval requires explicit external input.
