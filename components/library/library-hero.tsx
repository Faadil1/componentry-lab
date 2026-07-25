"use client"

import * as React from "react"
import { useComponentLibrary } from "./library-provider"
import { registryComponents } from "@/lib/registry"

export function LibraryHero() {
  const { state } = useComponentLibrary()
  const { results } = state

  const total = registryComponents.length
  const reusableCount = registryComponents.filter(e => e.maturity === "reusable").length
  const prodCount = registryComponents.filter(e => e.maturity === "production-candidate").length

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          Technical Component Index
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100 max-w-2xl leading-[1.05] Outfit">
          Find the right system before building the wrong component.
        </h2>
        <p className="text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed Inter">
          Search interactions, foundations, systems, and complete recipes by capability, maturity, runtime, and intended use.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 max-w-3xl">
        <div className="rounded-lg border border-stone-850 bg-[#0e0d0c]/70 p-3">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Total Entries</span>
          <span className="font-mono text-xl font-black text-stone-200 mt-1 block">{total}</span>
        </div>
        <div className="rounded-lg border border-stone-850 bg-[#0e0d0c]/70 p-3">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Reusable Units</span>
          <span className="font-mono text-xl font-black text-cyan-400 mt-1 block">{reusableCount}</span>
        </div>
        <div className="rounded-lg border border-stone-850 bg-[#0e0d0c]/70 p-3">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Prod Candidates</span>
          <span className="font-mono text-xl font-black text-emerald-400 mt-1 block">{prodCount}</span>
        </div>
        <div className="rounded-lg border border-stone-850 bg-[#0e0d0c]/70 p-3">
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block font-bold">Active Results</span>
          <span className="font-mono text-xl font-black text-stone-100 mt-1 block">{results.length}</span>
        </div>
      </div>
    </div>
  )
}
export default LibraryHero
