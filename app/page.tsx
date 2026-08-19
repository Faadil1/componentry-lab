import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"

import { authOptions, authRuntimeSummary } from "@/auth"
import { AuthControls } from "@/components/auth/auth-controls"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { buildCommandProjection } from "@/lib/command/projection"

export const metadata: Metadata = {
  title: "Command",
  description: "Read-only orchestration of canonical system truth for Componentry Lab.",
}

export default async function CommandPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = searchParams ? await searchParams : {}
  const projectId = typeof params.project === "string" ? params.project : undefined
  const session = authRuntimeSummary.oauthConfigured ? await getServerSession(authOptions) : null
  const projection = await buildCommandProjection(projectId)
  const activeProject = projection.activeProject

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-950 selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-stone-300 bg-stone-50/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto max-w-screen-xl">
          <LabNavigation projectId={projectId} />
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl space-y-10 px-4 pb-16 pt-8 md:px-8 lg:pt-12">
        <section className="grid gap-8 border-b border-stone-300 pb-10 lg:grid-cols-[1fr_19rem] lg:items-end">
          <div>
            <p className="cl-kicker">System / Command</p>
            <h1 className="cl-display mt-4 max-w-5xl text-5xl text-neutral-950 sm:text-6xl lg:text-7xl">
              {activeProject ? activeProject.title : "Project unavailable"}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">
              {activeProject
                ? activeProject.description
                : "The canonical project context could not be resolved."}
            </p>
          </div>

          <dl className="divide-y divide-stone-300 border-y border-stone-300 font-mono text-[10px] uppercase tracking-[0.12em]">
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="pt-1 text-stone-500">Auth</dt>
              <dd className="min-w-0 text-right normal-case tracking-normal text-neutral-950">
                <AuthControls
                  authenticated={!!session?.user}
                  available={authRuntimeSummary.oauthConfigured}
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-stone-500">OAuth</dt>
              <dd className="text-neutral-950">{authRuntimeSummary.oauthConfigured ? "configured" : "not configured"}</dd>
            </div>
            {activeProject ? (
              <>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-stone-500">Type</dt>
                  <dd className="text-neutral-950">{activeProject.kind.replace(/-/g, " ")}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-stone-500">Phase</dt>
                  <dd className="cl-status-info">{projection.projectPhase}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-stone-500">Readiness</dt>
                  <dd className="text-neutral-950">{projection.readiness}%</dd>
                </div>
              </>
            ) : null}
          </dl>
        </section>

        <section className="grid gap-8 lg:grid-cols-[9rem_1fr]">
          <div className="border-l border-blue-600 pl-3">
            <p className="cl-kicker">Director recommendation</p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-500">Exactly one next move</p>
          </div>

          <article className="border-y border-stone-300 py-7">
            <h2 className="cl-display max-w-4xl text-4xl text-neutral-950 sm:text-5xl">
              {projection.directorNextAction?.title ?? "Unavailable"}
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">
              {projection.directorRationaleSummary ?? "No director result available."}
            </p>
            <div className="mt-7 grid gap-px border border-stone-300 bg-stone-300 sm:grid-cols-3">
              <div className="bg-stone-50 p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Project state</p>
                <p className="mt-2 text-sm font-semibold">{activeProject?.status ?? "unavailable"}</p>
              </div>
              <div className="bg-stone-50 p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Recommended phase</p>
                <p className="mt-2 text-sm font-semibold text-blue-700">{projection.projectPhase}</p>
              </div>
              <div className="bg-stone-50 p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">Authority</p>
                <p className="mt-2 text-sm font-semibold">read-only orchestration</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
