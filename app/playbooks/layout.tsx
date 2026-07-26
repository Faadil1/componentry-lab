// ─────────────────────────────────────────────────────────────
// /playbooks — Route Layout
// ─────────────────────────────────────────────────────────────

import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: {
    default: "Playbook Knowledge System — Componentry Lab",
    template: "%s — Playbooks — Componentry Lab",
  },
  description:
    "61 canonical playbooks covering UI/UX, positioning, evidence, demo video, and hackathon operating templates. Field Manual & Technical Knowledge Index for Componentry Lab.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Playbook Knowledge System",
    description:
      "61 canonical playbooks covering UI/UX, positioning, evidence, and hackathon operating templates.",
    siteName: "Componentry Lab",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function PlaybooksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
