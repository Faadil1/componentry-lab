"use client"

import type { FilmKitAi33Packet } from "@/lib/film-kit"

export function FilmKitAi33Panel({ packet }: { packet: FilmKitAi33Packet }) {
  return (
    <section className="space-y-4" data-film-kit-section="ai33">
      <div className="border-b border-stone-300 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">AI33 integration</p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Server packet shape</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-stone-300 bg-white p-4">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Title</dt>
              <dd className="mt-1 font-medium text-neutral-950">{packet.title}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Summary</dt>
              <dd className="mt-1 leading-relaxed text-stone-700">{packet.summary}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Audience</dt>
                <dd className="mt-1 text-neutral-950">{packet.audience}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Mode</dt>
                <dd className="mt-1 text-neutral-950">{packet.deliveryMode}</dd>
              </div>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-stone-300 bg-stone-50 p-4">
          <pre className="overflow-auto text-[11px] leading-relaxed text-neutral-800">{JSON.stringify(packet, null, 2)}</pre>
        </div>
      </div>
    </section>
  )
}
