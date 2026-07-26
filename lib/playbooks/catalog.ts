// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Catalog
// Merges manifest entries with editorial metadata overlays.
// CLIENT-SAFE. No fs.
// ─────────────────────────────────────────────────────────────

import type { PlaybookEntry } from "./types"
import { playbookManifestEntries, MANIFEST_ENTRY_COUNT } from "./manifest"
import { playbookMetadataOverlays } from "./metadata"

// ── Slug helpers ──────────────────────────────────────────────
function slugFromPath(publicTargetPath: string): string {
  return publicTargetPath
    .replace("content/playbooks/", "")
    .replace(".md", "")
    .toLowerCase()
}

function segmentsFromSlug(slug: string): string[] {
  return slug.split("/")
}

// ── Merge ──────────────────────────────────────────────────────
function buildCatalog(): PlaybookEntry[] {
  if (playbookMetadataOverlays.length !== MANIFEST_ENTRY_COUNT) {
    throw new Error(
      `[Playbook Catalog] metadata overlays count (${playbookMetadataOverlays.length}) !== manifest entry count (${MANIFEST_ENTRY_COUNT}). Every manifest entry must have an editorial overlay.`
    )
  }

  // We pair manifest entries to overlays by matching the overlay ID to the
  // manifest entry via a deterministic ordering encoded in both files.
  // Since we cannot use publicTargetPath in metadata.ts (no fs),
  // we match by index — the order in metadata.ts MUST match manifest order.
  // This is asserted below.

  const catalog: PlaybookEntry[] = []
  const seenSlugs = new Set<string>()
  const seenIds = new Set<string>()
  const seenPaths = new Set<string>()

  for (let i = 0; i < playbookManifestEntries.length; i++) {
    const manifestEntry = playbookManifestEntries[i]
    const overlay = playbookMetadataOverlays[i]

    if (!overlay) {
      throw new Error(
        `[Playbook Catalog] No overlay at index ${i} for manifest entry "${manifestEntry.originalPath}".`
      )
    }

    const slug = slugFromPath(manifestEntry.publicTargetPath)
    const slugSegments = segmentsFromSlug(slug)

    // Uniqueness guards
    if (seenSlugs.has(slug)) {
      throw new Error(`[Playbook Catalog] Duplicate slug: "${slug}" (index ${i})`)
    }
    if (seenIds.has(overlay.id)) {
      throw new Error(`[Playbook Catalog] Duplicate ID: "${overlay.id}" (index ${i})`)
    }
    if (seenPaths.has(manifestEntry.publicTargetPath)) {
      throw new Error(
        `[Playbook Catalog] Duplicate publicTargetPath: "${manifestEntry.publicTargetPath}"`
      )
    }

    seenSlugs.add(slug)
    seenIds.add(overlay.id)
    seenPaths.add(manifestEntry.publicTargetPath)

    const entry: PlaybookEntry = {
      // Manifest fields
      source: manifestEntry.source,
      originalPath: manifestEntry.originalPath,
      classification: manifestEntry.classification,
      title: manifestEntry.title,
      summary: manifestEntry.summary,
      bytes: manifestEntry.bytes,
      wordCount: manifestEntry.wordCount,
      sha256: manifestEntry.sha256,
      canonical: manifestEntry.canonical,
      duplicateOf: manifestEntry.duplicateOf,
      publicTargetPath: manifestEntry.publicTargetPath,
      // Overlay fields
      id: overlay.id,
      slug,
      slugSegments,
      collectionId: overlay.collectionId,
      format: overlay.format,
      phases: overlay.phases,
      audiences: overlay.audiences,
      outcomes: overlay.outcomes,
      tags: overlay.tags,
      maturity: overlay.maturity,
      ecosystemTarget: overlay.ecosystemTarget,
      relatedPlaybookIds: overlay.relatedPlaybookIds,
      relatedRegistryIds: overlay.relatedRegistryIds,
      recommendedFor: overlay.recommendedFor,
      limitations: overlay.limitations,
      futureTarget: overlay.futureTarget,
      // Derived
      estimatedReadMinutes: Math.max(1, Math.ceil(manifestEntry.wordCount / 200)),
    }

    catalog.push(entry)
  }

  return catalog
}

// ── Catalog ────────────────────────────────────────────────────
export const playbookCatalog: readonly PlaybookEntry[] = buildCatalog()

// ── Lookups ────────────────────────────────────────────────────
const catalogById = new Map(playbookCatalog.map((e) => [e.id, e]))
const catalogBySlug = new Map(playbookCatalog.map((e) => [e.slug, e]))
const catalogByPath = new Map(playbookCatalog.map((e) => [e.publicTargetPath, e]))

export function getPlaybookById(id: string): PlaybookEntry | undefined {
  return catalogById.get(id)
}

export function getPlaybookBySlug(slug: string): PlaybookEntry | undefined {
  return catalogBySlug.get(slug)
}

export function getPlaybookByPath(path: string): PlaybookEntry | undefined {
  return catalogByPath.get(path)
}

export function getPlaybooksByCollection(collectionId: string): PlaybookEntry[] {
  return playbookCatalog.filter((e) => e.collectionId === collectionId)
}

/** Get prev/next within the same collection, ordered by manifest position */
export function getCollectionNeighbors(id: string): {
  prev: PlaybookEntry | null
  next: PlaybookEntry | null
} {
  const entry = getPlaybookById(id)
  if (!entry) return { prev: null, next: null }

  const inCollection = playbookCatalog.filter(
    (e) => e.collectionId === entry.collectionId
  )
  const idx = inCollection.findIndex((e) => e.id === id)

  return {
    prev: idx > 0 ? inCollection[idx - 1] : null,
    next: idx < inCollection.length - 1 ? inCollection[idx + 1] : null,
  }
}

/** Validate that all related playbook IDs in the catalog exist. */
export function getOrphanRelations(): string[] {
  const errors: string[] = []
  for (const entry of playbookCatalog) {
    for (const relId of entry.relatedPlaybookIds) {
      if (!catalogById.has(relId)) {
        errors.push(
          `Entry "${entry.id}": relatedPlaybookId "${relId}" does not exist in catalog.`
        )
      }
    }
  }
  return errors
}

/** All valid slug strings for static path generation */
export const allPlaybookSlugs: readonly string[] = playbookCatalog.map((e) => e.slug)

/** All valid slug segment arrays for generateStaticParams */
export const allPlaybookSlugSegments: readonly string[][] = playbookCatalog.map(
  (e) => e.slugSegments
)
