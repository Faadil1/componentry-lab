import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Typography Foundation",
  description:
    "Reusable typography profiles, semantic type scales, pairing recipes, numeric specimens, and exportable design tokens.",
}

export default function TypographyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
