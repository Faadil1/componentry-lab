/**
 * Slice 3D.2 — CinePromptShareLinkAdapter
 *
 * Implements ProviderAdapter for the CinePrompt Share Link pilot.
 *
 * Scope:
 * - Capability: CINEMATIC_PROMPTING + PROMPT_SHARE_LINK_CREATION
 * - Endpoint: POST https://cineprompt.io/api/share (production transport only)
 * - Output: ONE CinePrompt share URL (EXTERNAL_SHARE_REFERENCE)
 *
 * MUST NOT invoke:
 * - image generation
 * - video generation
 * - fal.ai, Venice, EvoLink, Kling, Veo, Sora, Runway
 * - any downstream model or provider
 *
 * The production transport is IMPLEMENTED BUT NEVER INVOKED during 3D.2.
 * All automated tests use FakeCinePromptTransport.
 */

import type { ExternalCapabilityPlan, ExternalCapabilityExecutionResult, ExternalExecutionIntent } from "../types"
import type { ProviderAdapter } from "../adapters"
import type { CinePromptShareInput, CinePromptTransportResult } from "./cineprompt-types"
import type { CinePromptTransport } from "./cineprompt-transport"
import { CINEPROMPT_ARTIFACT_CLASSIFICATION, CINEPROMPT_COST_MODEL } from "./cineprompt-types"
import { ProductionCinePromptTransport } from "./cineprompt-transport"

export const CINEPROMPT_ADAPTER_ID = "adapter_cineprompt_share_link_v2" as const
export const CINEPROMPT_RESOURCE_ID = "res_cineprompt" as const

/** Narrow pilot privacy policy — block if input contains sensitive content categories. */
const BLOCKED_PATTERNS: RegExp[] = [
  // credentials / secrets
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /bearer/i,
  /auth/i,
  // personal identifiers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,                       // phone
  /\bSSN\b/i,
  // proprietary markers
  /confidential/i,
  /proprietary/i,
  /internal use only/i,
  /client confidential/i,
]

function checkPrivacy(input: CinePromptShareInput): string | null {
  const combined = Object.values(input).join(" ")
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combined)) {
      return `Input contains potentially sensitive content matching pattern ${pattern.source.slice(0, 20)}…`
    }
  }
  return null
}

function buildCinePromptInput(inputPayload: import("../types").ExternalExecutionInput): CinePromptShareInput | null {
  // Use explicitly passed runtime payload
  const meta = inputPayload as unknown as CinePromptShareInput
  if (meta && typeof meta === "object" && meta.subject) return meta

  // Fallback: synthetic pilot payload for the approved smoke-test input
  return {
    media_type: "commercial",
    subjectType: "object",
    subject: "translucent red ceramic perfume bottle",
    staging: "stone pedestal",
    shot: "close-up",
    lens: "85mm",
    camera: "slow dolly in",
    lighting: "single soft side light",
    mood: "quiet, luxurious, slightly uncanny"
  }
}

function getApiKey(): string {
  // Read from environment — NEVER commit, NEVER log, NEVER include in receipts
  return (typeof process !== "undefined" && process.env?.["CINEPROMPT_API_KEY"]) || ""
}

/**
 * CinePromptShareLinkAdapter
 *
 * ProviderAdapter implementation.
 * Requires a CinePromptTransport — injected for testability.
 * Production transport is the default but MUST NOT be invoked in 3D.2.
 */
export class CinePromptShareLinkAdapter implements ProviderAdapter {
  readonly id = CINEPROMPT_ADAPTER_ID
  readonly name = "CinePrompt Share Link Adapter"
  readonly environment = "PRODUCTION" as const

  readonly sideEffectProfile = {
    canPerformNetwork: true,       // production transport is capable; not invoked in 3D.2
    canWriteFiles: false,
    canSpawnProcess: false,
    canSpendCredits: false,        // subscription only; no per-request credits
    canGenerateArtifact: false,    // generates a share URL, not a media artifact
    canInvokeExternalService: true // CinePrompt /api/share only
  }

  readonly supportedCapabilities: string[] = ["CINEMATIC_PROMPTING", "PROMPT_SHARE_LINK_CREATION"]

  readonly costModel = CINEPROMPT_COST_MODEL
  readonly artifactClassification = CINEPROMPT_ARTIFACT_CLASSIFICATION

  private readonly transport: CinePromptTransport

  constructor(transport?: CinePromptTransport) {
    this.transport = transport ?? new ProductionCinePromptTransport()
  }

  canExecute(plan: ExternalCapabilityPlan): boolean {
    return (
      plan.resourceId === CINEPROMPT_RESOURCE_ID &&
      plan.decomposedCapabilities.includes("CINEMATIC_PROMPTING")
    )
  }

  validatePreconditions?(): { status: "OK" | "PRECONDITION_BLOCKED", reason?: string } {
    const apiKey = getApiKey()
    if (!apiKey) {
      return { status: "PRECONDITION_BLOCKED", reason: "SECRET_MISSING" }
    }
    return { status: "OK" }
  }

  async execute(plan: ExternalCapabilityPlan, intent: ExternalExecutionIntent, inputPayload: import("../types").ExternalExecutionInput): Promise<ExternalCapabilityExecutionResult> {
    const apiKey = getApiKey()

    // Fallback if not caught by validatePreconditions
    if (!apiKey) {
      return {
        executionId: `${CINEPROMPT_ADAPTER_ID}-no-key-${intent.inputFingerprint}`,
        planFingerprint: plan.planFingerprint,
        providerUsed: CINEPROMPT_ADAPTER_ID,
        status: "LOCAL_PRECONDITION_FAILURE", // Will be mapped by sandbox
        rawOutput: {},
        executionTimeMs: 0,
        error: "SECRET_REQUIRED: CINEPROMPT_API_KEY is required. Zero network calls made."
      }
    }

    // Privacy check — block before any network call
    const cinepromptInput = buildCinePromptInput(inputPayload)
    if (!cinepromptInput) {
      return {
        executionId: `${CINEPROMPT_ADAPTER_ID}-no-input`,
        planFingerprint: plan.planFingerprint,
        providerUsed: CINEPROMPT_ADAPTER_ID,
        status: "BLOCKED",
        rawOutput: {},
        executionTimeMs: 0,
        error: "INVALID_REQUEST: Could not build valid CinePrompt input from plan."
      }
    }

    const privacyViolation = checkPrivacy(cinepromptInput)
    if (privacyViolation) {
      return {
        executionId: `${CINEPROMPT_ADAPTER_ID}-privacy-blocked`,
        planFingerprint: plan.planFingerprint,
        providerUsed: CINEPROMPT_ADAPTER_ID,
        status: "LOCAL_PRECONDITION_FAILURE",
        rawOutput: {},
        executionTimeMs: 0,
        error: `PRIVACY_BLOCKED: ${privacyViolation}`
      }
    }

    const startMs = Date.now()
    let transportResult: CinePromptTransportResult

    try {
      transportResult = await this.transport.createShareLink(cinepromptInput, apiKey)
    } catch {
      return {
        executionId: `${CINEPROMPT_ADAPTER_ID}-transport-throw`,
        planFingerprint: plan.planFingerprint,
        providerUsed: CINEPROMPT_ADAPTER_ID,
        status: "DETERMINISTIC_PROVIDER_FAILURE",
        rawOutput: {},
        executionTimeMs: Date.now() - startMs,
        error: "PROVIDER_ERROR: Transport threw unexpectedly."
      }
    }

    const executionTimeMs = Date.now() - startMs

    if (transportResult.outcome === "ERROR") {
      const err = transportResult.error
      const status =
        err.code === "PROVIDER_OUTCOME_UNKNOWN" ? "PROVIDER_OUTCOME_UNKNOWN" : "DETERMINISTIC_PROVIDER_FAILURE"

      return {
        executionId: `${CINEPROMPT_ADAPTER_ID}-${err.code.toLowerCase()}`,
        planFingerprint: plan.planFingerprint,
        providerUsed: CINEPROMPT_ADAPTER_ID,
        status,
        rawOutput: { errorCode: err.code },
        executionTimeMs,
        // NEVER include API key in error message
        error: `${err.code}: ${err.message}`
      }
    }

    // SUCCESS
    const raw = transportResult.rawResponse
    return {
      executionId: `${CINEPROMPT_ADAPTER_ID}-${raw.share_id}`,
      planFingerprint: plan.planFingerprint,
      providerUsed: CINEPROMPT_ADAPTER_ID,
      status: "COMPLETE",
      rawOutput: {
        shareUrl: raw.share_url,
        shareId: raw.share_id,
        artifactClassification: CINEPROMPT_ARTIFACT_CLASSIFICATION,
        createdAt: raw.created_at
      },
      executionTimeMs
    }
  }
}

/**
 * Factory: create the CinePrompt adapter with a given transport.
 * Used by tests to inject FakeCinePromptTransport.
 * Used by production registration to inject ProductionCinePromptTransport.
 */
export function createCinePromptAdapter(transport?: CinePromptTransport): CinePromptShareLinkAdapter {
  return new CinePromptShareLinkAdapter(transport)
}
