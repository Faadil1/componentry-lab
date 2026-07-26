# AI33 Film Kit Integration Status

## Official contract used
- Base URL: `https://api.ai33.pro`
- Authentication header: `xi-api-key`
- Authentication value: raw `AI33_API_KEY` from the server-only environment
- Voices endpoint: `GET /v3/voices`
- Narration endpoint: `POST /v3/text-to-speech`
- Task polling endpoint: `GET /v1/task/:task_id`

## Voices contract
- Required query parameter: `provider`
- Allowed providers: `elevenlabs`, `minimax`, `clone`, `edge`, `kokoro`, `vbee`, `fishaudio`
- Local UI only forwards: `provider`, `q`, `language`, `gender`, `page`, `page_size`
- Local `page_size` cap: `100`
- Success shape consumed locally:
  - `success`
  - `format_version`
  - `data[]`
  - `pagination`
- Voice fields normalized locally:
  - `voiceId`
  - `name`
  - `language`
  - `gender`
  - `tags`
  - `previewUrl`

## TTS contract
- Body type: `multipart/form-data`
- Fields used locally:
  - `text`
  - `voice_id`
  - `speed`
  - `with_transcript`
- Local browser input is restricted to:
  - `text`
  - `voiceId`
  - `speed`
  - `withTranscript`
  - `approved`
- Local restrictions:
  - text must be non-empty
  - text is capped at 500 characters for the controlled Film Kit test
  - voiceId must use a documented provider prefix
  - speed must be between `0.5` and `1.5`
  - approval must be explicitly checked
  - no webhook, filename, or dictionary id is accepted from the browser in this pass
- Success shape consumed locally:
  - `success`
  - `task_id`

## Task model
- Asynchronous task polling is used.
- Local polling route forwards `GET /v1/task/:task_id`.
- Documented statuses used locally:
  - `doing`
  - `done`
  - `error`
- Consumed task fields:
  - `id`
  - `status`
  - `progress`
  - `error_message`
  - `credit_cost`
  - `type`
  - `metadata.audio_url`
  - `metadata.srt_url`
  - `metadata.json_url`

## Security controls
- AI33 API key stays server-side.
- No `NEXT_PUBLIC` key is used.
- No browser-controlled upstream URL is accepted.
- No automatic request on page load.
- No automatic retry.
- `Cache-Control: no-store` is applied to AI33 proxy routes.
- Upstream errors are normalized before returning to the browser.

## Remaining undocumented items
- TTS-specific rate limits.
- Exact credit pricing.
- Complete TTS error schema.
- Webhook signature details.