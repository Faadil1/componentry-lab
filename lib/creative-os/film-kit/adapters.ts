import type { ExternalCapabilityPlan, ExternalCapabilityExecutionResult, ExternalExecutionIntent } from "./types"

/**
 * Production provider execution adapters.
 * In Slice 3D, execution is enabled but sandboxed.
 */
export const IS_PRODUCTION_EXECUTION_ENABLED = true

export type ProviderAdapterEnvironment = "TEST_ONLY" | "SANDBOX" | "PRODUCTION"

export interface ProviderAdapter {
  id: string
  name: string
  environment: ProviderAdapterEnvironment
  sideEffectProfile: {
    canPerformNetwork: boolean
    canWriteFiles: boolean
    canSpawnProcess: boolean
    canSpendCredits: boolean
    canGenerateArtifact: boolean
    canInvokeExternalService: boolean
  }
  supportedCapabilities: string[]
  canExecute(plan: ExternalCapabilityPlan): boolean
  validatePreconditions?(plan: ExternalCapabilityPlan, intent: ExternalExecutionIntent, inputPayload: import("./types").ExternalExecutionInput): { status: "OK" | "PRECONDITION_BLOCKED", reason?: string }
  execute(plan: ExternalCapabilityPlan, intent: ExternalExecutionIntent, inputPayload: import("./types").ExternalExecutionInput): Promise<ExternalCapabilityExecutionResult>
}

const adapters: ProviderAdapter[] = []

export function registerProviderAdapter(adapter: ProviderAdapter) {
  adapters.push(adapter)
}

export function getProviderAdapterForPlan(plan: ExternalCapabilityPlan): ProviderAdapter | null {
  return adapters.find(a => a.canExecute(plan)) || null
}

export function getRegisteredAdapters(): ProviderAdapter[] {
  return adapters
}

export function clearProviderAdapters(): void {
  adapters.length = 0
}
