// ─────────────────────────────────────────────────────────────
// Demo & Capture Bridge — Core Types
// ─────────────────────────────────────────────────────────────

export type CaptureViewport =
  | "desktop"
  | "laptop"
  | "tablet"
  | "mobile"
  | "broadcast"
  | "portrait"
  | "custom"

export type CaptureOrientation = "landscape" | "portrait"

export type CaptureAspectRatio = "16:9" | "4:3" | "1:1" | "9:16" | "custom"

export type CaptureChromeMode = "full" | "minimal" | "hidden"

export type CaptureSafeArea =
  | "off"
  | "interface"
  | "presentation"
  | "broadcast"
  | "cinematic"

export type CaptureStepType =
  | "initial"
  | "interaction"
  | "transition"
  | "evidence"
  | "decision"
  | "pause"
  | "capture"
  | "final"

export type CaptureStateType =
  | "setup"
  | "intermediate"
  | "signature"
  | "evidence"
  | "result"
  | "fallback"

export type CaptureSceneStatus = "draft" | "active" | "deprecated"

export interface CaptureViewportPreset {
  id: CaptureViewport
  label: string
  width: number
  height: number
  isSimulatedOnly?: boolean
}

export interface CaptureStep {
  id: string
  order: number
  action: "load" | "click" | "toggle" | "seek" | "exclude" | "include" | "select" | "wait" | "capture" | "reset"
  target: string
  trigger: string
  duration: number
  resultingStateId: string
  expectedValidation?: string
  notes?: string
}

export interface CaptureState {
  id: string
  label: string
  description?: string
  time: number
  frame: number
  stateType: CaptureStateType
  isCapturePoint: boolean
  markerId?: string
  routeState?: Record<string, string | number | boolean | null>
  notes?: string
  expectedVisualResult?: string
}

export interface CaptureScene {
  id: string
  label: string
  description: string
  route: string
  status: CaptureSceneStatus
  viewport: CaptureViewport
  aspectRatio: CaptureAspectRatio
  fps: number
  duration: number
  chromeMode: CaptureChromeMode
  safeArea: CaptureSafeArea
  steps: CaptureStep[]
  states: CaptureState[]
  signatureStateId: string
  fallbackStateId: string
  notes?: string
  limitations?: string[]
}

export interface CaptureManifest {
  version: string
  scene: CaptureScene
}

export interface CaptureSnapshot {
  sceneId: string
  stateId: string
  currentTime: number
  frame: number
  viewport: CaptureViewport
  chromeMode: CaptureChromeMode
  safeArea: CaptureSafeArea
  inspectorVisible: boolean
  notesVisible: boolean
  cleanView: boolean
}

export interface CaptureConfig {
  fps: number
  viewportPresets: CaptureViewportPreset[]
}

export interface CaptureContext {
  state: {
    activeScene: CaptureScene
    activeState: CaptureState
    currentStep: CaptureStep | null
    currentTime: number
    currentFrame: number
    viewport: CaptureViewport
    aspectRatio: CaptureAspectRatio
    chromeMode: CaptureChromeMode
    safeArea: CaptureSafeArea
    inspectorVisible: boolean
    notesVisible: boolean
    cleanView: boolean
    manifest: CaptureManifest
    snapshot: CaptureSnapshot
    customWidth: number
    customHeight: number
  }
  actions: {
    setScene: (scene: CaptureScene) => void
    setState: (stateId: string) => void
    nextState: () => void
    previousState: () => void
    jumpToState: (stateId: string) => void
    setViewport: (viewport: CaptureViewport) => void
    setCustomDimensions: (width: number, height: number) => void
    setAspectRatio: (ratio: CaptureAspectRatio) => void
    setChromeMode: (mode: CaptureChromeMode) => void
    setSafeArea: (safeArea: CaptureSafeArea) => void
    toggleInspector: () => void
    toggleNotes: () => void
    toggleCleanView: () => void
    restoreFromUrl: () => void
    resetScene: () => void
    copyRestoreUrl: () => Promise<void>
    copySnapshot: () => Promise<void>
    copyManifest: () => Promise<void>
  }
}
