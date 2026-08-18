import type { LibraryV2Entity, ReferenceEntity } from "./types"

export const BEST_DESIGNS_ON_X_REFERENCE: ReferenceEntity = {
  id: "ref_best_designs_on_x",
  name: "Best Designs on X",
  entityKind: "REFERENCE",
  lifecycleState: "CAPTURED",
  provenance: "external:web:bestdesignsonx.com",
  evidenceRefs: [],
  description: "Frequently refreshed curated gallery of UI, motion, branding and visual work shared on X. Retained as a visual-direction and differentiation signal, not as UX-pattern authority or executable capability.",
  tags: [
    "CURRENT_EXTERNAL_FINDING",
    "UI_INSPIRATION",
    "MOTION",
    "BRANDING",
    "EMERGING_SIGNAL",
    "DIFFERENTIATION_SIGNAL",
    "NOT_UX_AUTHORITY",
    "HUMAN_BROWSE_ONLY"
  ],
  statusNotes: "Use for visual-direction divergence, emerging interaction signals and differentiation research. Do not use this reference alone to validate product flows, usability, accessibility, implementation quality or execution authority.",
  referenceDomain: "VISUAL_DIRECTION",
  stageAffinity: "VISUAL_DIRECTION_GATE",
  usageMode: "HUMAN_BROWSE",
  packageDescriptor: {
    packageType: "WEB_APP",
    packageName: "Best Designs on X",
    packageLocator: "https://bestdesignsonx.com/"
  },
  evidenceRecords: [
    {
      evidenceType: "PROVENANCE",
      status: "OBSERVED",
      locator: "https://bestdesignsonx.com/",
      notes: "Official site observed on 2026-08-18. The site identifies itself as Best Designs on X and presents itself as a frequently refreshed discovery feed for creatives on X."
    }
  ],
  licenseEvidenceRecords: [
    {
      evidenceType: "LICENSE",
      status: "UNKNOWN",
      scope: "EXAMPLES",
      licenseValue: "UNCLAIMED",
      locator: "https://bestdesignsonx.com/",
      notes: "No reuse license is inferred for curated third-party design examples. Browse as reference; do not promote media/code reuse rights without source-specific verification."
    }
  ]
}

export const CURRENT_FINDING_ENTITIES: readonly LibraryV2Entity[] = [
  BEST_DESIGNS_ON_X_REFERENCE
]
