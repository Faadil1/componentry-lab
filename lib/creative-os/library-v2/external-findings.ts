import type {
  AutomationOperation,
  AutomationPermission,
  EvidenceRecord,
  LibraryV2Entity,
  LicenseEvidenceRecord,
  PackageDescriptor,
  ReferenceDomain,
  ReferenceEntity,
  ReferenceStageAffinity,
  ReferenceUsageMode,
  SourceEntity,
  SourceKind,
} from "./types"

const AUTOMATION_OPERATIONS: readonly AutomationOperation[] = [
  "BROWSE",
  "SEARCH",
  "METADATA_READ",
  "CATALOG_READ",
  "RESOURCE_FETCH",
  "SOURCE_CODE_FETCH",
  "MEDIA_FETCH",
  "EXECUTE",
  "WRITE_BACK"
]

function unknownAutomationPolicy() {
  return {
    operations: AUTOMATION_OPERATIONS.reduce((acc, operation) => {
      acc[operation] = "UNKNOWN"
      return acc
    }, {} as Record<AutomationOperation, AutomationPermission>)
  }
}

function readOnlyAuthorityPolicy() {
  return {
    requestedAuthority: "READ_ONLY" as const,
    maximumAuthority: "READ_ONLY" as const,
    humanReviewRequired: true
  }
}

function provenanceEvidence(locator: string, observed: boolean, notes: string): EvidenceRecord[] {
  return [{
    evidenceType: "PROVENANCE",
    status: observed ? "OBSERVED" : "DECLARED",
    locator,
    notes
  }]
}

function unknownLicense(locator: string, notes: string): LicenseEvidenceRecord[] {
  return [{
    evidenceType: "LICENSE",
    status: "UNKNOWN",
    scope: "UNKNOWN",
    licenseValue: "UNCLAIMED",
    locator,
    notes
  }]
}

function observedLicense(locator: string, licenseValue: string, notes: string): LicenseEvidenceRecord[] {
  return [{
    evidenceType: "LICENSE",
    status: "OBSERVED",
    scope: "SOURCE_SOFTWARE",
    licenseValue,
    locator,
    notes
  }]
}

type ReferenceSeed = {
  id: string
  name: string
  provenance: string
  referenceDomain: ReferenceDomain
  stageAffinity: ReferenceStageAffinity
  usageMode?: ReferenceUsageMode
  locator?: string
  packageType?: PackageDescriptor["packageType"]
  description: string
  tags?: string[]
  statusNotes?: string
}

function createReference(seed: ReferenceSeed): ReferenceEntity {
  const evidenceLocator = seed.locator ?? seed.provenance
  return {
    id: seed.id,
    name: seed.name,
    entityKind: "REFERENCE",
    lifecycleState: "CAPTURED",
    provenance: seed.provenance,
    evidenceRefs: [],
    description: seed.description,
    tags: ["HISTORICAL_EXTERNAL_FINDING", ...(seed.tags ?? [])],
    statusNotes: seed.statusNotes,
    referenceDomain: seed.referenceDomain,
    stageAffinity: seed.stageAffinity,
    usageMode: seed.usageMode ?? "LINK_OUT",
    packageDescriptor: seed.locator
      ? {
          packageType: seed.packageType ?? "WEB_APP",
          packageName: seed.name,
          packageLocator: seed.locator
        }
      : undefined,
    evidenceRecords: provenanceEvidence(
      evidenceLocator,
      Boolean(seed.locator),
      seed.locator
        ? "External finding source was directly observed during the cumulative-library reconciliation pass."
        : "Historical radar identity is preserved, but the exact external locator remains unresolved."
    ),
    licenseEvidenceRecords: unknownLicense(
      evidenceLocator,
      "No license claim is promoted for a reference until source-specific rights are verified."
    )
  }
}

type SourceSeed = {
  id: string
  name: string
  provenance: string
  sourceKind: SourceKind
  locator?: string
  description: string
  tags?: string[]
  statusNotes?: string
}

function createSource(seed: SourceSeed): SourceEntity {
  const locator = seed.locator ?? seed.provenance
  return {
    id: seed.id,
    name: seed.name,
    entityKind: "SOURCE",
    lifecycleState: "CAPTURED",
    provenance: seed.provenance,
    evidenceRefs: [],
    description: seed.description,
    tags: ["HISTORICAL_EXTERNAL_FINDING", ...(seed.tags ?? [])],
    statusNotes: seed.statusNotes,
    sourceKind: seed.sourceKind,
    locator,
    accessChannels: seed.locator ? ["WEB"] : [],
    sourceVerificationStatus: seed.locator ? "DECLARED" : "UNKNOWN",
    authorityPolicy: readOnlyAuthorityPolicy(),
    automationPolicy: unknownAutomationPolicy(),
    sourceUrl: seed.locator,
    packageDescriptor: seed.locator
      ? {
          packageType: seed.sourceKind === "REPOSITORY" ? "REPOSITORY" : "WEB_APP",
          packageName: seed.name,
          packageLocator: seed.locator
        }
      : undefined,
    evidenceRecords: provenanceEvidence(
      locator,
      Boolean(seed.locator),
      seed.locator
        ? "External source was directly observed during the cumulative-library reconciliation pass."
        : "Historical radar identity is preserved as a discovery candidate pending exact source recovery."
    ),
    licenseEvidenceRecords: unknownLicense(
      locator,
      "No source license is promoted until it is verified against the exact recovered locator."
    )
  }
}

export const EXTERNAL_FINDING_ENTITIES: readonly LibraryV2Entity[] = [
  createSource({
    id: "src_21st_dev",
    name: "21st.dev",
    provenance: "external:web:21st.dev",
    sourceKind: "MARKETPLACE",
    locator: "https://21st.dev/",
    description: "Browsable component and UI discovery catalog retained as a governed external source, not an automatically approved component library.",
    tags: ["COMPONENT_DISCOVERY", "DESIGN_REFERENCE"]
  }),
  createReference({
    id: "ref_ai_camera_control",
    name: "AI Camera Control",
    provenance: "external:web:ai-camera-control",
    locator: "https://aicameracontrol.com/",
    referenceDomain: "CINEMATOGRAPHY",
    stageAffinity: "TARGETED_REFERENCE_GATE",
    description: "Potential camera-placement or previs reference. Public identity is known, but capabilities remain insufficiently established for provider promotion.",
    tags: ["DISCOVERY_CANDIDATE", "PREVIS"]
  }),
  createReference({
    id: "ref_photo_abstract_editorial",
    name: "Photo Abstract Editorial",
    provenance: "external:github:photo-abstract-editorial",
    locator: "https://github.com/ZzzLc0405/photo-abstract-editorial/blob/main/references/photo-abstract-editorial-prompt.en.md",
    packageType: "REPOSITORY",
    referenceDomain: "CREATIVE_PATTERN",
    stageAffinity: "DIFFERENTIATION_GATE",
    description: "Editorial abstraction source that informed the internal Relationship-Preserving Abstraction method; preserved separately from the internalized method.",
    tags: ["METHOD_ORIGIN", "EDITORIAL_ABSTRACTION"]
  }),
  createReference({
    id: "ref_ian_xiaohei_illustrations",
    name: "Ian Xiaohei Illustrations",
    provenance: "external:github:helloianneo:ian-xiaohei-illustrations",
    locator: "https://github.com/helloianneo/ian-xiaohei-illustrations",
    packageType: "REPOSITORY",
    referenceDomain: "CREATIVE_PATTERN",
    stageAffinity: "DIFFERENTIATION_GATE",
    description: "External illustration skill whose one-image/one-cognitive-action reasoning informed the internal Cognitive Metaphor Illustrator method.",
    tags: ["METHOD_ORIGIN", "ILLUSTRATION"]
  }),
  createReference({
    id: "ref_ian_xiaohei_scenes",
    name: "Ian Xiaohei Scenes",
    provenance: "external:github:helloianneo:ian-xiaohei-scenes",
    locator: "https://github.com/helloianneo/ian-xiaohei-scenes",
    packageType: "REPOSITORY",
    referenceDomain: "CREATIVE_PATTERN",
    stageAffinity: "DIFFERENTIATION_GATE",
    description: "External physical-storytelling skill that informed the internal Physical Situation Storyboarder method.",
    tags: ["METHOD_ORIGIN", "STORYBOARDING"]
  }),
  createReference({
    id: "ref_ian_handdrawn_ppt",
    name: "Ian Handdrawn PPT",
    provenance: "external:github:helloianneo:ian-handdrawn-ppt",
    locator: "https://github.com/helloianneo/ian-handdrawn-ppt",
    packageType: "REPOSITORY",
    referenceDomain: "VISUAL_DIRECTION",
    stageAffinity: "VISUAL_DIRECTION_GATE",
    description: "Image-based presentation planning and visual-system reference retained for deck and carousel workflows; not treated as a native PPTX production provider.",
    tags: ["PRESENTATION", "PAGE_PLANNING"]
  }),
  createReference({
    id: "ref_obsidian_ai_second_brain",
    name: "Obsidian AI Second Brain",
    provenance: "external:github:helloianneo:obsidian-ai-second-brain",
    locator: "https://github.com/helloianneo/obsidian-ai-second-brain",
    packageType: "REPOSITORY",
    referenceDomain: "TECHNICAL_PATTERN",
    stageAffinity: "SYSTEM_GATE",
    description: "Knowledge-system architecture reference for immutable raw sources, compiled knowledge, assets, navigation and trace logs. Project Brain remains canonical project state.",
    tags: ["KNOWLEDGE_ARCHITECTURE", "MEMORY"]
  }),
  createReference({
    id: "ref_claude_code_handbook",
    name: "Claude Code Handbook",
    provenance: "external:github:helloianneo:claude-code-handbook",
    locator: "https://github.com/helloianneo/claude-code-handbook",
    packageType: "REPOSITORY",
    referenceDomain: "TECHNICAL_PATTERN",
    stageAffinity: "TARGETED_REFERENCE_GATE",
    description: "Agent-operations reference retained for later source-by-source verification before any operational guidance is internalized.",
    tags: ["AGENT_OPERATIONS", "VERIFY_BEFORE_INTERNALIZE"]
  }),
  createReference({
    id: "ref_stillslab",
    name: "StillsLab",
    provenance: "external:web:stillslab",
    locator: "https://www.stillslab.com/",
    referenceDomain: "CINEMATOGRAPHY",
    stageAffinity: "VISUAL_DIRECTION_GATE",
    usageMode: "HUMAN_BROWSE",
    description: "Searchable film-still and cinematography reference library retained for lookbooks, lighting, framing and visual-direction research.",
    tags: ["FILM_STILLS", "LOOKBOOK"]
  }),
  createReference({
    id: "ref_filmgrab",
    name: "FilmGrab",
    provenance: "external:web:filmgrab",
    locator: "https://film-grab.com/",
    referenceDomain: "CINEMATOGRAPHY",
    stageAffinity: "VISUAL_DIRECTION_GATE",
    usageMode: "HUMAN_BROWSE",
    description: "Long-running curated film-still archive retained as a human-browse cinematography and composition reference.",
    tags: ["FILM_STILLS", "HISTORICAL_DESIGN"]
  }),
  createSource({
    id: "src_shuohao_skills_candidate",
    name: "shuohao-skills",
    provenance: "historical-radar:shuohao-skills",
    sourceKind: "UNKNOWN",
    description: "Historical skills-ecosystem finding retained as an unresolved discovery candidate until the exact canonical repository is recovered.",
    tags: ["DISCOVERY_CANDIDATE", "SKILL_ECOSYSTEM"],
    statusNotes: "Exact source locator was not recoverable from the available handover evidence; do not install or route from this entry."
  }),
  createReference({
    id: "ref_photo_relic_editorial",
    name: "photo-relic-editorial",
    provenance: "historical-radar:photo-relic-editorial",
    referenceDomain: "CREATIVE_PATTERN",
    stageAffinity: "VISUAL_DIRECTION_GATE",
    description: "Historical editorial-image finding retained for later source recovery and method-quality comparison.",
    tags: ["DISCOVERY_CANDIDATE", "EDITORIAL"],
    statusNotes: "Exact source locator remains unresolved; reference is visible but non-routable."
  }),
  createReference({
    id: "ref_photo_distill",
    name: "photo-distill",
    provenance: "historical-radar:photo-distill",
    referenceDomain: "CREATIVE_PATTERN",
    stageAffinity: "VISUAL_DIRECTION_GATE",
    description: "Historical photo-distillation finding retained for later source recovery and comparison against internal abstraction methods.",
    tags: ["DISCOVERY_CANDIDATE", "EDITORIAL"],
    statusNotes: "Exact source locator remains unresolved; reference is visible but non-routable."
  }),
  createReference({
    id: "ref_poetic_line_zine_poster",
    name: "poetic-line-zine-poster",
    provenance: "historical-radar:poetic-line-zine-poster",
    referenceDomain: "VISUAL_DIRECTION",
    stageAffinity: "VISUAL_DIRECTION_GATE",
    description: "Historical poetic zine/poster skill finding retained as a style and composition reference pending exact source recovery.",
    tags: ["DISCOVERY_CANDIDATE", "POSTER", "ZINE"],
    statusNotes: "Exact source locator remains unresolved; reference is visible but non-routable."
  })
]

export const RECONCILED_LEGACY_PLACEHOLDER_IDS = new Set<string>([
  "res_ai_camera_movements",
  "res_remocn",
  "res_cineprompt",
  "res_ai_world_builder",
  "res_open_kimi_ppt",
  "res_tait_crt_interface_skill",
  "res_video_shotcraft",
  "res_gbro_collage_b_roll",
  "res_openmontage",
  "res_awesome_claude_code_skills",
  "res_helloianneo_ecosystem"
])

function appendObservedProvenance(
  existing: EvidenceRecord[] | undefined,
  locator: string,
  notes: string
): EvidenceRecord[] {
  return [
    ...(existing ?? []),
    {
      evidenceType: "PROVENANCE",
      status: "OBSERVED",
      locator,
      notes
    }
  ]
}

export function reconcileHistoricalExternalEntity(entity: LibraryV2Entity): LibraryV2Entity {
  switch (entity.id) {
    case "res_ai_camera_movements": {
      if (entity.entityKind !== "RESOURCE") return entity
      const locator = "https://aicameramovements.com/"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "WEB_APP",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Public camera-movement reference site observed during reconciliation."),
        statusNotes: "External camera-language knowledge source; human review remains required before internalization."
      }
    }
    case "res_originkit": {
      if (entity.entityKind !== "SOURCE") return entity
      const locator = "https://www.originkit.dev/intro"
      return {
        ...entity,
        locator,
        sourceUrl: locator,
        sourceVerificationStatus: "DECLARED",
        packageDescriptor: {
          packageType: "WEB_APP",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "OriginKit public catalog observed during reconciliation; connector provenance is preserved separately."),
        statusNotes: "External component source candidate. No automatic installation or promotion."
      }
    }
    case "res_remocn": {
      if (entity.entityKind !== "SOURCE") return entity
      const locator = "https://github.com/Remocn/remocn"
      return {
        ...entity,
        sourceKind: "REPOSITORY",
        locator,
        sourceUrl: locator,
        sourceVerificationStatus: "DECLARED",
        packageDescriptor: {
          packageType: "REPOSITORY",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical Remocn repository observed during reconciliation."),
        licenseEvidenceRecords: observedLicense(locator, "MIT", "GitHub repository displays an MIT license."),
        statusNotes: "Copy-paste Remotion component source; remains governed and non-automatic."
      }
    }
    case "res_cineprompt": {
      if (entity.entityKind !== "PROVIDER") return entity
      const locator = "https://cineprompt.io/"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "WEB_APP",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "CinePrompt public product and Developer API surface observed during reconciliation."),
        statusNotes: "Prompt-production provider candidate; generation and external side effects remain outside automatic authority."
      }
    }
    case "res_ai_world_builder": {
      if (entity.entityKind !== "PROVIDER") return entity
      const locator = "https://ai-world-builder-nine.vercel.app/"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "WEB_APP",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "AI World Builder public application observed during reconciliation."),
        statusNotes: "Narrative-preproduction provider candidate; Project Brain remains canonical world authority."
      }
    }
    case "res_open_kimi_ppt": {
      if (entity.entityKind !== "PROVIDER") return entity
      const locator = "https://github.com/Binaryify/open-kimi-ppt-skill"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "REPOSITORY",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical Open Kimi PPT repository observed during reconciliation."),
        statusNotes: "Presentation-production provider candidate; isolate before any professional-document use."
      }
    }
    case "res_tait_crt_interface_skill": {
      if (entity.entityKind !== "RESOURCE") return entity
      const locator = "https://github.com/TaiT-tt/tait-crt-interface-skill"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "SKILL",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical TaiT CRT Interface Skill repository observed during reconciliation."),
        licenseEvidenceRecords: unknownLicense(locator, "No standard repository license was established during this pass; retain as unclaimed."),
        statusNotes: "Strong style signature; use only as a tested external candidate with provenance review."
      }
    }
    case "res_video_shotcraft": {
      if (entity.entityKind !== "RESOURCE") return entity
      const locator = "https://github.com/Vincentwei1021/video-shotcraft"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "PIPELINE",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical Video Shotcraft repository observed during reconciliation."),
        licenseEvidenceRecords: observedLicense(locator, "Apache-2.0", "GitHub repository displays an Apache-2.0 license."),
        statusNotes: "High-priority product-video pipeline candidate; external execution remains gated."
      }
    }
    case "res_gbro_collage_b_roll": {
      if (entity.entityKind !== "RESOURCE") return entity
      const locator = "https://github.com/pyang5166/gbro-collage-broll"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "PIPELINE",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical GBRO Collage B-roll repository observed during reconciliation."),
        licenseEvidenceRecords: observedLicense(locator, "MIT", "GitHub repository displays an MIT license."),
        statusNotes: "Specialized three-gate B-roll pipeline; paid generation remains human-gated."
      }
    }
    case "res_openmontage": {
      if (entity.entityKind !== "RESOURCE") return entity
      const locator = "https://github.com/calesthio/OpenMontage"
      return {
        ...entity,
        packageDescriptor: {
          packageType: "PIPELINE",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical OpenMontage repository observed during reconciliation."),
        licenseEvidenceRecords: observedLicense(locator, "AGPL-3.0", "GitHub repository displays an AGPL-3.0 license."),
        statusNotes: "Study/test-in-isolation production-orchestrator reference; do not embed into Creative OS runtime yet."
      }
    }
    case "res_awesome_claude_code_skills": {
      if (entity.entityKind !== "SOURCE") return entity
      const locator = "https://github.com/helloianneo/awesome-claude-code-skills"
      return {
        ...entity,
        sourceKind: "REPOSITORY",
        locator,
        sourceUrl: locator,
        sourceVerificationStatus: "DECLARED",
        packageDescriptor: {
          packageType: "REPOSITORY",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "Canonical Awesome Claude Code Skills repository observed during reconciliation."),
        statusNotes: "Governed discovery feed only; individual skills require independent verification and approval."
      }
    }
    case "res_helloianneo_ecosystem": {
      if (entity.entityKind !== "SOURCE") return entity
      const locator = "https://github.com/helloianneo"
      return {
        ...entity,
        sourceKind: "WEBSITE",
        locator,
        sourceUrl: locator,
        sourceVerificationStatus: "DECLARED",
        packageDescriptor: {
          packageType: "WEB_APP",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: appendObservedProvenance(entity.evidenceRecords, locator, "helloianneo GitHub ecosystem and public repositories observed during reconciliation."),
        statusNotes: "Discovery ecosystem; selected sub-projects are represented as separate references."
      }
    }
    case "res_yummy_design_sprint": {
      if (entity.entityKind !== "SOURCE") return entity
      const locator = "https://yummy-design-sprint.notion.site/32762791470980f79c59f4580d377f3f"
      return {
        ...entity,
        sourceKind: "WEBSITE",
        locator,
        sourceUrl: locator,
        sourceVerificationStatus: "DECLARED",
        packageDescriptor: {
          packageType: "WEB_APP",
          packageName: entity.name,
          packageLocator: locator
        },
        evidenceRecords: [
          ...(entity.evidenceRecords ?? []),
          {
            evidenceType: "PROVENANCE",
            status: "DECLARED",
            locator,
            notes: "Historical radar supplied this Notion source; full-page audit remains pending when directly accessible."
          }
        ],
        statusNotes: "External source for the internalized library-first principle; exact page audit remains pending."
      }
    }
    case "res_relationship_preserving_abstraction":
      if (entity.entityKind !== "METHOD") return entity
      return {
        ...entity,
        tags: [...(entity.tags ?? []), "HISTORICAL_EXTERNAL_ORIGIN", "ref_photo_abstract_editorial"],
        statusNotes: "Internalized method with preserved external origin reference ref_photo_abstract_editorial."
      }
    case "res_cognitive_metaphor_illustrator":
      if (entity.entityKind !== "METHOD") return entity
      return {
        ...entity,
        tags: [...(entity.tags ?? []), "HISTORICAL_EXTERNAL_ORIGIN", "ref_ian_xiaohei_illustrations"],
        statusNotes: "Internalized method with preserved external origin reference ref_ian_xiaohei_illustrations."
      }
    case "res_physical_situation_storyboarder":
      if (entity.entityKind !== "METHOD") return entity
      return {
        ...entity,
        tags: [...(entity.tags ?? []), "HISTORICAL_EXTERNAL_ORIGIN", "ref_ian_xiaohei_scenes"],
        statusNotes: "Internalized method with preserved external origin reference ref_ian_xiaohei_scenes."
      }
    case "res_library_first_composition_router":
      if (entity.entityKind !== "METHOD") return entity
      return {
        ...entity,
        tags: [...(entity.tags ?? []), "HISTORICAL_EXTERNAL_ORIGIN", "res_yummy_design_sprint"],
        statusNotes: "Internalized library-first method linked to the governed Yummy Design Sprint source entry."
      }
    case "res_sacred_rules_breaker":
    case "res_somatic_response_design":
      if (entity.entityKind !== "METHOD") return entity
      return {
        ...entity,
        tags: [...(entity.tags ?? []), "HISTORICAL_EXTERNAL_ORIGIN", "ORIGIN_LOCATOR_UNRESOLVED"],
        statusNotes: "Internalized method is governed; the exact original external source locator was not recoverable from the available historical handover evidence."
      }
    default:
      return entity
  }
}
