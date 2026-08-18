import { buildLiveLibraryV2ReadModel } from "../library-v2/read-model"
import type { MethodEntity } from "../library-v2/types"
import type { SkillMetadata } from "../../director/types"

export interface DirectorGovernedSkillProjection {
  valid: boolean
  errors: readonly string[]
  warnings: readonly string[]
  skills: readonly SkillMetadata[]
}

const QUALIFIED_METHOD_LIFECYCLES = new Set(["VALIDATED", "APPROVED"])

function isDirectorEligibleMethod(entity: MethodEntity): boolean {
  return (
    QUALIFIED_METHOD_LIFECYCLES.has(entity.lifecycleState) &&
    entity.methodDefinition.deterministic === true &&
    entity.operationDefinition.operator === "DETERMINISTIC" &&
    entity.operationDefinition.effectClass === "NONE" &&
    entity.operationDefinition.outputRole === "ADVISORY" &&
    (entity.methodDefinition.authorityRequired === "READ_ONLY" ||
      entity.methodDefinition.authorityRequired === "SUGGEST")
  )
}

function maturityFromLifecycle(lifecycle: MethodEntity["lifecycleState"]): SkillMetadata["maturity"] {
  if (lifecycle === "APPROVED") return "approved"
  if (lifecycle === "VALIDATED") return "tested"
  if (lifecycle === "TESTING" || lifecycle === "TEST_CANDIDATE") return "candidate"
  return "draft"
}

function projectMethodToDirectorSkill(entity: MethodEntity): SkillMetadata {
  const method = entity.methodDefinition
  const canonicalCapabilityRef = `creative-os-registry-v2:${entity.id}`

  return {
    skillId: canonicalCapabilityRef,
    title: entity.name,
    description: entity.statusNotes ?? `${entity.name} governed internal advisory method.`,
    version: method.version,
    provenance: `${entity.provenance} | ${canonicalCapabilityRef} | runtime:${method.id}`,
    supportedModes: [...method.supportedModes],
    supportedPhases: [...method.supportedPhases],
    activationConditions: [...method.capabilityGaps],
    requiredInputs: [...method.requiredInputs],
    producedOutputs: [method.outputSchemaId],
    dependencies: [],
    conflicts: [],
    authorityRequirement: "suggest",
    maturity: maturityFromLifecycle(entity.lifecycleState),
    loadingPolicy: "metadata-first",
    sourcePaths: [],
    status: "available",
    canonicalCapabilityRef,
    runtimeMethodId: method.id,
    sourceEntityKind: "METHOD",
    sourceLifecycleState: entity.lifecycleState,
    sourceAuthorityCeiling: entity.authorityPolicy.maximumAuthority,
    sourceMethodAuthorityRequired: method.authorityRequired,
    capabilityGaps: [...method.capabilityGaps],
    evidenceRefs: [...entity.evidenceRefs]
  }
}

export function projectGovernedDirectorSkills(): DirectorGovernedSkillProjection {
  const model = buildLiveLibraryV2ReadModel()
  if (!model.valid) {
    return {
      valid: false,
      errors: [...model.errors],
      warnings: model.warnings.map((warning) => warning.message),
      skills: []
    }
  }

  const eligibleMethods = model.entities
    .filter((entity): entity is MethodEntity => entity.entityKind === "METHOD")
    .filter((entity) => isDirectorEligibleMethod(entity))
    .sort((a, b) => a.id.localeCompare(b.id))

  return {
    valid: true,
    errors: [],
    warnings: model.warnings.map((warning) => warning.message),
    skills: eligibleMethods.map((entity) => projectMethodToDirectorSkill(entity))
  }
}
