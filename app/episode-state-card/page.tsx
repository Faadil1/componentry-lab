"use client"

import React, { useState } from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { EpisodeStateCard } from "@/components/workflow/episode-state-card"
import { episode14EditorialDevelopment, episode14Blocked, episode13HumanReview, episode13Approved, episode13Published, episodeUnavailable } from "@/lib/fixtures/episode-state-card-fixtures"

export default function EpisodeStateCardPage() {
  const [variant, setVariant] = useState("default")
  const [reduceMotion, setReduceMotion] = useState(false)

  const fixtures = { default: episode14EditorialDevelopment, blocked: episode14Blocked, "human-review-required": episode13HumanReview, approved: episode13Approved, published: episode13Published, unavailable: episodeUnavailable }
  const current = fixtures[variant as keyof typeof fixtures]

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-slate-100">
      <LabNavigation />
      <section className="border-b px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">Episode State Card</h1>
          <p className="mt-2 text-lg text-neutral-600">Experimental workflow component</p>
          <div className="mt-4 inline-block px-3 py-1 bg-violet-100 text-violet-900 rounded-full text-sm">EXPERIMENTAL</div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 border-b">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold mb-8">Demo Moment</h2>
          <div className="flex justify-center">
            <EpisodeStateCard {...current} reduceMotion={reduceMotion} />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 border-b bg-white/50">
        <div className="mx-auto max-w-6xl">
          <select value={variant} onChange={(e) => setVariant(e.target.value)} className="px-3 py-2 border rounded mr-4">
            <option value="default">Default</option>
            <option value="blocked">Blocked</option>
            <option value="human-review-required">Human Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <button onClick={() => setReduceMotion(!reduceMotion)} className="px-3 py-2 border rounded">
            Motion: {reduceMotion ? "Reduced" : "Normal"}
          </button>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold mb-8">All Variants</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(fixtures).map(([key, data]) => (
              <div key={key} className="border rounded-lg p-6 bg-white">
                <p className="text-sm font-semibold uppercase mb-4">{key}</p>
                <div className="bg-neutral-50 p-4 rounded"><EpisodeStateCard {...data} className="shadow-none" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
