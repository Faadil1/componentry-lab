/**
 * Slice 3D.2 — CinePrompt Transport Abstraction
 *
 * Separates provider logic from network transport.
 * All tests use FakeCinePromptTransport.
 * ProductionCinePromptTransport is IMPLEMENTED BUT NEVER INVOKED during 3D.2.
 */

import type { CinePromptShareInput, CinePromptShareResponse, CinePromptTransportResult } from "./cineprompt-types"

/** Tracks real HTTP call attempts. Used by test tripwire. */
let _realHttpCallCount = 0

export function getRealHttpCallCount(): number {
  return _realHttpCallCount
}

export function resetRealHttpCallCount(): void {
  _realHttpCallCount = 0
}

/**
 * Transport interface — separates provider logic from network I/O.
 * Implementations: ProductionCinePromptTransport, FakeCinePromptTransport.
 */
export interface CinePromptTransport {
  readonly transportId: string
  createShareLink(input: CinePromptShareInput, apiKey: string): Promise<CinePromptTransportResult>
}

/**
 * ProductionCinePromptTransport
 *
 * Capable of real HTTPS calls to https://cineprompt.io/api/share
 * MUST NOT be invoked during 3D.2 tests or automated validation.
 *
 * Security constraints:
 * - URL is hard-bound to CINEPROMPT_SHARE_ENDPOINT. Not configurable.
 * - POST only.
 * - Bounded timeout (10 000ms).
 * - No automatic retries (PROVIDER_OUTCOME_UNKNOWN on connection drop).
 * - API key is NEVER logged, NEVER included in errors or receipts.
 * - SECRET_REQUIRED if key is absent — zero network calls.
 */
export const CINEPROMPT_SHARE_ENDPOINT = "https://cineprompt.io/api/share" as const

export class ProductionCinePromptTransport implements CinePromptTransport {
  readonly transportId = "production-cineprompt-v1"

  async createShareLink(input: CinePromptShareInput, apiKey: string): Promise<CinePromptTransportResult> {
    if (!apiKey || apiKey.trim() === "") {
      return {
        outcome: "ERROR",
        error: { code: "SECRET_REQUIRED", message: "CINEPROMPT_API_KEY is required. No network call was made.", retryable: false }
      }
    }

    _realHttpCallCount++

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10_000)

    let response: Response
    try {
      response = await fetch(CINEPROMPT_SHARE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Key never appears in logs/errors/receipts — only in the Authorization header
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt: input }),
        signal: controller.signal
      })
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === "AbortError") {
        // Connection was established but timed out — outcome is UNKNOWN (may have reached provider)
        return {
          outcome: "ERROR",
          error: { code: "TIMEOUT", message: "Request timed out after 10 000ms.", retryable: false }
        }
      }
      // Network failure before request was accepted — no side effects
      return {
        outcome: "ERROR",
        error: { code: "NETWORK_ERROR", message: "Network error before request was accepted.", retryable: false }
      }
    } finally {
      clearTimeout(timeoutId)
    }

    if (response.status === 401) {
      return { outcome: "ERROR", error: { code: "AUTHENTICATION_FAILED", message: "Authentication failed (401).", retryable: false } }
    }
    if (response.status === 403) {
      return { outcome: "ERROR", error: { code: "SUBSCRIPTION_REQUIRED", message: "Access denied — subscription may be required (403).", retryable: false } }
    }
    if (response.status === 429) {
      return { outcome: "ERROR", error: { code: "RATE_LIMITED", message: "Rate limit exceeded (429).", retryable: true } }
    }
    if (response.status === 503 || response.status === 502) {
      return { outcome: "ERROR", error: { code: "PROVIDER_UNAVAILABLE", message: `Provider unavailable (${response.status}).`, retryable: true } }
    }
    if (!response.ok) {
      return { outcome: "ERROR", error: { code: "PROVIDER_ERROR", message: `Provider returned unexpected status ${response.status}.`, retryable: false } }
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      return { outcome: "ERROR", error: { code: "INVALID_RESPONSE", message: "Response body is not valid JSON.", retryable: false } }
    }

    return validateCinePromptResponse(body)
  }
}

function validateCinePromptResponse(body: unknown): CinePromptTransportResult {
  if (!body || typeof body !== "object") {
    return { outcome: "ERROR", error: { code: "INVALID_RESPONSE", message: "Response is not an object.", retryable: false } }
  }
  const obj = body as Record<string, unknown>

  if (typeof obj["share_url"] !== "string" || !obj["share_url"]) {
    return { outcome: "ERROR", error: { code: "INVALID_RESPONSE", message: "Response missing expected share_url field.", retryable: false } }
  }

  const shareUrl = obj["share_url"] as string
  // Validate the URL belongs to CinePrompt's expected share surface
  if (!shareUrl.startsWith("https://cineprompt.io/") && !shareUrl.startsWith("https://share.cineprompt.io/")) {
    return { outcome: "ERROR", error: { code: "INVALID_RESPONSE", message: "share_url does not belong to expected CinePrompt share surface.", retryable: false } }
  }

  const shareId = typeof obj["share_id"] === "string" ? obj["share_id"] : ""
  const createdAt = typeof obj["created_at"] === "string" ? obj["created_at"] : new Date().toISOString()

  const validated: CinePromptShareResponse = { share_url: shareUrl, share_id: shareId, created_at: createdAt }
  return { outcome: "SUCCESS", shareUrl, shareId, rawResponse: validated }
}

/**
 * FakeCinePromptTransport
 *
 * Deterministic test-only transport. Makes ZERO real HTTP calls.
 * Configure the outcome before each test via the constructor or setNextOutcome().
 */
export type FakeOutcome =
  | { outcome: "SUCCESS"; shareUrl?: string; shareId?: string }
  | { outcome: "ERROR"; code: import("./cineprompt-types").CinePromptErrorCode }
  | { outcome: "UNKNOWN" }  // simulates PROVIDER_OUTCOME_UNKNOWN (connection drop after POST)

export class FakeCinePromptTransport implements CinePromptTransport {
  readonly transportId = "fake-cineprompt-test"

  private _callCount = 0
  private _nextOutcome: FakeOutcome

  constructor(initialOutcome: FakeOutcome = { outcome: "SUCCESS" }) {
    this._nextOutcome = initialOutcome
  }

  get callCount(): number { return this._callCount }

  setNextOutcome(outcome: FakeOutcome): void {
    this._nextOutcome = outcome
  }

  async createShareLink(input: CinePromptShareInput, apiKey: string): Promise<CinePromptTransportResult> {
    this._callCount++

    // Honor SECRET_REQUIRED even in fake transport for full contract coverage
    if (!apiKey || apiKey.trim() === "") {
      return {
        outcome: "ERROR",
        error: { code: "SECRET_REQUIRED", message: "CINEPROMPT_API_KEY is required.", retryable: false }
      }
    }

    const next = this._nextOutcome

    if (next.outcome === "SUCCESS") {
      const shareUrl = next.shareUrl ?? `https://cineprompt.io/share/fake-${Date.now()}`
      const shareId = next.shareId ?? `fake-${Date.now()}`
      const raw: CinePromptShareResponse = { share_url: shareUrl, share_id: shareId, created_at: new Date().toISOString() }
      return { outcome: "SUCCESS", shareUrl, shareId, rawResponse: raw }
    }

    if (next.outcome === "UNKNOWN") {
      // Simulates connection drop after POST — outcome is genuinely unknown
      return {
        outcome: "ERROR",
        error: { code: "PROVIDER_OUTCOME_UNKNOWN", message: "Connection dropped after POST. Outcome unknown. Do not retry automatically.", retryable: false }
      }
    }

    return {
      outcome: "ERROR",
      error: { code: next.code, message: `Fake transport: simulated ${next.code}`, retryable: next.code === "RATE_LIMITED" || next.code === "PROVIDER_UNAVAILABLE" }
    }
  }
}
