/**
 * Slice 3D.2 — Production adapter registration index.
 *
 * The CinePrompt adapter is conditionally registered ONLY when:
 * - CINEPROMPT_PROVIDER_ENABLED === "true"
 * - CINEPROMPT_API_KEY is present
 *
 * This module is NEVER imported during tests.
 * FakeCinePromptTransport is injected directly in test files.
 */

import { registerProviderAdapter } from "../adapters"
import { createCinePromptAdapter } from "./cineprompt-adapter"

export function registerProductionAdapters(): void {
  const enabled = typeof process !== "undefined" && process.env?.["CINEPROMPT_PROVIDER_ENABLED"] === "true"
  const hasKey = typeof process !== "undefined" && !!process.env?.["CINEPROMPT_API_KEY"]

  if (enabled && hasKey) {
    registerProviderAdapter(createCinePromptAdapter())
  }
}

// Do NOT call registerProductionAdapters() here automatically.
// It must be called explicitly by the application bootstrap,
// ONLY after explicit human approval for production execution.
