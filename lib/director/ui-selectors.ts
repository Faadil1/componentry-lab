import { directorFixtures } from "./fixtures"
import { adaptDirectorResult, adaptProjectBrainToDirectorInput } from "./adapters"
import type {
  AuthorityLevel,
  CreativeProjectMode,
  DirectorFixture,
  DirectorInput,
  DirectorResult,
  GateStatus,
} from "./types"

export interface DirectorUIProjection {
  fixtureKey: string
  fixture: DirectorFixture
  input: DirectorInput
  result: DirectorResult
}

export function getDirectorFixtureKeys(): string[] {
  return Object.keys(directorFixtures)
}

export function getDirectorProjection(fixtureKey: string): DirectorUIProjection {
  const fixture = directorFixtures[fixtureKey] ?? directorFixtures["the-second-absence"]
  const input = adaptProjectBrainToDirectorInput(
    fixture.project,
    fixture.mode,
    fixture.phaseContext,
    fixture.authorityContext,
    fixture.evaluationTimestamp
  )

  const result = adaptDirectorResult({
    ...input,
    availableSkills: fixture.availableSkills,
    lockedDecisions: fixture.lockedDecisions,
    learningProposals: fixture.learningProposals,
  })

  return {
    fixtureKey,
    fixture,
    input,
    result,
  }
}

export function getAllDirectorProjections(): Record<string, DirectorUIProjection> {
  const keys = getDirectorFixtureKeys()
  const projections: Record<string, DirectorUIProjection> = {}
  for (const key of keys) {
    projections[key] = getDirectorProjection(key)
  }
  return projections
}

export interface ModeTheme {
  mode: CreativeProjectMode
  label: string
  tagline: string
  badgeBg: string
  badgeText: string
  borderAccent: string
  gradientHeader: string
  iconBg: string
}

export function getModeVisualTheme(mode: CreativeProjectMode): ModeTheme {
  switch (mode) {
    case "DAY_CHALLENGE":
      return {
        mode: "DAY_CHALLENGE",
        label: "Day Challenge",
        tagline: "Rapid single-day sprint focus and timeboxed execution",
        badgeBg: "bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/50",
        badgeText: "text-amber-900 dark:text-amber-200",
        borderAccent: "border-amber-500",
        gradientHeader: "from-amber-500/10 via-orange-500/5 to-transparent",
        iconBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
      }
    case "HACKATHON":
      return {
        mode: "HACKATHON",
        label: "Hackathon",
        tagline: "Competitive submission, live pitch proof, and judge scoring",
        badgeBg: "bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50",
        badgeText: "text-emerald-900 dark:text-emerald-200",
        borderAccent: "border-emerald-500",
        gradientHeader: "from-emerald-500/10 via-teal-500/5 to-transparent",
        iconBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      }
    case "MARA":
      return {
        mode: "MARA",
        label: "MARA Episode",
        tagline: "Long-form narrative, episodic continuity, and audience retention",
        badgeBg: "bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-700/50",
        badgeText: "text-purple-900 dark:text-purple-200",
        borderAccent: "border-purple-500",
        gradientHeader: "from-purple-500/10 via-violet-500/5 to-transparent",
        iconBg: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      }
    case "DATA_STORY":
      return {
        mode: "DATA_STORY",
        label: "Data Story",
        tagline: "Analytical proof, executive metrics, and verifiable evidence",
        badgeBg: "bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700/50",
        badgeText: "text-sky-900 dark:text-sky-200",
        borderAccent: "border-sky-500",
        gradientHeader: "from-sky-500/10 via-blue-500/5 to-transparent",
        iconBg: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
      }
  }
}

export function getGateStatusConfig(status: GateStatus): {
  label: string
  badgeClass: string
  dotClass: string
} {
  switch (status) {
    case "pass":
      return {
        label: "Passed",
        badgeClass: "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        dotClass: "bg-emerald-500",
      }
    case "conditional":
      return {
        label: "Conditional Pass",
        badgeClass: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
        dotClass: "bg-amber-500",
      }
    case "blocked":
      return {
        label: "Blocked",
        badgeClass: "bg-red-50 border-red-300 text-red-800 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
        dotClass: "bg-red-500",
      }
    case "fail":
      return {
        label: "Failed",
        badgeClass: "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
        dotClass: "bg-rose-600",
      }
    default:
      return {
        label: "Under Review",
        badgeClass: "bg-stone-100 border-stone-300 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
        dotClass: "bg-stone-400",
      }
  }
}

export function getAuthorityLevelConfig(level: AuthorityLevel): {
  label: string
  description: string
  badgeClass: string
  isExecutable: boolean
} {
  switch (level) {
    case "suggest":
      return {
        label: "Suggestion",
        description: "Advisory analysis only. Requires explicit review before action.",
        badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
        isExecutable: false,
      }
    case "prepare":
      return {
        label: "Preparation",
        description: "Drafting or staging artifact. Requires human approval before submission.",
        badgeClass: "bg-blue-50 text-blue-800 border-blue-300",
        isExecutable: false,
      }
    case "local-reversible-execution":
      return {
        label: "Local Reversible Action",
        description: "Internal analysis or local transformation. Fully reversible.",
        badgeClass: "bg-teal-50 text-teal-800 border-teal-300",
        isExecutable: false,
      }
    case "prepare-external-action":
      return {
        label: "Prepare External Action",
        description: "Prepares external payload. Requires explicit human signature.",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
        isExecutable: false,
      }
    case "authorized-reversible-external-action":
      return {
        label: "Authorized Reversible External Action",
        description: "External action with active safety window and automatic rollback.",
        badgeClass: "bg-violet-50 text-violet-800 border-violet-300",
        isExecutable: false,
      }
    case "prohibited":
    default:
      return {
        label: "Prohibited Action",
        description: "Action exceeds current authority boundaries and is strictly forbidden.",
        badgeClass: "bg-rose-100 text-rose-900 border-rose-300",
        isExecutable: false,
      }
  }
}
