// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Recommendation Engine (Pure logic)
// ─────────────────────────────────────────────────────────────

import type { ProjectBrain, ProjectRecommendation } from "./types"

export function getRecommendedRecipes(project: ProjectBrain): ProjectRecommendation[] {
  const recommendations: ProjectRecommendation[] = []

  if (project.kind === "product-prototype" || project.kind === "internal-tool") {
    recommendations.push({
      id: "rec_recipe_workspace",
      targetType: "recipe",
      targetId: "operational-workspace-recipe",
      confidence: "strong-match",
      reasons: [
        `Recommended because the project kind is '${project.kind}'.`,
        "Evidence-driven decision tracing is vital for auditability.",
        "Requires secure, state-managed internal dashboard layout."
      ],
      matchedCriteria: ["kind=product-prototype|internal-tool", "decision-ledgers-required"],
      missingInformation: [],
      limitations: ["Desktop optimized. Requires custom viewports adjustments for mobile."]
    })
  }

  if (project.kind === "client-product") {
    recommendations.push({
      id: "rec_recipe_launch",
      targetType: "recipe",
      targetId: "product-launch-recipe",
      confidence: "strong-match",
      reasons: [
        `Recommended because the project kind is '${project.kind}'.`,
        "Focuses on premium customer intake and presentation flow.",
        "Integrates typography and visual hierarchy rules natively."
      ],
      matchedCriteria: ["kind=client-product", "customer-facing"],
      missingInformation: [],
      limitations: ["Assumes clear CTA and linear presentation steps."]
    })
  }

  if (project.kind === "creative-experiment" || project.kind === "data-story") {
    recommendations.push({
      id: "rec_recipe_story",
      targetType: "recipe",
      targetId: "data-story-recipe",
      confidence: "strong-match",
      reasons: [
        `Recommended because the project kind is '${project.kind}'.`,
        "Interactive editorial comparison timeline matches experimental music/data flows.",
        "Emphasizes visual explanation and interactive toggles."
      ],
      matchedCriteria: ["kind=creative-experiment|data-story", "visual-proof"],
      missingInformation: [],
      limitations: ["High graphics density might hit frame limits on low-end mobile devices."]
    })
  }

  return recommendations
}

export function getRecommendedPlaybooks(project: ProjectBrain): ProjectRecommendation[] {
  const recommendations: ProjectRecommendation[] = []

  // Check matching criteria based on constraints, claims, status
  if (project.status === "building" || project.status === "designing") {
    recommendations.push({
      id: "rec_pb_polish",
      targetType: "playbook",
      targetId: "hackathon-ui-polish",
      confidence: "strong-match",
      reasons: [
        "Your project is in the active building or designing status.",
        "UI polish is mandatory before finalizing screenshots and demo recordings."
      ],
      matchedCriteria: ["status=building|designing"],
      missingInformation: [],
      limitations: ["Must follow working happy path — do not apply before basic functionality works."]
    })
  }

  if (project.primaryClaim) {
    recommendations.push({
      id: "rec_pb_proof",
      targetType: "playbook",
      targetId: "proof-moment-pattern",
      confidence: "strong-match",
      reasons: [
        "Your project defines a primary claim requiring technical proof.",
        "Documents the standard input -> action -> verdict -> receipt flow."
      ],
      matchedCriteria: ["has_primary_claim=true"],
      missingInformation: [],
      limitations: ["Requires real technical output to display — not for simulated results."]
    })
  }

  if (project.kind === "creative-experiment") {
    recommendations.push({
      id: "rec_pb_risk",
      targetType: "playbook",
      targetId: "controlled-visual-risk",
      confidence: "useful-match",
      reasons: [
        "Creative experiments benefit from signature design choices.",
        "Defines safe, bold, and signature risk levels to make your project memorable."
      ],
      matchedCriteria: ["kind=creative-experiment"],
      missingInformation: [],
      limitations: ["Must control the risk budget — choose max 1-3 areas of boldness."]
    })
  }

  return recommendations
}

export function getRecommendedRegistryEntries(project: ProjectBrain): ProjectRecommendation[] {
  const recommendations: ProjectRecommendation[] = []

  if (project.videoPlan && project.videoPlan.shots.length > 0) {
    recommendations.push({
      id: "rec_reg_capture",
      targetType: "registry",
      targetId: "capture-bridge",
      confidence: "strong-match",
      reasons: [
        "Your project contains a structured video plan and capture states.",
        "Enables deterministic capture triggers for stable video production."
      ],
      matchedCriteria: ["has_video_shots=true"],
      missingInformation: [],
      limitations: ["Capture positions must be pre-scripted for automated CLI runs."]
    })
  }

  if (project.decisions.length > 0) {
    recommendations.push({
      id: "rec_reg_decision",
      targetType: "registry",
      targetId: "decision-systems",
      confidence: "strong-match",
      reasons: [
        "Your project manages multiple decisions and audit logs.",
        "Allows linking signals to rules and outputs trace logs."
      ],
      matchedCriteria: ["decisions_count>0"],
      missingInformation: [],
      limitations: ["Requires clean data taxonomy layout."]
    })
  }

  return recommendations
}

export function getRecommendedNextPhase(): ProjectRecommendation[] {
  // Phase recommendations are now exclusively governed by the Creative Director.
  // We return an empty array to ensure Supporting Recommendations acts purely as guidance.
  return []
}

export function getAllRecommendations(project: ProjectBrain): ProjectRecommendation[] {
  return [
    ...getRecommendedRecipes(project),
    ...getRecommendedPlaybooks(project),
    ...getRecommendedRegistryEntries(project)
  ]
}
