import type { ProjectBrain, ProjectId } from "@/lib/projects"

export type FilmPurpose = "technical-proof" | "client-case-study" | "editorial-explainer"
export type FilmFormat = "16:9" | "9:16" | "1:1"
export type FilmStatus = "draft" | "ready" | "blocked"
export type TimelineTrackKind = "video" | "screen-capture" | "b-roll" | "motion" | "overlay" | "typography" | "voice-over" | "dialogue" | "music" | "sound-effect" | "subtitles" | "metadata"
export type ApprovalState = "unknown" | "pending" | "approved" | "rejected"
export type RightsStatus = "unknown" | "cleared" | "restricted" | "rejected"
export type GenerationStatus = "unknown" | "manual" | "needs-review" | "approved" | "blocked"
export type TimingStatus = "estimated" | "script-derived" | "provider-derived" | "manually-approved" | "final"
export type QaSeverity = "info" | "warning" | "error"
export type ProviderName = "ai33" | "manual"
export type VoiceGender = "any" | "female" | "male" | "neutral"
export type SubtitleFormat = "srt" | "vtt" | "json"

export interface FilmKitPreset {
  id: string
  label: string
  description: string
  aspectRatio: FilmFormat
  audience: string
  deliveryMode: string
  sourceProjectId: ProjectId
}

export interface FilmKitPacket {
  id: string
  label: string
  description: string
  content: string
}

export interface FilmBrief {
  id: ProjectId
  projectId: ProjectId
  title: string
  slug: string
  purpose: FilmPurpose
  format: FilmFormat
  durationSeconds: number
  memoryHook: string
  heroDemoMoment: string
  primaryProof: string
  claim: string
  audience: string
  sourceProjectTitle: string
  sourceProjectKind: string
  sourceProjectStatus: string
  sourceProjectPhase: string
  createdLabel: string
  updatedLabel: string
  limitations: string[]
}

export interface NarrativeBeat {
  id: string
  order: number
  label: string
  description: string
  sourceShotIds: string[]
  emphasis: "claim" | "proof" | "context" | "transition" | "cta"
}

export interface NarrativeArchitecture {
  id: string
  title: string
  summary: string
  beats: NarrativeBeat[]
  voiceDirection: string
  bRollStrategy: string
  musicDirection: string
  cta: string
  qaPriorities: string[]
}

export interface FilmScene {
  id: string
  projectId: ProjectId
  label: string
  description: string
  order: number
  purpose: FilmPurpose
  bRollStrategy: string
  voiceDirection: string
  musicDirection: string
  captureStrategy: string
  cta: string
  qaPriority: string
  shotIds: string[]
}

export interface FilmShot {
  id: string
  sceneId: string
  projectId: ProjectId
  order: number
  label: string
  description: string
  route: string
  captureStateId?: string
  restoreUrl?: string
  viewport: string
  aspectRatio: FilmFormat
  evidenceIds: string[]
  outputFilename: string
  expectedVisualResult: string
  limitations: string[]
  status: GenerationStatus
  proofMoment: string
  durationSeconds: number
  bRoll: string
  voiceover: string
  narrationSegmentIds: string[]
  assetIds: string[]
}

export interface CaptureQueueItem {
  id: string
  projectId: ProjectId
  sceneId: string
  shotId: string
  route: string
  captureStateId?: string
  restoreUrl?: string
  expectedVisualResult: string
  viewport: string
  aspectRatio: FilmFormat
  evidenceIds: string[]
  outputFilename: string
  status: "pending" | "ready" | "captured" | "blocked"
  limitations: string[]
}

export interface FilmAsset {
  id: string
  projectId: ProjectId
  sceneId: string
  shotId: string
  kind: "screen-capture" | "b-roll" | "voice" | "music" | "subtitle" | "metadata"
  source: string
  status: GenerationStatus
  filePath: string
  previewPath: string
  externalReference: string
  prompt: string
  model: string
  providerTaskId: string
  providerMetadata: Record<string, string>
  durationSeconds: number
  width: number
  height: number
  frameRate: number
  sampleRate: number
  version: number
  supersedes?: string
  supersededBy?: string
  rightsStatus: RightsStatus
  provenanceNotes: string
  rejectionReason: string
  approvalState: ApprovalState
  createdLabel: string
  updatedLabel: string
}

export interface FilmVoiceDirection {
  title: string
  summary: string
  tone: string
  pace: string
  perspective: string
  pronunciationNotes: string[]
  language: string
  provider: ProviderName
}

export interface VoiceCandidate {
  id: string
  provider: ProviderName
  label: string
  language: string
  gender: VoiceGender
  style: string
  speed: number
  sampleUrl?: string
  shortlist: boolean
  approved: boolean
  rejected: boolean
}

export interface VoiceDecision {
  candidateId: string
  candidateLabel: string
  approved: boolean
  reason: string
  approvedLabel: string
}

export interface NarrationSegment {
  id: string
  sceneId: string
  shotId: string
  order: number
  language: string
  text: string
  timingStatus: TimingStatus
  speakerLabel: string
  provider: ProviderName
  approvals: ApprovalState
  durationSeconds: number
}

export interface DialogueSegment {
  id: string
  sceneId: string
  shotId: string
  order: number
  speakerLabel: string
  text: string
  timingStatus: TimingStatus
  approvals: ApprovalState
}

export interface PronunciationDictionary {
  id: string
  projectId: ProjectId
  label: string
  language: string
  entries: Array<{ term: string; pronunciation: string; note: string }>
  approvalState: ApprovalState
}

export interface SubtitleCue {
  id: string
  start: number
  end: number
  text: string
  language: string
  speakerLabel?: string
  timingStatus: TimingStatus
}

export interface SubtitleTrack {
  id: string
  projectId: ProjectId
  format: SubtitleFormat
  language: string
  cues: SubtitleCue[]
  source: string
}

export interface FlowGenerationPacket {
  id: string
  projectId: ProjectId
  sceneId: string
  shotId: string
  viewerUnderstanding: string
  englishPrompt: string
  subject: string
  environment: string
  action: string
  camera: string
  movement: string
  lighting: string
  mood: string
  material: string
  colorDirection: string
  continuityRules: string[]
  negativeConstraints: string[]
  generationMode: string
  durationSeconds: number
  aspectRatio: FilmFormat
  startFrame: number
  endFrame: number
  ingredientAssetIds: string[]
  variants: string[]
  priority: "low" | "medium" | "high"
  fallback: string
  proofIds: string[]
  approvalState: ApprovalState
  resultAssetIds: string[]
  provenance: string
}

export interface VidIqConceptPacket {
  id: string
  projectId: ProjectId
  title: string
  hook: string
  searchAngle: string
  keywordIdeas: string[]
  tags: string[]
  titleOptions: string[]
  thumbnailNotes: string[]
  proofIds: string[]
  approvalState: ApprovalState
}

export interface GoogleVidsAssemblyPacket {
  id: string
  projectId: ProjectId
  title: string
  scenes: string[]
  shotOrder: string[]
  narrationAssetIds: string[]
  musicAssetIds: string[]
  subtitleAssetIds: string[]
  notes: string[]
}

export interface MusicGenerationPacket {
  id: string
  projectId: ProjectId
  mood: string
  tempo: string
  durationSeconds: number
  instruments: string[]
  structure: string[]
  negativeConstraints: string[]
  approvalState: ApprovalState
}

export interface GenerationBudget {
  currency: string
  provider: string
  cost: "user-entered" | "provider-configured" | "unknown"
  credits: "user-entered" | "provider-configured" | "unknown"
  limit: "user-entered" | "provider-configured" | "unknown"
  notes: string[]
}

export interface TimelineClip {
  id: string
  trackId: string
  shotId?: string
  assetId?: string
  start: number
  duration: number
  label: string
  timingStatus: TimingStatus
  overlap: "allowed" | "disallowed" | "unknown"
}

export interface TimelineTrack {
  id: string
  label: string
  kind: TimelineTrackKind
  clips: TimelineClip[]
}

export interface FilmTimeline {
  id: string
  projectId: ProjectId
  tracks: TimelineTrack[]
  durationSeconds: number
  timingStatus: TimingStatus
}

export interface RemotionReadyConfig {
  projectId: ProjectId
  durationSeconds: number
  fps: number
  width: number
  height: number
  tracks: TimelineTrack[]
  timingStatus: TimingStatus
}

export interface FilmQaCheck {
  id: string
  label: string
  passed: boolean
  severity: QaSeverity
  notes: string
}

export interface FilmQaReport {
  id: string
  projectId: ProjectId
  checks: FilmQaCheck[]
  summary: string
  readinessScore: number
}

export interface FilmIntegrityReport {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface FilmApprovalGate {
  id: string
  label: string
  status: ApprovalState
  notes: string
}

export interface FilmWorkspaceSnapshot {
  activeProjectId: ProjectId
  activeSection: string
  activeSceneId: string | null
  activeShotId: string | null
  activeAssetId: string | null
  activeNarrationSegmentId: string | null
  inspectorVisible: boolean
  timelineVisible: boolean
  providerPanelVisible: boolean
  exportPanelVisible: boolean
  qaVisible: boolean
}

export interface FilmProject {
  id: ProjectId
  title: string
  brief: FilmBrief
  narrative: NarrativeArchitecture
  scenes: FilmScene[]
  shots: FilmShot[]
  captureQueue: CaptureQueueItem[]
  assets: FilmAsset[]
  voiceDirection: FilmVoiceDirection
  voiceCandidates: VoiceCandidate[]
  voiceDecision: VoiceDecision
  narrationSegments: NarrationSegment[]
  dialogueSegments: DialogueSegment[]
  pronunciationDictionary: PronunciationDictionary
  subtitleTracks: SubtitleTrack[]
  flowPackets: FlowGenerationPacket[]
  vidiqPackets: VidIqConceptPacket[]
  googleVidsPacket: GoogleVidsAssemblyPacket
  musicPackets: MusicGenerationPacket[]
  generationBudget: GenerationBudget
  timeline: FilmTimeline
  remotion: RemotionReadyConfig
  qaReport: FilmQaReport
  approvalGates: FilmApprovalGate[]
}

export interface FilmKitContextState {
  activeProjectId: ProjectId
  activeFilm: FilmProject | null
  activeSection: string
  activeSceneId: string | null
  activeShotId: string | null
  activeAssetId: string | null
  activeNarrationSegmentId: string | null
  inspectorVisible: boolean
  timelineVisible: boolean
  providerPanelVisible: boolean
  exportPanelVisible: boolean
  qaVisible: boolean
  validationReport: FilmIntegrityReport | null
  qaReport: FilmQaReport | null
  approvalGates: FilmApprovalGate[]
  generationBudget: GenerationBudget | null
}

export interface FilmKitContextValue {
  state: FilmKitContextState
  actions: {
    setProject: (projectId: string) => void
    setSection: (section: string) => void
    setScene: (sceneId: string | null) => void
    setShot: (shotId: string | null) => void
    setAsset: (assetId: string | null) => void
    setNarrationSegment: (segmentId: string | null) => void
    toggleInspector: () => void
    toggleTimeline: () => void
    toggleProviderPanel: () => void
    toggleExportPanel: () => void
    toggleQa: () => void
    resetWorkspace: () => void
    approveGate: (gateId: string) => void
    copyPacket: (packetId: string) => Promise<void>
    copyCurrentConfig: () => Promise<void>
  }
}

export interface FilmKitAi33Packet {
  title: string
  summary: string
  audience: string
  aspectRatio: FilmFormat
  deliveryMode: string
  project: {
    id: string
    title: string
    memoryHook: string
    heroDemoMoment: string
    primaryClaim: string
  }
  shots: Array<{
    id: string
    order: number
    label: string
    purpose: string
    overlay: string
    voiceover: string
    proofShown: string
  }>
  exports: Array<{ id: string; label: string; description: string; content: string }>
  limitations: string[]
}

export interface FilmProjectSource {
  project: ProjectBrain
  brief: FilmBrief
  narrative: NarrativeArchitecture
  scenes: FilmScene[]
  shots: FilmShot[]
  captureQueue: CaptureQueueItem[]
  assets: FilmAsset[]
  voiceDirection: FilmVoiceDirection
  voiceCandidates: VoiceCandidate[]
  voiceDecision: VoiceDecision
  narrationSegments: NarrationSegment[]
  dialogueSegments: DialogueSegment[]
  pronunciationDictionary: PronunciationDictionary
  subtitleTracks: SubtitleTrack[]
  flowPackets: FlowGenerationPacket[]
  vidiqPackets: VidIqConceptPacket[]
  googleVidsPacket: GoogleVidsAssemblyPacket
  musicPackets: MusicGenerationPacket[]
  generationBudget: GenerationBudget
  timeline: FilmTimeline
  remotion: RemotionReadyConfig
  qaReport: FilmQaReport
  approvalGates: FilmApprovalGate[]
}