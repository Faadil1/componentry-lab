import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Component Library",
  description:
    "Searchable registry of Componentry interactions, foundations, reusable systems, capture tools, decision components, and composition recipes.",
}

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
