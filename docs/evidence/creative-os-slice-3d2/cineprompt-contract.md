# CinePrompt Contract

## Approved Endpoint
`POST https://cineprompt.io/api/share`

Hard-bound in `CINEPROMPT_SHARE_ENDPOINT` constant. Not configurable at runtime.

## Request Structure
Structured `CinePromptShareInput` payload:
- `media_type`, `subjectType`, `subject`, `staging`, `shot`, `lens`, `camera`, `lighting`, `mood`

## Expected Response
```json
{
  "share_url": "https://cineprompt.io/share/<id>",
  "share_id": "<id>",
  "created_at": "<iso-timestamp>"
}
```

## Response Validation
- `share_url` must be a string
- `share_url` must start with `https://cineprompt.io/` or `https://share.cineprompt.io/`
- Malformed or unexpected payload → `INVALID_RESPONSE`

## Artifact Classification
`EXTERNAL_SHARE_REFERENCE` — not assumed PRIVATE, DELETABLE, or REVOCABLE.

## Error Taxonomy
`SECRET_REQUIRED` | `AUTHENTICATION_FAILED` | `AUTHORIZATION_FAILED` | `SUBSCRIPTION_REQUIRED` | `RATE_LIMITED` | `INVALID_REQUEST` | `INVALID_RESPONSE` | `TIMEOUT` | `NETWORK_ERROR` | `PROVIDER_UNAVAILABLE` | `PROVIDER_ERROR` | `PROVIDER_OUTCOME_UNKNOWN` | `PRIVACY_BLOCKED`
