"use client"
import React, { useState } from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import {
  EpisodeStateCard,
  type EpisodeStateCardVariant,
} from "@/components/workflow/episode-state-card"
import {
  episode14EditorialDevelopment,
  episode14Blocked,
  episode13HumanReview,
  episode13Approved,
  episode13Published,
  episodeUnavailable,
} from "@/lib/fixtures/episode-state-card-fixtures"

type VariantType = EpisodeStateCardVariant

const VARIANTS: VariantType[] = [
  "default",
  "blocked",
  "human-review-required",
  "approved",
  "published",
  "unavailable",
]

function isVariant(value: unknown): value is VariantType {
  return typeof value === "string" && VARIANTS.includes(value as VariantType)
}

export default function EpisodeStateCardPage() {
  const [variant, setVariant] = useState<VariantType>("default")
  const [reduced, setReduced] = useState(false)

  const fixtures = {
    default: episode14EditorialDevelopment,
    blocked: episode14Blocked,
    "human-review-required": episode13HumanReview,
    approved: episode13Approved,
    published: episode13Published,
    unavailable: episodeUnavailable,
  }

  const current = fixtures[variant]

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-slate-100">
      <LabNavigation />

      <section className="border-b border-neutral-200 bg-white/50 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Episode State Card
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Read-only workflow component for displaying canonical episode state, decisions, and required actions
          </p>
          <div className="mt-6 flex gap-3">
            <div className="inline-block rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-900">
              EXPERIMENTAL
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white/30 px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-3xl font-bold text-neutral-900">Hero Demo</h2>
          <div className="flex justify-center">
            <EpisodeStateCard {...current} reduceMotion={reduced} className="shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white/50 px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-neutral-600">
            Controls
          </h3>
          <div className="flex gap-4">
            <select
              value={variant}
              onChange={(e) => {
                const value = e.target.value
                if (isVariant(value)) {
                  setVariant(value)
                }
              }}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium"
            >
              {VARIANTS.map((v) => (
                <option key={v} value={v}>
                  {v.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={() => setReduced(!reduced)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                reduced
                  ? "bg-violet-50 border-violet-300 text-violet-900"
                  : "bg-white border-neutral-300 text-neutral-700"
              }`}
            >
              {reduced ? "Reduced Motion" : "Normal Motion"}
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-3xl font-bold text-neutral-900">All Variants</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {VARIANTS.map((v) => (
              <div key={v} className="rounded-lg border border-neutral-200 bg-white p-6">
                <p className="mb-4 text-sm font-bold uppercase text-neutral-600">{v}</p>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <EpisodeStateCard
                    {...fixtures[v]}
                    reduceMotion={reduced}
                    className="shadow-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white/30 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-neutral-600">
            Component status: <span className="font-semibold">EXPERIMENTAL</span>
          </p>
          <p className="mt-2 text-neutral-600">
            Next phase: <span className="font-semibold">VISUAL_REVIEW</span>
          </p>
        </div>
      </section>
    </main>
  )
}
