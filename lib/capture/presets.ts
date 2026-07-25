// ─────────────────────────────────────────────────────────────
// Demo & Capture Bridge — Presets
// ─────────────────────────────────────────────────────────────

import type { CaptureScene } from "./types"

// ─────────────────────────────────────────────────────────────
// 1. EVIDENCE DECISION (Main Scenario)
// ─────────────────────────────────────────────────────────────
export const evidenceDecisionScene: CaptureScene = {
  id: "evidence-decision",
  label: "Evidence Decision",
  description: "Traces verification gate checks. Illustrates how excluding the critical rollback verification log triggers a HOLD status.",
  route: "/decisions",
  status: "active",
  viewport: "desktop",
  aspectRatio: "16:9",
  fps: 30,
  duration: 10,
  chromeMode: "full",
  safeArea: "off",
  signatureStateId: "decision-hold",
  fallbackStateId: "baseline",
  notes: "Demonstrates that coverage score alone is insufficient when a critical evidence file is missing.",
  limitations: [
    "Simulates validation logic. Does not connect to live deployment environments."
  ],
  states: [
    {
      id: "baseline",
      label: "Baseline / Initial State",
      description: "Pipeline passes checks. Decision Gate displays PROCEED.",
      time: 0.0,
      frame: 0,
      stateType: "setup",
      isCapturePoint: true,
      notes: "Telemetry values conform to default ranges."
    },
    {
      id: "evidence-selected",
      label: "Evidence Selected",
      description: "Inspector highlights the pipeline rollback log.",
      time: 2.5,
      frame: 75,
      stateType: "evidence",
      isCapturePoint: false,
      notes: "Selecting a ledger row focuses its evaluation parameters."
    },
    {
      id: "evidence-excluded",
      label: "Evidence Excluded",
      description: "Rollback log file is manually excluded from ledger.",
      time: 5.0,
      frame: 150,
      stateType: "intermediate",
      isCapturePoint: true,
      notes: "Toggling exclude disables verification check for that item."
    },
    {
      id: "decision-hold",
      label: "Decision HOLD State",
      description: "System updates Gate to HOLD due to missing rollback verification.",
      time: 7.5,
      frame: 225,
      stateType: "signature",
      isCapturePoint: true,
      notes: "The primary signature frame. Shows gate outcome transitioning cleanly.",
      expectedVisualResult: "Decision Gate turns amber with 'HOLD — CRITICAL EVIDENCE MISSING'."
    },
    {
      id: "trace-explained",
      label: "Trace Explained",
      description: "Execution trace logs are displayed in full layout.",
      time: 9.0,
      frame: 270,
      stateType: "result",
      isCapturePoint: true,
      notes: "Logs highlight which specific rule block became unresolved."
    },
    {
      id: "reset",
      label: "Reset Verification State",
      description: "Provider state is reset. Gate returns to baseline.",
      time: 10.0,
      frame: 300,
      stateType: "fallback",
      isCapturePoint: false
    }
  ],
  steps: [
    {
      id: "step-1",
      order: 1,
      action: "load",
      target: "/decisions",
      trigger: "Initial page load",
      duration: 1.0,
      resultingStateId: "baseline",
      expectedValidation: "Outcome shows PROCEED"
    },
    {
      id: "step-2",
      order: 2,
      action: "select",
      target: "evidence-ledger-row[rollback]",
      trigger: "Click rollback log row",
      duration: 1.5,
      resultingStateId: "evidence-selected"
    },
    {
      id: "step-3",
      order: 3,
      action: "exclude",
      target: "rollback-simulation-evidence",
      trigger: "Click Exclude button",
      duration: 2.5,
      resultingStateId: "evidence-excluded"
    },
    {
      id: "step-4",
      order: 4,
      action: "capture",
      target: "decision-gate",
      trigger: "Verify HOLD status",
      duration: 2.5,
      resultingStateId: "decision-hold",
      expectedValidation: "HOLD outcomes displayed"
    },
    {
      id: "step-5",
      order: 5,
      action: "toggle",
      target: "decision-trace-panel",
      trigger: "Click Show Full Execution Trace",
      duration: 1.5,
      resultingStateId: "trace-explained"
    },
    {
      id: "step-6",
      order: 6,
      action: "reset",
      target: "reset-scenarios-button",
      trigger: "Click Reset button",
      duration: 1.0,
      resultingStateId: "reset"
    }
  ]
}

// ─────────────────────────────────────────────────────────────
// 2. PRODUCT REVEAL
// ─────────────────────────────────────────────────────────────
export const productRevealScene: CaptureScene = {
  id: "product-reveal",
  label: "Product Reveal",
  description: "A chronological walkthrough of the core product landing animation reveal steps.",
  route: "/player",
  status: "active",
  viewport: "laptop",
  aspectRatio: "16:9",
  fps: 30,
  duration: 8,
  chromeMode: "minimal",
  safeArea: "off",
  signatureStateId: "primary-interaction",
  fallbackStateId: "blank-stage",
  notes: "Focuses on landing aesthetics presentation.",
  states: [
    {
      id: "blank-stage",
      label: "Blank Stage",
      description: "Empty canvas establishes layout limits.",
      time: 0.0,
      frame: 0,
      stateType: "setup",
      isCapturePoint: true
    },
    {
      id: "interface-enters",
      label: "Interface Enters",
      description: "Dashboard layout components slide into view.",
      time: 2.0,
      frame: 60,
      stateType: "intermediate",
      isCapturePoint: true
    },
    {
      id: "primary-interaction",
      label: "Primary Interaction",
      description: "Key product interaction occurs.",
      time: 4.0,
      frame: 120,
      stateType: "signature",
      isCapturePoint: true,
      notes: "Highlights visual transitions."
    },
    {
      id: "result-state",
      label: "Result State",
      description: "Outcome values are displayed.",
      time: 6.0,
      frame: 180,
      stateType: "result",
      isCapturePoint: true
    },
    {
      id: "final-hold",
      label: "Final Frame Hold",
      description: "Interaction sequence completes.",
      time: 8.0,
      frame: 240,
      stateType: "fallback",
      isCapturePoint: false
    }
  ],
  steps: [
    {
      id: "pr-step-1",
      order: 1,
      action: "load",
      target: "/player?preset=product-reveal",
      trigger: "URL parameter trigger",
      duration: 2.0,
      resultingStateId: "blank-stage"
    },
    {
      id: "pr-step-2",
      order: 2,
      action: "wait",
      target: "landing-layout",
      trigger: "Component mounting complete",
      duration: 2.0,
      resultingStateId: "interface-enters"
    },
    {
      id: "pr-step-3",
      order: 3,
      action: "click",
      target: "primary-action-btn",
      trigger: "Trigger click event",
      duration: 2.0,
      resultingStateId: "primary-interaction"
    },
    {
      id: "pr-step-4",
      order: 4,
      action: "capture",
      target: "result-card",
      trigger: "Save screenshot snapshot",
      duration: 2.0,
      resultingStateId: "result-state"
    }
  ]
}

// ─────────────────────────────────────────────────────────────
// 3. BROADCAST RESULT
// ─────────────────────────────────────────────────────────────
export const broadcastResultScene: CaptureScene = {
  id: "broadcast-result",
  label: "Broadcast Result",
  description: "Captures Lower Third overlays transitions on live stream streams.",
  route: "/player?preset=broadcast-cue",
  status: "active",
  viewport: "broadcast",
  aspectRatio: "16:9",
  fps: 30,
  duration: 8,
  chromeMode: "hidden",
  safeArea: "broadcast",
  signatureStateId: "lower-third",
  fallbackStateId: "standby",
  notes: "Checks action-safe and title-safe zones placement.",
  states: [
    {
      id: "standby",
      label: "Standby Monitor",
      description: "Pre-live state display.",
      time: 0.0,
      frame: 0,
      stateType: "setup",
      isCapturePoint: false
    },
    {
      id: "live",
      label: "On-Air Feed Active",
      description: "Stream feed is active.",
      time: 2.0,
      frame: 60,
      stateType: "intermediate",
      isCapturePoint: true
    },
    {
      id: "event",
      label: "Event Marked",
      description: "Live marker highlights timestamp.",
      time: 4.0,
      frame: 120,
      stateType: "intermediate",
      isCapturePoint: false
    },
    {
      id: "lower-third",
      label: "Lower Third Overlay",
      description: "Result caption overlay appears at bottom.",
      time: 6.0,
      frame: 180,
      stateType: "signature",
      isCapturePoint: true,
      notes: "Must remain fully inside safety lines."
    },
    {
      id: "clean-final-frame",
      label: "Clean Final Frame",
      description: "Chrome hidden for final capture.",
      time: 8.0,
      frame: 240,
      stateType: "result",
      isCapturePoint: true
    }
  ],
  steps: [
    {
      id: "bc-step-1",
      order: 1,
      action: "load",
      target: "/player?preset=broadcast-cue",
      trigger: "Launch workbench feed",
      duration: 2.0,
      resultingStateId: "standby"
    },
    {
      id: "bc-step-2",
      order: 2,
      action: "toggle",
      target: "broadcast-feed-on",
      trigger: "Click Go Live button",
      duration: 2.0,
      resultingStateId: "live"
    },
    {
      id: "bc-step-3",
      order: 3,
      action: "click",
      target: "mark-cue-btn",
      trigger: "Record incident trigger",
      duration: 2.0,
      resultingStateId: "event"
    },
    {
      id: "bc-step-4",
      order: 4,
      action: "capture",
      target: "lower-third-overlay",
      trigger: "Verify captions text length",
      duration: 2.0,
      resultingStateId: "lower-third"
    }
  ]
}

export const capturePresets = {
  evidenceDecision: evidenceDecisionScene,
  productReveal: productRevealScene,
  broadcastResult: broadcastResultScene,
} as const
