import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import os from "node:os"

import { projectPresets } from "./presets"
import { validateProjectBrain } from "./validation"
import type { ProjectBrain, ProjectId, ProjectKind } from "./types"
import type { AuthorityContext } from "../director/types"

export type ProjectMode = "DAY_CHALLENGE" | "HACKATHON" | "MARA" | "DATA_STORY"
export type RepositoryHealth = "HEALTHY" | "ABSENT" | "CORRUPT" | "UNREADABLE"

export type CreateProjectStatus =
  | "CREATED"
  | "VALIDATION_FAILED"
  | "DUPLICATE_ID"
  | "PERSISTENCE_FAILED"
  | "UNSUPPORTED_KIND"
  | "INSUFFICIENT_AUTHORITY"
  | "REPOSITORY_CORRUPT"

export interface CreateProjectInput {
  title: string
  kind: ProjectKind
  problem: string
  primaryGoal: string
  successDefinition?: string
  brief?: string
}

export interface CreateProjectResult {
  status: CreateProjectStatus
  project?: ProjectBrain
  error?: string
  duplicateId?: string
  mode?: ProjectMode
}

export interface ProjectRepositoryResolution {
  dataDir: string
  repositoryFilePath: string
  envOverrideSupported: boolean
  runtimeVendorCoupled: boolean
}

interface ProjectRepositoryState {
  runtimeProjects: ProjectBrain[]
}

const DEFAULT_DATA_DIR = join(os.homedir(), ".componentry-lab")

const KIND_TO_MODE: Record<ProjectKind, ProjectMode> = {
  "client-product": "DAY_CHALLENGE",
  "internal-tool": "DAY_CHALLENGE",
  website: "DAY_CHALLENGE",
  "product-prototype": "DAY_CHALLENGE",
  hackathon: "HACKATHON",
  "design-challenge": "DAY_CHALLENGE",
  "creative-experiment": "MARA",
  "data-story": "DATA_STORY",
  "broadcast-interface": "HACKATHON",
  "demo-film": "HACKATHON",
  "portfolio-case-study": "DAY_CHALLENGE",
}

function getProjectDataDir(): string {
  return process.env.COMPONENTRY_LAB_DATA_DIR || DEFAULT_DATA_DIR
}

function getRepositoryFilePath(): string {
  return join(getProjectDataDir(), "project-repository", "projects.json")
}

function getRepositoryTempFilePath(): string {
  return join(getProjectDataDir(), "project-repository", "projects.json.tmp")
}

function cloneProject(project: ProjectBrain): ProjectBrain {
  return JSON.parse(JSON.stringify(project)) as ProjectBrain
}

function readRepository(): { health: RepositoryHealth; state: ProjectRepositoryState | null; raw: string | null } {
  const repositoryFilePath = getRepositoryFilePath()
  if (!existsSync(repositoryFilePath)) {
    return { health: "ABSENT", state: null, raw: null }
  }

  try {
    const raw = readFileSync(repositoryFilePath, "utf8")
    const parsed = JSON.parse(raw) as Partial<ProjectRepositoryState>
    const runtimeProjects = Array.isArray(parsed.runtimeProjects) ? (parsed.runtimeProjects as ProjectBrain[]) : []
    return { health: "HEALTHY", state: { runtimeProjects: runtimeProjects.map(cloneProject) }, raw }
  } catch (error) {
    try {
      const raw = readFileSync(repositoryFilePath, "utf8")
      if (error instanceof SyntaxError) {
        return { health: "CORRUPT", state: null, raw }
      }
      return { health: "UNREADABLE", state: null, raw }
    } catch {
      return { health: "UNREADABLE", state: null, raw: null }
    }
  }
}

function writeRepositoryAtomic(state: ProjectRepositoryState): void {
  const repositoryFilePath = getRepositoryFilePath()
  const tempFilePath = getRepositoryTempFilePath()
  mkdirSync(dirname(repositoryFilePath), { recursive: true })
  writeFileSync(tempFilePath, JSON.stringify(state, null, 2), "utf8")
  renameSync(tempFilePath, repositoryFilePath)
}

function normalizeSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[\'\"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "project"
}

function uniqueProjectId(baseSlug: string, existingIds: Set<string>): string {
  if (!existingIds.has(baseSlug)) return baseSlug
  let index = 2
  while (existingIds.has(`${baseSlug}-${index}`)) index += 1
  return `${baseSlug}-${index}`
}

function createEmptyProjectBrain(id: string, input: CreateProjectInput): ProjectBrain {
  const now = new Date().toISOString()
  return {
    id,
    slug: id,
    title: input.title.trim(),
    shortTitle: input.title.trim(),
    description: input.brief?.trim() || input.problem.trim(),
    kind: input.kind,
    status: "intake",
    currentPhase: "intake",
    completedPhases: [],
    blockedPhases: [],
    nextRecommendedPhase: "qualify",
    priority: "medium",
    createdLabel: now.slice(0, 10),
    updatedLabel: now.slice(0, 10),
    problem: input.problem.trim(),
    audience: "",
    primaryGoal: input.primaryGoal.trim(),
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
}

function normalizeProject(project: ProjectBrain): ProjectBrain {
  const normalized = cloneProject(project)
  normalized.slug = normalized.slug || normalized.id
  normalized.shortTitle = normalized.shortTitle || normalized.title
  normalized.description = normalized.description || normalized.problem || normalized.title
  normalized.currentPhase = normalized.currentPhase || "intake"
  normalized.status = normalized.status || "intake"
  normalized.completedPhases = normalized.completedPhases || []
  normalized.blockedPhases = normalized.blockedPhases || []
  normalized.nextRecommendedPhase = normalized.nextRecommendedPhase || "qualify"
  normalized.priority = normalized.priority || "medium"
  normalized.createdLabel = normalized.createdLabel || new Date().toISOString().slice(0, 10)
  normalized.updatedLabel = normalized.updatedLabel || normalized.createdLabel
  normalized.constraints = normalized.constraints || []
  normalized.stakeholders = normalized.stakeholders || []
  normalized.requirements = normalized.requirements || []
  normalized.evaluationCriteria = normalized.evaluationCriteria || []
  normalized.sourceLinks = normalized.sourceLinks || []
  normalized.references = normalized.references || []
  normalized.alternatives = normalized.alternatives || []
  normalized.rejectedAngles = normalized.rejectedAngles || []
  normalized.designPrinciples = normalized.designPrinciples || []
  normalized.antiPatterns = normalized.antiPatterns || []
  normalized.rejectedDirections = normalized.rejectedDirections || []
  normalized.evidence = normalized.evidence || []
  normalized.unresolvedProofGaps = normalized.unresolvedProofGaps || []
  normalized.selectedRegistryIds = normalized.selectedRegistryIds || []
  normalized.selectedPlaybookIds = normalized.selectedPlaybookIds || []
  normalized.selectedReadingPathIds = normalized.selectedReadingPathIds || []
  normalized.selectedRecipeIds = normalized.selectedRecipeIds || []
  normalized.implementationConstraints = normalized.implementationConstraints || []
  normalized.acceptanceCriteria = normalized.acceptanceCriteria || []
  normalized.technicalRisks = normalized.technicalRisks || []
  normalized.capturePlan = normalized.capturePlan || { states: [] }
  normalized.restoreUrls = normalized.restoreUrls || {}
  normalized.captureLimitations = normalized.captureLimitations || []
  normalized.facts = normalized.facts || []
  normalized.assumptions = normalized.assumptions || []
  normalized.decisions = normalized.decisions || []
  normalized.rejections = normalized.rejections || []
  normalized.risks = normalized.risks || []
  normalized.outputs = normalized.outputs || []
  normalized.nextActions = normalized.nextActions || []
  normalized.learnings = normalized.learnings || []
  normalized.openQuestions = normalized.openQuestions || []
  normalized.blockedBy = normalized.blockedBy || []
  normalized.auditResults = normalized.auditResults || []
  normalized.blockers = normalized.blockers || []
  normalized.warnings = normalized.warnings || []
  return normalized
}

function getProjectsInternal(): { health: RepositoryHealth; projects: ProjectBrain[] } {
  const repository = readRepository()
  const seedProjects = projectPresets.map(cloneProject)
  if (repository.health !== "HEALTHY" || !repository.state) {
    return { health: repository.health, projects: seedProjects }
  }

  const runtimeById = new Map(repository.state.runtimeProjects.map((project) => [project.id, normalizeProject(project)]))
  const combined = seedProjects.map((seed) => runtimeById.get(seed.id) ?? seed)
  for (const runtime of runtimeById.values()) {
    if (!projectPresets.some((seed) => seed.id === runtime.id)) {
      combined.push(runtime)
    }
  }
  return { health: repository.health, projects: combined.map(normalizeProject) }
}

function canWriteRuntimeRepository(authorityContext: AuthorityContext): boolean {
  return (
    authorityContext.status === "granted" &&
    authorityContext.authorityLevel === "local-reversible-execution" &&
    authorityContext.approvalRequirement === "explicit" &&
    authorityContext.reversibility === "reversible" &&
    authorityContext.grantedScope.includes("project:create")
  )
}

export function getProjectDataDirResolution(): ProjectRepositoryResolution {
  return {
    dataDir: getProjectDataDir(),
    repositoryFilePath: getRepositoryFilePath(),
    envOverrideSupported: true,
    runtimeVendorCoupled: false,
  }
}

export function listProjects(): ProjectBrain[] {
  return getProjectsInternal().projects
}

export function getProjectRepositoryHealth(): RepositoryHealth {
  return readRepository().health
}

export function getProjectById(id: ProjectId): ProjectBrain | undefined {
  return getProjectsInternal().projects.find((project) => project.id === id)
}

export function getProjectBySlug(slug: string): ProjectBrain | undefined {
  return getProjectsInternal().projects.find((project) => project.slug === slug)
}

export function createProject(input: CreateProjectInput, authorityContext: AuthorityContext): CreateProjectResult {
  if (!canWriteRuntimeRepository(authorityContext)) {
    return {
      status: "INSUFFICIENT_AUTHORITY",
      error: "Local reversible authority with explicit approval is required.",
    }
  }

  const repository = readRepository()
  if (repository.health === "CORRUPT") {
    return {
      status: "REPOSITORY_CORRUPT",
      error: "Canonical project repository is corrupt and must be repaired before writes.",
    }
  }
  if (repository.health === "UNREADABLE") {
    return {
      status: "PERSISTENCE_FAILED",
      error: "Canonical project repository is unreadable.",
    }
  }

  const title = input.title.trim()
  const problem = input.problem.trim()
  const primaryGoal = input.primaryGoal.trim()

  if (!title || !problem || !primaryGoal) {
    return {
      status: "VALIDATION_FAILED",
      error: "Title, problem, and primary goal are required.",
    }
  }

  const mode = KIND_TO_MODE[input.kind]
  if (!mode) {
    return {
      status: "UNSUPPORTED_KIND",
      error: `Unsupported project kind: ${input.kind}`,
    }
  }

  const existingProjects = getProjectsInternal().projects
  const existingIds = new Set(existingProjects.map((project) => project.id))
  const baseId = normalizeSlug(title)
  const id = uniqueProjectId(baseId, existingIds)

  if (existingIds.has(id)) {
    return {
      status: "DUPLICATE_ID",
      error: `Project id already exists: ${id}`,
      duplicateId: id,
      mode,
    }
  }

  const project = normalizeProject(createEmptyProjectBrain(id, { ...input, title, problem, primaryGoal }))
  const validation = validateProjectBrain(project)
  if (!validation.valid) {
    return {
      status: "VALIDATION_FAILED",
      project,
      error: validation.errors.join("; "),
      mode,
    }
  }

  const nextState: ProjectRepositoryState = {
    runtimeProjects: [...(repository.state?.runtimeProjects ?? []), project],
  }

  try {
    writeRepositoryAtomic(nextState)
  } catch (error) {
    try {
      if (existsSync(getRepositoryTempFilePath())) rmSync(getRepositoryTempFilePath(), { force: true })
    } catch {
      // Best-effort cleanup.
    }
    return {
      status: "PERSISTENCE_FAILED",
      error: (error as Error).message,
      mode,
    }
  }

  return {
    status: "CREATED",
    project,
    mode,
  }
}

export function getProjectRepositoryPath(): string {
  return getRepositoryFilePath()
}

export function getProjectRepositoryDataDir(): string {
  return getProjectDataDir()
}

export function clearProjectRepositoryForTests(): void {
  try {
    const file = getRepositoryFilePath()
    const temp = getRepositoryTempFilePath()
    if (existsSync(file)) rmSync(file, { force: true })
    if (existsSync(temp)) rmSync(temp, { force: true })
  } catch {
    // Best-effort test cleanup.
  }
}

export function resolveProjectMode(kind: ProjectKind): ProjectMode {
  return KIND_TO_MODE[kind]
}