import { createHash } from "node:crypto"

import type { ProjectBrain } from "./types"

type CanonicalJson = null | boolean | number | string | CanonicalJson[] | { [key: string]: CanonicalJson }

function normalizeJson(value: CanonicalJson): CanonicalJson {
  if (Array.isArray(value)) return value.map((item) => normalizeJson(item))
  if (value === null || typeof value !== "object") return value

  const normalized: Record<string, CanonicalJson> = {}
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
    normalized[key] = normalizeJson(value[key])
  }
  return normalized
}

export function serializeCanonicalJson(value: unknown): string {
  const json = JSON.stringify(value)
  if (json === undefined) {
    throw new Error("Canonical fingerprint input must be JSON serializable")
  }
  const parsed = JSON.parse(json) as CanonicalJson
  return JSON.stringify(normalizeJson(parsed))
}

export function fingerprintCanonicalJson(value: unknown): string {
  return createHash("sha256").update(serializeCanonicalJson(value), "utf8").digest("hex")
}

export function fingerprintProjectBrain(project: ProjectBrain): string {
  return fingerprintCanonicalJson(project)
}
