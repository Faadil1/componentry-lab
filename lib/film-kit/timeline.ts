import type { FilmTimeline, RemotionReadyConfig, TimelineTrack } from "./types"

export function secondsToFrames(seconds: number, fps = 30): number {
  return Math.round(seconds * fps)
}

export function framesToSeconds(frames: number, fps = 30): number {
  return frames / fps
}

export function buildRemotionReadyConfig(timeline: FilmTimeline, width = 1920, height = 1080, fps = 30): RemotionReadyConfig {
  return {
    projectId: timeline.projectId,
    durationSeconds: timeline.durationSeconds,
    fps,
    width,
    height,
    tracks: timeline.tracks,
    timingStatus: timeline.timingStatus,
  }
}

export function validateRemotionReadyConfig(config: RemotionReadyConfig): string[] {
  const errors: string[] = []
  if (config.durationSeconds <= 0) errors.push("Duration must be positive.")
  if (config.width <= 0 || config.height <= 0) errors.push("Dimensions must be positive.")
  if (config.fps <= 0) errors.push("FPS must be positive.")
  return errors
}

export function validateTracks(tracks: TimelineTrack[]): string[] {
  const errors: string[] = []
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (clip.start < 0) errors.push(`Clip ${clip.id} has a negative start.`)
      if (clip.duration <= 0) errors.push(`Clip ${clip.id} has a non-positive duration.`)
    }
  }
  return errors
}