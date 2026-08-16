import crypto from "crypto"
import type { ResourceDiscoveryCandidateInput } from "@/lib/creative-os/discovery"
import type {
  OriginkitCatalogEntry,
  OriginkitCatalogSnapshot,
  OriginkitCatalogSnapshotInput,
  OriginkitCatalogValidationResult
} from "./catalog-types"

const LOWER_HEX_SHA40 = /^[a-f0-9]{40}$/
const SECRET_LIKE_PATTERN = /cmp_live_[a-z0-9]+/i

export const ORIGINKIT_CATALOG_SCHEMA_VERSION = 1
export const ORIGINKIT_CONNECTOR_IDENTITY = "vellum-ai/originkit"
export const ORIGINKIT_CONNECTOR_REPOSITORY = "vellum-ai/originkit"
export const ORIGINKIT_CONNECTOR_REVISION = "9aa260c2561ad9e765832dc342e9bbb5138858a4"
export const ORIGINKIT_CONNECTOR_LICENSE = "MIT"
export const ORIGINKIT_CATALOG_SOURCE_KIND = "PINNED_EXTERNAL_CONNECTOR_CATALOG"

function compareCanonicalStrings(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}


function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function assertAllowedKeys(value: Record<string, unknown>, allowed: string[]): string[] {
  return Object.keys(value).filter((key) => !allowed.includes(key))
}

function trimText(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeStringArray(value: unknown): { valid: boolean; value: string[]; errors: string[] } {
  if (!Array.isArray(value)) {
    return { valid: false, value: [], errors: ["array expected"] }
  }
  const normalized = value.map((item) => trimText(item)).filter((item): item is string => Boolean(item))
  return {
    valid: normalized.length === value.length,
    value: Array.from(new Set(normalized)).sort(compareCanonicalStrings),
    errors: normalized.length === value.length ? [] : ["empty or non-string array member"]
  }
}

function normalizeEntry(entry: OriginkitCatalogEntry): OriginkitCatalogEntry {
  return {
    name: entry.name.trim(),
    displayName: entry.displayName.trim(),
    category: entry.category.trim(),
    description: entry.description.trim(),
    tags: Array.from(new Set(entry.tags.map((item) => item.trim()).filter(Boolean))).sort(compareCanonicalStrings),
    variants: Array.from(new Set(entry.variants.map((item) => item.trim()).filter(Boolean))).sort(compareCanonicalStrings),
    dependencies: Array.from(new Set(entry.dependencies.map((item) => item.trim()).filter(Boolean))).sort(compareCanonicalStrings)
  }
}

function validateEntryShape(entry: unknown): { valid: boolean; errors: string[]; entry?: OriginkitCatalogEntry } {
  if (!isPlainObject(entry)) return { valid: false, errors: ["entry must be an object"] }
  const allowed = ["name", "displayName", "category", "description", "tags", "variants", "dependencies"]
  const unknownKeys = assertAllowedKeys(entry, allowed)
  const errors: string[] = []
  if (unknownKeys.length > 0) errors.push(`unexpected entry fields: ${unknownKeys.join(",")}`)

  const name = trimText(entry.name)
  const displayName = trimText(entry.displayName)
  const category = trimText(entry.category)
  const description = trimText(entry.description)
  if (!name) errors.push("name required")
  if (!displayName) errors.push("displayName required")
  if (!category) errors.push("category required")
  if (!description) errors.push("description required")

  const tags = normalizeStringArray(entry.tags)
  const variants = normalizeStringArray(entry.variants)
  const dependencies = normalizeStringArray(entry.dependencies)
  if (!tags.valid) errors.push(...tags.errors.map((error) => `tags ${error}`))
  if (!variants.valid) errors.push(...variants.errors.map((error) => `variants ${error}`))
  if (!dependencies.valid) errors.push(...dependencies.errors.map((error) => `dependencies ${error}`))

  if (errors.length > 0 || !name || !displayName || !category || !description) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    entry: {
      name,
      displayName,
      category,
      description,
      tags: tags.value,
      variants: variants.value,
      dependencies: dependencies.value
    }
  }
}

function validateMetadataSafety(entry: OriginkitCatalogEntry): string[] {
  const payload = [entry.name, entry.displayName, entry.category, entry.description, ...entry.tags, ...entry.variants, ...entry.dependencies]
  return payload.some((value) => SECRET_LIKE_PATTERN.test(value)) ? ["secret-like Originkit key material rejected"] : []
}

function canonicalizeSnapshot(snapshot: OriginkitCatalogSnapshotInput): OriginkitCatalogSnapshotInput {
  const normalizedEntries = snapshot.catalogEntries.map(normalizeEntry).sort((a, b) => {
    const nameCompare = compareCanonicalStrings(a.name, b.name)
    if (nameCompare !== 0) return nameCompare
    const displayCompare = compareCanonicalStrings(a.displayName, b.displayName)
    if (displayCompare !== 0) return displayCompare
    return compareCanonicalStrings(JSON.stringify(a), JSON.stringify(b))
  })
  return {
    schemaVersion: snapshot.schemaVersion,
    connectorIdentity: snapshot.connectorIdentity.trim(),
    connectorRepository: snapshot.connectorRepository.trim(),
    connectorRevision: snapshot.connectorRevision.trim(),
    connectorLicense: snapshot.connectorLicense.trim(),
    catalogSourceKind: snapshot.catalogSourceKind.trim(),
    catalogEntries: normalizedEntries
  }
}

export function validateOriginkitCatalogSnapshot(snapshot: OriginkitCatalogSnapshotInput): OriginkitCatalogValidationResult {
  const errors: string[] = []
  if (!isPlainObject(snapshot)) {
    return { valid: false, errors: ["snapshot must be an object"] }
  }

  const allowed = ["schemaVersion", "connectorIdentity", "connectorRepository", "connectorRevision", "connectorLicense", "catalogSourceKind", "catalogEntries"]
  const unknownKeys = assertAllowedKeys(snapshot, allowed)
  if (unknownKeys.length > 0) errors.push(`unexpected top-level fields: ${unknownKeys.join(",")}`)

  if (snapshot.schemaVersion !== ORIGINKIT_CATALOG_SCHEMA_VERSION) errors.push("schemaVersion mismatch")
  if (trimText(snapshot.connectorIdentity) !== ORIGINKIT_CONNECTOR_IDENTITY) errors.push("connectorIdentity mismatch")
  if (trimText(snapshot.connectorRepository) !== ORIGINKIT_CONNECTOR_REPOSITORY) errors.push("connectorRepository mismatch")
  if (!trimText(snapshot.connectorRevision)) errors.push("missing connector revision")
  if (!LOWER_HEX_SHA40.test(trimText(snapshot.connectorRevision) || "")) errors.push("connectorRevision must be lowercase 40-char git sha")
  if (trimText(snapshot.connectorRevision) !== ORIGINKIT_CONNECTOR_REVISION) errors.push("connectorRevision mismatch")
  if (trimText(snapshot.connectorLicense) !== ORIGINKIT_CONNECTOR_LICENSE) errors.push("connectorLicense mismatch")
  if (trimText(snapshot.catalogSourceKind) !== ORIGINKIT_CATALOG_SOURCE_KIND) errors.push("catalogSourceKind mismatch")

  if (!Array.isArray(snapshot.catalogEntries) || snapshot.catalogEntries.length === 0) {
    errors.push("missing or empty catalog")
    return { valid: false, errors }
  }

  const seen = new Map<string, string>()
  for (const rawEntry of snapshot.catalogEntries) {
    const result = validateEntryShape(rawEntry)
    if (!result.valid || !result.entry) {
      errors.push(...result.errors)
      continue
    }
    errors.push(...validateMetadataSafety(result.entry))

    const key = result.entry.name
    const serialized = JSON.stringify(result.entry)
    const prior = seen.get(key)
    if (prior && prior !== serialized) {
      errors.push(`duplicate normalized component name with conflicting metadata: ${key}`)
    }
    seen.set(key, serialized)
  }

  return { valid: errors.length === 0, errors }
}

export function normalizeOriginkitCatalogSnapshot(snapshot: OriginkitCatalogSnapshotInput): OriginkitCatalogSnapshot {
  const normalized = canonicalizeSnapshot(snapshot)
  const entriesByName = new Map<string, OriginkitCatalogEntry>()
  for (const entry of normalized.catalogEntries) {
    const existing = entriesByName.get(entry.name)
    if (existing && JSON.stringify(existing) !== JSON.stringify(entry)) {
      throw new Error(`duplicate normalized component name with conflicting metadata: ${entry.name}`)
    }
    entriesByName.set(entry.name, entry)
  }
  const catalogEntries = Array.from(entriesByName.values()).sort((a, b) => {
    const nameCompare = compareCanonicalStrings(a.name, b.name)
    if (nameCompare !== 0) return nameCompare
    return compareCanonicalStrings(JSON.stringify(a), JSON.stringify(b))
  })
  const canonical: OriginkitCatalogSnapshotInput = { ...normalized, catalogEntries }
  return {
    ...canonical,
    catalogFingerprint: fingerprintOriginkitCatalogSnapshot(canonical)
  }
}

export function fingerprintOriginkitCatalogSnapshot(snapshot: OriginkitCatalogSnapshotInput): string {
  const normalized = canonicalizeSnapshot(snapshot)
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex")
}

export function mapOriginkitCatalogEntryToDiscoveryCandidateInput(
  snapshot: OriginkitCatalogSnapshot,
  entry: OriginkitCatalogEntry
): ResourceDiscoveryCandidateInput {
  const encodedEntry = encodeURIComponent(entry.name)
  return {
    name: entry.name,
    sourceKind: "GITHUB_REPOSITORY",
    sourceLocator: `https://github.com/vellum-ai/originkit/blob/${snapshot.connectorRevision}/src/component-index.json#${encodedEntry}`,
    sourceIdentity: `${snapshot.connectorIdentity}@${snapshot.connectorRevision}:${entry.name}`,
    provenanceClaim: `connector:${snapshot.connectorRepository}@${snapshot.connectorRevision}`,
    evidence: [
      {
        evidenceKind: "SOURCE_OBSERVATION",
        locator: `https://github.com/vellum-ai/originkit/blob/${snapshot.connectorRevision}/src/component-index.json`,
        observedIdentity: snapshot.connectorIdentity
      }
    ]
  }
}
