"use client"

// ─────────────────────────────────────────────────────────────
// Demo & Capture Bridge — Provider & Context
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import type {
  CaptureContext,
  CaptureScene,
  CaptureState,
  CaptureStep,
  CaptureViewport,
  CaptureAspectRatio,
  CaptureChromeMode,
  CaptureSafeArea,
  CaptureSnapshot,
  CaptureManifest,
  CaptureViewportPreset,
} from "@/lib/capture/types"
import {
  createCaptureSnapshot,
  buildCaptureUrl,
  deserializeCaptureState,
} from "@/lib/capture/serializer"
import { capturePresets } from "@/lib/capture/presets"

const CaptureContextObj = React.createContext<CaptureContext | null>(null)

export function useCaptureBridge(): CaptureContext {
  const ctx = React.useContext(CaptureContextObj)
  if (!ctx) {
    throw new Error(
      "useCaptureBridge must be used within a <CaptureProvider>. " +
      "Wrap your component tree with <CaptureProvider> or <CaptureWorkbench>."
    )
  }
  return ctx
}

export const VIEWPORT_PRESETS: CaptureViewportPreset[] = [
  { id: "desktop", label: "Desktop (1440×900)", width: 1440, height: 900 },
  { id: "laptop", label: "Laptop (1280×800)", width: 1280, height: 800 },
  { id: "tablet", label: "Tablet (768×1024)", width: 768, height: 1024 },
  { id: "mobile", label: "Mobile (390×844)", width: 390, height: 844 },
  { id: "broadcast", label: "Broadcast (1920×1080)", width: 1920, height: 1080 },
  { id: "portrait", label: "Portrait Video (1080×1920)", width: 1080, height: 1920 },
  { id: "custom", label: "Custom Viewport", width: 800, height: 600, isSimulatedOnly: true },
]

export interface CaptureProviderProps {
  scene?: CaptureScene
  initialStateId?: string
  initialViewport?: CaptureViewport
  initialChromeMode?: CaptureChromeMode
  initialSafeArea?: CaptureSafeArea
  children: React.ReactNode
  onStateChange?: (state: CaptureState) => void
}

export function CaptureProvider({
  scene = capturePresets.evidenceDecision,
  initialStateId,
  initialViewport,
  initialChromeMode,
  initialSafeArea,
  children,
  onStateChange,
}: CaptureProviderProps) {
  const [activeScene, setActiveScene] = React.useState<CaptureScene>(scene)

  // Find matching initial state
  const defaultState = activeScene.states.find(s => s.id === activeScene.fallbackStateId) || activeScene.states[0]
  const targetInitialState = initialStateId
    ? activeScene.states.find(s => s.id === initialStateId) || defaultState
    : defaultState

  const [activeState, setActiveState] = React.useState<CaptureState>(targetInitialState)
  const [viewport, setViewportState] = React.useState<CaptureViewport>(initialViewport || activeScene.viewport)
  const [customWidth, setCustomWidth] = React.useState(800)
  const [customHeight, setCustomHeight] = React.useState(600)
  const [aspectRatio, setAspectRatio] = React.useState<CaptureAspectRatio>(activeScene.aspectRatio)
  const [chromeMode, setChromeMode] = React.useState<CaptureChromeMode>(initialChromeMode || activeScene.chromeMode)
  const [safeArea, setSafeArea] = React.useState<CaptureSafeArea>(initialSafeArea || activeScene.safeArea)
  const [inspectorVisible, setInspectorVisible] = React.useState(true)
  const [notesVisible, setNotesVisible] = React.useState(true)
  const [cleanView, setCleanView] = React.useState(false)

  // Current step associated with activeState
  const currentStep = React.useMemo<CaptureStep | null>(() => {
    return activeScene.steps.find(s => s.resultingStateId === activeState.id) || null
  }, [activeScene, activeState])

  const currentTime = activeState.time
  const currentFrame = activeState.frame

  const manifest = React.useMemo<CaptureManifest>(() => {
    return { version: "1.0", scene: activeScene }
  }, [activeScene])

  const snapshot = React.useMemo<CaptureSnapshot>(() => {
    return createCaptureSnapshot({
      sceneId: activeScene.id,
      stateId: activeState.id,
      currentTime,
      frame: currentFrame,
      viewport,
      chromeMode,
      safeArea,
      inspectorVisible,
      notesVisible,
      cleanView,
    })
  }, [activeScene.id, activeState.id, currentTime, currentFrame, viewport, chromeMode, safeArea, inspectorVisible, notesVisible, cleanView])

  // Sync state variables in URL (deterministic shareable state)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const query = new URLSearchParams()
      query.set("scene", snapshot.sceneId)
      query.set("state", snapshot.stateId)
      query.set("t", snapshot.currentTime.toFixed(2))
      query.set("f", String(snapshot.frame))
      query.set("vp", snapshot.viewport)
      query.set("cm", snapshot.chromeMode)
      query.set("sa", snapshot.safeArea)
      query.set("inspect", snapshot.inspectorVisible ? "1" : "0")
      query.set("notes", snapshot.notesVisible ? "1" : "0")
      query.set("clean", snapshot.cleanView ? "1" : "0")
      
      const newUrl = `${window.location.pathname}?${query.toString()}`
      window.history.replaceState({ ...window.history.state }, "", newUrl)
    }
  }, [snapshot])

  // Restore snapshot values from URL on mount
  const restoreFromUrl = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const parsed = deserializeCaptureState(window.location.search)
      
      if (parsed.sceneId) {
        const foundScene = Object.values(capturePresets).find(p => p.id === parsed.sceneId)
        if (foundScene) {
          setActiveScene(foundScene)
          if (parsed.stateId) {
            const foundState = foundScene.states.find(s => s.id === parsed.stateId)
            if (foundState) setActiveState(foundState)
          }
        }
      }
      if (parsed.viewport) setViewportState(parsed.viewport)
      if (parsed.chromeMode) setChromeMode(parsed.chromeMode)
      if (parsed.safeArea) setSafeArea(parsed.safeArea)
      if (parsed.inspectorVisible !== undefined) setInspectorVisible(parsed.inspectorVisible)
      if (parsed.notesVisible !== undefined) setNotesVisible(parsed.notesVisible)
      if (parsed.cleanView !== undefined) setCleanView(parsed.cleanView)
    }
  }, [])

  // Call restore on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      restoreFromUrl()
    }, 0)
    return () => clearTimeout(timer)
  }, [restoreFromUrl])

  // State change notification
  const onStateChangeRef = React.useRef(onStateChange)
  React.useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  React.useEffect(() => {
    onStateChangeRef.current?.(activeState)
  }, [activeState])

  // Actions
  const actions = React.useMemo(() => ({
    setScene: (sc: CaptureScene) => {
      setActiveScene(sc)
      const defState = sc.states.find(s => s.id === sc.fallbackStateId) || sc.states[0]
      setActiveState(defState)
      setViewportState(sc.viewport)
      setAspectRatio(sc.aspectRatio)
      setChromeMode(sc.chromeMode)
      setSafeArea(sc.safeArea)
      setCleanView(false)
    },
    setState: (stateId: string) => {
      const found = activeScene.states.find(s => s.id === stateId)
      if (found) {
        setActiveState(found)
      }
    },
    nextState: () => {
      const index = activeScene.states.findIndex(s => s.id === activeState.id)
      if (index !== -1 && index < activeScene.states.length - 1) {
        setActiveState(activeScene.states[index + 1])
      }
    },
    previousState: () => {
      const index = activeScene.states.findIndex(s => s.id === activeState.id)
      if (index > 0) {
        setActiveState(activeScene.states[index - 1])
      }
    },
    jumpToState: (stateId: string) => {
      const found = activeScene.states.find(s => s.id === stateId)
      if (found) {
        setActiveState(found)
      }
    },
    setViewport: (vp: CaptureViewport) => {
      setViewportState(vp)
    },
    setCustomDimensions: (width: number, height: number) => {
      setCustomWidth(width)
      setCustomHeight(height)
    },
    setAspectRatio: (ratio: CaptureAspectRatio) => {
      setAspectRatio(ratio)
    },
    setChromeMode: (mode: CaptureChromeMode) => {
      setChromeMode(mode)
      if (mode === "hidden") {
        setCleanView(true)
      }
    },
    setSafeArea: (sa: CaptureSafeArea) => {
      setSafeArea(sa)
    },
    toggleInspector: () => setInspectorVisible(v => !v),
    toggleNotes: () => setNotesVisible(v => !v),
    toggleCleanView: () => setCleanView(v => !v),
    restoreFromUrl,
    resetScene: () => {
      const defState = activeScene.states.find(s => s.id === activeScene.fallbackStateId) || activeScene.states[0]
      setActiveState(defState)
      setViewportState(activeScene.viewport)
      setAspectRatio(activeScene.aspectRatio)
      setChromeMode(activeScene.chromeMode)
      setSafeArea(activeScene.safeArea)
      setCleanView(false)
      setInspectorVisible(true)
      setNotesVisible(true)
    },
    copyRestoreUrl: async () => {
      if (typeof window !== "undefined") {
        const url = buildCaptureUrl(window.location.href, snapshot)
        await navigator.clipboard.writeText(url)
      }
    },
    copySnapshot: async () => {
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2))
    },
    copyManifest: async () => {
      await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2))
    },
  }), [activeScene, activeState, snapshot, manifest, restoreFromUrl])

  const contextValue: CaptureContext = React.useMemo(() => {
    return {
      state: {
        activeScene,
        activeState,
        currentStep,
        currentTime,
        currentFrame,
        viewport,
        aspectRatio,
        chromeMode,
        safeArea,
        inspectorVisible,
        notesVisible,
        cleanView,
        manifest,
        snapshot,
        customWidth,
        customHeight,
      },
      actions,
    }
  }, [
    activeScene,
    activeState,
    currentStep,
    currentTime,
    currentFrame,
    viewport,
    aspectRatio,
    chromeMode,
    safeArea,
    inspectorVisible,
    notesVisible,
    cleanView,
    manifest,
    snapshot,
    customWidth,
    customHeight,
    actions,
  ])

  return (
    <CaptureContextObj.Provider value={contextValue}>
      {children}
    </CaptureContextObj.Provider>
  )
}
export type { CaptureContext }
