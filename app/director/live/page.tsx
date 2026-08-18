import Link from "next/link"

import { authRuntimeSummary } from "@/auth"
import { GovernedActionPanel } from "@/components/director/governed-action-panel"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { buildDualLibraryProjection } from "@/lib/creative-os/collaboration"
import {
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
import { listProjects } from "@/lib/projects/repository"
import { requireCanonicalWriteAccess } from "@/lib/security/canonical-write-access"

export const dynamic = "force-dynamic"

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
  const projectFingerprint = project ? fingerprintProjectBrain(project) : ""

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6">
          <LabNavigation compact projectId={project?.id ?? null} />
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-neutral-950 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">Live Project Brain</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">Governed projection + bounded writes</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Creative Director — Live Collaboration</h1>
              <p className="text-sm leading-relaxed text-stone-600">
                Canonical Project Brain context is evaluated against Registry V2 governed methods while the Component Library remains a separate composition-intelligence plane. Proposals remain read-only until an exact typed mutation passes owner authentication, explicit approval, scope validation, and stale-state checks.
              </p>
            </div>
            <Link href="/director" className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100">Open fixture lab</Link>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Canonical projects</p>
              <h2 className="text-base font-bold">Choose live Project Brain context</h2>
            </div>
            <span className="text-xs text-stone-500">{compatibleProjects.length} Director-compatible / {projects.length} total</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {summaries.map((summary) => {
              const active = project?.id === summary.id
              if (!summary.compatible) {
                return (
                  <div key={summary.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3 opacity-70">
                    <p className="truncate text-sm font-semibold">{summary.title}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase text-stone-500">{summary.kind} · unmapped</p>
                  </div>
                )
              }
              return (
                <Link
                  key={summary.id}
                  href={`/director/live?project=${encodeURIComponent(summary.id)}`}
                  className={`rounded-xl border p-3 transition ${active ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-200 bg-white hover:border-stone-400"}`}
                >
                  <p className="truncate text-sm font-semibold">{summary.title}</p>
                  <p className={`mt-1 font-mono text-[10px] uppercase ${active ? "text-stone-300" : "text-stone-500"}`}>{summary.mode} · {summary.currentPhase}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {!project || !projection ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            No Project Brain project currently has an explicit Director mode mapping. Unsupported kinds fail closed rather than being coerced into a mode.
          </section>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Canonical Project Brain</p>
                    <h2 className="mt-1 text-xl font-black">{project.title}</h2>
                    <p className="mt-1 text-sm text-stone-600">{project.description}</p>
                  </div>
                  <div className="text-right font-mono text-[10px] uppercase text-stone-500">
                    <div>{projection.mode}</div>
                    <div>{projection.result.resolvedPhase}</div>
                    <div>{project.status}</div>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-stone-50 p-3">
                    <dt className="font-mono text-[9px] font-bold uppercase text-stone-500">Primary goal</dt>
                    <dd className="mt-1 text-sm font-medium">{project.primaryGoal}</dd>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3">
                    <dt className="font-mono text-[9px] font-bold uppercase text-stone-500">Success definition</dt>
                    <dd className="mt-1 text-sm font-medium">{project.successDefinition}</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5 text-white shadow-lg">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">One canonical next action</p>
                <h2 className="mt-2 text-xl font-black">{projection.result.nextAction.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-300">{projection.result.nextAction.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase">
                  <span className="rounded-full border border-stone-700 px-2.5 py-1">{projection.result.nextAction.authorityRequirement}</span>
                  <span className="rounded-full border border-stone-700 px-2.5 py-1">proposal side effects: none</span>
                </div>
              </article>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
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
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-stone-500">Registry V2 governance</p>
                <p className="mt-2 text-3xl font-black">{libraries.counts.governedCapabilities}</p>
                <p className="mt-1 text-xs text-stone-600">governed entities, with only qualified METHOD entries eligible for internal advisory execution.</p>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-stone-500">Component Library</p>
                <p className="mt-2 text-3xl font-black">{libraries.counts.compositions}</p>
                <p className="mt-1 text-xs text-stone-600">composition/build descriptors preserved separately from governance authority.</p>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-stone-500">Director skill pool</p>
                <p className="mt-2 text-3xl font-black">{projection.input.availableSkills.length}</p>
                <p className="mt-1 text-xs text-stone-600">Registry-derived governed internal methods available before mode/phase filtering.</p>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-stone-500">Selected methods</p>
                <p className="mt-2 text-3xl font-black">{projection.result.selectedSkills.length}</p>
                <p className="mt-1 text-xs text-stone-600">mode-, phase- and authority-compatible methods selected for this live project.</p>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Governed method collaboration</p>
                    <h2 className="text-base font-bold">Selected Registry methods</h2>
                  </div>
                  <span className="font-mono text-[10px] text-stone-500">METHOD only</span>
                </div>
                <div className="mt-4 space-y-2">
                  {projection.result.selectedSkills.length === 0 ? (
                    <p className="rounded-xl bg-stone-50 p-3 text-sm text-stone-600">No method is eligible for the current mode/phase/authority combination.</p>
                  ) : projection.result.selectedSkills.map((skill) => (
                    <div key={skill.skillId} className="rounded-xl border border-stone-200 p-3">
                      <p className="text-sm font-semibold">{skill.title}</p>
                      <p className="mt-1 break-all font-mono text-[9px] text-stone-500">{skill.skillId}</p>
                      <p className="mt-1 text-xs text-stone-600">{skill.capabilityGaps?.join(" · ") || "No capability gaps declared"}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Collaboration mesh status</p>
                <h2 className="text-base font-bold">Supporting systems remain bounded</h2>
                <div className="mt-4 grid gap-2 text-sm">
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
                    <div key={label} className="flex gap-3 rounded-xl bg-stone-50 p-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      <div><strong>{label}</strong><span className="text-stone-600"> — {description}</span></div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Quality gates</p>
                <div className="mt-3 space-y-2">
                  {projection.result.gateEvaluations.map((gate) => (
                    <div key={gate.gateId} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3 text-sm">
                      <span className="font-medium">{gate.name}</span>
                      <span className="font-mono text-[10px] font-bold uppercase text-stone-600">{gate.status}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Evidence & blockers</p>
                <p className="mt-2 text-sm text-stone-600">{projection.input.evidence.length} evidence refs · {projection.result.blockers.length} blockers</p>
                <div className="mt-3 space-y-2">
                  {projection.result.blockers.length === 0 ? (
                    <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">No canonical blocker is currently open in this Director projection.</p>
                  ) : projection.result.blockers.map((blocker) => (
                    <div key={blocker.blockerId} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <strong>{blocker.category}</strong><p className="mt-1">{blocker.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
