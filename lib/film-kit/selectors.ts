import { getProjectById } from "../projects"
import { FILM_PROJECT_IDS } from "./schema"
import { buildFilmProject } from "./presets"
import type { FilmProject } from "./types"

export function getFilmProjects(): FilmProject[] {
  return FILM_PROJECT_IDS.map((id) => buildFilmProject(id))
}

export function getFilmProjectById(id: string): FilmProject | undefined {
  if (!FILM_PROJECT_IDS.includes(id as (typeof FILM_PROJECT_IDS)[number])) return undefined
  return buildFilmProject(id as (typeof FILM_PROJECT_IDS)[number])
}

export function getFilmProjectSource(id: string): FilmProject | undefined {
  const project = getProjectById(id)
  if (!project) return undefined
  const filmId = FILM_PROJECT_IDS.find((candidate) => candidate === project.id)
  if (!filmId) return undefined
  return buildFilmProject(filmId)
}

export function getFilmProjectIndex(): Array<{ id: string; title: string; slug: string; purpose: string }> {
  return getFilmProjects().map((film) => ({
    id: film.id,
    title: film.title,
    slug: film.brief.slug,
    purpose: film.brief.purpose,
  }))
}