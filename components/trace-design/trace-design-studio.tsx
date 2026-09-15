"use client"

import Link from "next/link"
import * as React from "react"
import {
  TRACE_DESIGN_CONCERNS,
  TRACE_DESIGN_MODES,
  TRACE_DESIGN_SURFACES,
  routeTraceDesign,
  type TraceDesignAsset,
  type TraceDesignAssetKind,
  type TraceDesignConcern,
  type TraceDesignSurface,
} from "@/lib/creative-os/trace-design-studio"
import type { CreativeProjectMode } from "@/lib/director/types"

const KIND_FILTERS: Array<TraceDesignAssetKind | "ALL"> = [
  "ALL",
  "SYSTEM",
  "PROTOCOL",
  "SKILL",
  "AGENT",
  "REFERENCE",
  "COMPONENT",
  "RESOURCE",
]

const SURFACE_LABELS: Record<TraceDesignSurface, string> = {
  WEB_PRODUCT: "Web / Product",
  MOBILE_NATIVE: "Mobile native",
  DASHBOARD: "Dashboard",
  EDITORIAL: "Editorial",
  PRESENTATION: "Presentation",
  MOTION_VIDEO: "Motion / Video",
}

const CONCERN_LABELS: Record<TraceDesignConcern, string> = {
  ANTI_SLOP: "Anti-slop",
  AESTHETIC_LINEAGE: "Aesthetic lineage",
  COMPONENT_COMPOSITION: "Component composition",
  MOBILE_NATIVE_UX: "Mobile-native UX",
  MOTION: "Motion",
  CHARACTER: "Character / Mascot",
  TEXTURE: "Texture / Raster",
  COPY_PERSUASION: "Copy / Persuasion",
  BRAND_SYSTEM: "Brand system",
  ACCESSIBILITY: "Accessibility",
  RUNTIME_ASSURANCE: "Runtime assurance",
  EVIDENCE: "Evidence",
}

function clean(value: string) {
  return value.replace(/_/g, " ")
}

function badgeClass(kind: TraceDesignAssetKind) {
  switch (kind) {
    case "SYSTEM":
      return "border-neutral-950 bg-neutral-950 text-white"
    case "PROTOCOL":
      return "border-[#e66b43] bg-[#fff0e9] text-[#8e3219]"
    case "SKILL":
      return "border-[#4a58c7] bg-[#eef0ff] text-[#28338f]"
    case "AGENT":
      return "border-[#2f8062] bg-[#e7f7f0] text-[#1c5c44]"
    case "REFERENCE":
      return "border-[#8e6b17] bg-[#fff7d6] text-[#6f5109]"
    case "COMPONENT":
      return "border-[#a54873] bg-[#fff0f6] text-[#7e2e54]"
    default:
      return "border-stone-400 bg-stone-100 text-stone-700"
  }
}

function AssetLink({ asset }: { asset: TraceDesignAsset }) {
  const className = "text-[11px] font-semibold underline decoration-stone-300 underline-offset-4 transition hover:decoration-neutral-950"
  if (asset.href) {
    return <Link href={asset.href} className={className}>Open surface</Link>
  }
  if (asset.sourceUrl) {
    return <a href={asset.sourceUrl} target="_blank" rel="noreferrer" className={className}>Open source</a>
  }
  return null
}

function AssetCard({ asset, compact = false }: { asset: TraceDesignAsset; compact?: boolean }) {
  return (
    <article className="group rounded-2xl border border-stone-300/90 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-neutral-500">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">{asset.group}</p>
          <h3 className="mt-1 text-sm font-bold tracking-tight text-neutral-950">{asset.name}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.15em] ${badgeClass(asset.kind)}`}>
          {asset.kind}
        </span>
      </div>
      {!compact ? <p className="mt-3 text-xs leading-5 text-stone-600">{asset.summary}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.12em] text-stone-400">
        <span>{clean(asset.status)}</span>
        <span>{clean(asset.authority)}</span>
        {asset.version ? <span>v{asset.version}</span> : null}
      </div>
      {(asset.href || asset.sourceUrl) ? <div className="mt-3"><AssetLink asset={asset} /></div> : null}
    </article>
  )
}

function RouteColumn({ title, items }: { title: string; items: TraceDesignAsset[] }) {
  return (
    <section className="rounded-2xl border border-stone-300 bg-[#f7f6f1] p-3">
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">{title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[9px] text-stone-500">{items.length}</span>
      </div>
      <div className="mt-2 space-y-2">
        {items.length > 0 ? items.map((asset) => (
          <div key={asset.id} className="rounded-xl border border-stone-200 bg-white px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-neutral-900">{asset.name}</p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-stone-400">{clean(asset.status)} · {clean(asset.authority)}</p>
              </div>
              <AssetLink asset={asset} />
            </div>
          </div>
        )) : <p className="px-1 py-3 text-xs text-stone-500">No routed items for this slice.</p>}
      </div>
    </section>
  )
}

export interface TraceDesignStudioProps {
  assets: TraceDesignAsset[]
  projectId?: string
  sync: {
    canonicalReferenceRegistry: boolean
    canonicalReferenceCount: number
    staticStudioCount: number
    creativeOsCount: number
    componentRegistryCount: number
  }
}

export function TraceDesignStudio({ assets, projectId, sync }: TraceDesignStudioProps) {
  const [mode, setMode] = React.useState<CreativeProjectMode>("HACKATHON")
  const [surface, setSurface] = React.useState<TraceDesignSurface>("WEB_PRODUCT")
  const [concerns, setConcerns] = React.useState<TraceDesignConcern[]>([
    "ANTI_SLOP",
    "AESTHETIC_LINEAGE",
    "COMPONENT_COMPOSITION",
    "RUNTIME_ASSURANCE",
  ])
  const [query, setQuery] = React.useState("")
  const [kindFilter, setKindFilter] = React.useState<TraceDesignAssetKind | "ALL">("ALL")

  const route = React.useMemo(
    () => routeTraceDesign({ mode, surface, concerns }, assets),
    [assets, concerns, mode, surface],
  )

  const filteredAssets = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return assets.filter((asset) => {
      if (kindFilter !== "ALL" && asset.kind !== kindFilter) return false
      if (!q) return true
      const haystack = [
        asset.name,
        asset.kind,
        asset.group,
        asset.summary,
        asset.status,
        asset.authority,
        asset.source,
        ...(asset.tags ?? []),
        ...(asset.triggers ?? []),
      ].join(" ").toLowerCase()
      return haystack.includes(q)
    })
  }, [assets, kindFilter, query])

  const counts = React.useMemo(() => {
    const byKind = new Map<string, number>()
    for (const asset of assets) byKind.set(asset.kind, (byKind.get(asset.kind) ?? 0) + 1)
    return byKind
  }, [assets])

  const toggleConcern = (concern: TraceDesignConcern) => {
    setConcerns((current) => current.includes(concern) ? current.filter((item) => item !== concern) : [...current, concern])
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8 px-4 pb-20 pt-8 md:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-neutral-950 bg-[#f0ede5] shadow-[0_18px_55px_rgba(35,30,20,0.12)]">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
          <div className="relative overflow-hidden border-b border-neutral-950 p-6 md:p-10 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(20,20,20,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,20,0.08)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-neutral-950 bg-neutral-950 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">TRACE Design</span>
                <span className="rounded-full border border-[#e66b43] bg-[#fff0e9] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e3219]">Visible Studio</span>
                <span className="rounded-full border border-stone-400 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-600">Read-only routing bench</span>
              </div>
              <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.055em] text-neutral-950 sm:text-6xl lg:text-8xl">
                See the whole design system. Route it. Test it.
              </h1>
              <p className="mt-6 max-w-3xl text-sm leading-6 text-stone-700 md:text-base">
                Componentry Lab is now the visible TRACE Design control surface: canonical references, Studio and assurance skills, operator roles, Creative OS resources, Component Registry entries, protocols, evidence surfaces and testable routing in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={projectId ? `/director/live?project=${encodeURIComponent(projectId)}` : "/director/live"} className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
                  Open Director
                </Link>
                <Link href="/library" className="rounded-full border border-neutral-950 bg-white px-5 py-3 text-sm font-bold text-neutral-950 transition hover:-translate-y-0.5">
                  Open Library
                </Link>
                <Link href="/creative-os/registry" className="rounded-full border border-stone-400 bg-transparent px-5 py-3 text-sm font-bold text-neutral-800 transition hover:bg-white">
                  Resource Registry
                </Link>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-px bg-neutral-950">
            {[
              ["Visible assets", assets.length],
              ["References", counts.get("REFERENCE") ?? 0],
              ["Skills", counts.get("SKILL") ?? 0],
              ["Agents", counts.get("AGENT") ?? 0],
              ["Components", counts.get("COMPONENT") ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-[#f7f6f1] px-5 py-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">{label}</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-neutral-950">{value}</p>
              </div>
            ))}
            <div className="bg-[#fff7d6] px-5 py-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#6f5109]">Canonical reference sync</p>
              <p className="mt-1 text-sm font-bold text-[#4e3907]">{sync.canonicalReferenceRegistry ? `LIVE · ${sync.canonicalReferenceCount} indexed` : "FALLBACK · local overlay active"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-950 bg-white shadow-sm">
        <div className="grid border-b border-neutral-950 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="border-b border-neutral-950 p-5 md:p-7 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">Routing bench</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Test TRACE Design directly</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Change the project mode, surface and unresolved concerns. The route recomputes locally and returns one bounded next move plus the matching operators, skills and references.</p>
            {projectId ? <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-[10px] text-stone-600">Project context: {projectId}</p> : null}
          </div>
          <div className="p-5 md:p-7">
            <div className="space-y-6">
              <div>
                <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Mode</p>
                <div className="flex flex-wrap gap-2">
                  {TRACE_DESIGN_MODES.map((item) => (
                    <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-full border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition ${mode === item ? "border-neutral-950 bg-neutral-950 text-white" : "border-stone-300 bg-stone-50 text-stone-600 hover:border-neutral-700"}`}>
                      {clean(item)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Surface</p>
                <div className="flex flex-wrap gap-2">
                  {TRACE_DESIGN_SURFACES.map((item) => (
                    <button key={item} type="button" onClick={() => setSurface(item)} className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition ${surface === item ? "border-[#4a58c7] bg-[#eef0ff] text-[#28338f]" : "border-stone-300 bg-stone-50 text-stone-600 hover:border-neutral-700"}`}>
                      {SURFACE_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Unresolved concerns</p>
                <div className="flex flex-wrap gap-2">
                  {TRACE_DESIGN_CONCERNS.map((item) => {
                    const selected = concerns.includes(item)
                    return (
                      <button key={item} type="button" aria-pressed={selected} onClick={() => toggleConcern(item)} className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition ${selected ? "border-[#e66b43] bg-[#fff0e9] text-[#8e3219]" : "border-stone-300 bg-white text-stone-500 hover:border-neutral-700"}`}>
                        {CONCERN_LABELS[item]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:p-7 xl:grid-cols-[0.82fr_1.18fr]">
          <article className="rounded-3xl bg-neutral-950 p-6 text-white">
            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">Exactly one next move</p>
                <p className="mt-1 font-mono text-[9px] text-stone-500">{route.routeId}</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">Suggest only</span>
            </div>
            <h3 className="mt-5 text-3xl font-black leading-tight tracking-tight">{route.nextAction.title}</h3>
            <p className="mt-4 text-sm leading-6 text-stone-300">{route.nextAction.rationale}</p>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-stone-400">
              <p>Activated assets: <strong className="text-white">{route.activated.length}</strong></p>
              <p className="mt-1">No Project Brain write. No external execution. No silent promotion.</p>
            </div>
          </article>

          <div className="grid gap-3 md:grid-cols-2">
            <RouteColumn title="Agents" items={route.agents} />
            <RouteColumn title="Skills" items={route.skills} />
            <RouteColumn title="References" items={route.references} />
            <RouteColumn title="Systems + protocols" items={route.systems} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-3xl border border-stone-300 bg-[#f7f6f1] p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">Full visible system</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-neutral-950">References, skills, agents, components and resources</h2>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">This catalog is a projection, not a new authority source. It combines TRACE Design Studio contracts, the canonical reference registry when reachable, Creative OS resources and Component Registry V2.</p>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,260px)_auto]">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search CARI, mobile, motion…" className="h-10 rounded-full border border-stone-300 bg-white px-4 text-sm outline-none ring-0 placeholder:text-stone-400 focus:border-neutral-950" />
            <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as TraceDesignAssetKind | "ALL")} className="h-10 rounded-full border border-stone-300 bg-white px-4 text-xs font-semibold outline-none focus:border-neutral-950">
              {KIND_FILTERS.map((item) => <option key={item} value={item}>{clean(item)}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
          <span>{filteredAssets.length} visible</span>
          <span>{sync.staticStudioCount} Studio · {sync.creativeOsCount} Creative OS · {sync.componentRegistryCount} Component Registry</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredAssets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-950 bg-[#fff7d6] p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6f5109]">Direct test surfaces</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">From intelligence to actual UI</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a4712]">Use the existing labs to test the mechanisms that TRACE Design routes, then return to Director / evidence for promotion decisions.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Library", "/library"],
              ["Director", "/director/live"],
              ["Foundations", "/foundations"],
              ["Typography", "/typography"],
              ["Layouts", "/layouts"],
              ["Interaction Player", "/player"],
              ["Recipes", "/recipes"],
              ["Decision Systems", "/decisions"],
              ["Capture", "/capture"],
              ["Film Kit", "/film-kit"],
              ["Spotlight", "/spotlight"],
              ["WebGL Liquid", "/webgl-liquid"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl border border-[#9b7b20] bg-[#fffbed] px-4 py-3 text-sm font-bold text-neutral-900 transition hover:-translate-y-0.5 hover:bg-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
