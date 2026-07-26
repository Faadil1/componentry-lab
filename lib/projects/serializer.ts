import type { ProjectSnapshot, ProjectPhase } from "./types"
import { PROJECT_PHASES } from "./schema"

export function sanitizeProjectParams(snapshot: Partial<ProjectSnapshot>): Partial<ProjectSnapshot> {
  const clean: Partial<ProjectSnapshot> = {}

  if (snapshot.activeProjectId) {
    clean.activeProjectId = String(snapshot.activeProjectId).replace(/[^\w-]/g, "")
  }
  if (snapshot.activeSection) {
    clean.activeSection = String(snapshot.activeSection).replace(/[^\w-]/g, "")
  }
  if (snapshot.activePhase) {
    const phase = String(snapshot.activePhase).replace(/[^\w-]/g, "")
    if (PROJECT_PHASES.includes(phase as ProjectPhase)) {
      clean.activePhase = phase as ProjectPhase
    }
  }
  if (snapshot.activeItemId) {
    clean.activeItemId = String(snapshot.activeItemId).replace(/[^\w-]/g, "")
  }

  clean.inspectorVisible = !!snapshot.inspectorVisible
  clean.recommendationsVisible = !!snapshot.recommendationsVisible
  clean.auditVisible = !!snapshot.auditVisible

  if (snapshot.selectedRecommendationId) {
    clean.selectedRecommendationId = String(snapshot.selectedRecommendationId).replace(/[^\w-]/g, "")
  }

  return clean
}

export function parseProjectUrl(queryString: string): Partial<ProjectSnapshot> {
  if (!queryString) return {}

  const params = new URLSearchParams(queryString)
  const snapshot: Partial<ProjectSnapshot> = {}

  const p = params.get("project")
  const s = params.get("section")
  const ph = params.get("phase")
  const item = params.get("item")
  const ins = params.get("inspector")
  const rec = params.get("recommendations")
  const aud = params.get("audit")
  const recSel = params.get("rec_select")

  if (p) snapshot.activeProjectId = p
  if (s) snapshot.activeSection = s
  if (ph && PROJECT_PHASES.includes(ph as ProjectPhase)) snapshot.activePhase = ph as ProjectPhase
  if (item) snapshot.activeItemId = item
  if (ins) snapshot.inspectorVisible = ins === "true"
  if (rec) snapshot.recommendationsVisible = rec === "true"
  if (aud) snapshot.auditVisible = aud === "true"
  if (recSel) snapshot.selectedRecommendationId = recSel

  return sanitizeProjectParams(snapshot)
}

export function buildProjectUrl(pathname: string, snapshot: ProjectSnapshot): string {
  const params = new URLSearchParams()

  if (snapshot.activeProjectId) params.set("project", snapshot.activeProjectId)
  if (snapshot.activeSection) params.set("section", snapshot.activeSection)
  if (snapshot.activePhase) params.set("phase", snapshot.activePhase)
  if (snapshot.activeItemId) params.set("item", snapshot.activeItemId)
  if (snapshot.inspectorVisible) params.set("inspector", "true")
  if (snapshot.recommendationsVisible) params.set("recommendations", "true")
  if (snapshot.auditVisible) params.set("audit", "true")
  if (snapshot.selectedRecommendationId) params.set("rec_select", snapshot.selectedRecommendationId)

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function serializeProjectSnapshot(snapshot: ProjectSnapshot): string {
  return btoa(JSON.stringify(sanitizeProjectParams(snapshot)))
}

export function deserializeProjectSnapshot(encoded: string): ProjectSnapshot | null {
  try {
    const raw = atob(encoded)
    const parsed = JSON.parse(raw)
    return sanitizeProjectParams(parsed) as ProjectSnapshot
  } catch {
    return null
  }
}
