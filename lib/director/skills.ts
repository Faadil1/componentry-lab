import type { SkillMetadata } from "./types"

export function selectSkillsForMode(
  skills: SkillMetadata[],
  mode: string,
  phase: string,
  authorityRequirement: string
): SkillMetadata[] {
  return skills
    .filter((skill) => skill.status === "available")
    .filter((skill) => skill.supportedModes.includes(mode as never))
    .filter((skill) => skill.supportedPhases.includes(phase as never))
    .filter((skill) => skill.authorityRequirement === authorityRequirement)
    .sort((a, b) => a.skillId.localeCompare(b.skillId))
}
