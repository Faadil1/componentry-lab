"use client"

// ─────────────────────────────────────────────────────────────
// Project Export Section — Copy packets triggers
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectExport() {
  const { actions } = useProjectBrain()

  const packets = [
    { label: "Project Brain", desc: "Full context document of this project memory.", action: actions.copyProjectBrain },
    { label: "Agent handoff", desc: "Optimized state packet for Claude Code, Codex, or Antigravity.", action: actions.copyAgentPacket },
    { label: "Design Direction", desc: "Mood, colors, layouts, typography, and accessibility plans.", action: actions.copyDesignPacket },
    { label: "Build Blueprint", desc: "Registry elements, proof criteria, and architecture notes.", action: actions.copyBuildPacket },
    { label: "Capture Plan", desc: "State timeline coordinates and restore links.", action: actions.copyCapturePacket },
    { label: "Video Demo Script", desc: "Shot list sequence, overlays, and voiceover audio.", action: actions.copyVideoPacket },
    { label: "Submission Bundle", desc: "Readiness, blockers checklist, claims, and Pitch summary.", action: actions.copySubmissionPacket }
  ]

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Memory & Packets Export
        </h2>
        <p className="font-mono text-[10px] text-stone-400 uppercase">
          Download, copy, or export structured segments of the project memory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {packets.map((pkt) => (
          <div
            key={pkt.label}
            className="rounded border border-stone-200 bg-white p-4 flex flex-col justify-between gap-3 text-left"
          >
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-bold text-neutral-950 uppercase">
                {pkt.label}
              </span>
              <p className="font-mono text-[10px] text-stone-500 leading-relaxed">
                {pkt.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={pkt.action}
              className="self-start inline-flex h-7 items-center gap-1 rounded border border-neutral-950 bg-neutral-950 px-2.5 font-mono text-[9px] text-white transition hover:bg-neutral-800"
            >
              Copy Packet
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProjectExport
