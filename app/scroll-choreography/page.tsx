"use client"

import * as React from "react"
import { ArrowDown, CheckCircle2, ChevronDown, Clapperboard, Layers, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { ScrollChoreography } from "@/components/ui/scroll-choreography"

const chapters = [
  { id: "cinematic", label: "01. Cinematic Hero" },
  { id: "product", label: "02. Product Story" },
  { id: "evidence", label: "03. Evidence Walkthrough" },
] as const

const productStory = [
  {
    step: "01 // PROBLEM",
    title: "Fragmented Signals",
    subtitle: "Explications statiques décousues",
    body: "Les équipes de lancement perdent l’attention avec des captures fixes qui séparent la promesse de sa preuve d’exécution.",
    badge: "Problem",
  },
  {
    step: "02 // MECHANISM",
    title: "Choreographed Layer",
    subtitle: "Mouvement fluide guidé par le scroll",
    body: "La chorégraphie pilotée par le défilement introduit chaque relation logique : contexte, mécanisme, puis résultat immédiat.",
    badge: "Mechanism",
  },
  {
    step: "03 // RESULT",
    title: "Guided Product Story",
    subtitle: "Preuve interactive déterministe",
    body: "L’étude de cas devient un récit produit autonome, capturable frame par frame et vérifiable à tout moment.",
    badge: "Result",
  },
]

const evidenceSteps = [
  { title: "01 // CLAIM", value: "12 min", label: "Temps de revue manuelle avant la passe prototype", status: "Baseline" },
  { title: "02 // PROOF", value: "4 gates", label: "Contrôles de validation visibles dans le walkthrough", status: "Verified" },
  { title: "03 // CONSEQUENCE", value: "3 min", label: "Temps de décision final une fois le récit chorégraphié", status: "Optimized" },
]

// High-fidelity SVG panel graphics for 4-stage scroll sequence
const panelImages = {
  topLeft: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="%23121110"/><rect x="60" y="60" width="780" height="480" rx="16" fill="%231a1917" stroke="%2333312e" stroke-width="2"/><text x="100" y="140" fill="%2367e8f9" font-family="monospace" font-size="20" font-weight="bold">01 // CONTEXT STAGE</text><text x="100" y="220" fill="%23f5f3ee" font-family="sans-serif" font-size="38" font-weight="bold">Interfaces begin in silence.</text><text x="100" y="280" fill="%23a8a39a" font-family="sans-serif" font-size="20">Initial quiet drift before structural alignment.</text><circle cx="720" cy="420" r="60" fill="%2324221f" stroke="%2367e8f9" stroke-width="4"/><path d="M700 420h40M720 400v40" stroke="%2367e8f9" stroke-width="4"/></svg>`,
  bottomLeft: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="%23141311"/><rect x="60" y="60" width="780" height="480" rx="16" fill="%231e1c19" stroke="%23383531" stroke-width="2"/><text x="100" y="140" fill="%2367e8f9" font-family="monospace" font-size="20" font-weight="bold">02 // MECHANISM STAGE</text><text x="100" y="220" fill="%23f5f3ee" font-family="sans-serif" font-size="38" font-weight="bold">Motion establishes structure.</text><rect x="100" y="270" width="700" height="180" rx="12" fill="%23100f0e" stroke="%2367e8f9" stroke-width="2" stroke-dasharray="8 8"/><text x="140" y="360" fill="%2367e8f9" font-family="monospace" font-size="24">3D STACK ALIGNMENT IN PROGRESS</text></svg>`,
  bottomRight: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="%230f1412"/><rect x="60" y="60" width="780" height="480" rx="16" fill="%23151f1b" stroke="%2322473a" stroke-width="2"/><text x="100" y="140" fill="%2334d399" font-family="monospace" font-size="20" font-weight="bold">03 // PIVOT STAGE</text><text x="100" y="220" fill="%23f5f3ee" font-family="sans-serif" font-size="38" font-weight="bold">Focal Point Centered.</text><rect x="100" y="270" width="320" height="180" rx="12" fill="%230b1411" stroke="%2334d399" stroke-width="2"/><text x="130" y="340" fill="%2334d399" font-family="monospace" font-size="20">FOCAL MATRIX</text><text x="130" y="390" fill="%23f5f3ee" font-family="monospace" font-size="32" font-weight="bold">99.99%</text></svg>`,
  topRight: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="%230a0d10"/><rect x="60" y="60" width="780" height="480" rx="16" fill="%23111921" stroke="%2367e8f9" stroke-width="3"/><text x="100" y="140" fill="%2367e8f9" font-family="monospace" font-size="22" font-weight="bold">04 // FINAL PROOF &amp; REVELATION</text><text x="100" y="230" fill="%23ffffff" font-family="sans-serif" font-size="46" font-weight="bold">Choreography complete.</text><text x="100" y="300" fill="%23a5f3fc" font-family="sans-serif" font-size="24">Persistent hero frame for Remotion capture.</text><rect x="100" y="360" width="400" height="100" rx="12" fill="%2309131a" stroke="%2367e8f9" stroke-width="2"/><text x="130" y="420" fill="%2367e8f9" font-family="monospace" font-size="24" font-weight="bold">SYSTEM VERIFIED // 60FPS</text></svg>`,
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
      { root: null, rootMargin: "-30% 0px -40% 0px", threshold: [0.15, 0.4, 0.7] }
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
    <main className="min-h-screen bg-[#f3efe6] text-neutral-950 selection:bg-neutral-950 selection:text-stone-100 font-sans">
      {/* Shared Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#f3efe6]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">Scroll Choreography</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <LabNavigation
              className="contents"
              linkClassName="px-3.5"
              activeClassName="bg-neutral-950 font-semibold text-white shadow-xs"
              inactiveClassName="border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
            />
            <button
              type="button"
              onClick={() => setReduceMotion((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${
                reduceMotion
                  ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30"
                  : "border-stone-300 bg-stone-100 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
              }`}
              aria-pressed={reduceMotion}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {reduceMotion ? "Motion réduite" : "Motion standard"}
            </button>
          </div>
        </div>
      </header>

      {/* Discrete Chapter Navigation Bar */}
      <nav
        className="sticky top-[73px] z-30 border-b border-stone-300/70 bg-[#f3efe6]/85 px-4 py-2.5 backdrop-blur md:px-8"
        aria-label="Sections de chorégraphie"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-xs">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => scrollToId(chapter.id)}
              className={`rounded-lg border px-3.5 py-1.5 font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                activeId === chapter.id
                  ? "border-neutral-950 bg-neutral-950 text-white shadow-xs"
                  : "border-stone-300 bg-stone-100/80 text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
              }`}
            >
              {chapter.label}
            </button>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-mono text-neutral-500">
            <ArrowDown className="h-3.5 w-3.5 text-cyan-600 animate-bounce" /> Scroll to advance
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 md:px-8 md:py-12">
        {/* HERO DEMO MOMENT: CINEMATIC SCROLL SEQUENCE (SCÈNE DOMINANTE) */}
        <section
          id="cinematic"
          className="scroll-mt-32 overflow-hidden rounded-2xl border border-stone-900 bg-[#121110] text-white shadow-2xl"
          data-scroll-choreography-variant="cinematic"
        >
          {/* Hero Header & Context */}
          <div className="grid gap-6 p-6 md:grid-cols-[0.8fr_1.2fr] md:p-10 border-b border-stone-800/80 bg-[#181715]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-cyan-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-ping" />
                </span>
                <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-200">
                  Hero Demo Moment — 8–12s Capture
                </span>
              </div>

              <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#f5f3ee] md:text-6xl">
                A sticky scene that resolves into proof.
              </h2>

              <p className="max-w-md text-sm leading-relaxed text-stone-300 font-sans">
                Les fragments initiaux dérivent (0%), s’alignent au pivot (68%), puis se stabilisent en une frame finale haute résolution (100%) prête pour la capture vidéo.
              </p>

              <button
                type="button"
                onClick={() => scrollToId("cinematic")}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-mono font-bold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Recommencer le défilement
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 text-xs font-mono text-stone-300 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-cyan-300 font-bold uppercase tracking-wider">Séquence Déterministe</span>
                <span>Target: 8–12s</span>
              </div>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p>• <strong className="text-stone-100">0% — Context</strong> : Scène initiale épurée</p>
                <p>• <strong className="text-stone-100">35% — Mechanism</strong> : Alignement diagonal des cartes</p>
                <p>• <strong className="text-stone-100">68% — Pivot</strong> : Empilement centré de la matrice</p>
                <p>• <strong className="text-cyan-300">100% — Proof</strong> : Extension plein écran stabilisée</p>
              </div>
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                <span>Remotion / Playwright Ready</span>
                <span className="text-emerald-400 font-bold">60 FPS</span>
              </div>
            </div>
          </div>

          {/* Sticky 4-Phase Choreography Component Stage */}
          <ScrollChoreography images={panelImages} reduceMotion={reduceMotion} className="bg-[#0c0b0a]" />
        </section>

        {/* SECONDARY VARIANT 1: PRODUCT STORY */}
        <section
          id="product"
          className="scroll-mt-32 rounded-2xl border border-stone-300 bg-[#faf8f3] p-6 md:p-8 shadow-sm space-y-8"
          data-scroll-choreography-variant="product"
        >
          <div className="flex items-start justify-between gap-4 border-b border-stone-300/80 pb-4">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Product Story
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                From stalled explanation to guided launch story.
              </h2>
            </div>
            <Layers className="h-6 w-6 text-neutral-700 shrink-0" />
          </div>

          {/* 3 Structured Story Steps */}
          <div className="grid gap-6 md:grid-cols-3">
            {productStory.map((chapter) => (
              <article
                key={chapter.title}
                className="flex flex-col justify-between rounded-xl border border-stone-300 bg-[#f3efe6] p-6 space-y-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-neutral-500">{chapter.step}</span>
                    <span className="rounded bg-neutral-900/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-800">
                      {chapter.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-950 pt-1">{chapter.title}</h3>
                  <p className="text-xs font-mono text-neutral-600">{chapter.subtitle}</p>
                  <p className="text-xs md:text-sm leading-relaxed text-neutral-700 pt-2">{chapter.body}</p>
                </div>

                <div className="pt-3 border-t border-stone-300/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Artifact State</span>
                  <span className="text-neutral-900 font-bold">VERIFIED</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECONDARY VARIANT 2: EVIDENCE WALKTHROUGH */}
        <section
          id="evidence"
          className="scroll-mt-32 rounded-2xl border border-stone-800 bg-[#161513] p-6 text-stone-50 md:p-8 shadow-md space-y-8"
          data-scroll-choreography-variant="evidence"
        >
          <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Evidence Walkthrough
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                Claim, proof and consequence in one artifact.
              </h2>
            </div>
            <ShieldCheck className="h-6 w-6 text-cyan-300 shrink-0" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Step Metric Cards */}
            <div className="space-y-4">
              {evidenceSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-stone-800 bg-[#0e0d0c] p-5 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                      {step.title}
                    </p>
                    <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300 font-bold">
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">{step.label}</p>
                  <p className="font-mono text-3xl font-bold tabular-nums text-white pt-1">{step.value}</p>
                </div>
              ))}
            </div>

            {/* Central Evidence Artifact Visual */}
            <div className="min-h-[380px] rounded-xl border border-stone-800 bg-[#0a0a09] p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 font-mono text-xs text-stone-400">
                <span>Central Evidence Matrix</span>
                <span className="text-cyan-300 font-bold">LIVE METRIC PASS</span>
              </div>

              <div className="grid grid-rows-3 gap-3 my-auto">
                {evidenceSteps.map((step) => (
                  <div
                    key={step.title}
                    className="flex items-center justify-between rounded-lg border border-stone-800 bg-[#141311] px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-300 shrink-0" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-300">
                        {step.title}
                      </span>
                    </div>
                    <span className="font-mono text-2xl font-bold text-cyan-300 tabular-nums">{step.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>Automated Walkthrough Audit</span>
                <span className="text-emerald-400 font-bold">PASSED</span>
              </div>
            </div>
          </div>
        </section>

        {/* COLLAPSIBLE CAPTURE NOTES SECTION (CLOSED BY DEFAULT) */}
        <section className="pt-2">
          <details className="group rounded-xl border border-stone-300/80 bg-[#eae8e3] p-4 text-xs text-neutral-700 transition-all">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900 select-none">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-cyan-700" />
                <span>Consignes de Capture &amp; Automation Scroll (Remotion / Playwright)</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-4 space-y-3 border-t border-stone-300/80 pt-4 leading-relaxed font-mono text-[11px] text-neutral-600">
              <p>
                • Chaque variante expose un sélecteur stable :{" "}
                <code className="rounded bg-stone-300/70 px-1.5 py-0.5 text-neutral-900 font-bold">
                  data-scroll-choreography-variant=&quot;cinematic | product | evidence&quot;
                </code>.
              </p>
              <p>
                • <strong className="text-neutral-900">IntersectionObserver</strong> met à jour l’état des chapitres dans la barre de navigation et se déconnecte proprement au démontage.
              </p>
              <p>
                • Le mode <strong className="text-neutral-900">Motion réduite</strong> bascule le composant Hero vers une grille statique lisible de 4 panneaux indépendants.
              </p>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
