import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const SACRED_RULES_BREAKER_ID = "method_sacred_rules_breaker"

export const sacredRulesBreakerDefinition: CreativeMethodDefinition = {
  id: SACRED_RULES_BREAKER_ID,
  resourceId: "res_sacred_rules_breaker",
  name: "Sacred Rules Breaker",
  version: "2.0.0",
  supportedModes: ["DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["category-differentiation", "rules-governance"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [
    "evaluatorType",
    "supplementaryFields.conventionDomain",
    "supplementaryFields.objective",
    "supplementaryFields.audience",
    "supplementaryFields.desiredPosition",
    "supplementaryFields.trustRequirements"
  ],
  outputSchemaId: "sacred-rules-breaker-v2",
  qualityGateIds: [
    "srb.conventions-inventoried",
    "srb.trust-codes-protected",
    "srb.break-candidates-strategic",
    "srb.strategic-inversion-position-sensitive"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

// ─── Convention Library ─────────────────────────────────────────────────────

type ConventionClassification = "SACRED" | "HABIT"

interface ConventionEntry {
  id: string
  statement: string
  whyItExists: string
  defaultClassification: ConventionClassification
  challengedBy: string[]   // position/objective keywords that flip this to strongly-challengeable
  trustCode?: string        // if matching a declared trust requirement → always SACRED
  visualImplication: string
  verbalImplication: string
  motionImplication: string
  breakRisk: string
}

const CATEGORY_CONVENTIONS: Record<string, ConventionEntry[]> = {
  skincare: [
    {
      id: "clinical-efficacy-frame",
      statement: "Efficacy claims must be clinically supported or implied through lab-adjacent aesthetic (white space, scientific language, before/after imagery)",
      whyItExists: "Safety-first regulatory environment and consumer trust deficit in beauty claims — buyers default to scientific-looking proof",
      defaultClassification: "SACRED",
      challengedBy: ["cultural energy", "activism", "community", "social currency", "authenticity"],
      trustCode: "efficacy",
      visualImplication: "Clean white or sterile environments; clinical photography; ingredient call-outs",
      verbalImplication: "Technical language; dermatologist endorsements; study references",
      motionImplication: "Slow, precise product reveals; clinical demonstration pacing",
      breakRisk: "Breaking without an alternative trust signal causes category exit — the buyer no longer believes the product works"
    },
    {
      id: "wellness-tone",
      statement: "Brand tone is gentle, aspirational, and wellness-adjacent — never confrontational or urgent",
      whyItExists: "Anxiety-reduction is the primary purchase emotion in personal care; urgency triggers skepticism",
      defaultClassification: "HABIT",
      challengedBy: ["clinical proof", "transparency", "radical", "direct", "bold", "activist"],
      trustCode: undefined,
      visualImplication: "Soft lighting; muted palette; flowing typography; nature imagery",
      verbalImplication: "Soothing, empowering, personal — 'your skin', 'nourish', 'glow'",
      motionImplication: "Flowing, organic motion; slow dissolves; gentle parallax",
      breakRisk: "Disruption of wellness tone is legible and distinctive if paired with a credible replacement trust signal"
    },
    {
      id: "aspirational-lifestyle-photography",
      statement: "Photography depicts aspirational but accessible skin — conventionally attractive models in soft achievable contexts",
      whyItExists: "Social comparison drives category desire; achievable aspiration reduces rejection",
      defaultClassification: "HABIT",
      challengedBy: ["authenticity", "cultural relevance", "real", "documentary", "raw", "activism", "youth", "cultural energy"],
      trustCode: undefined,
      visualImplication: "Golden-hour lighting; soft focus; diverse-but-conventionally-beautiful models",
      verbalImplication: "Personal transformation testimonials; 'before/after' language",
      motionImplication: "Slow beauty reveals; glowing skin close-ups; natural light flares",
      breakRisk: "Documentary or raw photography signals authenticity but risks brand elegance perception"
    },
    {
      id: "benefit-storytelling-over-identity",
      statement: "Storytelling centres product benefits and personal transformation — cultural or political identity is avoided",
      whyItExists: "Broad audience appeal: political or cultural positioning risks alienating mainstream buyers",
      defaultClassification: "HABIT",
      challengedBy: ["activism", "cultural energy", "community", "youth", "identity", "cultural relevance", "social"],
      trustCode: undefined,
      visualImplication: "Product hero with lifestyle context; focus on personal outcome",
      verbalImplication: "First-person transformation narrative; 'I' statements; skin-outcome language",
      motionImplication: "Personal moment pacing; intimate scale reveals",
      breakRisk: "Strong identity positioning wins a niche but risks exiting mainstream — requires deliberate positioning choice"
    },
    {
      id: "sustainability-third-party-validation",
      statement: "Sustainability claims require visible certification logos or third-party validation — self-declared claims are not sufficient",
      whyItExists: "Greenwashing skepticism has trained buyers to require proof from external authority",
      defaultClassification: "SACRED",
      challengedBy: [],
      trustCode: "environmental credibility",
      visualImplication: "Certification badge placement; ingredient sourcing documentation",
      verbalImplication: "Specific verifiable claims; supply chain transparency language",
      motionImplication: "Source footage; ingredient journey reveals",
      breakRisk: "Breaking without third-party proof is greenwashing — destroys credibility in the sustainability-aware segment"
    }
  ],
  saas: [
    {
      id: "data-density-signals-capability",
      statement: "Dashboards default to dense data visualization — visible data complexity signals analytical depth",
      whyItExists: "Enterprise buyers equate visible data complexity with analytical capability; sparse interfaces read as limited",
      defaultClassification: "HABIT",
      challengedBy: ["decisive", "operational", "clarity", "action-oriented", "simple", "immediate"],
      trustCode: undefined,
      visualImplication: "Dense chart grids; multi-metric views; layered data panels",
      verbalImplication: "Feature lists; metric counts; integration breadth claims",
      motionImplication: "Rapid data loading animations; complex drill-down transitions",
      breakRisk: "Simplification reads as 'basic' without a strong operational narrative reframe"
    },
    {
      id: "enterprise-visual-restraint",
      statement: "Enterprise design communicates seriousness through visual restraint, muted palette, and conservative structure",
      whyItExists: "Risk-averse procurement culture selects for safe, institutional aesthetics — bold design reads as startup risk",
      defaultClassification: "HABIT",
      challengedBy: ["bold", "decisive", "direct", "confident", "operational", "distinct"],
      trustCode: undefined,
      visualImplication: "Blue/grey palette; geometric sans-serif; angular grid layouts",
      verbalImplication: "Process language; compliance language; integration counts",
      motionImplication: "Minimal animation; functional transitions only",
      breakRisk: "Bold aesthetic signals startup risk unless paired with strong institutional credibility evidence"
    },
    {
      id: "feature-comparison-transparency",
      statement: "Feature comparison tables signal buying transparency and competitive confidence",
      whyItExists: "B2B buyers must justify decisions to procurement and stakeholders — visible comparison aids defense",
      defaultClassification: "SACRED",
      challengedBy: [],
      trustCode: "credibility",
      visualImplication: "Side-by-side comparison tables; feature checkmark grids",
      verbalImplication: "Clear feature claims; honest acknowledgement of trade-offs",
      motionImplication: "Static or minimally animated comparison reveals",
      breakRisk: "Avoiding comparison creates buying anxiety — without it, buyers must research independently and may exit"
    },
    {
      id: "social-proof-brand-logos",
      statement: "Credibility requires recognized enterprise brand logos and named testimonials",
      whyItExists: "B2B trust transfers through peer institution credibility — procurement follows recognized adopters",
      defaultClassification: "HABIT",
      challengedBy: ["operational", "outcome-focused", "decisive", "direct", "clarity"],
      trustCode: undefined,
      visualImplication: "Logo grids; named case study blocks; headshot testimonials",
      verbalImplication: "Brand name drops; ROI statistics; named executive quotes",
      motionImplication: "Logo parade transitions; testimonial slides",
      breakRisk: "Removing logos without outcome-based proof triggers a credibility gap"
    },
    {
      id: "complexity-signals-power",
      statement: "Interface complexity signals analytical power — simple interfaces appear under-featured",
      whyItExists: "Legacy enterprise tooling (BI software) conditioned buyers to associate visual complexity with capability",
      defaultClassification: "HABIT",
      challengedBy: ["clarity", "legibility", "decisive", "operational", "immediate action", "passive reporting"],
      trustCode: undefined,
      visualImplication: "Multi-panel layouts; advanced filter controls; drill-down hierarchy visible on first view",
      verbalImplication: "Power user features; API-first framing; custom view builder",
      motionImplication: "Complex state transitions; drill-down reveal animations",
      breakRisk: "Simplicity requires an explicit narrative reframe — 'decisive intelligence' not 'limited'"
    }
  ],
  renovation: [
    {
      id: "before-after-portfolio",
      statement: "Portfolio photography shows dramatic before/after transformations as the primary proof of capability",
      whyItExists: "Visual transformation proof reduces purchase uncertainty in irreversible, high-cost decisions",
      defaultClassification: "HABIT",
      challengedBy: ["human", "process", "accountability", "trust", "relationship", "transparent"],
      trustCode: undefined,
      visualImplication: "Split-screen photography; dramatic lighting contrast; empty-to-furnished comparisons",
      verbalImplication: "Transformation narratives; client success stories; dramatic outcome language",
      motionImplication: "Reveal transitions; time-lapse construction sequences",
      breakRisk: "Removing before/after requires strong process visibility to replace the transformation proof signal"
    },
    {
      id: "certification-years-in-business",
      statement: "Trust is established through certification badges and years-in-business claims",
      whyItExists: "Risk reduction heuristics — buyers use credentialing as a shortcut for competence in unfamiliar domains",
      defaultClassification: "SACRED",
      challengedBy: [],
      trustCode: "reliability",
      visualImplication: "Badge placements; founding year; award logos",
      verbalImplication: "Established since; licensed and insured; award-winning",
      motionImplication: "Static credential display; minimal animation on trust signals",
      breakRisk: "Removing certification signals reduces default trust heuristic — requires active proof replacement"
    },
    {
      id: "price-opacity",
      statement: "Pricing transparency is avoided until prospect qualification to allow premium anchoring",
      whyItExists: "High-ticket services use scarcity and personalization framing to justify price in conversation",
      defaultClassification: "HABIT",
      challengedBy: ["premium", "confidence", "price confidence", "transparent", "direct", "human"],
      trustCode: "price confidence",
      visualImplication: "CTA-only; 'get a quote' flows; no pricing pages",
      verbalImplication: "Custom pricing language; bespoke service framing",
      motionImplication: "Conversion-optimized CTA reveals; urgency micro-animations",
      breakRisk: "Transparent pricing signals confidence but self-selects buyers — reduces inbound volume, increases lead quality"
    },
    {
      id: "craftsmanship-artisan-language",
      statement: "Brand identity centres on craftsmanship, artisanship, and trade expertise",
      whyItExists: "Quality differentiation in a commoditised market — trades compete on perceived craft quality",
      defaultClassification: "HABIT",
      challengedBy: ["human", "accountable", "modern", "systematic", "reliable", "engineering"],
      trustCode: undefined,
      visualImplication: "Close-up material textures; hand-tool imagery; workshop photography",
      verbalImplication: "Artisan language; 'hand-crafted'; 'generations of expertise'",
      motionImplication: "Slow material texture reveals; craftsmanship close-up pacing",
      breakRisk: "Abandoning craft framing requires a strong alternative differentiator — process, accountability, or human warmth"
    },
    {
      id: "explicit-guarantee-prominence",
      statement: "Service guarantees must be explicit, specific, and featured prominently",
      whyItExists: "Irreversible purchase anxiety — buyers need contractual assurance to commit to high-cost home decisions",
      defaultClassification: "SACRED",
      challengedBy: [],
      trustCode: "competence",
      visualImplication: "Guarantee callouts; satisfaction promise badges",
      verbalImplication: "Specific guarantee terms; warranty details",
      motionImplication: "Static trust mark display; no animation on guarantee claims",
      breakRisk: "Absence of explicit guarantee triggers purchase hesitation — must be replaced by an even stronger trust signal"
    }
  ]
}

const GENERIC_CONVENTIONS: ConventionEntry[] = [
  {
    id: "category-visual-conformity",
    statement: "Visual and structural language conforms to established category codes — the work looks like it belongs",
    whyItExists: "Category recognition lowers cognitive processing load for evaluators; unfamiliar work triggers skepticism",
    defaultClassification: "HABIT",
    challengedBy: ["distinctive", "different", "unconventional", "unique", "structural deviation"],
    trustCode: undefined,
    visualImplication: "Use of dominant category visual language (palette, layout, typographic defaults)",
    verbalImplication: "Category vocabulary and evaluator-legible framing",
    motionImplication: "Category-standard pacing and transition conventions",
    breakRisk: "Breaking visual category codes without deliberate positioning frames the work as simply unrecognised"
  },
  {
    id: "quality-is-differentiation",
    statement: "Differentiation is achieved through quality improvement within conventions, not structural or positional deviation",
    whyItExists: "Quality is the most legible and least-risk competitive strategy — requires no new mental model from evaluators",
    defaultClassification: "HABIT",
    challengedBy: ["structural", "architectural", "different", "distinctive", "position", "unconventional"],
    trustCode: undefined,
    visualImplication: "Higher production values; more refined execution of existing category codes",
    verbalImplication: "Superlatives within category language — 'the best', 'most refined', 'premium'",
    motionImplication: "Polished execution of standard category motion patterns",
    breakRisk: "Quality competition is a copying treadmill — structural differentiation is more durable"
  },
  {
    id: "evaluator-competence-frame",
    statement: "The primary evaluator frame is competence — evaluators assess whether the work is done correctly",
    whyItExists: "Risk-averse evaluation defaults to competence-checking before considering transformation potential",
    defaultClassification: "SACRED",
    challengedBy: [],
    trustCode: undefined,
    visualImplication: "Organised, legible, technically proficient execution",
    verbalImplication: "Professional vocabulary; evidence-based claims; structured arguments",
    motionImplication: "Controlled, intentional motion — nothing accidental",
    breakRisk: "Ignoring competence signals before establishing transformation potential results in dismissal"
  },
  {
    id: "narrative-setup-conflict-resolution",
    statement: "Storytelling follows standard narrative arc — setup, conflict, resolution — for predictable evaluator comprehension",
    whyItExists: "Cultural familiarity reduces cognitive effort; evaluators can follow without attention investment",
    defaultClassification: "HABIT",
    challengedBy: ["unconventional", "structural", "different", "innovative", "non-linear"],
    trustCode: undefined,
    visualImplication: "Linear progression of visual story; clear beginning/middle/end structure",
    verbalImplication: "Problem → solution → result framing",
    motionImplication: "Sequential narrative pacing; linear reveal structure",
    breakRisk: "Non-linear narrative requires enough evaluator trust to grant additional attention investment"
  },
  {
    id: "format-category-defaults",
    statement: "Presentation format conforms to category defaults — duration, medium, pacing, delivery context",
    whyItExists: "Format deviation requires additional cognitive work from evaluators — non-standard formats can signal amateurism",
    defaultClassification: "HABIT",
    challengedBy: ["unconventional", "bold", "different", "structural deviation"],
    trustCode: undefined,
    visualImplication: "Standard length, standard container, standard delivery mechanism",
    verbalImplication: "Conventional pitch or presentation structure",
    motionImplication: "Expected duration and rhythm for the format",
    breakRisk: "Format deviation is visible and immediate — must be earned through established credibility or explicit framing"
  }
]

// ─── Category Detection ─────────────────────────────────────────────────────

function detectCategory(subject: string, context: string): string {
  const c = `${subject} ${context}`.toLowerCase()
  if (c.includes("skincare") || c.includes("beauty") || c.includes("cosmetic") || c.includes("skin") || c.includes("moisturis") || c.includes("serum") || c.includes("cleanser") || c.includes("sunscreen") || c.includes("glow")) return "skincare"
  if (c.includes("saas") || c.includes("dashboard") || c.includes("analytics") || c.includes("software") || c.includes("b2b") || c.includes("enterprise") || c.includes("platform") || c.includes("data product")) return "saas"
  if (c.includes("renovation") || c.includes("home ") || c.includes("construction") || c.includes("remodel") || c.includes("contractor") || c.includes("interior design")) return "renovation"
  return "generic"
}

function getConventions(category: string): ConventionEntry[] {
  return CATEGORY_CONVENTIONS[category] ?? GENERIC_CONVENTIONS
}

// ─── Classification Logic ───────────────────────────────────────────────────

interface ClassifiedConvention extends ConventionEntry {
  classification: ConventionClassification
  classificationRationale: string
  challengeStrength: number
}

function classifyConvention(
  conv: ConventionEntry,
  desiredPosition: string,
  trustRequirements: string[]
): { classification: ConventionClassification; classificationRationale: string; challengeStrength: number } {
  const posLow = desiredPosition.toLowerCase()

  // Trust requirement protection overrides everything
  if (conv.trustCode) {
    const trustMatched = trustRequirements.some(tr =>
      tr.toLowerCase().includes(conv.trustCode!.toLowerCase()) ||
      conv.trustCode!.toLowerCase().includes(tr.toLowerCase())
    )
    if (trustMatched) {
      return {
        classification: "SACRED",
        classificationRationale: `Protected by declared trust requirement: "${conv.trustCode}". Breaking this convention would violate a non-negotiable audience trust condition.`,
        challengeStrength: 0
      }
    }
  }

  // Structurally SACRED (no position override)
  if (conv.defaultClassification === "SACRED") {
    return {
      classification: "SACRED",
      classificationRationale: `Structurally sacred: ${conv.whyItExists}. No desired position signal is sufficient to break this convention without providing an explicit trust replacement.`,
      challengeStrength: 0
    }
  }

  // Count how strongly desired position challenges this convention
  const matched = conv.challengedBy.filter(signal => posLow.includes(signal.toLowerCase()))
  const strength = matched.length

  if (strength > 0) {
    return {
      classification: "HABIT",
      classificationRationale: `Habit — directly challenged by desired position ("${desiredPosition}"): signals [${matched.join(", ")}] oppose this convention. Breaking it is strategically aligned with the stated positioning intent.`,
      challengeStrength: strength
    }
  }

  return {
    classification: "HABIT",
    classificationRationale: `Habit — ${conv.whyItExists} Not directly challenged by desired position "${desiredPosition}" but breakable with independent rationale.`,
    challengeStrength: 0
  }
}

// ─── Strategic Inversion Synthesis ─────────────────────────────────────────

function synthesizeStrategicInversion(
  subject: string,
  objective: string,
  desiredPosition: string,
  audience: string,
  topConvention: ConventionEntry,
  challengeStrength: number
): string {
  if (challengeStrength === 0) {
    return `No convention in this category is directly challenged by the stated position ("${desiredPosition}"). The recommended inversion for "${subject}" is structural: break "${topConvention.statement}" — the most widely copied habit in this category — to achieve pattern differentiation. This requires an independent positioning rationale separate from the stated position.`
  }
  return `STRATEGIC INVERSION for "${subject}": The convention "${topConvention.statement}" is directly opposed by the desired position "${desiredPosition}" — this is the primary break target for audience: ${audience}. Replace [${topConvention.visualImplication}] with design language that actively signals "${desiredPosition}". Verbal replacement required: [${topConvention.verbalImplication}] → positioning language that encodes "${desiredPosition}" for ${audience}. Motion replacement: ${topConvention.motionImplication} → pacing that embodies the desired position. This directly serves the objective: "${objective}".`
}

// ─── Core Production Function ───────────────────────────────────────────────

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const objective = input.supplementaryFields?.objective ?? `Create distinctive work in: ${context}`
  const audience = input.supplementaryFields?.audience ?? "target audience"
  const desiredPosition = input.supplementaryFields?.desiredPosition ?? "distinctive and memorable"
  const trustRequirementsRaw = input.supplementaryFields?.trustRequirements ?? ""
  const trustRequirements = trustRequirementsRaw ? trustRequirementsRaw.split(",").map(t => t.trim()).filter(Boolean) : []

  // Step 1: Detect category and load conventions
  const category = detectCategory(subject, context)
  const conventions = getConventions(category)

  // Step 2: Classify each convention against desired position and trust requirements
  const classified: ClassifiedConvention[] = conventions.map(conv => ({
    ...conv,
    ...classifyConvention(conv, desiredPosition, trustRequirements)
  }))

  // Step 3: Convention inventory
  const conventionInventory = classified.map((c, i) =>
    `${i + 1}. [${c.id}] "${c.statement}"\n   Why it exists: ${c.whyItExists}`
  ).join("\n\n")

  // Step 4: Sacred vs habit classification
  const sacredVsHabitClassification = classified.map(c =>
    `[${c.classification}] ${c.id}\n${c.statement}\nRationale: ${c.classificationRationale}`
  ).join("\n\n---\n\n")

  // Step 5: Break candidates (habits only, sorted by challenge strength desc)
  const habits = classified
    .filter(c => c.classification === "HABIT")
    .sort((a, b) => b.challengeStrength - a.challengeStrength)

  const breakCandidates = habits.map((c, i) => ({
    candidateIndex: i + 1,
    conventionId: c.id,
    convention: c.statement,
    proposedBreak: `Replace convention "${c.id}" — abandon [${c.visualImplication}] and substitute design language that directly signals "${desiredPosition}" for ${audience}.`,
    strategicValue: c.challengeStrength > 0
      ? `POSITION-DRIVEN (strength: ${c.challengeStrength}): Directly aligned with desired position "${desiredPosition}". ${c.verbalImplication} must be replaced.`
      : `PATTERN-BREAK (strength: 0): Not position-driven but achieves category differentiation by abandoning the most-copied habit.`,
    breakRisk: c.breakRisk,
    challengeStrength: c.challengeStrength
  }))

  const breakCandidatesOutput = breakCandidates.map(b =>
    `#${b.candidateIndex} [${b.conventionId}] challenge-strength:${b.challengeStrength}\n` +
    `Convention: ${b.convention}\n` +
    `Proposed break: ${b.proposedBreak}\n` +
    `Strategic value: ${b.strategicValue}\n` +
    `Break risk: ${b.breakRisk}`
  ).join("\n\n---\n\n")

  // Category recognition signals preserved (SACRED conventions)
  const sacredes = classified.filter(c => c.classification === "SACRED")
  const categorySignalsPreserved = sacredes.map(c =>
    `PRESERVE [${c.id}]: ${c.statement}\nVisual: ${c.visualImplication}\nVerbal: ${c.verbalImplication}`
  ).join("\n\n")

  // Top break for synthesis
  const topBreak = habits[0]

  // Visual, verbal, motion implications
  const visualImplications = habits.slice(0, 2).map(c =>
    `[${c.id}]: Abandon "${c.visualImplication}". Signal "${desiredPosition}" through visual language that directly encodes the positioning intent.`
  ).join("\n\n")

  const verbalImplications = habits.slice(0, 2).map(c =>
    `[${c.id}]: Replace "${c.verbalImplication}" with language that encodes "${desiredPosition}" for ${audience}.`
  ).join("\n\n")

  const motionImplications = topBreak
    ? `[${topBreak.id}]: Abandon "${topBreak.motionImplication}". Motion pacing must actively signal "${desiredPosition}" — ` +
      (desiredPosition.toLowerCase().includes("decisive") || desiredPosition.toLowerCase().includes("operational")
        ? "faster, more decisive cuts and confident state transitions"
        : desiredPosition.toLowerCase().includes("premium") || desiredPosition.toLowerCase().includes("quiet") || desiredPosition.toLowerCase().includes("calm")
          ? "slower, more deliberate pacing with intentional stillness"
          : desiredPosition.toLowerCase().includes("energi") || desiredPosition.toLowerCase().includes("youth") || desiredPosition.toLowerCase().includes("activist")
            ? "energetic, rhythmic editing — motion that carries cultural forward-motion"
            : "motion calibrated to the desired audience response rather than the category default")
    : "No motion implications — no habit conventions are being broken."

  // Failure risks
  const failureRisks = [
    ...habits.slice(0, 2).map(c => c.breakRisk),
    sacredes.length > 0
      ? `If breaking a habit convention accidentally erodes a SACRED convention (${sacredes.map(s => s.id).join(", ")}), audience trust will be irreparably damaged. Confirm all trust codes are preserved.`
      : null
  ].filter(Boolean).join("\n\n")

  // Proposed validation test
  const proposedValidationTest = topBreak
    ? `Five-second validation: Show the proposed creative work to one evaluator matching "${audience}" WITHOUT brand context. Ask: "What position does this work occupy in its category?" The answer must include language from "${desiredPosition}" — NOT standard category language. If the evaluator describes the work using conventional category language [${habits.slice(0, 2).map(c => c.id).join(", ")}], the strategic inversion has not landed.`
    : `Validation: Confirm the work is legibly positioned in its category AND meaningfully distinct from the three closest category competitors.`

  // Strategic inversion
  const strategicInversion = topBreak
    ? synthesizeStrategicInversion(subject, objective, desiredPosition, audience, topBreak, topBreak.challengeStrength)
    : `No high-confidence strategic inversion identified for "${subject}" with position "${desiredPosition}". Proceed with quality-based differentiation within category conventions.`

  // Deterministic fingerprints
  const inputFingerprint = `SRB:cat=${category}:pos=${desiredPosition.slice(0, 40)}:trust=${trustRequirements.join("|").slice(0, 40)}`
  const outputFingerprint = `SRB:habits=${habits.map(c => c.id).join("|")}:sacred=${sacredes.map(c => c.id).join("|")}`

  const rawOutputs: Record<string, string> = {
    category,
    conventionInventory,
    sacredVsHabitClassification,
    breakCandidates: breakCandidatesOutput,
    categorySignalsPreserved,
    visualImplications,
    verbalImplications,
    motionImplications,
    failureRisks,
    proposedValidationTest,
    strategicInversion,
    differentiationInsight: strategicInversion,
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "convention-inventory",
      label: "Conventions Discovered",
      content: conventionInventory
    },
    {
      sectionKey: "sacred-vs-habit",
      label: "Sacred vs. Habit Classification",
      content: sacredVsHabitClassification
    },
    {
      sectionKey: "break-candidates",
      label: "Rule-Break Candidates",
      content: breakCandidatesOutput
    },
    {
      sectionKey: "category-signals-preserved",
      label: "Category Signals Preserved (Sacred Conventions)",
      content: categorySignalsPreserved
    },
    {
      sectionKey: "strategic-inversion",
      label: "Selected Strategic Inversion",
      content: strategicInversion
    }
  ]

  return {
    methodId: SACRED_RULES_BREAKER_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Detect Category and Load Conventions", instruction: `Detect category from subject/context signals. Category detected: "${category}".`, outputKey: "conventionInventory" },
      { stepIndex: 2, label: "Classify Sacred vs. Habit", instruction: `For each convention, classify as SACRED or HABIT based on desired position "${desiredPosition}" and trust requirements [${trustRequirements.join(", ")}].`, outputKey: "sacredVsHabitClassification" },
      { stepIndex: 3, label: "Rank Break Candidates", instruction: "Sort habit conventions by challenge strength against desired position. Higher strength = more strategically aligned.", outputKey: "breakCandidates" },
      { stepIndex: 4, label: "Identify Preserved Category Signals", instruction: "List SACRED conventions that must not be broken.", outputKey: "categorySignalsPreserved" },
      { stepIndex: 5, label: "Synthesise Strategic Inversion", instruction: "Combine highest-strength break candidate with objective, audience, and position to produce the specific strategic inversion.", outputKey: "strategicInversion" }
    ],
    outputSections,
    rawOutputs
  }
}

// ─── Quality Gates ──────────────────────────────────────────────────────────

export const sacredRulesBreakerGates: CreativeMethodQualityGate[] = [
  {
    gateId: "srb.conventions-inventoried",
    label: "Conventions Inventoried",
    description: "At least 3 domain-specific conventions must be identified. Generic or empty inventories fail.",
    passCriteria: [
      "conventionInventory must contain at least 3 entries",
      "Each entry must reference a convention id — not a generic placeholder"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const lines = (result.rawOutputs.conventionInventory ?? "").split("\n").filter(l => l.trim().startsWith("1.") || l.trim().match(/^\d+\./))
      const hasIds = (result.rawOutputs.conventionInventory ?? "").includes("[") && (result.rawOutputs.conventionInventory ?? "").includes("]")
      const passed = lines.length >= 3 && hasIds
      return {
        gateId: "srb.conventions-inventoried",
        label: "Conventions Inventoried",
        passed,
        failReasons: passed ? [] : [
          lines.length < 3 ? `Only ${lines.length} convention(s) found; minimum 3 required.` : "",
          !hasIds ? "Conventions must include named ids — generic placeholder conventions fail this gate." : ""
        ].filter(Boolean)
      }
    }
  },
  {
    gateId: "srb.trust-codes-protected",
    label: "Trust Codes Protected",
    description: "No trust-critical convention may appear as a break candidate. At least one convention must remain SACRED.",
    passCriteria: [
      "categorySignalsPreserved must be non-empty",
      "No convention marked SACRED may appear in break candidates"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const preserved = (result.rawOutputs.categorySignalsPreserved ?? "").trim()
      const breakCandidates = result.rawOutputs.breakCandidates ?? ""
      const sacredLines = (result.rawOutputs.sacredVsHabitClassification ?? "").split("\n").filter(l => l.startsWith("[SACRED]"))
      const sacredIds = sacredLines.map(l => {
        const m = l.match(/\[SACRED\] (.+)/)
        return m?.[1] ?? ""
      }).filter(Boolean)
      const sacredBreached = sacredIds.some(id => breakCandidates.includes(`[${id}]`))
      const passed = preserved.length > 10 && !sacredBreached
      return {
        gateId: "srb.trust-codes-protected",
        label: "Trust Codes Protected",
        passed,
        failReasons: passed ? [] : [
          preserved.length <= 10 ? "No SACRED conventions identified — every convention cannot be breakable." : "",
          sacredBreached ? "A SACRED convention appears in the break candidates list — trust code protection violated." : ""
        ].filter(Boolean)
      }
    }
  },
  {
    gateId: "srb.break-candidates-strategic",
    label: "Break Candidates Have Strategic Justification",
    description: "Each break candidate must include a strategic justification tied to objective, audience, or position. Generic 'invert this convention' language fails.",
    passCriteria: [
      "breakCandidates must be non-empty",
      "Each candidate must reference either a desired position or objective",
      "Challenge strength must be reportable"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const content = result.rawOutputs.breakCandidates ?? ""
      const hasStrength = content.includes("challenge-strength:")
      const hasPosition = content.includes("position") || content.includes("Strategic value")
      const passed = content.trim().length > 50 && hasStrength && hasPosition
      return {
        gateId: "srb.break-candidates-strategic",
        label: "Break Candidates Have Strategic Justification",
        passed,
        failReasons: passed ? [] : [
          content.trim().length <= 50 ? "Break candidates output is empty or too short." : "",
          !hasStrength ? "Challenge strength must be reported per candidate." : "",
          !hasPosition ? "Break candidates must reference the desired position or objective." : ""
        ].filter(Boolean)
      }
    }
  },
  {
    gateId: "srb.strategic-inversion-position-sensitive",
    label: "Strategic Inversion Is Position-Sensitive",
    description: "The strategic inversion must directly reference the desired position. The same inversion for all inputs is a defect.",
    passCriteria: [
      "strategicInversion must reference the desired position text",
      "strategicInversion must reference the subject description",
      "strategicInversion must not be identical across different desired positions"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const inversion = result.rawOutputs.strategicInversion ?? ""
      const fingerprint = result.rawOutputs.inputFingerprint ?? ""
      const hasSubjectRef = inversion.includes('"')
      const hasFingerprintPos = fingerprint.includes("pos=") && !fingerprint.includes("pos=distinctive and memorable")
        ? inversion.length > 100
        : inversion.length > 100
      const passed = hasSubjectRef && hasFingerprintPos
      return {
        gateId: "srb.strategic-inversion-position-sensitive",
        label: "Strategic Inversion Is Position-Sensitive",
        passed,
        failReasons: passed ? [] : [
          !hasSubjectRef ? "Strategic inversion does not reference the subject — appears generic." : "",
          !hasFingerprintPos ? "Strategic inversion is too short to be position-specific." : ""
        ].filter(Boolean)
      }
    }
  }
]

/**
 * Public entry point for executing the Sacred Rules Breaker method.
 */
export function runSacredRulesBreaker(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(sacredRulesBreakerDefinition, sacredRulesBreakerGates, input, produce)
}
