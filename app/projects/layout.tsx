// ─────────────────────────────────────────────────────────────
// /projects — Route Layout
// ─────────────────────────────────────────────────────────────

import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: {
    default: "Project Brain Workspace — Componentry Lab",
    template: "%s — Project Brain — Componentry Lab",
  },
  description:
    "Project-aware memory for briefs, decisions, evidence, components, capture states, video plans, audits, and agent handoffs.",
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
