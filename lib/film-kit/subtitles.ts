import type { SubtitleCue, SubtitleTrack } from "./types"

export function makeSubtitleTrack(track: SubtitleTrack): SubtitleTrack {
  return track
}

export function formatSrt(track: SubtitleTrack): string {
  return track.cues.map((cue, index) => `${index + 1}\n${cue.start.toFixed(3)} --> ${cue.end.toFixed(3)}\n${cue.text}`).join("\n\n")
}

export function formatWebVtt(track: SubtitleTrack): string {
  return ["WEBVTT", "", ...track.cues.map((cue) => `${cue.start.toFixed(3)} --> ${cue.end.toFixed(3)}\n${cue.text}`)].join("\n")
}

export function cueFromText(id: string, start: number, end: number, text: string): SubtitleCue {
  return { id, start, end, text, language: "en", timingStatus: "estimated" }
}