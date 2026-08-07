// ─────────────────────────────────────────────────────────────
// YouTube Episodes Database Seed
// ─────────────────────────────────────────────────────────────
// Populates Neon with canonical episode catalog.
// Idempotent: safe to rerun, skips existing records.
// ─────────────────────────────────────────────────────────────

import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"

const databaseUrl: string = process.env.DATABASE_URL || ""
if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is required")
  process.exit(1)
}

interface EpisodeSeed {
  episodeId: string
  episodeNumber: number
  channelName: string
  title: string
  workflowState: string
  reviewStatus: "not-required" | "pending" | "in-progress" | "completed"
  description?: string
}

const SEED_EPISODES: EpisodeSeed[] = [
  {
    episodeId: "episode-014",
    episodeNumber: 14,
    channelName: "Wealth Decoded",
    title: "Dividend Investing Explained",
    workflowState: "TOPIC",
    reviewStatus: "not-required",
    description: "Core dividend investing concepts for beginners",
  },
  {
    episodeId: "episode-013",
    episodeNumber: 13,
    channelName: "Wealth Decoded",
    title: "$1,000 a Month in Dividends",
    workflowState: "RESEARCH",
    reviewStatus: "pending",
    description: "How to build a dividend portfolio generating $1k monthly income",
  },
]

async function seedDatabase() {
  console.log("🌱 Seeding YouTube episodes to Neon...\n")

  let sql: ReturnType<typeof postgres>
  try {
    sql = postgres(databaseUrl)
  } catch (err) {
    console.error("Error: Failed to connect to database")
    console.error((err as Error).message)
    process.exit(1)
  }

  const now = new Date().toISOString()
  const results = {
    created: [] as string[],
    existing: [] as string[],
    errors: [] as { id: string; error: string }[],
  }

  for (const episode of SEED_EPISODES) {
    try {
      // Check if episode already exists
      const existing = await sql`
        SELECT episode_id FROM episodes WHERE episode_id = ${episode.episodeId}
      `

      if (existing.length > 0) {
        results.existing.push(episode.episodeId)
        console.log(`  ⏭️  ${episode.episodeId} (already exists, skipped)`)
        continue
      }

      // Insert new episode
      await sql`
        INSERT INTO episodes (
          episode_id,
          episode_number,
          channel_name,
          title,
          workflow_state,
          review_status,
          blockers,
          schema_version,
          state_version,
          created_at,
          updated_at
        )
        VALUES (
          ${episode.episodeId},
          ${episode.episodeNumber},
          ${episode.channelName},
          ${episode.title},
          ${episode.workflowState},
          ${episode.reviewStatus},
          '[]'::jsonb,
          1,
          1,
          ${now},
          ${now}
        )
      `

      results.created.push(episode.episodeId)
      console.log(
        `  ✓ ${episode.episodeId} (${episode.title})`
      )
    } catch (err) {
      results.errors.push({
        id: episode.episodeId,
        error: (err as Error).message,
      })
      console.error(
        `  ✗ ${episode.episodeId}: ${(err as Error).message}`
      )
    }
  }

  // Close connection
  await sql.end()

  // Summary
  console.log("\n📊 Seed Summary:")
  console.log(`  Created:  ${results.created.length}`)
  console.log(`  Existing: ${results.existing.length}`)
  console.log(`  Errors:   ${results.errors.length}`)

  if (results.created.length > 0) {
    console.log(`\n✓ Seeded episodes:`)
    results.created.forEach((id) => console.log(`    ${id}`))
  }

  if (results.existing.length > 0) {
    console.log(`\n ℹ Existing episodes (skipped):`)
    results.existing.forEach((id) => console.log(`    ${id}`))
  }

  if (results.errors.length > 0) {
    console.log(`\n✗ Errors:`)
    results.errors.forEach((e) => console.log(`    ${e.id}: ${e.error}`))
    process.exit(1)
  }

  console.log("\n✓ Database seeding complete")
}

seedDatabase().catch((err) => {
  console.error("Fatal error:", (err as Error).message)
  process.exit(1)
})
