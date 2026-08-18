export function decodeCanonicalJsonbPayload<T>(payload: unknown): T | undefined {
  const parsed = typeof payload === "string" ? parseLegacyJsonbString(payload) : payload
  if (!isPlainObject(parsed)) return undefined
  return parsed as T
}

function parseLegacyJsonbString(payload: string): unknown {
  try {
    return JSON.parse(payload)
  } catch {
    return undefined
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
