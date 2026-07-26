// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Manifest Parser
// ─────────────────────────────────────────────────────────────
// CLIENT-SAFE: no fs access. Imports from static JSON.
// ─────────────────────────────────────────────────────────────

import type { PlaybookManifestEntry } from "./types"
import rawManifest from "../../content/playbooks/_manifest/playbook-source-manifest.json"

// ── Manifest Shape ────────────────────────────────────────────
interface RawManifest {
  version: string
  sourceArchives: string[]
  policy: string
  entryCount: number
  entries: PlaybookManifestEntry[]
}

const manifest = rawManifest as RawManifest

// ── Compile-time assertion ─────────────────────────────────────
// This will surface as a runtime error at module load if the count
// ever drifts from the source of truth.
if (manifest.entries.length !== manifest.entryCount) {
  throw new Error(
    `[Playbook Manifest] entries.length (${manifest.entries.length}) !== entryCount (${manifest.entryCount}). The manifest is corrupt.`
  )
}

const SUPPORTED_CLASSIFICATIONS = new Set(["public-playbook", "public-reference"])

for (const entry of manifest.entries) {
  if (!SUPPORTED_CLASSIFICATIONS.has(entry.classification)) {
    throw new Error(
      `[Playbook Manifest] Entry "${entry.originalPath}" has unsupported classification: "${entry.classification}". Private content must not be exposed.`
    )
  }
  if (!entry.canonical) {
    throw new Error(
      `[Playbook Manifest] Non-canonical entry found: "${entry.originalPath}". Only canonical entries must be exposed.`
    )
  }
  if (entry.publicTargetPath.startsWith("content/playbooks/_manifest")) {
    throw new Error(
      `[Playbook Manifest] Entry targets a _manifest path: "${entry.publicTargetPath}". Manifest control files must not be exposed.`
    )
  }
}

// ── Public Exports ─────────────────────────────────────────────
export const playbookManifestVersion = manifest.version
export const playbookSourceArchives = manifest.sourceArchives
export const playbookPolicy = manifest.policy
export const MANIFEST_ENTRY_COUNT = manifest.entryCount
export const playbookManifestEntries: readonly PlaybookManifestEntry[] =
  manifest.entries

/** Lookup a manifest entry by its publicTargetPath. */
export function getManifestEntryByPath(
  publicTargetPath: string
): PlaybookManifestEntry | undefined {
  return manifest.entries.find((e) => e.publicTargetPath === publicTargetPath)
}

/** Quick summary stats from the manifest. */
export const playbookManifestStats = {
  total: manifest.entryCount,
  sources: {
    uiux: manifest.entries.filter((e) => e.source === "uiux").length,
    hackathon: manifest.entries.filter((e) => e.source === "hackathon").length,
  },
  classifications: {
    "public-playbook": manifest.entries.filter(
      (e) => e.classification === "public-playbook"
    ).length,
    "public-reference": manifest.entries.filter(
      (e) => e.classification === "public-reference"
    ).length,
  },
  totalWords: manifest.entries.reduce((sum, e) => sum + e.wordCount, 0),
  totalBytes: manifest.entries.reduce((sum, e) => sum + e.bytes, 0),
} as const
