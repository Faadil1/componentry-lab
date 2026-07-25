"use client"

// ─────────────────────────────────────────────────────────────
// Demo & Capture Bridge — Workbench Coordinator
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import { CaptureProvider } from "./capture-provider"
import { CaptureStage } from "./capture-stage"
import { CaptureToolbar } from "./capture-toolbar"
import { CaptureTimeline } from "./capture-timeline"
import { CaptureStateList } from "./capture-state-list"
import { CaptureStepList } from "./capture-step-list"
import { CaptureInspector } from "./capture-inspector"
import { CaptureManifestExport } from "./capture-manifest-export"
import { CaptureUrlPanel } from "./capture-url-panel"
import { CaptureCleanView } from "./capture-clean-view"
import type { CaptureScene, CaptureState, CaptureViewport, CaptureChromeMode, CaptureSafeArea } from "@/lib/capture/types"
import { cn } from "@/lib/utils"

export interface CaptureWorkbenchProps {
  scene?: CaptureScene
  initialStateId?: string
  initialViewport?: CaptureViewport
  initialChromeMode?: CaptureChromeMode
  initialSafeArea?: CaptureSafeArea
  showInspector?: boolean
  showTimeline?: boolean
  showNotes?: boolean
  className?: string
  onStateChange?: (state: CaptureState) => void
}

function WorkbenchLayout({
  showInspector,
  showTimeline,
  showNotes,
}: {
  showInspector: boolean
  showTimeline: boolean
  showNotes: boolean
}) {
  return (
    <div className="space-y-6">
      {/* simulated view, toolbar, clean overlays */}
      <CaptureCleanView />

      {/* Main Toolbar */}
      <CaptureToolbar />

      {/* Simulation Stage viewport */}
      <CaptureStage className="w-full" />

      {/* Timeline tracker */}
      {showTimeline && <CaptureTimeline />}

      {/* Main specimen logs lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CaptureStateList />
        <CaptureStepList />
      </div>

      {/* Secondary layout sections */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          {showNotes && <CaptureUrlPanel />}
          <CaptureManifestExport />
        </div>
        {showInspector && <CaptureInspector />}
      </div>
    </div>
  )
}

export function CaptureWorkbench({
  scene,
  initialStateId,
  initialViewport,
  initialChromeMode = "full",
  initialSafeArea = "off",
  showInspector = true,
  showTimeline = true,
  showNotes = true,
  className,
  onStateChange,
}: CaptureWorkbenchProps) {
  return (
    <CaptureProvider
      scene={scene}
      initialStateId={initialStateId}
      initialViewport={initialViewport}
      initialChromeMode={initialChromeMode}
      initialSafeArea={initialSafeArea}
      onStateChange={onStateChange}
    >
      <div className={cn("space-y-6", className)}>
        <WorkbenchLayout
          showInspector={showInspector}
          showTimeline={showTimeline}
          showNotes={showNotes}
        />
      </div>
    </CaptureProvider>
  )
}
export default CaptureWorkbench
