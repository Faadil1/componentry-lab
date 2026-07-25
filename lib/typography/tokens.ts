import type { FontRole, TypographyScale, TypographyTokens } from "@/lib/typography/types"

export const typographyScale: TypographyScale = {
  display: "text-5xl font-semibold leading-[0.98] md:text-7xl",
  h1: "text-4xl font-semibold leading-[1.04] md:text-6xl",
  h2: "text-2xl font-semibold leading-tight md:text-3xl",
  h3: "text-xl font-semibold leading-snug md:text-2xl",
  body: "text-base leading-7",
  small: "text-sm leading-6",
  label: "font-mono text-xs font-semibold uppercase tracking-[0.18em]",
  numeric: "font-mono tabular-nums",
}

const fontRoles: Record<FontRole, string> = {
  display: "var(--font-geist-sans)",
  "editorial-heading": "var(--font-geist-sans)",
  "section-heading": "var(--font-geist-sans)",
  body: "var(--font-sans)",
  label: "var(--font-geist-mono)",
  numeric: "var(--font-geist-mono)",
}

const lineHeights: TypographyTokens["lineHeights"] = {
  display: "0.98",
  h1: "1.04",
  h2: "1.15",
  h3: "1.2",
  body: "1.75",
  small: "1.6",
  label: "1.4",
  numeric: "1",
}

const tracking = {
  loose: "0.01em",
  normal: "0em",
  tight: "-0.01em",
  label: "0.18em",
}

const paragraphMeasures = {
  narrow: "52ch",
  medium: "66ch",
  wide: "76ch",
}

const fallbackStacks = {
  display: 'var(--font-geist-sans), var(--font-sans), sans-serif',
  "editorial-heading": 'var(--font-geist-sans), var(--font-sans), sans-serif',
  "section-heading": 'var(--font-geist-sans), var(--font-sans), sans-serif',
  body: 'var(--font-sans), "Segoe UI", Arial, sans-serif',
  label: 'var(--font-geist-mono), "SFMono-Regular", Consolas, monospace',
  numeric: 'var(--font-geist-mono), "SFMono-Regular", Consolas, monospace',
}

export const typographyTokens: TypographyTokens = {
  fontRoles,
  scale: typographyScale,
  lineHeights,
  tracking,
  paragraphMeasures,
  fallbackStacks,
}

export const typographyTokensCss = `
:root {
  --typography-display-font: var(--font-geist-sans), var(--font-sans), sans-serif;
  --typography-body-font: var(--font-sans), "Segoe UI", Arial, sans-serif;
  --typography-mono-font: var(--font-geist-mono), "SFMono-Regular", Consolas, monospace;
  --typography-measure-narrow: 52ch;
  --typography-measure-medium: 66ch;
  --typography-measure-wide: 76ch;
}
`
