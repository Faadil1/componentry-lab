// ─────────────────────────────────────────────────────────────
// Registry V2 — Selectors & Filters
// ─────────────────────────────────────────────────────────────

import { registryComponents } from "./components"
import type {
  RegistryEntry,
  RegistryEntryId,
  RegistryEntryKind,
  RegistryCategoryId,
  RegistryMaturity,
  RegistryCapability,
  RegistryViewport,
  RegistryFilterState,
  RegistrySearchResult
} from "./types"

export function getRegistryEntryById(id: RegistryEntryId): RegistryEntry | undefined {
  return registryComponents.find((entry) => entry.id === id)
}

export function getRegistryEntryBySlug(slug: string): RegistryEntry | undefined {
  return registryComponents.find((entry) => entry.slug === slug)
}

export function getRegistryEntriesByKind(kind: RegistryEntryKind): RegistryEntry[] {
  return registryComponents.filter((entry) => entry.kind === kind)
}

export function getRegistryEntriesByCategory(catId: RegistryCategoryId): RegistryEntry[] {
  return registryComponents.filter((entry) => entry.categoryId === catId)
}

export function getRegistryEntriesByMaturity(maturity: RegistryMaturity): RegistryEntry[] {
  return registryComponents.filter((entry) => entry.maturity === maturity)
}

export function getRegistryEntriesByCapability(cap: RegistryCapability): RegistryEntry[] {
  return registryComponents.filter((entry) => entry.capabilities.includes(cap))
}

export function getRelatedRegistryEntries(id: RegistryEntryId): RegistryEntry[] {
  const entry = getRegistryEntryById(id)
  if (!entry) return []
  return entry.relations
    .map((rel) => getRegistryEntryById(rel.targetId))
    .filter((e): e is RegistryEntry => !!e)
}

export function searchRegistryEntries(query: string, entries: RegistryEntry[] = registryComponents): RegistrySearchResult[] {
  if (!query) {
    return entries.map((entry) => ({ entry, score: 1, matchedFields: [] }))
  }

  const cleanQuery = query.toLowerCase().trim()
  const terms = cleanQuery.split(/\s+/)

  return entries
    .map((entry) => {
      let score = 0
      const matchedFields: string[] = []

      const label = entry.label.toLowerCase()
      const summary = entry.summary.toLowerCase()
      const desc = entry.description.toLowerCase()
      const tags = entry.tags.map((t) => t.toLowerCase())
      const componentExports = (entry.componentExports || []).map((e) => e.toLowerCase())
      const hookExports = (entry.hookExports || []).map((e) => e.toLowerCase())

      for (const term of terms) {
        if (label.includes(term)) {
          score += 10
          if (!matchedFields.includes("label")) matchedFields.push("label")
        }
        if (summary.includes(term)) {
          score += 5
          if (!matchedFields.includes("summary")) matchedFields.push("summary")
        }
        if (desc.includes(term)) {
          score += 3
          if (!matchedFields.includes("description")) matchedFields.push("description")
        }
        if (tags.some((tag) => tag.includes(term))) {
          score += 4
          if (!matchedFields.includes("tags")) matchedFields.push("tags")
        }
        if (componentExports.some((exp) => exp.includes(term)) || hookExports.some((exp) => exp.includes(term))) {
          score += 6
          if (!matchedFields.includes("exports")) matchedFields.push("exports")
        }
      }

      return { entry, score, matchedFields }
    })
    .filter((res) => res.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
}

export function filterRegistryEntries(
  filters: Partial<RegistryFilterState>,
  entries: RegistryEntry[] = registryComponents
): RegistryEntry[] {
  return entries.filter((entry) => {
    // Kind filter
    if (filters.selectedKinds && filters.selectedKinds.length > 0) {
      if (!filters.selectedKinds.includes(entry.kind)) return false
    }

    // Category filter
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      if (!filters.selectedCategories.includes(entry.categoryId)) return false
    }

    // Maturity filter
    if (filters.selectedMaturities && filters.selectedMaturities.length > 0) {
      if (!filters.selectedMaturities.includes(entry.maturity)) return false
    }

    // Capability filter
    if (filters.selectedCapabilities && filters.selectedCapabilities.length > 0) {
      const hasAll = filters.selectedCapabilities.every((cap) => entry.capabilities.includes(cap))
      if (!hasAll) return false
    }

    // Viewport filter
    if (filters.selectedViewports && filters.selectedViewports.length > 0) {
      const hasAny = filters.selectedViewports.some((vp) => entry.supportedViewports.includes(vp))
      if (!hasAny) return false
    }

    // Runtime filter
    if (filters.selectedRuntime && filters.selectedRuntime !== "all") {
      if (!entry.runtimes.includes(filters.selectedRuntime)) return false
    }

    return true
  })
}

export function countRegistryFacets(entries: RegistryEntry[] = registryComponents) {
  const kinds: Record<RegistryEntryKind, number> = {
    interaction: 0,
    foundation: 0,
    layout: 0,
    system: 0,
    recipe: 0
  }

  const categories: Record<RegistryCategoryId, number> = {
    interaction: 0,
    typography: 0,
    "visual-foundation": 0,
    layout: 0,
    playback: 0,
    decision: 0,
    capture: 0,
    "product-composition": 0,
    "operational-composition": 0,
    "editorial-composition": 0,
    "broadcast-composition": 0
  }

  const maturities: Record<RegistryMaturity, number> = {
    experimental: 0,
    reusable: 0,
    "production-candidate": 0
  }

  const capabilities: Record<RegistryCapability, number> = {
    deterministic: 0,
    "capture-ready": 0,
    responsive: 0,
    "keyboard-accessible": 0,
    "reduced-motion": 0,
    "url-restorable": 0,
    stateful: 0,
    "timeline-controlled": 0,
    "evidence-driven": 0,
    "decision-traceable": 0,
    "clean-view": 0,
    exportable: 0,
    "composition-ready": 0,
    editorial: 0,
    broadcast: 0,
    operational: 0,
    product: 0,
    webgl: 0,
    svg: 0,
    "css-driven": 0,
    "mobile-compatible": 0,
    "arbitrary-content": 0
  }

  const viewports: Record<RegistryViewport, number> = {
    desktop: 0,
    laptop: 0,
    tablet: 0,
    mobile: 0,
    broadcast: 0,
    "portrait-video": 0
  }

  for (const entry of entries) {
    kinds[entry.kind]++
    categories[entry.categoryId]++
    maturities[entry.maturity]++
    for (const cap of entry.capabilities) {
      capabilities[cap]++
    }
    for (const vp of entry.supportedViewports) {
      viewports[vp]++
    }
  }

  return { kinds, categories, maturities, capabilities, viewports }
}

export function getRecommendedRegistryEntries(
  activeEntry: RegistryEntry,
  entries: RegistryEntry[] = registryComponents
): RegistryEntry[] {
  // Recommend entries sharing capabilities or category
  return entries
    .filter((e) => e.id !== activeEntry.id)
    .map((e) => {
      let score = 0
      if (e.categoryId === activeEntry.categoryId) score += 5
      if (e.kind === activeEntry.kind) score += 2
      const commonCaps = e.capabilities.filter((c) => activeEntry.capabilities.includes(c))
      score += commonCaps.length * 3
      return { entry: e, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.entry)
}
