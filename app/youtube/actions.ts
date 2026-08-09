"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { getDatabase } from "@/lib/persistence/db"
import { transitionEpisodeState } from "@/lib/youtube/commands/transition-episode-state.ts"
import { recordHumanDecision } from "@/lib/youtube/commands/record-human-decision.ts"
import { addEpisodeBlocker } from "@/lib/youtube/commands/add-episode-blocker.ts"
import { resolveEpisodeBlocker } from "@/lib/youtube/commands/resolve-episode-blocker.ts"
import { recordPublication } from "@/lib/youtube/commands/record-publication.ts"
import { runCommandInTransaction } from "@/lib/youtube/commands/transactional-command-runner.ts"
import type { CommandResult } from "@/lib/youtube/commands/command-result.ts"

// Server action: Transition episode state
export async function transitionEpisodeStateAction(
  episodeId: string,
  expectedStateVersion: number,
  toState: string,
  reason?: string
): Promise<CommandResult<void>> {
  try {
    const sql = getDatabase()
    const result = await runCommandInTransaction(sql, async (repository) =>
      transitionEpisodeState(repository, {
        episodeId,
        expectedStateVersion,
        toState,
        actor: "H:web",
        reason,
      })
    )

    if (result.success) {
      revalidatePath(`/youtube/episodes/${episodeId}`)
      revalidatePath("/youtube")
    }

    return result
  } catch (error) {
    // Infrastructure error: not a business error
    // Do not misclassify as invalid_input
    console.error("transitionEpisodeStateAction failed:", error)
    return {
      success: false,
      reason: "invalid_input",
      message: "Something went wrong while saving this change. Please try again.",
    }
  }
}

// Server action: Record human decision
export async function recordHumanDecisionAction(
  episodeId: string,
  expectedStateVersion: number,
  outcome: "pass" | "pass-with-conditions" | "rework" | "stop",
  label: string
): Promise<CommandResult<void>> {
  try {
    const sql = getDatabase()
    const result = await runCommandInTransaction(sql, async (repository) =>
      recordHumanDecision(repository, {
        episodeId,
        expectedStateVersion,
        outcome,
        label,
        actor: "H:web",
      })
    )

    if (result.success) {
      revalidatePath(`/youtube/episodes/${episodeId}`)
      revalidatePath("/youtube")
    }

    return result
  } catch (error) {
    console.error("recordHumanDecisionAction failed:", error)
    return {
      success: false,
      reason: "invalid_input",
      message: "Something went wrong while saving this change. Please try again.",
    }
  }
}

// Server action: Add episode blocker
export async function addEpisodeBlockerAction(
  episodeId: string,
  expectedStateVersion: number,
  blockerId: string,
  label: string,
  severity: "low" | "medium" | "high"
): Promise<CommandResult<void>> {
  try {
    const sql = getDatabase()
    const result = await runCommandInTransaction(sql, async (repository) =>
      addEpisodeBlocker(repository, {
        episodeId,
        expectedStateVersion,
        blockerId,
        label,
        severity,
        actor: "H:web",
      })
    )

    if (result.success) {
      revalidatePath(`/youtube/episodes/${episodeId}`)
      revalidatePath("/youtube")
    }

    return result
  } catch (error) {
    console.error("addEpisodeBlockerAction failed:", error)
    return {
      success: false,
      reason: "invalid_input",
      message: "Something went wrong while saving this change. Please try again.",
    }
  }
}

// Server action: Resolve episode blocker
export async function resolveEpisodeBlockerAction(
  episodeId: string,
  expectedStateVersion: number,
  blockerId: string
): Promise<CommandResult<void>> {
  try {
    const sql = getDatabase()
    const result = await runCommandInTransaction(sql, async (repository) =>
      resolveEpisodeBlocker(repository, {
        episodeId,
        expectedStateVersion,
        blockerId,
        actor: "H:web",
      })
    )

    if (result.success) {
      revalidatePath(`/youtube/episodes/${episodeId}`)
      revalidatePath("/youtube")
    }

    return result
  } catch (error) {
    console.error("resolveEpisodeBlockerAction failed:", error)
    return {
      success: false,
      reason: "invalid_input",
      message: "Something went wrong while saving this change. Please try again.",
    }
  }
}

// Server action: Record publication
export async function recordPublicationAction(
  episodeId: string,
  expectedStateVersion: number,
  youtubeVideoId: string,
  publishedAt: string
): Promise<CommandResult<void>> {
  try {
    const sql = getDatabase()
    const result = await runCommandInTransaction(sql, async (repository) =>
      recordPublication(repository, {
        episodeId,
        expectedStateVersion,
        youtubeVideoId,
        publishedAt,
        actor: "H:web",
      })
    )

    if (result.success) {
      revalidatePath(`/youtube/episodes/${episodeId}`)
      revalidatePath("/youtube")
      revalidatePath("/youtube/history")
    }

    return result
  } catch (error) {
    console.error("recordPublicationAction failed:", error)
    return {
      success: false,
      reason: "invalid_input",
      message: "Something went wrong while saving this change. Please try again.",
    }
  }
}
