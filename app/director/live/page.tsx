import Link from "next/link"

import { authRuntimeSummary } from "@/auth"
import { GovernedActionPanel } from "@/components/director/governed-action-panel"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { buildDualLibraryProjection } from "@/lib/creative-os/collaboration"
import {
  projectDirectorNextActionToGovernedCompleteIntent,
  projectDirectorNextActionToGovernedStartIntent,
  projectDirectorNextActionToGovernedWriteIntent,
} from "@/lib/creative-os/action-plane"
import {
  buildLiveDirectorProjection,
  summarizeLiveDirectorProject,
} from "@/lib/director/live-projection"
import { fingerprintProjectBrain } from "@/lib/projects/fingerprint"
import { PROJECT_NEXT_ACTION_APPEND_SCOPE } from "@/lib/projects/next-action-writer"
import { PROJECT_NEXT_ACTION_START_SCOPE } from "@/lib/projects/next-action-status-writer"
import { PROJECT_NEXT_ACTION_COMPLETE_SCOPE } from "@/lib/projects/next-action-complete-writer"
import { listProjects } from "@/lib/projects/repository"
import { requireCanonicalWriteAccess } from "@/lib/security/canonical-write-access"

export const dynamic = "force-dynamic"

function Interlock({ label, value, tone = "info" }: { label: string; value: string; tone?: "ok" | "info" | "warn" | "danger" }) {
  const toneClass = tone === "ok"
    ? "cl-status-ok"
    : tone === "warn"
      ? "cl-status-warn"
      : tone === "danger"
        ? "cl-status-danger"
        : "cl-status-info"

  return (
    <div className="flex min-w-0 items-center gap-3 border-r border-stone-300 px-3 py-3 last:border-r-0">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-400 font-mono text-xs ${toneClass}`}>
        {tone === "ok" ? "✓" : tone === "danger" ? "×" : tone === "warn" ? "!" : "·"}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-950">{label}</p>
        <p className={`mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.08em] ${toneClass}`}>{value}</p>
      </div>
    </div>
  )
}

export default async function LiveDirectorPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const params = await searchParams
  const projects = await listProjects()
  const summaries = projects.map(summarizeLiveDirectorProject)
  const compatibleProjects = projects.filter((project) => summarizeLiveDirectorProject(project).compatible)
  const requestedProject = params.project
    ? compatibleProjects.find((project) => project.id === params.project) ?? null
    : null
  const project = requestedProject ?? compatibleProjects[0] ?? null
  const projection = project ? buildLiveDirectorProjection(project) : null
  const libraries = buildDualLibraryProjection()
  const authReady = authRuntimeSummary.oauthConfigured && authRuntimeSummary.ownerAccountIdConfigured
  const writeAccess = authReady ? await requireCanonicalWriteAccess() : null
  const ownerAuthorized = writeAccess?.ok === true
  const writeIntent = project && projection
    ? projectDirectorNextActionToGovernedWriteIntent(project, projection.result, projection.evaluationTimestamp)
    : null
  const startIntent = project && projection
    ? projectDirectorNextActionToGovernedStartIntent(project, projection.result, projection.evaluationTimestamp)
    : null
  const completeIntent = project && projection
    ? projectDirectorNextActionToGovernedCompleteIntent(project, projection.result, projection.evaluationTimestamp)
    : null
  const projectFingerprint = project ? fingerprintProjectBrain(project) : ""

  const completedAction = project ? [...project.nextActions].reverse().find((action) => action.status === "done") ?? null : null
  const proofGap = project?.unresolvedProofGaps[0] ?? null
  const pertinentRisk = project?.risks.find((risk) => risk.status === "triggered" || risk.status === "open") ?? null

  const approvalNeeded = [writeIntent, startIntent, completeIntent].some((intent) => intent?.status === "PROPOSAL_READY")
  const evidenceBlocked = completeIntent?.status === "EVIDENCE_REQUIRED"

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-stone-300 bg-stone-50/95 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6">
          <LabNavigation compact projectId={project?.id ?? null} />
        </div>
      </header>

      <div className="mx-auto max-w-screen-2xl space-y-10 px-4 py-7 sm:px-6 lg:py-10">
        <section className="flex flex-col gap-4 border-b border-stone-300 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="cl-kicker">Creative Director / live governed projection</p>
            <h1 className="mt-3 font-sans text-lg font-semibold tracking-tight text-neutral-950">Componentry Lab</h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-500">
            <span>View <strong className="text-blue-700">live</strong></span>
            <span>Mode <strong className="text-neutral-950">read / bounded write</strong></span>
            <span>Owner <strong className="text-neutral-950">{ownerAuthorized ? "authenticated" : "not authenticated"}</strong></span>
            <Link href="/director" className="border-b border-stone-400 pb-0.5 text-neutral-950 hover:border-blue-600">Fixture lab ↗</Link>
          </div>
        </section>

        <section className="border-y border-stone-300 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Canonical project context</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{project?.title ?? "No compatible project"}</p>
            </div>
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              {summaries.map((summary) => {
                const active = project?.id === summary.id
                if (!summary.compatible) {
                  return (
                    <span key={summary.id} className="border-l border-stone-300 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-stone-400">
                      {summary.title} / unmapped
                    </span>
                  )
                }
                return (
                  <Link
                    key={summary.id}
                    href={`/director/live?project=${encodeURIComponent(summary.id)}`}
                    className={`border-b-2 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${active ? "border-blue-600 text-neutral-950" : "border-transparent text-stone-500 hover:border-stone-400"}`}
                  >
                    {summary.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {!project || !projection ? (
          <section className="border-l-2 border-amber-500 pl-4 text-sm leading-6 text-stone-700">
            No Project Brain project currently has an explicit Director mode mapping. Unsupported kinds fail closed rather than being coerced into a mode.
          </section>
        ) : (
          <>
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div>
                <p className="cl-kicker">Director recommendation</p>
                <h2 className="cl-display mt-4 max-w-5xl text-5xl text-neutral-950 sm:text-6xl lg:text-7xl">
                  {projection.result.nextAction.title}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600">{projection.result.nextAction.description}</p>

                <div className="mt-8 grid gap-px border-y border-stone-300 bg-stone-300 sm:grid-cols-5">
                  <Interlock label="Valid" value="qualified" tone="ok" />
                  <Interlock label="Owner" value={ownerAuthorized ? "confirmed" : authReady ? "sign in" : "not configured"} tone={ownerAuthorized ? "ok" : "warn"} />
                  <Interlock label="Approval" value={approvalNeeded ? "required" : "no pending gate"} tone={approvalNeeded ? "warn" : "ok"} />
                  <Interlock label="Fresh" value="checked on apply" tone="info" />
                  <Interlock label="Evidence" value={evidenceBlocked ? "required" : completeIntent?.evidenceId ? "available" : "n/a"} tone={evidenceBlocked ? "danger" : completeIntent?.evidenceId ? "ok" : "info"} />
                </div>
              </div>

              <aside className="divide-y divide-stone-300 border-y border-stone-300 text-sm">
                <div className="py-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Deadline</p>
                  <p className="mt-1 font-mono text-xs text-red-700">{project.deadlineLabel ?? "not set"}</p>
                </div>
                <div className="py-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Proof gap</p>
                  <p className="mt-1 leading-5 text-neutral-950">{proofGap ?? "No unresolved proof gap"}</p>
                </div>
                <div className="py-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Risk</p>
                  <p className={`mt-1 leading-5 ${pertinentRisk ? "text-red-700" : "text-neutral-950"}`}>{pertinentRisk?.label ?? "No pertinent open risk"}</p>
                </div>
                <div className="py-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Authority</p>
                  <p className="mt-1 font-mono text-xs">{projection.result.nextAction.authorityRequirement}</p>
                </div>
                <div className="py-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Side effect payload</p>
                  <p className="mt-1 font-mono text-xs">null</p>
                </div>
                <div className="py-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Next recommended phase</p>
                  <p className="mt-1 font-mono text-xs text-blue-700">{project.nextRecommendedPhase}</p>
                </div>
              </aside>
            </section>

            <section className="space-y-0">
              <div className="grid gap-4 border-t border-stone-300 py-5 lg:grid-cols-[9rem_1fr]">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Canonical / proven</p>
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">Canonical history / latest relevant action</p>
                  {completedAction ? (
                    <div className="mt-3 grid gap-2 border-t border-stone-200 pt-3 sm:grid-cols-[5rem_1fr_auto] sm:items-start">
                      <span className="font-mono text-xs text-neutral-950">{completedAction.id}</span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">{completedAction.label}</p>
                        <p className="mt-1 text-xs leading-5 text-stone-500">{completedAction.description}</p>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-700">status / completed</span>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-500">No completed canonical action is available.</p>
                  )}
                </div>
              </div>

              <div className="cl-frontier">Canonical frontier</div>

              <div className="grid gap-4 border-b border-stone-300 py-6 lg:grid-cols-[9rem_1fr]">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Proposed</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-stone-400">Not authorized</p>
                </div>
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">Proposed next action</p>
                    <h3 className="cl-display mt-2 text-3xl text-neutral-950 sm:text-4xl">{projection.result.nextAction.title}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">{projection.result.nextAction.description}</p>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-stone-500">
                      <span>authority: <strong className="text-neutral-950">{projection.result.nextAction.authorityRequirement}</strong></span>
                      <span>sideEffectPayload: <strong className="text-neutral-950">null</strong></span>
                      <span>phase: <strong className="text-blue-700">{projection.result.resolvedPhase}</strong></span>
                    </div>
                  </div>
                  <div className="border-l border-stone-300 pl-4 font-mono text-[9px] uppercase tracking-[0.12em] text-stone-500">
                    <p>Evaluation</p>
                    <p className="mt-1 text-neutral-950">{projection.evaluationTimestamp}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-8 xl:grid-cols-3">
              {writeIntent ? (
                <GovernedActionPanel
                  projectId={project.id}
                  callbackUrl={`/director/live?project=${encodeURIComponent(project.id)}`}
                  approvalKind="append"
                  status={writeIntent.status}
                  operation="PROJECT_BRAIN_APPEND_NEXT_ACTION"
                  scope={PROJECT_NEXT_ACTION_APPEND_SCOPE}
                  beforeFingerprint={projectFingerprint}
                  proposalFingerprint={writeIntent.proposalFingerprint}
                  actionLabel={`Canonicalize: ${writeIntent.candidateAction.label}`}
                  actionDescription={writeIntent.candidateAction.description}
                  existingActionStatus={writeIntent.existingAction?.status ?? null}
                  oauthConfigured={authRuntimeSummary.oauthConfigured}
                  ownerAccountConfigured={authRuntimeSummary.ownerAccountIdConfigured}
                  ownerAuthorized={ownerAuthorized}
                  errors={writeIntent.errors}
                />
              ) : null}

              {startIntent ? (
                <GovernedActionPanel
                  projectId={project.id}
                  callbackUrl={`/director/live?project=${encodeURIComponent(project.id)}`}
                  approvalKind="start"
                  status={startIntent.status}
                  operation="PROJECT_BRAIN_START_NEXT_ACTION"
                  scope={PROJECT_NEXT_ACTION_START_SCOPE}
                  beforeFingerprint={projectFingerprint}
                  proposalFingerprint={startIntent.proposalFingerprint}
                  actionLabel={`Start: ${startIntent.candidateAction.label}`}
                  actionDescription="Move only this canonical Project Brain next action from todo to doing. This does not change project phase, execute external work, or authorize any provider."
                  existingActionStatus={startIntent.existingAction?.status ?? null}
                  oauthConfigured={authRuntimeSummary.oauthConfigured}
                  ownerAccountConfigured={authRuntimeSummary.ownerAccountIdConfigured}
                  ownerAuthorized={ownerAuthorized}
                  errors={startIntent.errors}
                />
              ) : null}

              {completeIntent ? (
                <GovernedActionPanel
                  projectId={project.id}
                  callbackUrl={`/director/live?project=${encodeURIComponent(project.id)}`}
                  approvalKind="complete"
                  status={completeIntent.status}
                  operation="PROJECT_BRAIN_COMPLETE_NEXT_ACTION"
                  scope={PROJECT_NEXT_ACTION_COMPLETE_SCOPE}
                  beforeFingerprint={projectFingerprint}
                  proposalFingerprint={completeIntent.proposalFingerprint}
                  actionLabel={`Complete: ${completeIntent.candidateAction.label}`}
                  actionDescription="Move only this canonical Project Brain next action from doing to done, using canonical available evidence. This does not change project phase/status or execute external work."
                  existingActionStatus={completeIntent.existingAction?.status ?? null}
                  evidenceRef={completeIntent.evidenceId ? `project-brain:${project.id}:evidence:${completeIntent.evidenceId}` : null}
                  oauthConfigured={authRuntimeSummary.oauthConfigured}
                  ownerAccountConfigured={authRuntimeSummary.ownerAccountIdConfigured}
                  ownerAuthorized={ownerAuthorized}
                  errors={completeIntent.errors}
                />
              ) : null}
            </div>

            <section className="grid gap-px border-y border-stone-300 bg-stone-300 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Registry V2 governance", libraries.counts.governedCapabilities, "governed entities"],
                ["Component Library", libraries.counts.compositions, "composition descriptors"],
                ["Director skill pool", projection.input.availableSkills.length, "governed methods available"],
                ["Selected methods", projection.result.selectedSkills.length, "eligible for this context"],
              ].map(([label, value, description]) => (
                <article key={String(label)} className="bg-stone-50 p-4">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-neutral-950">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-8 lg:grid-cols-2">
              <article className="border-t border-stone-300 pt-5">
                <p className="cl-kicker">Governed method collaboration</p>
                <h2 className="mt-2 text-lg font-semibold text-neutral-950">Selected Registry methods</h2>
                <div className="mt-4 divide-y divide-stone-200 border-y border-stone-300">
                  {projection.result.selectedSkills.length === 0 ? (
                    <p className="py-3 text-sm text-stone-600">No method is eligible for the current mode / phase / authority combination.</p>
                  ) : projection.result.selectedSkills.map((skill) => (
                    <div key={skill.skillId} className="py-3">
                      <p className="text-sm font-semibold">{skill.title}</p>
                      <p className="mt-1 break-all font-mono text-[9px] text-stone-500">{skill.skillId}</p>
                      <p className="mt-1 text-xs text-stone-600">{skill.capabilityGaps?.join(" · ") || "No capability gaps declared"}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="border-t border-stone-300 pt-5">
                <p className="cl-kicker">Collaboration mesh</p>
                <h2 className="mt-2 text-lg font-semibold text-neutral-950">Supporting systems remain bounded</h2>
                <div className="mt-4 divide-y divide-stone-200 border-y border-stone-300 text-sm">
                  {[
                    ["Project Brain", "canonical context owner; writes only through typed governed action gates"],
                    ["Creative Director", "one canonical next action + mutation proposal authority only"],
                    ["Registry V2", "governance + evidence + authority"],
                    ["Component Library", "composition/build intelligence"],
                    ["Creative Method Runtime", "deterministic advisory execution"],
                    ["Film Kit", "planning/intent only in this phase"],
                    ["Playbooks", "read-only knowledge metadata"],
                    ["References / Sources", "Registry discovery only; never executors"],
                    ["Audit / Evidence", "immutable trace projection; no canonical persistence"],
                  ].map(([label, description]) => (
                    <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr]">
                      <strong>{label}</strong>
                      <span className="text-stone-600">{description}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-8 lg:grid-cols-2">
              <article className="border-t border-stone-300 pt-5">
                <p className="cl-kicker">Quality gates</p>
                <div className="mt-3 divide-y divide-stone-200 border-y border-stone-300">
                  {projection.result.gateEvaluations.map((gate) => (
                    <div key={gate.gateId} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="font-medium">{gate.name}</span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-stone-600">{gate.status}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="border-t border-stone-300 pt-5">
                <p className="cl-kicker">Evidence & blockers</p>
                <p className="mt-2 text-sm text-stone-600">{projection.input.evidence.length} evidence refs · {projection.result.blockers.length} blockers</p>
                <div className="mt-3 divide-y divide-stone-200 border-y border-stone-300">
                  {projection.result.blockers.length === 0 ? (
                    <p className="py-3 text-sm text-emerald-700">No canonical blocker is currently open in this Director projection.</p>
                  ) : projection.result.blockers.map((blocker) => (
                    <div key={blocker.blockerId} className="border-l-2 border-amber-500 py-3 pl-4 text-sm">
                      <strong>{blocker.category}</strong>
                      <p className="mt-1 text-stone-600">{blocker.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <footer className="grid gap-px border-y border-stone-300 bg-stone-300 font-mono text-[9px] uppercase tracking-[0.1em] sm:grid-cols-3 lg:grid-cols-5">
              <div className="bg-stone-50 p-3"><span className="text-stone-400">Fingerprint</span><p className="mt-1 break-all normal-case text-neutral-950">{projectFingerprint}</p></div>
              <div className="bg-stone-50 p-3"><span className="text-stone-400">Evaluation</span><p className="mt-1 normal-case text-neutral-950">{projection.evaluationTimestamp}</p></div>
              <div className="bg-stone-50 p-3"><span className="text-stone-400">Project status</span><p className="mt-1 text-neutral-950">{project.status}</p></div>
              <div className="bg-stone-50 p-3"><span className="text-stone-400">Phase</span><p className="mt-1 text-blue-700">{projection.result.resolvedPhase}</p></div>
              <div className="bg-stone-50 p-3"><span className="text-stone-400">Proposal effects</span><p className="mt-1 text-neutral-950">none</p></div>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
