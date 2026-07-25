import type { TypographyRecipe } from "@/lib/typography/types"
import { typographyTokens } from "@/lib/typography/tokens"

export const typographyRecipes: TypographyRecipe[] = [
  {
    id: "editorial-technology",
    name: "Editorial Technology",
    summary: "Longform editorial rhythm with precise hierarchy and stable first-frame readability.",
    scale: typographyTokens.scale,
    display: "Typography before animation.",
    headings: "Use display and editorial headings with restrained line lengths.",
    body: "Body copy should remain readable at mobile widths and in static captures.",
    notes: [
      "Best for essays, case studies and product editorials.",
      "Use the baseline overlay to validate rhythm.",
      "Hold one strong statement per section.",
    ],
  },
  {
    id: "operational-interface",
    name: "Operational Interface",
    summary: "Dense interface language for labels, controls and technical metadata.",
    scale: typographyTokens.scale,
    display: "Capture-ready type system",
    headings: "Favor hierarchy over decoration and keep labels compact.",
    body: "Operational text should make state and action legible instantly.",
    notes: [
      "Pairs well with dashboards, capture notes and control panels.",
      "Use mono for metrics and meta text.",
      "Track labels only at small sizes.",
    ],
  },
  {
    id: "cinematic-product",
    name: "Cinematic Product",
    summary: "Hero statements and reveal frames designed for product launches and video capture.",
    scale: typographyTokens.scale,
    display: "One typographic frame must survive compression, motion and silence.",
    headings: "Use large scale changes sparingly and preserve final frame stability.",
    body: "The composition should read clearly before, during and after motion.",
    notes: [
      "Target Remotion-friendly final frames.",
      "Keep hero copy short enough for 390px captures.",
      "Use tabular numerals where timing matters.",
    ],
  },
]
