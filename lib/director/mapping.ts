import type { ProjectKind } from "@/lib/projects"
import type { CreativeProjectMode } from "./types"

export function mapProjectKindToCreativeMode(kind: ProjectKind): CreativeProjectMode {
  switch (kind) {
    case "hackathon":
    case "internal-tool":
    case "product-prototype":
      return "HACKATHON"
    case "design-challenge":
    case "creative-experiment":
    case "website":
      return "DAY_CHALLENGE"
    case "demo-film":
    case "broadcast-interface":
    case "portfolio-case-study":
    case "client-product":
      return "MARA"
    case "data-story":
      return "DATA_STORY"
    default:
      return "DAY_CHALLENGE"
  }
}
