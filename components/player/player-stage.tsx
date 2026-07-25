"use client"

import * as React from "react"
import { useInteractionPlayer } from "./player-provider"
import type { PlayerAspectRatio } from "@/lib/player/types"
import { cn } from "@/lib/utils"

interface PlayerStageProps {
  aspectRatio?: PlayerAspectRatio
  theme?: "light" | "dark" | "cinematic"
  safeArea?: "off" | "interface" | "broadcast"
  showCaptureOverlay?: boolean
  className?: string
}

const ratioClasses: Record<PlayerAspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
}

const themeClasses = {
  light: "bg-[#fbfaf6] text-neutral-900 border-stone-300",
  dark: "bg-[#1a1816] text-stone-100 border-stone-800",
  cinematic: "bg-[#0a0a09] text-stone-100 border-stone-900",
}

export function PlayerStage({
  aspectRatio,
  theme = "cinematic",
  safeArea = "off",
  showCaptureOverlay = false,
  className,
}: PlayerStageProps) {
  const { state, config, scenes } = useInteractionPlayer()
  const ratio = aspectRatio ?? config.aspectRatio
  const activeScene = state.activeScene
  const isCapture = state.mode === "capture"

  // Build render context for the active scene
  const renderContext = React.useMemo(() => ({
    currentTime: state.currentTime,
    duration: state.duration,
    progress: state.progress,
    sceneProgress: state.activeSceneProgress,
    frame: state.frame,
    fps: state.fps,
    activeScene,
    mode: state.mode,
  }), [state, activeScene])

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full rounded-xl border shadow-md",
        ratioClasses[ratio],
        themeClasses[theme],
        className
      )}
      role="region"
      aria-label="Player stage"
      aria-live="polite"
    >
      {/* Safe area overlay */}
      {safeArea !== "off" && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none z-20 rounded-xl",
            safeArea === "interface" && "border-[16px] border-dashed border-cyan-500/20",
            safeArea === "broadcast" && "border-[48px] border-dashed border-amber-500/20"
          )}
        />
      )}

      {/* Capture overlay */}
      {isCapture && showCaptureOverlay && (
        <div className="absolute inset-0 pointer-events-none z-30 rounded-xl">
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-px bg-cyan-500/30" />
            <div className="absolute h-6 w-px bg-cyan-500/30" />
          </div>
          {/* Frame indicator */}
          <div className="absolute top-3 right-3 font-mono text-[10px] text-cyan-400/70 bg-black/40 px-2 py-0.5 rounded">
            F{state.frame}
          </div>
          {/* Capture badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="font-mono text-[10px] text-red-400/80 uppercase tracking-wider">Capture</span>
          </div>
        </div>
      )}

      {/* Stage header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-500">
          {activeScene ? activeScene.label : "No Scene"}
        </span>
        <span className="font-mono text-[9px] text-cyan-500/70 font-bold uppercase">
          {ratio} Stage
        </span>
      </div>

      {/* Scene content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-6 min-h-0">
        {activeScene ? (
          activeScene.render(renderContext)
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-8 h-px bg-stone-700" />
            <p className="font-mono text-xs text-stone-600">
              {scenes.length === 0 ? "No scenes configured" : "Between scenes"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
