import type { AuthorityContext } from "@/lib/director/types"
import type { ExternalCapabilityPlan } from "@/lib/creative-os/film-kit"
import type { FilmProject } from "@/lib/film-kit/types"
import type { ProjectBrain } from "@/lib/projects"
import { listPlansForProject } from "./planning-repository"

export type ProductionEntryLegitimacy = "EXISTING_CANONICAL_EXTERNAL_CAPABILITY_PLAN" | "EXISTING_CANONICAL_INTERNAL_PRODUCTION_PLAN" | "LEGITIMATE_FILM_KIT_PRODUCTION_NEED_WITH_CANONICAL_MAPPING" | "NO_LEGITIMATE_PLAN_SOURCE" | "SYNTHETIC_RECONSTRUCTION"

export interface ProductionEntryProposal {
  legitimacy: ProductionEntryLegitimacy
  project: ProjectBrain
  film: FilmProject | null
  plan: ExternalCapabilityPlan | null
  authorityContext: AuthorityContext | null
  routePreview: {
    routeType: string
    authorityRequired: string
    licenseState: string
    privacyClass: string
    estimatedCost: string | null
  } | null
  routeTruth: {
    requestedArtifactType: string
    productionCapability: string | null
    routeType: string
    resourceId: string | null
    providerAdapterId: string | null
    authorityRequired: string
    estimatedCost: string | null
    licenseState: string
    privacyClass: string
    qualityGates: string[]
  } | null
}

export async function buildProductionEntryProposal(project: ProjectBrain, film: FilmProject | null): Promise<ProductionEntryProposal> {
  const plans = await listPlansForProject(project.id)
  const plan = plans[0] ?? null
  const legitimacy: ProductionEntryLegitimacy = plan
    ? "LEGITIMATE_FILM_KIT_PRODUCTION_NEED_WITH_CANONICAL_MAPPING"
    : film
      ? "LEGITIMATE_FILM_KIT_PRODUCTION_NEED_WITH_CANONICAL_MAPPING"
      : "NO_LEGITIMATE_PLAN_SOURCE"

  const routePreview = plan
    ? {
        routeType: plan.resourceId === "res_cineprompt" ? "EXTERNAL_PROVIDER" : plan.resourceId === "res_video_shotcraft" ? "EXTERNAL_PIPELINE" : "NO_MATCH",
        authorityRequired: plan.requiredAuthority,
        licenseState: plan.licenseStatus ?? "UNKNOWN",
        privacyClass: plan.privacyStatus,
        estimatedCost: plan.estimatedCost,
      }
    : null

  const routeTruth = plan
    ? {
        requestedArtifactType: plan.requestedArtifact ?? "unknown",
        productionCapability: plan.capabilityId,
        routeType: routePreview?.routeType ?? "NO_MATCH",
        resourceId: plan.resourceId,
        providerAdapterId: plan.resourceId === "res_cineprompt" ? "adapter_cineprompt_share_link_v2" : null,
        authorityRequired: plan.requiredAuthority,
        estimatedCost: plan.estimatedCost,
        licenseState: plan.licenseStatus ?? "UNKNOWN",
        privacyClass: plan.privacyStatus,
        qualityGates: plan.executionStatus === "HUMAN_APPROVAL_REQUIRED" || plan.executionStatus === "EXTERNAL_PLAN_READY" ? ["PRODUCTION_ENTRY_REVIEW", "NO_EXECUTION"] : ["NO_EXECUTION"],
      }
    : null

  return {
    legitimacy,
    project,
    film,
    plan,
    authorityContext: null,
    routePreview,
    routeTruth,
  }
}
