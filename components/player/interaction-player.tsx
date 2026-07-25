"use client"

// ─────────────────────────────────────────────────────────────
// Universal Interaction Player — Main Composition Component
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import { PlayerProvider } from "./player-provider"
import { PlayerStage } from "./player-stage"
import { PlayerTimeline } from "./player-timeline"
import { PlayerControls } from "./player-controls"
import { PlayerMarkers } from "./player-markers"
import { PlayerInspector } from "./player-inspector"
import { PlayerCapturePanel } from "./player-capture-panel"
import { PlayerTokenExport } from "./player-token-export"
import type {
  PlayerAspectRatio,
  PlayerConfig,
  PlayerMarker,
  PlayerMode,
  PlayerPreset,
  PlayerScene,
  PlayerState,
} from "@/lib/player/types"
import { cn } from "@/lib/utils"

export interface InteractionPlayerProps {
  // Direct configuration
  config?: PlayerConfig
  scenes?: PlayerScene[]
  markers?: PlayerMarker[]
  // Or use a preset (overrides config/scenes/markers)
  preset?: PlayerPreset
  // Playback
  initialTime?: number
  initialMode?: PlayerMode
  autoplay?: boolean
  loop?: boolean
  onStateChange?: (state: PlayerState) => void
  // Visual
  aspectRatio?: PlayerAspectRatio
  theme?: "light" | "dark" | "cinematic"
  safeArea?: "off" | "interface" | "broadcast"
  // Layout
  showInspector?: boolean
  showCapturePanel?: boolean
  showMarkers?: boolean
  showExport?: boolean
  className?: string
}

export function InteractionPlayer({
  config: configProp,
  scenes: scenesProp,
  markers: markersProp,
  preset,
  initialTime = 0,
  initialMode = "interactive",
  autoplay = false,
  loop = false,
  onStateChange,
  aspectRatio,
  theme = "cinematic",
  safeArea = "off",
  showInspector = false,
  showCapturePanel = false,
  showMarkers = true,
  showExport = false,
  className,
}: InteractionPlayerProps) {
  // Resolve from preset or direct props
  const scenes = preset?.scenes ?? scenesProp ?? []
  const markers = preset?.markers ?? markersProp ?? []
  const config: PlayerConfig = configProp ?? {
    fps: preset?.fps ?? 30,
    aspectRatio: aspectRatio ?? preset?.defaultAspectRatio ?? "16:9",
    loop,
    autoplay,
  }

  return (
    <PlayerProvider
      config={config}
      scenes={scenes}
      markers={markers}
      initialTime={initialTime}
      initialMode={initialMode}
      autoplay={autoplay}
      loop={loop}
      onStateChange={onStateChange}
    >
      <div className={cn("space-y-3", className)}>
        {/* Stage */}
        <PlayerStage
          theme={theme}
          safeArea={safeArea}
          showCaptureOverlay={initialMode === "capture"}
        />

        {/* Timeline */}
        <PlayerTimeline />

        {/* Controls */}
        <PlayerControls />

        {/* Markers */}
        {showMarkers && markers.length > 0 && (
          <div className="rounded-lg border border-stone-800 bg-[#0e0d0c] p-3">
            <PlayerMarkers />
          </div>
        )}

        {/* Optional panels */}
        {showCapturePanel && <PlayerCapturePanel />}
        {showInspector && <PlayerInspector />}
        {showExport && <PlayerTokenExport />}
      </div>
    </PlayerProvider>
  )
}
