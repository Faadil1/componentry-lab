import type { NarrativeArchitecture, NarrativeBeat } from "./types"

export function buildNarrative(title: string, summary: string, cta: string, beats: NarrativeBeat[], voiceDirection: string, bRollStrategy: string, musicDirection: string, qaPriorities: string[]): NarrativeArchitecture {
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    summary,
    beats,
    voiceDirection,
    bRollStrategy,
    musicDirection,
    cta,
    qaPriorities,
  }
}