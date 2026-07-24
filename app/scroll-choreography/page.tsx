"use client"

import * as React from "react"
import { ArrowDown, ChevronDown, Clapperboard, Layers, RotateCcw, SlidersHorizontal } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ScrollChoreography } from "@/components/ui/scroll-choreography"

const chapters = [
  { id: "product", label: "Product Story" },
  { id: "evidence", label: "Evidence Walkthrough" },
  { id: "cinematic", label: "Cinematic Sequence" },
] as const

const productStory = [
  { title: "Problem", body: "Launch teams explain complex workflows with static screenshots and lose the thread between promise and proof." },
  { title: "Mechanism", body: "Scroll choreography lets each section introduce one moving relationship: context, mechanism, then result." },
  { title: "Result", body: "The case study becomes a guided product story that can be captured, replayed and reviewed frame by frame." },
]

const evidenceSteps = [
  { title: "Claim", value: "12 min", label: "Manual review time before the prototype pass" },
  { title: "Proof", value: "4 checks", label: "Visible gates shown in the walkthrough artifact" },
  { title: "Consequence", value: "3 min", label: "Decision time after the story is choreographed" },
]

const panelImages = {
  topLeft: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%23161411'/%3E%3Ccircle cx='220' cy='180' r='150' fill='%233a3128'/%3E%3Cpath d='M80 470h720' stroke='%23d8cab1' stroke-width='8'/%3E%3C/svg%3E",
  topRight: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%23090b0c'/%3E%3Cpath d='M120 430C260 160 590 130 780 310' fill='none' stroke='%2367e8f9' stroke-width='20'/%3E%3Ccircle cx='660' cy='210' r='92' fill='%23f5f3ee'/%3E%3C/svg%3E",
  bottomLeft: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%23201814'/%3E%3Crect x='120' y='120' width='660' height='360' rx='24' fill='%23e8dfcf'/%3E%3Cpath d='M190 230h500M190 310h360M190 390h430' stroke='%23201814' stroke-width='18'/%3E%3C/svg%3E",
  bottomRight: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%23101210'/%3E%3Crect x='180' y='130' width='540' height='340' rx='160' fill='%23a3e635'/%3E%3Ccircle cx='450' cy='300' r='110' fill='%23101210'/%3E%3C/svg%3E",
}

function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = React.useState(ids[0] ?? "")

  React.useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveId(visible.target.id)
      },
      { root: null, rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function ScrollChoreographyLabPage() {
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const activeId = useActiveSection(chapters.map((chapter) => chapter.id))

  return (
    <main className="min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100">
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3efe6]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Scroll Choreography</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <LabNavigation className="contents" linkClassName="px-3.5" activeClassName="bg-neutral-950 font-semibold text-white shadow-xs" inactiveClassName="border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950" />
            <button type="button" onClick={() => setReduceMotion((value) => !value)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${reduceMotion ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30" : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"}`} aria-pressed={reduceMotion}>
              <SlidersHorizontal className="h-3.5 w-3.5" />{reduceMotion ? "Motion reduite" : "Motion standard"}
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-[76px] z-30 border-b border-stone-300/70 bg-[#f3efe6]/85 px-4 py-3 backdrop-blur md:px-8" aria-label="Scroll choreography sections">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-xs">
          {chapters.map((chapter, index) => (
            <button key={chapter.id} type="button" onClick={() => scrollToId(chapter.id)} className={`rounded-lg border px-3 py-2 font-mono font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 ${activeId === chapter.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500"}`}>
              {index + 1}. {chapter.label}
            </button>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-neutral-500"><ArrowDown className="h-3.5 w-3.5" /> Scroll to advance</span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 md:px-8 md:py-12">
        <section id="cinematic" className="scroll-mt-32 overflow-hidden rounded-2xl border border-neutral-950 bg-neutral-950 text-white shadow-2xl" data-scroll-choreography-variant="cinematic">
          <div className="grid gap-6 p-6 md:grid-cols-[0.8fr_1.2fr] md:p-10">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-200">Hero Demo Moment</span>
              <h2 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">A sticky scene that resolves into proof.</h2>
              <p className="max-w-md text-sm leading-relaxed text-stone-300">Initial fragments drift, align at the pivot, then hold a final hero frame at the bottom of the section for deterministic capture.</p>
              <button type="button" onClick={() => scrollToId("cinematic")} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"><RotateCcw className="h-4 w-4" /> Retour au debut</button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs font-mono text-stone-400">
              <p>Capture target: 8-12 seconds</p><p>Initial → pivot → final frame</p><p>Final frame remains visible at section end</p>
            </div>
          </div>
          <ScrollChoreography images={panelImages} reduceMotion={reduceMotion} className="bg-neutral-950" />
        </section>

        <section id="product" className="scroll-mt-32 rounded-2xl border border-stone-300 bg-[#fbfaf6] p-6 md:p-8 shadow-sm" data-scroll-choreography-variant="product">
          <div className="mb-8 flex items-start justify-between gap-4 border-b border-stone-300 pb-4"><div><p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-500">Product Story</p><h2 className="mt-1 text-3xl font-bold tracking-tight">From stalled explanation to guided launch story.</h2></div><Layers className="h-6 w-6 text-neutral-700" /></div>
          <div className="grid gap-4 md:grid-cols-3">
            {productStory.map((chapter, index) => <article key={chapter.title} className="rounded-xl border border-stone-300 bg-stone-100/70 p-5"><p className="font-mono text-xs font-bold text-neutral-500">0{index + 1}</p><h3 className="mt-3 text-xl font-bold">{chapter.title}</h3><p className="mt-3 text-sm leading-6 text-neutral-600">{chapter.body}</p></article>)}
          </div>
        </section>

        <section id="evidence" className="scroll-mt-32 rounded-2xl border border-stone-800 bg-[#141310] p-6 text-stone-50 md:p-8 shadow-md" data-scroll-choreography-variant="evidence">
          <div className="mb-8 flex items-start justify-between gap-4 border-b border-stone-800 pb-4"><div><p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-lime-300">Evidence Walkthrough</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Claim, proof and consequence in one artifact.</h2></div><Clapperboard className="h-6 w-6 text-lime-300" /></div>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">{evidenceSteps.map((step, index) => <div key={step.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-lime-300">{step.title}</p><p className="mt-2 text-sm leading-6 text-stone-300">{step.label}</p><p className="mt-2 font-mono text-2xl font-bold tabular-nums">{step.value}</p><div className="mt-3 h-2 rounded-full bg-black/40"><div className="h-full rounded-full bg-lime-300" style={{ width: `${(index + 1) * 33}%` }} /></div></div>)}</div>
            <div className="min-h-[360px] rounded-xl border border-white/10 bg-[#090a08] p-6"><div className="grid h-full grid-rows-3 gap-3">{evidenceSteps.map((step) => <div key={step.title} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4"><span className="font-mono text-xs uppercase tracking-[0.18em] text-stone-400">{step.title}</span><span className="text-3xl font-black text-lime-200">{step.value}</span></div>)}</div></div>
          </div>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#e8e1d4] p-5 text-xs text-neutral-700"><details className="group"><summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-950 select-none"><span>Capture and robustness notes</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><div className="mt-4 border-t border-stone-300 pt-4 leading-6"><p>IntersectionObserver updates chapter state and disconnects on unmount. Framer Motion useScroll owns scroll subscriptions for the hero component. Motion reduced renders a static, readable four-panel layout.</p></div></details></section>
      </div>
    </main>
  )
}
