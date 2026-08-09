-- ─────────────────────────────────────────────────────────────
-- Episode Research Schema
-- ─────────────────────────────────────────────────────────────
-- Structured research workspace for investigation and evidence.
-- 1:1 relationship with episodes.
-- Stores research findings, sources, contradictions, and open questions.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS episode_research (
  episode_id TEXT PRIMARY KEY
    REFERENCES episodes(episode_id) ON DELETE CASCADE,

  -- Research summary (optional)
  summary TEXT,

  -- Research content (all JSONB arrays, default empty)
  key_findings JSONB NOT NULL DEFAULT '[]',
  sources JSONB NOT NULL DEFAULT '[]',
  open_questions JSONB NOT NULL DEFAULT '[]',
  contradictions JSONB NOT NULL DEFAULT '[]',

  -- Versioning and timestamps
  schema_version INTEGER NOT NULL DEFAULT 1,
  research_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- End of migration
-- ─────────────────────────────────────────────────────────────
