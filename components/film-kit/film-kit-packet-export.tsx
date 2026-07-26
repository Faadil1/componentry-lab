"use client"

import * as React from "react"
import type { FilmKitPacket } from "@/lib/film-kit"

function useCopyStatus() {
  const [status, setStatus] = React.useState<string | null>(null)

  async function copy(content: string, label: string) {
    await navigator.clipboard.writeText(content)
    setStatus(`${label} copied`)
    window.setTimeout(() => setStatus(null), 1800)
  }

  return { status, copy }
}

export function FilmKitPacketExport({ packets }: { packets: FilmKitPacket[] }) {
  const { status, copy } = useCopyStatus()
  const [openPacketId, setOpenPacketId] = React.useState<string | null>(packets[0]?.id ?? null)

  return (
    <section className="space-y-4" data-film-kit-section="exports">
      <div className="border-b border-stone-300 pb-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Exports</p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Packets ready for copy</h2>
      </div>
      <div className="space-y-3">
        {packets.map((packet, index) => {
          const isOpen = openPacketId === packet.id
          const lineCount = packet.content.split(/\r?\n/).length

          return (
            <article key={packet.id} className="overflow-hidden rounded-2xl border border-stone-300 bg-white">
              <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-950">{packet.label}</h3>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Packet {index + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{packet.description}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">{lineCount} lines | preview collapses raw JSON</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenPacketId((current) => (current === packet.id ? null : packet.id))}
                    aria-expanded={isOpen}
                    className="rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-neutral-800 transition hover:border-neutral-950 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
                  >
                    {isOpen ? "Hide preview" : "Show preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(packet.content, packet.label)}
                    className="rounded-full border border-neutral-950 bg-neutral-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {isOpen ? (
                <pre className="max-h-[24rem] overflow-auto bg-stone-50 px-4 py-4 text-[11px] leading-relaxed text-neutral-800">{packet.content}</pre>
              ) : null}
            </article>
          )
        })}
      </div>
      <p className="min-h-5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-700" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
