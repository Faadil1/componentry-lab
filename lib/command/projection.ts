import { registryComponents } from "../registry/components"
import { RESOURCE_REGISTRY } from "../creative-os/registry"
import { CANONICAL_DEFAULT_PROJECT_ID } from "../projects/selectors"
import { getProjectById } from "../projects/selectors"
import { validateProjectBrain } from "../projects/validation"
import type { ProjectBrain } from "../projects/types"
import { adaptDirectorResult, adaptProjectBrainToDirectorInput, mapProjectKindToCreativeMode } from "../director"
import { getProductionState } from "../creative-os/production/repository"
import { getFilmProjectById } from "../film-kit/selectors"
import { getFilmProductionIntent, getFilmProductionTruth } from "../film-kit/production-adapter"

export interface CommandProjection {
  activeProject: ProjectBrain | null
  projectPhase: string
  readiness: number
  blockers: string[]
  directorAvailability: "AVAILABLE" | "UNAVAILABLE"
  directorNextAction: { title: string; rationale: string } | null
  directorRationaleSummary: string | null
  heroDemo: { title: string; readinessStatus: string; visibleTransformationOrProof: string } | null
  productionIntentSummary: { availability: string; intentDefined: boolean } | null
  canonicalProductionAvailability: { availability: string; routes: number; artifacts: number; manifest: "present" | "none"; nextAssemblyStep: string | null } | null
  librarySummary: { components: number; creativeResources: number }
}

export function buildCommandProjection(projectId: string | null | undefined): CommandProjection {
  const activeProjectId = projectId ?? CANONICAL_DEFAULT_PROJECT_ID
  const activeProject = getProjectById(activeProjectId) ?? null
  const components = registryComponents.length
  const creativeResources = RESOURCE_REGISTRY.length

  if (!activeProject) {
    return { activeProject: null, projectPhase: "unavailable", readiness: 0, blockers: ["Project context unavailable"], directorAvailability: "UNAVAILABLE", directorNextAction: null, directorRationaleSummary: null, heroDemo: null, productionIntentSummary: null, canonicalProductionAvailability: null, librarySummary: { components, creativeResources } }
  }

  const mode = mapProjectKindToCreativeMode(activeProject.kind)
  const directorInput = adaptProjectBrainToDirectorInput(activeProject, mode, activeProject.currentPhase, {
    authorityLevel: "suggest",
    requestedAction: activeProject.nextActions[0]?.label ?? "Review project",
    target: activeProject.id,
    reversibility: "unknown",
    risk: "low",
    approvalRequirement: "none",
    grantedScope: [],
    status: "pending",
  })
  const directorResult = adaptDirectorResult(directorInput)
  const filmProject = getFilmProjectById(activeProject.id)
  const filmIntent = filmProject ? getFilmProductionIntent(filmProject) : null
  const filmTruth = filmProject ? getFilmProductionTruth(filmProject.id) : null
  const productionState = getProductionState(activeProject.id)

  return {
    activeProject,
    projectPhase: directorResult.resolvedPhase,
    readiness: validateProjectBrain(activeProject).readinessScore,
    blockers: [...activeProject.blockers, ...activeProject.blockedBy],
    directorAvailability: "AVAILABLE",
    directorNextAction: { title: directorResult.nextAction.title, rationale: directorResult.nextAction.rationale },
    directorRationaleSummary: directorResult.nextAction.rationale,
    heroDemo: { title: directorResult.heroDemoMoment.title, readinessStatus: directorResult.heroDemoMoment.readinessStatus, visibleTransformationOrProof: directorResult.heroDemoMoment.visibleTransformationOrProof },
    productionIntentSummary: filmIntent ? { availability: "DEFINED", intentDefined: true } : null,
    canonicalProductionAvailability: { availability: productionState.routes.length > 0 ? "AVAILABLE" : "NO_CANONICAL_PRODUCTION_SPINE", routes: productionState.routes.length, artifacts: filmTruth?.artifacts.length ?? 0, manifest: filmTruth?.manifest ? "present" : "none", nextAssemblyStep: filmTruth?.manifest?.nextAssemblyStep ?? null },
    librarySummary: { components, creativeResources },
  }
}
