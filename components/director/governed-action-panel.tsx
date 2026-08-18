"use client"

import { useActionState } from "react"

import { AuthControls } from "@/components/auth/auth-controls"
import {
  approveDirectorNextAction,
  INITIAL_GOVERNED_DIRECTOR_ACTION_STATE,
} from "@/app/director/live/actions"

export type GovernedActionPanelStatus =
  | "PROPOSAL_READY"
  | "ALREADY_CANONICAL"
  | "IDENTITY_CONFLICT"
  | "INVALID_PROPOSAL"

export interface GovernedActionPanelProps {
  projectId: string
  callbackUrl: string
  status: GovernedActionPanelStatus
  operation: string
  scope: string
  beforeFingerprint: string
  proposalFingerprint: string | null
  actionLabel: string
  actionDescription: string
  existingActionStatus: string | null
  oauthConfigured: boolean
  ownerAccountConfigured: boolean
  ownerAuthorized: boolean
  errors: readonly string[]
}

function fingerprintPreview(value: string | null): string {
  if (!value) return "—"
  return `${value.slice(0, 12)}…${value.slice(-8)}`
}

export function GovernedActionPanel(props: GovernedActionPanelProps) {
  const [state, formAction, pending] = useActionState(
    approveDirectorNextAction,
    INITIAL_GOVERNED_DIRECTOR_ACTION_STATE,
  )

  const authReady = props.oauthConfigured && props.ownerAccountConfigured
  const canApprove = props.status === "PROPOSAL_READY" && authReady && props.ownerAuthorized && Boolean(props.proposalFingerprint)

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
          {props.status.replaceAll("_", " ")}
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

      {props.status === "ALREADY_CANONICAL" ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">No write required.</p>
          <p className="mt-1">This Director next action already exists in canonical Project Brain{props.existingActionStatus ? ` with status “${props.existingActionStatus}”` : ""}. The action plane will not create a duplicate.</p>
        </div>
      ) : null}

      {props.status === "IDENTITY_CONFLICT" || props.status === "INVALID_PROPOSAL" ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Write blocked fail-closed.</p>
          {props.errors.map((error) => <p key={error} className="mt-1">{error}</p>)}
        </div>
      ) : null}

      {props.status === "PROPOSAL_READY" ? (
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
                {pending ? "Revalidating…" : "Approve governed write"}
              </button>
            </form>
          )}
        </div>
      ) : null}

      {state.status !== "IDLE" ? (
        <div className={`mt-4 rounded-xl border p-3 text-sm ${state.status === "APPLIED" || state.status === "NO_CHANGE" || state.status === "ALREADY_CANONICAL" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
          <p className="font-semibold">Execution result: {state.status.replaceAll("_", " ")}</p>
          {state.receiptId ? <p className="mt-1 font-mono text-[10px]">Receipt: {state.receiptId}</p> : null}
          {state.error ? <p className="mt-1 text-xs">{state.error}</p> : null}
        </div>
      ) : null}
    </section>
  )
}
