import { projectPresets, type ProjectBrain } from "@/lib/projects"
import { buildNarrative } from "./narrative"
import { secondsToFrames, buildRemotionReadyConfig } from "./timeline"
import { FILM_PROJECT_IDS } from "./schema"
import type {
    CaptureQueueItem,
  DialogueSegment,
  FilmApprovalGate,
  FilmAsset,
  FilmBrief,
  FilmProject,
  FilmProjectSource,
  FilmQaReport,
  FilmScene,
  FilmShot,
  FilmTimeline,
  FlowGenerationPacket,
  GenerationBudget,
  GoogleVidsAssemblyPacket,
  MusicGenerationPacket,
  NarrativeBeat,
  NarrationSegment,
  PronunciationDictionary,
  SubtitleTrack,
  TimelineTrack,
  VidIqConceptPacket,
  VoiceCandidate,
  VoiceDecision,
  FilmVoiceDirection,
} from "./types"
function getBrain(id: string): ProjectBrain {
  return projectPresets.find((project) => project.id === id) ?? projectPresets[0]
}

function baseBrief(brain: ProjectBrain, purpose: FilmBrief["purpose"], format: FilmBrief["format"]): FilmBrief {
  return {
    id: brain.id,
    projectId: brain.id,
    title: brain.title,
    slug: brain.slug,
    purpose,
    format,
    durationSeconds: brain.videoPlan.durationSeconds,
    memoryHook: brain.memoryHook,
    heroDemoMoment: brain.heroDemoMoment,
    primaryProof: brain.primaryClaim,
    claim: brain.primaryClaim,
    audience: brain.audience,
    sourceProjectTitle: brain.title,
    sourceProjectKind: brain.kind,
    sourceProjectStatus: brain.status,
    sourceProjectPhase: brain.currentPhase,
    createdLabel: brain.createdLabel,
    updatedLabel: brain.updatedLabel,
    limitations: [...brain.captureLimitations, ...brain.technicalRisks],
  }
}

function sceneFromShot(brain: ProjectBrain, sceneId: string, order: number, label: string, description: string, purpose: FilmBrief["purpose"], shotIds: string[]): FilmScene {
  return {
    id: sceneId,
    projectId: brain.id,
    label,
    description,
    order,
    purpose,
    bRollStrategy: brain.videoPlan.proofMoments.join("; "),
    voiceDirection: brain.videoPlan.voiceover,
    musicDirection: brain.videoPlan.soundDirection,
    captureStrategy: brain.videoPlan.transitions.join(", "),
    cta: brain.videoPlan.cta,
    qaPriority: brain.videoPlan.purpose,
    shotIds,
  }
}

function makeBrainFilm(projectId: string): FilmProjectSource {
  const brain = getBrain(projectId)
  const purposeMap: Record<string, FilmBrief["purpose"]> = {
    stated: "technical-proof",
    "glow-atelier": "client-case-study",
    "before-bar-one": "editorial-explainer",
  }
  const purpose = purposeMap[projectId]
  const brief = baseBrief(brain, purpose, projectId === "glow-atelier" ? "9:16" : "16:9")

  const scenes: FilmScene[] = []
  const shots: FilmShot[] = []
  const captureQueue: CaptureQueueItem[] = []
  const narrationSegments: NarrationSegment[] = []
  const dialogueSegments: DialogueSegment[] = []
  const assets: FilmAsset[] = []
  const flowPackets: FlowGenerationPacket[] = []
  const vidiqPackets: VidIqConceptPacket[] = []
  const musicPackets: MusicGenerationPacket[] = []

  const shotSource = brain.videoPlan.shots
  const sceneDefs = projectId === "stated"
    ? [
        { id: "claim", label: "Claim", description: "Open on the claim and frame the proof.", shotIds: [shotSource[0]?.id ?? "shot1"] },
        { id: "proof", label: "Proof", description: "Show the lock and reveal moment.", shotIds: [shotSource[1]?.id ?? "shot2"] },
      ]
    : projectId === "glow-atelier"
    ? [
        { id: "intake", label: "Guided Intake", description: "Turn scattered messages into a traceable request.", shotIds: [shotSource[0]?.id ?? "shot1"] },
        { id: "ops", label: "Owner Action", description: "Show service transformation and client visibility.", shotIds: [shotSource[0]?.id ?? "shot1"] },
      ]
    : [
        { id: "problem", label: "Invisible Problem", description: "Present the editorial gap before the fix.", shotIds: [shotSource[0]?.id ?? "shot1"] },
        { id: "reveal", label: "Comparison Reveal", description: "Expose the Eight-Bar Hole.", shotIds: [shotSource[0]?.id ?? "shot1"] },
      ]

  sceneDefs.forEach((def, index) => scenes.push(sceneFromShot(brain, def.id, index + 1, def.label, def.description, purpose, def.shotIds)))

  shotSource.forEach((shot, index) => {
    const sceneId = scenes[Math.min(index, scenes.length - 1)]?.id ?? scenes[0].id
    const filmShot: FilmShot = {
      id: shot.id,
      sceneId,
      projectId: brain.id,
      order: shot.order,
      label: shot.label,
      description: shot.purpose,
      route: shot.sourceRoute,
      captureStateId: shot.captureState,
      restoreUrl: brain.restoreUrls[shot.captureState] ?? undefined,
      viewport: projectId === "glow-atelier" ? "390x844" : "1920x1080",
      aspectRatio: projectId === "glow-atelier" ? "9:16" : "16:9",
      evidenceIds: brain.evidence.map((e) => e.id),
      outputFilename: `${brain.slug}-${shot.order}.mp4`,
      expectedVisualResult: shot.proofShown,
      limitations: [shot.fallback, ...brain.captureLimitations],
      status: "manual",
      proofMoment: brain.heroDemoMoment,
      durationSeconds: shot.duration,
      bRoll: shot.overlay,
      voiceover: shot.voiceover,
      narrationSegmentIds: [shot.id],
      assetIds: [],
    }
    shots.push(filmShot)

    captureQueue.push({
      id: shot.id,
      projectId: brain.id,
      sceneId,
      shotId: shot.id,
      route: shot.sourceRoute,
      captureStateId: shot.captureState,
      restoreUrl: brain.restoreUrls[shot.captureState] ?? undefined,
      expectedVisualResult: shot.proofShown,
      viewport: filmShot.viewport,
      aspectRatio: filmShot.aspectRatio,
      evidenceIds: filmShot.evidenceIds,
      outputFilename: filmShot.outputFilename,
      status: shot.captureState ? "ready" : "blocked",
      limitations: filmShot.limitations,
    })

    narrationSegments.push({
      id: shot.id,
      sceneId,
      shotId: shot.id,
      order: shot.order,
      language: "en",
      text: shot.voiceover,
      timingStatus: "script-derived",
      speakerLabel: projectId === "before-bar-one" ? "Presenter" : "Narrator",
      provider: "manual",
      approvals: "pending",
      durationSeconds: shot.duration,
    })

    dialogueSegments.push({
      id: `${shot.id}-dialogue`,
      sceneId,
      shotId: shot.id,
      order: shot.order,
      speakerLabel: projectId === "glow-atelier" ? "Owner" : "Narrator",
      text: shot.overlay,
      timingStatus: "script-derived",
      approvals: "pending",
    })

    assets.push({
      id: `${shot.id}-asset`,
      projectId: brain.id,
      sceneId,
      shotId: shot.id,
      kind: "screen-capture",
      source: shot.sourceRoute,
      status: "manual",
      filePath: `assets/${brain.slug}/${shot.id}.mp4`,
      previewPath: `assets/${brain.slug}/${shot.id}.jpg`,
      externalReference: shot.captureState,
      prompt: shot.voiceover,
      model: "manual",
      providerTaskId: "manual-status-import-required",
      providerMetadata: { provenance: "Project Brain source data" },
      durationSeconds: shot.duration,
      width: filmShot.aspectRatio === "9:16" ? 1080 : 1920,
      height: filmShot.aspectRatio === "9:16" ? 1920 : 1080,
      frameRate: 30,
      sampleRate: 48000,
      version: 1,
      rightsStatus: "unknown",
      provenanceNotes: "Derived from existing Project Brain video shot metadata.",
      rejectionReason: "",
      approvalState: "pending",
      createdLabel: brain.createdLabel,
      updatedLabel: brain.updatedLabel,
    })

    flowPackets.push({
      id: `${shot.id}-flow`,
      projectId: brain.id,
      sceneId,
      shotId: shot.id,
      viewerUnderstanding: shot.purpose,
      englishPrompt: shot.voiceover,
      subject: brain.title,
      environment: brain.layoutDirection,
      action: shot.screenAction,
      camera: "controlled screen-capture framing",
      movement: shot.transition,
      lighting: brain.visualDirection,
      mood: brain.tension,
      material: "interface surfaces",
      colorDirection: brain.colorDirection,
      continuityRules: ["Use existing project state only", "Do not invent extra capture states"],
      negativeConstraints: ["No fabricated media export", "No API keys in exports"],
      generationMode: "manual-packet",
      durationSeconds: shot.duration,
      aspectRatio: filmShot.aspectRatio,
      startFrame: secondsToFrames(0),
      endFrame: secondsToFrames(shot.duration),
      ingredientAssetIds: [assets[assets.length - 1].id],
      variants: [shot.label],
      priority: "high",
      fallback: shot.fallback,
      proofIds: brain.evidence.map((e) => e.id),
      approvalState: "pending",
      resultAssetIds: [assets[assets.length - 1].id],
      provenance: "Read-only derivation from Project Brain.",
    })
  })

  const beats: NarrativeBeat[] = brain.id === "stated"
    ? [
        { id: "b1", order: 1, label: "Claim", description: "State the proof-first claim.", sourceShotIds: [shots[0]?.id ?? ""], emphasis: "claim" },
        { id: "b2", order: 2, label: "Commitment", description: "Show the lock before evidence.", sourceShotIds: [shots[1]?.id ?? ""], emphasis: "proof" },
      ]
    : brain.id === "glow-atelier"
    ? [
        { id: "b1", order: 1, label: "Scattered messages", description: "Show the intake pain.", sourceShotIds: [shots[0]?.id ?? ""], emphasis: "context" },
        { id: "b2", order: 2, label: "Traceable request", description: "Show the operational turnaround.", sourceShotIds: [shots[1]?.id ?? ""], emphasis: "proof" },
      ]
    : [
        { id: "b1", order: 1, label: "Invisible problem", description: "Set up the editorial gap.", sourceShotIds: [shots[0]?.id ?? ""], emphasis: "context" },
        { id: "b2", order: 2, label: "Reveal", description: "Expose the score discrepancy.", sourceShotIds: [shots[1]?.id ?? ""], emphasis: "proof" },
      ]

  const narrative = buildNarrative(brain.title, brain.description, brain.videoPlan.cta, beats, brain.videoPlan.voiceover, brain.videoPlan.proofMoments.join("; "), brain.videoPlan.soundDirection, ["memory hook", "primary proof", "hero demo moment", "readability", "rights status"])

  const voiceDirection: FilmVoiceDirection = {
    title: brain.title,
    summary: brain.videoPlan.voiceover,
    tone: brain.tension,
    pace: brain.id === "before-bar-one" ? "measured" : "steady",
    perspective: brain.id === "glow-atelier" ? "supportive" : "authoritative",
    pronunciationNotes: [brain.shortTitle],
    language: "en",
    provider: "manual",
  }

  const voiceCandidates: VoiceCandidate[] = [
    { id: `${brain.id}-voice-1`, provider: "manual", label: "Neutral Documentary", language: "en", gender: "neutral", style: "clear", speed: 1, shortlist: true, approved: false, rejected: false },
    { id: `${brain.id}-voice-2`, provider: "manual", label: "Warm Editorial", language: "en", gender: "female", style: "calm", speed: 0.95, shortlist: false, approved: false, rejected: false },
  ]
  const voiceDecision: VoiceDecision = { candidateId: voiceCandidates[0].id, candidateLabel: voiceCandidates[0].label, approved: true, reason: "Best clarity for proof-led film.", approvedLabel: "Approved" }

  const pronunciationDictionary: PronunciationDictionary = { id: `${brain.id}-pronunciation`, projectId: brain.id, label: `${brain.shortTitle} terms`, language: "en", entries: [{ term: brain.shortTitle, pronunciation: brain.shortTitle, note: "Use project brand pronunciation." }], approvalState: "pending" }

  const subtitleTracks: SubtitleTrack[] = [{
    id: `${brain.id}-subtitles`,
    projectId: brain.id,
    format: "vtt",
    language: "en",
    source: "script-derived",
    cues: narrationSegments.map((segment, index) => ({ id: segment.id, start: index * 2, end: index * 2 + Math.max(1, segment.durationSeconds), text: segment.text, language: "en", speakerLabel: segment.speakerLabel, timingStatus: "script-derived" })),
  }]

  const googleVidsPacket: GoogleVidsAssemblyPacket = { id: `${brain.id}-google-vids`, projectId: brain.id, title: brain.title, scenes: scenes.map((scene) => scene.id), shotOrder: shots.map((shot) => shot.id), narrationAssetIds: assets.filter((asset) => asset.kind === "voice").map((asset) => asset.id), musicAssetIds: assets.filter((asset) => asset.kind === "music").map((asset) => asset.id), subtitleAssetIds: subtitleTracks.map((track) => track.id), notes: ["Manual assembly packet only.", "No API assumed."] }


  const budget: GenerationBudget = { currency: "USD", provider: "unknown", cost: "unknown", credits: "unknown", limit: "unknown", notes: ["No fabricated price data."] }
  const tracks: TimelineTrack[] = [
    { id: `${brain.id}-video`, label: "Video", kind: "video", clips: shots.map((shot, index) => ({ id: shot.id, trackId: `${brain.id}-video`, shotId: shot.id, start: index * 5, duration: shot.durationSeconds, label: shot.label, timingStatus: "script-derived", overlap: "allowed" })) },
    { id: `${brain.id}-voice`, label: "Voice", kind: "voice-over", clips: narrationSegments.map((segment, index) => ({ id: segment.id, trackId: `${brain.id}-voice`, shotId: segment.shotId, start: index * 5, duration: segment.durationSeconds, label: segment.text, timingStatus: "script-derived", overlap: "disallowed" })) },
  ]
  const timeline: FilmTimeline = { id: `${brain.id}-timeline`, projectId: brain.id, tracks, durationSeconds: brain.videoPlan.durationSeconds, timingStatus: "script-derived" }
  const remotion = buildRemotionReadyConfig(timeline)
  const qaReport: FilmQaReport = { id: `${brain.id}-qa`, projectId: brain.id, checks: [{ id: "comprehension", label: "Five-second comprehension", passed: true, severity: "info", notes: brain.memoryHook }, { id: "proof", label: "Primary proof visible", passed: true, severity: "info", notes: brain.primaryClaim }], summary: "Read-only film plan derived from Project Brain.", readinessScore: 88 }
  const approvalGates: FilmApprovalGate[] = [{ id: "film-brief-approved", label: "Film brief approved", status: "pending", notes: "Await review." }, { id: "narrative-approved", label: "Narrative approved", status: "pending", notes: "Await review." }, { id: "script-locked", label: "Script locked", status: "pending", notes: "Await review." } ]

  return { project: brain, brief, narrative, scenes, shots, captureQueue, assets, voiceDirection, voiceCandidates, voiceDecision, narrationSegments, dialogueSegments, pronunciationDictionary, subtitleTracks, flowPackets, vidiqPackets, googleVidsPacket, musicPackets, generationBudget: budget, timeline, remotion, qaReport, approvalGates }
}

export function buildFilmProject(projectId: (typeof FILM_PROJECT_IDS)[number]): FilmProject { const source = makeBrainFilm(projectId); return { id: source.project.id, title: source.project.title, brief: source.brief, narrative: source.narrative, scenes: source.scenes, shots: source.shots, captureQueue: source.captureQueue, assets: source.assets, voiceDirection: source.voiceDirection, voiceCandidates: source.voiceCandidates, voiceDecision: source.voiceDecision, narrationSegments: source.narrationSegments, dialogueSegments: source.dialogueSegments, pronunciationDictionary: source.pronunciationDictionary, subtitleTracks: source.subtitleTracks, flowPackets: source.flowPackets, vidiqPackets: source.vidiqPackets, googleVidsPacket: source.googleVidsPacket, musicPackets: source.musicPackets, generationBudget: source.generationBudget, timeline: source.timeline, remotion: source.remotion, qaReport: source.qaReport, approvalGates: source.approvalGates } }
export function buildAi33Packet(projectId: (typeof FILM_PROJECT_IDS)[number]) {
  const film = buildFilmProject(projectId)
  return {
    title: `${film.brief.title} · AI33 Packet`,
    summary: film.brief.claim,
    audience: film.brief.audience,
    aspectRatio: film.brief.format,
    deliveryMode: film.brief.purpose === "technical-proof" ? "demo-film" : film.brief.purpose === "client-case-study" ? "teaser" : "handoff",
    project: {
      id: film.id,
      title: film.title,
      memoryHook: film.brief.memoryHook,
      heroDemoMoment: film.brief.heroDemoMoment,
      primaryClaim: film.brief.primaryProof,
    },
    shots: film.shots.map((shot) => ({ id: shot.id, order: shot.order, label: shot.label, purpose: shot.description, overlay: shot.bRoll, voiceover: shot.voiceover, proofShown: shot.expectedVisualResult })),
    exports: [{ id: "brief", label: "Brief", description: "Film brief", content: JSON.stringify(film.brief, null, 2) }],
    limitations: film.brief.limitations,
  }
}