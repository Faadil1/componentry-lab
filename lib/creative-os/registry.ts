import type { ResourceMetadata } from "./types"

export const RESOURCE_REGISTRY: ResourceMetadata[] = [
  {
    id: "res_sacred_rules_breaker",
    name: "Sacred Rules Breaker",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED", // Transitioned via human review (Evidence: docs/evidence/creative-os-slice-3b-v3/)
    maxExecutionAuthority: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:sacred-rules-breaker",
    modes: ["DAY_CHALLENGE"],
    capabilities: {
      actions: ["validate-rules-break"],
      artifactTypes: ["workflow-rules"],
      capabilityGaps: ["rules-governance", "category-differentiation"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_somatic_response_design",
    name: "Somatic Response Design",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED", // Transitioned via human review (Evidence: docs/evidence/creative-os-slice-3b-v3/)
    maxExecutionAuthority: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:somatic-response",
    modes: ["DAY_CHALLENGE"],
    capabilities: {
      actions: ["evaluate-somatic-response"],
      artifactTypes: ["somatic-profile"],
      capabilityGaps: ["somatic-design", "bodily-response-art-direction"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_relationship_preserving_abstraction",
    name: "Relationship-Preserving Abstraction",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED", // Transitioned via human review (Evidence: docs/evidence/creative-os-slice-3b2-v3/)
    maxExecutionAuthority: "PREPARE",
    license: "Apache-2.0",
    provenance: "internal:method:relationship-preserving-abstraction",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["abstract-relationships"],
      artifactTypes: ["data-privacy-model"],
      capabilityGaps: ["data-privacy", "editorial-abstraction"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_cognitive_metaphor_illustrator",
    name: "Cognitive Metaphor Illustrator",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED", // Transitioned via human review (Evidence: docs/evidence/creative-os-slice-3b2-v3/)
    maxExecutionAuthority: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:cognitive-metaphor",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["illustrate-cognitive-metaphor"],
      artifactTypes: ["metaphor-illustration"],
      capabilityGaps: ["visual-metaphor"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_physical_situation_storyboarder",
    name: "Physical Situation Storyboarder",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED", // Transitioned via human review (Evidence: docs/evidence/creative-os-slice-3b2-v3/) — V3 transformation reasoning: desiredTransformation→behavioralMeaning→observableEvidenceRequired→actionEvidence→relationshipChange→endingEvidence; materially distinct manifestations for visible ownership, abandonment, repair commitment
    maxExecutionAuthority: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:physical-storyboarder",
    modes: ["MARA"],
    capabilities: {
      actions: ["storyboard-physical-scene"],
      artifactTypes: ["cinematic-storyboard"],
      capabilityGaps: ["physical-space-mapping", "narrative-staging"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_library_first_composition_router",
    name: "Library-First Composition Router",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED", // Transitioned via human review (Evidence: docs/evidence/creative-os-slice-3b2-v3/)
    maxExecutionAuthority: "PREPARE",
    license: "MIT",
    provenance: "internal:method:library-first-router",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["route-library-composition"],
      artifactTypes: ["composition-tree"],
      capabilityGaps: ["library-composition"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_ai_camera_movements",
    name: "AI Camera Movements",
    type: "KNOWLEDGE_PACK",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:github:ai-camera-movements",
    sourceUrl: "https://github.com/example/ai-camera-movements",
    modes: ["MARA"],
    capabilities: {
      actions: ["generate-camera-path"],
      artifactTypes: ["camera-path-data"],
      capabilityGaps: ["ai-camera-movements", "camera-motion-language"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_cinematography_intelligence_layer",
    name: "Cinematography Intelligence Layer",
    type: "KNOWLEDGE_PACK",
    lifecycleState: "CAPTURED",
    maxExecutionAuthority: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:npm:cinematography-intelligence",
    sourceUrl: "https://npmjs.com/package/cinematography-intelligence",
    modes: ["MARA"],
    capabilities: {
      actions: ["analyze-shot-composition"],
      artifactTypes: ["cinematography-metrics"],
      capabilityGaps: ["cinematography-layer"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_remocn",
    name: "Remocn",
    type: "COMPONENT_SOURCE",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "LOCAL_REVERSIBLE",
    license: "GPL-3.0",
    provenance: "external:github:remocn",
    sourceUrl: "https://github.com/example/remocn",
    modes: ["MARA", "HACKATHON"],
    capabilities: {
      actions: ["legacy-render", "recommend-component"],
      artifactTypes: ["legacy-frame", "web-component-animation"],
      capabilityGaps: ["remocn-render", "web-component-animation"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: [],
    supportedFrameworks: ["React/NextJS"],
    supportedCapabilities: ["web-component-animation"],
    compatibilityEvidenceStatus: "UNKNOWN"
  },
  {
    id: "res_originkit",
    name: "OriginKit",
    type: "COMPONENT_SOURCE",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "READ_ONLY",
    license: "UNCLAIMED",
    provenance: "connector:vellum-ai/originkit@9aa260c2561ad9e765832dc342e9bbb5138858a4",
    modes: ["HACKATHON"],
    capabilities: {
      actions: [],
      artifactTypes: [],
      capabilityGaps: [],
      requiredAuthority: "SUGGEST"
    },
    activationRules: [],
    compatibilityEvidenceStatus: "UNKNOWN"
  },
  {
    id: "res_cineprompt",
    name: "CinePrompt",
    type: "PROVIDER",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "EXPLICIT_EXTERNAL",
    license: "Proprietary",
    provenance: "external:github:cineprompt",
    sourceUrl: "https://github.com/example/cineprompt",
    modes: ["MARA", "DAY_CHALLENGE"],
    capabilities: {
      actions: ["prompt-camera-path"],
      artifactTypes: ["shotlist", "EXTERNAL_SHARE_REFERENCE"],
      capabilityGaps: ["ai-camera-movements", "PROMPT_SHARE_LINK_CREATION"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_ai_world_builder",
    name: "AI World Builder",
    type: "PROVIDER",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "PROHIBITED",
    license: "Proprietary",
    provenance: "external:github:ai-world-builder",
    sourceUrl: "https://github.com/example/ai-world-builder",
    modes: ["MARA"],
    capabilities: {
      actions: ["generate-3d-scene"],
      artifactTypes: ["3d-scene-model"],
      capabilityGaps: ["world-building"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_open_kimi_ppt",
    name: "Open Kimi PPT",
    type: "PROVIDER",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "READ_ONLY",
    license: "MIT",
    provenance: "external:github:open-kimi-ppt",
    sourceUrl: "https://github.com/example/open-kimi-ppt",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["scan-presentation-feeds"],
      artifactTypes: ["ppt-template"],
      capabilityGaps: ["ppt-generation"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_tait_crt_interface_skill",
    name: "TaiT CRT Interface Skill",
    type: "SKILL",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "READ_ONLY",
    license: "MIT",
    provenance: "external:github:tait-crt",
    sourceUrl: "https://github.com/example/tait-crt",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["render-crt-screen"],
      artifactTypes: ["crt-interface-layout"],
      capabilityGaps: ["crt-visualization"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_video_shotcraft",
    name: "Video Shotcraft",
    type: "PRODUCTION_PIPELINE",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:github:video-shotcraft",
    sourceUrl: "https://github.com/example/video-shotcraft",
    modes: ["MARA", "HACKATHON"],
    capabilities: {
      actions: ["process-video-draft"],
      artifactTypes: ["rough-cut-video", "product-demo-film"],
      capabilityGaps: ["video-editing", "cinematic-product-demo"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_gbro_collage_b_roll",
    name: "GBRO Collage B-roll",
    type: "PRODUCTION_PIPELINE",
    lifecycleState: "TEST_CANDIDATE",
    maxExecutionAuthority: "EXPLICIT_EXTERNAL",
    license: "Proprietary",
    provenance: "external:github:gbro-collage",
    sourceUrl: "https://github.com/example/gbro-collage",
    modes: ["MARA"],
    capabilities: {
      actions: ["compile-collage-broll"],
      artifactTypes: ["collage-broll-video"],
      capabilityGaps: ["b-roll-generation"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_openmontage",
    name: "OpenMontage",
    type: "PRODUCTION_PIPELINE",
    lifecycleState: "AUDITED",
    maxExecutionAuthority: "SUGGEST",
    license: "MIT",
    provenance: "external:github:openmontage",
    sourceUrl: "https://github.com/example/openmontage",
    modes: ["MARA"],
    capabilities: {
      actions: ["compose-open-montage"],
      artifactTypes: ["montage-video"],
      capabilityGaps: ["montage-generation"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_awesome_claude_code_skills",
    name: "Awesome Claude Code Skills",
    type: "DISCOVERY_FEED",
    lifecycleState: "AUDITED",
    maxExecutionAuthority: "SUGGEST",
    license: "MIT",
    provenance: "external:github:awesome-claude",
    sourceUrl: "https://github.com/example/awesome-claude",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["discover-skills"],
      artifactTypes: ["skill-feed"],
      capabilityGaps: ["skill-discovery"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_helloianneo_ecosystem",
    name: "helloianneo ecosystem",
    type: "DISCOVERY_FEED",
    lifecycleState: "AUDITED",
    maxExecutionAuthority: "READ_ONLY",
    license: "MIT",
    provenance: "external:github:helloianneo",
    sourceUrl: "https://github.com/example/helloianneo",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["scan-ianneo-ecosystem"],
      artifactTypes: ["ecosystem-nodes"],
      capabilityGaps: ["ecosystem-discovery"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  },
  {
    id: "res_yummy_design_sprint",
    name: "Yummy Design Sprint",
    type: "DISCOVERY_FEED",
    lifecycleState: "CAPTURED",
    maxExecutionAuthority: "LOCAL_REVERSIBLE",
    license: "MIT",
    provenance: "internal:method:yummy-sprint",
    modes: ["DAY_CHALLENGE"],
    capabilities: {
      actions: ["run-rapid-design-sprint"],
      artifactTypes: ["rapid-sprint-backlog"],
      capabilityGaps: ["skill-discovery"],
      requiredAuthority: "SUGGEST"
    },
    activationRules: []
  }
]
