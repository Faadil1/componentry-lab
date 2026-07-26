// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Reading Paths
// CLIENT-SAFE. No fs.
// ─────────────────────────────────────────────────────────────

import type { PlaybookReadingPath } from "./types"
import { playbookCatalog } from "./catalog"

// ── Helper: validate step IDs and sum estimated minutes ───────
function buildPath(
  def: Omit<PlaybookReadingPath, "estimatedMinutes">
): PlaybookReadingPath {
  const catalogIds = new Set(playbookCatalog.map((e) => e.id))
  let totalMinutes = 0
  for (const step of def.steps) {
    if (!catalogIds.has(step.playbookId)) {
      throw new Error(
        `[Reading Path "${def.id}"] Step references unknown playbook ID: "${step.playbookId}"`
      )
    }
    const entry = playbookCatalog.find((e) => e.id === step.playbookId)
    totalMinutes += entry?.estimatedReadMinutes ?? 1
  }
  return { ...def, estimatedMinutes: totalMinutes }
}

// ── Reading Path 1 ────────────────────────────────────────────
const path1 = buildPath({
  id: "win-first-five-seconds",
  label: "WIN THE FIRST FIVE SECONDS",
  description:
    "The seven methods that ensure a project is understood, remembered, and believed within the first five seconds of judge contact. Start here before any interface work.",
  audience: ["hackathon-builder", "judge-facing-team", "creative-director"],
  intendedOutcome: ["judge-clarity", "positioning", "hero-copy"],
  steps: [
    {
      playbookId: "system-principles",
      reason: "Foundation — establishes the four rules all other methods rest on.",
    },
    {
      playbookId: "judge-path",
      reason: "Maps the exact sequence a judge follows from problem to decision.",
    },
    {
      playbookId: "problem-tension-canvas",
      reason: "Defines the visible tension that gives the project clarity and urgency.",
    },
    {
      playbookId: "hook-library",
      reason: "Provides compression tools for translating complex projects into instant understanding.",
    },
    {
      playbookId: "judge-memory-sentence",
      reason: "Creates the one line the judge can recall and repeat after seeing the project.",
    },
    {
      playbookId: "proof-moment-pattern",
      reason: "Defines the visible interface moment where technical proof becomes undeniable.",
    },
    {
      playbookId: "hero-copy-system",
      reason: "Assembles the compressed project summary for landing, submission, and demo opener.",
    },
  ],
  relatedRegistryIds: ["decision-systems", "product-launch-recipe"],
  ecosystemTarget: "componentry",
})

// ── Reading Path 2 ────────────────────────────────────────────
const path2 = buildPath({
  id: "build-trustworthy-interface",
  label: "BUILD A TRUSTWORTHY INTERFACE",
  description:
    "The complete interface design curriculum from structure to polish. Covers blueprints, type, color, components, responsive, composition, research, anti-slop, and controlled risk.",
  audience: ["ui-designer", "product-designer", "hackathon-builder"],
  intendedOutcome: ["interface-architecture", "visual-direction", "responsive-design", "judge-clarity"],
  steps: [
    {
      playbookId: "landing-blueprint",
      reason: "Establishes the structural skeleton of the first-contact surface.",
    },
    {
      playbookId: "dashboard-blueprint",
      reason: "Maps the action-oriented interface layer where proof becomes visible.",
    },
    {
      playbookId: "typography-system",
      reason: "Defines font roles: hero font creates memory, evidence font creates trust.",
    },
    {
      playbookId: "color-system",
      reason: "Assigns jobs to every color — palette without roles is decoration.",
    },
    {
      playbookId: "component-rules",
      reason: "Governs button language, CTA clarity, and component vocabulary.",
    },
    {
      playbookId: "responsive-rules",
      reason: "Mobile is not squeezed desktop — requires dedicated design decisions.",
    },
    {
      playbookId: "composition-rules",
      reason: "Controls judge attention through whitespace, hierarchy, and visual flow.",
    },
    {
      playbookId: "reference-to-polished-ui",
      reason: "Shows how to extract signals from real polished products without copying.",
    },
    {
      playbookId: "anti-ai-slop-pass",
      reason: "Detects and corrects the generic AI outputs before they become the final direction.",
    },
    {
      playbookId: "controlled-visual-risk",
      reason: "Proposes bold, distinctive ideas without sacrificing clarity or proof visibility.",
    },
  ],
  relatedRegistryIds: ["typography", "foundations", "layouts"],
  ecosystemTarget: "componentry",
})

// ── Reading Path 3 ────────────────────────────────────────────
const path3 = buildPath({
  id: "make-proof-visible",
  label: "MAKE THE PROOF VISIBLE",
  description:
    "The evidence pipeline from evidence taxonomy through operating gates to final submission audit. Technical proof must become a visible, verifiable moment.",
  audience: ["hackathon-builder", "submission-lead", "developer", "judge-facing-team"],
  intendedOutcome: ["evidence", "technical-proof", "audit", "submission"],
  steps: [
    {
      playbookId: "evidence-cards",
      reason: "Defines the visual structure for displaying claim, status, output, and verification.",
    },
    {
      playbookId: "proof-moment-pattern",
      reason: "Establishes the core input → proof → verdict → receipt pattern.",
    },
    {
      playbookId: "hackathon-evidence",
      reason: "Provides the canonical evidence taxonomy and classification system.",
    },
    {
      playbookId: "hackathon-operating-gates",
      reason: "Defines the final video packaging gate with truth rules and exit criteria.",
    },
    {
      playbookId: "hackathon-audit",
      reason: "The final go/no-go decision gate — determines actual submission readiness.",
    },
    {
      playbookId: "hackathon-submission",
      reason: "Assembles all components into a complete, judge-aligned submission package.",
    },
  ],
  relatedRegistryIds: ["decision-systems", "evidence-ledger", "capture-bridge", "decision-gate"],
  ecosystemTarget: "componentry",
})

// ── Reading Path 4 ────────────────────────────────────────────
const path4 = buildPath({
  id: "design-demo-film",
  label: "DESIGN THE DEMO FILM",
  description:
    "The complete demo video production pipeline from script through visual production to video packaging. Marked as the foundational layer for the future Universal Demo Film Kit.",
  audience: ["demo-producer", "video-editor", "hackathon-builder", "creative-director"],
  intendedOutcome: ["demo-script", "video-production", "judge-clarity"],
  steps: [
    {
      playbookId: "demo-video-script",
      reason: "Defines the beat-by-beat timing structure for a credible 60-90 second demo video.",
    },
    {
      playbookId: "hackathon-visual-production",
      reason: "Covers the complete visual production pipeline for demo assets.",
    },
    {
      playbookId: "hackathon-demo",
      reason: "Transforms a working project into a judge-optimized demonstration.",
    },
    {
      playbookId: "hackathon-video-egaki",
      reason: "Defines the controlled, structured 60-120s judge-facing video format.",
    },
    {
      playbookId: "hackathon-video-brag",
      reason: "Creates the 20-30s social teaser for launch and portfolio use.",
    },
    {
      playbookId: "hackathon-ui-polish",
      reason: "Ensures the UI surface visible in the demo meets readability and distinction standards.",
    },
  ],
  relatedRegistryIds: [
    "interaction-player",
    "capture-bridge",
    "product-launch-recipe",
    "broadcast-package-recipe",
  ],
  ecosystemTarget: "universal-demo-film-kit",
  futureTarget: "universal-demo-film-kit",
})

// ── Reading Path 5 ────────────────────────────────────────────
const path5 = buildPath({
  id: "intake-to-submission",
  label: "FROM INTAKE TO SUBMISSION",
  description:
    "The complete hackathon lifecycle from first contact with a hackathon brief through retrospective. All 14 template stages in sequence.",
  audience: ["hackathon-builder", "founder", "submission-lead"],
  intendedOutcome: [
    "research", "positioning", "interface-architecture",
    "technical-proof", "evidence", "submission", "retrospective",
  ],
  steps: [
    {
      playbookId: "hackathon-intake",
      reason: "Transforms any hackathon brief into a compact, decision-ready snapshot.",
    },
    {
      playbookId: "hackathon-research",
      reason: "Finds and verifies the external evidence required for reliable decisions.",
    },
    {
      playbookId: "hackathon-landscape",
      reason: "Analyzes the competitive landscape to identify differentiation opportunities.",
    },
    {
      playbookId: "hackathon-ideas",
      reason: "Generates and compares candidate project concepts.",
    },
    {
      playbookId: "hackathon-idea-scorecard",
      reason: "Scores and selects the strongest concept.",
    },
    {
      playbookId: "hackathon-product-blueprint",
      reason: "Freezes the product definition for downstream implementation.",
    },
    {
      playbookId: "hackathon-execution",
      reason: "Creates the time-boxed build plan.",
    },
    {
      playbookId: "hackathon-ux",
      reason: "Designs a hackathon product experience that is understandable and credible.",
    },
    {
      playbookId: "hackathon-visual-production",
      reason: "Produces the visual and demo assets.",
    },
    {
      playbookId: "hackathon-ui-polish",
      reason: "Applies the mandatory UI polish pass before demo freeze.",
    },
    {
      playbookId: "hackathon-demo",
      reason: "Packages the project into a judge-optimized demonstration.",
    },
    {
      playbookId: "hackathon-evidence",
      reason: "Classifies and documents all verifiable technical evidence.",
    },
    {
      playbookId: "hackathon-submission",
      reason: "Assembles the final submission package.",
    },
    {
      playbookId: "hackathon-retrospective",
      reason: "Converts the completed hackathon into reusable strategic learning.",
    },
  ],
  relatedRegistryIds: [
    "layouts", "decision-systems", "operational-workspace-recipe",
    "capture-bridge", "product-launch-recipe",
  ],
  ecosystemTarget: "shared",
})

// ── Export ─────────────────────────────────────────────────────
export const playbookReadingPaths: readonly PlaybookReadingPath[] = [
  path1, path2, path3, path4, path5,
]

const pathById = new Map(playbookReadingPaths.map((p) => [p.id, p]))

export function getReadingPathById(id: string): PlaybookReadingPath | undefined {
  return pathById.get(id)
}

/** Get all reading paths that contain a given playbook ID. */
export function getReadingPathsContaining(playbookId: string): PlaybookReadingPath[] {
  return playbookReadingPaths.filter((path) =>
    path.steps.some((step) => step.playbookId === playbookId)
  )
}
