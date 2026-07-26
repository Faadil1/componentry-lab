"use client"

import * as React from "react"
import type { FilmKitPacket } from "@/lib/film-kit"

export function FilmKitPacketExport({ packets }: { packets: FilmKitPacket[] }) {
  const [status, setStatus] = React.useState<string | null>(null)

  async function copy(content: string, label: string) {
    await navigator.clipboard.writeText(content)
    setStatus(`${label} copied`)
    window.setTimeout(() => setStatus(null), 1800)
  }

  return (
    <section className="space-y-4" data-film-kit-section="exports">
      <div className="border-b border-stone-300 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Exports</p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Packets ready for copy</h2>
      </div>
      <div className="space-y-3">
        {packets.map((packet) => (
          <div key={packet.id} className="rounded-xl border border-stone-300 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-neutral-950">{packet.label}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{packet.description}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(packet.content, packet.label)}
                className="self-start rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
              >
                Copy
              </button>
            </div>
            <pre className="mt-4 overflow-auto rounded-lg border border-stone-200 bg-stone-50 p-4 text-[11px] leading-relaxed text-neutral-800">{packet.content}</pre>
          </div>
        ))}
      </div>
      <p className="min-h-5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-700" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
