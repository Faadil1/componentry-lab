"use client"

import * as React from "react"
import { useRecipeStudio } from "./recipe-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

export function BroadcastPackageRecipe() {
  const { state } = useRecipeStudio()
  const { activeCaptureStateId } = state

  // Timer simulation
  const [seconds, setSeconds] = React.useState(0)
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (activeCaptureStateId !== "setup" && activeCaptureStateId !== "standby-feed") {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      setTimeout(() => setSeconds(0), 0)
    }
    return () => clearInterval(interval)
  }, [activeCaptureStateId])

  const isLive = activeCaptureStateId !== "setup" && activeCaptureStateId !== "standby-feed"
  const showEvent = activeCaptureStateId === "event-marked" || activeCaptureStateId === "lower-third-overlay" || activeCaptureStateId === "clean-stream"
  const showLowerThird = activeCaptureStateId === "lower-third-overlay" || activeCaptureStateId === "clean-stream"

  return (
    <div className="relative w-full h-full bg-[#050505] text-stone-100 flex flex-col items-center justify-between p-6 font-sans select-none overflow-hidden">
      {/* Background grids mock camera */}
      <div className="absolute inset-0 bg-[#070707] flex items-center justify-center pointer-events-none">
        <div className="w-[102%] h-[102%] border border-stone-900/60 flex items-center justify-center">
          <div className="w-[95%] h-[95%] border border-dashed border-stone-850/40" />
        </div>
      </div>

      {/* Top monitor bar */}
      <div className="relative z-10 w-full flex justify-between items-center border-b border-stone-850/50 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0 animate-pulse",
            isLive ? "bg-red-500" : "bg-stone-600"
          )} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
            {isLive ? "LIVE FEED ACTIVE" : "STB MONITOR FEED"}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-stone-400 tabular-nums">
          <span>CAM_A</span>
          <span>·</span>
          <span>1080p_30fps</span>
          <span>·</span>
          <span>{formatTimecode(seconds, 30)}</span>
        </div>
      </div>

      {/* Center stage retro split flap mockup */}
      <div className="relative z-10 my-auto text-center space-y-4">
        <div className="inline-flex gap-1.5 p-3.5 rounded-lg border border-stone-800 bg-[#0c0b0a] shadow-lg">
          <span className="font-mono text-2xl font-black uppercase text-stone-100 px-2.5 py-1 rounded bg-stone-900 border border-stone-850">
            {activeCaptureStateId === "setup" ? "STB" : isLive ? "RUN" : "HALT"}
          </span>
          <span className="font-mono text-2xl font-black uppercase text-stone-100 px-2.5 py-1 rounded bg-stone-900 border border-stone-850">
            {showEvent ? "EVT" : "—"}
          </span>
          <span className="font-mono text-2xl font-black uppercase text-stone-100 px-2.5 py-1 rounded bg-stone-900 border border-stone-850">
            {showLowerThird ? "L3" : "—"}
          </span>
        </div>

        <p className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">
          {activeCaptureStateId.replace("-", " ")}
        </p>
      </div>

      {/* Bottom Lower Third caption Overlay */}
      {showLowerThird && (
        <div className="relative z-10 w-full max-w-lg mx-auto bg-stone-950/90 border border-red-500/30 rounded-lg p-3.5 shadow-xl flex items-center gap-4 transition-all duration-300">
          {/* Signal accent color */}
          <div className="w-1.5 h-full absolute left-0 top-0 bottom-0 rounded-l bg-red-500" />
          
          <div className="flex-1 min-w-0 pl-1.5 text-left">
            <span className="font-mono text-[8px] text-red-400 uppercase tracking-widest block mb-0.5">
              Live alert update
            </span>
            <span className="text-xs font-bold text-stone-200 block truncate">
              Release check gate: HOLD status resolved
            </span>
            <span className="text-[9.5px] text-stone-500 block truncate">
              A metric is not a decision. Rollback log manual override applied.
            </span>
          </div>

          <div className="shrink-0 font-mono text-[10px] text-red-400 bg-red-950/20 border border-red-900/40 px-2 py-1 rounded">
            HOLD
          </div>
        </div>
      )}

      {/* Footer memory hook */}
      <div className="relative z-10 w-full pt-2 flex justify-between items-center text-[9px] font-mono text-stone-600">
        <span>SAFE ZONE AREA</span>
        <span>&ldquo;Every live state needs a clear cue.&rdquo;</span>
      </div>
    </div>
  )
}
export default BroadcastPackageRecipe
