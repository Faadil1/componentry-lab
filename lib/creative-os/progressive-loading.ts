import type { ResourceMetadata, ProgressiveLoadLevel } from "./types"

/**
 * Enforces Slice 3A progressive loading policy:
 * Level 2 (Operational Instructions) and Level 3 (Provider Manifest) are strictly inaccessible at runtime.
 * Strips these fields from any resource metadata object.
 */
export function enforceProgressiveLoading(resource: ResourceMetadata): Omit<ResourceMetadata, "level2Data" | "level3Data"> {
  const metadata = { ...resource }
  delete (metadata as Record<string, unknown>).level2Data
  delete (metadata as Record<string, unknown>).level3Data
  return metadata
}

/**
 * Determines the maximum progressive load level allowed for a given resource.
 * Under Slice 3A, only LEVEL_0 and LEVEL_1 are ever returned or accessible.
 */
export function getLoadLevelForResource(resource: ResourceMetadata): ProgressiveLoadLevel {
  // If we only have basic metadata, it's LEVEL_0.
  // If we have capability info, it's LEVEL_1.
  if (resource.capabilities && resource.capabilities.actions.length > 0) {
    return "LEVEL_1_CAPABILITY_CARD"
  }
  return "LEVEL_0_METADATA"
}
