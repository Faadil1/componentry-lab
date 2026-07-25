// ─────────────────────────────────────────────────────────────
// Registry V2 — Relations Types Mapping
// ─────────────────────────────────────────────────────────────

import type { RegistryRelationType } from "./types"

export interface RelationMetadata {
  type: RegistryRelationType
  inverseType: RegistryRelationType
  label: string
  inverseLabel: string
}

export const relationMetadata: Record<RegistryRelationType, RelationMetadata> = {
  uses: {
    type: "uses",
    inverseType: "composes",
    label: "Uses component",
    inverseLabel: "Composed by"
  },
  composes: {
    type: "composes",
    inverseType: "uses",
    label: "Composes system",
    inverseLabel: "Used by"
  },
  extends: {
    type: "extends",
    inverseType: "supports",
    label: "Extends capability",
    inverseLabel: "Supported by"
  },
  "depends-on": {
    type: "depends-on",
    inverseType: "supports",
    label: "Depends on",
    inverseLabel: "Supports"
  },
  "demonstrated-by": {
    type: "demonstrated-by",
    inverseType: "supports",
    label: "Demonstrated by",
    inverseLabel: "Supports"
  },
  "alternative-to": {
    type: "alternative-to",
    inverseType: "alternative-to",
    label: "Alternative to",
    inverseLabel: "Alternative to"
  },
  supports: {
    type: "supports",
    inverseType: "depends-on",
    label: "Supports",
    inverseLabel: "Depends on"
  },
  "captured-by": {
    type: "captured-by",
    inverseType: "controlled-by",
    label: "Captured by",
    inverseLabel: "Controls"
  },
  "controlled-by": {
    type: "controlled-by",
    inverseType: "captured-by",
    label: "Controlled by",
    inverseLabel: "Captured by"
  }
}
export default relationMetadata
