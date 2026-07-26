"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Componentry Links — Registry V2 cross-references
// ─────────────────────────────────────────────────────────────

import Link from "next/link"
import type { PlaybookEntry } from "@/lib/playbooks"
import { getRegistryRelationsForPlaybook } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

// Labels for known Registry V2 IDs
const REGISTRY_LABELS: Record<string, string> = {
  spotlight: "Spotlight Card",
  "split-flap": "Split Flap Display",
  "scrub-input": "Scrub Input",
  "kinetic-text": "Kinetic Text",
  "scroll-choreography": "Scroll Choreography",
  "webgl-liquid": "WebGL Liquid",
  "image-ripple": "Image Ripple",
  typography: "Typography Foundation",
  foundations: "Visual Foundations",
  layouts: "Layout Systems",
  "interaction-player": "Universal Interaction Player",
  "decision-systems": "Data & Decision Systems",
  "capture-bridge": "Demo & Capture Bridge",
  "product-launch-recipe": "Product Launch Recipe",
  "operational-workspace-recipe": "Operational Workspace Recipe",
  "data-story-recipe": "Data Story Recipe",
  "broadcast-package-recipe": "Broadcast Package Recipe",
  "layout-shell": "Layout Shell",
  "layout-stage": "Layout Stage",
  "layout-split": "Layout Split",
  "signal-band": "Signal Band",
  "evidence-ledger": "Evidence Ledger",
  "decision-gate": "Decision Gate",
  "decision-trace": "Decision Trace",
  "capture-workbench": "Capture Workbench",
  "recipe-workbench": "Recipe Workbench",
}

const RELATION_VERBS: Record<string, string> = {
  demonstrates: "demonstrates",
  requires: "requires",
  extends: "extends",
  informs: "informs",
  "produces-for": "produces for",
}

interface PlaybookComponentryLinksProps {
  entry: PlaybookEntry
  className?: string
}

export function PlaybookComponentryLinks({
  entry,
  className,
}: PlaybookComponentryLinksProps) {
  const relations = getRegistryRelationsForPlaybook(entry.id)
  if (relations.length === 0) return null

  // Deduplicate by registryId
  const unique = Array.from(
    new Map(relations.map((r) => [r.registryId, r])).values()
  )

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <span className="font-mono text-[9px] tracking-widest text-stone-400 uppercase">
        Componentry Lab
      </span>
      <div className="flex flex-col gap-2">
        {unique.map((rel) => (
          <Link
            key={rel.registryId}
            href={`/library?id=${rel.registryId}`}
            className="group flex flex-col gap-0.5 rounded-md border border-stone-200 bg-white p-2.5 transition hover:border-neutral-950"
          >
            <span className="font-mono text-[9px] text-stone-400 uppercase">
              {RELATION_VERBS[rel.type] ?? rel.type}
            </span>
            <span className="font-mono text-[10px] font-semibold text-neutral-950 leading-snug group-hover:underline">
              {REGISTRY_LABELS[rel.registryId] ?? rel.registryId}
            </span>
            {rel.note && (
              <span className="font-mono text-[9px] text-stone-400 leading-snug">
                {rel.note}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
