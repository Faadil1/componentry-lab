"use client"
import * as React from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Ban,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  AlertOctagon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type EpisodeStateCardVariant =
  | "default"
  | "blocked"
  | "human-review-required"
  | "approved"
  | "published"
  | "unavailable"

export type HumanReviewStatus =
  | "not-required"
  | "required"
  | "completed"
  | "unavailable"

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

function getVariantStyles(variant: EpisodeStateCardVariant): string {
  const base = "rounded-lg overflow-hidden border"
  const styles: Record<string, string> = {
    blocked: "border-amber-300 bg-amber-50",
    "human-review-required": "border-violet-300 bg-violet-50",
    approved: "border-emerald-300 bg-emerald-50",
    published: "border-cyan-300 bg-cyan-50",
    unavailable: "border-neutral-300 bg-neutral-100",
    default: "border-slate-300 bg-slate-50",
  }
  return cn(base, styles[variant] || styles.default)
}

function getAccentBg(variant: EpisodeStateCardVariant): string {
  const colors: Record<string, string> = {
    blocked: "bg-amber-200",
    "human-review-required": "bg-violet-200",
    approved: "bg-emerald-200",
    published: "bg-cyan-200",
    unavailable: "bg-neutral-200",
    default: "bg-slate-200",
  }
  return colors[variant] || colors.default
}

function getStateIcon(variant: EpisodeStateCardVariant): React.ReactNode {
  const size = 20
  const iconProps = { size, className: "flex-shrink-0" }
  switch (variant) {
    case "blocked":
      return <Ban {...iconProps} className="text-amber-700" />
    case "human-review-required":
      return <HelpCircle {...iconProps} className="text-violet-700" />
    case "approved":
      return <CheckSquare {...iconProps} className="text-emerald-700" />
    case "published":
      return <CheckCircle2 {...iconProps} className="text-cyan-700" />
    case "unavailable":
      return <AlertOctagon {...iconProps} className="text-neutral-700" />
    default:
      return <AlertCircle {...iconProps} className="text-slate-700" />
  }
}

function getStateLabel(variant: EpisodeStateCardVariant): string {
  const labels: Record<string, string> = {
    blocked: "BLOCKED",
    "human-review-required": "HUMAN REVIEW REQUIRED",
    approved: "APPROVED",
    published: "PUBLISHED",
    unavailable: "EPISODE STATE UNAVAILABLE",
    default: "IN PROGRESS",
  }
  return labels[variant] || labels.default
}

function getSeverityIcon(severity: "info" | "warning" | "critical"): React.ReactNode {
  const iconProps = { size: 14, className: "flex-shrink-0" }
  switch (severity) {
    case "critical":
      return <AlertTriangle {...iconProps} className="text-red-600" />
    case "warning":
      return <AlertCircle {...iconProps} className="text-amber-600" />
    default:
      return <AlertCircle {...iconProps} className="text-blue-600" />
  }
}

export const EpisodeStateCard = React.forwardRef<
  HTMLDivElement,
  EpisodeStateCardProps
>(
  (
    {
      channelName,
      episodeId,
      episodeNumber,
      title,
      workflowState,
      workflowStateLabel,
      variant,
      lastDecision,
      blockers = [],
      nextExpectedState,
      nextAuthorizedAction,
      humanReviewStatus,
      canonicalSource,
      manifestVersion,
      updatedAt,
      unavailableReason,
      youtubeVideoId,
      publishedAt,
      reduceMotion = false,
      className,
    },
    ref
  ) => {
    const shouldReduceMotion =
      reduceMotion ||
      (typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false)

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: shouldReduceMotion ? 0.15 : 0.3,
          staggerChildren: shouldReduceMotion ? 0 : 0.05,
        },
      },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: shouldReduceMotion ? 0.1 : 0.24 },
      },
    }

    if (variant === "unavailable") {
      return (
        <motion.div
          ref={ref}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={cn("w-full max-w-2xl p-8", getVariantStyles(variant), className)}
          role="status"
          aria-label="Episode state unavailable"
        >
          <div className={cn("h-1 mb-6", getAccentBg(variant))} />
          <motion.div variants={itemVariants} className="flex gap-3 mb-6">
            {getStateIcon(variant)}
            <h2 className="text-2xl font-bold text-neutral-900">
              {getStateLabel(variant)}
            </h2>
          </motion.div>
          <motion.p variants={itemVariants} className="text-neutral-700 mb-4">
            The canonical episode manifest could not be loaded.
          </motion.p>
          <motion.p variants={itemVariants} className="text-neutral-600 text-sm">
            No workflow action is authorized until the source is restored.
          </motion.p>
          {unavailableReason && (
            <motion.p variants={itemVariants} className="text-neutral-500 text-xs mt-4 italic">
              Technical details: {unavailableReason}
            </motion.p>
          )}
        </motion.div>
      )
    }

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={cn("w-full max-w-2xl p-8", getVariantStyles(variant), className)}
        role="region"
        aria-labelledby={`state-card-${episodeId}`}
      >
        <div className={cn("h-1 mb-6", getAccentBg(variant))} />

        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            {channelName}
          </p>
          <h2
            id={`state-card-${episodeId}`}
            className="text-2xl font-bold text-neutral-900 mt-2"
          >
            Episode {episodeNumber}
          </h2>
          {title && <p className="text-base text-neutral-700 mt-1">{title}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 flex items-start gap-4">
          {getStateIcon(variant)}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-neutral-900">
              {workflowStateLabel || getStateLabel(variant)}
            </h3>
            {workflowState && workflowState !== workflowStateLabel && (
              <p className="text-xs text-neutral-600 mt-2">
                Technical state:{" "}
                <code className="bg-neutral-200 px-2 py-1 rounded text-xs font-mono">
                  {workflowState}
                </code>
              </p>
            )}
          </div>
        </motion.div>

        {lastDecision && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-200/50 pt-6"
          >
            <p className="text-xs font-semibold text-neutral-500 tracking-wide mb-2">
              Last validated decision
            </p>
            <p className="text-base text-neutral-900 font-medium">
              {lastDecision.label}
            </p>
            {lastDecision.outcome && (
              <p className="text-xs text-neutral-600 mt-2">
                Outcome:{" "}
                <span className="font-semibold text-neutral-900">
                  {lastDecision.outcome.toUpperCase().replace(/-/g, " ")}
                </span>
              </p>
            )}
          </motion.div>
        )}

        {blockers && blockers.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-200/50 pt-6"
          >
            <p className="text-xs font-semibold text-neutral-500 tracking-wide mb-4">
              Blocking issues
            </p>
            <div className="space-y-3">
              {blockers.map((blocker) => (
                <div key={blocker.id} className="flex gap-3">
                  {getSeverityIcon(blocker.severity)}
                  <span className="text-base text-neutral-900">{blocker.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {humanReviewStatus === "required" && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-300 pt-6"
          >
            <div className="flex items-start gap-3">
              <HelpCircle size={16} className="text-violet-700 flex-shrink-0 mt-1" />
              <p className="text-base font-semibold text-violet-900">
                Human review is required before proceeding.
              </p>
            </div>
          </motion.div>
        )}

        {nextAuthorizedAction && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-200/50 pt-6"
          >
            <p className="text-xs font-semibold text-neutral-500 tracking-wide mb-2">
              Next authorized action
            </p>
            <div className="flex items-start gap-3">
              <ArrowRight size={16} className="text-neutral-600 flex-shrink-0 mt-0.5" />
              <p className="text-base text-neutral-900">{nextAuthorizedAction}</p>
            </div>
          </motion.div>
        )}

        {nextExpectedState && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-200/50 pt-6"
          >
            <p className="text-xs font-semibold text-neutral-500 tracking-wide mb-2">
              Next expected state
            </p>
            <p className="text-base font-medium text-neutral-900">
              {nextExpectedState}
            </p>
          </motion.div>
        )}

        {youtubeVideoId && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-200/50 pt-6"
          >
            <p className="text-xs font-semibold text-neutral-500 tracking-wide mb-2">
              YouTube
            </p>
            <p className="text-sm text-neutral-900">
              Video ID:{" "}
              <code className="bg-neutral-200 px-2 py-1 rounded text-xs font-mono">
                {youtubeVideoId}
              </code>
            </p>
          </motion.div>
        )}

        {publishedAt && (
          <motion.div
            variants={itemVariants}
            className="mb-6 border-t border-neutral-200/50 pt-6"
          >
            <p className="text-xs font-semibold text-neutral-500 tracking-wide mb-2">
              Published
            </p>
            <p className="text-xs text-neutral-600">{publishedAt}</p>
          </motion.div>
        )}

        {(canonicalSource || manifestVersion || workflowState) && (
          <motion.div
            variants={itemVariants}
            className="border-t border-neutral-200/50 pt-6 space-y-1.5 text-xs text-neutral-500"
          >
            {canonicalSource && (
              <p>
                <span className="text-neutral-600 font-medium">Canonical source</span>
                {" "}· {canonicalSource}
              </p>
            )}
            {manifestVersion && (
              <p>
                <span className="text-neutral-600 font-medium">Version</span>
                {" "}· {manifestVersion}
              </p>
            )}
            {workflowState && (
              <p>
                <span className="text-neutral-600 font-medium">State ID</span>
                {" "}· <code className="font-mono text-neutral-600">{workflowState}</code>
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    )
  }
)

EpisodeStateCard.displayName = "EpisodeStateCard"
