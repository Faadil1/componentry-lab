// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Playbook-to-Playbook Relations
// CLIENT-SAFE. No fs.
// ─────────────────────────────────────────────────────────────

import type { PlaybookRelation } from "./types"
import { playbookCatalog, getPlaybookById } from "./catalog"

// ── Relation index built from catalog relatedPlaybookIds ──────
// Each entry's relatedPlaybookIds creates bidirectional complement relations.

const relationIndex = new Map<string, PlaybookRelation[]>()

for (const entry of playbookCatalog) {
  if (!relationIndex.has(entry.id)) {
    relationIndex.set(entry.id, [])
  }
  for (const relatedId of entry.relatedPlaybookIds) {
    const target = getPlaybookById(relatedId)
    if (!target) continue // validated separately in validation.ts

    const relation: PlaybookRelation = {
      type: "complements",
      targetId: relatedId,
    }

    const existing = relationIndex.get(entry.id) ?? []
    if (!existing.some((r) => r.targetId === relatedId)) {
      existing.push(relation)
      relationIndex.set(entry.id, existing)
    }
  }
}

/** Get all relations for a playbook ID. */
export function getPlaybookRelations(id: string): PlaybookRelation[] {
  return relationIndex.get(id) ?? []
}

/** Get related PlaybookEntry objects for a given playbook ID. */
export function getRelatedPlaybooks(id: string) {
  const relations = getPlaybookRelations(id)
  return relations
    .map((r) => getPlaybookById(r.targetId))
    .filter((e): e is NonNullable<typeof e> => !!e)
}
