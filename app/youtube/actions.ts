"use server"

import "server-only"
import postgres from "postgres"
import { createEpisodeRepository } from "@/lib/persistence/episode-repository"
import { transitionEpisodeState } from "@/lib/youtube/commands/transition-episode-state"
import { recordHumanDecision } from "@/lib/youtube/commands/record-human-decision"
import { addEpisodeBlocker } from "@/lib/youtube/commands/add-episode-blocker"
import { resolveEpisodeBlocker } from "@/lib/youtube/commands/resolve-episode-blocker"
import { recordPublication } from "@/lib/youtube/commands/record-publication"
import type { CommandResult } from "@/lib/youtube/commands/command-result"

// Get repository instance
function getRepository() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not configured")
  }

  const sql = postgres(databaseUrl)
  return createEpisodeRepository(sql as any)
}

// Server action: Transition episode state
export async function transitionEpisodeStateAction(
  episodeId: string,
  expectedStateVersion: number,
  toState: string,
  reason?: string
): Promise<CommandResult<void>> {
  try {
    const repository = getRepository()
    return await transitionEpisodeState(repository, {
      episodeId,
      expectedStateVersion,
      toState,
      actor: "H:web",
      reason,
    })
  } catch (error) {
    return {
      success: false,
      reason: "invalid_input",
      message: `Failed to transition episode: ${(error as Error).message}`,
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
    const repository = getRepository()
    return await recordHumanDecision(repository, {
      episodeId,
      expectedStateVersion,
      outcome,
      label,
      actor: "H:web",
    })
  } catch (error) {
    return {
      success: false,
      reason: "invalid_input",
      message: `Failed to record decision: ${(error as Error).message}`,
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
    const repository = getRepository()
    return await addEpisodeBlocker(repository, {
      episodeId,
      expectedStateVersion,
      blockerId,
      label,
      severity,
      actor: "H:web",
    })
  } catch (error) {
    return {
      success: false,
      reason: "invalid_input",
      message: `Failed to add blocker: ${(error as Error).message}`,
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
    const repository = getRepository()
    return await resolveEpisodeBlocker(repository, {
      episodeId,
      expectedStateVersion,
      blockerId,
      actor: "H:web",
    })
  } catch (error) {
    return {
      success: false,
      reason: "invalid_input",
      message: `Failed to resolve blocker: ${(error as Error).message}`,
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
    const repository = getRepository()
    return await recordPublication(repository, {
      episodeId,
      expectedStateVersion,
      youtubeVideoId,
      publishedAt,
      actor: "H:web",
    })
  } catch (error) {
    return {
      success: false,
      reason: "invalid_input",
      message: `Failed to record publication: ${(error as Error).message}`,
    }
  }
}
