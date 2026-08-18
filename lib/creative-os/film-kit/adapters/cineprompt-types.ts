/**
 * Slice 3D.2 — CinePrompt Adapter Types
 *
 * Defines the narrow input/output contract for the CinePrompt Share Link pilot.
 * No media generation. No provider chaining. One share URL only.
 */

/** Structured input payload for a CinePrompt share link request. */
export interface CinePromptShareInput {
  media_type: "commercial" | "editorial" | "narrative" | "documentary"
  subjectType: "object" | "person" | "scene" | "abstract"
  subject: string
  staging: string
  shot: string
  lens: string
  camera: string
  lighting: string
  mood: string
}

/**
 * Validated response from the CinePrompt /api/share endpoint.
 * Only the share_url field is considered trusted output.
 */
export interface CinePromptShareResponse {
  share_url: string
  share_id: string
  created_at: string
}

/**
 * Adapter error taxonomy for CinePrompt.
 * These are canonical codes — never expose secrets in messages.
 */
export type CinePromptErrorCode =
  | "SECRET_REQUIRED"
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "SUBSCRIPTION_REQUIRED"
  | "RATE_LIMITED"
  | "INVALID_REQUEST"
  | "INVALID_RESPONSE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_ERROR"
  | "PROVIDER_OUTCOME_UNKNOWN"
  | "PRIVACY_BLOCKED"

export interface CinePromptAdapterError {
  code: CinePromptErrorCode
  /** Human-readable message. MUST NOT contain API keys, tokens, or secrets. */
  message: string
  retryable: boolean
}

/**
 * Outcome returned by the transport layer.
 * On success, contains the validated share URL.
 * On failure, contains the error taxonomy code.
 * providerOutputFingerprint is NEVER fabricated on failure.
 */
export type CinePromptTransportResult =
  | { outcome: "SUCCESS"; shareUrl: string; shareId: string; rawResponse: CinePromptShareResponse }
  | { outcome: "ERROR"; error: CinePromptAdapterError }

/**
 * Share link artifact reference classification.
 * A CinePrompt share URL is EXTERNAL_SHARE_REFERENCE:
 * - not assumed PRIVATE
 * - not assumed DELETABLE
 * - not assumed REVOCABLE
 * unless provider evidence explicitly proves otherwise.
 */
export const CINEPROMPT_ARTIFACT_CLASSIFICATION = "EXTERNAL_SHARE_REFERENCE" as const

export interface CinePromptCostModel {
  subscriptionRequirement: "REQUIRED" | "NOT_REQUIRED" | "UNKNOWN"
  subscriptionPriceObserved: string
  pricingObservationDate: string
  developerApiEntitlement: "INCLUDED_IN_PRO" | "UNKNOWN"
  incrementalShareRequestCostStatus: "NOT_DOCUMENTED" | "ZERO" | "PAID"
  pilotAdditionalSpendCeiling: number
  downstreamGenerationBudgetUSD: number
}

export const CINEPROMPT_COST_MODEL: CinePromptCostModel = {
  subscriptionRequirement: "REQUIRED",
  subscriptionPriceObserved: "7 USD/month",
  pricingObservationDate: "2026-08-07",
  developerApiEntitlement: "INCLUDED_IN_PRO",
  incrementalShareRequestCostStatus: "NOT_DOCUMENTED",
  pilotAdditionalSpendCeiling: 0,
  downstreamGenerationBudgetUSD: 0
}

/** Privacy classifications for pilot policy. */
export type CinePromptPrivacyViolation =
  | "CREDENTIALS_DETECTED"
  | "SECRET_DETECTED"
  | "CLIENT_CONFIDENTIAL"
  | "PERSONAL_IDENTIFIER"
  | "PRIVATE_USER_ASSET"
  | "UNRELEASED_PROPRIETARY"
