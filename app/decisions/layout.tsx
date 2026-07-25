import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Decision Systems",
  description:
    "Reusable components for evaluating signals, evidence, rules, uncertainty, and traceable decisions.",
}

export default function DecisionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
