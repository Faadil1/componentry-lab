"use client"

import * as React from "react"
import Link from "next/link"
import {
  BeamSpotlightCard,
  SpotlightCard,
  TiltSpotlightCard,
} from "@/components/ui/spotlight-card"
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Film,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from "lucide-react"

type VariantFilter = "all" | "b2b" | "cinematic" | "editorial"

const filters: Array<{ value: VariantFilter; label: string }> = [
  { value: "all", label: "Toutes les scènes" },
  { value: "cinematic", label: "01. Cinématique (Hero)" },
  { value: "b2b", label: "02. B2B Enterprise" },
  { value: "editorial", label: "03. Portfolio Éditorial" },
]

export default function Home() {
  const [copiedKey, setCopiedKey] = React.useState(false)
  const [selectedFilter, setSelectedFilter] = React.useState<VariantFilter>("all")
  const [simulateReducedMotion, setSimulateReducedMotion] = React.useState(false)

  const handleCopyKey = () => {
    setCopiedKey(true)
    window.setTimeout(() => setCopiedKey(false), 1600)
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-stone-100">
      {/* Sticky Header with background blur and mineral stone tint */}
      <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-[#f5f4f0]/90 px-4 py-3 backdrop-blur-md md:px-8 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-stone-100 ring-1 ring-neutral-800">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-neutral-900">
                Componentry Lab
              </h1>
              <p className="text-xs text-neutral-500">
                Banc d’essai Spotlight Card — Prototypes &amp; Captures Démo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/"
              aria-current="page"
              className="rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white"
            >
              Spotlight Lab
            </Link>
            <Link
              href="/split-flap"
              className="rounded-lg border border-stone-300 bg-stone-100/80 px-3 py-1.5 font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:text-neutral-950"
            >
              Split Flap Lab
            </Link>
            <button
              type="button"
              onClick={() => setSimulateReducedMotion((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${
                simulateReducedMotion
                  ? "border-amber-500/60 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30"
                  : "border-stone-300 bg-stone-100/80 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
              }`}
              aria-pressed={simulateReducedMotion}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {simulateReducedMotion ? "Motion réduit : ACTIF" : "Motion : Standard"}
            </button>

            <div
              className="flex rounded-lg border border-stone-300 bg-stone-200/60 p-1"
              aria-label="Filtrer les variantes"
            >
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    selectedFilter === filter.value
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with generous top spacing preventing sticky overlap */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 md:px-8 space-y-12">
        {/* Preserved Main Page Reference Section */}
        <section className="rounded-xl border border-stone-300/80 bg-[#eae8e3] p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-700">
                Référence Préservée
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                Laboratoire de validation Componentry
              </h2>
              <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
                Version fonctionnelle originale conservée sans altération logicielle. Elle sert d’étalon de comparaison pour valider l’accessibilité tactile, le comportement pointeur et le mode réduit.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <SpotlightCard
                className="border border-stone-300 bg-stone-900 text-white min-h-[140px]"
                spotlightColor="rgba(99, 102, 241, 0.35)"
                borderColor="rgba(99, 102, 241, 0.4)"
                glowIntensity={0.2}
                borderRadius={12}
                data-spotlight-variant="preserved-original"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-mono text-indigo-300">
                      Prototype System
                    </span>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-mono">
                      v1.0-stable
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Universal Demo Film Kit
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["React 19", "Next.js 16", "Interactive"].map((label) => (
                      <span
                        key={label}
                        className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Dynamic Showcase Stage Layout */}
        <section className="space-y-8" aria-label="Variantes Spotlight Card">
          <div className="border-b border-stone-300/80 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-mono text-neutral-500">
                Scènes de Démonstration &amp; Prototypes
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                Déclinaisons Visuelles Contextuelles
              </h2>
            </div>
            <p className="text-xs text-neutral-500 font-mono">
              3 Directives graphiques adaptées aux tournages Remotion
            </p>
          </div>

          {/* SCÈNE DOMINANTE : VARIANTE CINÉMATIQUE PREMIUM (HERO DEMO STAGE) */}
          {(selectedFilter === "all" || selectedFilter === "cinematic") && (
            <article
              className="relative space-y-3 rounded-2xl border border-cyan-500/30 bg-neutral-950 p-6 md:p-8 shadow-2xl ring-1 ring-cyan-500/20"
              data-spotlight-section="cinematic"
            >
              {/* Header Hero Tag */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 items-center justify-center rounded-full bg-cyan-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-300 animate-ping" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                    Scène Dominante — Hero Demo Moment (5–8s Capture)
                  </span>
                </div>
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-mono text-cyan-300">
                  60 FPS / 4K UHD Frame Target
                </span>
              </div>

              <div className="pt-2">
                <BeamSpotlightCard
                  className="border border-cyan-500/30 bg-neutral-900/90 text-white min-h-[440px] flex flex-col justify-between"
                  beamColor="rgba(6, 182, 212, 0.45)"
                  beamWidth={280}
                  borderRadius={16}
                  data-spotlight-variant="cinematic"
                >
                  <div className="p-8 space-y-8 flex-1 flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300 uppercase">
                            Audio Raytracing Core
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            v4.2-cinematic
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight text-white pt-1">
                          AETHER Spatial Synthetic Engine
                        </h3>
                        <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
                          Module de synthèse acoustique binaurale en temps réel conçu pour les séquences de présentation haut de gamme et les films produits.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        <Film className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Interactive Spectrum Canvas */}
                    <div className="rounded-xl border border-white/10 bg-neutral-950/80 p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-cyan-400" />
                          Live Binaural Frequency Matrix
                        </span>
                        <span className="text-cyan-300 font-semibold">192 kHz / 32-Bit Float</span>
                      </div>
                      <div className="flex h-20 items-end gap-2 pt-2">
                        {[42, 68, 35, 84, 98, 62, 48, 75, 92, 100, 78, 54, 82, 64, 40, 88, 72, 50, 90, 65].map(
                          (h, idx) => (
                            <div
                              key={idx}
                              className="flex-1 rounded-t bg-gradient-to-t from-cyan-950 via-cyan-500 to-indigo-400"
                              style={{ height: `${h}%` }}
                            />
                          )
                        )}
                      </div>
                    </div>

                    {/* Stats & Action */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-t border-white/10 pt-6">
                      <div className="rounded-lg bg-neutral-950 p-3 border border-white/5">
                        <p className="text-[10px] uppercase font-mono text-neutral-400">DSP Latency</p>
                        <p className="text-base font-bold text-cyan-300 mt-0.5">0.4 ms</p>
                      </div>
                      <div className="rounded-lg bg-neutral-950 p-3 border border-white/5">
                        <p className="text-[10px] uppercase font-mono text-neutral-400">Channels</p>
                        <p className="text-base font-bold text-white mt-0.5">64.4 Atmos</p>
                      </div>
                      <div className="rounded-lg bg-neutral-950 p-3 border border-white/5">
                        <p className="text-[10px] uppercase font-mono text-neutral-400">Compute Unit</p>
                        <p className="text-base font-bold text-purple-300 mt-0.5">H100 NVLink</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-xs text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Volume2 className="h-4 w-4" />
                          Lancer la Démo Spatialised
                        </button>
                      </div>
                    </div>
                  </div>
                </BeamSpotlightCard>
              </div>
            </article>
          )}

          {/* SECONDAIRES : VARIANTES B2B ET ÉDITORIAL EN DUPLEX */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* VARIANTE B2B SOBRE */}
            {(selectedFilter === "all" || selectedFilter === "b2b") && (
              <article className="space-y-3" data-spotlight-section="b2b">
                <div className="flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-emerald-700 uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    02. Produit B2B Enterprise
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">Style Sobre &amp; Épuré</span>
                </div>

                <SpotlightCard
                  className="border border-stone-300 bg-stone-900 text-stone-100 shadow-md min-h-[440px] flex flex-col justify-between"
                  spotlightColor="rgba(16, 185, 129, 0.25)"
                  borderColor="rgba(16, 185, 129, 0.4)"
                  glowIntensity={0.2}
                  borderRadius={12}
                  data-spotlight-variant="b2b"
                >
                  <div className="p-7 space-y-6 flex-1 flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xl">
                            Vault Security Audit
                          </h3>
                          <p className="text-xs text-neutral-400 font-mono">
                            Client Finance / prod-eu-west
                          </p>
                        </div>
                      </div>
                      <BadgeCheck className="h-6 w-6 text-emerald-400" />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-neutral-950/80 p-4 border border-white/5">
                        <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                          Rotation Clé Secret
                        </p>
                        <p className="text-base font-semibold text-white mt-1">
                          Automatique (7j)
                        </p>
                      </div>
                      <div className="rounded-lg bg-neutral-950/80 p-4 border border-white/5">
                        <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                          SLA Garanti
                        </p>
                        <p className="text-base font-semibold text-emerald-400 mt-1">
                          99.999%
                        </p>
                      </div>
                    </div>

                    {/* API Secret Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                        <span>Secret API Production</span>
                        <span className="text-[10px] text-neutral-500">Lecture Seule</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-neutral-950 px-3.5 py-2.5 border border-neutral-800 text-xs font-mono text-neutral-300">
                        <span className="truncate pr-2">sk_live_99a8b7c6d5e4f3210</span>
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="text-neutral-400 hover:text-white transition-colors focus:outline-none"
                          aria-label="Copier la clé API"
                        >
                          {copiedKey ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Status Footer */}
                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Aucune dérive de sécurité détectée
                      </span>
                      <button
                        type="button"
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        Logs <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              </article>
            )}

            {/* VARIANTE ÉDITORIALE PORTFOLIO */}
            {(selectedFilter === "all" || selectedFilter === "editorial") && (
              <article className="space-y-3" data-spotlight-section="editorial">
                <div className="flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-amber-700 uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-amber-600" />
                    03. Portfolio Éditorial
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">3D Tilt &amp; Soft Glare</span>
                </div>

                <TiltSpotlightCard
                  className="border border-stone-300 bg-stone-900 text-stone-100 shadow-md min-h-[440px] flex flex-col justify-between"
                  spotlightColor="rgba(251, 191, 36, 0.25)"
                  maxTilt={8}
                  glareOpacity={0.15}
                  borderRadius={12}
                  data-spotlight-variant="editorial"
                >
                  <div className="p-7 space-y-6 flex-1 flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400">
                        Architecture &amp; Spatial Design
                      </span>
                      <span className="text-xs text-stone-400 font-serif italic">
                        N° 04 / 2026
                      </span>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif tracking-tight text-white leading-snug">
                        Maison Vespera: Pavillon de Lumière
                      </h3>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        Recherche sur la réfraction de la lumière naturelle à travers des structures monolithiques en béton précontraint et verre basalte.
                      </p>
                    </div>

                    {/* Graphic Concept Visual */}
                    <div className="relative aspect-[16/8] overflow-hidden rounded-lg bg-neutral-950 border border-stone-800 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/50 via-stone-900 to-indigo-950/40 opacity-90" />
                      <div className="relative text-center p-3">
                        <p className="text-xs font-mono text-amber-200 uppercase tracking-widest">
                          Triennale d’Architecture de Kyoto
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Grand Prix de l’Innovation Spatiale
                        </p>
                      </div>
                    </div>

                    {/* Spec Sheet & Footer */}
                    <div className="pt-3 border-t border-stone-800 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-mono uppercase">
                          Lieu
                        </span>
                        <span className="text-stone-200 font-medium">Kyoto, Japon</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-mono uppercase">
                          Matériaux
                        </span>
                        <span className="text-stone-200 font-medium">Verre &amp; Basalte</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-stone-400 italic font-serif">
                        Curated by Studio Vespera
                      </span>
                      <button
                        type="button"
                        className="text-amber-400 hover:text-amber-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        Consulter l’étude <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </TiltSpotlightCard>
              </article>
            )}
          </div>
        </section>

        {/* Collapsible Capture Notes Section */}
        <section className="pt-4">
          <details className="group rounded-xl border border-stone-300/80 bg-[#eae8e3] p-4 text-xs text-neutral-700 transition-all">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-900 select-none">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-700" />
                <span>Consignes de Capture &amp; Automation (Remotion / Playwright)</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-3 border-t border-stone-300/80 pt-3 leading-relaxed text-neutral-600 font-mono text-[11px]">
              <p>
                • Chaque carte expose un sélecteur stable :{" "}
                <code className="rounded bg-stone-300/70 px-1.5 py-0.5 text-neutral-900 font-bold">
                  data-spotlight-variant=&quot;cinematic | b2b | editorial&quot;
                </code>.
              </p>
              <p>
                • Le bouton <strong className="text-neutral-900">Motion réduit</strong> force la réinitialisation de la position au centre et désactive le tilt 3D pour stabiliser les captures d’écran fixes.
              </p>
              <p>
                • Pour Playwright / Remotion : utilisez <code className="text-indigo-800">page.mouse.move(x, y)</code> sur un intervalle régulier (60fps) pour simuler un balayage fluide du spot.
              </p>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
