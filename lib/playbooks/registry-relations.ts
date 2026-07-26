// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Registry V2 Relations
// Bridges Playbook IDs ↔ Registry V2 entry IDs.
// CLIENT-SAFE. No fs.
// ─────────────────────────────────────────────────────────────

import type { PlaybookRegistryRelation } from "./types"
import type { PlaybookEntry } from "./types"
import { getPlaybookById } from "./catalog"

// ── Confirmed Registry V2 IDs ─────────────────────────────────
// DO NOT invent IDs. These are verified against lib/registry/components.ts.
export const CONFIRMED_REGISTRY_IDS = new Set([
  "spotlight",
  "split-flap",
  "scrub-input",
  "kinetic-text",
  "scroll-choreography",
  "webgl-liquid",
  "image-ripple",
  "typography",
  "foundations",
  "layouts",
  "interaction-player",
  "decision-systems",
  "capture-bridge",
  "product-launch-recipe",
  "operational-workspace-recipe",
  "data-story-recipe",
  "broadcast-package-recipe",
  "layout-shell",
  "layout-stage",
  "layout-split",
  "signal-band",
  "evidence-ledger",
  "decision-gate",
  "decision-trace",
  "capture-workbench",
  "recipe-workbench",
])

// ── Explicit relation definitions ─────────────────────────────
// Built from the plan + verified Registry IDs. Each entry in catalog
// that has relatedRegistryIds creates entries here.

const registryRelations: PlaybookRegistryRelation[] = [
  // Typography System
  { playbookId: "typography-system", registryId: "typography", type: "demonstrates", note: "Typography System documents font roles that the Typography Foundation implements." },
  { playbookId: "typography-system", registryId: "foundations", type: "informs" },
  // Color System
  { playbookId: "color-system", registryId: "foundations", type: "demonstrates", note: "Color System documents palette roles that Visual Foundations implements." },
  // Component Rules
  { playbookId: "component-rules", registryId: "foundations", type: "informs" },
  { playbookId: "component-rules", registryId: "layouts", type: "informs" },
  // Responsive Rules
  { playbookId: "responsive-rules", registryId: "layouts", type: "informs", note: "Responsive Rules defines breakpoint behavior that Layout Systems implements." },
  // Composition Rules
  { playbookId: "composition-rules", registryId: "layouts", type: "informs" },
  { playbookId: "composition-rules", registryId: "foundations", type: "informs" },
  // Landing Blueprint
  { playbookId: "landing-blueprint", registryId: "layouts", type: "requires" },
  { playbookId: "landing-blueprint", registryId: "product-launch-recipe", type: "produces-for" },
  // Dashboard Blueprint
  { playbookId: "dashboard-blueprint", registryId: "decision-systems", type: "demonstrates" },
  { playbookId: "dashboard-blueprint", registryId: "operational-workspace-recipe", type: "produces-for" },
  // Evidence Cards
  { playbookId: "evidence-cards", registryId: "decision-systems", type: "demonstrates", note: "Evidence Cards documents the visual pattern that Decision Systems implements." },
  { playbookId: "evidence-cards", registryId: "evidence-ledger", type: "informs" },
  { playbookId: "evidence-cards", registryId: "capture-bridge", type: "produces-for" },
  // Proof Moment Pattern
  { playbookId: "proof-moment-pattern", registryId: "decision-systems", type: "demonstrates" },
  { playbookId: "proof-moment-pattern", registryId: "capture-bridge", type: "produces-for" },
  { playbookId: "proof-moment-pattern", registryId: "evidence-ledger", type: "informs" },
  // Demo Video Script
  { playbookId: "demo-video-script", registryId: "interaction-player", type: "produces-for", note: "Demo Video Script defines the timing structure the Interaction Player can execute." },
  { playbookId: "demo-video-script", registryId: "capture-bridge", type: "produces-for" },
  { playbookId: "demo-video-script", registryId: "product-launch-recipe", type: "produces-for" },
  // Hackathon Demo
  { playbookId: "hackathon-demo", registryId: "capture-bridge", type: "produces-for" },
  { playbookId: "hackathon-demo", registryId: "product-launch-recipe", type: "produces-for" },
  { playbookId: "hackathon-demo", registryId: "broadcast-package-recipe", type: "produces-for" },
  { playbookId: "hackathon-demo", registryId: "interaction-player", type: "requires" },
  // Hackathon UX
  { playbookId: "hackathon-ux", registryId: "operational-workspace-recipe", type: "produces-for" },
  { playbookId: "hackathon-ux", registryId: "data-story-recipe", type: "produces-for" },
  { playbookId: "hackathon-ux", registryId: "layouts", type: "requires" },
  // Hackathon UI Polish
  { playbookId: "hackathon-ui-polish", registryId: "foundations", type: "requires" },
  { playbookId: "hackathon-ui-polish", registryId: "layouts", type: "requires" },
  // Hackathon Visual Production
  { playbookId: "hackathon-visual-production", registryId: "product-launch-recipe", type: "produces-for" },
  { playbookId: "hackathon-visual-production", registryId: "broadcast-package-recipe", type: "produces-for" },
  // Hackathon Video Egaki
  { playbookId: "hackathon-video-egaki", registryId: "capture-bridge", type: "produces-for" },
  { playbookId: "hackathon-video-egaki", registryId: "interaction-player", type: "requires" },
  { playbookId: "hackathon-video-egaki", registryId: "broadcast-package-recipe", type: "produces-for" },
  // Hackathon Video Brag
  { playbookId: "hackathon-video-brag", registryId: "capture-bridge", type: "produces-for" },
  { playbookId: "hackathon-video-brag", registryId: "broadcast-package-recipe", type: "produces-for" },
  // Hackathon Operating Gates
  { playbookId: "hackathon-operating-gates", registryId: "capture-bridge", type: "produces-for" },
  { playbookId: "hackathon-operating-gates", registryId: "interaction-player", type: "requires" },
  // Hackathon Evidence
  { playbookId: "hackathon-evidence", registryId: "decision-systems", type: "demonstrates" },
  { playbookId: "hackathon-evidence", registryId: "evidence-ledger", type: "informs" },
  { playbookId: "hackathon-evidence", registryId: "capture-bridge", type: "produces-for" },
  // Hackathon Audit
  { playbookId: "hackathon-audit", registryId: "decision-systems", type: "demonstrates" },
  { playbookId: "hackathon-audit", registryId: "decision-gate", type: "informs" },
  // Hackathon Submission
  { playbookId: "hackathon-submission", registryId: "decision-systems", type: "demonstrates" },
  { playbookId: "hackathon-submission", registryId: "capture-bridge", type: "produces-for" },
  // Hackathon Product
  { playbookId: "hackathon-product", registryId: "layouts", type: "requires" },
  { playbookId: "hackathon-product", registryId: "decision-systems", type: "informs" },
  { playbookId: "hackathon-product", registryId: "operational-workspace-recipe", type: "produces-for" },
  // Hackathon Execution
  { playbookId: "hackathon-execution", registryId: "layouts", type: "requires" },
  { playbookId: "hackathon-execution", registryId: "decision-systems", type: "informs" },
  // Hackathon Product Blueprint
  { playbookId: "hackathon-product-blueprint", registryId: "layouts", type: "requires" },
  { playbookId: "hackathon-product-blueprint", registryId: "decision-systems", type: "informs" },
  // Checklists
  { playbookId: "checklists", registryId: "decision-systems", type: "informs" },
  // System Principles
  { playbookId: "system-principles", registryId: "decision-systems", type: "informs" },
  // Judge Path
  { playbookId: "judge-path", registryId: "decision-systems", type: "informs" },
  // Design Prompts
  { playbookId: "design-prompts", registryId: "foundations", type: "informs" },
  // AI Design Stack
  { playbookId: "ai-design-stack", registryId: "foundations", type: "informs" },
  // Reference to Polished UI
  { playbookId: "reference-to-polished-ui", registryId: "foundations", type: "informs" },
  // Anti-AI Slop Pass
  { playbookId: "anti-ai-slop-pass", registryId: "foundations", type: "informs" },
  // Controlled Visual Risk
  { playbookId: "controlled-visual-risk", registryId: "foundations", type: "informs" },
  { playbookId: "controlled-visual-risk", registryId: "layouts", type: "informs" },
  // Judge Visual Moment
  { playbookId: "judge-visual-moment", registryId: "foundations", type: "informs" },
  { playbookId: "judge-visual-moment", registryId: "product-launch-recipe", type: "produces-for" },
  // Hackathon Idea Scorecard
  { playbookId: "hackathon-idea-scorecard", registryId: "decision-systems", type: "informs" },
  // Hackathon Judging
  { playbookId: "hackathon-judging", registryId: "decision-systems", type: "informs" },
  // Social Launch Pack
  { playbookId: "social-launch-pack", registryId: "product-launch-recipe", type: "produces-for" },
  // Visual references
  { playbookId: "batchguard-style", registryId: "foundations", type: "informs" },
  { playbookId: "cuppulse-style", registryId: "foundations", type: "informs" },
  { playbookId: "edgevoc-style", registryId: "foundations", type: "informs" },
  { playbookId: "local-business-fix-lab-style", registryId: "foundations", type: "informs" },
  // Hackathon Antigravity
  { playbookId: "hackathon-antigravity", registryId: "capture-bridge", type: "informs" },
]

// ── Validate registry IDs at load time ────────────────────────
for (const rel of registryRelations) {
  if (!CONFIRMED_REGISTRY_IDS.has(rel.registryId)) {
    throw new Error(
      `[Playbook Registry Relations] Unknown Registry V2 ID: "${rel.registryId}" (from playbook "${rel.playbookId}"). Only verified Registry IDs may be referenced.`
    )
  }
}

// ── Index by playbook ID ──────────────────────────────────────
const byPlaybookId = new Map<string, PlaybookRegistryRelation[]>()
const byRegistryId = new Map<string, PlaybookRegistryRelation[]>()

for (const rel of registryRelations) {
  const pb = byPlaybookId.get(rel.playbookId) ?? []
  pb.push(rel)
  byPlaybookId.set(rel.playbookId, pb)

  const rg = byRegistryId.get(rel.registryId) ?? []
  rg.push(rel)
  byRegistryId.set(rel.registryId, rg)
}

/** Get all registry relations for a playbook ID. */
export function getRegistryRelationsForPlaybook(
  playbookId: string
): PlaybookRegistryRelation[] {
  return byPlaybookId.get(playbookId) ?? []
}

/** Get all playbook entries that relate to a given Registry V2 ID. */
export function getPlaybooksForRegistryEntry(registryId: string): PlaybookEntry[] {
  const rels = byRegistryId.get(registryId) ?? []
  const ids = [...new Set(rels.map((r) => r.playbookId))]
  return ids
    .map((id) => getPlaybookById(id))
    .filter((e): e is PlaybookEntry => !!e)
}

/** Get Registry IDs that a playbook relates to. */
export function getRelatedRegistryIds(playbookId: string): string[] {
  return getRegistryRelationsForPlaybook(playbookId).map((r) => r.registryId)
}

export { registryRelations as allRegistryRelations }
