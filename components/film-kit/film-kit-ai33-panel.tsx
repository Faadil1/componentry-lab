"use client"

import type { FilmKitAi33Packet } from "@/lib/film-kit"

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-950">{value}</p>
    </div>
  )
}

export function FilmKitAi33Panel({ packet }: { packet: FilmKitAi33Packet }) {
  return (
    <section className="space-y-4" data-film-kit-section="ai33">
      <div className="border-b border-stone-300 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">AI33 integration</p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Status-driven handoff packet</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3 rounded-2xl border border-stone-300 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-900">Manual review</span>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">No automatic request</span>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <StatusRow label="Title" value={packet.title} />
            <StatusRow label="Audience" value={packet.audience} />
            <StatusRow label="Delivery mode" value={packet.deliveryMode} />
            <StatusRow label="Readiness" value="Packet is prepared on the server and only disclosed on demand." />
          </dl>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm leading-relaxed text-stone-700">
            {packet.summary}
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-stone-300 bg-stone-950 p-4 text-stone-100">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Server safety note</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">The packet is visible here for debugging and handoff review, but the integration remains user-driven and never auto-fires an AI33 request.</p>
          </div>
          <details className="rounded-2xl border border-stone-800 bg-stone-900/60 px-3 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-100/70">
              Developer packet
            </summary>
            <pre className="mt-3 max-h-[24rem] overflow-auto rounded-xl border border-stone-800 bg-stone-950 p-3 text-[11px] leading-relaxed text-stone-200">{JSON.stringify(packet, null, 2)}</pre>
          </details>
        </div>
      </div>
    </section>
  )
}