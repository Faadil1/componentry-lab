import type { CreativeProjectMode } from "../director/types"
import type { TraceDesignConcern, TraceDesignSurface } from "../creative-os/trace-design-studio"

export type TraceRuntimeTargetKind = "SKILL" | "AGENT"
export type TraceRuntimeAuthority = "SUGGEST" | "PREPARE" | "LOCAL_REVERSIBLE" | "EXPLICIT_EXTERNAL"
export type TraceRuntimeStatus = "RUNNING" | "SUCCEEDED" | "FAILED"
export type TraceRuntimeActionStatus = "PREPARED" | "EXECUTED" | "REVERTED" | "BLOCKED" | "FAILED"

export interface TraceRuntimeTargetDefinition {
  id: string
  kind: TraceRuntimeTargetKind
  label: string
  description: string
  authority: TraceRuntimeAuthority
  delegatesTo?: string
}

export interface TraceRuntimeInput {
  projectId?: string
  targetKind: TraceRuntimeTargetKind
  targetId: string
  mode: CreativeProjectMode
  surface: TraceDesignSurface
  concerns: TraceDesignConcern[]
  instruction?: string
}

export interface TraceRuntimeArtifactDraft {
  kind: "BRIEF" | "ROUTE" | "CHECKLIST" | "PATCH" | "EVIDENCE" | "REPORT"
  title: string
  summary: string
  payload: Record<string, unknown>
}

export interface TraceRuntimeActionDraft {
  type: "PROJECT_BRAIN_PATCH" | "GITHUB_EVIDENCE_BRANCH"
  title: string
  description: string
  authority: "LOCAL_REVERSIBLE" | "EXPLICIT_EXTERNAL"
  reversible: boolean
  payload: Record<string, unknown>
}

export interface TraceRuntimeArtifact extends TraceRuntimeArtifactDraft {
  artifactId: string
  runId: string
  createdAt: string
}

export interface TraceRuntimeAction extends TraceRuntimeActionDraft {
  actionId: string
  runId: string
  status: TraceRuntimeActionStatus
  result?: Record<string, unknown>
  createdAt: string
  executedAt?: string
}

export interface TraceRuntimeRun {
  runId: string
  projectId?: string
  targetKind: TraceRuntimeTargetKind
  targetId: string
  authorityUsed: TraceRuntimeAuthority
  status: TraceRuntimeStatus
  summary: string
  findings: string[]
  evidence: string[]
  input: TraceRuntimeInput
  artifacts: TraceRuntimeArtifact[]
  actions: TraceRuntimeAction[]
  error?: string
  createdAt: string
  completedAt?: string
}

export interface TraceRuntimeExecutionDraft {
  authorityUsed: TraceRuntimeAuthority
  summary: string
  findings: string[]
  evidence: string[]
  artifacts: TraceRuntimeArtifactDraft[]
  actions: TraceRuntimeActionDraft[]
}

export interface TraceRuntimeRunListItem {
  runId: string
  projectId?: string
  targetKind: TraceRuntimeTargetKind
  targetId: string
  authorityUsed: TraceRuntimeAuthority
  status: TraceRuntimeStatus
  summary: string
  createdAt: string
  completedAt?: string
}
