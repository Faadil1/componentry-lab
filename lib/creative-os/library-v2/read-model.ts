import { RESOURCE_REGISTRY } from "../registry"
import type { ResourceMetadata } from "../types"
import {
  EXTERNAL_FINDING_ENTITIES,
  RECONCILED_LEGACY_PLACEHOLDER_IDS,
  reconcileHistoricalExternalEntity
} from "./external-findings"
import { validateLibraryV2Projection } from "./validation"
import type {
  LibraryEntityKind,
  LibraryV2Entity,
  MethodDomain,
  MethodEntity,
  ProjectionWarning
} from "./types"

export interface LibraryV2ReadModel {
  readonly valid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly ProjectionWarning[]
  readonly entities: readonly LibraryV2Entity[]
  readonly countsByKind: Readonly<Record<LibraryEntityKind, number>>
  readonly methodCountsByDomain: Readonly<Record<MethodDomain, number>>
}

const LIBRARY_ENTITY_KINDS: readonly LibraryEntityKind[] = [
  "SOURCE",
  "RESOURCE",
  "REFERENCE",
  "METHOD",
  "PROVIDER"
]

const METHOD_DOMAINS: readonly MethodDomain[] = [
  "STRATEGY",
  "PERCEPTUAL",
  "CREATIVE_TRANSFORMATION",
  "CONCEPTUAL",
  "PRODUCTION",
  "ORCHESTRATION"
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function cloneDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeep(item)) as T
  }

  if (isRecord(value)) {
    const output: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      output[key] = cloneDeep(item)
    }
    return output as T
  }

  return value
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item)
    }
    return Object.freeze(value)
  }

  if (isRecord(value)) {
    for (const item of Object.values(value)) {
      deepFreeze(item)
    }
    return Object.freeze(value)
  }

  return value
}

function createZeroCountsByKind(): Record<LibraryEntityKind, number> {
  return {
    SOURCE: 0,
    RESOURCE: 0,
    REFERENCE: 0,
    METHOD: 0,
    PROVIDER: 0
  }
}

function createZeroMethodCountsByDomain(): Record<MethodDomain, number> {
  return {
    STRATEGY: 0,
    PERCEPTUAL: 0,
    CREATIVE_TRANSFORMATION: 0,
    CONCEPTUAL: 0,
    PRODUCTION: 0,
    ORCHESTRATION: 0
  }
}

function buildCountMaps(entities: readonly LibraryV2Entity[]): {
  countsByKind: Readonly<Record<LibraryEntityKind, number>>
  methodCountsByDomain: Readonly<Record<MethodDomain, number>>
} {
  const countsByKind = createZeroCountsByKind()
  const methodCountsByDomain = createZeroMethodCountsByDomain()

  for (const entity of entities) {
    countsByKind[entity.entityKind] += 1
    if (entity.entityKind === "METHOD") {
      methodCountsByDomain[entity.methodDomain] += 1
    }
  }

  return {
    countsByKind: deepFreeze(countsByKind),
    methodCountsByDomain: deepFreeze(methodCountsByDomain)
  }
}

function listValidatedEntities(
  valid: boolean,
  projections: readonly { primary: LibraryV2Entity }[]
): readonly LibraryV2Entity[] {
  if (!valid) return deepFreeze([] as LibraryV2Entity[])
  return deepFreeze(projections.map((projection) => projection.primary))
}

export function buildLibraryV2ReadModel(
  resources: readonly ResourceMetadata[] = RESOURCE_REGISTRY
): LibraryV2ReadModel {
  const validation = validateLibraryV2Projection(resources)

  if (!validation.valid) {
    return deepFreeze({
      valid: false,
      errors: deepFreeze([...validation.errors]),
      warnings: deepFreeze([...validation.warnings]),
      entities: deepFreeze([] as LibraryV2Entity[]),
      countsByKind: deepFreeze(createZeroCountsByKind()),
      methodCountsByDomain: deepFreeze(createZeroMethodCountsByDomain())
    })
  }

  const entities = listValidatedEntities(validation.valid, validation.projections)
  const { countsByKind, methodCountsByDomain } = buildCountMaps(entities)

  return deepFreeze({
    valid: true,
    errors: deepFreeze([...validation.errors]),
    warnings: deepFreeze([...validation.warnings]),
    entities,
    countsByKind,
    methodCountsByDomain
  })
}

function duplicateIds(entities: readonly LibraryV2Entity[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const entity of entities) {
    if (seen.has(entity.id)) duplicates.add(entity.id)
    seen.add(entity.id)
  }

  return [...duplicates].sort((a, b) => a.localeCompare(b))
}

export function buildLiveLibraryV2ReadModel(
  resources: readonly ResourceMetadata[] = RESOURCE_REGISTRY
): LibraryV2ReadModel {
  const base = buildLibraryV2ReadModel(resources)
  if (!base.valid) return base

  const reconciledLegacy = base.entities.map((entity) => reconcileHistoricalExternalEntity(cloneDeep(entity)))
  const externalFindings = EXTERNAL_FINDING_ENTITIES.map((entity) => cloneDeep(entity))
  const combined = [...reconciledLegacy, ...externalFindings]
  const duplicates = duplicateIds(combined)

  if (duplicates.length > 0) {
    return deepFreeze({
      valid: false,
      errors: deepFreeze(duplicates.map((id) => `duplicate live Library V2 entity id detected: ${id}`)),
      warnings: deepFreeze([] as ProjectionWarning[]),
      entities: deepFreeze([] as LibraryV2Entity[]),
      countsByKind: deepFreeze(createZeroCountsByKind()),
      methodCountsByDomain: deepFreeze(createZeroMethodCountsByDomain())
    })
  }

  const warnings = base.warnings.filter(
    (warning) =>
      !(
        warning.code === "LEGACY_PLACEHOLDER_SOURCE" &&
        RECONCILED_LEGACY_PLACEHOLDER_IDS.has(warning.resourceId)
      )
  )
  const { countsByKind, methodCountsByDomain } = buildCountMaps(combined)

  return deepFreeze({
    valid: true,
    errors: deepFreeze([...base.errors]),
    warnings: deepFreeze([...warnings]),
    entities: deepFreeze(combined),
    countsByKind,
    methodCountsByDomain
  })
}

export function getLibraryV2EntityById(
  model: LibraryV2ReadModel,
  id: string
): LibraryV2Entity | null {
  return model.entities.find((entity) => entity.id === id) ?? null
}

export function listLibraryV2EntitiesByKind(
  model: LibraryV2ReadModel,
  kind: LibraryEntityKind
): readonly LibraryV2Entity[] {
  return deepFreeze(model.entities.filter((entity) => entity.entityKind === kind))
}

export function listLibraryV2MethodsByDomain(
  model: LibraryV2ReadModel,
  domain: MethodDomain
): readonly MethodEntity[] {
  return deepFreeze(
    model.entities.filter(
      (entity): entity is MethodEntity => entity.entityKind === "METHOD" && entity.methodDomain === domain
    )
  )
}

export const LIBRARY_V2_ENTITY_KINDS = LIBRARY_ENTITY_KINDS
export const LIBRARY_V2_METHOD_DOMAINS = METHOD_DOMAINS
