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

  const statusTone = completedState
    ? "cl-status-ok"
    : blockedState
      ? "cl-status-danger"
      : panelStatus === "PROPOSAL_READY"
        ? "cl-status-info"
        : "text-stone-500"

  return (
    <section className="border-y border-stone-300 bg-stone-50 py-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="cl-kicker">Governed action plane / {props.approvalKind}</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">{props.actionLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{props.actionDescription}</p>
          </div>
          <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${statusTone}`}>
            {statusLabel(panelStatus)}
          </span>
        </div>

        <dl className="grid gap-px border border-stone-300 bg-stone-300 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-stone-50 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Operation</dt>
            <dd className="mt-1 break-all font-mono text-[10px] text-neutral-950">{props.operation}</dd>
          </div>
          <div className="bg-stone-50 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Required scope</dt>
            <dd className="mt-1 break-all font-mono text-[10px] text-neutral-950">{props.scope}</dd>
          </div>
          <div className="bg-stone-50 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Before fingerprint</dt>
            <dd className="mt-1 font-mono text-[10px] text-neutral-950" title={props.beforeFingerprint}>{fingerprintPreview(props.beforeFingerprint)}</dd>
          </div>
          <div className="bg-stone-50 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Proposal fingerprint</dt>
            <dd className="mt-1 font-mono text-[10px] text-neutral-950" title={props.proposalFingerprint ?? undefined}>{fingerprintPreview(props.proposalFingerprint)}</dd>
          </div>
        </dl>

        {props.evidenceRef ? (
          <div className="border-l-2 border-blue-600 pl-4">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">Canonical completion evidence</p>
            <p className="mt-1 break-all font-mono text-[10px] text-neutral-950">{props.evidenceRef}</p>
            <p className="mt-1 text-xs leading-5 text-stone-600">Traceability reference only; its presence is not an independent verification of the underlying claim.</p>
          </div>
        ) : null}

        {completedState ? (
          <div className="border-l-2 border-emerald-500 pl-4 text-sm text-stone-700">
            <p className="font-semibold text-neutral-950">No additional write required.</p>
            <p className="mt-1">
              {panelStatus === "ALREADY_CANONICAL" ? "This Director next action already exists in canonical Project Brain and will not be duplicated." : null}
              {panelStatus === "ALREADY_STARTED" ? "This canonical next action is already in progress." : null}
              {panelStatus === "ALREADY_COMPLETED" ? "This canonical next action is already completed." : null}
              {props.existingActionStatus ? ` Current status: “${props.existingActionStatus}”.` : ""}
            </p>
          </div>
        ) : null}

        {blockedState ? (
          <div className="border-l-2 border-red-600 pl-4 text-sm text-stone-700">
            <p className="font-semibold text-red-700">Write blocked fail-closed.</p>
            {props.errors.map((error) => <p key={error} className="mt-1">{error}</p>)}
          </div>
        ) : null}

        {panelStatus === "PROPOSAL_READY" ? (
          <div className="border-t border-stone-300 pt-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Approval boundary</p>
                <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
                  Rendering this proposal does not mutate Project Brain. On approval, the server reloads canonical state, regenerates the Director proposal, verifies the exact fingerprint and GitHub owner session, then invokes only the target-owned writer.
                </p>
              </div>

              {!authReady ? (
                <p className="max-w-md border-l-2 border-amber-500 pl-3 text-xs text-stone-700">Write locked for this environment: GitHub OAuth and the canonical owner account must both be configured.</p>
              ) : !props.ownerAuthorized ? (
                <AuthControls authenticated={false} callbackUrl={props.callbackUrl} />
              ) : (
                <form action={formAction} className="flex flex-col gap-2 sm:items-end">
                  <input type="hidden" name="projectId" value={props.projectId} />
                  <input type="hidden" name="proposalFingerprint" value={props.proposalFingerprint ?? ""} />
                  <p className="max-w-xs text-right text-[10px] leading-4 text-stone-500">Exact typed mutation only.</p>
                  <button
                    type="submit"
                    disabled={!canApprove || pending}
                    className="border border-neutral-950 bg-neutral-950 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-transparent hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {pending ? "Revalidating…" : approvalLabel}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : null}

        {stateStatus !== "IDLE" ? (
          <div className="border-t border-stone-300 pt-3 text-sm">
            <p className="font-semibold">Execution result: {statusLabel(stateStatus)}</p>
            {state.receiptId ? <p className="mt-1 font-mono text-[10px]">Receipt: {state.receiptId}</p> : null}
            {state.auditTraceRef ? <p className="mt-1 font-mono text-[10px]">Audit trace: {state.auditTraceRef}</p> : null}
            {state.error ? <p className="mt-1 text-xs text-red-700">{state.error}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
