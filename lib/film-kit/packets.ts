import { exportAi33SubmissionPacket, exportAssetRegister, exportCaptureQueue, exportDialoguePacket, exportFlowGenerationPackets, exportGoogleVidsAssemblyPacket, exportMusicGenerationPackets, exportNarrativePacket, exportNarrationScriptPacket, exportProductionHandoffPacket, exportQaReport, exportRemotionReadyConfig, exportSceneManifest, exportShotManifest, exportSubtitleTrack, exportTimelineManifest, exportVidiqConceptPackets, exportVoiceDirectionPacket } from "./exporters"
import type { FilmProject } from "./types"

export function buildFilmKitPackets(project: FilmProject) {
  return [
    { id: "brief", label: "Brief", description: "Film brief", content: JSON.stringify(project.brief, null, 2) },
    { id: "narrative", label: "Narrative", description: "Narrative architecture", content: exportNarrativePacket(project) },
    { id: "scenes", label: "Scenes", description: "Scene manifest", content: exportSceneManifest(project) },
    { id: "shots", label: "Shots", description: "Shot manifest", content: exportShotManifest(project) },
    { id: "capture", label: "Capture Queue", description: "Capture queue", content: exportCaptureQueue(project) },
    { id: "flow", label: "Flow Packets", description: "Manual flow packets", content: exportFlowGenerationPackets(project) },
    { id: "vidiq", label: "vidIQ Packets", description: "Concept packets", content: exportVidiqConceptPackets(project) },
    { id: "google-vids", label: "Google Vids", description: "Assembly packet", content: exportGoogleVidsAssemblyPacket(project) },
    { id: "music", label: "Music Packets", description: "Music generation packets", content: exportMusicGenerationPackets(project) },
    { id: "voice", label: "Voice Direction", description: "Voice direction packet", content: exportVoiceDirectionPacket(project) },
    { id: "narration", label: "Narration", description: "Narration script packet", content: exportNarrationScriptPacket(project) },
    { id: "dialogue", label: "Dialogue", description: "Dialogue packet", content: exportDialoguePacket(project) },
    { id: "subtitles", label: "Subtitles", description: "Subtitle track", content: exportSubtitleTrack(project) },
    { id: "timeline", label: "Timeline", description: "Timeline manifest", content: exportTimelineManifest(project) },
    { id: "remotion", label: "Remotion", description: "Remotion-ready config", content: exportRemotionReadyConfig(project) },
    { id: "qa", label: "QA", description: "QA report", content: exportQaReport(project) },
    { id: "handoff", label: "Production Handoff", description: "Production handoff packet", content: exportProductionHandoffPacket(project) },
    { id: "assets", label: "Assets", description: "Asset register", content: exportAssetRegister(project) },
    { id: "ai33", label: "AI33 Submission", description: "AI33 submission packet", content: exportAi33SubmissionPacket(project) },
  ]
}