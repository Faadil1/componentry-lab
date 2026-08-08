# YouTube OS â€” Canonical Episode State Architecture

**Version:** 1.0 (Design)
**Status:** Architecture Specification (Not Yet Implemented)
**Date:** 2026-08-07

---

## Executive Summary

This document defines the durable canonical episode state architecture for the YouTube Operating System. The architecture establishes a persistent state store that remains authoritative even as n8n orchestrator restarts, retries, or is replaced. It separates concerns: n8n handles workflow orchestration, the Episode State Store handles state durability, and the YouTube Provider handles UI consumption.

**Key Principle:** n8n is NOT the canonical source of truth. n8n is an orchestrator that reads and writes to the canonical state store.

---

## 1. Current Validated Layers

Before designing persistence, review what already works:

### EpisodeStateCard v1.0.0
- **Status:** PROMOTED
- **Tests:** 20/20 API tests passing
- **Role:** Renders episode workflow state with 6 variants (default, blocked, human-review-required, approved, published, unavailable)
- **Stability:** Component contract is final; no breaking changes

### EpisodeStateSnapshot (Integration Contract)
- **Defined in:** `lib/domain/episode-state.ts`
- **Tests:** 29/29 adapter tests passing
- **Role:** Maps from canonical state to card rendering props
- **Stability:** Snapshot structure is stable; used by adapter tests

### EpisodeStateCard Adapter
- **Defined in:** `lib/adapters/episode-state-card-adapter.ts`
- **Tests:** 29/29 passing
- **Responsibility:** Pure function mapping Snapshot â†’ CardProps
- **Stability:** Variant logic is final and verified

### YouTube Provider Boundary
- **Current:** Fixture-backed with server-only enforcement
- **Tests:** 19/19 core provider tests passing
- **Architecture:** Pure core logic + Next.js server-only wrapper
- **Semantic guarantees:** Unknown episode (null) vs known unavailable (snapshot + reason)
- **Stability:** Catalog/state separation is durable pattern

### YouTube OS Vertical Slice
- **Routes:** `/youtube` (overview), `/youtube/episodes/[episodeId]` (detail)
- **Design:** Server Components, no client-side data fetching
- **Status:** Working, all gates passing

---

## 2. Architectural Principles

### 2.1 State Durability > Workflow Execution

The canonical episode state must survive:
- n8n restarts
- n8n workflow retries
- n8n failures
- n8n replacement/upgrades
- Multiple simultaneous writers (future: humans, agents, webhooks)

### 2.2 n8n is an Orchestrator, Not a Database

n8n responsibilities (eventual):
- Trigger workflow stages
- Call LLMs and external services
- Wait for results
- Process human decisions
- Advance workflow state
- Write state transitions to canonical store

n8n does NOT own:
- State durability
- State versioning
- Audit trails
- Blocker lifecycle
- Human decision records (writes them, but doesn't own them)

### 2.3 YouTube Provider Reads Canonical Store

Current: Provider reads fixtures, returns `EpisodeStateSnapshot`

Future: Provider reads database, returns same snapshot shape

```
Database Episode Record
  â†“ (YouTube Provider)
EpisodeStateSnapshot
  â†“ (Adapter)
EpisodeStateCardProps
  â†“ (Component)
<EpisodeStateCard />
```

No client-side queries. No n8n exposure to UI.

### 2.4 UI Props â‰  Domain Schema

**Critical distinction:**
- **Canonical schema:** Persistent, rich, authoritative (Episode record)
- **UI snapshot:** Minimal, derived, tailored for rendering (EpisodeStateSnapshot)
- **Adapter:** Pure function mapping canonical â†’ snapshot

Example:
- Canonical field: `workflowState: "QA"`
- Snapshot field: `workflowStateLabel: "Quality Assurance"` (optional UI hint)
- UI rendering: Adapter maps state â†’ variant â†’ card appearance

---

## 3. Domain Model Analysis

### 3.1 Current EpisodeStateSnapshot Fields

**Identity:**
- `episodeId` â€” Canonical, persistent âœ“
- `episodeNumber` â€” Canonical, persistent âœ“
- `channelName` â€” Canonical, persistent âœ“
- `title` â€” Canonical, persistent âœ“

**Workflow:**
- `workflowState` â€” Canonical, persistent âœ“
- `workflowStateLabel` â€” Derived/UI hint, may be omitted âš 
- `reviewStatus` â€” Canonical, persistent âœ“
- `nextAuthorizedAction` â€” Derived from state, computed âš 

**State:**
- `blockers` â€” Canonical, persistent âœ“
- `lastDecision` â€” Canonical, persistent âœ“

**Publication:**
- `publication.youtubeVideoId` â€” Canonical, persistent âœ“
- `publication.publishedAt` â€” Canonical, persistent âœ“

**System:**
- `source` (version, fetchedAt) â€” Metadata, maybe derival âš 
- `unavailableReason` â€” System error indicator, should be persistent âœ“

### 3.2 Fields to Add to Canonical Schema

- `schemaVersion` â€” Track schema evolution
- `stateVersion` â€” Optimistic locking for concurrency
- `createdAt` â€” Episode creation timestamp
- `updatedAt` â€” Last state change timestamp
- `workflowStateVersion` â€” What version of workflow model is this?

---

## 4. Canonical Episode Schema v1

### 4.1 Episode Record

Represents the authoritative current state of a single episode.

```typescript
interface Episode {
  // Identity (immutable)
  episodeId: string                    // PK, e.g., "episode-014"
  episodeNumber: number                // e.g., 14
  channelId: string                    // e.g., "wealth-decoded"
  channelName: string                  // e.g., "Wealth Decoded"
  title: string                        // e.g., "Dividend Investing Explained"

  // Workflow State (mutable)
  workflowState: "TOPIC" | "RESEARCH" | ... | "PUBLISH"
  workflowStateVersion: number         // Model version, for migrations

  // Review Gate
  reviewStatus: "not-required" | "pending" | "in-progress" | "completed"

  // Blocking Issues (JSON array, denormalized for speed)
  blockers: Array<{
    id: string                         // "thumbnail-direction", stable
    code: string                       // e.g., "THUMBNAIL_DIRECTION"
    label: string                      // Human-readable
    severity: "low" | "medium" | "high"
    source: string                     // Who created this
    createdAt: string (ISO8601)
    resolvedAt?: string (ISO8601)      // If resolved
  }>

  // Latest Decision (from human review)
  latestDecision?: {
    outcome: "pass" | "pass-with-conditions" | "rework" | "stop"
    decidedBy: string                  // Actor who decided
    decidedAt: string (ISO8601)
    notes?: string                     // Optional context
  }

  // Publication
  youtubeVideoId?: string              // If published
  publishedAt?: string (ISO8601)       // If published

  // System Fields
  schemaVersion: number                // Current: 1, for migrations
  stateVersion: number                 // Optimistic locking counter
  createdAt: string (ISO8601)
  updatedAt: string (ISO8601)

  // Optional: System Error Context
  unavailableReason?: string           // If state fetch fails in production
}
```

**Indexes:**
- Primary: `episodeId`
- Secondary: `(channelId, episodeNumber)` â€” for catalog queries
- Secondary: `workflowState` â€” for workflow reporting
- Secondary: `(publishedAt DESC)` â€” for published history

---

## 5. Episode Event Schema v1

Append-only audit trail. One record per significant state change or decision.

```typescript
interface EpisodeEvent {
  // Identity
  eventId: string (UUID)               // PK, idempotency key for dedup
  episodeId: string                    // FK to Episode

  // Event Metadata
  eventType: "EPISODE_CREATED"
           | "STATE_CHANGED"
           | "BLOCKER_ADDED"
           | "BLOCKER_RESOLVED"
           | "REVIEW_REQUESTED"
           | "DECISION_RECORDED"
           | "PUBLICATION_COMPLETED"
           | "STATE_UNAVAILABLE"

  source: "n8n" | "youtube-os" | "human" | "system"
  actor: string                        // Who triggered this (user ID, service name)
  createdAt: string (ISO8601)

  // State Transition
  fromState?: string                   // e.g., "QA"
  toState?: string                     // e.g., "FINAL_RENDER"

  // Event Payload (JSON, event-type-specific)
  payload?: object                     // e.g., { reason: "failed checks" }

  // Decision Data (if eventType = DECISION_RECORDED)
  decision?: {
    outcome: "pass" | "pass-with-conditions" | "rework" | "stop"
    notes?: string
  }

  // Idempotency (for n8n retries)
  idempotencyKey?: string              // e.g., "episode-014:FACT_CHECK:exec-xyz"
                                        // Unique per operation, prevents duplicates
}
```

**Indexes:**
- Primary: `eventId`
- Foreign key: `episodeId`
- Secondary: `(episodeId, createdAt DESC)` â€” retrieve episode history
- Secondary: `eventType` â€” query by event type
- Secondary: `idempotencyKey` â€” idempotency checks

**Event Types v1:**

| Type | When | Payload |
|------|------|---------|
| `EPISODE_CREATED` | Episode first appears | episodeNumber, title |
| `STATE_CHANGED` | Workflow advances | fromState, toState |
| `BLOCKER_ADDED` | Issue discovered | blocker object |
| `BLOCKER_RESOLVED` | Issue resolved | blockerId |
| `REVIEW_REQUESTED` | Waiting for human | reason |
| `DECISION_RECORDED` | Human decided | outcome, decidedBy, notes |
| `PUBLICATION_COMPLETED` | Published to YouTube | youtubeVideoId |
| `STATE_UNAVAILABLE` | System error | reason |

---

## 6. Blocker Schema (Detailed)

Blockers can be denormalized into Episode.blockers or separate table. For v1, denormalize into Episode.blockers (simpler).

```typescript
interface Blocker {
  id: string                           // Stable ID, e.g., "thumbnail-direction"
  code: string                         // e.g., "THUMBNAIL_DIRECTION"
  label: string                        // "Thumbnail direction needs approval"
  severity: "low" | "medium" | "high"
  source: string                       // Who/what created it (e.g., "n8n:fact-check")
  createdAt: string (ISO8601)
  resolvedAt?: string (ISO8601)        // When resolved, if applicable
}
```

**Blocker ID Stability:**
- ID must remain the same if the same issue recurs
- Prevents false duplicates
- Enables history tracking per blocker type

**Example Blocker IDs:**
- `thumbnail-direction` â€” Designer sign-off needed
- `fact-check-failed` â€” Fact-checking found errors
- `render-artifact` â€” Visual glitch in render
- `audio-mismatch` â€” Narration duration mismatch

---

## 7. State Versioning Strategy

**Approach:** Optimistic Locking

Prevents lost writes when multiple actors modify state concurrently.

### 7.1 How It Works

```
Actor 1 reads episode:
  stateVersion = 17

Actor 2 reads episode:
  stateVersion = 17

Actor 2 attempts state change:
  UPDATE episodes
    SET workflowState = 'QA', stateVersion = 18
    WHERE episodeId = 'episode-014' AND stateVersion = 17
  â†’ Succeeds (1 row updated)
  â†’ stateVersion now 18

Actor 1 attempts same change:
  UPDATE episodes
    SET workflowState = 'QA', stateVersion = 18
    WHERE episodeId = 'episode-014' AND stateVersion = 17
  â†’ Fails (0 rows updated, Actor 2 already won)
  â†’ Client sees conflict
  â†’ Retries with fresh read of stateVersion = 18
```

### 7.2 Workflow

1. Read episode, capture `stateVersion`
2. Prepare change
3. Execute UPDATE with WHERE clause checking `stateVersion`
4. If 0 rows updated: **Conflict** â†’ refresh and retry
5. If 1 row updated: **Success** â†’ stateVersion incremented

### 7.3 Implementation Notes

- No database locks needed (optimistic)
- No long transactions
- Conflicts are rare (different actors target different states most of the time)
- Retries are simple: refresh and re-apply

---

## 8. Idempotency Strategy

n8n workflows may retry executions. Same operation must not create duplicate events or state changes.

### 8.1 Idempotency Key Pattern

```
Format: {episodeId}:{operation}:{uniqueId}

Examples:
  episode-014:ADVANCE_STATE:n8n-exec-xyz
  episode-014:FACT_CHECK:n8n-task-123
  episode-013:PUBLISH:webhook-req-456
```

### 8.2 How It Works

1. Caller provides `idempotencyKey` with state change request
2. Check if event with this `idempotencyKey` already exists
3. If yes: Return cached result (operation already succeeded)
4. If no: Execute operation, create event with this key
5. Subsequent retries with same key see the event, return success

### 8.3 Example

```
First attempt:
  POST /api/episodes/episode-014/transition
    { toState: "QA", idempotencyKey: "n8n-exec-xyz" }
  â†’ Creates EpisodeEvent with idempotencyKey
  â†’ Returns success

n8n retry (same execution):
  POST /api/episodes/episode-014/transition
    { toState: "QA", idempotencyKey: "n8n-exec-xyz" }
  â†’ Finds existing EpisodeEvent with same idempotencyKey
  â†’ Returns "already done" (no duplicate event)
  â†’ No double-state-change
```

---

## 9. Human Review Persistence Strategy

Human reviews must not exist only as "waiting for n8n to respond."

### 9.1 Flow

```
State: CANDIDATE_ASSET_REVIEW

Event: REVIEW_REQUESTED
  â†’ Episode.reviewStatus = "in-progress"
  â†’ YouTube OS UI shows "awaiting decision"

[Human logs in, reviews assets, makes decision]

Human POSTs decision:
  { outcome: "pass", notes: "Assets look great" }

Event: DECISION_RECORDED
  â†’ Episode.latestDecision = { outcome: "pass", decidedBy: "alice@example.com", ... }
  â†’ Episode.reviewStatus = "completed"

n8n polls:
  GET /api/episodes/episode-014
  â†’ sees latestDecision is now present
  â†’ continues workflow (publishes or whatever next step is)
```

### 9.2 Key Insight

- Decision is persisted as event + episode field
- Decision exists independently of n8n polling
- n8n may take hours to check in; decision is already stored
- Human can see their decision was recorded

---

## 10. Workflow States (Canonical)

Use the permanent 16-state workflow. Do NOT map directly to UI variants; that's the adapter's job.

```
TOPIC
  â†“
RESEARCH
  â†“
SCRIPT
  â†“
FACT_CHECK
  â†“
NARRATION
  â†“
SRT_LOCK
  â†“
VISUAL_COVERAGE_TIMELINE
  â†“
ASSET_REGISTER
  â†“
MASTER_EDIT_REMOTION
  â†“
ANIMATED_PLACEHOLDERS
  â†“
PARALLEL_ASSET_PRODUCTION
  â†“
CANDIDATE_ASSET_REVIEW
  â†“
AUTOMATIC_REPLACEMENT
  â†“
QA
  â†“
FINAL_RENDER
  â†“
PUBLISH
```

Each state may have:
- Blockers
- Review gates
- Human decisions
- Next authorized actions (derived)

---

## 11. N8N Future API Boundary

n8n will eventually interact with the state store via authenticated commands.

### 11.1 Proposed Commands

```typescript
// Advance workflow
transitionEpisodeState(episodeId, toState, idempotencyKey)

// Record blocking issue
addEpisodeBlocker(episodeId, blocker, idempotencyKey)

// Clear blocking issue
resolveEpisodeBlocker(episodeId, blockerId, idempotencyKey)

// Record human decision
recordHumanDecision(episodeId, decision, idempotencyKey)

// Mark published
recordPublication(episodeId, youtubeVideoId, idempotencyKey)
```

Each command:
1. Validates preconditions (e.g., current state allows transition)
2. Checks idempotency key (is this a retry?)
3. Updates Episode record (stateVersion-protected)
4. Appends EpisodeEvent (audit trail)
5. Returns result

No direct table mutations. All state changes flow through validated boundaries.

### 11.2 Authentication

v1 (no auth needed, internal):
- Requests come from n8n running on same infrastructure
- IP whitelist or environment isolation

v2 (future):
- n8n authenticates with webhook secret or API key
- Each request identifies actor (n8n service name or account)
- Audit trail records actor identity

---

## 12. YouTube Provider Future Shape

Current: Reads fixtures, returns EpisodeStateSnapshot

Future: Reads canonical database, returns same shape

```typescript
// lib/youtube/get-episode-state.ts (server-only wrapper)
export async function getEpisodeState(episodeId: string): Promise<EpisodeStateSnapshot | null> {
  // 1. Query database: SELECT * FROM episodes WHERE episodeId = ?
  const episode = await getEpisodeFromDatabase(episodeId);

  if (!episode) return null;

  // 2. Map Episode domain object to EpisodeStateSnapshot
  //    (compute nextAuthorizedAction, format labels, etc.)
  return mapEpisodeToSnapshot(episode);
}

export async function listEpisodes(): Promise<Array<{ id, title, episodeNumber? }>> {
  // 1. Query database: SELECT * FROM episodes WHERE published OR in-progress
  // 2. Map each to catalog entry
  return getCatalogEntries();
}
```

The snapshot shape stays the same. Adapter doesn't change. Component doesn't change. UI stays the same.

---

## 13. Recommended Canonical Source: Vercel Postgres

### 13.1 Why PostgreSQL

| Criterion | PostgreSQL | SQLite | Firestore | n8n Storage |
|---|---|---|---|---|
| Durability | âœ… HA, backups | âš  File-based | âœ… Managed | âŒ Ephemeral |
| Concurrent writes | âœ… Optimistic locking | âŒ Locks | âœ… Built-in | âŒ Not designed for it |
| Queryability | âœ… SQL, complex | âœ… SQL, limited | âœ… Document queries | âŒ Limited |
| Cost | âœ… $0â€“30/mo | âœ… Free | âŒ $1â€“100/mo (metered) | âŒ Coupled to n8n |
| Vercel integration | âœ… Native Vercel Postgres | âš  Via file storage | âš  Via Firebase | âŒ None |
| n8n integration | âœ… HTTP API + webhooks | âš  File polling | âœ… API | âŒ Internal |
| Audit trail | âœ… Event log table | âŒ No built-in | âš  Timestamp fields | âŒ Not designed |
| Migration path | âœ… Scalable to Postgres pro | âš  Complex | âŒ Vendor lock-in | âŒ Lock-in |

### 13.2 Vercel Postgres Specifics

- **Setup:** One click in Vercel dashboard
- **Cost:** Included in Vercel hobby tier, then $10/month for production
- **Backup:** Automatic daily backups
- **Connection:** Environment variables pre-configured
- **Client:** Use `@vercel/postgres` npm package (zero config)
- **Regions:** Deployed near your functions
- **Versioning:** Native support for event log patterns

### 13.3 Alternative: SQLite + Turso (Edge-Replicated)

If Postgres cost grows later:
- Turso: SQLite with replication
- Slightly more complex schema design
- But: Same SQL migration path, lower cost

For v1: Stick with Vercel Postgres.

---

## 14. Minimum Database Tables

### 14.1 Required

**episodes**
```sql
CREATE TABLE episodes (
  episodeId VARCHAR(255) PRIMARY KEY,
  episodeNumber INTEGER,
  channelId VARCHAR(255),
  channelName VARCHAR(255),
  title TEXT,
  workflowState VARCHAR(50),
  workflowStateVersion INTEGER,
  reviewStatus VARCHAR(50),
  blockers JSONB,          -- Denormalized for speed
  latestDecision JSONB,    -- Or NULL
  youtubeVideoId VARCHAR(255),
  publishedAt TIMESTAMP,
  schemaVersion INTEGER,
  stateVersion INTEGER,    -- Optimistic locking
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  unavailableReason TEXT,

  INDEX idx_workflow_state (workflowState),
  INDEX idx_catalog (channelId, episodeNumber),
  INDEX idx_published (publishedAt DESC)
);
```

**episode_events**
```sql
CREATE TABLE episode_events (
  eventId UUID PRIMARY KEY,
  episodeId VARCHAR(255) REFERENCES episodes,
  eventType VARCHAR(50),
  source VARCHAR(50),
  actor VARCHAR(255),
  fromState VARCHAR(50),
  toState VARCHAR(50),
  payload JSONB,
  decision JSONB,
  idempotencyKey VARCHAR(255) UNIQUE,  -- For dedup
  createdAt TIMESTAMP,

  INDEX idx_episode_time (episodeId, createdAt DESC),
  INDEX idx_event_type (eventType),
  INDEX idx_idempotency (idempotencyKey)
);
```

### 14.2 Optional (v2+)

- `users` â€” If humans edit state directly via UI
- `audit_log` â€” If compliance requires immutable audit trail
- `webhooks` â€” If external systems need state change notifications

For v1: Just episodes + episode_events.

---

## 15. Security Boundary

### 15.1 v1 (Internal-Only)

No public API. All access is internal:
- YouTube OS Server Components (implicit auth, running on same server)
- n8n self-hosted or cloud deployment (IP whitelist or VPC)
- Vercel Functions (environment credentials)

### 15.2 v2 (Future API)

If opening n8n as external service:

```
n8n request:
  â†’ n8n_webhook_secret in Authorization header
  â†’ Verify against env var
  â†’ Execute command
  â†’ Log actor = "n8n"

YouTube OS UI request:
  â†’ Runs on server (no credentials needed)
  â†’ Actor = logged-in user or "system"
```

### 15.3 Never Expose To Client

- Episode state database queries
- Raw n8n credentials
- State API endpoints
- Event audit trail

All state flows through:
```
Database â†’ YouTube Provider â†’ Snapshot â†’ Adapter â†’ Component â†’ UI
```

No direct client queries.

---

## 16. Migration Strategy from Fixtures

### Phase 1: Parallel Setup (Weeks 1-2)

- [ ] Set up Vercel Postgres
- [ ] Define schemas (episodes, episode_events, blockers)
- [ ] Write schema migration script
- [ ] Build data migration: `fixtures â†’ database`
- [ ] YouTube provider: Try database first, fall back to fixtures
- [ ] Tests pass with hybrid approach

**Outcome:** Database is seeded, provider can read from it, but fixtures still work as fallback.

### Phase 2: Primary Source (Weeks 3-4)

- [ ] YouTube provider prioritizes database
- [ ] Fixtures used only if database query fails
- [ ] Run YouTube OS UI against real database
- [ ] Verify all adapter tests still pass
- [ ] Verify provider tests still pass (but now hitting DB)

**Outcome:** Real data is authoritative, fixtures are safety net.

### Phase 3: Fixture Removal (Week 5)

- [ ] Remove fixture imports from provider
- [ ] Remove fixture files
- [ ] Pure database-backed provider
- [ ] Write seed script for development
- [ ] n8n integration design begins

**Outcome:** Fixtures gone, state is purely persistent.

---

## 17. Data Flow Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  n8n Workflow   â”‚
â”‚  (Future)       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ POST /api/episodes/:id/transition
         â”‚ { toState, idempotencyKey }
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Episode State API          â”‚
â”‚  (Core commands)            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ transitionEpisodeState()    â”‚
â”‚ addEpisodeBlocker()         â”‚
â”‚ recordHumanDecision()       â”‚
â”‚ recordPublication()         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ 1. Validate preconditions
         â”‚ 2. Check idempotency
         â”‚ 3. Update episode (stateVersion-protected)
         â”‚ 4. Append event (audit trail)
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Vercel Postgres             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ episodes (current state)     â”‚
â”‚ episode_events (audit log)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ SELECT episodeId, workflowState, blockers, ...
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  YouTube Provider           â”‚
â”‚  (Server-side wrapper)      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ import "server-only"        â”‚
â”‚ getEpisodeState()           â”‚
â”‚ listEpisodes()              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ Map Episode â†’ EpisodeStateSnapshot
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  EpisodeStateSnapshot       â”‚
â”‚  (Integration Contract)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ (Adapter) Map snapshot â†’ card props
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  EpisodeStateCardProps      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ (Component)
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  <EpisodeStateCard />       â”‚
â”‚  v1.0.0 PROMOTED            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â”‚ Render â†’ HTML
         â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Browser                    â”‚
â”‚  /youtube/episodes/[id]     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 18. Questions Genuinely Requiring Human Decision

### 18.1 n8n Deployment Model

**Question:** How is n8n deployed?

**Options:**
- Self-hosted on Vercel Functions (simple, no external service)
- Separate cloud deployment (Heroku, Railway, AWS)
- Cloud-hosted n8n service (n8n.cloud or similar)

**Impact:** Determines authentication mechanism and API boundary design

**Recommendation:** Defer. Design API to work with any deployment.

### 18.2 Who Writes State Changes?

**Question:** Can humans directly modify episode state via YouTube OS UI, or only n8n?

**Options:**
- Only n8n writes (safer, simpler v1)
- Humans can change state directly (requires auth, audit)
- Both (complex conflicts)

**Recommendation:** v1: Only n8n writes. Future: Enable human UI edits with audit trail.

### 18.3 Publication System

**Question:** Does YouTube publishing happen via n8n, or separate system?

**Options:**
- n8n publishes directly to YouTube API
- n8n writes "ready to publish" state, separate system publishes
- Manual human publishing via YouTube

**Impact:** Affects `recordPublication()` command ownership

**Recommendation:** Defer. Design to support any approach.

### 18.4 Audit Retention

**Question:** How long must episode_events be retained?

**Options:**
- Forever (immutable history)
- 1 year (compliance)
- 90 days (cost control)

**Impact:** Database size, compliance requirements

**Recommendation:** Start with forever; add retention policy if needed.

### 18.5 Real-Time Sync vs Polling

**Question:** Should n8n see state changes in real-time, or poll for updates?

**Options:**
- n8n polls API every minute (simple)
- Webhook notifications when state changes (complex, faster)
- Database subscriptions (PostgreSQL LISTEN/NOTIFY, advanced)

**Recommendation:** v1: Polling. Webhooks can be added later.

---

## 19. Recommended Next Implementation Task

### Task: "Implement Canonical Episode State Persistence Layer"

**Scope:**
1. Set up Vercel Postgres
2. Design and create schema (episodes, episode_events)
3. Write data migration script (fixtures â†’ database)
4. Build episode-state-api module with core commands
5. Write tests for state transitions and optimistic locking
6. Update YouTube provider to read from database
7. Verify all gates still pass
8. Keep fixture fallback for dev/testing

**Do NOT (yet):**
- Integrate n8n
- Add UI for direct state modification
- Build full audit UI
- Add human authentication
- Deploy to production

**Time Estimate:** 4-6 hours

**Success Criteria:**
- [ ] Vercel Postgres schema created
- [ ] Data migration script runs successfully
- [ ] Episode records query correctly
- [ ] State version locking works
- [ ] Idempotency prevents duplicates
- [ ] YouTube provider reads from DB
- [ ] All adapter tests still pass (29/29)
- [ ] All provider tests still pass (19/19)
- [ ] YouTube OS UI renders against real data
- [ ] Build passes all gates

---

## 20. Implementation Dependencies

**Not Required for v1:**
- n8n
- YouTube API
- Human authentication
- Webhooks
- Advanced querying
- Replication/HA

**Required for v1:**
- Vercel Postgres account (or local Postgres)
- `@vercel/postgres` npm package
- Migration runner (e.g., Prisma Migrate or sql-migrate)
- Test database setup
- Small data seed script

---

## 21. Design Validation Checklist

Before implementation, verify:

- [ ] Episode schema captures all required identity fields
- [ ] Event schema supports idempotency
- [ ] State versioning prevents lost writes
- [ ] Blocker model supports resolution tracking
- [ ] Human review flow doesn't depend on n8n polling
- [ ] Adapter contract (Snapshot) unchanged
- [ ] Component contract (Card) unchanged
- [ ] Provider boundary (server-only) enforced
- [ ] Data flow has no cycles
- [ ] Each actor (n8n, humans, system) has clear boundary
- [ ] Migration strategy from fixtures is realistic
- [ ] Security assumptions are documented

---

## Summary

The canonical episode state architecture separates concerns:

1. **Vercel Postgres** stores durable Episode + Event records
2. **Episode State API** enforces business logic and versioning
3. **YouTube Provider** reads canonical state and maps to snapshot
4. **EpisodeStateCard Adapter** converts snapshot to UI props (unchanged)
5. **UI Component** renders (unchanged)
6. **n8n** eventually orchestrates workflows and writes to state store

This design ensures:
- âœ… State durability independent of n8n
- âœ… Concurrent writes don't lose data
- âœ… Audit trail is immutable
- âœ… Idempotent retries work correctly
- âœ… Human decisions are durable
- âœ… UI doesn't know about n8n
- âœ… UI doesn't expose database
- âœ… Blocker lifecycle is tracked
- âœ… Migration path is clear

**Next Step:** Implement the persistence layer as designed above.
