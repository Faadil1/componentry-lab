// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Export Formatters
// ─────────────────────────────────────────────────────────────

import type { ProjectBrain } from "./types"

// ── 1. PROJECT BRAIN PACKET (Full Context) ────────────────────
export function formatProjectBrainMarkdown(project: ProjectBrain): string {
  return `# Project Brain: ${project.title}
## Identity
- **ID**: ${project.id}
- **Slug**: ${project.slug}
- **Kind**: ${project.kind}
- **Status**: ${project.status}
- **Priority**: ${project.priority}
- **Memory Hook**: "${project.memoryHook}"
- **Judge Memory Sentence**: "${project.judgeMemorySentence || ""}"

## Context
- **Problem**: ${project.problem}
- **Target Audience**: ${project.audience}
- **Success Definition**: ${project.successDefinition}

## Decisions Count: ${project.decisions.length}
## Evidence Count: ${project.evidence.length}
## Risks Count: ${project.risks.length}
`
}

// ── 2. AGENT HANDOFF PACKET (Claude Code / Antigravity) ───────
export function formatAgentPacketMarkdown(project: ProjectBrain): string {
  const activeDecisions = project.decisions
    .filter((d) => d.status === "approved")
    .map((d) => `- [${d.id}] ${d.label}: ${d.description}`)
    .join("\n")

  const openRisks = project.risks
    .filter((r) => r.status === "open")
    .map((r) => `- [${r.id}] ${r.label}: ${r.description}`)
    .join("\n")

  const expectedOutputs = project.outputs
    .map((o) => `- [${o.id}] ${o.label} (${o.format}) - Status: ${o.status}`)
    .join("\n")

  return `# AGENT WORKSPACE HANDOFF PACKET
## Objective
Maintain the exact state and decisions of the project "${project.title}" (${project.kind}).

## Current Context
- **Current Phase**: ${project.status}
- **Memory Hook**: ${project.memoryHook}

## Validated Decisions
${activeDecisions || "No validated decisions."}

## Constraints
${project.constraints.map((c) => `- [${c.type}] ${c.description}`).join("\n") || "No constraints specified."}

## Selected Systems (Registry & Playbooks)
- **Registry components**: ${project.selectedRegistryIds.join(", ") || "None"}
- **Playbooks**: ${project.selectedPlaybookIds.join(", ") || "None"}
- **Recipe**: ${project.selectedRecipeIds.join(", ") || "None"}

## Open Risks
${openRisks || "No open risks."}

## Expected Outputs
${expectedOutputs || "No outputs declared."}
`
}

// ── 3. DESIGN PACKET ──────────────────────────────────────────
export function formatDesignPacketMarkdown(project: ProjectBrain): string {
  return `# DESIGN DIRECTION PACKET
- **Project**: ${project.title}
- **Target Audience**: ${project.audience}
- **Tension**: ${project.tension}
- **Memory Hook**: ${project.memoryHook}

## Visual Identity
- **Visual Direction Summary**: ${project.visualDirection}
- **Typography Direction**: ${project.typographyDirection}
- **Color Scheme**: ${project.colorDirection}
- **Layout Strategy**: ${project.layoutDirection}
- **Interaction Principles**: ${project.interactionDirection}
- **Responsive Plan**: ${project.responsiveStrategy}
- **Accessibility Plan**: ${project.accessibilityStrategy}

## Rejected Directions
${project.rejectedDirections.map((d) => `- ${d}`).join("\n") || "None rejected."}
`
}

// ── 4. BUILD BLUEPRINT PACKET ─────────────────────────────────
export function formatBuildPacketMarkdown(project: ProjectBrain): string {
  return `# BUILD & ARCHITECTURE BLUEPRINT
- **Project**: ${project.title}
- **Kind**: ${project.kind}

## Architecture
- **Architecture Notes**: ${project.architectureNotes}
- **Selected Components**: ${project.selectedRegistryIds.join(", ") || "None"}
- **Implementation Constraints**:
${project.implementationConstraints.map((c) => `- ${c}`).join("\n") || "None"}

## Proof Requirements
- **Primary Claim**: ${project.primaryClaim}
- **Proof Moment UI**: ${project.proofMoment}
- **Technical Proof**: ${project.technicalProof}
- **Failure Mode**: ${project.failureMode}
- **Fallback**: ${project.fallback}

## Acceptance Criteria
${project.acceptanceCriteria.map((a) => `- ${a}`).join("\n") || "None"}
`
}

// ── 5. CAPTURE PACKET ─────────────────────────────────────────
export function formatCapturePacketMarkdown(project: ProjectBrain): string {
  const states = project.capturePlan.states
    .map((s) => `- **[${s.id}]** ${s.label} at frame ${s.frame} (${s.time}s) -> Expected: ${s.expectedVisualResult || "Not set"}`)
    .join("\n")

  return `# CAPTURE BRIDGE CONFIGURATION
- **Project**: ${project.title}
- **Signature State**: ${project.signatureStateId || "None"} (Frame: ${project.signatureFrame})
- **Hero Demo Moment**: ${project.heroDemoMoment}
- **Clean View Route**: ${project.cleanViewRoute}

## Capture States Timeline
${states || "No capture states defined."}

## Capture Limitations
${project.captureLimitations.map((l) => `- ${l}`).join("\n") || "None"}
`
}

// ── 6. VIDEO PACKET ───────────────────────────────────────────
export function formatVideoPacketMarkdown(project: ProjectBrain): string {
  const shots = project.videoPlan.shots
    .map((s) => `### Shot ${s.order}: ${s.label} (${s.duration}s)
- **State**: ${s.captureState}
- **Action**: ${s.screenAction}
- **Overlay Text**: ${s.overlay}
- **Voiceover script**: "${s.voiceover}"
- **Proof shown**: ${s.proofShown}`)
    .join("\n\n")

  return `# VIDEO DEMO SCRIPT OUTLINE
- **Project**: ${project.title}
- **Purpose**: ${project.videoPlan.purpose}
- **Target Video Duration**: ${project.videoPlan.durationSeconds}s
- **Formats**: ${project.videoPlan.formats.join(", ")}
- **Voiceover Direction**: ${project.videoPlan.voiceover}
- **CTA**: ${project.videoPlan.cta}

## Shot List
${shots || "No shots defined."}
`
}

// ── 7. SUBMISSION PACKET ──────────────────────────────────────
export function formatSubmissionPacketMarkdown(project: ProjectBrain): string {
  return `# SUBMISSION PACKET
- **Title**: ${project.title}
- **Tagline**: ${project.oneLineSummary || project.description}
- **Category Claim**: ${project.categoryClaim}
- **Memory Hook**: ${project.memoryHook}

## Pitch Description
${project.description}

## Proof & Evidence
- **Primary Technical Proof**: ${project.technicalProof}
- **Verifiable Claim**: ${project.primaryClaim}

## Readiness Check
- **Score**: ${project.readiness}%
- **Gate Status**: Publication: ${project.publicationGate ? "PASSED" : "HOLD"} | Submission: ${project.submissionGate ? "PASSED" : "HOLD"}
- **Active Blockers**:
${project.blockers.map((b) => `- ${b}`).join("\n") || "- None"}
`
}
