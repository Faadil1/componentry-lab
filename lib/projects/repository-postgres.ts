import "server-only"

import { getDatabase } from "@/lib/persistence/db"
import { ensureCanonicalStorageSchema } from "@/lib/persistence/canonical-storage-bootstrap"
import type { ProjectBrain, ProjectId, ProjectSlug } from "./types"
import type { AuthorityContext } from "../director/types"
import { projectPresets } from "./presets"
import { validateProjectBrain } from "./validation"

export interface ProjectRepositoryResolution {
  dataDir: string
  repositoryFilePath: string
  envOverrideSupported: boolean
  runtimeVendorCoupled: boolean
}

function cloneProject(project: ProjectBrain): ProjectBrain {
  return JSON.parse(JSON.stringify(project)) as ProjectBrain
}

export async function listProjectsPostgres(): Promise<ProjectBrain[]> {
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_projects
    ORDER BY slug ASC
  `
  const runtime = rows.map((row) => cloneProject((row as { payload: ProjectBrain }).payload))
  const seeds = projectPresets.map(cloneProject)
  const runtimeById = new Map(runtime.map((project) => [project.id, project]))
  const combined = seeds.map((seed) => runtimeById.get(seed.id) ?? seed)
  for (const project of runtime) {
    if (!projectPresets.some((seed) => seed.id === project.id)) {
      combined.push(project)
    }
  }
  return combined
}

export async function getProjectByIdPostgres(id: ProjectId): Promise<ProjectBrain | undefined> {
  return (await listProjectsPostgres()).find((project) => project.id === id)
}

export async function getProjectBySlugPostgres(slug: ProjectSlug): Promise<ProjectBrain | undefined> {
  return (await listProjectsPostgres()).find((project) => project.slug === slug)
}

export async function createProjectPostgres(input: {
  title: string
  kind: ProjectBrain["kind"]
  problem: string
  primaryGoal: string
  successDefinition?: string
  brief?: string
}, authorityContext: AuthorityContext ): Promise<import("./repository-local").CreateProjectResult> {
  if (
    authorityContext.status !== "granted" ||
    authorityContext.authorityLevel !== "local-reversible-execution" ||
    authorityContext.approvalRequirement !== "explicit" ||
    authorityContext.reversibility !== "reversible" ||
    !authorityContext.grantedScope.includes("project:create")
  ) {
    return { status: "INSUFFICIENT_AUTHORITY", error: "Local reversible authority with explicit approval is required." } as import("./repository-local").CreateProjectResult
  }

  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const title = input.title.trim()
  const problem = input.problem.trim()
  const primaryGoal = input.primaryGoal.trim()
  if (!title || !problem || !primaryGoal) {
    return { status: "VALIDATION_FAILED", error: "Title, problem, and primary goal are required." } as import("./repository-local").CreateProjectResult
  }

  const now = new Date().toISOString()
  const existing = await listProjectsPostgres()
  const existingIds = new Set(existing.map((project) => project.id))
  const baseId = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project"
  let id = baseId
  if (existingIds.has(id)) {
    let i = 2
    while (existingIds.has(`${baseId}-${i}`)) i += 1
    id = `${baseId}-${i}`
  }

  const project: ProjectBrain = {
    id,
    slug: id,
    title,
    shortTitle: title,
    description: input.brief?.trim() || problem,
    kind: input.kind,
    status: "intake",
    currentPhase: "intake",
    completedPhases: [],
    blockedPhases: [],
    nextRecommendedPhase: "qualify",
    priority: "medium",
    createdLabel: now.slice(0, 10),
    updatedLabel: now.slice(0, 10),
    problem,
    audience: "",
    primaryGoal,
    successDefinition: input.successDefinition?.trim() || "Not yet defined",
    constraints: [],
    stakeholders: [],
    requirements: [],
    evaluationCriteria: [],
    sourceLinks: [],
    references: [],
    positioningStatement: "",
    tension: "",
    memoryHook: "",
    differentiation: "",
    categoryClaim: "",
    alternatives: [],
    rejectedAngles: [],
    visualDirection: "",
    typographyDirection: "",
    colorDirection: "",
    layoutDirection: "",
    interactionDirection: "",
    responsiveStrategy: "",
    accessibilityStrategy: "",
    designPrinciples: [],
    antiPatterns: [],
    rejectedDirections: [],
    primaryClaim: "",
    evidence: [],
    proofMoment: "",
    technicalProof: "",
    failureMode: "",
    fallback: "",
    unresolvedProofGaps: [],
    selectedRegistryIds: [],
    selectedPlaybookIds: [],
    selectedReadingPathIds: [],
    selectedRecipeIds: [],
    architectureNotes: "",
    implementationConstraints: [],
    acceptanceCriteria: [],
    technicalRisks: [],
    capturePlan: { states: [] },
    signatureStateId: "",
    signatureFrame: 0,
    heroDemoMoment: "",
    cleanViewRoute: `/projects/${id}`,
    restoreUrls: {},
    captureLimitations: [],
    videoPlan: {
      purpose: "",
      audience: "",
      durationSeconds: 0,
      formats: [],
      narrative: "",
      hook: "",
      scenes: [],
      proofMoments: [],
      shots: [],
      transitions: [],
      voiceover: "",
      subtitles: "",
      soundDirection: "",
      cta: "",
      outputVariants: [],
      missingAssets: [],
      captureDependencies: [],
      productionReadiness: "draft",
    },
    facts: [],
    assumptions: [],
    decisions: [],
    rejections: [],
    risks: [],
    outputs: [],
    nextActions: [],
    learnings: [],
    openQuestions: [],
    blockedBy: [],
    auditResults: [],
    currentScore: 0,
    readiness: 0,
    blockers: [],
    warnings: [],
    publicationGate: false,
    submissionGate: false,
  }

  const validation = validateProjectBrain(project)
  if (!validation.valid) {
    return { status: "VALIDATION_FAILED", error: validation.errors.join("; "), project } as import("./repository-local").CreateProjectResult
  }

  await sql`
    INSERT INTO componentry_projects (project_id, slug, payload, created_at, updated_at)
    VALUES (${project.id}, ${project.slug}, ${JSON.stringify(project)}::jsonb, ${now}, ${now})
    ON CONFLICT (project_id) DO UPDATE SET
      slug = EXCLUDED.slug,
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at
  `

  return { status: "CREATED", project: cloneProject(project) } as import("./repository-local").CreateProjectResult
}

