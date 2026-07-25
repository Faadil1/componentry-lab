import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Capture Systems",
  description:
    "Reusable scene manifests, viewport presets, deterministic capture states, restore URLs, signature frames, and clean presentation modes.",
}

export default function CaptureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
