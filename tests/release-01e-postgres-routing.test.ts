import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"

import * as projectRepo from "../lib/projects/repository"
import * as planningRepo from "../lib/creative-os/production/planning-repository"
import { getComponentryLabStorageMode } from "../lib/persistence/storage-mode"
import type { AuthorityContext } from "../lib/director/types"
import type { ExternalCapabilityPlan } from "../lib/creative-os/film-kit/types"

const projectAuthority: AuthorityContext = {
  authorityLevel: "local-reversible-execution",
  requestedAction: "Create project",
  target: "project-repository",
  reversibility: "reversible",
  risk: "low",
  approvalRequirement: "explicit",
  grantedScope: ["project:create"],
  grantedBy: "system",
  grantedAt: new Date().toISOString(),
  expiration: null,
  status: "granted",
}

function restoreFactories() {
  projectRepo.__setProjectRepositoryBackendFactoryForTests(null)
  planningRepo.__setPlanningRepositoryBackendFactoryForTests(null)
}

beforeEach(() => {
  process.env.COMPONENTRY_LAB_STORAGE_MODE = "postgres"
  restoreFactories()
})

afterEach(() => {
  restoreFactories()
  delete process.env.COMPONENTRY_LAB_STORAGE_MODE
})

test("postgres mode routes canonical project facade to the postgres backend", async () => {
  const modeCalls: string[] = []
  const backendCalls: string[] = []

  projectRepo.__setProjectRepositoryBackendFactoryForTests((mode) => {
    modeCalls.push(mode)
    if (mode !== "postgres") {
      return {
        listProjects: () => {
          backendCalls.push("local:list")
          return []
        },
        getProjectById: () => {
          backendCalls.push("local:getById")
          return undefined
        },
        getProjectBySlug: () => {
          backendCalls.push("local:getBySlug")
          return undefined
        },
        createProject: () => {
          backendCalls.push("local:create")
          return { status: "CREATED" }
        },
      }
    }

    return {
      listProjects: async () => {
        backendCalls.push("postgres:list")
        return [{ id: "postgres-project", slug: "postgres-project" } as never]
      },
      getProjectById: async () => {
        backendCalls.push("postgres:getById")
        return { id: "postgres-project", slug: "postgres-project" } as never
      },
      getProjectBySlug: async () => {
        backendCalls.push("postgres:getBySlug")
        return { id: "postgres-project", slug: "postgres-project" } as never
      },
      createProject: async () => {
        backendCalls.push("postgres:create")
        return { status: "CREATED", project: { id: "postgres-project", slug: "postgres-project" } as never }
      },
    }
  })

  const listed = await projectRepo.listProjects()
  const byId = await projectRepo.getProjectById("postgres-project")
  const bySlug = await projectRepo.getProjectBySlug("postgres-project")
  const created = await projectRepo.createProject({ title: "Postgres Project", kind: "client-product", problem: "p", primaryGoal: "g" }, projectAuthority)

  assert.equal(getComponentryLabStorageMode(), "postgres")
  assert.equal(modeCalls.every((mode) => mode === "postgres"), true)
  assert.equal(listed.length, 1)
  assert.equal(byId?.id, "postgres-project")
  assert.equal(bySlug?.slug, "postgres-project")
  assert.equal(created.status, "CREATED")
  assert.equal(backendCalls.includes("postgres:list"), true)
  assert.equal(backendCalls.includes("postgres:getById"), true)
  assert.equal(backendCalls.includes("postgres:getBySlug"), true)
  assert.equal(backendCalls.includes("postgres:create"), true)
  assert.equal(backendCalls.some((entry) => entry.startsWith("local:")), false)
})

test("postgres mode routes canonical planning facade to the postgres backend", async () => {
  const modeCalls: string[] = []
  const backendCalls: string[] = []

  planningRepo.__setPlanningRepositoryBackendFactoryForTests((mode) => {
    modeCalls.push(mode)
    if (mode !== "postgres") {
      return {
        listPlansForProject: () => {
          backendCalls.push("local:list")
          return []
        },
        getPlan: () => {
          backendCalls.push("local:get")
          return undefined
        },
        savePlan: () => {
          backendCalls.push("local:save")
          return { status: "SAVED" }
        },
      }
    }

    return {
      listPlansForProject: async () => {
        backendCalls.push("postgres:list")
        return [{ planFingerprint: "plan-1", projectId: "postgres-project" } as ExternalCapabilityPlan]
      },
      getPlan: async () => {
        backendCalls.push("postgres:get")
        return { planFingerprint: "plan-1", projectId: "postgres-project" } as ExternalCapabilityPlan
      },
      savePlan: async () => {
        backendCalls.push("postgres:save")
        return { status: "SAVED", plan: { planFingerprint: "plan-1", projectId: "postgres-project" } as ExternalCapabilityPlan }
      },
    }
  })

  const listed = await planningRepo.listPlansForProject("postgres-project")
  const plan = await planningRepo.getPlan("plan-1")
  const saved = await planningRepo.savePlan({ planFingerprint: "plan-1", projectId: "postgres-project" } as ExternalCapabilityPlan)

  assert.equal(modeCalls.every((mode) => mode === "postgres"), true)
  assert.equal(listed.length, 1)
  assert.equal(plan?.planFingerprint, "plan-1")
  assert.equal(saved.status, "SAVED")
  assert.equal(backendCalls.includes("postgres:list"), true)
  assert.equal(backendCalls.includes("postgres:get"), true)
  assert.equal(backendCalls.includes("postgres:save"), true)
  assert.equal(backendCalls.some((entry) => entry.startsWith("local:")), false)
})

test("local-file mode preserves the existing local adapters", async () => {
  process.env.COMPONENTRY_LAB_STORAGE_MODE = "local-file"

  const modeCalls: string[] = []
  const backendCalls: string[] = []

  projectRepo.__setProjectRepositoryBackendFactoryForTests((mode) => {
    modeCalls.push(mode)
    return {
      listProjects: () => {
        backendCalls.push("local:list")
        return []
      },
      getProjectById: () => {
        backendCalls.push("local:getById")
        return undefined
      },
      getProjectBySlug: () => {
        backendCalls.push("local:getBySlug")
        return undefined
      },
      createProject: () => {
        backendCalls.push("local:create")
        return { status: "CREATED" }
      },
    }
  })

  await projectRepo.listProjects()
  await projectRepo.getProjectById("stated")
  await projectRepo.createProject({ title: "Local Project", kind: "client-product", problem: "p", primaryGoal: "g" }, projectAuthority)

  assert.equal(modeCalls.every((mode) => mode === "local-file"), true)
  assert.equal(backendCalls.includes("local:list"), true)
  assert.equal(backendCalls.includes("local:getById"), true)
  assert.equal(backendCalls.includes("local:create"), true)
})

test("production storage mode remains fail-closed when missing or invalid", () => {
  const env = process.env as Record<string, string | undefined>
  const previousNodeEnv = env.NODE_ENV
  delete env.COMPONENTRY_LAB_STORAGE_MODE
  env.NODE_ENV = "production"

  assert.throws(() => getComponentryLabStorageMode(), /must be set to 'postgres'/)

  if (previousNodeEnv === undefined) {
    delete env.NODE_ENV
  } else {
    env.NODE_ENV = previousNodeEnv
  }
})
