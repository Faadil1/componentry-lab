import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: {
    default: "Universal Demo Film Kit",
    template: "%s · Universal Demo Film Kit",
  },
  description:
    "A reusable film kit for demo packets, capture plans, and AI33 handoffs built from Project Brain source data.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function FilmKitLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
