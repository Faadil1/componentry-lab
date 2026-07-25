"use client"

// ─────────────────────────────────────────────────────────────
// Composition Recipes — Provider & Context
// ─────────────────────────────────────────────────────────────

import * as React from "react"
import type {
  RecipeCaptureState,
  RecipeContext,
  RecipeId,
  RecipePreset,
  RecipeSnapshot,
  RecipeViewport,
} from "@/lib/recipes/types"
import { recipePresets } from "@/lib/recipes/presets"

const RecipeContextObj = React.createContext<RecipeContext | null>(null)

const RECIPE_ID_MAP = {
  "product-launch": "productLaunch",
  "operational-workspace": "operationalWorkspace",
  "data-story": "dataStory",
  "broadcast-package": "broadcastPackage",
} satisfies Record<RecipeId, keyof typeof recipePresets>

export function useRecipeStudio(): RecipeContext {
  const context = React.useContext(RecipeContextObj)

  if (!context) {
    throw new Error(
      "useRecipeStudio must be used within a <RecipeProvider>. " +
        "Wrap your component tree with <RecipeProvider> or <RecipeWorkbench>."
    )
  }

  return context
}

export interface RecipeProviderProps {
  initialRecipeId?: RecipeId
  initialViewport?: RecipeViewport
  children: React.ReactNode
  onRecipeChange?: (recipe: RecipePreset) => void
}

export function RecipeProvider({
  initialRecipeId = "product-launch",
  initialViewport = "desktop",
  children,
  onRecipeChange,
}: RecipeProviderProps) {
  const [activeRecipeId, setActiveRecipeId] =
    React.useState<RecipeId>(initialRecipeId)

  const activeRecipe = React.useMemo<RecipePreset>(() => {
    const key = RECIPE_ID_MAP[activeRecipeId]
    return recipePresets[key]
  }, [activeRecipeId])

  const defaultCaptureState = React.useMemo<RecipeCaptureState>(() => {
    return (
      activeRecipe.capturePlan.states.find(
        (state) => state.id === activeRecipe.signatureStateId
      ) ?? activeRecipe.capturePlan.states[0]
    )
  }, [activeRecipe])

  const [activeSectionId, setActiveSectionId] = React.useState<string>(
    activeRecipe.sections[0].id
  )

  const [activeCaptureStateId, setActiveCaptureStateId] =
    React.useState<string>(defaultCaptureState.id)

  const [inspectorVisible, setInspectorVisible] = React.useState(true)
  const [systemMapVisible, setSystemMapVisible] = React.useState(true)
  const [cleanView, setCleanView] = React.useState(false)

  const [viewport, setViewportState] =
    React.useState<RecipeViewport>(initialViewport)

  // Keep the latest callback without forcing recipe effects to rerun.
  const onRecipeChangeRef = React.useRef(onRecipeChange)

  React.useEffect(() => {
    onRecipeChangeRef.current = onRecipeChange
  }, [onRecipeChange])

  React.useEffect(() => {
    onRecipeChangeRef.current?.(activeRecipe)
  }, [activeRecipe])

  // Restore supported state parameters from the URL on mount.
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const params = new URLSearchParams(window.location.search)

    const recipeParam = params.get("recipe") as RecipeId | null
    const stateParam = params.get("state")
    const viewportParam = params.get("vp") as RecipeViewport | null
    const cleanParam = params.get("clean")

    window.setTimeout(() => {
      const mappedKey = recipeParam
        ? RECIPE_ID_MAP[recipeParam]
        : undefined

      if (recipeParam && mappedKey && recipePresets[mappedKey]) {
        const targetRecipe = recipePresets[mappedKey]

        setActiveRecipeId(recipeParam)
        setActiveSectionId(targetRecipe.sections[0].id)

        if (stateParam) {
          const restoredState = targetRecipe.capturePlan.states.find(
            (state) => state.id === stateParam
          )

          if (restoredState) {
            setActiveCaptureStateId(restoredState.id)
          }
        }
      }

      if (viewportParam) {
        setViewportState(viewportParam)
      }

      if (cleanParam === "1") {
        setCleanView(true)
      }
    }, 0)
  }, [])

  const activeCaptureState = React.useMemo<RecipeCaptureState>(() => {
    return (
      activeRecipe.capturePlan.states.find(
        (state) => state.id === activeCaptureStateId
      ) ?? defaultCaptureState
    )
  }, [activeRecipe, activeCaptureStateId, defaultCaptureState])

  // Keep the simulated viewport aligned with the selected capture state.
  React.useEffect(() => {
    window.setTimeout(() => {
      setViewportState(activeCaptureState.viewport)
    }, 0)
  }, [activeCaptureState])

  const snapshot = React.useMemo<RecipeSnapshot>(() => {
    return {
      recipeId: activeRecipeId,
      category: activeRecipe.category,
      activeSectionId,
      activeCaptureStateId,
      viewport,
      inspectorVisible,
      systemMapVisible,
      cleanView,
    }
  }, [
    activeRecipeId,
    activeRecipe.category,
    activeSectionId,
    activeCaptureStateId,
    viewport,
    inspectorVisible,
    systemMapVisible,
    cleanView,
  ])

  // Keep the active recipe state reproducible through the current URL.
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const query = new URLSearchParams()

    query.set("recipe", snapshot.recipeId)
    query.set("state", snapshot.activeCaptureStateId)
    query.set("vp", snapshot.viewport)
    query.set("clean", snapshot.cleanView ? "1" : "0")

    const newUrl = `${window.location.pathname}?${query.toString()}`

    window.history.replaceState(
      { ...window.history.state },
      "",
      newUrl
    )
  }, [snapshot])

  const actions = React.useMemo<RecipeContext["actions"]>(() => {
    return {
      setRecipe: (recipeId: RecipeId) => {
        const key = RECIPE_ID_MAP[recipeId]
        const targetRecipe = recipePresets[key]

        const targetDefaultState =
          targetRecipe.capturePlan.states.find(
            (state) => state.id === targetRecipe.signatureStateId
          ) ?? targetRecipe.capturePlan.states[0]

        setActiveRecipeId(recipeId)
        setActiveSectionId(targetRecipe.sections[0].id)
        setActiveCaptureStateId(targetDefaultState.id)
        setViewportState(targetDefaultState.viewport)
        setCleanView(false)
      },

      setSection: (sectionId: string) => {
        setActiveSectionId(sectionId)
      },

      setCaptureState: (stateId: string) => {
        const stateExists = activeRecipe.capturePlan.states.some(
          (state) => state.id === stateId
        )

        if (stateExists) {
          setActiveCaptureStateId(stateId)
        }
      },

      nextCaptureState: () => {
        const currentIndex =
          activeRecipe.capturePlan.states.findIndex(
            (state) => state.id === activeCaptureStateId
          )

        if (
          currentIndex !== -1 &&
          currentIndex < activeRecipe.capturePlan.states.length - 1
        ) {
          const nextState =
            activeRecipe.capturePlan.states[currentIndex + 1]

          setActiveCaptureStateId(nextState.id)
        }
      },

      previousCaptureState: () => {
        const currentIndex =
          activeRecipe.capturePlan.states.findIndex(
            (state) => state.id === activeCaptureStateId
          )

        if (currentIndex > 0) {
          const previousState =
            activeRecipe.capturePlan.states[currentIndex - 1]

          setActiveCaptureStateId(previousState.id)
        }
      },

      setViewport: (nextViewport: RecipeViewport) => {
        setViewportState(nextViewport)
      },

      toggleInspector: () => {
        setInspectorVisible((visible) => !visible)
      },

      toggleSystemMap: () => {
        setSystemMapVisible((visible) => !visible)
      },

      toggleCleanView: () => {
        setCleanView((visible) => !visible)
      },

      resetRecipe: () => {
        const resetState =
          activeRecipe.capturePlan.states.find(
            (state) => state.id === activeRecipe.signatureStateId
          ) ?? activeRecipe.capturePlan.states[0]

        setActiveSectionId(activeRecipe.sections[0].id)
        setActiveCaptureStateId(resetState.id)
        setViewportState(resetState.viewport)
        setCleanView(false)
        setInspectorVisible(true)
        setSystemMapVisible(true)
      },

      copySnapshot: async () => {
        await navigator.clipboard.writeText(
          JSON.stringify(snapshot, null, 2)
        )
      },

      copyCapturePlan: async () => {
        await navigator.clipboard.writeText(
          JSON.stringify(activeRecipe.capturePlan, null, 2)
        )
      },
    }
  }, [activeRecipe, activeCaptureStateId, snapshot])

  const contextValue = React.useMemo<RecipeContext>(() => {
    return {
      state: {
        activeRecipeId,
        activeRecipe,
        activeSectionId,
        activeCaptureStateId,
        inspectorVisible,
        systemMapVisible,
        cleanView,
        viewport,
        snapshot,
      },
      actions,
    }
  }, [
    activeRecipeId,
    activeRecipe,
    activeSectionId,
    activeCaptureStateId,
    inspectorVisible,
    systemMapVisible,
    cleanView,
    viewport,
    snapshot,
    actions,
  ])

  return (
    <RecipeContextObj.Provider value={contextValue}>
      {children}
    </RecipeContextObj.Provider>
  )
}

export default RecipeProvider

