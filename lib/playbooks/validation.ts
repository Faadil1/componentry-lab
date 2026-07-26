// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Validation
// CLIENT-SAFE. No fs.
// ─────────────────────────────────────────────────────────────

import type { PlaybookIntegrityReport } from "./types"
import { playbookCatalog } from "./catalog"
import { MANIFEST_ENTRY_COUNT } from "./manifest"
import { KNOWN_PLAYBOOK_IDS } from "./metadata"
import { CONFIRMED_REGISTRY_IDS, allRegistryRelations } from "./registry-relations"
import { playbookReadingPaths } from "./reading-paths"

// ── Validate Manifest ─────────────────────────────────────────
export function validatePlaybookManifest(): Pick<
  PlaybookIntegrityReport,
  | "errors"
  | "warnings"
  | "manifestEntryCount"
  | "nonCanonicalEntries"
  | "unsupportedClassifications"
> {
  const errors: string[] = []
  const warnings: string[] = []
  const nonCanonicalEntries: string[] = []
  const unsupportedClassifications: string[] = []

  const ALLOWED = new Set(["public-playbook", "public-reference"])

  for (const entry of playbookCatalog) {
    if (!entry.canonical) {
      nonCanonicalEntries.push(entry.id)
      errors.push(`Non-canonical entry in catalog: "${entry.id}"`)
    }
    if (!ALLOWED.has(entry.classification)) {
      unsupportedClassifications.push(entry.id)
      errors.push(
        `Unsupported classification "${entry.classification}" in entry: "${entry.id}"`
      )
    }
    if (entry.publicTargetPath.includes("_manifest")) {
      errors.push(
        `Entry "${entry.id}" exposes a _manifest path: "${entry.publicTargetPath}"`
      )
    }
  }

  return {
    manifestEntryCount: MANIFEST_ENTRY_COUNT,
    errors,
    warnings,
    nonCanonicalEntries,
    unsupportedClassifications,
  }
}

// ── Validate Catalog ──────────────────────────────────────────
export function validatePlaybookCatalog(): Pick<
  PlaybookIntegrityReport,
  | "errors"
  | "warnings"
  | "catalogEntryCount"
  | "duplicatePaths"
  | "duplicateSlugs"
  | "invalidRelatedPlaybookIds"
  | "invalidRegistryIds"
  | "orphanPlaybooks"
  | "orphanRegistryRelations"
> {
  const errors: string[] = []
  const warnings: string[] = []
  const duplicatePaths: string[] = []
  const duplicateSlugs: string[] = []
  const invalidRelatedPlaybookIds: string[] = []
  const invalidRegistryIds: string[] = []
  const orphanPlaybooks: string[] = []
  const orphanRegistryRelations: string[] = []

  const seenPaths = new Map<string, string>()
  const seenSlugs = new Map<string, string>()

  for (const entry of playbookCatalog) {
    // Duplicate path check
    if (seenPaths.has(entry.publicTargetPath)) {
      duplicatePaths.push(entry.id)
      errors.push(
        `Duplicate publicTargetPath "${entry.publicTargetPath}": found in "${entry.id}" and "${seenPaths.get(entry.publicTargetPath)}"`
      )
    } else {
      seenPaths.set(entry.publicTargetPath, entry.id)
    }

    // Duplicate slug check
    if (seenSlugs.has(entry.slug)) {
      duplicateSlugs.push(entry.id)
      errors.push(
        `Duplicate slug "${entry.slug}": found in "${entry.id}" and "${seenSlugs.get(entry.slug)}"`
      )
    } else {
      seenSlugs.set(entry.slug, entry.id)
    }

    // Related playbook IDs check
    for (const relId of entry.relatedPlaybookIds) {
      if (!KNOWN_PLAYBOOK_IDS.has(relId)) {
        invalidRelatedPlaybookIds.push(`${entry.id} → ${relId}`)
        errors.push(
          `Entry "${entry.id}": relatedPlaybookId "${relId}" does not exist in catalog.`
        )
      }
    }

    // Related registry IDs check
    for (const regId of entry.relatedRegistryIds) {
      if (!CONFIRMED_REGISTRY_IDS.has(regId)) {
        invalidRegistryIds.push(`${entry.id} → ${regId}`)
        errors.push(
          `Entry "${entry.id}": relatedRegistryId "${regId}" is not a confirmed Registry V2 ID.`
        )
      }
    }
  }

  // Registry relation consistency check
  for (const rel of allRegistryRelations) {
    if (!KNOWN_PLAYBOOK_IDS.has(rel.playbookId)) {
      orphanRegistryRelations.push(`${rel.playbookId} → ${rel.registryId}`)
      errors.push(
        `Registry relation targets unknown playbook ID: "${rel.playbookId}"`
      )
    }
    if (!CONFIRMED_REGISTRY_IDS.has(rel.registryId)) {
      orphanRegistryRelations.push(`${rel.playbookId} → ${rel.registryId}`)
      errors.push(
        `Registry relation targets unknown Registry V2 ID: "${rel.registryId}"`
      )
    }
  }

  // Orphan check: playbooks not referenced in any reading path
  const referencedInPaths = new Set(
    playbookReadingPaths.flatMap((p) => p.steps.map((s) => s.playbookId))
  )
  for (const entry of playbookCatalog) {
    if (!referencedInPaths.has(entry.id)) {
      orphanPlaybooks.push(entry.id)
      warnings.push(
        `Playbook "${entry.id}" is not referenced in any reading path (warning only).`
      )
    }
  }

  return {
    catalogEntryCount: playbookCatalog.length,
    errors,
    warnings,
    duplicatePaths,
    duplicateSlugs,
    invalidRelatedPlaybookIds,
    invalidRegistryIds,
    orphanPlaybooks,
    orphanRegistryRelations,
  }
}

// ── Reading path validation ───────────────────────────────────
export function validateReadingPaths(): Pick<
  PlaybookIntegrityReport,
  "errors" | "invalidReadingPathSteps"
> {
  const errors: string[] = []
  const invalidReadingPathSteps: string[] = []
  const catalogIds = new Set(playbookCatalog.map((e) => e.id))

  for (const path of playbookReadingPaths) {
    for (const step of path.steps) {
      if (!catalogIds.has(step.playbookId)) {
        invalidReadingPathSteps.push(`${path.id} → ${step.playbookId}`)
        errors.push(
          `Reading path "${path.id}": step references unknown playbook ID "${step.playbookId}".`
        )
      }
    }
  }

  return { errors, invalidReadingPathSteps }
}

// ── Full assertion ────────────────────────────────────────────
export function assertPlaybookIntegrity(): PlaybookIntegrityReport {
  const manifestResult = validatePlaybookManifest()
  const catalogResult = validatePlaybookCatalog()
  const pathResult = validateReadingPaths()

  const allErrors = [
    ...manifestResult.errors,
    ...catalogResult.errors,
    ...pathResult.errors,
  ]
  const allWarnings = [
    ...manifestResult.warnings,
    ...catalogResult.warnings,
  ]

  const report: PlaybookIntegrityReport = {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    manifestEntryCount: manifestResult.manifestEntryCount,
    catalogEntryCount: catalogResult.catalogEntryCount,
    missingFiles: [], // Checked server-side in content.server.ts
    unknownMetadataIds: [],
    duplicatePaths: catalogResult.duplicatePaths,
    duplicateSlugs: catalogResult.duplicateSlugs,
    invalidRelatedPlaybookIds: catalogResult.invalidRelatedPlaybookIds,
    invalidRegistryIds: catalogResult.invalidRegistryIds,
    invalidReadingPathSteps: pathResult.invalidReadingPathSteps,
    nonCanonicalEntries: manifestResult.nonCanonicalEntries,
    unsupportedClassifications: manifestResult.unsupportedClassifications,
    orphanPlaybooks: catalogResult.orphanPlaybooks,
    orphanRegistryRelations: catalogResult.orphanRegistryRelations,
  }

  if (!report.valid) {
    const errorSummary = report.errors.slice(0, 5).join("\n")
    throw new Error(
      `[Playbook Integrity] FAILED — ${report.errors.length} error(s). First errors:\n${errorSummary}`
    )
  }

  return report
}
