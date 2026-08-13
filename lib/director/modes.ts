import type { CreativeProjectModeState, CreativeProjectMode } from "./types"

export const CREATIVE_PROJECT_MODES: CreativeProjectMode[] = ["DAY_CHALLENGE", "HACKATHON", "MARA", "DATA_STORY"]

export const MODE_STATES: Record<CreativeProjectMode, CreativeProjectModeState> = {
  DAY_CHALLENGE: {
    mode: "DAY_CHALLENGE",
    phasePolicy: ["intake", "clarify", "route", "build", "verify", "review"],
    evaluator: {
      evaluatorType: "audience",
      decisionTheyMustMake: "Can this daily slice be understood and trusted immediately?",
      whatTheyNeedToUnderstand: ["the problem", "the one-day scope", "the visible proof"],
      whatTheyNeedToBelieve: ["the slice is complete enough to stand alone"],
      requiredProof: ["clear outcome", "visible accountability", "bounded scope"],
      memorySentence: "The one-day slice makes accountability visible.",
    },
    expectedProof: ["visible accountability", "one-day completion", "bounded proof"],
    prohibitedFallbacks: ["generic social content", "open-ended exploration"],
    completionCriteria: ["one accepted outcome", "proof visible", "scope remains tight"],
  },
  HACKATHON: {
    mode: "HACKATHON",
    phasePolicy: ["intake", "clarify", "route", "build", "verify", "submit"],
    evaluator: {
      evaluatorType: "judge",
      decisionTheyMustMake: "Is the submission judge-ready?",
      whatTheyNeedToUnderstand: ["the claim", "the evidence", "the demo path"],
      whatTheyNeedToBelieve: ["the project is submission-ready"],
      requiredProof: ["judge clarity", "submission bundle", "technical proof"],
      memorySentence: "The judge path stays explicit and visible.",
    },
    expectedProof: ["submission gate", "judge path", "demo path"],
    prohibitedFallbacks: ["generic workflow", "social-media fallback"],
    completionCriteria: ["submission package approved", "demo path complete"],
  },
  MARA: {
    mode: "MARA",
    phasePolicy: ["intake", "clarify", "route", "build", "review", "reflect"],
    evaluator: {
      evaluatorType: "stakeholder",
      decisionTheyMustMake: "Does the narrative remain coherent across the episode?",
      whatTheyNeedToUnderstand: ["continuity", "constraint handling", "unresolved thread"],
      whatTheyNeedToBelieve: ["the arc is consistent"],
      requiredProof: ["episode coherence", "no generic fallback", "continuity evidence"],
      memorySentence: "Narrative continuity stays intact across the episode.",
    },
    expectedProof: ["continuity", "character constraint handling", "episode-level thread"],
    prohibitedFallbacks: ["generic motivational content", "single-scene simplification"],
    completionCriteria: ["thread remains unresolved but coherent", "episode logic is intact"],
  },
  DATA_STORY: {
    mode: "DATA_STORY",
    phasePolicy: ["intake", "clarify", "route", "build", "verify", "publish"],
    evaluator: {
      evaluatorType: "client",
      decisionTheyMustMake: "Can a stakeholder act on the evidence?",
      whatTheyNeedToUnderstand: ["the metric", "the change", "the business implication"],
      whatTheyNeedToBelieve: ["the data supports the claim"],
      requiredProof: ["metric evidence", "visual explanation", "stakeholder decision"],
      memorySentence: "The evidence explains the decision clearly.",
    },
    expectedProof: ["metric evidence", "visual explanation", "stakeholder decision"],
    prohibitedFallbacks: ["film-only phase assumptions", "generic storytelling"],
    completionCriteria: ["decision supported", "claim verified", "visual proof clear"],
  },
}

export function resolveModeState(mode: CreativeProjectMode): CreativeProjectModeState {
  return MODE_STATES[mode]
}
