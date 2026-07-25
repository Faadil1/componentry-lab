import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Foundations",
  description: "Visual Systems Workbench for reusable design tokens spanning color, spacing, surfaces, radius, elevation, and motion.",
}

export default function FoundationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
