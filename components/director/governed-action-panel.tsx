"use client"

import { useActionState } from "react"

import { AuthControls } from "@/components/auth/auth-controls"
import {
  approveDirectorCompleteNextAction,
  approveDirectorNextAction,
  approveDirectorStartNextAction,
  type GovernedDirectorActionState,
} from "@/app/director/live/actions"

const INITIAL_GOVERNED_DIRECTOR_ACTION_STATE: GovernedDirectorActionState = {
  status: "IDLE",
  receiptId: null,
  auditTraceRef: null,
  error: null,
}

export type GovernedActionPanelStatus =
  | "PROPOSAL_READY"
  | "ALREADY_CANONICAL"
  | "ACTION_NOT_CANONICAL"
  | "ACTION_NOT_STARTED"
  | "ALREADY_STARTED"
  | "ALREADY_COMPLETED"
  | "ACTION_BLOCKED"
  | "EVIDENCE_REQUIRED"
  | "IDENTITY_CONFLICT"
  | "INVALID_PROPOSAL"

export interface GovernedActionPanelProps {
  projectId: string
  callbackUrl: string
  approvalKind: "append" | "start" | "complete"
  status: GovernedActionPanelStatus
  operation: string
  scope: string
  beforeFingerprint: string
  proposalFingerprint: string | null
  actionLabel: string
  actionDescription: string
  existingActionStatus: string | null
  evidenceRef?: string | null
  oauthConfigured: boolean
  ownerAccountConfigured: boolean
  ownerAuthorized: boolean
  errors: readonly string[]
}

function fingerprintPreview(value: string | null): string {
  if (!value) return "—"
  return `${value.slice(0, 12)}…${value.slice(-8)}`
}

function statusLabel(value: string | null | undefined): string {
  if (!value) return "INVALID PROPOSAL"
  return value.split("_").join(" ")
}

export function GovernedActionPanel(props: GovernedActionPanelProps) {
  const [appendState, appendFormAction, appendPending] = useActionState(
    approveDirectorNextAction,
    INITIAL_GOVERNED_DIRECTOR_ACTION_STATE,
  )
  const [startState, startFormAction, startPending] = useActionState(
    approveDirectorStartNextAction,
    INITIAL_GOVERNED_DIRECTOR_ACTION_STATE,
  )
  const [completeState, completeFormAction, completePending] = useActionState(
    approveDirectorCompleteNextAction,
    INITIAL_GOVERNED_DIRECTOR_ACTION_STATE,
  )

  const state = props.approvalKind === "complete" ? completeState : props.approvalKind === "start" ? startState : appendState
  const stateStatus = state?.status ?? "IDLE"
  const panelStatus: GovernedActionPanelStatus = props.status ?? "INVALID_PROPOSAL"
  const formAction = props.approvalKind === "complete" ? completeFormAction : props.approvalKind === "start" ? startFormAction : appendFormAction
  const pending = props.approvalKind === "complete" ? completePending : props.approvalKind === "start" ? startPending : appendPending
  const authReady = props.oauthConfigured && props.ownerAccountConfigured
  const canApprove = panelStatus === "PROPOSAL_READY" && authReady && props.ownerAuthorized && Boolean(props.proposalFingerprint)
  const completedState = panelStatus === "ALREADY_CANONICAL" || panelStatus === "ALREADY_STARTED" || panelStatus === "ALREADY_COMPLETED"
  const blockedState = [
    "IDENTITY_CONFLICT",
    "INVALID_PROPOSAL",
    "ACTION_BLOCKED",
    "ACTION_NOT_CANONICAL",
    "ACTION_NOT_STARTED",
    "EVIDENCE_REQUIRED",
  ].includes(panelStatus)

  const approvalLabel = props.approvalKind === "complete"
    ? "Approve completion"
    : props.approvalKind === "start"
      ? "Approve start action"
      : "Approve governed write"

  return (
    <section className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Governed action plane</p>
            <span className="rounded-full border border-stone-300 bg-stone-50 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-600">
              explicit approval only
            </span>
          </div>
          <h2 className="text-lg font-black">{props.actionLabel}</h2>
          <p className="text-sm leading-relaxed text-stone-600">{props.actionDescription}</p>
        </div>
        <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 font-mono text-[10px] font-bold uppercase text-stone-600">
          {statusLabel(panelStatus)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="font-mono text-[9px] font-bold uppercase text-stone-500">Operation</p>
          <p className="mt-1 break-all font-mono text-[10px] text-stone-800">{props.operation}</p>
        </div>
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="font-mono text-[9px] font-bold uppercase text-stone-500">Required scope</p>
          <p className="mt-1 break-all font-mono text-[10px] text-stone-800">{props.scope}</p>
        </div>
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="font-mono text-[9px] font-bold uppercase text-stone-500">Before fingerprint</p>
          <p className="mt-1 font-mono text-[10px] text-stone-800" title={props.beforeFingerprint}>{fingerprintPreview(props.beforeFingerprint)}</p>
        </div>
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="font-mono text-[9px] font-bold uppercase text-stone-500">Proposal fingerprint</p>
          <p className="mt-1 font-mono text-[10px] text-stone-800" title={props.proposalFingerprint ?? undefined}>{fingerprintPreview(props.proposalFingerprint)}</p>
        </div>
      </div>

      {props.evidenceRef ? (
        <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <p className="font-mono text-[9px] font-bold uppercase text-cyan-800">Canonical completion evidence</p>
          <p className="mt-1 break-all font-mono text-[10px] text-cyan-950">{props.evidenceRef}</p>
          <p className="mt-1 text-xs text-cyan-900">This reference is required for traceability; its presence is not an independent verification of the underlying claim.</p>
        </div>
      ) : null}

      {completedState ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">No additional write required.</p>
          <p className="mt-1">
            {panelStatus === "ALREADY_CANONICAL" ? "This Director next action already exists in canonical Project Brain and will not be duplicated." : null}
            {panelStatus === "ALREADY_STARTED" ? "This canonical next action is already in progress." : null}
            {panelStatus === "ALREADY_COMPLETED" ? "This canonical next action is already completed." : null}
            {props.existingActionStatus ? ` Current status: “${props.existingActionStatus}”.` : ""}
          </p>
        </div>
      ) : null}

      {blockedState ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Write blocked fail-closed.</p>
          {props.errors.map((error) => <p key={error} className="mt-1">{error}</p>)}
        </div>
      ) : null}

      {panelStatus === "PROPOSAL_READY" ? (
        <div className="mt-4 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="text-sm font-semibold">Approval boundary</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              Rendering this proposal does not mutate Project Brain. On approval, the server reloads canonical Project Brain, regenerates the Director proposal, verifies the exact fingerprint, verifies the GitHub owner session, and only then invokes the target-owned writer.
            </p>
          </div>

          {!authReady ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              Write locked for this environment: GitHub OAuth and the canonical owner account must both be configured. No anonymous or development bypass is available.
            </div>
          ) : !props.ownerAuthorized ? (
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <AuthControls authenticated={false} callbackUrl={props.callbackUrl} />
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input type="hidden" name="projectId" value={props.projectId} />
              <input type="hidden" name="proposalFingerprint" value={props.proposalFingerprint ?? ""} />
              <p className="text-xs text-stone-600">Authenticated owner approval will apply only this exact typed mutation.</p>
              <button
                type="submit"
                disabled={!canApprove || pending}
                className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Revalidating…" : approvalLabel}
              </button>
            </form>
          )}
        </div>
      ) : null}

      {stateStatus !== "IDLE" ? (
        <div className={`mt-4 rounded-xl border p-3 text-sm ${stateStatus === "APPLIED" || stateStatus === "NO_CHANGE" || stateStatus === "ALREADY_CANONICAL" || stateStatus === "ALREADY_STARTED" || stateStatus === "ALREADY_COMPLETED" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
          <p className="font-semibold">Execution result: {statusLabel(stateStatus)}</p>
          {state.receiptId ? <p className="mt-1 font-mono text-[10px]">Receipt: {state.receiptId}</p> : null}
          {state.auditTraceRef ? <p className="mt-1 font-mono text-[10px]">Audit trace: {state.auditTraceRef}</p> : null}
          {state.error ? <p className="mt-1 text-xs">{state.error}</p> : null}
        </div>
      ) : null}
    </section>
  )
}
