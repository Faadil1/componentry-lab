# YouTube OS Persistence — Environment Setup

**Status:** Foundation only (no live database required for build/tests)

---

## Current State

The persistence layer is implemented but uses a **mock repository** for all tests and local development. You can build, test, and run Componentry Lab without setting up a database.

---

## Architecture

**Two implementations:**

1. **Mock Repository** (`createMockRepository()`)
   - In-memory, no database needed
   - Used for all current tests
   - Used for local development without DATABASE_URL
   - Suitable for design/validation

2. **Live Repository** (`createEpisodeRepository(sql)`)
   - Uses Neon Postgres (or any PostgreSQL provider)
   - Optimistic locking for concurrent writes
   - Idempotency key deduplication
   - Append-only event audit trail
   - Only needed when integrating n8n

---

## For Development (No Setup Required)

### Building

```bash
npm run build
```

- ✅ Works without DATABASE_URL
- ✅ Tests run against mock repository
- ✅ Existing /youtube routes work with fixture provider

### Running Tests

```bash
# Repository tests (mock, no DB)
npm run test:episode-repository

# All existing tests
npm run test:episode-state-adapter
npm run test:youtube-provider
npm run test:director
```

- ✅ All pass without Neon account
- ✅ Mock repository tests semantic guarantees (locking, idempotency)

---

## For Neon Integration (Future)

When you're ready to persist episodes to a real database:

### 1. Create Neon Postgres Account

- Visit https://neon.tech
- Sign up (free tier available)
- Create a new project/database
- Copy the connection string

### 2. Set Environment Variable

```bash
# .env.local (development)
DATABASE_URL=postgresql://user:password@host/dbname

# Or Vercel deployment secrets
# Add DATABASE_URL in Vercel dashboard
```

**Important:** Never commit DATABASE_URL to git.

### 3. Run Migrations

```bash
# After setting DATABASE_URL:
node scripts/run-migrations.ts
```

(Migration script not yet created; see "Remaining Steps" below)

### 4. Switch to Live Repository

In `lib/youtube/get-episode-state.ts` (future), replace mock with:

```typescript
import postgres from "postgres"
import { createEpisodeRepository } from "../persistence/episode-repository"

const sql = postgres(process.env.DATABASE_URL!)
const repository = createEpisodeRepository(sql)

export async function getEpisodeState(episodeId: string) {
  return repository.getEpisodeById(episodeId)
}
```

### 5. Run Live Database Tests

If you add integration tests for live Postgres:

```bash
# Requires DATABASE_URL to be set
npm run test:episode-repository:live
```

(Not yet implemented)

---

## Schema

### episodeTable

```sql
CREATE TABLE episodes (
  episode_id TEXT PRIMARY KEY,
  episode_number INTEGER,
  channel_name TEXT NOT NULL,
  title TEXT NOT NULL,
  workflow_state TEXT NOT NULL,
  review_status TEXT NOT NULL,
  blockers JSONB NOT NULL DEFAULT '[]',
  latest_decision JSONB,
  youtube_video_id TEXT,
  published_at TIMESTAMPTZ,
  schema_version INTEGER NOT NULL DEFAULT 1,
  state_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `episode_id` (PK)
- `workflow_state`
- `(channel_name, episode_number)`
- `published_at DESC NULLS LAST`

### episode_events Table

```sql
CREATE TABLE episode_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL REFERENCES episodes(episode_id),
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  payload JSONB,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `event_id` (PK)
- `(episode_id, created_at DESC)`
- `event_type`
- `idempotency_key`

---

## Repository API

### Types

```typescript
interface CanonicalEpisode {
  episodeId: string
  episodeNumber?: number
  channelName: string
  title: string
  workflowState: string
  reviewStatus: "not-required" | "pending" | "in-progress" | "completed"
  blockers: CanonicalBlocker[]
  latestDecision?: CanonicalDecision
  youtubeVideoId?: string
  publishedAt?: string
  schemaVersion: number
  stateVersion: number              // For optimistic locking
  createdAt: string
  updatedAt: string
}

interface CanonicalBlocker {
  id: string                         // Stable ID
  code: string
  label: string
  severity: "low" | "medium" | "high"
  source: string
  createdAt: string
  resolvedAt?: string
}

interface CanonicalDecision {
  outcome: "pass" | "pass-with-conditions" | "rework" | "stop"
  decidedBy: string
  decidedAt: string
  notes?: string
}
```

### Methods

```typescript
interface EpisodeRepository {
  // Retrieve
  getEpisodeById(episodeId: string): Promise<CanonicalEpisode | null>
  listEpisodes(): Promise<CanonicalEpisode[]>
  getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]>

  // Create
  createEpisode(input: CreateEpisodeInput): Promise<CanonicalEpisode>
  createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent>

  // Update (with optimistic locking)
  updateEpisodeState(input: UpdateEpisodeStateInput): Promise<OptimisticLockResult>
}
```

---

## Optimistic Locking

The `updateEpisodeState` method implements conflict detection:

```typescript
// Caller reads current state
const episode = await repo.getEpisodeById("episode-014")
// episode.stateVersion = 5

// Caller prepares update
const result = await repo.updateEpisodeState({
  episodeId: "episode-014",
  expectedStateVersion: 5,
  workflowState: "QA"
})

// Result types:
// {
//   success: true,
//   expectedVersion: 5,
//   actualVersion: 6              // Incremented after update
// }
//
// OR
//
// {
//   success: false,
//   expectedVersion: 5,
//   actualVersion: 7,              // Actual current version
//   reason: "conflict"             // Another writer won
// }
```

**Semantics:**
- No locks needed (optimistic approach)
- Every successful write increments `state_version`
- Concurrent writes with stale versions fail safely
- Caller must retry with fresh read

---

## Idempotency

For operations that might retry (n8n workflows), provide `idempotencyKey`:

```typescript
const event = await repo.createEpisodeEvent({
  episodeId: "episode-014",
  eventType: "STATE_CHANGED",
  actor: "n8n",
  toState: "QA",
  idempotencyKey: "n8n-exec-abc123"  // Unique per operation
})

// If n8n retries with same key:
const retry = await repo.createEpisodeEvent({
  // ...same fields...
  idempotencyKey: "n8n-exec-abc123"  // Same key
})

// Mock: Both succeed (design doc for live DB)
// Live DB: Second returns existing event (UNIQUE constraint)
```

---

## Test Coverage

### Mock Repository Tests (Run Without DB)

```bash
npm run test:episode-repository
```

**19 test cases:**
- Create episode with initial state
- Retrieve by ID and list
- Optimistic locking (version conflict detection)
- Idempotency key deduplication (design)
- Event creation and history
- Type conversions (blockers, decisions)
- Concurrent update semantics

### Live Database Tests (Future)

When DATABASE_URL is set:

```bash
npm run test:episode-repository:live
```

(Would run against actual Neon instance)

Currently: Not implemented. Use mock tests for validation.

---

## Fixture Provider Remains Active

The YouTube provider still uses fixtures:

- `lib/youtube/episode-state-provider-core.ts` — Fixture-backed
- `/youtube` routes work without DATABASE_URL
- Tests pass without database

### Future Migration Path

When database is ready:

1. **Phase 1 (Parallel):** Keep fixtures, read database first, fall back to fixtures
2. **Phase 2 (Primary):** Database is authoritative, fixtures are fallback
3. **Phase 3 (Removal):** Delete fixtures, pure database

No breakage during migration.

---

## Troubleshooting

### Test Failures Without DATABASE_URL

**Expected.** Mock repository tests work by design.

**Debug:**
```bash
echo $DATABASE_URL
# Should be empty or unset for mock tests to run
```

### Live Database Connection Issues

**Check:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**If timeout/refused:**
- Verify DATABASE_URL is correct
- Check Neon firewall/IP allowlist
- Verify network connectivity

### Migration Script Errors

**Not yet implemented.** See "Remaining Steps" below.

---

## Files

**Migration:**
- `db/migrations/001_canonical_episode_state.sql` — Schema definition

**Domain:**
- `lib/persistence/canonical-types.ts` — Type definitions

**Repository:**
- `lib/persistence/episode-repository.ts` — Mock + live implementations

**Tests:**
- `tests/persistence/episode-repository.test.ts` — 19 test cases

---

## Remaining Steps (Not in This Task)

1. **Migration Runner Script**
   - `scripts/run-migrations.ts`
   - Reads `db/migrations/*.sql`
   - Executes against DATABASE_URL
   - Idempotent (safe to re-run)

2. **Live Database Tests**
   - Tests that require DATABASE_URL
   - Separate from mock tests
   - Run in CI only if Neon secret available

3. **YouTube Provider Integration**
   - Replace fixture reads with database reads
   - Keep parallel/fallback during migration
   - Deprecate fixtures in Phase 2

4. **Episode API Module**
   - Command boundary (not yet implemented)
   - `transitionEpisodeState()`
   - `addEpisodeBlocker()`
   - `recordHumanDecision()`
   - `recordPublication()`

5. **n8n Integration**
   - Authenticate n8n requests
   - n8n calls Episode API commands
   - State changes are durable and auditable

---

## Summary

- ✅ Schema defined (portable PostgreSQL)
- ✅ Domain types defined (Canonical* types)
- ✅ Repository interface defined (mock + live)
- ✅ Optimistic locking implemented
- ✅ Idempotency foundation implemented
- ✅ Tests pass (19 cases, mock repository)
- ✅ No database required for current build
- ⏳ Migration runner (future)
- ⏳ Live DB integration (future)
- ⏳ n8n integration (future)

**Next recommended task:** Implement migration runner and YouTube provider database integration (Phase 1: Parallel).
