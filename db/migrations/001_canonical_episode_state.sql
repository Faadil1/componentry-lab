-- ─────────────────────────────────────────────────────────────
-- Canonical Episode State Schema
-- ─────────────────────────────────────────────────────────────
-- Durable foundation for YouTube OS episode workflow state.
-- Portable PostgreSQL schema (Neon, self-hosted, etc.)
-- ─────────────────────────────────────────────────────────────

-- Episodes: Current authoritative state
CREATE TABLE IF NOT EXISTS episodes (
  episode_id TEXT PRIMARY KEY,
  episode_number INTEGER,
  channel_name TEXT NOT NULL,
  title TEXT NOT NULL,

  -- Workflow progression
  workflow_state TEXT NOT NULL,
  review_status TEXT NOT NULL,

  -- State data (denormalized for speed)
  blockers JSONB NOT NULL DEFAULT '[]',
  latest_decision JSONB,

  -- UI hint (computed server-side, not stored)
  -- next_authorized_action is derived, not persisted

  -- Publication
  youtube_video_id TEXT,
  published_at TIMESTAMPTZ,

  -- System
  schema_version INTEGER NOT NULL DEFAULT 1,
  state_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_episodes_workflow_state ON episodes(workflow_state);
CREATE INDEX IF NOT EXISTS idx_episodes_catalog ON episodes(channel_name, episode_number);
CREATE INDEX IF NOT EXISTS idx_episodes_published ON episodes(published_at DESC NULLS LAST);

-- Episode Events: Append-only audit trail
CREATE TABLE IF NOT EXISTS episode_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL REFERENCES episodes(episode_id),

  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,

  -- State transition
  from_state TEXT,
  to_state TEXT,

  -- Event data (JSON, event-type-specific)
  payload JSONB,

  -- Idempotency key (for deduplication on retries)
  idempotency_key TEXT UNIQUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_episode_events_episode_time ON episode_events(episode_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_episode_events_type ON episode_events(event_type);
CREATE INDEX IF NOT EXISTS idx_episode_events_idempotency ON episode_events(idempotency_key);

-- ─────────────────────────────────────────────────────────────
-- End of migration
-- ─────────────────────────────────────────────────────────────
