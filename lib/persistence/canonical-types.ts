// ─────────────────────────────────────────────────────────────
// Canonical Episode State — Persistence Domain Types
// ─────────────────────────────────────────────────────────────
// Types representing what is stored in the canonical database.
// Separate from EpisodeStateSnapshot (UI contract).
// ─────────────────────────────────────────────────────────────

/**
 * Canonical blocker record.
 * Describes a blocking issue discovered during workflow.
 */
export interface CanonicalBlocker {
  id: string                           // Stable ID, e.g., "thumbnail-direction"
  code: string                         // e.g., "THUMBNAIL_DIRECTION"
  label: string                        // Human-readable label
  severity: "low" | "medium" | "high"
  source: string                       // Who/what created this
  createdAt: string                    // ISO8601 timestamp
  resolvedAt?: string                  // ISO8601 timestamp if resolved
}

/**
 * Canonical human decision record.
 * Represents a human's decision during review.
 */
export interface CanonicalDecision {
  outcome: "pass" | "pass-with-conditions" | "rework" | "stop"
  decidedBy: string                    // User ID or actor name
  decidedAt: string                    // ISO8601 timestamp
  notes?: string                       // Optional decision context
}

/**
 * Canonical episode record.
 * Authoritative current state of a single episode.
 */
export interface CanonicalEpisode {
  // Identity (immutable)
  episodeId: string
  episodeNumber?: number
  channelName: string
  title: string

  // Workflow state (mutable)
  workflowState: string
  reviewStatus: "not-required" | "pending" | "in-progress" | "completed"

  // State (mutable)
  blockers: CanonicalBlocker[]
  latestDecision?: CanonicalDecision

  // Publication
  youtubeVideoId?: string
  publishedAt?: string                 // ISO8601 timestamp if published

  // System
  schemaVersion: number
  stateVersion: number                 // For optimistic locking
  createdAt: string                    // ISO8601 timestamp
  updatedAt: string                    // ISO8601 timestamp
}

/**
 * Episode event record (audit trail).
 * Append-only. One record per significant state change.
 */
export interface CanonicalEpisodeEvent {
  eventId: string                      // UUID
  episodeId: string
  eventType: string                    // e.g., "STATE_CHANGED", "DECISION_RECORDED"
  actor: string                        // Who/what triggered this
  fromState?: string
  toState?: string
  payload?: Record<string, unknown>   // Event-type-specific data
  idempotencyKey?: string              // For dedup on retry
  createdAt: string                    // ISO8601 timestamp
}

/**
 * Optimistic locking result.
 * Returned when attempting versioned updates.
 */
export interface OptimisticLockResult {
  success: boolean
  expectedVersion: number
  actualVersion: number
  reason?: string                      // If failed: "conflict" or "not_found"
}

/**
 * Create episode input.
 * Represents the minimal data needed to create a new episode record.
 */
export interface CreateEpisodeInput {
  episodeId: string
  episodeNumber?: number
  channelName: string
  title: string
  workflowState: string
  reviewStatus: "not-required" | "pending" | "in-progress" | "completed"
}

/**
 * Repository result for episode creation.
 * Distinguishes duplicate conflict from successful creation without throwing.
 */
export type CreateEpisodeRepositoryResult =
  | { success: true; episode: CanonicalEpisode }
  | { success: false; reason: "conflict" }

/**
 * Update episode state input.
 * Represents a versioned state change.
 */
export interface UpdateEpisodeStateInput {
  episodeId: string
  expectedStateVersion: number         // For optimistic locking
  workflowState?: string
  reviewStatus?: string
  blockers?: CanonicalBlocker[]
  latestDecision?: CanonicalDecision | null
  youtubeVideoId?: string              // Publication fields
  publishedAt?: string                 // ISO8601 timestamp
}

/**
 * Create episode event input.
 */
export interface CreateEpisodeEventInput {
  episodeId: string
  eventType: string
  actor: string
  fromState?: string
  toState?: string
  payload?: Record<string, unknown>
  idempotencyKey?: string
}

/**
 * Database row types (snake_case from database).
 * Used internally for type safety during SQL mapping.
 */
export interface EpisodeRow {
  episode_id: string
  episode_number: number | null
  channel_name: string
  title: string
  workflow_state: string
  review_status: string
  blockers: CanonicalBlocker[]
  latest_decision: CanonicalDecision | null
  youtube_video_id: string | null
  published_at: string | null
  schema_version: number
  state_version: number
  created_at: string
  updated_at: string
}

export interface EpisodeEventRow {
  event_id: string
  episode_id: string
  event_type: string
  actor: string
  from_state: string | null
  to_state: string | null
  payload: Record<string, unknown> | null
  idempotency_key: string | null
  created_at: string
}

/**
 * Canonical episode brief.
 * Editorial context for upstream handoff to Perplexity, Claude Cowork, etc.
 * 1:1 relationship with episodes.
 * Topic is required; other fields are optional and progressively completed.
 */
export interface CanonicalEpisodeBrief {
  episodeId: string

  // Required: topic is the minimum viable brief
  topic: string

  // Optional: refined as editorial work progresses
  angle?: string
  audience?: string
  coreQuestion?: string
  hook?: string
  thesis?: string
  editorialNotes?: string

  // Structured research questions for tool integration
  researchQuestions: string[]

  // System
  schemaVersion: number
  briefVersion: number
  createdAt: string
  updatedAt: string
}

/**
 * Set episode brief input.
 * Handles both create (expectedBriefVersion: null) and update (expectedBriefVersion: N) cases.
 */
export interface SetEpisodeBriefInput {
  episodeId: string
  expectedBriefVersion: number | null  // Optimistic lock: null for create, N for update
  topic?: string
  angle?: string
  audience?: string
  coreQuestion?: string
  hook?: string
  thesis?: string
  editorialNotes?: string
  researchQuestions?: string[]
}

/**
 * Repository result for brief set operation.
 * Distinguishes conflict/not_found from successful mutations without throwing.
 */
export type SetEpisodeBriefRepositoryResult =
  | { success: true; brief: CanonicalEpisodeBrief }
  | { success: false; reason: "conflict" | "not_found" | "episode_not_found"; currentBriefVersion?: number }

/**
 * Database row type for episode_briefs (snake_case from database).
 */
export interface EpisodeBriefRow {
  episode_id: string
  topic: string
  angle: string | null
  audience: string | null
  core_question: string | null
  hook: string | null
  thesis: string | null
  editorial_notes: string | null
  research_questions: string[]
  schema_version: number
  brief_version: number
  created_at: string
  updated_at: string
}
