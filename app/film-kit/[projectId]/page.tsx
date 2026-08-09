import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"

import { FilmKitAi33Panel, FilmKitPacketExport, FilmKitProvider, FilmKitWorkspace } from "@/components/film-kit"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { buildAi33Packet } from "@/lib/film-kit/presets"
import { buildFilmKitPackets } from "@/lib/film-kit/packets"
import { FILM_PROJECT_IDS } from "@/lib/film-kit/schema"
import { getFilmProjectById, getFilmProjectIndex } from "@/lib/film-kit/selectors"
import { getFilmProductionIntent } from "@/lib/film-kit/production-adapter"
import type { ExternalCapabilityPlanRequest } from "@/lib/creative-os/film-kit/types"
import { dispatchExternalCapabilityPlan } from "@/lib/creative-os/film-kit/dispatcher"
import { buildProductionEntryProposal } from "@/lib/creative-os/production/entry"
import { listPlansForProject, savePlan, getPlanningRepositoryPath } from "@/lib/creative-os/production/planning-repository"
import { getProjectById } from "@/lib/projects/repository"
import type { ResourceEvaluation } from "@/lib/creative-os/types"
import { RESOURCE_REGISTRY } from "@/lib/creative-os/registry"

function getSelectedResource(projectId: string): ResourceEvaluation | null {
  const resource = projectId === "stated" ? RESOURCE_REGISTRY.find((candidate) => candidate.id === "res_video_shotcraft") ?? null : projectId === "glow-atelier" ? RESOURCE_REGISTRY.find((candidate) => candidate.id === "res_cineprompt") ?? null : null
  if (!resource) return null
  return {
    resourceId: resource.id,
    name: resource.name,
    type: resource.type,
    lifecycleState: resource.lifecycleState,
    maxExecutionAuthority: resource.maxExecutionAuthority,
    isRecommendable: resource.lifecycleState === "VALIDATED" || resource.lifecycleState === "AUDITED",
    suitabilityScore: 100,
    matchingCapabilities: resource.capabilities.capabilityGaps,
    progressiveLoadLevel: "LEVEL_0_METADATA",
    recommendationLabel: "VALIDATED_FALLBACK",
  }
}

type FilmKitProjectPageProps = { params: Promise<{ projectId: string }> }

function FilmKitWorkspaceFallback() {
  return <section aria-label="Loading Film Kit workspace" className="rounded-xl border border-stone-300 bg-white p-6 text-neutral-950"><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Film Kit</p><p className="mt-3 text-sm text-stone-600">Loading the project film workspace...</p></section>
}

export function generateStaticParams() { return getFilmProjectIndex().map((film) => ({ projectId: film.id })) }

export async function generateMetadata({ params }: FilmKitProjectPageProps): Promise<Metadata> {
  const { projectId } = await params
  const film = getFilmProjectById(projectId)
  if (!film) return { title: "Film Kit" }
  return { title: film.brief.title, description: film.brief.primaryProof }
}

export async function prepareProductionPlanAction(formData: FormData) {
  "use server"
  const projectId = String(formData.get("projectId") ?? "")
  const projectBrain = getProjectById(projectId)
  if (!projectBrain) notFound()
  const film = getFilmProjectById(projectId)
  if (!film) notFound()
  const projectBrainResolved = projectBrain as NonNullable<typeof projectBrain>
  const projectMode = projectBrainResolved.kind === "creative-experiment" ? "MARA" : projectBrainResolved.kind === "data-story" ? "DATA_STORY" : projectBrainResolved.kind === "hackathon" || projectBrainResolved.kind === "broadcast-interface" || projectBrainResolved.kind === "demo-film" ? "HACKATHON" : "DAY_CHALLENGE"
  const proposal = buildProductionEntryProposal(projectBrainResolved, film)
  const selectedResource = getSelectedResource(projectId)
  const productionIntent = getFilmProductionIntent(film)
  const preparedPlanRequest: ExternalCapabilityPlanRequest = {
    capabilityGap: proposal.plan?.capabilityId ?? (productionIntent.requestedOutputs[0] ?? undefined),
    artifactType: proposal.plan?.requestedArtifact ?? (productionIntent.requestedOutputs[0] ?? undefined),
    projectMode,
    phase: projectBrainResolved.currentPhase as never,
    currentAuthority: "LOCAL_REVERSIBLE",
    frameworkOrSurface: film.brief.title,
    metadata: { projectId: projectBrainResolved.id, filmProjectId: film.id },
  }
  const preparedPlan = { ...dispatchExternalCapabilityPlan(preparedPlanRequest, selectedResource), projectId: projectBrainResolved.id, projectBrainFingerprint: projectBrainResolved.id }
  const result = await savePlan(preparedPlan)
  if (result.status === "SAVED" || result.status === "ALREADY_EXISTS") redirect(`/film-kit/${projectBrainResolved.id}?prepared=1`)
}

export default async function FilmKitProjectPage({ params }: FilmKitProjectPageProps) {
  const { projectId: routeProjectId } = await params
  const film = getFilmProjectById(routeProjectId)
  if (!film) notFound()
  const projectId = film.id as (typeof FILM_PROJECT_IDS)[number]
  const filmProject = film
  const packets = buildFilmKitPackets(filmProject)
  const ai33Packet = buildAi33Packet(projectId)
  const projectBrain = getProjectById(projectId)
  if (!projectBrain) notFound()
  const projectBrainResolved = projectBrain as NonNullable<typeof projectBrain>

  const getProjectMode = (kind: typeof projectBrainResolved.kind): ExternalCapabilityPlanRequest["projectMode"] => {
    return kind === "creative-experiment" ? "MARA" : kind === "data-story" ? "DATA_STORY" : kind === "hackathon" || kind === "broadcast-interface" || kind === "demo-film" ? "HACKATHON" : "DAY_CHALLENGE"
  }

  const proposal = buildProductionEntryProposal(projectBrainResolved, filmProject)
  const savedPlans = listPlansForProject(projectId)
  const savedPlan = savedPlans[0] ?? null
  const selectedResource = getSelectedResource(projectId)
  const productionIntent = getFilmProductionIntent(filmProject)

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f4f1e8] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f4f1e8]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Componentry Lab</p><h1 className="text-base font-bold tracking-tight text-neutral-950">{film.brief.title}</h1></div>
          <LabNavigation projectId={projectId} className="contents" linkClassName="px-3.5" activeClassName="bg-neutral-950 font-semibold text-white shadow-xs" inactiveClassName="border border-stone-300 bg-white text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="grid gap-6 rounded-[2rem] border border-stone-800 bg-[#0e0d0c] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4"><p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Production entry review</p><h2 className="max-w-full break-words text-balance text-4xl font-black leading-[0.94] tracking-tight text-stone-50 md:text-6xl">Prepare Production Plan</h2><p className="max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">This prepares canonical planning truth only. It does not enter production, register a route, execute, render, or fabricate artifacts.</p></div>
          <div className="min-w-0 w-full max-w-full grid gap-3 rounded-[1.5rem] border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
            <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Plan repository</p><p className="mt-1 max-w-full whitespace-normal break-words leading-relaxed">{getPlanningRepositoryPath()}</p></div>
            <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Current plans</p><p className="mt-1 max-w-full whitespace-normal break-words leading-relaxed">{savedPlans.length}</p></div>
            <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Entry status</p><p className="mt-1 max-w-full whitespace-normal [overflow-wrap:anywhere] leading-relaxed">{proposal.legitimacy}</p></div>
          </div>
        </section>
        <section className="grid gap-6 rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm md:p-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Production plan</p>
            <h2 className="text-3xl font-black tracking-tight text-neutral-950 md:text-4xl">{proposal.routeTruth?.requestedArtifactType ?? "Unavailable"}</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-700">Requested output: {proposal.plan?.requestedArtifact ?? "none"}. Capability: {proposal.plan?.capabilityId ?? "none"}. Resource: {selectedResource?.name ?? proposal.plan?.resourceId ?? "none"}. Authority: LOCAL_REVERSIBLE.</p>
            <form action={prepareProductionPlanAction}><input type="hidden" name="projectId" value={projectId} /><button type="submit" className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">Prepare Production Plan</button></form>
          </div>
          <div className="space-y-3 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">License</span><p className="mt-1">{proposal.routeTruth?.licenseState ?? "UNKNOWN"}</p></div>
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Privacy</span><p className="mt-1">{proposal.routeTruth?.privacyClass ?? "UNKNOWN"}</p></div>
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Cost</span><p className="mt-1">{proposal.routeTruth?.estimatedCost ?? "0"}</p></div>
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Quality gates</span><p className="mt-1">{proposal.routeTruth?.qualityGates.join(", ") ?? "none"}</p></div>
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">Routes / artifacts</span><p className="mt-1">0 / 0</p></div>
          </div>
        </section>
        <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Production intent</p><p className="mt-3 text-sm leading-relaxed text-stone-700">{productionIntent.requestedOutputs.length > 0 ? "Defined" : "Unavailable"}</p></div>
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Canonical planning truth</p><p className="mt-3 text-sm leading-relaxed text-stone-700">{savedPlan ? "Plan prepared" : "No canonical plan yet"}</p></div>
          </div>
        </section>
        <Suspense fallback={<FilmKitWorkspaceFallback />}><FilmKitProvider initialProjectId={projectId}><FilmKitWorkspace /><FilmKitPacketExport packets={packets} /><FilmKitAi33Panel packet={ai33Packet} /></FilmKitProvider></Suspense>
      </div>
    </main>
  )
}
