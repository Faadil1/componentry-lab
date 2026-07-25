import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interaction Player",
  description:
    "A deterministic interaction playback system with timelines, markers, frame-level controls, capture mode, and reusable scene presets.",
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
