import type { ResourceMetadata } from "./types"

/**
 * Checks if a resource supports a given action, artifact type, or capability gap.
 */
export function matchesCapability(
  resource: ResourceMetadata,
  action?: string,
  artifactType?: string,
  capabilityGap?: string
): { matches: boolean; matchedCapabilities: string[] } {
  const matchedCapabilities: string[] = []

  if (action) {
    if (resource.capabilities.actions.includes(action)) {
      matchedCapabilities.push(`action:${action}`)
    }
  }

  if (artifactType) {
    if (resource.capabilities.artifactTypes.includes(artifactType)) {
      matchedCapabilities.push(`artifactType:${artifactType}`)
    }
  }

  if (capabilityGap) {
    if (resource.capabilities.capabilityGaps.includes(capabilityGap)) {
      matchedCapabilities.push(`gap:${capabilityGap}`)
    }
  }

  // If any input query was supplied, it must match at least one capability filter.
  // If no queries were supplied, it matches by default.
  const hasQuery = !!(action || artifactType || capabilityGap)
  const matches = !hasQuery || matchedCapabilities.length > 0

  return { matches, matchedCapabilities }
}
