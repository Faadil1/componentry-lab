import type {
  FilmBrief,
  FilmProject,
  FilmQaReport,
  FilmTimeline,
  RemotionReadyConfig,
  SubtitleTrack,
} from "./types"
import { serializeFilmProject } from "./serializer"

export function exportFilmBriefPacket(project: { brief: FilmBrief }) { return serializeFilmProject(project.brief) }
export function exportNarrativePacket(project: FilmProject) { return serializeFilmProject(project.narrative) }
export function exportSceneManifest(project: FilmProject) { return serializeFilmProject(project.scenes) }
export function exportShotManifest(project: FilmProject) { return serializeFilmProject(project.shots) }
export function exportCaptureQueue(project: FilmProject) { return serializeFilmProject(project.captureQueue) }
export function exportFlowGenerationPackets(project: FilmProject) { return serializeFilmProject(project.flowPackets) }
export function exportVidiqConceptPackets(project: FilmProject) { return serializeFilmProject(project.vidiqPackets) }
export function exportGoogleVidsAssemblyPacket(project: FilmProject) { return serializeFilmProject(project.googleVidsPacket) }
export function exportMusicGenerationPackets(project: FilmProject) { return serializeFilmProject(project.musicPackets) }
export function exportVoiceDirectionPacket(project: FilmProject) { return serializeFilmProject(project.voiceDirection) }
export function exportNarrationScriptPacket(project: FilmProject) { return serializeFilmProject(project.narrationSegments) }
export function exportDialoguePacket(project: FilmProject) { return serializeFilmProject(project.dialogueSegments) }
export function exportPronunciationPacket(project: FilmProject) { return serializeFilmProject(project.pronunciationDictionary) }
export function exportAi33SubmissionPacket(project: FilmProject) { return serializeFilmProject({ projectId: project.id, brief: project.brief, narrative: project.narrative }) }
export function exportAssetRegister(project: FilmProject) { return serializeFilmProject(project.assets) }
export function exportSubtitleTrack(project: { subtitleTracks: SubtitleTrack[] }) { return serializeFilmProject(project.subtitleTracks) }
export function exportTimelineManifest(project: { timeline: FilmTimeline }) { return serializeFilmProject(project.timeline) }
export function exportRemotionReadyConfig(project: { remotion: RemotionReadyConfig }) { return serializeFilmProject(project.remotion) }
export function exportQaReport(project: { qaReport: FilmQaReport }) { return serializeFilmProject(project.qaReport) }
export function exportProductionHandoffPacket(project: FilmProject) { return serializeFilmProject({ brief: project.brief, approvalGates: project.approvalGates, generationBudget: project.generationBudget }) }