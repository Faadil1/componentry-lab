// ─────────────────────────────────────────────────────────────
// Registry V2 — Core Types
// ─────────────────────────────────────────────────────────────

export type RegistryEntryId =
  // Interactions
  | "spotlight"
  | "split-flap"
  | "scrub-input"
  | "kinetic-text"
  | "scroll-choreography"
  | "webgl-liquid"
  | "image-ripple"
  // Foundations
  | "typography"
  | "foundations"
  | "layouts"
  // Reusable systems
  | "interaction-player"
  | "decision-systems"
  | "capture-bridge"
  // Recipes
  | "product-launch-recipe"
  | "operational-workspace-recipe"
  | "data-story-recipe"
  | "broadcast-package-recipe"
  // Workflow components
  | "episode-state-card"
  // Sub-entries / Primitives
  | "layout-shell"
  | "layout-stage"
  | "layout-split"
  | "signal-band"
  | "evidence-ledger"
  | "decision-gate"
  | "decision-trace"
  | "capture-workbench"
  | "recipe-workbench"

export type RegistryEntrySlug = string

export type RegistryEntryKind = "interaction" | "foundation" | "layout" | "system" | "recipe" | "workflow"

export type RegistryCategoryId =
  | "interaction"
  | "typography"
  | "visual-foundation"
  | "layout"
  | "playback"
  | "decision"
  | "capture"
  | "product-composition"
  | "operational-composition"
  | "editorial-composition"
  | "broadcast-composition"
  | "workflow"

export type RegistryMaturity = "experimental" | "reusable" | "production-candidate"

export type RegistryCapability =
  | "deterministic"
  | "capture-ready"
  | "responsive"
  | "keyboard-accessible"
  | "reduced-motion"
  | "url-restorable"
  | "stateful"
  | "timeline-controlled"
  | "evidence-driven"
  | "decision-traceable"
  | "clean-view"
  | "exportable"
  | "composition-ready"
  | "editorial"
  | "broadcast"
  | "operational"
  | "product"
  | "webgl"
  | "svg"
  | "css-driven"
  | "mobile-compatible"
  | "arbitrary-content"

export type RegistryRuntime =
  | "react"
  | "css"
  | "svg"
  | "webgl"
  | "browser-api"
  | "server-compatible"

export type RegistryViewport =
  | "desktop"
  | "laptop"
  | "tablet"
  | "mobile"
  | "broadcast"
  | "portrait-video"

export type RegistryRelationType =
  | "uses"
  | "composes"
  | "extends"
  | "depends-on"
  | "demonstrated-by"
  | "alternative-to"
  | "supports"
  | "captured-by"
  | "controlled-by"

export interface RegistryRelation {
  type: RegistryRelationType
  targetId: RegistryEntryId
}

export interface RegistryDependency {
  name: string
  version?: string
  optional: boolean
}

export interface RegistryUsageExample {
  title: string
  code: string
  language?: string
}

export interface RegistryAccessibilityProfile {
  keyboardNav: "full" | "partial" | "none"
  ariaRoles: string[]
  screenReaderAnnouncements: boolean
  contrastRatio: string
}

export interface RegistryCaptureProfile {
  remotionSupported: boolean
  playwrightSelectors: {
    root: string
    variants?: string[]
    controls?: string[]
  }
  recommendedViewport: {
    width: number
    height: number
    label: string
  }
  recommendedDurationSeconds: number
}

export interface RegistryEntry {
  id: RegistryEntryId
  slug: RegistryEntrySlug
  label: string
  shortLabel: string
  kind: RegistryEntryKind
  categoryId: RegistryCategoryId
  maturity: RegistryMaturity
  summary: string
  description: string
  route: string
  sourcePaths: string[]
  tags: string[]
  capabilities: RegistryCapability[]
  runtimes: RegistryRuntime[]
  supportedViewports: RegistryViewport[]
  deterministic: boolean
  captureReady: boolean
  ssrSafe: boolean
  accessibility: RegistryAccessibilityProfile
  dependencies: RegistryDependency[]
  relations: RegistryRelation[]
  usageExamples: RegistryUsageExample[]
  limitations: string[]
  recommendedFor: string[]
  avoidFor: string[]
  memoryHook?: string
  signatureInteraction?: string
  signatureFrame?: string
  primaryExport?: string
  componentExports?: string[]
  hookExports?: string[]
  metadata?: Record<string, string | number | boolean>
}

export interface RegistryCategory {
  id: RegistryCategoryId
  label: string
  shortDescription: string
  order: number
  accent?: string
  relatedKinds: RegistryEntryKind[]
  recommendedAudience: string
}

export interface RegistryFilterState {
  query: string
  selectedSourceKinds: string[]
  selectedResourceTypes: string[]
  selectedLifecycles: string[]
  selectedKinds: RegistryEntryKind[]
  selectedCategories: RegistryCategoryId[]
  selectedMaturities: RegistryMaturity[]
  selectedCapabilities: RegistryCapability[]
  selectedViewports: RegistryViewport[]
  selectedRuntime: RegistryRuntime | "all"
}

export interface RegistrySearchResult {
  entry: RegistryEntry
  score: number
  matchedFields: string[]
}

export interface RegistryIntegrityReport {
  valid: boolean
  errors: string[]
  warnings: string[]
  duplicateIds: RegistryEntryId[]
  duplicateSlugs: string[]
  unknownCategories: string[]
  invalidRelations: string[]
  missingSourcePaths: string[]
  missingLimitations: string[]
  orphanEntries: RegistryEntryId[]
}

import type { LibraryProjectionItem } from "@/lib/library/types"

export interface RegistryContext {
  state: RegistryFilterState & {
    viewMode: "grid" | "list"
    activeEntryId: string | null
    results: LibraryProjectionItem[]
    counts: {
      total: number
      components: number
      resources: number
      kinds: Record<RegistryEntryKind, number>
      categories: Record<RegistryCategoryId, number>
      maturities: Record<RegistryMaturity, number>
      capabilities: Record<RegistryCapability, number>
      viewports: Record<RegistryViewport, number>
    }
    resultCount: number
    filtersVisible: boolean
    detailVisible: boolean
    snapshot: Record<string, unknown>
  }
  actions: {
    setQuery: (q: string) => void
    toggleSourceKind: (kind: string) => void
    toggleResourceType: (type: string) => void
    toggleLifecycle: (lifecycle: string) => void
    toggleKind: (kind: RegistryEntryKind) => void
    toggleCategory: (cat: RegistryCategoryId) => void
    toggleMaturity: (maturity: RegistryMaturity) => void
    toggleCapability: (capability: RegistryCapability) => void
    toggleViewport: (vp: RegistryViewport) => void
    setRuntime: (runtime: RegistryRuntime | "all") => void
    setViewMode: (mode: "grid" | "list") => void
    selectEntry: (id: string | null) => void
    closeDetail: () => void
    clearFilters: () => void
    resetLibrary: () => void
    copySnapshot: () => Promise<void>
    copyEntry: (id: string) => Promise<void>
    copyUsageExample: (id: string) => Promise<void>
    toggleFiltersVisible: () => void
  }
}
