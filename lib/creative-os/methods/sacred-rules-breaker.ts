import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult,
  TrustConventionEffect,
  TrustImpactEvaluation
} from "./types"
import { executeMethod } from "./runtime"

export const SACRED_RULES_BREAKER_ID = "method_sacred_rules_breaker"

export const sacredRulesBreakerDefinition: CreativeMethodDefinition = {
  id: SACRED_RULES_BREAKER_ID,
  resourceId: "res_sacred_rules_breaker",
  name: "Sacred Rules Breaker",
  version: "3.0.0",
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
  outputSchemaId: "sacred-rules-breaker-v3",
  qualityGateIds: [
    "srb.conventions-inventoried",
    "srb.trust-requirement-reasoned",
    "srb.action-model-valid",
    "srb.category-recognition-preserved",
    "srb.objective-link-explicit",
    "srb.scalable-beyond-single-visual"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

// ─── Convention Library ─────────────────────────────────────────────────────

export type ConventionNature = "SACRED" | "HABIT"
export type ConventionStrategicAction = "KEEP" | "BEND" | "BREAK"

interface ConventionEntry {
  id: string
  statement: string
  whyItExists: string
  defaultNature: ConventionNature
  challengedBy: string[]
  trustRequirementMapping?: {
    requirement: string
    audienceBelief: string
    effectOnBelief: (trustRequirements: string[], desiredPosition: string) => {
      effect: TrustConventionEffect
      reasoning: string
    }
  }
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
      defaultNature: "SACRED",
      challengedBy: ["cultural energy", "activism", "community", "social currency", "authenticity"],
      trustRequirementMapping: {
        requirement: "efficacy",
        audienceBelief: "I believe the product is scientifically formulated and will actually work.",
        effectOnBelief: (trustReqs) => {
          const hasEfficacy = trustReqs.some(r => r.toLowerCase().includes("efficacy") || r.toLowerCase().includes("safe"))
          return {
            effect: hasEfficacy ? "SUPPORTS" : "NEUTRAL",
            reasoning: hasEfficacy
              ? "Clinical framework directly supports safety and efficacy beliefs. Breaking it completely destroys trust."
              : "Standard category trust indicator, neutral in other positioning contexts."
          }
        }
      },
      visualImplication: "Clean white or sterile environments; clinical photography; ingredient call-outs",
      verbalImplication: "Technical language; dermatologist endorsements; study references",
      motionImplication: "Slow, precise product reveals; clinical demonstration pacing",
      breakRisk: "Breaking clinical efficacy proof without an alternative trust signal causes category exit — the buyer no longer believes the product works."
    },
    {
      id: "wellness-tone",
      statement: "Brand tone is gentle, aspirational, and wellness-adjacent — never confrontational or urgent",
      whyItExists: "Anxiety-reduction is the primary purchase emotion in personal care; urgency triggers skepticism",
      defaultNature: "HABIT",
      challengedBy: ["clinical proof", "transparency", "radical", "direct", "bold", "activist"],
      trustRequirementMapping: {
        requirement: "safety",
        audienceBelief: "I feel safe using this product on my body without anxiety.",
        effectOnBelief: (trustReqs, pos) => {
          const hasSafety = trustReqs.some(r => r.toLowerCase().includes("safety"))
          const isActivist = pos.toLowerCase().includes("activis") || pos.toLowerCase().includes("energy")
          return {
            effect: hasSafety ? "SUPPORTS" : isActivist ? "WEAKENS" : "NEUTRAL",
            reasoning: hasSafety
              ? "Gentle wellness tone reinforces safety and reduces product anxiety."
              : isActivist
                ? "Quiet, passive wellness language weakens an active, culturally relevant positioning attempt."
                : "Standard tone of voice, neutral to core product utility."
          }
        }
      },
      visualImplication: "Soft lighting; muted palette; flowing typography; nature imagery",
      verbalImplication: "Soothing, empowering, personal — 'your skin', 'nourish', 'glow'",
      motionImplication: "Flowing, organic motion; slow dissolves; gentle parallax",
      breakRisk: "Disruption of wellness tone is legible and distinctive if paired with a credible replacement trust signal."
    },
    {
      id: "aspirational-lifestyle-photography",
      statement: "Photography depicts aspirational but accessible skin — conventionally attractive models in soft achievable contexts",
      whyItExists: "Social comparison drives category desire; achievable aspiration reduces rejection",
      defaultNature: "HABIT",
      challengedBy: ["authenticity", "cultural relevance", "real", "documentary", "raw", "activism", "youth", "cultural energy"],
      visualImplication: "Golden-hour lighting; soft focus; diverse-but-conventionally-beautiful models",
      verbalImplication: "Personal transformation testimonials; 'before/after' language",
      motionImplication: "Slow beauty reveals; glowing skin close-ups; natural light flares",
      breakRisk: "Documentary or raw photography signals authenticity but risks brand elegance perception."
    },
    {
      id: "benefit-storytelling-over-identity",
      statement: "Storytelling centres product benefits and personal transformation — cultural or political identity is avoided",
      whyItExists: "Broad audience appeal: political or cultural positioning risks alienating mainstream buyers",
      defaultNature: "HABIT",
      challengedBy: ["activism", "cultural energy", "community", "youth", "identity", "cultural relevance", "social"],
      visualImplication: "Product hero with lifestyle context; focus on personal outcome",
      verbalImplication: "First-person transformation narrative; 'I' statements; skin-outcome language",
      motionImplication: "Personal moment pacing; intimate scale reveals",
      breakRisk: "Strong identity positioning wins a niche but risks exiting mainstream — requires deliberate positioning choice."
    },
    {
      id: "sustainability-third-party-validation",
      statement: "Sustainability claims require visible certification logos or third-party validation — self-declared claims are not sufficient",
      whyItExists: "Greenwashing skepticism has trained buyers to require proof from external authority",
      defaultNature: "SACRED",
      challengedBy: [],
      trustRequirementMapping: {
        requirement: "environmental credibility",
        audienceBelief: "I believe the brand's environmental claims are true and verifiable.",
        effectOnBelief: (trustReqs) => {
          const hasSustainability = trustReqs.some(r => r.toLowerCase().includes("env") || r.toLowerCase().includes("credibility") || r.toLowerCase().includes("sustain"))
          return {
            effect: hasSustainability ? "SUPPORTS" : "NEUTRAL",
            reasoning: hasSustainability
              ? "Third-party certification directly validates self-declared ecological claims."
              : "Standard compliance signal, neutral if sustainability is not claimed."
          }
        }
      },
      visualImplication: "Certification badge placement; ingredient sourcing documentation",
      verbalImplication: "Specific verifiable claims; supply chain transparency language",
      motionImplication: "Source footage; ingredient journey reveals",
      breakRisk: "Breaking without third-party proof is greenwashing — destroys credibility in the sustainability-aware segment."
    }
  ],
  saas: [
    {
      id: "data-density-signals-capability",
      statement: "Dashboards default to dense data visualization — visible data complexity signals analytical depth",
      whyItExists: "Enterprise buyers equate visible data complexity with analytical capability; sparse interfaces read as limited",
      defaultNature: "HABIT",
      challengedBy: ["decisive", "operational", "clarity", "action-oriented", "simple", "immediate"],
      visualImplication: "Dense chart grids; multi-metric views; layered data panels",
      verbalImplication: "Feature lists; metric counts; integration breadth claims",
      motionImplication: "Rapid data loading animations; complex drill-down transitions",
      breakRisk: "Simplification reads as 'basic' without a strong operational narrative reframe."
    },
    {
      id: "enterprise-visual-restraint",
      statement: "Enterprise design communicates seriousness through visual restraint, muted palette, and conservative structure",
      whyItExists: "Risk-averse procurement culture selects for safe, institutional aesthetics — bold design reads as startup risk",
      defaultNature: "HABIT",
      challengedBy: ["bold", "decisive", "direct", "confident", "operational", "distinct"],
      visualImplication: "Blue/grey palette; geometric sans-serif; angular grid layouts",
      verbalImplication: "Process language; compliance language; integration counts",
      motionImplication: "Minimal animation; functional transitions only",
      breakRisk: "Bold aesthetic signals startup risk unless paired with strong institutional credibility evidence."
    },
    {
      id: "feature-comparison-transparency",
      statement: "Feature comparison tables signal buying transparency and competitive confidence",
      whyItExists: "B2B buyers must justify decisions to procurement and stakeholders — visible comparison aids defense",
      defaultNature: "SACRED",
      challengedBy: [],
      trustRequirementMapping: {
        requirement: "credibility",
        audienceBelief: "I believe the product features are mature and comparable to competitors.",
        effectOnBelief: (trustReqs) => {
          const hasCredibility = trustReqs.some(r => r.toLowerCase().includes("credibility") || r.toLowerCase().includes("clarity"))
          return {
            effect: hasCredibility ? "SUPPORTS" : "NEUTRAL",
            reasoning: hasCredibility ? "Transparency in comparisons reinforces feature credibility." : "Neutral feature guide."
          }
        }
      },
      visualImplication: "Side-by-side comparison tables; feature checkmark grids",
      verbalImplication: "Clear feature claims; honest acknowledgement of trade-offs",
      motionImplication: "Static or minimally animated comparison reveals",
      breakRisk: "Avoiding comparison creates buying anxiety — without it, buyers must research independently and may exit."
    },
    {
      id: "social-proof-brand-logos",
      statement: "Credibility requires recognized enterprise brand logos and named testimonials",
      whyItExists: "B2B trust transfers through peer institution credibility — procurement follows recognized adopters",
      defaultNature: "HABIT",
      challengedBy: ["operational", "outcome-focused", "decisive", "direct", "clarity"],
      visualImplication: "Logo grids; named case study blocks; headshot testimonials",
      verbalImplication: "Brand name drops; ROI statistics; named executive quotes",
      motionImplication: "Logo parade transitions; testimonial slides",
      breakRisk: "Removing logos without outcome-based proof triggers a credibility gap."
    },
    {
      id: "complexity-signals-power",
      statement: "Interface complexity signals analytical power — simple interfaces appear under-featured",
      whyItExists: "Legacy enterprise tooling (BI software) conditioned buyers to associate visual complexity with capability",
      defaultNature: "HABIT",
      challengedBy: ["clarity", "legibility", "decisive", "operational", "immediate action", "passive reporting"],
      visualImplication: "Multi-panel layouts; advanced filter controls; drill-down hierarchy visible on first view",
      verbalImplication: "Power user features; API-first framing; custom view builder",
      motionImplication: "Complex state transitions; drill-down reveal animations",
      breakRisk: "Simplicity requires an explicit narrative reframe — 'decisive intelligence' not 'limited'."
    }
  ],
  renovation: [
    {
      id: "before-after-portfolio",
      statement: "Portfolio photography shows dramatic before/after transformations as the primary proof of capability",
      whyItExists: "Visual transformation proof reduces purchase uncertainty in irreversible, high-cost decisions",
      defaultNature: "HABIT",
      challengedBy: ["human", "process", "accountability", "trust", "relationship", "transparent"],
      visualImplication: "Split-screen photography; dramatic lighting contrast; empty-to-furnished comparisons",
      verbalImplication: "Transformation narratives; client success stories; dramatic outcome language",
      motionImplication: "Reveal transitions; time-lapse construction sequences",
      breakRisk: "Removing before/after requires strong process visibility to replace the transformation proof signal."
    },
    {
      id: "certification-years-in-business",
      statement: "Trust is established through certification badges and years-in-business claims",
      whyItExists: "Risk reduction heuristics — buyers use credentialing as a shortcut for competence in unfamiliar domains",
      defaultNature: "SACRED",
      challengedBy: [],
      trustRequirementMapping: {
        requirement: "reliability",
        audienceBelief: "I believe the contractor will complete the work safely and reliably.",
        effectOnBelief: (trustReqs) => {
          const hasReliability = trustReqs.some(r => r.toLowerCase().includes("reliability") || r.toLowerCase().includes("competence"))
          return {
            effect: hasReliability ? "SUPPORTS" : "NEUTRAL",
            reasoning: hasReliability ? "Official credentials and longevity reduce execution risk perceptions." : "Neutral baseline signal."
          }
        }
      },
      visualImplication: "Badge placements; founding year; award logos",
      verbalImplication: "Established since; licensed and insured; award-winning",
      motionImplication: "Static credential display; minimal animation on trust signals",
      breakRisk: "Removing certification signals reduces default trust heuristic — requires active proof replacement."
    },
    {
      id: "price-opacity",
      statement: "Pricing transparency is avoided until prospect qualification to allow premium anchoring",
      whyItExists: "High-ticket services use scarcity and personalization framing to justify price in conversation",
      defaultNature: "HABIT",
      challengedBy: ["premium", "confidence", "price confidence", "transparent", "direct", "human"],
      trustRequirementMapping: {
        requirement: "price confidence",
        audienceBelief: "I understand what I am likely to pay and why, without feeling tricked.",
        effectOnBelief: (trustReqs) => {
          const hasPriceConfidence = trustReqs.some(r => r.toLowerCase().includes("price") || r.toLowerCase().includes("transparency"))
          return {
            effect: hasPriceConfidence ? "WEAKENS" : "NEUTRAL",
            reasoning: hasPriceConfidence
              ? "Hiding price until qualification increases uncertainty rather than confidence for transparency-focused buyers."
              : "Neutral anchoring tool."
          }
        }
      },
      visualImplication: "CTA-only; 'get a quote' flows; no pricing pages",
      verbalImplication: "Custom pricing language; bespoke service framing",
      motionImplication: "Conversion-optimized CTA reveals; urgency micro-animations",
      breakRisk: "Transparent pricing signals confidence but self-selects buyers — reduces inbound volume, increases lead quality."
    },
    {
      id: "craftsmanship-artisan-language",
      statement: "Brand identity centres on craftsmanship, artisanship, and trade expertise",
      whyItExists: "Quality differentiation in a commoditised market — trades compete on perceived craft quality",
      defaultNature: "HABIT",
      challengedBy: ["human", "accountable", "modern", "systematic", "reliable", "engineering"],
      visualImplication: "Close-up material textures; hand-tool imagery; workshop photography",
      verbalImplication: "Artisan language; 'hand-crafted'; 'generations of expertise'",
      motionImplication: "Slow material texture reveals; craftsmanship close-up pacing",
      breakRisk: "Abandoning craft framing requires a strong alternative differentiator — process, accountability, or human warmth."
    },
    {
      id: "explicit-guarantee-prominence",
      statement: "Service guarantees must be explicit, specific, and featured prominently",
      whyItExists: "Irreversible purchase anxiety — buyers need contractual assurance to commit to high-cost home decisions",
      defaultNature: "SACRED",
      challengedBy: [],
      trustRequirementMapping: {
        requirement: "competence",
        audienceBelief: "I believe the contractor's work is backed by true technical capability.",
        effectOnBelief: (trustReqs) => {
          const hasCompetence = trustReqs.some(r => r.toLowerCase().includes("competence") || r.toLowerCase().includes("reliability"))
          return {
            effect: hasCompetence ? "SUPPORTS" : "NEUTRAL",
            reasoning: hasCompetence ? "Explicit satisfaction guarantees back the technical competence claims." : "Neutral assurance."
          }
        }
      },
      visualImplication: "Guarantee callouts; satisfaction promise badges",
      verbalImplication: "Specific guarantee terms; warranty details",
      motionImplication: "Static trust mark display; no animation on guarantee claims",
      breakRisk: "Absence of explicit guarantee triggers purchase hesitation — must be replaced by an even stronger trust signal."
    }
  ]
}

const GENERIC_CONVENTIONS: ConventionEntry[] = [
  {
    id: "category-visual-conformity",
    statement: "Visual and structural language conforms to established category codes — the work looks like it belongs",
    whyItExists: "Category recognition lowers cognitive processing load for evaluators; unfamiliar work triggers skepticism",
    defaultNature: "HABIT",
    challengedBy: ["distinctive", "different", "unconventional", "unique", "structural deviation"],
    visualImplication: "Use of dominant category visual language (palette, layout, typographic defaults)",
    verbalImplication: "Category vocabulary and evaluator-legible framing",
    motionImplication: "Category-standard pacing and transition conventions",
    breakRisk: "Breaking visual category codes without deliberate positioning frames the work as simply unrecognised."
  },
  {
    id: "quality-is-differentiation",
    statement: "Differentiation is achieved through quality improvement within conventions, not structural or positional deviation",
    whyItExists: "Quality is the most legible and least-risk competitive strategy — requires no new mental model from evaluators",
    defaultNature: "HABIT",
    challengedBy: ["structural", "architectural", "different", "distinctive", "position", "unconventional"],
    visualImplication: "Higher production values; more refined execution of existing category codes",
    verbalImplication: "Superlatives within category language — 'the best', 'most refined', 'premium'",
    motionImplication: "Polished execution of standard category motion patterns",
    breakRisk: "Quality competition is a copying treadmill — structural differentiation is more durable."
  },
  {
    id: "evaluator-competence-frame",
    statement: "The primary evaluator frame is competence — evaluators assess whether the work is done correctly",
    whyItExists: "Risk-averse evaluation defaults to competence-checking before considering transformation potential",
    defaultNature: "SACRED",
    challengedBy: [],
    visualImplication: "Organised, legible, technically proficient execution",
    verbalImplication: "Professional vocabulary; evidence-based claims; structured arguments",
    motionImplication: "Controlled, intentional motion — nothing accidental",
    breakRisk: "Ignoring competence signals before establishing transformation potential results in dismissal."
  },
  {
    id: "narrative-setup-conflict-resolution",
    statement: "Storytelling follows standard narrative arc — setup, conflict, resolution — for predictable evaluator comprehension",
    whyItExists: "Cultural familiarity reduces cognitive effort; evaluators can follow without attention investment",
    defaultNature: "HABIT",
    challengedBy: ["unconventional", "structural", "different", "innovative", "non-linear"],
    visualImplication: "Linear progression of visual story; clear beginning/middle/end structure",
    verbalImplication: "Problem → solution → result framing",
    motionImplication: "Sequential narrative pacing; linear reveal structure",
    breakRisk: "Non-linear narrative requires enough evaluator trust to grant additional attention investment."
  },
  {
    id: "format-category-defaults",
    statement: "Presentation format conforms to category defaults — duration, medium, pacing, delivery context",
    whyItExists: "Format deviation requires additional cognitive work from evaluators — non-standard formats can signal amateurism",
    defaultNature: "HABIT",
    challengedBy: ["unconventional", "bold", "different", "structural deviation"],
    visualImplication: "Standard length, standard container, standard delivery mechanism",
    verbalImplication: "Conventional pitch or presentation structure",
    motionImplication: "Expected duration and rhythm for the format",
    breakRisk: "Format deviation is visible and immediate — must be earned through established credibility or explicit framing."
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

// ─── V3 Trust and Inversion Solver ──────────────────────────────────────────

interface ClassifiedConvention extends ConventionEntry {
  nature: ConventionNature
  action: ConventionStrategicAction
  trustImpact?: TrustImpactEvaluation
  classificationRationale: string
  challengeStrength: number
  objectiveServingReason: string
}

function evaluateTrustAndDetermineAction(
  conv: ConventionEntry,
  desiredPosition: string,
  trustRequirements: string[],
  objective: string
): {
  nature: ConventionNature
  action: ConventionStrategicAction
  trustImpact?: TrustImpactEvaluation
  classificationRationale: string
  challengeStrength: number
  objectiveServingReason: string
} {
  const posLow = desiredPosition.toLowerCase()

  // 1. Initial nature assignment
  let nature = conv.defaultNature

  // 2. Perform belief-based trust evaluation if mapping exists
  let trustImpact: TrustImpactEvaluation | undefined
  if (conv.trustRequirementMapping) {
    const mapping = conv.trustRequirementMapping
    // Check if the trust requirement matches
    const requirementMatch = trustRequirements.find(tr =>
      tr.toLowerCase().includes(mapping.requirement.toLowerCase()) ||
      mapping.requirement.toLowerCase().includes(tr.toLowerCase())
    )
    if (requirementMatch) {
      const evaluation = mapping.effectOnBelief(trustRequirements, desiredPosition)
      trustImpact = {
        requirement: mapping.requirement,
        audienceBelief: mapping.audienceBelief,
        conventionEffect: evaluation.effect,
        reasoning: evaluation.reasoning
      }
    }
  }

  // 3. Count position-based challenge signals
  const matchedSignals = conv.challengedBy.filter(signal => posLow.includes(signal.toLowerCase()))
  const challengeStrength = matchedSignals.length

  // Determine Action and Nature dynamically
  let action: ConventionStrategicAction = "KEEP"
  let classificationRationale = ""
  let objectiveServingReason = `Kept convention "${conv.id}" to maintain standard category recognition.`

  // Adjust nature and action based on trust impact
  if (trustImpact) {
    if (trustImpact.conventionEffect === "SUPPORTS") {
      // Trust-supporting: must preserve (override nature to SACRED and action to KEEP or BEND)
      nature = "SACRED"
      if (challengeStrength > 0) {
        action = "BEND"
        classificationRationale = `Protected trust capability: supports "${trustImpact.requirement}" belief. Because desired position challenges it, we BEND its formal expression rather than breaking it.`
        objectiveServingReason = `Bending "${conv.id}" preserves the critical trust code of "${trustImpact.requirement}" while satisfying the positioning objective "${objective}".`
      } else {
        action = "KEEP"
        classificationRationale = `Protected trust capability: supports "${trustImpact.requirement}" belief. Kept as-is.`
        objectiveServingReason = `Keeping "${conv.id}" preserves critical trust foundation.`
      }
    } else if (trustImpact.conventionEffect === "WEAKENS") {
      // Trust-weakening: target for breaking or bending
      nature = "HABIT"
      action = challengeStrength > 0 ? "BREAK" : "BEND"
      classificationRationale = `Targeted for disruption: convention actually WEAKENS the "${trustImpact.requirement}" belief. Position challenge strength is ${challengeStrength}.`
      objectiveServingReason = `${action === "BREAK" ? "Breaking" : "Bending"} "${conv.id}" directly removes a trust-weakening convention to serve the objective: "${objective}".`
    } else {
      // Neutral
      if (challengeStrength > 0) {
        action = "BREAK"
        classificationRationale = `Position-driven target: directly challenged by positioning intent ("${desiredPosition}").`
        objectiveServingReason = `Breaking "${conv.id}" creates pattern disruption to serve the objective: "${objective}".`
      } else {
        action = "KEEP"
        classificationRationale = `Standard category habit. Neutral trust impact.`
      }
    }
  } else {
    // No mapped trust requirement
    if (challengeStrength > 0) {
      if (nature === "SACRED") {
        action = "BEND"
        classificationRationale = `Structurally sacred convention challenged by position. We BEND it to satisfy both constraints.`
        objectiveServingReason = `Bending "${conv.id}" adapts structural code to serve the objective: "${objective}".`
      } else {
        action = "BREAK"
        classificationRationale = `Position-driven habit target: challenged by desired position.`
        objectiveServingReason = `Breaking "${conv.id}" creates pattern disruption to serve the objective: "${objective}".`
      }
    } else {
      action = nature === "SACRED" ? "KEEP" : "KEEP"
      classificationRationale = `Default category convention.`
    }
  }

  // Final safety checks: prevent invalid SACRED + BREAK combinations
  if (nature === "SACRED" && action === "BREAK") {
    action = "BEND"
    classificationRationale += " (Refactored to BEND because SACRED + BREAK is an invalid governance state.)"
    objectiveServingReason += " (Bended instead of broken to preserve safety limits.)"
  }

  return {
    nature,
    action,
    trustImpact,
    classificationRationale,
    challengeStrength,
    objectiveServingReason
  }
}

// ─── Strategic Inversion Synthesis ─────────────────────────────────────────

function synthesizeStrategicInversion(
  subject: string,
  objective: string,
  desiredPosition: string,
  audience: string,
  topConvention: ClassifiedConvention
): string {
  if (topConvention.challengeStrength === 0 && topConvention.action !== "BREAK") {
    return `No convention in this category is directly challenged by the stated position ("${desiredPosition}"). The recommended inversion for "${subject}" is structural: BEND "${topConvention.statement}" — the most widely copied habit in this category — to achieve pattern differentiation while preserving base usability.`
  }
  return `STRATEGIC INVERSION for "${subject}": The convention "${topConvention.statement}" is target for "${topConvention.action}" because it opposes desired position "${desiredPosition}" and has trust impact: ${topConvention.trustImpact?.conventionEffect ?? "NEUTRAL"}. Action details: replace [${topConvention.visualImplication}] with design language that actively signals "${desiredPosition}". Verbal implications: [${topConvention.verbalImplication}] → positioning language that encodes "${desiredPosition}" for ${audience}. Motion pacing implications: ${topConvention.motionImplication} → pacing that embodies the desired position. This directly serves the objective: "${objective}".`
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
  const classified: ClassifiedConvention[] = conventions.map(conv => {
    const evaluation = evaluateTrustAndDetermineAction(conv, desiredPosition, trustRequirements, objective)
    return {
      ...conv,
      ...evaluation
    }
  })

  // Step 3: Convention inventory
  const conventionInventory = classified.map((c, i) =>
    `${i + 1}. [${c.id}] "${c.statement}"\n   Why it exists: ${c.whyItExists}`
  ).join("\n\n")

  // Step 4: Nature and Action model evaluation
  const sacredVsHabitClassification = classified.map(c =>
    `[NATURE: ${c.nature}] [ACTION: ${c.action}] ${c.id}\n` +
    `Statement: ${c.statement}\n` +
    `Rationale: ${c.classificationRationale}\n` +
    (c.trustImpact
      ? `Trust Impact Evaluation:\n` +
        `  Requirement: ${c.trustImpact.requirement}\n` +
        `  Audience Belief: ${c.trustImpact.audienceBelief}\n` +
        `  Convention Effect: ${c.trustImpact.conventionEffect}\n` +
        `  Trust Reasoning: ${c.trustImpact.reasoning}`
      : "Trust Impact: NONE")
  ).join("\n\n---\n\n")

  // Step 5: Break candidates (habits and bended conventions sorted by challenge strength desc)
  const actionables = classified
    .filter(c => c.action === "BREAK" || c.action === "BEND")
    .sort((a, b) => b.challengeStrength - a.challengeStrength)

  const breakCandidates = actionables.map((c, i) => ({
    candidateIndex: i + 1,
    conventionId: c.id,
    convention: c.statement,
    action: c.action,
    proposedBreak: `${c.action === "BREAK" ? "Abandon" : "Bend"} convention "${c.id}" — replace [${c.visualImplication}] with design language that directly signals "${desiredPosition}" for ${audience}.`,
    strategicValue: c.challengeStrength > 0
      ? `POSITION-DRIVEN (strength: ${c.challengeStrength}): Directly aligned with desired position "${desiredPosition}". ${c.verbalImplication} must be replaced.`
      : `PATTERN-BREAK (strength: 0): Not position-driven but achieves category differentiation by abandoning the most-copied habit.`,
    breakRisk: c.breakRisk,
    challengeStrength: c.challengeStrength,
    objectiveLink: c.objectiveServingReason
  }))

  const breakCandidatesOutput = breakCandidates.map(b =>
    `#${b.candidateIndex} [${b.conventionId}] action:${b.action} challenge-strength:${b.challengeStrength}\n` +
    `Convention: ${b.convention}\n` +
    `Proposed action: ${b.proposedBreak}\n` +
    `Strategic value: ${b.strategicValue}\n` +
    `Objective link: ${b.objectiveLink}\n` +
    `Break risk: ${b.breakRisk}`
  ).join("\n\n---\n\n")

  // Category recognition signals preserved (KEEP and BEND conventions)
  const preserved = classified.filter(c => c.action === "KEEP" || c.action === "BEND")
  const categorySignalsPreserved = preserved.map(c =>
    `PRESERVE/ADAPT [${c.id}] (Action: ${c.action}): ${c.statement}\n` +
    `Visual: ${c.visualImplication}\n` +
    `Verbal: ${c.verbalImplication}`
  ).join("\n\n")

  // Top action for synthesis
  const topActionable = actionables[0]

  // Visual, verbal, motion implications
  const visualImplications = actionables.slice(0, 2).map(c =>
    `[${c.id}]: ${c.action === "BREAK" ? "Abandon" : "Bend"} "${c.visualImplication}". Signal "${desiredPosition}" through visual language that directly encodes the positioning intent.`
  ).join("\n\n")

  const verbalImplications = actionables.slice(0, 2).map(c =>
    `[${c.id}]: Replace "${c.verbalImplication}" with language that encodes "${desiredPosition}" for ${audience}.`
  ).join("\n\n")

  const motionImplications = topActionable
    ? `[${topActionable.id}]: ${topActionable.action === "BREAK" ? "Abandon" : "Bend"} "${topActionable.motionImplication}". Motion pacing must actively signal "${desiredPosition}" — ` +
      (desiredPosition.toLowerCase().includes("decisive") || desiredPosition.toLowerCase().includes("operational")
        ? "faster, more decisive cuts and confident state transitions"
        : desiredPosition.toLowerCase().includes("premium") || desiredPosition.toLowerCase().includes("quiet") || desiredPosition.toLowerCase().includes("calm")
          ? "slower, more deliberate pacing with intentional stillness"
          : desiredPosition.toLowerCase().includes("energi") || desiredPosition.toLowerCase().includes("youth") || desiredPosition.toLowerCase().includes("activist")
            ? "energetic, rhythmic editing — motion that carries cultural forward-motion"
            : "motion calibrated to the desired audience response rather than the category default")
    : "No motion implications — no conventions are being disrupted."

  // Failure risks
  const failureRisks = [
    ...actionables.slice(0, 2).map(c => c.breakRisk),
    preserved.filter(c => c.nature === "SACRED").length > 0
      ? `If breaking a habit convention accidentally erodes a SACRED convention (${preserved.filter(c => c.nature === "SACRED").map(s => s.id).join(", ")}), audience trust will be irreparably damaged. Confirm all trust codes are preserved.`
      : null
  ].filter(Boolean).join("\n\n")

  // Proposed validation test
  const proposedValidationTest = topActionable
    ? `Five-second validation: Show the proposed creative work to one evaluator matching "${audience}" WITHOUT brand context. Ask: "What position does this work occupy in its category?" The answer must include language from "${desiredPosition}" — NOT standard category language. If the evaluator describes the work using conventional category language [${actionables.slice(0, 2).map(c => c.id).join(", ")}], the strategic inversion has not landed.`
    : `Validation: Confirm the work is legibly positioned in its category AND meaningfully distinct from the three closest category competitors.`

  // Strategic inversion
  const strategicInversion = topActionable
    ? synthesizeStrategicInversion(subject, objective, desiredPosition, audience, topActionable)
    : `No high-confidence strategic inversion identified for "${subject}" with position "${desiredPosition}". Proceed with quality-based differentiation within category conventions.`

  // Deterministic fingerprints (corrected fingerprint nomenclature)
  const inputFingerprint = `SRB:cat=${category}:pos=${desiredPosition.slice(0, 40)}:trust=${trustRequirements.join("|").slice(0, 40)}`
  const outputFingerprint = `SRB:actions=${classified.map(c => `${c.id}=${c.action}`).join("|")}:natures=${classified.map(c => `${c.id}=${c.nature}`).join("|")}`

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
    gateId: "srb.trust-requirement-reasoned",
    label: "Trust Requirement Reasoned",
    description: "Each trust requirement must map to an audience belief, evaluate the convention effect, and avoid marking a convention SACRED solely by keyword association.",
    passCriteria: [
      "No convention is marked SACRED solely by keyword matching without belief evaluation.",
      "Each mapped trust requirement is reasoned in the classification output."
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const classification = result.rawOutputs.sacredVsHabitClassification ?? ""
      const hasReasoning = classification.includes("Trust Impact Evaluation:") || classification.includes("Trust Reasoning:")
      // Ensure price opacity isn't automatically SACRED
      const priceOpacityLines = classification.split("\n").filter(l => l.includes("price-opacity"))
      const priceOpacitySacred = priceOpacityLines.some(l => l.includes("[NATURE: SACRED]"))
      const passed = hasReasoning && !priceOpacitySacred
      return {
        gateId: "srb.trust-requirement-reasoned",
        label: "Trust Requirement Reasoned",
        passed,
        failReasons: passed ? [] : [
          !hasReasoning ? "No trust impact evaluation or reasoning was found in classification outputs." : "",
          priceOpacitySacred ? "price-opacity was marked as SACRED, violating belief-based trust rules." : ""
        ].filter(Boolean)
      }
    }
  },
  {
    gateId: "srb.action-model-valid",
    label: "Action Model Valid",
    description: "Each convention has NATURE and ACTION. At least one is KEEP or BEND. Not all are BREAK. Invalid SACRED + BREAK is rejected.",
    passCriteria: [
      "Every convention has NATURE and ACTION mapped.",
      "No SACRED + BREAK combinations exist.",
      "Not all conventions are BREAK."
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const classification = result.rawOutputs.sacredVsHabitClassification ?? ""
      const hasNatureAndAction = classification.includes("[NATURE:") && classification.includes("[ACTION:")
      const hasSacredBreak = classification.includes("[NATURE: SACRED] [ACTION: BREAK]")
      const entries = classification.split("---")
      const allBreak = entries.length > 0 && entries.every(e => e.includes("[ACTION: BREAK]"))
      const passed = hasNatureAndAction && !hasSacredBreak && !allBreak
      return {
        gateId: "srb.action-model-valid",
        label: "Action Model Valid",
        passed,
        failReasons: passed ? [] : [
          !hasNatureAndAction ? "One or more conventions lack nature or action label mappings." : "",
          hasSacredBreak ? "Invalid governance combination found: SACRED + BREAK." : "",
          allBreak ? "All conventions are set to BREAK, eroding usability and category recognition." : ""
        ].filter(Boolean)
      }
    }
  },
  {
    gateId: "srb.category-recognition-preserved",
    label: "Category Recognition Preserved",
    description: "Category/functional signals remain. Differentiation does not destroy usability, trust, or recognition.",
    passCriteria: [
      "categorySignalsPreserved contains at least one preserved or bended convention"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const preserved = result.rawOutputs.categorySignalsPreserved ?? ""
      const passed = preserved.includes("PRESERVE/ADAPT") && preserved.length > 20
      return {
        gateId: "srb.category-recognition-preserved",
        label: "Category Recognition Preserved",
        passed,
        failReasons: passed ? [] : ["Category signals preserved output is empty or lacks preserved/adapted elements."]
      }
    }
  },
  {
    gateId: "srb.objective-link-explicit",
    label: "Objective Link Explicit",
    description: "All BREAK/BEND decisions explicitly state how they serve the project objective.",
    passCriteria: [
      "breakCandidates must explicitly link actions to the objective"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const candidates = result.rawOutputs.breakCandidates ?? ""
      const passed = candidates.includes("Objective link:") && candidates.length > 50
      return {
        gateId: "srb.objective-link-explicit",
        label: "Objective Link Explicit",
        passed,
        failReasons: passed ? [] : ["Break candidates are missing explicit objective links or are too short."]
      }
    }
  },
  {
    gateId: "srb.scalable-beyond-single-visual",
    label: "Scalable Beyond Single Visual",
    description: "Strategic inversions must affect multiple surface types (verbal, visual, motion, etc.) to ensure system scaling.",
    passCriteria: [
      "visualImplications and verbalImplications must be non-empty",
      "motionImplications must not be default/empty"
    ],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const visual = result.rawOutputs.visualImplications ?? ""
      const verbal = result.rawOutputs.verbalImplications ?? ""
      const motion = result.rawOutputs.motionImplications ?? ""
      const passed = visual.length > 20 && verbal.length > 20 && !motion.includes("No motion implications")
      return {
        gateId: "srb.scalable-beyond-single-visual",
        label: "Scalable Beyond Single Visual",
        passed,
        failReasons: passed ? [] : ["System implications on visual, verbal, or motion surfaces are missing or default."]
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
