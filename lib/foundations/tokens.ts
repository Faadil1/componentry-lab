import { motionDurationTokens, motionEasingTokens } from "@/lib/foundations/motion"
import { elevationTokens } from "@/lib/foundations/elevation"
import { colorTokens } from "@/lib/foundations/colors"
import { radiusTokens } from "@/lib/foundations/radius"
import { spacingTokens } from "@/lib/foundations/spacing"
import { surfaceTokens } from "@/lib/foundations/surfaces"
import type { FoundationTokens } from "@/lib/foundations/types"

export const foundationTokens: FoundationTokens = {
  colors: colorTokens,
  spacing: spacingTokens,
  surfaces: surfaceTokens,
  radii: radiusTokens,
  elevation: elevationTokens,
  motionDurations: motionDurationTokens,
  motionEasings: motionEasingTokens,
}

export const foundationTokensCss = `
:root {
  --foundation-color-background: #f3efe6;
  --foundation-color-surface: #fbfaf6;
  --foundation-color-surface-raised: #eae6db;
  --foundation-color-surface-inverse: #121110;
  --foundation-color-text-primary: #181716;
  --foundation-color-text-secondary: #4f4a44;
  --foundation-color-text-muted: #7a756c;
  --foundation-color-text-inverse: #f5f3ee;
  --foundation-color-border-subtle: #d7d1c6;
  --foundation-color-border-default: #b8b0a3;
  --foundation-color-border-strong: #5f5850;
  --foundation-color-accent: #0f766e;
  --foundation-color-success: #15803d;
  --foundation-color-warning: #b45309;
  --foundation-color-danger: #b91c1c;
  --foundation-color-info: #1d4ed8;
  --foundation-surface-canvas: #f3efe6;
  --foundation-surface-inset: #eae6db;
  --foundation-surface-base: #fbfaf6;
  --foundation-surface-raised: #ffffff;
  --foundation-surface-overlay: rgba(18,17,16,0.92);
  --foundation-surface-inverse: #121110;
  --foundation-surface-cinematic: #0b0b0a;
  --foundation-spacing-inline-1: 0.25rem;
  --foundation-spacing-inline-2: 0.5rem;
  --foundation-spacing-inline-3: 0.75rem;
  --foundation-spacing-stack-2: 0.5rem;
  --foundation-spacing-stack-3: 0.75rem;
  --foundation-spacing-stack-4: 1rem;
  --foundation-spacing-stack-6: 1.5rem;
  --foundation-spacing-stack-8: 2rem;
  --foundation-spacing-stack-12: 3rem;
  --foundation-spacing-layout-16: 4rem;
  --foundation-spacing-layout-24: 6rem;
  --foundation-spacing-page-gutter: clamp(1rem, 2vw, 2rem);
  --foundation-radius-none: 0px;
  --foundation-radius-control: 0.5rem;
  --foundation-radius-panel: 0.75rem;
  --foundation-radius-feature: 1rem;
  --foundation-radius-round: 9999px;
  --foundation-elevation-flat: none;
  --foundation-elevation-raised: 0 1px 2px rgba(0,0,0,0.08);
  --foundation-elevation-floating: 0 8px 20px rgba(0,0,0,0.12);
  --foundation-elevation-overlay: 0 20px 60px rgba(0,0,0,0.22);
  --foundation-elevation-cinematic: 0 24px 80px rgba(0,0,0,0.28);
  --foundation-motion-instant: 0ms;
  --foundation-motion-fast: 120ms;
  --foundation-motion-standard: 180ms;
  --foundation-motion-deliberate: 260ms;
  --foundation-motion-cinematic: 420ms;
  --foundation-easing-enter: cubic-bezier(0.2, 0.8, 0.2, 1);
  --foundation-easing-exit: cubic-bezier(0.4, 0, 1, 1);
  --foundation-easing-standard: cubic-bezier(0.3, 0, 0.2, 1);
  --foundation-easing-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
  --foundation-easing-cinematic: cubic-bezier(0.22, 1, 0.36, 1);
}
`

export * from "@/lib/foundations/types"
export * from "@/lib/foundations/colors"
export * from "@/lib/foundations/spacing"
export * from "@/lib/foundations/radius"
export * from "@/lib/foundations/surfaces"
export * from "@/lib/foundations/elevation"
export * from "@/lib/foundations/motion"
export * from "@/lib/foundations/tokens"
