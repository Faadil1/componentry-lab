import { registryComponents } from "@/lib/registry/components"
import { RESOURCE_REGISTRY } from "@/lib/creative-os/registry"
import type { RegistryEntry, RegistryEntryKind, RegistryCategoryId, RegistryMaturity, RegistryRuntime, RegistryViewport } from "@/lib/registry/types"
import type { ResourceMetadata, ResourceType, AuthorityCeiling } from "@/lib/creative-os/types"

export type LibrarySourceKind = "COMPONENT" | "CREATIVE_RESOURCE"

export interface LibraryProjectionItem {
  projectionId: string
  sourceKind: LibrarySourceKind
  sourceId: string
  canonicalOwner: string
  title: string
  description: string
  searchText: string
  capabilityRefs: string[]
  status: {
    namespace: string
    value: string
  }
  
  // Shared presentation metadata
  category?: string
  href?: string
  
  // Component specific details
  componentDetails?: {
    kind: RegistryEntryKind
    categoryId: RegistryCategoryId
    maturity: RegistryMaturity
    runtimes: RegistryRuntime[]
    viewports: RegistryViewport[]
    captureReady: boolean
    deterministic: boolean
    entry: RegistryEntry
  }
  
  // Resource specific details
  resourceDetails?: {
    resourceType: ResourceType
    maxExecutionAuthority: AuthorityCeiling
    license: string
    modes: string[]
    resource: ResourceMetadata
  }
}

export function getLibraryProjection(): LibraryProjectionItem[] {
  const projection: LibraryProjectionItem[] = []

  // 1. Project Component Registry
  for (const comp of registryComponents) {
    projection.push({
      projectionId: `comp_${comp.id}`,
      sourceKind: "COMPONENT",
      sourceId: comp.id,
      canonicalOwner: "ComponentRegistry",
      title: comp.label,
      description: comp.summary || comp.description,
      searchText: `${comp.label} ${comp.summary} ${comp.tags.join(" ")}`.toLowerCase(),
      capabilityRefs: comp.capabilities,
      status: {
        namespace: "COMPONENT_MATURITY",
        value: comp.maturity
      },
      category: comp.categoryId,
      href: comp.route,
      componentDetails: {
        kind: comp.kind,
        categoryId: comp.categoryId,
        maturity: comp.maturity,
        runtimes: comp.runtimes,
        viewports: comp.supportedViewports,
        captureReady: comp.captureReady,
        deterministic: comp.deterministic,
        entry: comp
      }
    })
  }

  // 2. Project Creative OS Resource Registry
  for (const res of RESOURCE_REGISTRY) {
    projection.push({
      projectionId: `res_${res.id}`,
      sourceKind: "CREATIVE_RESOURCE",
      sourceId: res.id,
      canonicalOwner: "CreativeOsResourceRegistry",
      title: res.name,
      description: res.level2Data?.operationalInstructions || res.capabilities.capabilityGaps.join(", ") || "",
      searchText: `${res.name} ${res.type} ${res.capabilities.actions.join(" ")} ${res.capabilities.capabilityGaps.join(" ")}`.toLowerCase(),
      capabilityRefs: [...res.capabilities.capabilityGaps, ...res.capabilities.actions],
      status: {
        namespace: "RESOURCE_LIFECYCLE",
        value: res.lifecycleState
      },
      category: "creative-resource", // virtual category for filtering
      // href is omitted for resources as they are read-only and don't have standalone pages yet
      resourceDetails: {
        resourceType: res.type,
        maxExecutionAuthority: res.maxExecutionAuthority,
        license: res.license,
        modes: res.modes,
        resource: res
      }
    })
  }

  return projection
}
