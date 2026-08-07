import type { FilmKitCapabilityType } from "./types"
import type { CreativeProjectMode } from "../../director/types"

interface CapabilityDecompositionInput {
  capabilityGap?: string
  artifactType?: string
  projectMode?: CreativeProjectMode
  metadata?: Record<string, unknown>
}

/**
 * Decomposes high-level project production needs / capability gaps / artifact requests
 * into specific Film Kit capabilities.
 */
export function decomposeFilmKitCapabilities(input: CapabilityDecompositionInput): FilmKitCapabilityType[] {
  const { capabilityGap, artifactType } = input
  const capabilities: Set<FilmKitCapabilityType> = new Set()

  const gap = capabilityGap?.toLowerCase() || ""
  const artifact = artifactType?.toLowerCase() || ""

  // 1. Motion Composition / UI Capture
  if (gap.includes("remocn") || gap.includes("web-component-animation") || artifact.includes("web-component-animation") || artifact.includes("legacy-frame")) {
    capabilities.add("MOTION_COMPOSITION")
    capabilities.add("UI_CAPTURE")
  }

  // 2. Camera Language / Shot Planning
  if (gap.includes("camera") || gap.includes("shot") || artifact.includes("camera") || artifact.includes("shotlist")) {
    capabilities.add("CAMERA_LANGUAGE")
    capabilities.add("SHOT_PLANNING")
  }

  // 3. Product Film / Assembly
  if (gap.includes("cinematic-product-demo") || gap.includes("video-editing") || artifact.includes("product-demo-film") || artifact.includes("rough-cut-video")) {
    capabilities.add("PRODUCT_FILM")
    capabilities.add("ASSEMBLY")
  }

  // 4. B-Roll
  if (gap.includes("b-roll") || artifact.includes("broll") || artifact.includes("collage-broll-video")) {
    capabilities.add("B_ROLL")
  }

  // 5. Cinematic Prompting
  if (gap.includes("prompting") || gap.includes("cineprompt") || artifact.includes("prompt")) {
    capabilities.add("CINEMATIC_PROMPTING")
  }

  // 6. Sound Design
  if (gap.includes("sound") || gap.includes("audio") || artifact.includes("soundtrack")) {
    capabilities.add("SOUND_DESIGN")
  }

  // Fallback: If no explicit match, infer default capabilities based on artifact or gap presence
  if (capabilities.size === 0) {
    if (artifact.includes("video") || artifact.includes("film")) {
      capabilities.add("PRODUCT_FILM")
    } else if (gap) {
      capabilities.add("SHOT_PLANNING")
    } else {
      capabilities.add("ASSEMBLY")
    }
  }

  return Array.from(capabilities)
}
