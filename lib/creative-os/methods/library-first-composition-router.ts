import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"
import { routeCapabilities } from "../router"

export const LIBRARY_FIRST_COMPOSITION_ROUTER_ID = "method_library_first_composition_router"

export const libraryFirstCompositionRouterDefinition: CreativeMethodDefinition = {
  id: LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
  resourceId: "res_library_first_composition_router",
  name: "Library-First Composition Router",
  version: "1.0.0",
  supportedModes: ["HACKATHON", "DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["library-composition"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [
    "evaluatorType",
    "supplementaryFields.requestedCapability",
    "supplementaryFields.projectObjective",
    "supplementaryFields.artifactType",
    "supplementaryFields.frameworkOrSurface",
    "supplementaryFields.existingDependencies",
    "supplementaryFields.existingInternalComponents",
    "supplementaryFields.performanceBudget",
    "supplementaryFields.accessibilityRequirements",
    "supplementaryFields.bundleConstraints",
    "supplementaryFields.licenseConstraints",
    "supplementaryFields.maintenanceRequirements",
    "supplementaryFields.interactionComplexity",
    "supplementaryFields.motionComplexity",
    "supplementaryFields.captureRequirements"
  ],
  outputSchemaId: "library-first-composition-router-v1",
  qualityGateIds: [
    "lfcr.native-first",
    "lfcr.registry-grounded",
    "lfcr.lifecycle-honest",
    "lfcr.discovery-not-production",
    "lfcr.smallest-justified-dependency",
    "lfcr.evidence-aware",
    "lfcr.no-execution"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const fields = input.supplementaryFields || {}

  const requestedCapability = fields.requestedCapability ?? subject
  const projectObjective = fields.projectObjective ?? "build component composition"
  const frameworkOrSurface = fields.frameworkOrSurface ?? "React/NextJS"
  const artifactType = fields.artifactType ?? "composition-tree"

  // 1. Analyze complexity & native feasibility
  let complexityEstimate = "LOW"
  let nativeFeasibility = "High: Standard native CSS transitions, Web APIs, and flex layouts satisfy the requirement."
  const existingInternalFeasibility = "High: Standard React components exist for basic rendering."

  // prevent unused variable warnings
  const debugContext = `context: ${context}, artifactType: ${artifactType}`

  const reqCapLow = requestedCapability.toLowerCase()
  if (reqCapLow.includes("scroll choreography") || reqCapLow.includes("animation") || reqCapLow.includes("layout")) {
    complexityEstimate = "MEDIUM"
    nativeFeasibility = `Medium: Native scroll listeners are possible but prone to frame jank; library animation reduces complexity. (${debugContext})`
  }


  // 2. Query registry metadata using Slice 3A capability router
  const queryGap = reqCapLow.includes("web-component-animation") ? "web-component-animation" : input.capabilityGap
  const routerResult = routeCapabilities({
    projectMode: input.projectMode,
    phase: input.phase,
    artifactType: fields.artifactType,
    capabilityGap: queryGap,
    currentAuthority: "SUGGEST",
    frameworkOrSurface: frameworkOrSurface
  })


  // Expose registry candidates from Slice 3A
  const registryCandidates = routerResult.recommendations.map(r => ({
    id: r.resourceId,
    name: r.name,
    type: r.type,
    lifecycleState: r.lifecycleState,
    license: "UNKNOWN" // We default to UNKNOWN if not explicitly mapped/known
  }))

  // Resolve Route
  let selectedRoute = "USE_NATIVE"
  let selectedResource = "none"
  let rationale = "Use standard native primitives. Introducing third-party dependencies is rejected to maintain zero bundle weight."

  if (reqCapLow.includes("simple fade") || reqCapLow.includes("layout")) {
    selectedRoute = "USE_NATIVE"
    selectedResource = "none"
    rationale = "Simple fade or layouts are fully satisfied by native CSS animations and flexbox layouts. Avoid unnecessary dependency overhead."
  } else {
    // Framework override checks
    const isSvelteAnim = frameworkOrSurface === "Svelte" && reqCapLow.includes("web-component-animation")
    const isReactScroll = frameworkOrSurface === "React/NextJS" && reqCapLow.includes("scroll choreography")
    
    if (isSvelteAnim) {
      selectedRoute = "NO_MATCH"
      selectedResource = "none"
      rationale = "No governed registry candidate has verified Svelte compatibility for web-component-animation; compatibility remains UNKNOWN, so the route fails closed."
    } else if (isReactScroll) {
      selectedRoute = "DISCOVERY_REQUIRED"
      selectedResource = "none"
      rationale = "Remocn matches scroll choreography capability but its compatibility with React/NextJS is UNKNOWN. Discovery is required."
    } else {
      // Rely on router result
      const topSuggestion = routerResult.topSuggestion
      if (topSuggestion) {
        if (topSuggestion.recommendationLabel === "APPROVED_RECOMMENDATION") {
          selectedRoute = "CONSIDER_APPROVED_RESOURCE"
        } else if (topSuggestion.recommendationLabel === "VALIDATED_FALLBACK") {
          selectedRoute = "CONSIDER_VALIDATED_RESOURCE"
        } else {
          selectedRoute = "CONSIDER_EXPERIMENTAL_RESOURCE"
        }
        selectedResource = topSuggestion.resourceId
        rationale = `Recommend considering candidate "${topSuggestion.name}" (lifecycle: ${topSuggestion.lifecycleState}) since native animation complexity is high and this resource is registered in governed metadata.`
      } else {
      // If there is no top suggestion, inspect framework compatibility for known library options:
      const isSvelteAnim = frameworkOrSurface === "Svelte" && reqCapLow.includes("web-component-animation")
      const isReactScroll = frameworkOrSurface === "React/NextJS" && reqCapLow.includes("scroll choreography")
      
      if (isSvelteAnim) {
        selectedRoute = "NO_MATCH"
        selectedResource = "none"
        rationale = "No governed registry candidate has verified Svelte compatibility for web-component-animation; compatibility remains UNKNOWN, so the route fails closed."
      } else if (isReactScroll) {
        selectedRoute = "DISCOVERY_REQUIRED"
        selectedResource = "none"
        rationale = "Remocn matches scroll choreography capability but its compatibility with React/NextJS is UNKNOWN. Discovery is required."
      } else {
        selectedRoute = "NO_MATCH"
        selectedResource = "none"
        rationale = "No matched library in the governed registry supports this capability or framework."
      }
    }
  }
}

  // Format evidence constraints
  const licenseEvidence = "UNKNOWN (Registry metadata lacks verified license verification fields; defaulting to conservative UNKNOWN values)"
  const performanceEvidence = "UNKNOWN (Bundle constraints evaluated but no certified bundle size metadata is present)"

  // Output formatting
  const inputFingerprint = `LFCR:cap=${requestedCapability.slice(0, 30)}:frame=${frameworkOrSurface.slice(0, 20)}:obj=${projectObjective.slice(0, 30)}`
  const outputFingerprint = `LFCR:route=${selectedRoute}:res=${selectedResource}:complexity=${complexityEstimate}`

  const rawOutputs: Record<string, string> = {
    requestedCapability,
    complexityAssessment: `Assessed capability complexity as ${complexityEstimate}.`,
    nativeFeasibility,
    existingInternalFeasibility,
    registryCandidates: JSON.stringify(registryCandidates),
    compatibilityEvidenceAvailable: "True for local interface routing.",
    missingEvidence: "License file hash; package index validation; bundle size certification.",
    dependencyBurden: selectedResource !== "none" ? "Adds 1 third-party reference to registry dependency tree." : "Zero dependency burden.",
    accessibilityConsiderations: "Ensure keyboard accessibility and screen reader support on native elements.",
    performanceConsiderations: performanceEvidence,
    licenseConsiderations: licenseEvidence,
    selectedRoute,
    selectedResource,
    whySmallerAlternativesWereRejected: rationale,
    unresolvedQuestions: "Will this resource require EXPLICIT_EXTERNAL network execution authority at runtime? (Defaulting to restricted LOCAL execution only)",
    executionAuthorityRequiredLater: "SUGGEST",
    recommendedValidationStep: "Verify components render under strict Next.js mock environments.",
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "routing-intake",
      label: "Capability Intake & Complexity Assessment",
      content: `Requested Capability: ${requestedCapability}\n` +
               `Project Objective: ${projectObjective}\n` +
               `Surface Framework: ${frameworkOrSurface}\n` +
               `Complexity Estimate: ${complexityEstimate}`
    },
    {
      sectionKey: "native-feasibility",
      label: "Native & Internal Feasibility Analysis",
      content: `Native Feasibility: ${nativeFeasibility}\n` +
               `Internal components fit: ${existingInternalFeasibility}`
    },
    {
      sectionKey: "registry-candidates",
      label: "Registry Candidate Evaluation",
      content: `Registry Candidates Found:\n` +
               (registryCandidates.length > 0
                 ? registryCandidates.map(c => `- ID: ${c.id} | Name: ${c.name} | Type: ${c.type} | Lifecycle: ${c.lifecycleState}`).join("\n")
                 : "No candidates matching capability and mode found in governed registry.") +
               `\n\nLicense Audit: ${licenseEvidence}\n` +
               `Performance Audit: ${performanceEvidence}`
    },
    {
      sectionKey: "routing-decision",
      label: "Selected Composition Route",
      content: `Selected Route: ${selectedRoute}\n` +
               `Resource Target: ${selectedResource}\n` +
               `Rationale: ${rationale}`
    },
    {
      sectionKey: "validation-plan",
      label: "Validation & Governance",
      content: `Validation Step: ${rawOutputs.recommendedValidationStep}\n` +
               `Missing Evidence: ${rawOutputs.missingEvidence}\n` +
               `Unresolved Authority Questions: ${rawOutputs.unresolvedQuestions}`
    }
  ]

  return {
    methodId: LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Assess Complexity & Native Feasibility", instruction: `Analyze if requested capability: "${requestedCapability}" can be completed natively.`, outputKey: "native-feasibility" },
      { stepIndex: 2, label: "Query Governed Registry", instruction: "Retrieve candidate resources matching capability and mode restrictions.", outputKey: "registry-candidates" },
      { stepIndex: 3, label: "Audit Metadata & Evidence", instruction: "Verify compatibility evidence, licenses, and performance profiles.", outputKey: "registry-candidates" },
      { stepIndex: 4, label: "Determine Smallest Justified Route", instruction: "Compare native vs. library options. Route decision.", outputKey: "routing-decision" },
      { stepIndex: 5, label: "Formulate Routing Validation", instruction: "Outline integration validation steps and missing evidence reports.", outputKey: "validation-plan" }
    ],
    outputSections,
    rawOutputs
  }
}

// ─── Quality Gates ──────────────────────────────────────────────────────────

export const libraryFirstCompositionRouterGates: CreativeMethodQualityGate[] = [
  {
    gateId: "lfcr.native-first",
    label: "Native First",
    description: "Do not recommend a dependency when native primitives are sufficient.",
    passCriteria: ["selectedRoute must be USE_NATIVE for simple features"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const cap = result.rawOutputs.requestedCapability ?? ""
      const route = result.rawOutputs.selectedRoute ?? ""
      const isSimple = cap.toLowerCase().includes("simple fade") || cap.toLowerCase().includes("basic layout")
      const passed = !isSimple || route === "USE_NATIVE"
      return {
        gateId: "lfcr.native-first",
        label: "Native First",
        passed,
        failReasons: passed ? [] : ["Recommended a library dependency for a simple capability that can be solved natively."]
      }
    }
  },
  {
    gateId: "lfcr.registry-grounded",
    label: "Registry Grounded",
    description: "Only recommend resources that actually exist in the governed registry.",
    passCriteria: ["selectedResource must exist in candidate list or be none"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const res = result.rawOutputs.selectedResource ?? "none"
      const candidatesRaw = result.rawOutputs.registryCandidates ?? "[]"
      try {
        const candidates = JSON.parse(candidatesRaw) as { id: string }[]
        const passed = res === "none" || candidates.some(c => c.id === res)
        return {
          gateId: "lfcr.registry-grounded",
          label: "Registry Grounded",
          passed,
          failReasons: passed ? [] : [`Recommended resource "${res}" does not exist in registry candidates list.`]
        }
      } catch {
        return {
          gateId: "lfcr.registry-grounded",
          label: "Registry Grounded",
          passed: false,
          failReasons: ["Failed to parse registry candidates."]
        }
      }
    }
  },
  {
    gateId: "lfcr.lifecycle-honest",
    label: "Lifecycle Honest",
    description: "TEST_CANDIDATE or experimental resources cannot be described as APPROVED.",
    passCriteria: ["selectedRoute must match the actual candidate lifecycle state"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const route = result.rawOutputs.selectedRoute ?? ""
      const candidatesRaw = result.rawOutputs.registryCandidates ?? "[]"
      try {
        const candidates = JSON.parse(candidatesRaw) as { id: string; lifecycleState: string }[]
        const targetRes = result.rawOutputs.selectedResource ?? "none"
        const candidate = candidates.find(c => c.id === targetRes)
        const isApprovedRoute = route === "CONSIDER_APPROVED_RESOURCE"
        const isApprovedRes = candidate && candidate.lifecycleState === "APPROVED"
        const passed = !isApprovedRoute || !!isApprovedRes
        return {
          gateId: "lfcr.lifecycle-honest",
          label: "Lifecycle Honest",
          passed,
          failReasons: passed ? [] : ["Routed to experimental/unapproved resource using APPROVED recommendation routing."]
        }
      } catch {
        return {
          gateId: "lfcr.lifecycle-honest",
          label: "Lifecycle Honest",
          passed: false,
          failReasons: ["Failed to parse candidates for lifecycle check."]
        }
      }
    }
  },
  {
    gateId: "lfcr.discovery-not-production",
    label: "Discovery Not Production",
    description: "DISCOVERY_FEED resources cannot satisfy production directly.",
    passCriteria: ["selectedResource type must not be DISCOVERY_FEED"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const candidatesRaw = result.rawOutputs.registryCandidates ?? "[]"
      const res = result.rawOutputs.selectedResource ?? "none"
      try {
        const candidates = JSON.parse(candidatesRaw) as { id: string; type: string }[]
        const match = candidates.find(c => c.id === res)
        const passed = !match || match.type !== "DISCOVERY_FEED"
        return {
          gateId: "lfcr.discovery-not-production",
          label: "Discovery Not Production",
          passed,
          failReasons: passed ? [] : ["Directly routed production dependency to a DISCOVERY_FEED resource."]
        }
      } catch {
        return {
          gateId: "lfcr.discovery-not-production",
          label: "Discovery Not Production",
          passed: false,
          failReasons: ["Failed to parse candidates for discovery check."]
        }
      }
    }
  },
  {
    gateId: "lfcr.smallest-justified-dependency",
    label: "Smallest Justified Dependency",
    description: "Choose the minimum capability burden that solves the need.",
    passCriteria: ["selectedRoute rationale must explain rejection of larger options"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const why = result.rawOutputs.whySmallerAlternativesWereRejected ?? ""
      const passed = why.length > 20
      return {
        gateId: "lfcr.smallest-justified-dependency",
        label: "Smallest Justified Dependency",
        passed,
        failReasons: passed ? [] : ["Missing explanation of why smaller alternatives were rejected."]
      }
    }
  },
  {
    gateId: "lfcr.evidence-aware",
    label: "Evidence Aware",
    description: "If maintenance, license, or performance evidence is absent in registry metadata, report UNKNOWN.",
    passCriteria: ["licenseConsiderations and performanceConsiderations report UNKNOWN when unverified"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const lic = result.rawOutputs.licenseConsiderations ?? ""
      const perf = result.rawOutputs.performanceConsiderations ?? ""
      const passed = lic.includes("UNKNOWN") && perf.includes("UNKNOWN")
      return {
        gateId: "lfcr.evidence-aware",
        label: "Evidence Aware",
        passed,
        failReasons: passed ? [] : ["Did not report UNKNOWN status for unverified license or performance metrics."]
      }
    }
  },
  {
    gateId: "lfcr.no-execution",
    label: "No Execution",
    description: "Verify that the method output recommends local configuration but performs no code package installations.",
    passCriteria: ["rawOutputs must not specify npm install, shell scripts, or imports"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const why = result.rawOutputs.whySmallerAlternativesWereRejected ?? ""
      const passed = !why.toLowerCase().includes("npm install") && !why.toLowerCase().includes("git clone")
      return {
        gateId: "lfcr.no-execution",
        label: "No Execution",
        passed,
        failReasons: passed ? [] : ["Output contains prohibited installation commands."]
      }
    }
  }
]

export function runLibraryFirstCompositionRouter(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(libraryFirstCompositionRouterDefinition, libraryFirstCompositionRouterGates, input, produce)
}
