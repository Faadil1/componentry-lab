import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Layout Systems · Componentry Lab",
  description: "Reusable layout primitives, responsive composition presets, spatial tokens, safe areas, and capture-ready interface structures.",
}

export default function LayoutsRouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
