"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export type EpisodeStateCardVariant = "default" | "blocked" | "human-review-required" | "approved" | "published" | "unavailable"
export type HumanReviewStatus = "not-required" | "required" | "completed" | "unavailable"

export interface EpisodeStateDecision {
  label: string
  outcome?: "pass" | "pass-with-conditions" | "rework" | "stop"
  decidedAt?: string
  decidedBy?: string
}

export interface EpisodeStateBlocker {
  id: string
  label: string
  severity: "info" | "warning" | "critical"
}

export interface EpisodeStateCardProps {
  channelName: string
  episodeId: string
  episodeNumber?: number | null
  title: string
  workflowState: string
  workflowStateLabel?: string
  variant: EpisodeStateCardVariant
  lastDecision?: EpisodeStateDecision | null
  blockers?: EpisodeStateBlocker[]
  nextExpectedState?: string | null
  nextAuthorizedAction?: string | null
  humanReviewStatus: HumanReviewStatus
  canonicalSource?: string
  manifestVersion?: string
  updatedAt?: string
  unavailableReason?: string
  youtubeVideoId?: string
  publishedAt?: string
  reduceMotion?: boolean
  className?: string
}

export const EpisodeStateCard = React.forwardRef<HTMLDivElement, EpisodeStateCardProps>(({channelName, episodeId, episodeNumber, title, workflowState, workflowStateLabel, variant, lastDecision, blockers = [], nextExpectedState, nextAuthorizedAction, humanReviewStatus, canonicalSource, manifestVersion, updatedAt, unavailableReason, youtubeVideoId, publishedAt, reduceMotion, className}, ref) => {
  if (variant === "unavailable") {
    return <div ref={ref} className={cn("w-full max-w-2xl rounded-lg border p-8 bg-neutral-50", className)} role="status"><h2 className="text-2xl font-bold text-neutral-900">UNAVAILABLE</h2><p className="mt-4 text-neutral-700">The canonical episode manifest could not be loaded.</p><p className="mt-2 text-sm text-neutral-600">No workflow action is authorized until the source is restored.</p>{unavailableReason && <p className="mt-2 text-xs italic text-neutral-500">Technical details: {unavailableReason}</p>}</div>
  }

  return <div ref={ref} className={cn("w-full max-w-2xl rounded-lg border p-8", className)} role="region" aria-labelledby={`state-${episodeId}`}><p className="text-xs font-semibold text-neutral-600 uppercase">{channelName}</p><h2 id={`state-${episodeId}`} className="text-2xl font-bold mt-2 text-neutral-900">Episode {episodeNumber}</h2>{title && <p className="mt-1 text-neutral-700">{title}</p>}<h3 className="text-xl font-bold mt-8 text-neutral-900">{workflowStateLabel || variant.toUpperCase().replace(/-/g, " ")}</h3>{lastDecision && <div className="mt-6 border-t pt-4"><p className="text-sm font-semibold">Last validated decision</p><p className="mt-1 text-neutral-900">{lastDecision.label}</p>{lastDecision.outcome && <p className="text-xs text-neutral-600 mt-1">Outcome: {lastDecision.outcome.toUpperCase().replace(/-/g, " ")}</p>}</div>}{blockers && blockers.length > 0 && <div className="mt-6 border-t pt-4"><p className="text-sm font-semibold mb-3">Blocking issues</p><ul className="space-y-2">{blockers.map(b => <li key={b.id} className="text-sm text-neutral-900">{b.label}</li>)}</ul></div>}{humanReviewStatus === "required" && <div className="mt-6 border-t pt-4"><p className="text-base font-semibold text-violet-900">Human review is required before proceeding.</p></div>}{nextAuthorizedAction && <div className="mt-6 border-t pt-4"><p className="text-sm font-semibold mb-1">Next authorized action</p><p className="text-neutral-900">{nextAuthorizedAction}</p></div>}{nextExpectedState && <div className="mt-6 border-t pt-4"><p className="text-sm font-semibold mb-1">Next expected state</p><p className="text-neutral-900">{nextExpectedState}</p></div>}{youtubeVideoId && <div className="mt-6 border-t pt-4"><p className="text-sm font-semibold mb-1">YouTube ID</p><p className="text-xs font-mono text-neutral-700">{youtubeVideoId}</p></div>}{publishedAt && <div className="mt-6 border-t pt-4"><p className="text-xs font-semibold text-neutral-600">Published</p><p className="text-xs text-neutral-600">{publishedAt}</p></div>}{(canonicalSource || manifestVersion) && <div className="mt-6 border-t pt-4"><p className="text-xs text-neutral-600">{canonicalSource && `Source: ${canonicalSource}`}{manifestVersion && ` | Version: ${manifestVersion}`}</p></div>}{(workflowState || updatedAt || reduceMotion) && null}</div>
})
EpisodeStateCard.displayName = "EpisodeStateCard"
