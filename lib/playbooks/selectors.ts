// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Selectors & Search
// Pure functions. CLIENT-SAFE. No fs. No side effects.
// ─────────────────────────────────────────────────────────────

import type {
  PlaybookEntry,
  PlaybookFilterState,
  PlaybookSearchResult,
  PlaybookCounts,
} from "./types"
import { playbookCatalog } from "./catalog"

// ── Normalizer ────────────────────────────────────────────────
function normalize(s: string): string {
  return s.toLowerCase().trim()
}

// ── Bounded search index ──────────────────────────────────────
// Extracted at module load. Never transfers full Markdown bodies to the client.
interface PlaybookSearchToken {
  id: string
  fields: {
    title: string
    summary: string
    originalPath: string
    tags: string
    collectionId: string
    format: string
    phases: string
    audiences: string
    outcomes: string
  }
}

const searchIndex: PlaybookSearchToken[] = playbookCatalog.map((e) => ({
  id: e.id,
  fields: {
    title: normalize(e.title),
    summary: normalize(e.summary),
    originalPath: normalize(e.originalPath),
    tags: normalize(e.tags.join(" ")),
    collectionId: normalize(e.collectionId),
    format: normalize(e.format),
    phases: normalize(e.phases.join(" ")),
    audiences: normalize(e.audiences.join(" ")),
    outcomes: normalize(e.outcomes.join(" ")),
  },
}))

// ── Score computation ─────────────────────────────────────────
const FIELD_WEIGHTS: Record<keyof PlaybookSearchToken["fields"], number> = {
  title: 10,
  summary: 6,
  tags: 5,
  collectionId: 4,
  format: 3,
  phases: 3,
  audiences: 3,
  outcomes: 3,
  originalPath: 2,
}

function scoreEntry(token: PlaybookSearchToken, query: string): number {
  if (!query) return 0
  const terms = query.split(/\s+/).filter(Boolean)
  let score = 0

  for (const term of terms) {
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS) as [
      keyof PlaybookSearchToken["fields"],
      number,
    ][]) {
      const value = token.fields[field]
      if (value.includes(term)) {
        // Exact match in a field gets full weight
        if (value === term) {
          score += weight * 2
        } else if (value.startsWith(term) || value.includes(` ${term}`)) {
          score += weight * 1.5
        } else {
          score += weight
        }
      }
    }
  }

  return score
}

function getMatchedFields(token: PlaybookSearchToken, query: string): string[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const matched: string[] = []
  for (const [field] of Object.entries(token.fields)) {
    const value = token.fields[field as keyof PlaybookSearchToken["fields"]]
    if (terms.some((t) => value.includes(t))) {
      matched.push(field)
    }
  }
  return matched
}

// ── Main search function ──────────────────────────────────────
export function searchPlaybooks(query: string): PlaybookSearchResult[] {
  const q = normalize(query)
  if (!q) {
    return playbookCatalog.map((entry) => ({
      entry,
      score: 0,
      matchedFields: [],
    }))
  }

  const results: PlaybookSearchResult[] = []

  for (const token of searchIndex) {
    const score = scoreEntry(token, q)
    if (score > 0) {
      const entry = playbookCatalog.find((e) => e.id === token.id)
      if (entry) {
        results.push({
          entry,
          score,
          matchedFields: getMatchedFields(token, q),
        })
      }
    }
  }

  // Sort: descending score, stable on equal scores by manifest order
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const idxA = playbookCatalog.findIndex((e) => e.id === a.entry.id)
    const idxB = playbookCatalog.findIndex((e) => e.id === b.entry.id)
    return idxA - idxB
  })

  return results
}

// ── Filter function ───────────────────────────────────────────
export function filterPlaybooks(
  entries: PlaybookEntry[],
  filters: PlaybookFilterState
): PlaybookEntry[] {
  return entries.filter((entry) => {
    if (
      filters.selectedCollections.length > 0 &&
      !filters.selectedCollections.includes(entry.collectionId)
    )
      return false

    if (
      filters.selectedSources.length > 0 &&
      !filters.selectedSources.includes(entry.source)
    )
      return false

    if (
      filters.selectedFormats.length > 0 &&
      !filters.selectedFormats.includes(entry.format)
    )
      return false

    if (
      filters.selectedPhases.length > 0 &&
      !filters.selectedPhases.some((p) => entry.phases.includes(p))
    )
      return false

    if (
      filters.selectedAudiences.length > 0 &&
      !filters.selectedAudiences.some((a) => entry.audiences.includes(a))
    )
      return false

    if (
      filters.selectedOutcomes.length > 0 &&
      !filters.selectedOutcomes.some((o) => entry.outcomes.includes(o))
    )
      return false

    if (
      filters.selectedEcosystemTargets.length > 0 &&
      !filters.selectedEcosystemTargets.includes(entry.ecosystemTarget)
    )
      return false

    return true
  })
}

// ── Combined search + filter ──────────────────────────────────
export function queryPlaybooks(
  filters: PlaybookFilterState
): PlaybookEntry[] {
  let pool: PlaybookEntry[]

  if (filters.query.trim()) {
    const results = searchPlaybooks(normalize(filters.query))
    pool = results.map((r) => r.entry)
  } else {
    pool = [...playbookCatalog]
  }

  return filterPlaybooks(pool, filters)
}

// ── Count computation ─────────────────────────────────────────
export function computePlaybookCounts(entries: PlaybookEntry[]): PlaybookCounts {
  const counts: PlaybookCounts = {
    collections: {
      "positioning-judging": 0,
      uiux: 0,
      "demo-video": 0,
      "visual-references": 0,
      "hackathon-evidence": 0,
      "hackathon-gates": 0,
      "hackathon-templates": 0,
      "hackathon-ux-ui": 0,
    },
    sources: { uiux: 0, hackathon: 0 },
    formats: {},
    phases: {},
    audiences: {},
    outcomes: {},
    ecosystems: {},
    total: entries.length,
    canonical: entries.filter((e) => e.canonical).length,
    publicPlaybook: entries.filter((e) => e.classification === "public-playbook").length,
    publicReference: entries.filter((e) => e.classification === "public-reference").length,
  }

  for (const e of entries) {
    if (e.collectionId in counts.collections) {
      counts.collections[e.collectionId as keyof typeof counts.collections]++
    }
    counts.sources[e.source]++
    counts.formats[e.format] = (counts.formats[e.format] ?? 0) + 1
    counts.ecosystems[e.ecosystemTarget] = (counts.ecosystems[e.ecosystemTarget] ?? 0) + 1
    for (const phase of e.phases) {
      counts.phases[phase] = (counts.phases[phase] ?? 0) + 1
    }
    for (const audience of e.audiences) {
      counts.audiences[audience] = (counts.audiences[audience] ?? 0) + 1
    }
    for (const outcome of e.outcomes) {
      counts.outcomes[outcome] = (counts.outcomes[outcome] ?? 0) + 1
    }
  }

  return counts
}

/** Returns the full counts for all 61 catalog entries (for hero stats). */
export const fullCatalogCounts = computePlaybookCounts([...playbookCatalog])
