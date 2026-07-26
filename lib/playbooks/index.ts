// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Public Barrel
// CLIENT-SAFE exports only.
// content.server.ts is intentionally NOT re-exported here.
// ─────────────────────────────────────────────────────────────

export type {
  PlaybookId,
  PlaybookSlug,
  PlaybookSlugSegments,
  PlaybookSource,
  PlaybookClassification,
  PlaybookCollectionId,
  PlaybookFormat,
  PlaybookPhase,
  PlaybookAudience,
  PlaybookOutcome,
  PlaybookMaturity,
  PlaybookEcosystemTarget,
  PlaybookRelationType,
  PlaybookRelation,
  PlaybookRegistryRelationType,
  PlaybookRegistryRelation,
  PlaybookCategory,
  PlaybookManifestEntry,
  PlaybookMetadataOverlay,
  PlaybookEntry,
  PlaybookHeading,
  PlaybookDocument,
  PlaybookMarkdownNode,
  PlaybookListItem,
  PlaybookInlineNode,
  PlaybookReadingPathStep,
  PlaybookReadingPath,
  PlaybookFilterState,
  PlaybookSearchResult,
  PlaybookSnapshot,
  PlaybookIntegrityReport,
  PlaybookCounts,
  PlaybookContext,
} from "./types"

export { playbookCategories, playbookCategoryList } from "./categories"

export {
  playbookManifestVersion,
  playbookSourceArchives,
  playbookPolicy,
  MANIFEST_ENTRY_COUNT,
  playbookManifestEntries,
  getManifestEntryByPath,
  playbookManifestStats,
} from "./manifest"

export {
  playbookCatalog,
  getPlaybookById,
  getPlaybookBySlug,
  getPlaybookByPath,
  getPlaybooksByCollection,
  getCollectionNeighbors,
  getOrphanRelations,
  allPlaybookSlugs,
  allPlaybookSlugSegments,
} from "./catalog"

export {
  getPlaybookRelations,
  getRelatedPlaybooks,
} from "./relations"

export {
  CONFIRMED_REGISTRY_IDS,
  allRegistryRelations,
  getRegistryRelationsForPlaybook,
  getPlaybooksForRegistryEntry,
  getRelatedRegistryIds,
} from "./registry-relations"

export {
  playbookReadingPaths,
  getReadingPathById,
  getReadingPathsContaining,
} from "./reading-paths"

export {
  searchPlaybooks,
  filterPlaybooks,
  queryPlaybooks,
  computePlaybookCounts,
  fullCatalogCounts,
} from "./selectors"

export {
  validatePlaybookManifest,
  validatePlaybookCatalog,
  validateReadingPaths,
  assertPlaybookIntegrity,
} from "./validation"

export { parseMarkdown, extractHeadings } from "./markdown"
