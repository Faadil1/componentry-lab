// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Core Types
// ─────────────────────────────────────────────────────────────

export type PlaybookId = string
export type PlaybookSlug = string
export type PlaybookSlugSegments = string[]

// ── Sources ──────────────────────────────────────────────────
export type PlaybookSource = "uiux" | "hackathon"

// ── Classifications ───────────────────────────────────────────
export type PlaybookClassification = "public-playbook" | "public-reference"

// ── Collections ───────────────────────────────────────────────
export type PlaybookCollectionId =
  | "positioning-judging"
  | "uiux"
  | "demo-video"
  | "visual-references"
  | "hackathon-evidence"
  | "hackathon-gates"
  | "hackathon-templates"
  | "hackathon-ux-ui"

// ── Formats ───────────────────────────────────────────────────
export type PlaybookFormat =
  | "principle"
  | "blueprint"
  | "system"
  | "pattern"
  | "method"
  | "checklist"
  | "prompt-set"
  | "template"
  | "gate"
  | "script"
  | "reference"
  | "launch-pack"
  | "operating-module"

// ── Phases ────────────────────────────────────────────────────
export type PlaybookPhase =
  | "qualify"
  | "research"
  | "position"
  | "differentiate"
  | "plan"
  | "design"
  | "build"
  | "verify"
  | "audit"
  | "present"
  | "submit"
  | "launch"
  | "retrospective"

// ── Audiences ─────────────────────────────────────────────────
export type PlaybookAudience =
  | "product-designer"
  | "ui-designer"
  | "ux-researcher"
  | "developer"
  | "founder"
  | "hackathon-builder"
  | "creative-director"
  | "video-editor"
  | "demo-producer"
  | "submission-lead"
  | "judge-facing-team"

// ── Outcomes ──────────────────────────────────────────────────
export type PlaybookOutcome =
  | "positioning"
  | "judge-clarity"
  | "hero-copy"
  | "interface-architecture"
  | "visual-direction"
  | "responsive-design"
  | "evidence"
  | "technical-proof"
  | "interaction-design"
  | "demo-script"
  | "video-production"
  | "submission"
  | "research"
  | "differentiation"
  | "naming"
  | "audit"
  | "portfolio"
  | "social-launch"
  | "retrospective"

// ── Maturity ──────────────────────────────────────────────────
export type PlaybookMaturity = "reference" | "active" | "foundational"

// ── Ecosystem Targets ─────────────────────────────────────────
export type PlaybookEcosystemTarget =
  | "componentry"
  | "universal-demo-film-kit"
  | "shared"
  | "reference-only"

// ── Relations ─────────────────────────────────────────────────
export type PlaybookRelationType =
  | "references"
  | "extends"
  | "complements"
  | "precedes"
  | "follows"
  | "alternative-to"

export interface PlaybookRelation {
  type: PlaybookRelationType
  targetId: PlaybookId
  note?: string
}

// ── Registry Relations ────────────────────────────────────────
export type PlaybookRegistryRelationType =
  | "demonstrates"
  | "requires"
  | "extends"
  | "informs"
  | "produces-for"

export interface PlaybookRegistryRelation {
  playbookId: PlaybookId
  registryId: string
  type: PlaybookRegistryRelationType
  note?: string
}

// ── Category ──────────────────────────────────────────────────
export interface PlaybookCategory {
  id: PlaybookCollectionId
  label: string
  description: string
  sourceFocus: PlaybookSource | "both"
  contentType: string
  primaryAudience: PlaybookAudience[]
  recommendedUsage: string
  limitations: string
  order: number
}

// ── Manifest Entry (from JSON) ────────────────────────────────
export interface PlaybookManifestEntry {
  source: PlaybookSource
  originalPath: string
  classification: PlaybookClassification
  title: string
  summary: string
  bytes: number
  wordCount: number
  sha256: string
  canonical: boolean
  duplicateOf: string | null
  publicTargetPath: string
}

// ── Editorial Metadata Overlay ────────────────────────────────
export interface PlaybookMetadataOverlay {
  id: PlaybookId
  slug: PlaybookSlug
  slugSegments: PlaybookSlugSegments
  collectionId: PlaybookCollectionId
  format: PlaybookFormat
  phases: PlaybookPhase[]
  audiences: PlaybookAudience[]
  outcomes: PlaybookOutcome[]
  tags: string[]
  maturity: PlaybookMaturity
  ecosystemTarget: PlaybookEcosystemTarget
  relatedPlaybookIds: PlaybookId[]
  relatedRegistryIds: string[]
  recommendedFor: string[]
  limitations: string[]
  futureTarget?: string
}

// ── Merged Playbook Entry ─────────────────────────────────────
export interface PlaybookEntry
  extends PlaybookManifestEntry,
    PlaybookMetadataOverlay {
  // estimatedReadMinutes derived from wordCount
  estimatedReadMinutes: number
}

// ── Document (server-only, includes content) ──────────────────
export interface PlaybookHeading {
  level: 1 | 2 | 3 | 4
  text: string
  id: string
}

export interface PlaybookDocument {
  entry: PlaybookEntry
  headings: PlaybookHeading[]
  nodes: PlaybookMarkdownNode[]
  prevEntry: PlaybookEntry | null
  nextEntry: PlaybookEntry | null
}

// ── Markdown Nodes ────────────────────────────────────────────
export type PlaybookMarkdownNode =
  | { type: "heading"; level: 1 | 2 | 3 | 4; id: string; text: string }
  | { type: "paragraph"; text: string; inlines: PlaybookInlineNode[] }
  | { type: "unordered-list"; items: PlaybookListItem[] }
  | { type: "ordered-list"; items: PlaybookListItem[] }
  | { type: "blockquote"; children: PlaybookMarkdownNode[] }
  | { type: "code-fence"; lang: string; code: string }
  | { type: "hr" }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "blank" }

export interface PlaybookListItem {
  inlines: PlaybookInlineNode[]
  children?: PlaybookListItem[]
}

export type PlaybookInlineNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "link"; href: string; label: string; external: boolean }
  | { type: "arrow"; value: string }

// ── Reading Paths ─────────────────────────────────────────────
export interface PlaybookReadingPathStep {
  playbookId: PlaybookId
  reason: string
}

export interface PlaybookReadingPath {
  id: string
  label: string
  description: string
  audience: PlaybookAudience[]
  intendedOutcome: PlaybookOutcome[]
  steps: PlaybookReadingPathStep[]
  estimatedMinutes: number
  relatedRegistryIds: string[]
  ecosystemTarget: PlaybookEcosystemTarget
  futureTarget?: string
}

// ── Filter State ──────────────────────────────────────────────
export interface PlaybookFilterState {
  query: string
  selectedCollections: PlaybookCollectionId[]
  selectedSources: PlaybookSource[]
  selectedFormats: PlaybookFormat[]
  selectedPhases: PlaybookPhase[]
  selectedAudiences: PlaybookAudience[]
  selectedOutcomes: PlaybookOutcome[]
  selectedEcosystemTargets: PlaybookEcosystemTarget[]
}

// ── Search Result ─────────────────────────────────────────────
export interface PlaybookSearchResult {
  entry: PlaybookEntry
  score: number
  matchedFields: string[]
}

// ── Snapshot ──────────────────────────────────────────────────
export type PlaybookSnapshot = PlaybookFilterState & {
  viewMode: "grid" | "list"
  activePlaybookId: PlaybookId | null
  resultCount: number
  timestamp: string
}

// ── Integrity Report ──────────────────────────────────────────
export interface PlaybookIntegrityReport {
  valid: boolean
  errors: string[]
  warnings: string[]
  manifestEntryCount: number
  catalogEntryCount: number
  missingFiles: string[]
  unknownMetadataIds: string[]
  duplicatePaths: string[]
  duplicateSlugs: string[]
  invalidRelatedPlaybookIds: string[]
  invalidRegistryIds: string[]
  invalidReadingPathSteps: string[]
  nonCanonicalEntries: string[]
  unsupportedClassifications: string[]
  orphanPlaybooks: string[]
  orphanRegistryRelations: string[]
}

// ── Counts ────────────────────────────────────────────────────
export interface PlaybookCounts {
  collections: Record<PlaybookCollectionId, number>
  sources: Record<PlaybookSource, number>
  formats: Partial<Record<PlaybookFormat, number>>
  phases: Partial<Record<PlaybookPhase, number>>
  audiences: Partial<Record<PlaybookAudience, number>>
  outcomes: Partial<Record<PlaybookOutcome, number>>
  ecosystems: Partial<Record<PlaybookEcosystemTarget, number>>
  total: number
  canonical: number
  publicPlaybook: number
  publicReference: number
}

// ── Context ───────────────────────────────────────────────────
export interface PlaybookContext {
  state: PlaybookFilterState & {
    viewMode: "grid" | "list"
    activePlaybookId: PlaybookId | null
    filtersVisible: boolean
    previewVisible: boolean
    selectedReadingPathId: string | null
    results: PlaybookEntry[]
    resultCount: number
    counts: PlaybookCounts
    snapshot: PlaybookSnapshot
  }
  actions: {
    setQuery: (q: string) => void
    toggleCollection: (id: PlaybookCollectionId) => void
    toggleSource: (src: PlaybookSource) => void
    toggleFormat: (fmt: PlaybookFormat) => void
    togglePhase: (phase: PlaybookPhase) => void
    toggleAudience: (audience: PlaybookAudience) => void
    toggleOutcome: (outcome: PlaybookOutcome) => void
    toggleEcosystemTarget: (target: PlaybookEcosystemTarget) => void
    setViewMode: (mode: "grid" | "list") => void
    selectPlaybook: (id: PlaybookId | null) => void
    closePreview: () => void
    clearFilters: () => void
    resetPlaybooks: () => void
    selectReadingPath: (id: string | null) => void
    toggleFiltersVisible: () => void
    copySnapshot: () => Promise<void>
    copyPlaybookMetadata: (id: PlaybookId) => Promise<void>
    copyReadingPath: (id: string) => Promise<void>
  }
}
