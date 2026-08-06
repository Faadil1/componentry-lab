import type { DirectorInput, DirectorResult } from "./types"

export function validateDirectorInput(input: DirectorInput): string[] {
  const issues: string[] = []
  if (!input.project) issues.push("project is required")
  if (!input.mode) issues.push("mode is required")
  if (!input.phaseContext) issues.push("phase context is required")
  if (!input.authorityContext) issues.push("authority context is required")
  return issues
}

export function validateDirectorResult(result: DirectorResult): string[] {
  const issues: string[] = []
  if (!result.nextAction) issues.push("exactly one authorized next action is required")
  if (result.sideEffectPayload !== null) issues.push("director result must be side-effect free")
  return issues
}
