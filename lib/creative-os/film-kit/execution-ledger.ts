import fs from "fs"
import path from "path"

export type ExecutionReservationState = "IN_FLIGHT" | "TERMINAL_SUCCESS" | "TERMINAL_FAILURE" | "TERMINAL_OUTCOME_UNKNOWN"

export type ExecutionReservation = {
  state: ExecutionReservationState
  receipt?: import("./types").ExternalExecutionReceipt
}

export interface ExecutionLedger {
  readonly isPersistent: boolean
  get(executionIntentFingerprint: string): ExecutionReservation | undefined
  reserve(executionIntentFingerprint: string): void
  complete(executionIntentFingerprint: string, receipt: import("./types").ExternalExecutionReceipt): void
  markOutcomeUnknown(executionIntentFingerprint: string, receipt?: import("./types").ExternalExecutionReceipt): void
}

export class InMemoryExecutionLedger implements ExecutionLedger {
  readonly isPersistent = false
  private store = new Map<string, ExecutionReservation>()

  get(executionIntentFingerprint: string): ExecutionReservation | undefined {
    return this.store.get(executionIntentFingerprint)
  }

  reserve(executionIntentFingerprint: string): void {
    this.store.set(executionIntentFingerprint, { state: "IN_FLIGHT" })
  }

  complete(executionIntentFingerprint: string, receipt: import("./types").ExternalExecutionReceipt): void {
    const finalStatus = receipt.executionStatus
    const state: ExecutionReservationState = (finalStatus === "PROVIDER_ERROR") 
      ? "TERMINAL_FAILURE" 
      : "TERMINAL_SUCCESS"
    this.store.set(executionIntentFingerprint, { state, receipt })
  }

  markOutcomeUnknown(executionIntentFingerprint: string, receipt?: import("./types").ExternalExecutionReceipt): void {
    this.store.set(executionIntentFingerprint, { state: "TERMINAL_OUTCOME_UNKNOWN", receipt })
  }
}

export class LocalPersistentExecutionLedger implements ExecutionLedger {
  readonly isPersistent = true
  private filePath: string

  constructor(filePath: string = path.join(process.cwd(), ".creative-os", "execution-ledger.json")) {
    this.filePath = filePath
    this.ensureFile()
  }

  private ensureFile() {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}), "utf8")
    }
  }

  private readStore(): Record<string, ExecutionReservation> {
    this.ensureFile()
    try {
      const data = fs.readFileSync(this.filePath, "utf8")
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  private writeStore(store: Record<string, ExecutionReservation>) {
    this.ensureFile()
    fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2), "utf8")
  }

  get(executionIntentFingerprint: string): ExecutionReservation | undefined {
    return this.readStore()[executionIntentFingerprint]
  }

  reserve(executionIntentFingerprint: string): void {
    const store = this.readStore()
    store[executionIntentFingerprint] = { state: "IN_FLIGHT" }
    this.writeStore(store)
  }

  complete(executionIntentFingerprint: string, receipt: import("./types").ExternalExecutionReceipt): void {
    const store = this.readStore()
    const finalStatus = receipt.executionStatus
    const state: ExecutionReservationState = (finalStatus === "PROVIDER_ERROR") 
      ? "TERMINAL_FAILURE" 
      : "TERMINAL_SUCCESS"
    store[executionIntentFingerprint] = { state, receipt }
    this.writeStore(store)
  }

  markOutcomeUnknown(executionIntentFingerprint: string, receipt?: import("./types").ExternalExecutionReceipt): void {
    const store = this.readStore()
    store[executionIntentFingerprint] = { state: "TERMINAL_OUTCOME_UNKNOWN", receipt }
    this.writeStore(store)
  }
}

// Global active ledger singleton
let activeLedger: ExecutionLedger = new InMemoryExecutionLedger()

export function getExecutionLedger(): ExecutionLedger {
  return activeLedger
}

export function setExecutionLedger(ledger: ExecutionLedger) {
  activeLedger = ledger
}
