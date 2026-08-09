"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEpisodeAction } from "@/app/youtube/actions"
import type { CommandFailureReason } from "@/lib/youtube/commands/command-result"

export function EpisodeIntakeForm() {
  const router = useRouter()
  const [episodeNumber, setEpisodeNumber] = useState<number | "">("")
  const [episodeId, setEpisodeId] = useState("")
  const [channelName, setChannelName] = useState("")
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userEditedId, setUserEditedId] = useState(false)

  // Auto-generate episodeId from episodeNumber if user hasn't manually edited it
  const handleEpisodeNumberChange = (value: string) => {
    const num = value === "" ? "" : parseInt(value, 10)
    setEpisodeNumber(num)

    if (!userEditedId && value !== "") {
      const generated = `episode-${String(num).padStart(3, "0")}`
      setEpisodeId(generated)
    }
  }

  const handleEpisodeIdChange = (value: string) => {
    setEpisodeId(value)
    setUserEditedId(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (episodeNumber === "" || typeof episodeNumber !== "number") {
        setError("Episode number is required")
        setIsLoading(false)
        return
      }

      const result = await createEpisodeAction(
        episodeId,
        episodeNumber,
        channelName,
        title
      )

      if (result.success) {
        router.push(`/youtube/episodes/${result.value!.episodeId}`)
      } else {
        const reason = result.reason as CommandFailureReason
        if (reason === "invalid_input") {
          setError(result.message || "Please check your input and try again")
        } else if (reason === "conflict") {
          setError("Episode ID already exists. Choose a different one.")
        } else if (reason === "infrastructure_error") {
          setError("Unable to create episode. Please try again.")
        } else {
          setError("Something went wrong. Please try again.")
        }
        setIsLoading(false)
      }
    } catch (err) {
      console.error("createEpisodeAction error:", err)
      setError("Unable to create episode. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">
          Episode Number *
        </label>
        <input
          type="number"
          min="1"
          value={episodeNumber}
          onChange={(e) => handleEpisodeNumberChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-md disabled:opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Episode ID *
        </label>
        <input
          type="text"
          value={episodeId}
          onChange={(e) => handleEpisodeIdChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-md disabled:opacity-50"
          required
          placeholder="Auto-generated from episode number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Channel Name *
        </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-md disabled:opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-md disabled:opacity-50"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating..." : "Create Episode"}
      </button>
    </form>
  )
}
