// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Collections (Categories)
// ─────────────────────────────────────────────────────────────

import type { PlaybookCategory } from "./types"

export const playbookCategories: Record<string, PlaybookCategory> = {
  "positioning-judging": {
    id: "positioning-judging",
    label: "Positioning & Judging",
    description:
      "Core principles, hook libraries, judge path, memory sentences, proof moments, social launch, and hero copy systems. The methods that ensure a project is understood, remembered, and trusted within the first five seconds of judge contact.",
    sourceFocus: "uiux",
    contentType: "Principles, methods, systems, prompt sets",
    primaryAudience: [
      "product-designer",
      "hackathon-builder",
      "creative-director",
      "judge-facing-team",
      "submission-lead",
    ],
    recommendedUsage:
      "Use before any interface design work to align on positioning. Return during polish and demo preparation.",
    limitations:
      "Assumes judge evaluation context. Some methods are specific to hackathon submission formats.",
    order: 1,
  },
  uiux: {
    id: "uiux",
    label: "Interface Design",
    description:
      "Interface blueprints, typography, color, component rules, responsive design, composition, research methods, anti-AI-slop pass, and controlled visual risk. The technical and editorial methods for building clear, distinctive, and trustworthy interfaces.",
    sourceFocus: "uiux",
    contentType: "Blueprints, systems, rules, methods, prompt sets",
    primaryAudience: [
      "ui-designer",
      "product-designer",
      "ux-researcher",
      "developer",
      "hackathon-builder",
    ],
    recommendedUsage:
      "Use during interface design and build phases. Typography and color systems apply from the first wireframe.",
    limitations:
      "Optimized for hackathon-speed delivery. Some rules benefit from adaptation for longer product development cycles.",
    order: 2,
  },
  "demo-video": {
    id: "demo-video",
    label: "Demo Video",
    description:
      "Structured demo video scripting system with beat-by-beat timing, judge structure, and truth rules. The canonical method for packaging a project into a credible 60–90 second demonstration.",
    sourceFocus: "uiux",
    contentType: "Script, system",
    primaryAudience: [
      "demo-producer",
      "video-editor",
      "hackathon-builder",
      "submission-lead",
    ],
    recommendedUsage:
      "Use after the happy path is frozen and UI is polished. Reference alongside the Hackathon Demo and Video Egaki modules.",
    limitations:
      "Timing guidance assumes a working live demo. Simulated demos require explicit proof labels.",
    order: 3,
  },
  "visual-references": {
    id: "visual-references",
    label: "Visual References",
    description:
      "Project-specific visual direction reference cards documenting style signals, palette rationale, and typographic identity for BatchGuard, CupPulse, EdgeVoC, and Local Business Fix Lab.",
    sourceFocus: "uiux",
    contentType: "Reference",
    primaryAudience: ["ui-designer", "creative-director", "product-designer"],
    recommendedUsage:
      "Use as inspiration samples and visual direction documents. Do not copy directly — adapt the signal, not the surface.",
    limitations:
      "Project-specific. These are reference examples, not universal templates.",
    order: 4,
  },
  "hackathon-evidence": {
    id: "hackathon-evidence",
    label: "Evidence & Submission",
    description:
      "Evidence taxonomy, classification system, submission package structure, and final submission module. The core playbooks for making technical proof visible and transforming it into a credible, complete submission.",
    sourceFocus: "hackathon",
    contentType: "Operating modules, templates",
    primaryAudience: [
      "submission-lead",
      "hackathon-builder",
      "judge-facing-team",
      "developer",
    ],
    recommendedUsage:
      "Use after the happy path is working. Evidence must be generated before the audit gate.",
    limitations:
      "Evidence quality cannot be upgraded through narration or visual polish alone.",
    order: 5,
  },
  "hackathon-gates": {
    id: "hackathon-gates",
    label: "Operating Gates",
    description:
      "Audit gate, distinction module, naming distinction skill, angle-mort strategic challenge, and operating gates for video packaging. Decision checkpoints that determine readiness for submission.",
    sourceFocus: "hackathon",
    contentType: "Gates, operating modules",
    primaryAudience: [
      "submission-lead",
      "hackathon-builder",
      "judge-facing-team",
    ],
    recommendedUsage:
      "Run gates sequentially after each major phase completes. The Audit gate is the final go/no-go decision.",
    limitations:
      "Gates are designed to block, not encourage. Some gates may return NO-GO decisions.",
    order: 6,
  },
  "hackathon-templates": {
    id: "hackathon-templates",
    label: "Hackathon Templates",
    description:
      "Full lifecycle hackathon operating modules: intake, research, landscape, ideas, idea scorecard, product, product blueprint, execution, judging, portfolio, loops, funding, venture, retrospective, and Antigravity integration.",
    sourceFocus: "hackathon",
    contentType: "Templates, operating modules",
    primaryAudience: [
      "hackathon-builder",
      "founder",
      "product-designer",
      "submission-lead",
      "developer",
    ],
    recommendedUsage:
      "Use sequentially from Intake through Retrospective. Each module feeds the next in the pipeline.",
    limitations:
      "Designed for Claude-assisted hackathon workflows. Adapt for other AI assistant contexts.",
    order: 7,
  },
  "hackathon-ux-ui": {
    id: "hackathon-ux-ui",
    label: "Hackathon UX/UI",
    description:
      "UX design, UI polish, demo production, video (Brag and Egaki), and visual production modules. The complete hackathon-specific creative production pipeline.",
    sourceFocus: "hackathon",
    contentType: "Operating modules",
    primaryAudience: [
      "ui-designer",
      "ux-researcher",
      "demo-producer",
      "video-editor",
      "hackathon-builder",
      "creative-director",
    ],
    recommendedUsage:
      "Use UX module during design phase. UI Polish after build. Demo and video after UI is frozen.",
    limitations:
      "Video modules (Brag, Egaki) require a working, demonstrable product first.",
    order: 8,
  },
} satisfies Record<string, PlaybookCategory>

export const playbookCategoryList = Object.values(playbookCategories).sort(
  (a, b) => a.order - b.order
)
