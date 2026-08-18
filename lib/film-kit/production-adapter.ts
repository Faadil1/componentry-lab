import type { ProductionArtifact, ProductionArtifactManifest, ProductionRoute } from "../creative-os/production/types"
import type { FilmProject, FilmAsset, CaptureQueueItem } from "./types"

export interface CaptureIntentView {
  id: string
  shotId: string
  status: "pending" | "ready" | "captured" | "blocked"
  requirements: string
}

export interface AssetIntentView {
  id: string
  kind: string
  prompt: string
  filePath: string | null
  status: string
}

export interface FilmProductionIntentView {
  projectId: string
  title: string
  captureIntent: CaptureIntentView[]
  assetIntent: AssetIntentView[]
  requestedOutputs: string[]
}

export interface FilmKitProductionProjection {
  availability: "NO_CANONICAL_PRODUCTION_SPINE" | "AVAILABLE"
  routes: ProductionRoute[]
  artifacts: ProductionArtifact[]
  manifest: ProductionArtifactManifest | null
}

export function getFilmProductionTruth(_projectId: string): FilmKitProductionProjection {
  void _projectId
  // In the current architecture, there is no canonical runtime ProductionStateStore
  // or ProductionRepository. Therefore, it is factually incorrect to return
  // fabricated routes, artifacts, and manifests.
  // Film Kit must fail closed and report the absence of a canonical spine.
  return {
    availability: "NO_CANONICAL_PRODUCTION_SPINE",
    routes: [],
    artifacts: [],
    manifest: null
  }
}

export function getFilmProductionIntent(film: FilmProject): FilmProductionIntentView {
  return {
    projectId: film.id,
    title: film.brief.title,
    captureIntent: film.captureQueue.map((item: CaptureQueueItem) => ({
      id: item.id,
      shotId: item.shotId,
      status: item.status,
      requirements: item.expectedVisualResult || "None"
    })),
    assetIntent: film.assets.map((asset: FilmAsset) => ({
      id: asset.id,
      kind: asset.kind,
      prompt: asset.prompt,
      filePath: asset.filePath || null,
      status: asset.status
    })),
    requestedOutputs: film.brief.format ? ["product-demo-film"] : []
  }
}
