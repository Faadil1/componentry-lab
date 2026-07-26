import type { Metadata } from "next"
import Link from "next/link"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { getFilmProjectIndex } from "@/lib/film-kit"

export const metadata: Metadata = {
  title: "Universal Demo Film Kit",
  description: "Index of the three Film Kit routes derived from Project Brain.",
}

export default function FilmKitIndexPage() {
  const films = getFilmProjectIndex()

  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500 font-bold">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-stone-100">Universal Demo Film Kit</h1>
          </div>
          <LabNavigation className="contents" linkClassName="px-3.5" activeClassName="bg-stone-100 font-semibold text-stone-900 shadow-xs" inactiveClassName="border border-stone-700 bg-stone-900/80 text-stone-400 transition hover:border-stone-500 hover:text-stone-200" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <section className="space-y-4 rounded-2xl border border-stone-800 bg-[#0e0d0c] p-6 md:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Film Kit index</p>
          <h2 className="max-w-3xl text-balance text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">Three project films, derived from Project Brain, ready for planning and export.</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">Each route keeps Project Brain read-only and focuses the workspace on a different narrative architecture, capture strategy, and approval flow.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {films.map((film) => (
            <article key={film.id} className="rounded-xl border border-stone-300 bg-white p-5 text-neutral-950">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">/{film.slug}</p>
              <h3 className="mt-2 text-xl font-bold">{film.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{film.purpose}</p>
              <Link href={`/film-kit/${film.id}`} className="mt-4 inline-flex rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-xs font-medium text-white">Open route</Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}