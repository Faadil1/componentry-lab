"use client"

import * as React from "react"
import { useCaptureBridge } from "./capture-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

export interface CaptureTimelineProps {
  className?: string
}

const stateTypeColors = {
  setup: "bg-stone-500",
  intermediate: "bg-stone-600",
  evidence: "bg-amber-400",
  signature: "bg-cyan-400",
  result: "bg-red-400",
  fallback: "bg-emerald-400",
}

export function CaptureTimeline({ className }: CaptureTimelineProps) {
  const { state, actions } = useCaptureBridge()
  const { activeScene, activeState, cleanView } = state

  const duration = activeScene.duration
  const currentProgress = activeState.time / duration

  // Keyboard Shortcuts handler
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea" || target.isContentEditable) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          if (e.shiftKey) {
            // Frame step backward
            const prevFrame = Math.max(0, activeState.frame - 1)
            // Find closest state or create custom time
            const matchingState = activeScene.states.find(s => s.frame === prevFrame)
            if (matchingState) {
              actions.setState(matchingState.id)
            } else {
              // Custom frame update
            }
          } else {
            actions.previousState()
          }
          break
        case "ArrowRight":
          e.preventDefault()
          if (e.shiftKey) {
            // Frame step forward
            const nextFrame = Math.min(activeScene.duration * activeScene.fps, activeState.frame + 1)
            const matchingState = activeScene.states.find(s => s.frame === nextFrame)
            if (matchingState) {
              actions.setState(matchingState.id)
            }
          } else {
            actions.nextState()
          }
          break
        case "Home":
          e.preventDefault()
          if (activeScene.states.length > 0) {
            actions.setState(activeScene.states[0].id)
          }
          break
        case "End":
          e.preventDefault()
          if (activeScene.states.length > 0) {
            actions.setState(activeScene.states[activeScene.states.length - 1].id)
          }
          break
        case "c":
        case "C":
          e.preventDefault()
          actions.toggleCleanView()
          break
        case "i":
        case "I":
          e.preventDefault()
          actions.toggleInspector()
          break
        case "n":
        case "N":
          e.preventDefault()
          actions.toggleNotes()
          break
        case "r":
        case "R":
          e.preventDefault()
          actions.resetScene()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeScene, activeState, actions])

  return (
    <div className={cn("space-y-2", cleanView && "hidden", className)}>
      <div className="flex justify-between items-center text-[10px] font-mono text-stone-600">
        <span>Timeline Playhead</span>
        <span>{formatTimecode(activeState.time, activeScene.fps)} / {formatTimecode(duration, activeScene.fps)}</span>
      </div>

      {/* Visual track */}
      <div className="relative h-10 rounded-lg bg-[#0e0d0c] border border-stone-850 overflow-visible flex items-center">
        {/* Progress track */}
        <div className="absolute inset-y-0 left-0 bg-cyan-500/10 transition-all duration-200 pointer-events-none" style={{ width: `${currentProgress * 100}%` }} />

        {/* State markers as vertical pins */}
        {activeScene.states.map((st) => {
          const leftPercent = (st.time / duration) * 100
          const isActive = activeState.id === st.id
          const color = stateTypeColors[st.stateType] || "bg-stone-500"

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => actions.setState(st.id)}
              className="absolute -ml-1.5 flex flex-col items-center group focus-visible:outline-none"
              style={{ left: `${leftPercent}%` }}
              title={st.label}
              aria-label={`Jump to state: ${st.label}`}
            >
              {/* Pin circle */}
              <div className={cn(
                "w-3 h-3 rounded-full border transition-all shrink-0",
                isActive
                  ? "border-cyan-400 bg-cyan-950 scale-125 shadow-sm shadow-cyan-500/30"
                  : "border-stone-800 hover:border-stone-500 bg-[#0e0d0c]"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full m-0.5", color)} />
              </div>
              
              {/* Vertical line indicator */}
              <div className={cn(
                "w-px h-6 mt-1 pointer-events-none transition-colors",
                isActive ? "bg-cyan-500/50" : "bg-stone-850 group-hover:bg-stone-700"
              )} />
            </button>
          )
        })}

        {/* Active Time Cursor */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 pointer-events-none transition-all duration-200"
          style={{ left: `${currentProgress * 100}%` }}
        />
      </div>

      {/* Label under timeline */}
      <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 px-1 pt-1.5">
        <span>F0</span>
        <span className="text-stone-300 font-bold">{activeState.label}</span>
        <span>F{activeScene.duration * activeScene.fps}</span>
      </div>
    </div>
  )
}
export default CaptureTimeline
