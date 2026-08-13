import type { ProjectBrain } from "../../projects"
import type { CreativeOSIntegrationRequest, CreativeOSIntegrationResult, CreativeOSContinuationState, IntegrationStatus, ContinuationCompatibility } from "./types"
import { adaptDirectorResult, adaptDirectorResultWithAdvisoryEvidence, adaptProjectBrainToDirectorInput } from "../../director/adapters"
import { routeCapabilities } from "../router"
import type { DirectorEvidenceReference } from "../../director/types"
import type { CreativeProjectMode, CreativeProjectPhase } from "../../director/types"
import type { ResourceEvaluation } from "../types"
import {
  runSacredRulesBreaker,
  runSomaticResponseDesign,
  runRelationshipPreservingAbstraction,
  runCognitiveMetaphorIllustrator,
  runPhysicalSituationStoryboarder,
  runLibraryFirstCompositionRouter
} from "../methods"
import { dispatchExternalCapabilityPlan, executeSandboxedPlan, type ExternalCapabilityPlan } from "../film-kit"
import type { CreativeMethodInput, CreativeMethodExecutionResult } from "../methods/types"
import crypto from "crypto"

export function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return ""
  if (typeof obj !== "object") return String(obj)
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]"
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort()
  const pairs = keys.map(k => `"${k}":${stableStringify((obj as Record<string, unknown>)[k])}`)
  return "{" + pairs.join(",") + "}"
}

export function computeFingerprint(data: unknown): string {
  const stableStr = stableStringify(data)
  return crypto.createHash("sha256").update(stableStr).digest("hex").slice(0, 16)
}

function inferMode(project: ProjectBrain, prev?: CreativeOSContinuationState): CreativeProjectMode {
  if (prev && prev.mode) return prev.mode as CreativeProjectMode
  const id = project.id.toLowerCase()
  if (id.includes("mara")) return "MARA"
  if (id.includes("power-bi") || id.includes("datastory") || id.includes("data-story")) return "DATA_STORY"
  if (id.includes("cleanverse")) return "HACKATHON"
  if (id.includes("second-absence") || id.includes("day-challenge") || id.includes("day_challenge")) return "DAY_CHALLENGE"
  
  // Default fallbacks based on project properties
  if (project.nextActions && project.nextActions.some(a => a.label.toLowerCase().includes("power bi") || a.label.toLowerCase().includes("metric"))) return "DATA_STORY"
  if (project.nextActions && project.nextActions.some(a => a.label.toLowerCase().includes("episode") || a.label.toLowerCase().includes("continuity"))) return "MARA"
  
  return "DAY_CHALLENGE"
}

const METHOD_RUNNERS: Record<string, (input: CreativeMethodInput) => CreativeMethodExecutionResult> = {
  "res_sacred_rules_breaker": runSacredRulesBreaker,
  "res_somatic_response_design": runSomaticResponseDesign,
  "res_physical_situation_storyboarder": runPhysicalSituationStoryboarder,
  "res_relationship_preserving_abstraction": runRelationshipPreservingAbstraction,
  "res_cognitive_metaphor_illustrator": runCognitiveMetaphorIllustrator,
  "res_library_first_composition_router": runLibraryFirstCompositionRouter
}

export async function runIntegration(request: CreativeOSIntegrationRequest): Promise<CreativeOSIntegrationResult> {
  // 1. Deep clone project to guarantee immutability
  const project: ProjectBrain = JSON.parse(JSON.stringify(request.projectBrainSnapshot))
  const projectBrainFingerprint = computeFingerprint(project)

  // 2. Identity continuity check
  const projectId = project.id
  if (!projectId) {
    throw new Error("Project Brain snapshot must have a valid id.")
  }

  // Infer mode
  const mode = inferMode(project, request.optionalPreviousContinuationState)

  // Safe cast phase
  const phase = (project.currentPhase as unknown) as CreativeProjectPhase

  // 3. Compute directorBefore using standard adapter
  const defaultAuthorityContext = {
    authorityLevel: "suggest" as const,
    requestedAction: "",
    target: projectId,
    reversibility: "reversible" as const,
    risk: "low" as const,
    approvalRequirement: "none" as const,
    grantedScope: [],
    status: "granted" as const
  }

  const directorInputBefore = adaptProjectBrainToDirectorInput(
    project,
    mode,
    project.currentPhase,
    defaultAuthorityContext,
    "2000-01-01T00:00:00.000Z"
  )

  const directorBefore = adaptDirectorResult(directorInputBefore)

  // 4. Resolve capability gap
  let detectedCapabilityGap: string | null = null
  let gapSource: "DIRECTOR_DERIVED" | "REQUEST_OVERRIDE" = "DIRECTOR_DERIVED"

  if (request.optionalRequestedCapabilityGap) {
    detectedCapabilityGap = request.optionalRequestedCapabilityGap
    gapSource = "REQUEST_OVERRIDE"
  } else {
    // Derive from director result blockers or fallback mode gaps
    const firstBlocker = directorBefore.blockers[0]
    if (firstBlocker && firstBlocker.category !== "project-blockers" && firstBlocker.category !== "project-blockedBy") {
      detectedCapabilityGap = firstBlocker.category
    } else {
      // mode fallbacks
      if (mode === "DAY_CHALLENGE") detectedCapabilityGap = "category-differentiation"
      else if (mode === "MARA") detectedCapabilityGap = "narrative-staging"
      else if (mode === "DATA_STORY") detectedCapabilityGap = "editorial-abstraction"
      else if (mode === "HACKATHON") detectedCapabilityGap = "library-composition"
    }
  }

  // 5. Route capabilities via Slice 3A router
  const routerInputs = {
    projectMode: mode,
    phase: phase,
    capabilityGap: detectedCapabilityGap || undefined,
    currentAuthority: request.currentAuthority
  }

  const routerResult = routeCapabilities(routerInputs)
  const topSuggestion = routerResult.topSuggestion

  let selectedResource: ResourceEvaluation | null = topSuggestion
  let methodExecution: CreativeMethodExecutionResult | null = null
  let externalCapabilityPlan: ExternalCapabilityPlan | null = null
  let methodQualityEvidence: CreativeOSIntegrationResult["methodQualityEvidence"] = null
  let status: IntegrationStatus = "NO_METHOD_REQUIRED"
  let routingDecision: "MATCH" | "NO_MATCH" | "BLOCKED" | "INSUFFICIENT_AUTHORITY" | "NO_GAP" = "NO_MATCH"

  if (!detectedCapabilityGap) {
    routingDecision = "NO_GAP"
  } else if (topSuggestion) {
    routingDecision = "MATCH"
  }

  // Check authority escalation constraint
  if (topSuggestion) {
    const requiredAuthority = topSuggestion.maxExecutionAuthority
    const currentCeiling = request.currentAuthority

    const authorityPrecedence: Record<string, number> = {
      PROHIBITED: 0,
      READ_ONLY: 1,
      SUGGEST: 2,
      PREPARE: 3,
      LOCAL_REVERSIBLE: 4,
      EXPLICIT_EXTERNAL: 5
    }

    const currentScore = authorityPrecedence[currentCeiling] ?? 0
    const requiredScore = authorityPrecedence[requiredAuthority] ?? 0

    if (requiredScore > currentScore) {
      status = "INTEGRATION_BLOCKED"
      routingDecision = "INSUFFICIENT_AUTHORITY"
      selectedResource = null
    }
  }

  // Execute method if eligible
  if (routingDecision === "MATCH" && selectedResource && status !== "INTEGRATION_BLOCKED") {
    const runner = METHOD_RUNNERS[selectedResource.resourceId]
    if (runner) {
      // Safe read of metadata if present
      const metadata = ((project as unknown) as { metadata?: Record<string, unknown> }).metadata || {}

      // Map project attributes to method input dynamically
      const methodInput = {
        methodId: selectedResource.resourceId.replace("res_", "method_"),
        projectMode: mode,
        phase: phase,
        subjectDescription: metadata.subjectDescription || project.description || "",
        subjectContext: metadata.subjectContext || project.audience || "",
        capabilityGap: detectedCapabilityGap!,
        supplementaryFields: {
          projectObjective: project.primaryGoal || "",
          narrativeBeat: project.currentPhase || "",
          subjectOrCharacter: project.heroDemoMoment || "John",
          emotionalTension: project.tension || "",
          desiredTransformation: project.successDefinition || "",
          locationConstraints: metadata.locationConstraints || "",
          propConstraints: metadata.propConstraints || "",
          // RPA fields
          sourceDescription: metadata.sourceDescription || "",
          communicationIntent: project.memoryHook || "",
          sourceType: metadata.sourceType || "",
          abstractionLevel: metadata.abstractionLevel || "high",
          knownSpatialRelationships: metadata.knownSpatialRelationships || "[]",
          // CMI fields
          concept: metadata.concept || "",
          projectSymbols: metadata.projectSymbols || "",
          // LFCR fields
          requestedCapability: metadata.requestedCapability || "",
          artifactType: metadata.artifactType || "",
          ...metadata
        }
      }

      try {
        methodExecution = runner(methodInput as unknown as CreativeMethodInput)
        methodQualityEvidence = {
          status: methodExecution.status,
          qualityResults: methodExecution.qualityResults,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputSignature: (methodExecution as any).inputSignature || computeFingerprint(methodInput),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          outputSignature: (methodExecution as any).outputSignature || computeFingerprint(methodExecution.result.rawOutputs),
          resourceLifecycle: selectedResource.lifecycleState,
          resourceId: selectedResource.resourceId,
          methodId: methodExecution.methodId
        }

        if (methodExecution.status === "COMPLETE") {
          status = "COMPLETE"
        } else if (methodExecution.status === "PARTIAL") {
          status = "METHOD_PARTIAL"
        } else {
          status = "METHOD_BLOCKED"
        }
      } catch {
        status = "METHOD_BLOCKED"
      }
    } else if (selectedResource.type !== "CORE_METHOD") {
      // Plan external capability via Film Kit
      const metadata = ((project as unknown) as { metadata?: Record<string, unknown> }).metadata || {}
      
      const planRequest = {
        capabilityGap: detectedCapabilityGap || undefined,
        artifactType: (metadata.artifactType as string) || undefined,
        projectMode: mode,
        phase: phase,
        currentAuthority: request.currentAuthority,
        frameworkOrSurface: (metadata.frameworkOrSurface as string) || (project.constraints?.find(c => c.type === "compliance")?.description),
        metadata
      }
      
      const plan = dispatchExternalCapabilityPlan(planRequest, selectedResource)
      externalCapabilityPlan = plan
      
      // Inject projectId and fingerprint to the plan to allow Sandbox checking
      plan.projectId = projectId
      plan.projectBrainFingerprint = projectBrainFingerprint

      // For 3D.1, the humanApprovalDecision from request is no longer a simple string, it should be passed to sandbox
      let parsedApproval: import("../film-kit/types").HumanApprovalDecision | null = null
      if (typeof request.humanApprovalDecision === "object" && request.humanApprovalDecision !== null) {
        // Assume it conforms to HumanApprovalDecision
        parsedApproval = request.humanApprovalDecision as import("../film-kit/types").HumanApprovalDecision
      }

      if (plan.executionStatus === "BLOCKED") {
        status = "INTEGRATION_BLOCKED"
        routingDecision = "INSUFFICIENT_AUTHORITY"
      } else if (plan.executionStatus === "NO_MATCH") {
        status = "NO_MATCH"
      } else if (plan.executionStatus === "DISCOVERY_REQUIRED") {
        status = "METHOD_PARTIAL"
      } else if (plan.executionStatus === "HUMAN_APPROVAL_REQUIRED" || plan.executionStatus === "EXTERNAL_PLAN_READY" || plan.executionStatus === "EXTERNAL_EXPERIMENTAL_CANDIDATE") {
        
        // Let the sandbox handle all execution, approvals, freshness, and authority limits.
        const sandboxResult = await executeSandboxedPlan(plan, projectId, projectBrainFingerprint, parsedApproval, request.currentAuthority, {})
        
        // Update plan executionStatus based on Sandbox result
        plan.executionStatus = sandboxResult.status
        if (sandboxResult.receipt) {
          plan.executionResult = {
             executionId: sandboxResult.receipt.receiptFingerprint,
             planFingerprint: plan.planFingerprint,
             providerUsed: sandboxResult.receipt.providerAdapterId,
             status: sandboxResult.status as "COMPLETE" | "PARTIAL" | "BLOCKED" | "FAILED",
             rawOutput: {}, // Handled by providerOutputFingerprint in receipt
             executionTimeMs: 0,
             error: sandboxResult.error,
             receipt: sandboxResult.receipt
          }
        }

        if (sandboxResult.status === "EXECUTED" || sandboxResult.status === "ALREADY_EXECUTED") {
           status = "COMPLETE"
        } else if (sandboxResult.status === "EXECUTED_PARTIAL") {
           status = "METHOD_PARTIAL"
        } else if (sandboxResult.status === "APPROVAL_REQUIRED" || sandboxResult.status === "APPROVAL_INVALID" || sandboxResult.status === "ADAPTER_MISSING" || sandboxResult.status === "ADAPTER_NOT_EXECUTABLE" || sandboxResult.status === "PLAN_STALE" || sandboxResult.status === "PLAN_INCOMPATIBLE") {
           status = "METHOD_BLOCKED"
        } else if (sandboxResult.status === "PROVIDER_ERROR") {
           status = "METHOD_BLOCKED"
        } else {
           status = "METHOD_BLOCKED"
        }
      } else {
        status = "METHOD_BLOCKED"
      }

      methodQualityEvidence = {
        status: plan.executionStatus,
        qualityResults: [
          { gateId: "gate_plan_constructed", passed: plan.executionStatus !== "BLOCKED" && plan.executionStatus !== "NO_MATCH" },
          { gateId: "gate_authority_checked", passed: plan.executionStatus !== "BLOCKED" && plan.executionStatus !== "AUTHORITY_BLOCKED" },
          { gateId: "gate_compatibility_checked", passed: plan.compatibilityStatus !== "INCOMPATIBLE" },
          { gateId: "gate_human_approval_checked", passed: plan.executionStatus !== "APPROVAL_REQUIRED" && plan.executionStatus !== "APPROVAL_DENIED" && plan.executionStatus !== "APPROVAL_INVALID" }
        ],
        inputSignature: computeFingerprint(planRequest),
        outputSignature: plan.planFingerprint,
        resourceLifecycle: selectedResource.lifecycleState,
        resourceId: selectedResource.resourceId,
        methodId: plan.capabilityId
      }
    } else {
      status = "METHOD_BLOCKED"
    }
  } else if (routingDecision === "NO_MATCH") {
    status = "NO_MATCH"
  }

  // 6. Map advisory evidence back to Director input
  const advisoryEvidence: DirectorEvidenceReference[] = []
  if (methodQualityEvidence && (status === "COMPLETE" || status === "METHOD_PARTIAL")) {
    const isPartial = status === "METHOD_PARTIAL"
    const hasPassedGates = methodQualityEvidence.qualityResults.every(q => q.passed)

    advisoryEvidence.push({
      id: `adv_${projectId}_${methodQualityEvidence.methodId}`,
      label: `Advisory evidence for ${selectedResource?.name}`,
      source: `method:${methodQualityEvidence.methodId}`,
      status: isPartial ? "partial" : hasPassedGates ? "pass" : "fail"
    })
  }

  // 7. Compute directorAfter
  const directorInputAfter = adaptProjectBrainToDirectorInput(
    project,
    mode,
    project.currentPhase,
    defaultAuthorityContext,
    "2000-01-01T00:00:00.000Z"
  )

  const directorAfter = adaptDirectorResultWithAdvisoryEvidence(directorInputAfter, advisoryEvidence)

  // Guarantee exactly one next action
  const authorizedNextAction = directorAfter.nextAction

  // Compute fingerprints
  const directorProjectionFingerprint = computeFingerprint(directorBefore)
  const methodInputFingerprint = methodQualityEvidence?.inputSignature || null
  const methodOutputFingerprint = methodQualityEvidence?.outputSignature || null
  const qualitySummary = methodQualityEvidence ? JSON.stringify(methodQualityEvidence.qualityResults.map(r => `${r.gateId}:${r.passed}`)) : null
  const directorFinalFingerprint = computeFingerprint(directorAfter)
  const authorizedActionFingerprint = computeFingerprint(authorizedNextAction)

  const integrationProvenance = {
    projectBrainFingerprint,
    directorProjectionFingerprint,
    capabilityGapSource: gapSource,
    routingResult: routingDecision,
    resourceId: selectedResource?.resourceId || null,
    resourceLifecycle: selectedResource?.lifecycleState || null,
    methodId: methodExecution?.methodId || null,
    methodInputFingerprint,
    methodOutputFingerprint,
    qualitySummary,
    directorFinalFingerprint,
    authorizedActionFingerprint,
    continuationFingerprint: ""
  }

  // Continuity / Resume continuationState
  const activeBlockerIds = directorAfter.blockers.map(b => b.blockerId)
  const resumeSummary = `Resuming project "${project.title || projectId}" in ${mode} mode, ${project.currentPhase} phase.`
  const currentDecision = `Next authorized action is: "${authorizedNextAction.title}".`
  const whyThisIsNext = `Rationale: "${authorizedNextAction.rationale}".`
  const unresolvedBlocker = activeBlockerIds.length > 0 ? `Blocked by: ${activeBlockerIds.join(", ")}.` : "No unresolved blockers."
  const evidenceStillNeeded = activeBlockerIds.length > 0 ? "Resolve blockers to proceed." : "No additional evidence currently needed."

  const continuationStateDraft: Omit<CreativeOSContinuationState, "continuationFingerprint" | "integrationFingerprint"> = {
    schemaVersion: "v3",
    projectId,
    projectBrainFingerprint,
    phase: project.currentPhase || "build",
    mode,
    currentObjective: project.primaryGoal || "",
    evaluator: directorAfter.evaluatorPath?.evaluatorType || "self-directed",
    heroDemoMomentIdOrFingerprint: project.heroDemoMoment || "",
    activeBlockerIds,
    detectedCapabilityGap,
    selectedResourceId: selectedResource?.resourceId || null,
    selectedMethodId: methodExecution?.methodId || null,
    methodInputFingerprint,
    methodOutputFingerprint,
    qualitySummary,
    authorizedNextActionFingerprint: authorizedActionFingerprint,
    provenanceReferences: ["ProjectBrain", "Director", "Router", "FilmKitPlanner"],
    continuationCompatibility: "NONE" as ContinuationCompatibility,
    selectedExternalResourceId: externalCapabilityPlan?.resourceId || null,
    externalCapabilityPlanFingerprint: externalCapabilityPlan?.planFingerprint || null,
    executionRequired: false,
    humanApprovalRequired: externalCapabilityPlan?.requiredHumanApproval || false,
    resumeSummary,
    currentDecision,
    whyThisIsNext,
    unresolvedBlocker,
    evidenceStillNeeded
  }

  const integrationFingerprint = computeFingerprint({
    projectBrainFingerprint,
    directorProjectionFingerprint,
    routingDecision,
    methodOutputFingerprint,
    directorFinalFingerprint
  })

  // continuationFingerprint is computed from the canonical continuation fields
  // (excluding the fingerprint field itself) plus the integrationFingerprint
  const continuationFingerprint = computeFingerprint({
    ...continuationStateDraft,
    integrationFingerprint
  })

  integrationProvenance.continuationFingerprint = continuationFingerprint

  // Resolve continuation compatibility
  let continuationCompatibility: ContinuationCompatibility = "NONE"
  if (request.optionalPreviousContinuationState) {
    const prev = request.optionalPreviousContinuationState
    if (prev.projectId !== projectId) {
      continuationCompatibility = "INCOMPATIBLE"
    } else if (prev.projectBrainFingerprint !== projectBrainFingerprint) {
      continuationCompatibility = "STALE"
    } else {
      continuationCompatibility = "MATCH"
    }
  }

  const continuationState: CreativeOSContinuationState = {
    ...continuationStateDraft,
    integrationFingerprint,
    continuationFingerprint,
    continuationCompatibility
  }

  return {
    projectId,
    projectBrainFingerprint,
    directorBefore,
    detectedCapabilityGap,
    routingDecision,
    selectedResource,
    methodExecution,
    externalCapabilityPlan: externalCapabilityPlan || null,
    methodQualityEvidence,
    directorAfter,
    authorizedNextAction,
    integrationProvenance,
    continuationState,
    status
  }
}
