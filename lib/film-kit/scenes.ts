import type { FilmPurpose, FilmScene } from "./types"

export function makeScene(params: FilmScene): FilmScene {
  return params
}

export function scenesByPurpose(purpose: FilmPurpose): string {
  switch (purpose) {
    case "technical-proof":
      return "claim-first proof sequencing"
    case "client-case-study":
      return "transformation narrative with operational beats"
    case "editorial-explainer":
      return "problem-to-reveal editorial comparison structure"
  }
}