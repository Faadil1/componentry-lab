"use client"

// ─────────────────────────────────────────────────────────────
// Project Video Plan — Demo script outline for Demo Film Kit
// ─────────────────────────────────────────────────────────────

import { useProjectBrain } from "./project-provider"

export function ProjectVideoPlan() {
  const { state } = useProjectBrain()
  const { activeProject } = state

  if (!activeProject || !activeProject.videoPlan || activeProject.videoPlan.shots.length === 0) {
    return (
      <div className="py-8 text-left text-stone-400 font-mono text-xs">
        No video production plan mapped.
      </div>
    )
  }

  const { videoPlan } = activeProject

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-950">
          Video Production Plan
        </h2>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-[9px] text-stone-400 uppercase">
            Prepared for the future Universal Demo Film Kit
          </span>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 border border-stone-200 rounded p-4 font-mono text-xs">
        {[
          { label: "Duration Target", value: `${videoPlan.durationSeconds} seconds` },
          { label: "Target Formats", value: videoPlan.formats.join(", ") },
          { label: "Production Status", value: videoPlan.productionReadiness },
          { label: "Sound Direction", value: videoPlan.soundDirection }
        ].map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <span className="text-[9px] text-stone-400 uppercase block">{item.label}</span>
            <span className="font-semibold text-neutral-950 uppercase">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Narrative script */}
      <div className="space-y-2">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Script Narrative Hook
        </h3>
        <blockquote className="border-l-2 border-stone-300 pl-3 italic font-mono text-xs text-stone-600">
          &ldquo;{videoPlan.hook}&rdquo;
        </blockquote>
      </div>

      {/* Shot list */}
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Shot List Sequence
        </h3>
        
        <div className="flex flex-col gap-2.5">
          {videoPlan.shots.map((shot) => (
            <div
              key={shot.id}
              className="rounded border border-stone-200 bg-white p-4 space-y-2.5"
            >
              {/* Shot info */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <span className="font-mono text-[10px] font-bold text-neutral-950 uppercase">
                  Shot {shot.order}: {shot.label}
                </span>
                <span className="font-mono text-[9px] text-stone-500">
                  {shot.duration}s
                </span>
              </div>

              {/* Action and Voiceover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10.5px] leading-relaxed text-stone-600">
                <div className="space-y-1">
                  <span className="text-[8px] text-stone-400 uppercase block font-semibold">Screen Action</span>
                  <p>{shot.screenAction}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-stone-400 uppercase block font-semibold">Voiceover Audio</span>
                  <p className="italic text-neutral-850">&ldquo;{shot.voiceover}&rdquo;</p>
                </div>
              </div>

              {/* Overlay and Proof */}
              <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-2 font-mono text-[9px] text-stone-400 uppercase">
                <div>
                  Text Overlay: <span className="font-semibold text-neutral-800">{shot.overlay}</span>
                </div>
                <div>
                  Proof Displayed: <span className="font-semibold text-neutral-800">{shot.proofShown}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default ProjectVideoPlan
