"use client"
import React from "react"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion"
/* eslint-enable @typescript-eslint/no-unused-vars */
import { AlertTriangle, CheckCircle2, AlertCircle, Ban, CheckSquare, Play, HelpCircle } from "lucide-react"
/* eslint-enable @typescript-eslint/no-unused-vars */
import { cn } from "@/lib/utils"
/* eslint-enable @typescript-eslint/no-unused-vars */

export type EpisodeStateCardVariant = "default" | "blocked" | "human-review-required" | "approved" | "published" | "unavailable"
export type HumanReviewStatus = "not-required" | "required" | "completed" | "unavailable"

export interface EpisodeStateDecision { label: string; outcome?: string; decidedAt?: string }
export interface EpisodeStateBlocker { id: string; label: string; severity: string }

export interface EpisodeStateCardProps {
  channelName: string
  episodeId: string
  episodeNumber?: number | null
  title: string
  workflowState: string
  variant: EpisodeStateCardVariant
  humanReviewStatus: HumanReviewStatus
  blockers?: EpisodeStateBlocker[]
  className?: string
}

export const EpisodeStateCard = React.forwardRef<HTMLDivElement, EpisodeStateCardProps>(({
  channelName, episodeNumber, title, variant, className
}, ref) => {
  return (
    <motion.div ref={ref} className={cn("w-full max-w-2xl border-l-4 rounded-lg p-6", className)} role="region">
      <p className="text-xs font-medium uppercase text-neutral-600">{channelName}</p>
      <h2 className="text-lg font-semibold mt-1">Episode {episodeNumber}{title && ` - ${title}`}</h2>
      <p className="mt-4 font-semibold text-neutral-900">{variant.toUpperCase()}</p>
    </motion.div>
  )
})

EpisodeStateCard.displayName = "EpisodeStateCard"
