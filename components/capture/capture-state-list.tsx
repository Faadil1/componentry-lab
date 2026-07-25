"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { buildCaptureUrl, createCaptureSnapshot } from "@/lib/capture/serializer"
import { cn } from "@/lib/utils"

export interface CaptureStateListProps {
  className?: string
}

const stateTypeLabels = {
  setup: "Setup Frame",
  intermediate: "Interaction",
  evidence: "Evidence check",
  signature: "Signature",
  result: "Result output",
  fallback: "Teardown reset",
}

export function CaptureStateList({ className }: CaptureStateListProps) {
  const { state, actions } = useCaptureBridge()
  const { activeScene, activeState, cleanView } = state
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  if (cleanView) return null

  const handleCopyStateUrl = async (e: React.MouseEvent, stId: string, time: number, frame: number) => {
    e.stopPropagation()
    if (typeof window !== "undefined") {
      const stateSnapshot = createCaptureSnapshot({
        sceneId: activeScene.id,
        stateId: stId,
        currentTime: time,
        frame,
        viewport: state.viewport,
        chromeMode: state.chromeMode,
        safeArea: state.safeArea,
        inspectorVisible: state.inspectorVisible,
        notesVisible: state.notesVisible,
        cleanView: state.cleanView,
      })
      const url = buildCaptureUrl(window.location.href, stateSnapshot)
      await navigator.clipboard.writeText(url)
      setCopiedId(stId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center border-b border-stone-850 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
          Reproducible States Board
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={actions.previousState}
            className="px-2 py-1 rounded bg-[#0e0d0c] border border-stone-850 text-stone-400 hover:text-stone-200 transition-colors font-mono text-[9px]"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={actions.nextState}
            className="px-2 py-1 rounded bg-[#0e0d0c] border border-stone-850 text-stone-400 hover:text-stone-200 transition-colors font-mono text-[9px]"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {activeScene.states.map((st, i) => {
          const isActive = activeState.id === st.id
          const isSignature = st.stateType === "signature"
          const isCopied = copiedId === st.id

          return (
            <div
              key={st.id}
              onClick={() => actions.setState(st.id)}
              className={cn(
                "group relative rounded-lg border p-3 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3",
                isActive
                  ? "border-cyan-500/40 bg-cyan-950/10 shadow-xs"
                  : "border-stone-850 bg-[#0e0d0c] hover:border-stone-700"
              )}
            >
              {/* Left indicator line */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                isActive ? "bg-cyan-400" : isSignature ? "bg-amber-500/50" : "bg-transparent"
              )} />

              <div className="flex-1 min-w-0 pl-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-stone-600 font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold truncate block",
                    isActive ? "text-cyan-300" : "text-stone-300"
                  )}>
                    {st.label}
                  </span>
                  {isSignature && (
                    <span className="inline-flex px-1.5 py-0.2 rounded text-[7.5px] font-mono border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 uppercase tracking-widest shrink-0">
                      Signature Frame
                    </span>
                  )}
                  {st.isCapturePoint && (
                    <span className="inline-flex px-1.5 py-0.2 rounded text-[7.5px] font-mono border border-amber-800/40 bg-amber-950/20 text-amber-400 uppercase tracking-widest shrink-0">
                      Capture Point
                    </span>
                  )}
                </div>

                {st.description && (
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1 block truncate max-w-lg">
                    {st.description}
                  </p>
                )}
              </div>

              {/* Action and time indicator */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 border-stone-900 pt-2 md:pt-0">
                <span className="font-mono text-[9.5px] text-stone-500 uppercase tracking-wider">
                  {stateTypeLabels[st.stateType] || st.stateType}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded tabular-nums">
                    {formatTimecode(st.time, activeScene.fps)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleCopyStateUrl(e, st.id, st.time, st.frame)}
                    className={cn(
                      "px-2 py-1 rounded font-mono text-[9px] font-bold uppercase border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
                      isCopied
                        ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                        : "border-stone-850 text-stone-400 hover:text-stone-200"
                    )}
                    aria-label={`Copy Restore URL for ${st.label}`}
                  >
                    {isCopied ? "Copied" : "Copy URL"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default CaptureStateList
