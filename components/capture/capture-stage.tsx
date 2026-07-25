"use client"

import * as React from "react"
import { useCaptureBridge, VIEWPORT_PRESETS } from "./capture-provider"
import { formatTimecode } from "@/lib/player/timeline"
import { cn } from "@/lib/utils"

export interface CaptureStageProps {
  className?: string
  children?: React.ReactNode
}

const safeAreaStyles = {
  off: "",
  interface: "border-[16px] border-dashed border-cyan-500/15",
  presentation: "border-[32px] border-dashed border-purple-500/15",
  broadcast: "border-[48px] border-dashed border-amber-500/15",
  cinematic: "border-[24px] border-dashed border-red-500/15",
}

export function CaptureStage({ className, children }: CaptureStageProps) {
  const { state, actions } = useCaptureBridge()
  const {
    activeScene,
    activeState,
    viewport,
    aspectRatio,
    safeArea,
    chromeMode,
    cleanView,
    customWidth,
    customHeight,
  } = state

  // Resolve simulated viewport dimensions
  const activePreset = VIEWPORT_PRESETS.find(p => p.id === viewport)
  const width = viewport === "custom" ? customWidth : (activePreset?.width ?? 1440)
  const height = viewport === "custom" ? customHeight : (activePreset?.height ?? 900)

  // Auto handle Escape key to leave clean view
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (cleanView) {
          actions.toggleCleanView()
        }
        if (chromeMode === "hidden") {
          actions.setChromeMode("full")
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cleanView, chromeMode, actions])

  // Mock scene layout renderers to make the stage look completely functional
  const renderSimulatedContent = () => {
    if (children) return children

    if (activeScene.id === "evidence-decision") {
      const isHold = activeState.id === "decision-hold" || activeState.id === "evidence-excluded" || activeState.id === "trace-explained"
      const isExcluded = activeState.id === "evidence-excluded" || activeState.id === "decision-hold" || activeState.id === "trace-explained"
      const showTrace = activeState.id === "trace-explained"

      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-[#0e0d0c] text-stone-100">
          <div className="max-w-md w-full space-y-5">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-stone-855 pb-2">
              <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">[Verified Run Logs]</span>
              <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase">{activeState.label}</span>
            </div>

            {/* Decision Gate Specimen */}
            <div className={cn(
              "rounded-xl border p-5 text-left transition-all duration-300",
              isHold
                ? "bg-[#1f190e] border-amber-500/30 text-amber-400"
                : "bg-[#091b14] border-emerald-500/30 text-emerald-400"
            )}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-stone-500 block mb-1">Gate Outcome</span>
                  <h4 className="text-xl font-black uppercase">
                    {isHold ? "Hold / Awaiting Verification" : "Proceed / Approved"}
                  </h4>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border",
                  isHold ? "bg-amber-500/20 text-amber-400 border-amber-800/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-800/40"
                )}>
                  {isHold ? "Pending" : "Approved"}
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-normal mt-3 bg-stone-950/40 p-2.5 rounded border border-stone-900">
                {isHold
                  ? "System is on HOLD. Rollback simulation verification log was manually excluded."
                  : "Approved to deploy. Candidate matches all validation rules successfully."}
              </p>
            </div>

            {/* Evidence details */}
            <div className="bg-[#080808] border border-stone-850 p-3.5 rounded-lg text-xs text-left space-y-2.5">
              <div className="flex justify-between items-center text-stone-400 font-semibold border-b border-stone-900 pb-1.5">
                <span>Verification Checklist</span>
                <span className="font-mono text-[10px] text-stone-600">3 points</span>
              </div>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-stone-300">
                  <span>• Pipeline Test execution log</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>• Static application security seal</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>• Rollback verification stamp</span>
                  <span className={isExcluded ? "text-stone-600 line-through" : "text-emerald-400 font-bold"}>
                    {isExcluded ? "EXCLUDED" : "VERIFIED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trace detailed view */}
            {showTrace && (
              <div className="text-left font-mono text-[9px] text-stone-500 bg-stone-950/70 p-3 rounded border border-stone-900 space-y-1">
                <span className="text-cyan-400 block mb-1">Execution Trace:</span>
                <p>[01] Observed Automated Checks Passed: 98.4% (Normal)</p>
                <p>[02] Pipeline Test Log Verified.</p>
                <p>[03] Rollback stamp marked EXCLUDED by user.</p>
                <p className="text-amber-400">[04] Gate outcome status resolved to HOLD.</p>
              </div>
            )}

            {/* Verification timestamp */}
            <div className="flex justify-between text-[10px] text-stone-600 font-mono">
              <span>Time: {activeState.time.toFixed(1)}s</span>
              <span>Frame: F{activeState.frame}</span>
            </div>
          </div>
        </div>
      )
    }

    if (activeScene.id === "product-reveal") {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-[#090909] text-stone-100 font-sans">
          <div className="space-y-4 max-w-sm">
            <span className="w-10 h-1 bg-cyan-400 rounded-full mx-auto block" />
            <h3 className="text-lg font-bold uppercase tracking-wider">{activeState.label}</h3>
            <p className="text-xs text-stone-400 max-w-xs">{activeState.description}</p>
            <span className="font-mono text-[10px] text-stone-600 block mt-2">Frame F{activeState.frame}</span>
          </div>
        </div>
      )
    }

    // Default template fallback scene
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-[#0a0a09] text-stone-100 font-sans">
        <div className="space-y-4 max-w-sm">
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto block" />
          <h3 className="text-lg font-bold uppercase tracking-wider">{activeState.label}</h3>
          <p className="text-xs text-stone-400 max-w-xs">{activeState.description || "Active step verification frame"}</p>
          <span className="font-mono text-[10px] text-stone-600 block mt-2">Frame F{activeState.frame}</span>
        </div>
      </div>
    )
  }

  // Aspect ratio classes mapping
  const ratioClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
    custom: "",
  }

  const simulatedDimensionsStyle = viewport === "custom" || aspectRatio === "custom"
    ? { width: `${width}px`, height: `${height}px` }
    : undefined

  return (
    <div className={cn("relative overflow-hidden w-full flex flex-col items-center justify-center", className)}>
      {/* Simulation workspace wrapper */}
      <div
        style={simulatedDimensionsStyle}
        className={cn(
          "relative overflow-hidden rounded-xl border border-stone-850 bg-[#070707] shadow-xl transition-all duration-300 w-full",
          aspectRatio !== "custom" && ratioClasses[aspectRatio]
        )}
      >
        {/* Title safe markers overlay */}
        {safeArea !== "off" && (
          <div className={cn("absolute inset-0 pointer-events-none z-20 rounded-xl", safeAreaStyles[safeArea])} />
        )}

        {/* Signature Frame badge */}
        {activeState.stateType === "signature" && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-mono text-[8px] text-cyan-300 uppercase tracking-widest">Signature Frame</span>
          </div>
        )}

        {/* Timecode overlay */}
        {chromeMode !== "hidden" && (
          <div className="absolute bottom-3 right-3 z-30 font-mono text-[10px] text-stone-400 bg-stone-900/60 border border-stone-800/40 px-2 py-0.5 rounded backdrop-blur-xs tabular-nums">
            {formatTimecode(activeState.time, activeScene.fps)} (F{activeState.frame})
          </div>
        )}

        {/* Clean View indicator label */}
        {cleanView && (
          <div className="absolute bottom-3 left-3 z-30 font-mono text-[9px] text-stone-600 bg-black/40 px-2 py-0.5 rounded select-none">
            Clean View (Press ESC to return)
          </div>
        )}

        {/* Canvas stage display slot */}
        <div className="w-full h-full relative z-10">
          {renderSimulatedContent()}
        </div>
      </div>
    </div>
  )
}
export default CaptureStage
