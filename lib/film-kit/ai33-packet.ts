import type { FilmProject } from "./types"

export function buildAi33Packet(project: FilmProject) {
  return {
    title: `${project.brief.title} - AI33 Packet`,
    summary: project.brief.claim,
    audience: project.brief.audience,
    aspectRatio: project.brief.format,
    deliveryMode: project.brief.purpose === "technical-proof" ? "demo-film" : project.brief.purpose === "client-case-study" ? "teaser" : "handoff",
    project: {
      id: project.id,
      title: project.title,
      memoryHook: project.brief.memoryHook,
      heroDemoMoment: project.brief.heroDemoMoment,
      primaryClaim: project.brief.primaryProof,
    },
    shots: project.shots.map((shot) => ({
      id: shot.id,
      order: shot.order,
      label: shot.label,
      purpose: shot.description,
      overlay: shot.bRoll,
      voiceover: shot.voiceover,
      proofShown: shot.expectedVisualResult,
    })),
    exports: [{ id: "brief", label: "Brief", description: "Film brief", content: JSON.stringify(project.brief, null, 2) }],
    limitations: project.brief.limitations,
  }
}
