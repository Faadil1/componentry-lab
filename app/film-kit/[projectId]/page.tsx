import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import {
  FilmKitAi33Panel,
  FilmKitPacketExport,
  FilmKitProvider,
  FilmKitWorkspace,
} from "@/components/film-kit"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import {
  buildAi33Packet,
  buildFilmKitPackets,
  buildFilmProject,
  FILM_PROJECT_IDS,
  getFilmProjectById,
  getFilmProjectIndex,
} from "@/lib/film-kit"

type FilmKitProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
}

function FilmKitWorkspaceFallback() {
  return (
    <section
      aria-label="Loading Film Kit workspace"
      className="rounded-xl border border-stone-300 bg-white p-6 text-neutral-950"
    >
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
        Film Kit
      </p>

      <p className="mt-3 text-sm text-stone-600">
        Loading the project film workspace…
      </p>
    </section>
  )
}

export function generateStaticParams() {
  return getFilmProjectIndex().map((film) => ({
    projectId: film.id,
  }))
}

export async function generateMetadata({
  params,
}: FilmKitProjectPageProps): Promise<Metadata> {
  const { projectId } = await params
  const film = getFilmProjectById(projectId)

  if (!film) {
    return {
      title: "Film Kit",
    }
  }

  return {
    title: film.brief.title,
    description: film.brief.primaryProof,
  }
}

export default async function FilmKitProjectPage({
  params,
}: FilmKitProjectPageProps) {
  const { projectId: routeProjectId } = await params
  const film = getFilmProjectById(routeProjectId)

  if (!film) {
    notFound()
  }

  const projectId = film.id as (typeof FILM_PROJECT_IDS)[number]
  const filmProject = buildFilmProject(projectId)
  const packets = buildFilmKitPackets(filmProject)
  const ai33Packet = buildAi33Packet(projectId)

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f4f1e8]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
              Componentry Lab
            </p>

            <h1 className="text-base font-bold tracking-tight text-neutral-950">
              {film.brief.title}
            </h1>
          </div>

          <LabNavigation
            className="contents"
            linkClassName="px-3.5"
            activeClassName="bg-neutral-950 font-semibold text-white shadow-xs"
            inactiveClassName="border border-stone-300 bg-white text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <Suspense fallback={<FilmKitWorkspaceFallback />}>
          <FilmKitProvider initialProjectId={projectId}>
            <FilmKitWorkspace />

            <FilmKitPacketExport packets={packets} />

            <FilmKitAi33Panel packet={ai33Packet} />
          </FilmKitProvider>
        </Suspense>
      </div>
    </main>
  )
}