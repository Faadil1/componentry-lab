import { decodeCanonicalJsonbPayload } from "../persistence/jsonb-compat.ts"
import type { ProjectBrain, ProjectId, ProjectSlug } from "./types.ts"
import type { AuthorityContext } from "../director/types.ts"
import { projectPresets } from "./presets.ts"
import { validateProjectBrain } from "./validation.ts"

export interface ProjectRepositoryResolution {
  dataDir: string
  repositoryFilePath: string
  envOverrideSupported: boolean
  runtimeVendorCoupled: boolean
}

export type ProjectSqlClient = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Array<Record<string, unknown>>>
  unsafe<T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]): Promise<T>
}

async function loadDatabase(): Promise<ProjectSqlClient> {
  const { getDatabase } = await import("../persistence/db.ts")
  return getDatabase() as unknown as ProjectSqlClient
}

async function ensureCanonicalStorage(sql: ProjectSqlClient): Promise<void> {
  const { ensureCanonicalStorageSchema } = await import("../persistence/canonical-storage-bootstrap.ts")
  await ensureCanonicalStorageSchema(sql)
}

function cloneProject(project: ProjectBrain): ProjectBrain {
  return JSON.parse(JSON.stringify(project)) as ProjectBrain
}

function decodeProjectPayload(payload: unknown): ProjectBrain | undefined {
  return decodeCanonicalJsonbPayload<ProjectBrain>(payload)
}

export async function listProjectsPostgresWithSql(sql: ProjectSqlClient): Promise<ProjectBrain[]> {
  await ensureCanonicalStorage(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_projects
    ORDER BY slug ASC
  `
  const runtime = rows.flatMap((row) => {
    const project = decodeProjectPayload((row as { payload: unknown }).payload)
    return project ? [cloneProject(project)] : []
  })
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

export async function listProjectsPostgres(): Promise<ProjectBrain[]> {
  const sql = await loadDatabase()
  return listProjectsPostgresWithSql(sql)
}

export async function getProjectByIdPostgresWithSql(sql: ProjectSqlClient, id: ProjectId): Promise<ProjectBrain | undefined> {
  return (await listProjectsPostgresWithSql(sql)).find((project) => project.id === id)
}

export async function getProjectByIdPostgres(id: ProjectId): Promise<ProjectBrain | undefined> {
  const sql = await loadDatabase()
  return getProjectByIdPostgresWithSql(sql, id)
}

export async function getProjectBySlugPostgresWithSql(sql: ProjectSqlClient, slug: ProjectSlug): Promise<ProjectBrain | undefined> {
  return (await listProjectsPostgresWithSql(sql)).find((project) => project.slug === slug)
}

export async function getProjectBySlugPostgres(slug: ProjectSlug): Promise<ProjectBrain | undefined> {
  const sql = await loadDatabase()
  return getProjectBySlugPostgresWithSql(sql, slug)
}

export async function createProjectPostgresWithSql(sql: ProjectSqlClient, input: {
  title: string
  kind: ProjectBrain["kind"]
  problem: string
  primaryGoal: string
  successDefinition?: string
  brief?: string
}, authorityContext: AuthorityContext): Promise<import("./repository-local").CreateProjectResult> {
  if (
    authorityContext.status !== "granted" ||
    authorityContext.authorityLevel !== "local-reversible-execution" ||
    authorityContext.approvalRequirement !== "explicit" ||
    authorityContext.reversibility !== "reversible" ||
    !authorityContext.grantedScope.includes("project:create")
  ) {
    return { status: "INSUFFICIENT_AUTHORITY", error: "Local reversible authority with explicit approval is required." } as import("./repository-local").CreateProjectResult
  }

  await ensureCanonicalStorage(sql)
  const title = input.title.trim()
  const problem = input.problem.trim()
  const primaryGoal = input.primaryGoal.trim()
  if (!title || !problem || !primaryGoal) {
    return { status: "VALIDATION_FAILED", error: "Title, problem, and primary goal are required." } as import("./repository-local").CreateProjectResult
  }

  const now = new Date().toISOString()
  const existing = await listProjectsPostgresWithSql(sql)
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

  await sql.unsafe(
    `
    INSERT INTO componentry_projects (project_id, slug, payload, created_at, updated_at)
    VALUES ($1, $2, $3::jsonb, $4, $5)
    ON CONFLICT (project_id) DO UPDATE SET
      slug = EXCLUDED.slug,
      payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at
  `,
    [project.id, project.slug, project, now, now],
  )

  return { status: "CREATED", project: cloneProject(project) } as import("./repository-local").CreateProjectResult
}

export async function createProjectPostgres(input: {
  title: string
  kind: ProjectBrain["kind"]
  problem: string
  primaryGoal: string
  successDefinition?: string
  brief?: string
}, authorityContext: AuthorityContext): Promise<import("./repository-local").CreateProjectResult> {
  const sql = await loadDatabase()
  return createProjectPostgresWithSql(sql, input, authorityContext)
}
