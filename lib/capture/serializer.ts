// ─────────────────────────────────────────────────────────────
// Demo & Capture Bridge — Deterministic Serializer
// ─────────────────────────────────────────────────────────────

import type {
  CaptureSnapshot,
  CaptureViewport,
  CaptureChromeMode,
  CaptureSafeArea,
  CaptureManifest,
} from "./types"

/**
 * Maps properties of the snapshot to URL query parameter abbreviations.
 */
const PARAM_MAP = {
  sceneId: "scene",
  stateId: "state",
  currentTime: "t",
  frame: "f",
  viewport: "vp",
  chromeMode: "cm",
  safeArea: "sa",
  inspectorVisible: "inspect",
  notesVisible: "notes",
  cleanView: "clean",
}


/**
 * Sanitizes and validates individual parameter values.
 */
export function sanitizeCaptureParams(params: Record<string, string>): Partial<CaptureSnapshot> {
  const result: Partial<CaptureSnapshot> = {}

  if (params.scene) result.sceneId = params.scene
  if (params.state) result.stateId = params.state

  if (params.t) {
    const t = parseFloat(params.t)
    if (!isNaN(t) && t >= 0) result.currentTime = Math.min(Math.max(t, 0), 1000)
  }

  if (params.f) {
    const f = parseInt(params.f, 10)
    if (!isNaN(f) && f >= 0) result.frame = Math.min(Math.max(f, 0), 30000)
  }

  if (params.vp) {
    const validViewports: CaptureViewport[] = ["desktop", "laptop", "tablet", "mobile", "broadcast", "portrait", "custom"]
    if (validViewports.includes(params.vp as CaptureViewport)) {
      result.viewport = params.vp as CaptureViewport
    }
  }

  if (params.cm) {
    const validChromeModes: CaptureChromeMode[] = ["full", "minimal", "hidden"]
    if (validChromeModes.includes(params.cm as CaptureChromeMode)) {
      result.chromeMode = params.cm as CaptureChromeMode
    }
  }

  if (params.sa) {
    const validSafeAreas: CaptureSafeArea[] = ["off", "interface", "presentation", "broadcast", "cinematic"]
    if (validSafeAreas.includes(params.sa as CaptureSafeArea)) {
      result.safeArea = params.sa as CaptureSafeArea
    }
  }

  if (params.inspect) result.inspectorVisible = params.inspect === "1"
  if (params.notes) result.notesVisible = params.notes === "1"
  if (params.clean) result.cleanView = params.clean === "1"

  return result
}

/**
 * Serializes a capture snapshot into a query string.
 */
export function serializeCaptureState(snapshot: CaptureSnapshot): string {
  const params = new URLSearchParams()

  if (snapshot.sceneId) params.set(PARAM_MAP.sceneId, snapshot.sceneId)
  if (snapshot.stateId) params.set(PARAM_MAP.stateId, snapshot.stateId)
  if (snapshot.currentTime !== undefined) params.set(PARAM_MAP.currentTime, snapshot.currentTime.toFixed(2))
  if (snapshot.frame !== undefined) params.set(PARAM_MAP.frame, String(snapshot.frame))
  if (snapshot.viewport) params.set(PARAM_MAP.viewport, snapshot.viewport)
  if (snapshot.chromeMode) params.set(PARAM_MAP.chromeMode, snapshot.chromeMode)
  if (snapshot.safeArea) params.set(PARAM_MAP.safeArea, snapshot.safeArea)
  if (snapshot.inspectorVisible !== undefined) params.set(PARAM_MAP.inspectorVisible, snapshot.inspectorVisible ? "1" : "0")
  if (snapshot.notesVisible !== undefined) params.set(PARAM_MAP.notesVisible, snapshot.notesVisible ? "1" : "0")
  if (snapshot.cleanView !== undefined) params.set(PARAM_MAP.cleanView, snapshot.cleanView ? "1" : "0")

  return params.toString()
}

/**
 * Deserializes a query string into a partial capture snapshot.
 */
export function deserializeCaptureState(queryString: string): Partial<CaptureSnapshot> {
  const params = new URLSearchParams(queryString)
  const rawParams: Record<string, string> = {}

  params.forEach((value, key) => {
    rawParams[key] = value
  })

  // Map from query param key to mapped snapshot key
  const normalizedParams: Record<string, string> = {}
  Object.entries(PARAM_MAP).forEach(([, urlKey]) => {
    if (rawParams[urlKey] !== undefined) {
      normalizedParams[urlKey] = rawParams[urlKey]
    }
  })

  return sanitizeCaptureParams(normalizedParams)
}

/**
 * Builds a full restore URL using the capture state.
 */
export function buildCaptureUrl(baseUrl: string, snapshot: CaptureSnapshot): string {
  const query = serializeCaptureState(snapshot)
  const base = baseUrl.split("?")[0]
  return query ? `${base}?${query}` : base
}

/**
 * Parses a restore URL to extract the capture state parameters.
 */
export function parseCaptureUrl(urlStr: string): Partial<CaptureSnapshot> {
  try {
    const url = new URL(urlStr, "http://localhost")
    return deserializeCaptureState(url.search)
  } catch {
    return {}
  }
}

/**
 * Creates a fully validated capture snapshot object with fallbacks.
 */
export function createCaptureSnapshot(
  state: Partial<CaptureSnapshot> & { sceneId: string; stateId: string }
): CaptureSnapshot {
  return {
    sceneId: state.sceneId,
    stateId: state.stateId,
    currentTime: state.currentTime ?? 0,
    frame: state.frame ?? 0,
    viewport: state.viewport ?? "desktop",
    chromeMode: state.chromeMode ?? "full",
    safeArea: state.safeArea ?? "off",
    inspectorVisible: state.inspectorVisible ?? true,
    notesVisible: state.notesVisible ?? true,
    cleanView: state.cleanView ?? false,
  }
}

/**
 * Validates the schema of a Capture Manifest.
 */
export function validateCaptureManifest(manifest: unknown): manifest is CaptureManifest {
  if (!manifest || typeof manifest !== "object") return false
  const m = manifest as Record<string, unknown>
  if (m.version !== "1.0") return false
  
  const scene = m.scene as Record<string, unknown>
  if (!scene || typeof scene !== "object") return false
  if (typeof scene.id !== "string" || !scene.id) return false
  if (typeof scene.label !== "string" || !scene.label) return false
  if (!Array.isArray(scene.steps) || !Array.isArray(scene.states)) return false
  if (typeof scene.signatureStateId !== "string" || !scene.signatureStateId) return false
  if (typeof scene.fallbackStateId !== "string" || !scene.fallbackStateId) return false

  return true
}
