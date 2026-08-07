"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { EpisodeStateCard } from "@/components/workflow/episode-state-card"
import {
  episodeStateSnapshotToCardProps,
} from "@/lib/adapters/episode-state-card-adapter"
import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"
import { getEpisodeState } from "@/lib/youtube/get-episode-state"

interface PageProps {
  params: { episodeId: string }
}

export default function EpisodeDetailPage({ params }: PageProps) {
  const [cardProps, setCardProps] = useState<EpisodeStateCardProps | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getEpisodeState(params.episodeId).then((snapshot) => {
      if (!snapshot) {
        setError(true)
        return
      }
      setCardProps(episodeStateSnapshotToCardProps(snapshot))
    })
  }, [params.episodeId])

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Episode not found
            </h1>
            <p className="mt-2 text-neutral-600">
              Episode {params.episodeId} could not be loaded.
            </p>
          </div>
          <Link
            href="/youtube"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Back to episodes
          </Link>
        </div>
      </div>
    )
  }

  if (!cardProps) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-lg border border-neutral-200 bg-neutral-50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            YouTube OS
          </h1>
          {cardProps.variant !== "unavailable" && (
            <>
              {cardProps.episodeNumber && (
                <p className="text-sm font-medium text-neutral-500">
                  Episode {cardProps.episodeNumber}
                </p>
              )}
              {cardProps.channelName && (
                <p className="mt-1 text-lg text-neutral-600">
                  {cardProps.channelName}
                </p>
              )}
            </>
          )}
        </div>
        <Link
          href="/youtube"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          ← Back
        </Link>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-8">
        <div className="flex justify-center">
          <EpisodeStateCard {...cardProps} className="shadow-sm" />
        </div>
      </section>

      {cardProps.variant !== "unavailable" && "workflowState" in cardProps && (
        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-semibold text-neutral-900">Operational context</h3>
          <dl className="mt-4 space-y-3 text-sm">
            {cardProps.workflowState && (
              <div>
                <dt className="font-medium text-neutral-700">
                  Workflow state
                </dt>
                <dd className="mt-1 font-mono text-neutral-600">
                  {cardProps.workflowStateLabel || cardProps.workflowState}
                </dd>
              </div>
            )}
            {cardProps.nextAuthorizedAction && (
              <div>
                <dt className="font-medium text-neutral-700">
                  Next action
                </dt>
                <dd className="mt-1 text-neutral-600">
                  {cardProps.nextAuthorizedAction}
                </dd>
              </div>
            )}
            {cardProps.manifestVersion && (
              <div>
                <dt className="font-medium text-neutral-700">
                  Source version
                </dt>
                <dd className="mt-1 font-mono text-neutral-600">
                  {cardProps.manifestVersion}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          <strong>Development notice:</strong> This surface consumes fixture-backed
          episode state. The adapter and component are production-ready; state
          source is development-only.
        </p>
      </section>
    </div>
  )
}
