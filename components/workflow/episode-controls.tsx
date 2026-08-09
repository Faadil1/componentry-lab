"use client"

import { useState } from "react"
import type { EpisodeStateSnapshot } from "@/lib/domain/episode-state"
import { getNextWorkflowStage } from "@/lib/youtube/commands/workflow-policy"
import {
  transitionEpisodeStateAction,
  recordHumanDecisionAction,
  addEpisodeBlockerAction,
  resolveEpisodeBlockerAction,
  recordPublicationAction,
} from "@/app/youtube/actions"

interface EpisodeControlsProps {
  episode: EpisodeStateSnapshot
  onSuccess?: () => void
}

export function EpisodeControls({ episode, onSuccess }: EpisodeControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDecisionForm, setShowDecisionForm] = useState(false)
  const [showBlockerForm, setShowBlockerForm] = useState(false)
  const [showPublicationForm, setShowPublicationForm] = useState(false)

  const stateVersion = parseInt(episode.source?.version as string) || 1

  const handleAdvanceStage = async () => {
    setIsLoading(true)
    setError(null)

    const nextStage = getNextWorkflowStage(episode.workflowState)
    if (!nextStage) {
      setError("No next stage available")
      setIsLoading(false)
      return
    }

    const result = await transitionEpisodeStateAction(
      episode.episodeId,
      stateVersion,
      nextStage
    )

    if (!result.success) {
      if (result.reason === "conflict") {
        setError("Episode changed. Please refresh the page.")
      } else if (result.reason === "invalid_transition") {
        setError("Cannot advance from this stage")
      } else {
        setError(result.message)
      }
    } else {
      setError(null)
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const handleRecordDecision = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    const outcome = formData.get("outcome") as
      | "pass"
      | "pass-with-conditions"
      | "rework"
      | "stop"
    const label = formData.get("label") as string

    const result = await recordHumanDecisionAction(
      episode.episodeId,
      stateVersion,
      outcome,
      label
    )

    if (!result.success) {
      setError(result.message)
    } else {
      setError(null)
      setShowDecisionForm(false)
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const handleAddBlocker = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    const blockerId = formData.get("blockerId") as string
    const label = formData.get("label") as string
    const severity = formData.get("severity") as "low" | "medium" | "high"

    const result = await addEpisodeBlockerAction(
      episode.episodeId,
      stateVersion,
      blockerId,
      label,
      severity
    )

    if (!result.success) {
      setError(result.message)
    } else {
      setError(null)
      setShowBlockerForm(false)
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const handleResolveBlocker = async (blockerId: string) => {
    setIsLoading(true)
    setError(null)

    const result = await resolveEpisodeBlockerAction(
      episode.episodeId,
      stateVersion,
      blockerId
    )

    if (!result.success) {
      setError(result.message)
    } else {
      setError(null)
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const handleRecordPublication = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    const youtubeVideoId = formData.get("youtubeVideoId") as string
    const publishedAt = formData.get("publishedAt") as string

    const result = await recordPublicationAction(
      episode.episodeId,
      stateVersion,
      youtubeVideoId,
      publishedAt
    )

    if (!result.success) {
      setError(result.message)
    } else {
      setError(null)
      setShowPublicationForm(false)
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const nextStage = getNextWorkflowStage(episode.workflowState)
  const unresolvedBlockers = episode.blockers.filter((b) => !b.resolvedAt)

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-neutral-900">Episode Controls</h2>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {/* Advance Stage */}
        {nextStage && (
          <div>
            <button
              onClick={handleAdvanceStage}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Advance to {nextStage}
            </button>
            <p className="mt-2 text-sm text-neutral-600">
              Current: <code className="font-mono">{episode.workflowState}</code>
            </p>
          </div>
        )}

        {/* Record Decision */}
        <div className="border-t border-neutral-200 pt-4">
          {!showDecisionForm ? (
            <button
              onClick={() => setShowDecisionForm(true)}
              disabled={isLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Record Decision
            </button>
          ) : (
            <form action={handleRecordDecision} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Outcome
                </label>
                <select
                  name="outcome"
                  required
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="pass">Pass</option>
                  <option value="pass-with-conditions">Pass with Conditions</option>
                  <option value="rework">Rework</option>
                  <option value="stop">Stop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Label / Notes
                </label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="e.g., Approved for release"
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowDecisionForm(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Blockers */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="mb-3">
            <h3 className="font-medium text-neutral-900">Blockers</h3>
            {unresolvedBlockers.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">No active blockers</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {unresolvedBlockers.map((blocker) => (
                  <li
                    key={blocker.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{blocker.label}</p>
                      <p className="text-xs text-neutral-600">
                        {blocker.severity.toUpperCase()} • {blocker.id}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolveBlocker(blocker.id)}
                      disabled={isLoading}
                      className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!showBlockerForm ? (
            <button
              onClick={() => setShowBlockerForm(true)}
              disabled={isLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Add Blocker
            </button>
          ) : (
            <form action={handleAddBlocker} className="space-y-3 rounded-lg bg-neutral-50 p-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Blocker ID
                </label>
                <input
                  type="text"
                  name="blockerId"
                  required
                  placeholder="e.g., thumbnail-feedback"
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Label
                </label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="e.g., Thumbnail needs redesign"
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Severity
                </label>
                <select
                  name="severity"
                  required
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowBlockerForm(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Record Publication */}
        {episode.workflowState === "FINAL_RENDER" || episode.workflowState === "PUBLISH" ? (
          <div className="border-t border-neutral-200 pt-4">
            {!showPublicationForm ? (
              <button
                onClick={() => setShowPublicationForm(true)}
                disabled={isLoading}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Record Publication
              </button>
            ) : (
              <form action={handleRecordPublication} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    YouTube Video ID
                  </label>
                  <input
                    type="text"
                    name="youtubeVideoId"
                    required
                    placeholder="e.g., dQw4w9WgXcQ"
                    className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-neutral-600">
                    Extract from youtube.com/watch?v=VIDEO_ID
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Published At
                  </label>
                  <input
                    type="datetime-local"
                    name="publishedAt"
                    required
                    className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPublicationForm(false)}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
