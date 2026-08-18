export type SiteNavigationGroup = "CORE" | "WORKSPACE" | "LAB"

export interface SiteNavigationItem {
  id: string
  label: string
  href: string
  group: SiteNavigationGroup
  subGroup?: string
}

export const SITE_NAVIGATION: SiteNavigationItem[] = [
  { id: "command", label: "Command", href: "/", group: "CORE" },
  { id: "library", label: "Library", href: "/library", group: "CORE" },
  { id: "playbooks", label: "Playbooks", href: "/playbooks", group: "CORE" },
  { id: "projects", label: "Projects", href: "/projects", group: "CORE" },
  { id: "film-kit", label: "Film Kit", href: "/film-kit", group: "CORE" },

  { id: "youtube", label: "YouTube", href: "/youtube", group: "WORKSPACE" },

  { id: "spotlight-lab", label: "Spotlight Lab", href: "/spotlight", group: "LAB", subGroup: "Interaction labs" },
  { id: "split-flap-lab", label: "Split Flap Lab", href: "/split-flap", group: "LAB", subGroup: "Interaction labs" },
  { id: "scrub-input-lab", label: "Scrub Input Lab", href: "/scrub-input", group: "LAB", subGroup: "Interaction labs" },
  { id: "kinetic-text-lab", label: "Kinetic Text Lab", href: "/kinetic-text", group: "LAB", subGroup: "Interaction labs" },
  { id: "layouts", label: "Layouts", href: "/layouts", group: "LAB", subGroup: "Interaction labs" },
  { id: "scroll-choreography-lab", label: "Scroll Choreography Lab", href: "/scroll-choreography", group: "LAB", subGroup: "Interaction labs" },
  { id: "webgl-liquid-lab", label: "WebGL Liquid Lab", href: "/webgl-liquid", group: "LAB", subGroup: "Interaction labs" },
  { id: "image-ripple-lab", label: "Image Ripple Lab", href: "/image-ripple", group: "LAB", subGroup: "Interaction labs" },

  { id: "typography", label: "Typography", href: "/typography", group: "LAB", subGroup: "System labs" },
  { id: "foundations", label: "Foundations", href: "/foundations", group: "LAB", subGroup: "System labs" },
  { id: "interaction-player", label: "Interaction Player", href: "/player", group: "LAB", subGroup: "System labs" },
  { id: "decision-systems", label: "Decision Systems", href: "/decisions", group: "LAB", subGroup: "System labs" },
  { id: "creative-director", label: "Creative Director", href: "/director", group: "LAB", subGroup: "System labs" },
  { id: "capture-systems", label: "Capture Systems", href: "/capture", group: "LAB", subGroup: "System labs" },
  { id: "composition-recipes", label: "Composition Recipes", href: "/recipes", group: "LAB", subGroup: "System labs" },
]

export function getActiveNavigationItem(pathname: string): SiteNavigationItem | null {
  const exactMatch = SITE_NAVIGATION.find((item) => item.href === pathname)
  if (exactMatch) return exactMatch

  const possibleMatches = SITE_NAVIGATION.filter(
    (item) => item.href !== "/" && pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)

  if (possibleMatches.length > 0) {
    return possibleMatches[0]
  }

  if (pathname === "/") {
    return SITE_NAVIGATION.find((item) => item.href === "/") || null
  }

  return null
}

export function getSurfaceContext(pathname: string): { brand: string; title: string | null } {
  const activeItem = getActiveNavigationItem(pathname)
  return {
    brand: "Componentry Lab",
    title: activeItem ? activeItem.label : null,
  }
}
