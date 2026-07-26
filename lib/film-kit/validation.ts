import type { FilmIntegrityReport, FilmProject } from "./types"

export function validateFilmProject(project: FilmProject): FilmIntegrityReport {
  const errors: string[] = []
  const warnings: string[] = []
  const sceneIds = new Set(project.scenes.map((scene) => scene.id))
  const shotIds = new Set(project.shots.map((shot) => shot.id))

  if (sceneIds.size !== project.scenes.length) errors.push("Scene IDs must be unique.")
  if (shotIds.size !== project.shots.length) errors.push("Shot IDs must be unique.")
  if (!project.brief.primaryProof) errors.push("Primary proof is required.")
  if (!project.brief.heroDemoMoment) warnings.push("Hero Demo Moment is missing.")

  return { valid: errors.length === 0, errors, warnings }
}

export function assertFilmProjectIntegrity(project: FilmProject): void {
  const report = validateFilmProject(project)
  if (!report.valid) {
    throw new Error(`[Film Kit Integrity] Project '${project.title}' is invalid: ${report.errors.join("; ")}`)
  }
}

export function buildFilmQaReport(project: FilmProject) {
  return project.qaReport
}