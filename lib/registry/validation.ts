// ─────────────────────────────────────────────────────────────
// Registry V2 — Validation & Integrity
// ─────────────────────────────────────────────────────────────

import { registryComponents } from "./components"
import { registryCategories } from "./categories"
import type { RegistryIntegrityReport, RegistryEntryId } from "./types"

export function validateRegistry(): RegistryIntegrityReport {
  const errors: string[] = []
  const warnings: string[] = []
  const duplicateIds: RegistryEntryId[] = []
  const duplicateSlugs: string[] = []
  const unknownCategories: string[] = []
  const invalidRelations: string[] = []
  const missingSourcePaths: string[] = []
  const missingLimitations: string[] = []
  const orphanEntries: RegistryEntryId[] = []

  const ids = new Set<string>()
  const slugs = new Set<string>()
  const validIds = new Set<string>(registryComponents.map((c) => c.id))

  // Track parent dependencies to find orphans
  const relationTargets = new Set<string>()

  for (const entry of registryComponents) {
    // Duplicate ID check
    if (ids.has(entry.id)) {
      errors.push(`Duplicate RegistryEntryId detected: ${entry.id}`)
      if (!duplicateIds.includes(entry.id)) duplicateIds.push(entry.id)
    }
    ids.add(entry.id)

    // Duplicate Slug check
    if (slugs.has(entry.slug)) {
      errors.push(`Duplicate slug detected: ${entry.slug}`)
      if (!duplicateSlugs.includes(entry.slug)) duplicateSlugs.push(entry.slug)
    }
    slugs.add(entry.slug)

    // Category existence check
    if (!registryCategories[entry.categoryId]) {
      errors.push(`Entry "${entry.id}" refers to unknown CategoryId: ${entry.categoryId}`)
      if (!unknownCategories.includes(entry.categoryId)) unknownCategories.push(entry.categoryId)
    }

    // Viewports check
    if (entry.supportedViewports.length === 0) {
      errors.push(`Entry "${entry.id}" does not specify any supported viewports.`)
    }

    // Source paths check for reusable components
    if (entry.maturity === "reusable" && entry.sourcePaths.length === 0) {
      errors.push(`Reusable Entry "${entry.id}" must declare sourcePaths.`)
      if (!missingSourcePaths.includes(entry.id)) missingSourcePaths.push(entry.id)
    }

    // Limitations check
    if (entry.limitations.length === 0) {
      warnings.push(`Entry "${entry.id}" has no documented limitations.`)
      if (!missingLimitations.includes(entry.id)) missingLimitations.push(entry.id)
    }

    // Relations validation
    for (const rel of entry.relations) {
      if (rel.targetId === entry.id) {
        errors.push(`Entry "${entry.id}" contains invalid self-relation: ${rel.type} -> ${rel.targetId}`)
      }
      if (!validIds.has(rel.targetId)) {
        errors.push(`Entry "${entry.id}" links to unknown relation targetId: ${rel.targetId}`)
        invalidRelations.push(`${entry.id} -> ${rel.targetId}`)
      }
      relationTargets.add(rel.targetId)
    }
  }

  // Orphan checks
  for (const entry of registryComponents) {
    if (!relationTargets.has(entry.id) && entry.kind !== "recipe") {
      warnings.push(`Orphan entry detected (no other system composes or references it): ${entry.id}`)
      orphanEntries.push(entry.id)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    duplicateIds,
    duplicateSlugs,
    unknownCategories,
    invalidRelations,
    missingSourcePaths,
    missingLimitations,
    orphanEntries
  }
}

export function assertRegistryIntegrity(): void {
  const report = validateRegistry()
  if (!report.valid) {
    throw new Error(
      `Registry Integrity assertion failed!\n` +
      `Errors:\n${report.errors.map((e) => ` - ${e}`).join("\n")}`
    )
  }
}
