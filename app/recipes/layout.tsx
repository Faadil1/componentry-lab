import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Composition Recipes",
  description:
    "Complete product, operational, editorial, and broadcast interface recipes assembled from reusable Componentry systems.",
}

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
