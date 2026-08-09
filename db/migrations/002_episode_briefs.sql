-- ─────────────────────────────────────────────────────────────
-- Episode Briefs Schema
-- ─────────────────────────────────────────────────────────────
-- Editorial context for upstream handoff (Perplexity, Claude Cowork).
-- 1:1 relationship with episodes.
-- Topic is required; other fields optional for progressive completion.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS episode_briefs (
  episode_id TEXT PRIMARY KEY
    REFERENCES episodes(episode_id) ON DELETE CASCADE,

  -- Editorial content (topic required, others optional)
  topic TEXT NOT NULL,
  angle TEXT,
  audience TEXT,
  core_question TEXT,
  hook TEXT,
  thesis TEXT,
  editorial_notes TEXT,

  -- Structured research questions for tool integration
  research_questions JSONB NOT NULL DEFAULT '[]',

  -- Versioning and timestamps
  schema_version INTEGER NOT NULL DEFAULT 1,
  brief_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- End of migration
-- ─────────────────────────────────────────────────────────────
