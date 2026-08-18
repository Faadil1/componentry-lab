import { RESOURCE_REGISTRY } from "../registry"
import type { ResourceExecutionEvidence } from "./types"

function internalMethodEvidence(resourceId: string, fileName: string, notes: string[] = []): ResourceExecutionEvidence {
  return {
    resourceId,
    implementationStatus: "IMPLEMENTED",
    executionBoundary: "INTERNAL_METHOD",
    adapterEvidenceStatus: "NOT_APPLICABLE",
    executionReadiness: "EXECUTION_STRUCTURALLY_AVAILABLE",
    evidenceReferences: [
      `lib/creative-os/methods/${fileName}.ts`,
      "tests/creative-os-methods.test.ts"
    ],
    notes
  }
}

function planningOnlyEvidence(resourceId: string, references: string[], notes: string[] = []): ResourceExecutionEvidence {
  return {
    resourceId,
    implementationStatus: "PARTIAL_IMPLEMENTATION",
    executionBoundary: "PLANNING_ONLY",
    adapterEvidenceStatus: "NOT_APPLICABLE",
    executionReadiness: "PLANNING_ONLY",
    evidenceReferences: references,
    notes
  }
}

function metadataOnlyEvidence(resourceId: string, references: string[], notes: string[] = []): ResourceExecutionEvidence {
  return {
    resourceId,
    implementationStatus: "METADATA_ONLY",
    executionBoundary: "NONE",
    adapterEvidenceStatus: "NOT_APPLICABLE",
    executionReadiness: "NOT_EXECUTABLE",
    evidenceReferences: references,
    notes
  }
}

function discoveryOnlyEvidence(resourceId: string, references: string[], notes: string[] = []): ResourceExecutionEvidence {
  return {
    resourceId,
    implementationStatus: "DISCOVERY_ONLY",
    executionBoundary: "NONE",
    adapterEvidenceStatus: "NOT_APPLICABLE",
    executionReadiness: "NOT_EXECUTABLE",
    evidenceReferences: references,
    notes
  }
}

function externalAdapterEvidence(resourceId: string, references: string[], notes: string[] = []): ResourceExecutionEvidence {
  return {
    resourceId,
    implementationStatus: "PARTIAL_IMPLEMENTATION",
    executionBoundary: "EXTERNAL_ADAPTER",
    adapterEvidenceStatus: "PRESENT_UNVERIFIED",
    executionReadiness: "EXECUTION_STRUCTURALLY_AVAILABLE",
    evidenceReferences: references,
    notes
  }
}

export const RESOURCE_EXECUTION_EVIDENCE = {
  res_sacred_rules_breaker: internalMethodEvidence("res_sacred_rules_breaker", "sacred-rules-breaker"),
  res_somatic_response_design: internalMethodEvidence("res_somatic_response_design", "somatic-response-design"),
  res_relationship_preserving_abstraction: internalMethodEvidence("res_relationship_preserving_abstraction", "relationship-preserving-abstraction"),
  res_cognitive_metaphor_illustrator: internalMethodEvidence("res_cognitive_metaphor_illustrator", "cognitive-metaphor-illustrator"),
  res_physical_situation_storyboarder: internalMethodEvidence("res_physical_situation_storyboarder", "physical-situation-storyboarder"),
  res_library_first_composition_router: internalMethodEvidence("res_library_first_composition_router", "library-first-composition-router"),

  res_ai_camera_movements: metadataOnlyEvidence(
    "res_ai_camera_movements",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["Metadata-only capability card; no execution boundary is defined."]
  ),
  res_cinematography_intelligence_layer: metadataOnlyEvidence(
    "res_cinematography_intelligence_layer",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["Metadata-only capability card; no execution boundary is defined."]
  ),

  res_remocn: planningOnlyEvidence(
    "res_remocn",
    ["lib/creative-os/router.ts", "tests/creative-os-resource-radar.test.ts", "tests/creative-os-integration.test.ts"],
    ["Planning-only path remains governed by routing and compatibility evidence."]
  ),
  res_originkit: planningOnlyEvidence(
    "res_originkit",
    ["lib/creative-os/router.ts", "tests/creative-os-resource-radar.test.ts", "tests/creative-os-methods.test.ts"],
    ["Planning-only path remains governed by routing and compatibility evidence."]
  ),
  res_cineprompt: externalAdapterEvidence(
    "res_cineprompt",
    ["lib/creative-os/film-kit/adapters/cineprompt-adapter.ts", "lib/creative-os/film-kit/adapters/cineprompt-transport.ts", "tests/creative-os-cineprompt.test.ts"],
    ["Adapter infrastructure exists, but live external execution remains authority-gated and unverified."]
  ),
  res_ai_world_builder: metadataOnlyEvidence(
    "res_ai_world_builder",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["No approved execution path is modeled for this provider."]
  ),
  res_open_kimi_ppt: metadataOnlyEvidence(
    "res_open_kimi_ppt",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["Metadata-only provider card; no executable contract is claimed here."]
  ),
  res_tait_crt_interface_skill: metadataOnlyEvidence(
    "res_tait_crt_interface_skill",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["Metadata-only skill card; no executable contract is claimed here."]
  ),
  res_video_shotcraft: planningOnlyEvidence(
    "res_video_shotcraft",
    ["lib/creative-os/production/video-shotcraft.ts", "tests/creative-os-video-shotcraft-routing.test.ts", "tests/creative-os-production-routing.test.ts"],
    ["This resource is available for planning, not sandbox execution."]
  ),
  res_gbro_collage_b_roll: metadataOnlyEvidence(
    "res_gbro_collage_b_roll",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["No canonical execution path is claimed for this production pipeline entry."]
  ),
  res_openmontage: metadataOnlyEvidence(
    "res_openmontage",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["No canonical execution path is claimed for this production pipeline entry."]
  ),
  res_awesome_claude_code_skills: discoveryOnlyEvidence(
    "res_awesome_claude_code_skills",
    ["lib/creative-os/discovery/discovery.ts", "tests/creative-os-resource-discovery.test.ts"],
    ["Discovery feed only; it does not execute a resource."]
  ),
  res_helloianneo_ecosystem: discoveryOnlyEvidence(
    "res_helloianneo_ecosystem",
    ["lib/creative-os/discovery/discovery.ts", "tests/creative-os-resource-discovery.test.ts"],
    ["Discovery feed only; it does not execute a resource."]
  ),
  res_yummy_design_sprint: metadataOnlyEvidence(
    "res_yummy_design_sprint",
    ["lib/creative-os/registry.ts", "tests/creative-os.test.ts"],
    ["Internal discovery-feed metadata only; no executable implementation is claimed."]
  )
} as const satisfies Record<string, ResourceExecutionEvidence>

export const RESOURCE_EXECUTION_EVIDENCE_COUNT = Object.keys(RESOURCE_EXECUTION_EVIDENCE).length
export function getResourceExecutionEvidence(resourceId: string): ResourceExecutionEvidence | null {
  const evidenceByResourceId = RESOURCE_EXECUTION_EVIDENCE as Record<string, ResourceExecutionEvidence>
  return evidenceByResourceId[resourceId] ?? null
}

export function getAllResourceExecutionEvidence(): ResourceExecutionEvidence[] {
  return Object.values(RESOURCE_EXECUTION_EVIDENCE).sort((a, b) => a.resourceId.localeCompare(b.resourceId))
}

export function isResourcePlanningOnly(resourceId: string): boolean {
  return getResourceExecutionEvidence(resourceId)?.executionBoundary === "PLANNING_ONLY"
}

export function isResourceStructurallyExecutable(resourceId: string): boolean {
  return getResourceExecutionEvidence(resourceId)?.executionReadiness === "EXECUTION_STRUCTURALLY_AVAILABLE"
}

export function isCanonicalResourceExecutionEvidenceDefined(resourceId: string): boolean {
  return RESOURCE_REGISTRY.some((resource) => resource.id === resourceId) && Boolean(getResourceExecutionEvidence(resourceId))
}
