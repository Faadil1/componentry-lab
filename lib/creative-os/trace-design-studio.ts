import type { CreativeProjectMode } from "@/lib/director/types"

export type TraceDesignSurface =
  | "WEB_PRODUCT"
  | "MOBILE_NATIVE"
  | "DASHBOARD"
  | "EDITORIAL"
  | "PRESENTATION"
  | "MOTION_VIDEO"

export type TraceDesignConcern =
  | "ANTI_SLOP"
  | "AESTHETIC_LINEAGE"
  | "COMPONENT_COMPOSITION"
  | "MOBILE_NATIVE_UX"
  | "MOTION"
  | "CHARACTER"
  | "TEXTURE"
  | "COPY_PERSUASION"
  | "BRAND_SYSTEM"
  | "ACCESSIBILITY"
  | "RUNTIME_ASSURANCE"
  | "EVIDENCE"

export type TraceDesignAssetKind =
  | "SYSTEM"
  | "PROTOCOL"
  | "SKILL"
  | "AGENT"
  | "REFERENCE"
  | "COMPONENT"
  | "RESOURCE"

export type TraceDesignStatus =
  | "CANONICAL"
  | "STABLE"
  | "ACTIVE"
  | "DEVELOPMENT_CANDIDATE"
  | "ADJACENT"
  | "LAB"

export type TraceDesignAuthority =
  | "READ_ONLY"
  | "SUGGEST"
  | "PREPARE"
  | "LOCAL_REVERSIBLE"
  | "EXPLICIT_EXTERNAL"
  | "NO_AUTHORITY"

export interface TraceDesignAsset {
  id: string
  name: string
  kind: TraceDesignAssetKind
  group: string
  summary: string
  status: TraceDesignStatus
  authority: TraceDesignAuthority
  source: string
  version?: string
  href?: string
  sourceUrl?: string
  modes?: CreativeProjectMode[]
  surfaces?: TraceDesignSurface[]
  concerns?: TraceDesignConcern[]
  triggers?: string[]
  tags?: string[]
}

export interface TraceDesignRouteInput {
  mode: CreativeProjectMode
  surface: TraceDesignSurface
  concerns: TraceDesignConcern[]
}

export interface TraceDesignRouteResult {
  routeId: string
  nextAction: {
    title: string
    rationale: string
    authority: "SUGGEST"
  }
  activated: TraceDesignAsset[]
  skills: TraceDesignAsset[]
  agents: TraceDesignAsset[]
  references: TraceDesignAsset[]
  systems: TraceDesignAsset[]
}

export const TRACE_DESIGN_MODES: CreativeProjectMode[] = [
  "DAY_CHALLENGE",
  "HACKATHON",
  "MARA",
  "DATA_STORY",
]

export const TRACE_DESIGN_SURFACES: TraceDesignSurface[] = [
  "WEB_PRODUCT",
  "MOBILE_NATIVE",
  "DASHBOARD",
  "EDITORIAL",
  "PRESENTATION",
  "MOTION_VIDEO",
]

export const TRACE_DESIGN_CONCERNS: TraceDesignConcern[] = [
  "ANTI_SLOP",
  "AESTHETIC_LINEAGE",
  "COMPONENT_COMPOSITION",
  "MOBILE_NATIVE_UX",
  "MOTION",
  "CHARACTER",
  "TEXTURE",
  "COPY_PERSUASION",
  "BRAND_SYSTEM",
  "ACCESSIBILITY",
  "RUNTIME_ASSURANCE",
  "EVIDENCE",
]

const TRACE_WORKFLOW_BASE = "https://github.com/Faadil1/trace-design-workflow/blob/main"

const system = (
  id: string,
  name: string,
  summary: string,
  href?: string,
): TraceDesignAsset => ({
  id,
  name,
  kind: "SYSTEM",
  group: "TRACE system",
  summary,
  status: "CANONICAL",
  authority: "READ_ONLY",
  source: "componentry-lab",
  href,
  concerns: ["EVIDENCE", "RUNTIME_ASSURANCE"],
})

const protocol = (
  id: string,
  name: string,
  summary: string,
  filename: string,
  concerns: TraceDesignConcern[],
): TraceDesignAsset => ({
  id,
  name,
  kind: "PROTOCOL",
  group: "TRACE Design contracts",
  summary,
  status: "CANONICAL",
  authority: "READ_ONLY",
  source: "trace-design-workflow",
  sourceUrl: `${TRACE_WORKFLOW_BASE}/cowork/trace-design-studio-candidate/references/${filename}`,
  concerns,
})

const skill = (
  id: string,
  name: string,
  group: string,
  summary: string,
  version: string,
  status: TraceDesignStatus,
  concerns: TraceDesignConcern[],
  surfaces?: TraceDesignSurface[],
): TraceDesignAsset => ({
  id,
  name,
  kind: "SKILL",
  group,
  summary,
  status,
  authority: "READ_ONLY",
  source: "trace-design-workflow",
  version,
  sourceUrl: `${TRACE_WORKFLOW_BASE}/cowork/${group === "Stable assurance" ? "trace-design-assurance" : "trace-design-studio-candidate"}/skills/${name}`,
  concerns,
  surfaces,
})

const agent = (
  id: string,
  name: string,
  summary: string,
  concerns: TraceDesignConcern[],
  status: TraceDesignStatus = "ACTIVE",
  authority: TraceDesignAuthority = "SUGGEST",
): TraceDesignAsset => ({
  id,
  name,
  kind: "AGENT",
  group: status === "ADJACENT" ? "Adjacent orchestrators" : "TRACE Design operators",
  summary,
  status,
  authority,
  source: "TRACE Design Studio",
  concerns,
})

const reference = (
  id: string,
  name: string,
  summary: string,
  sourceUrl: string | undefined,
  concerns: TraceDesignConcern[],
  surfaces?: TraceDesignSurface[],
  triggers?: string[],
): TraceDesignAsset => ({
  id,
  name,
  kind: "REFERENCE",
  group: "Reference Intelligence",
  summary,
  status: "ACTIVE",
  authority: "READ_ONLY",
  source: "TRACE Design Reference Intelligence",
  sourceUrl,
  concerns,
  surfaces,
  triggers,
})

export const TRACE_STUDIO_STATIC_ASSETS: TraceDesignAsset[] = [
  system("sys-project-brain", "Project Brain", "Canonical project truth. TRACE Design reads it; this Studio does not silently mutate it.", "/projects"),
  system("sys-director-core", "Director Core", "Deterministic, bounded orchestration that resolves exactly one authorized next move.", "/director/live"),
  system("sys-creative-os-registry", "Creative OS Resource Registry", "Governed resource, provider, skill and method registry with authority ceilings and lifecycle states.", "/creative-os/registry"),
  system("sys-component-registry", "Component Registry V2", "Reusable interactions, foundations, layouts, systems, recipes and workflow components.", "/library"),
  system("sys-film-kit", "Film Kit", "Capture and production projection downstream from the authorized design decision.", "/film-kit"),
  system("sys-evidence-ledger", "Evidence Ledger", "Proof surface for design decisions, gates and runtime verification.", "/decisions"),
  system("sys-production-spine", "Production Spine", "Promotion path from selected direction to reusable, evidence-backed production candidate.", "/capture"),

  protocol("protocol-routing", "ROUTING.md", "Canonical skill and resource routing contract.", "ROUTING.md", ["COMPONENT_COMPOSITION", "AESTHETIC_LINEAGE"]),
  protocol("protocol-creative", "CREATIVE_PROTOCOL.md", "Creative freedom map, direction selection and non-generic design rules.", "CREATIVE_PROTOCOL.md", ["ANTI_SLOP", "AESTHETIC_LINEAGE"]),
  protocol("protocol-component", "COMPONENT_PROTOCOL.md", "Component selection, adaptation and promotion boundaries.", "COMPONENT_PROTOCOL.md", ["COMPONENT_COMPOSITION"]),
  protocol("protocol-runtime", "RUNTIME_PROTOCOL.md", "Runtime quality, web behavior and assurance requirements.", "RUNTIME_PROTOCOL.md", ["RUNTIME_ASSURANCE", "ACCESSIBILITY"]),
  protocol("protocol-reference-intelligence", "DESIGN_REFERENCE_INTELLIGENCE.md", "Reference selection, provenance, collision checks and design intelligence usage.", "DESIGN_REFERENCE_INTELLIGENCE.md", ["ANTI_SLOP", "AESTHETIC_LINEAGE"]),
  protocol("protocol-resource-selection", "RESOURCE_SELECTION.md", "Gate-driven resource selection instead of tool-first browsing.", "RESOURCE_SELECTION.md", ["COMPONENT_COMPOSITION", "ANTI_SLOP"]),
  protocol("protocol-aesthetic-taxonomy", "AESTHETIC_TAXONOMY_LAYER.md", "Aesthetic lineage and cultural taxonomy layer.", "AESTHETIC_TAXONOMY_LAYER.md", ["AESTHETIC_LINEAGE", "ANTI_SLOP"]),
  protocol("protocol-section-layer", "SECTION_REFERENCE_LAYER.md", "Section-level reference routing for hero, nav, CTA, footer and error-state work.", "SECTION_REFERENCE_LAYER.md", ["COMPONENT_COMPOSITION"]),
  protocol("protocol-creative-device", "CREATIVE_DEVICE_CONTRACT.md", "Working contract for a selected creative device and its bounded alternatives.", "CREATIVE_DEVICE_CONTRACT.md", ["ANTI_SLOP", "AESTHETIC_LINEAGE"]),
  protocol("protocol-authority", "AUTHORITY.md", "Authority and write-boundary contract for the Studio.", "AUTHORITY.md", ["EVIDENCE", "RUNTIME_ASSURANCE"]),
  protocol("protocol-m3e", "M3E_CANVAS_ADAPTER.md", "Adapter contract for canvas-based interaction mechanisms.", "M3E_CANVAS_ADAPTER.md", ["MOTION", "COMPONENT_COMPOSITION"]),
  {
    id: "protocol-design-routing-index",
    name: "registry/design-routing.yaml",
    kind: "PROTOCOL",
    group: "TRACE Design contracts",
    summary: "Machine-readable full routing index connecting collected design references to gates and jobs.",
    status: "CANONICAL",
    authority: "READ_ONLY",
    source: "trace-design-workflow",
    sourceUrl: "https://github.com/Faadil1/trace-design-workflow/blob/main/registry/design-routing.yaml",
    concerns: ["COMPONENT_COMPOSITION", "AESTHETIC_LINEAGE", "RUNTIME_ASSURANCE"],
  },

  skill("skill-trace-design", "trace-design", "Design Studio candidate", "Single TRACE Design front door and routing skill.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["ANTI_SLOP", "COMPONENT_COMPOSITION", "EVIDENCE"]),
  skill("skill-art-direction", "trace-studio-art-direction", "Design Studio candidate", "Art direction, lineage, differentiation and creative-device selection.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["AESTHETIC_LINEAGE", "ANTI_SLOP", "BRAND_SYSTEM"]),
  skill("skill-assurance-review", "trace-studio-assurance-review", "Design Studio candidate", "Embedded Design / Experience Assurance review.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["ACCESSIBILITY", "RUNTIME_ASSURANCE", "EVIDENCE"]),
  skill("skill-component-router", "trace-studio-component-router", "Design Studio candidate", "Routes a design job to the smallest fitting component/reference set.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["COMPONENT_COMPOSITION"]),
  skill("skill-creative-director", "trace-studio-creative-director", "Design Studio candidate", "Creative-direction specialist that preserves frozen contracts and returns a bounded direction.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["ANTI_SLOP", "AESTHETIC_LINEAGE", "EVIDENCE"]),
  skill("skill-design-system", "trace-studio-design-system", "Design Studio candidate", "Design-system coherence, token and component contract review.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["BRAND_SYSTEM", "COMPONENT_COMPOSITION", "ACCESSIBILITY"]),
  skill("skill-evidence", "trace-studio-evidence", "Design Studio candidate", "Evidence binding for design decisions and review claims.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["EVIDENCE"]),
  skill("skill-flow", "trace-studio-flow", "Design Studio candidate", "Interaction and product-flow review.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["MOBILE_NATIVE_UX", "COMPONENT_COMPOSITION", "ACCESSIBILITY"]),
  skill("skill-frozen-contracts", "trace-studio-frozen-contracts", "Design Studio candidate", "Protects frozen product, evidence and authority contracts.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["EVIDENCE", "RUNTIME_ASSURANCE"]),
  skill("skill-gate", "trace-studio-gate", "Design Studio candidate", "Design gate evaluation without auto-promotion.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["EVIDENCE", "RUNTIME_ASSURANCE"]),
  skill("skill-motion", "trace-studio-motion", "Design Studio candidate", "Motion intent, timing, continuity and reduced-motion review.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["MOTION", "ACCESSIBILITY"], ["WEB_PRODUCT", "MOTION_VIDEO"]),
  skill("skill-next", "trace-studio-next", "Design Studio candidate", "Returns the single bounded next move after design review.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["EVIDENCE"]),
  skill("skill-runtime-review", "trace-studio-runtime-review", "Design Studio candidate", "Web-runtime, responsive and accessibility runtime review.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["RUNTIME_ASSURANCE", "ACCESSIBILITY"], ["WEB_PRODUCT", "DASHBOARD", "MOBILE_NATIVE"]),
  skill("skill-status", "trace-studio-status", "Design Studio candidate", "Read-only TRACE status projection.", "0.1.0-studio.1", "DEVELOPMENT_CANDIDATE", ["EVIDENCE"]),

  skill("stable-assurance-review", "trace-assurance-review", "Stable assurance", "Stable read-only Design / Experience Assurance review.", "0.1.0", "STABLE", ["ACCESSIBILITY", "RUNTIME_ASSURANCE", "EVIDENCE"]),
  skill("stable-evidence", "trace-evidence", "Stable assurance", "Stable evidence projection.", "0.1.0", "STABLE", ["EVIDENCE"]),
  skill("stable-frozen-contracts", "trace-frozen-contracts", "Stable assurance", "Stable frozen-contract inspection.", "0.1.0", "STABLE", ["EVIDENCE"]),
  skill("stable-gate", "trace-gate", "Stable assurance", "Stable read-only gate review.", "0.1.0", "STABLE", ["EVIDENCE", "RUNTIME_ASSURANCE"]),
  skill("stable-next", "trace-next", "Stable assurance", "Stable next-action projection.", "0.1.0", "STABLE", ["EVIDENCE"]),
  skill("stable-status", "trace-status", "Stable assurance", "Stable status projection.", "0.1.0", "STABLE", ["EVIDENCE"]),

  agent("agent-front-door", "TRACE Design Front Door", "Routes a design request to specialist lenses and canonical references without taking external authority.", ["COMPONENT_COMPOSITION", "ANTI_SLOP", "EVIDENCE"]),
  agent("agent-creative-director", "Creative Director", "Chooses and protects a coherent design direction instead of averaging references together.", ["AESTHETIC_LINEAGE", "ANTI_SLOP", "BRAND_SYSTEM"]),
  agent("agent-art-direction", "Art Direction Specialist", "Runs lineage, motif, cultural-context and differentiation checks.", ["AESTHETIC_LINEAGE", "ANTI_SLOP"]),
  agent("agent-component-router", "Component Router", "Selects the smallest compatible UI mechanism/component set for the job.", ["COMPONENT_COMPOSITION"]),
  agent("agent-runtime-reviewer", "Runtime Reviewer", "Checks responsive behavior, runtime truth and reduced-motion/accessibility paths.", ["RUNTIME_ASSURANCE", "ACCESSIBILITY"]),
  agent("agent-assurance-reviewer", "Assurance Reviewer", "Runs Design / Experience Assurance before promotion.", ["EVIDENCE", "ACCESSIBILITY", "RUNTIME_ASSURANCE"]),
  agent("agent-evidence-keeper", "Evidence Keeper", "Binds claims to visible proof and keeps unsupported completion claims blocked.", ["EVIDENCE"]),
  agent("agent-gate-keeper", "Gate Keeper", "Evaluates promotion readiness while preserving human/owner approval boundaries.", ["EVIDENCE", "RUNTIME_ASSURANCE"]),
  agent("agent-chief-of-staff", "Chief of Staff", "Adjacent orchestrator. May coordinate work but does not gain TRACE Design canonical-write authority through this Studio.", ["EVIDENCE"], "ADJACENT", "NO_AUTHORITY"),
  agent("agent-pbpd-builder", "PBPD Builder", "Adjacent product/build planning operator. Receives design constraints; it is not silently granted TRACE authority.", ["COMPONENT_COMPOSITION", "EVIDENCE"], "ADJACENT", "NO_AUTHORITY"),
  agent("agent-project-finisher", "Project Finisher", "Adjacent completion operator. TRACE evidence and gates remain authoritative for design completion claims.", ["EVIDENCE", "RUNTIME_ASSURANCE"], "ADJACENT", "NO_AUTHORITY"),

  reference("ref-cari", "CARI", "Canonical aesthetic and cultural intelligence layer for lineage, motifs, zeitgeist and anti-AI-slop diagnosis.", "https://cari.institute/aesthetics", ["AESTHETIC_LINEAGE", "ANTI_SLOP"], ["WEB_PRODUCT", "EDITORIAL", "PRESENTATION", "DASHBOARD", "MOTION_VIDEO"], ["art direction", "visual identity", "generic", "AI slop", "lineage"]),
  reference("ref-spectrum", "Spectrum UI", "General UI mechanism library for navigation, cards, data UI, forms, micro-interactions and marketing blocks.", "https://ui.spectrumhq.in/", ["COMPONENT_COMPOSITION", "MOTION"], ["WEB_PRODUCT", "DASHBOARD"], ["web UI", "dashboard", "landing page", "SaaS", "admin"]),
  reference("ref-appllama", "Appllama", "Canonical mobile research-to-build layer for native flows, onboarding, paywalls, navigation and mobile conversion UX.", "https://appllama.io/", ["MOBILE_NATIVE_UX", "COMPONENT_COMPOSITION"], ["MOBILE_NATIVE"], ["mobile", "React Native", "Expo", "paywall", "onboarding"]),
  reference("ref-koboyo", "Koboyo", "Character and hand-drawn illustration intelligence for semantic product characters and expressive UI states.", "https://koboyo.com/", ["CHARACTER", "ANTI_SLOP"], ["WEB_PRODUCT", "MOBILE_NATIVE", "PRESENTATION"], ["mascot", "character", "empty state", "onboarding", "agent identity"]),
  reference("ref-koboyo-page-mascot", "Koboyo Page Mascot", "Canonical Character-as-UI pattern: character behavior integrated into page composition and product state.", "https://koboyo.com/page-mascot", ["CHARACTER", "COMPONENT_COMPOSITION"], ["WEB_PRODUCT", "MOBILE_NATIVE"], ["character as UI", "state", "blocked", "repairing", "verified"]),
  reference("ref-ascii-magic", "ASCII Magic", "Visual treatment engine for dither, glyph, halftone, pixel, glitch, CRT and raster treatments used only when concept-driven.", "https://www.ascii-magic.com/", ["TEXTURE", "ANTI_SLOP", "MOTION"], ["WEB_PRODUCT", "EDITORIAL", "PRESENTATION", "MOTION_VIDEO"], ["dither", "ASCII", "glitch", "archive", "retro digital"]),
  reference("ref-branding-style-guides", "Branding Style Guides", "Brand-system reference layer for real identity systems, governance and application patterns.", "https://brandingstyleguides.com/", ["BRAND_SYSTEM", "AESTHETIC_LINEAGE"], ["WEB_PRODUCT", "EDITORIAL", "PRESENTATION"], ["brand", "identity", "style guide", "design system"]),
  reference("ref-annual-report-gallery", "Annual Report Gallery", "Editorial/report composition reference for information hierarchy, narrative pacing and evidence-rich layouts.", "https://annualreport.gallery/", ["BRAND_SYSTEM", "COPY_PERSUASION", "AESTHETIC_LINEAGE"], ["EDITORIAL", "PRESENTATION", "DASHBOARD"], ["report", "annual report", "editorial", "data story"]),
  reference("ref-study-old-ads", "Study Old Ads", "Persuasion and copy-compression reference for hooks, headlines, benefit framing and memorable promises.", "https://studyoldads.com/", ["COPY_PERSUASION", "ANTI_SLOP"], ["WEB_PRODUCT", "EDITORIAL", "PRESENTATION"], ["headline", "tagline", "hero", "value proposition", "campaign"]),
  reference("ref-inspora", "Inspora", "Art-direction reference layer used as a complement to canonical structure sources, never as product-flow authority.", undefined, ["AESTHETIC_LINEAGE", "ANTI_SLOP"], ["WEB_PRODUCT", "MOBILE_NATIVE", "EDITORIAL", "PRESENTATION"], ["art direction", "inspiration"]),
  reference("ref-desloppify", "Desloppify", "Anti-slop review reference for finding generic, over-produced or mechanically AI-looking output before promotion.", "https://github.com/peteromallet/desloppify", ["ANTI_SLOP", "RUNTIME_ASSURANCE"], ["WEB_PRODUCT", "DASHBOARD", "EDITORIAL", "PRESENTATION"], ["AI slop", "generic", "cleanup", "review"]),
  reference("ref-rare-ui", "Rare UI", "Distinctive animated React component reference for targeted visual signatures and rare interaction behaviors.", "https://www.rareui.com/", ["COMPONENT_COMPOSITION", "MOTION", "ANTI_SLOP"], ["WEB_PRODUCT"], ["component", "micro interaction", "signature"]),
  reference("ref-cue-design", "Cue Design", "High-taste component reference layer for premium interaction and anti-generic mechanism discovery.", "https://www.cuedesign.space/", ["COMPONENT_COMPOSITION", "ANTI_SLOP", "AESTHETIC_LINEAGE"], ["WEB_PRODUCT"], ["premium", "interaction", "composition"]),
  reference("ref-backgrounds-supply", "Backgrounds Supply", "Background/material reference for deliberate surface treatments instead of default gradients.", "https://backgrounds.supply/", ["TEXTURE", "ANTI_SLOP"], ["WEB_PRODUCT", "EDITORIAL", "PRESENTATION"], ["background", "texture", "surface"]),
  reference("ref-opensourceui", "OpenSourceUI", "Open-code UI reference source for inspectable component mechanisms after fit and license checks.", "https://opensourceui.in/", ["COMPONENT_COMPOSITION"], ["WEB_PRODUCT", "DASHBOARD"], ["open source", "component", "UI"]),
  reference("ref-playgrnd", "Playgrnd.tools", "Experimental design-tool reference for distinctive visual mechanisms and exploratory composition.", "https://playgrnd.tools/", ["ANTI_SLOP", "AESTHETIC_LINEAGE", "TEXTURE"], ["WEB_PRODUCT", "EDITORIAL", "PRESENTATION"], ["experimental", "visual", "tool"]),
  reference("ref-met-collection", "The Met Collection", "Art-historical visual reference for material, motif, period and composition research with cultural context.", "https://www.metmuseum.org/art/collection", ["AESTHETIC_LINEAGE", "ANTI_SLOP"], ["EDITORIAL", "PRESENTATION", "WEB_PRODUCT"], ["art history", "motif", "material", "collection"]),
]

const ALWAYS_ON_IDS = new Set([
  "sys-project-brain",
  "sys-director-core",
  "sys-creative-os-registry",
  "sys-component-registry",
  "protocol-routing",
  "protocol-authority",
  "skill-trace-design",
  "skill-creative-director",
  "skill-frozen-contracts",
  "skill-status",
  "skill-next",
  "skill-evidence",
  "skill-gate",
  "agent-front-door",
  "agent-creative-director",
  "agent-evidence-keeper",
  "agent-gate-keeper",
])

function scoreAsset(asset: TraceDesignAsset, input: TraceDesignRouteInput): number {
  let score = ALWAYS_ON_IDS.has(asset.id) ? 50 : 0
  if (asset.modes?.includes(input.mode)) score += 8
  if (asset.surfaces?.includes(input.surface)) score += 12
  for (const concern of input.concerns) {
    if (asset.concerns?.includes(concern)) score += 10
  }
  return score
}

function resolveNextAction(input: TraceDesignRouteInput): TraceDesignRouteResult["nextAction"] {
  if (input.concerns.includes("RUNTIME_ASSURANCE") || input.concerns.includes("ACCESSIBILITY")) {
    return {
      title: "Run the selected direction through runtime + assurance review",
      rationale: "The route includes runtime/accessibility risk, so implementation proof should be checked before any promotion claim.",
      authority: "SUGGEST",
    }
  }
  if (input.concerns.includes("ANTI_SLOP") || input.concerns.includes("AESTHETIC_LINEAGE")) {
    return {
      title: "Lock one differentiated art direction before component composition",
      rationale: "Lineage and anti-slop concerns are unresolved; broad component assembly now would increase aesthetic drift.",
      authority: "SUGGEST",
    }
  }
  if (input.surface === "MOBILE_NATIVE" || input.concerns.includes("MOBILE_NATIVE_UX")) {
    return {
      title: "Validate the native mobile flow before visual embellishment",
      rationale: "Mobile-native structure and interaction conventions should be proven before secondary visual mechanisms are added.",
      authority: "SUGGEST",
    }
  }
  if (input.concerns.includes("COPY_PERSUASION")) {
    return {
      title: "Compress the promise into one testable memory sentence",
      rationale: "The current route includes persuasion/copy work; the promise should be made explicit before the surrounding visual system expands.",
      authority: "SUGGEST",
    }
  }
  return {
    title: "Compose the smallest testable design slice",
    rationale: "No stronger unresolved risk outranks composition; build one bounded slice and collect evidence before widening scope.",
    authority: "SUGGEST",
  }
}

export function routeTraceDesign(
  input: TraceDesignRouteInput,
  assets: TraceDesignAsset[],
): TraceDesignRouteResult {
  const scored = assets
    .map((asset) => ({ asset, score: scoreAsset(asset, input) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.asset.name.localeCompare(b.asset.name))

  const activated = scored.map(({ asset }) => asset)
  const routeKey = [input.mode, input.surface, ...[...input.concerns].sort()].join("|")
  const routeId = `trace:${routeKey.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`

  return {
    routeId,
    nextAction: resolveNextAction(input),
    activated,
    skills: activated.filter((asset) => asset.kind === "SKILL").slice(0, 12),
    agents: activated.filter((asset) => asset.kind === "AGENT").slice(0, 10),
    references: activated.filter((asset) => asset.kind === "REFERENCE").slice(0, 18),
    systems: activated.filter((asset) => asset.kind === "SYSTEM" || asset.kind === "PROTOCOL").slice(0, 16),
  }
}
