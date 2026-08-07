import type { ResourceMetadata } from "./types"

export const RESOURCE_REGISTRY: ResourceMetadata[] = [
  {
    id: "res_sacred_rules_breaker",
    name: "Sacred Rules Breaker",
    type: "CORE_METHOD",
    lifecycleState: "APPROVED",
    authorityCeiling: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:sacred-rules-breaker",
    modes: ["DAY_CHALLENGE"],
    capabilities: {
      actions: ["validate-rules-break"],
      artifactTypes: ["workflow-rules"],
      capabilityGaps: ["rules-governance"]
    },
    activationRules: [
      { requiredPhase: "verify", requiredTags: ["strict-governance"] }
    ],
    level2Data: {
      operationalInstructions: "Break rules only when safety parameters are satisfied."
    },
    level3Data: {
      providerManifest: { version: "1.0.0", executor: "local-evaluator" }
    }
  },
  {
    id: "res_somatic_response_design",
    name: "Somatic Response Design",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED",
    authorityCeiling: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:somatic-response",
    modes: ["DAY_CHALLENGE"],
    capabilities: {
      actions: ["evaluate-somatic-response"],
      artifactTypes: ["somatic-profile"],
      capabilityGaps: ["somatic-design"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Measure somatic user pulse during design interaction."
    },
    level3Data: {
      providerManifest: { sensor: "local" }
    }
  },
  {
    id: "res_relationship_preserving_abstraction",
    name: "Relationship-Preserving Abstraction",
    type: "CORE_METHOD",
    lifecycleState: "APPROVED",
    authorityCeiling: "PREPARE",
    license: "Apache-2.0",
    provenance: "internal:method:relationship-preserving-abstraction",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["abstract-relationships"],
      artifactTypes: ["data-privacy-model"],
      capabilityGaps: ["data-privacy"]
    },
    activationRules: [
      { requiredPhase: "publish", requiredEvaluator: "client" }
    ],
    level2Data: {
      operationalInstructions: "Keep entity connections without revealing identifiers."
    },
    level3Data: {
      providerManifest: { algorithm: "deterministic-mapping" }
    }
  },
  {
    id: "res_cognitive_metaphor_illustrator",
    name: "Cognitive Metaphor Illustrator",
    type: "CORE_METHOD",
    lifecycleState: "VALIDATED",
    authorityCeiling: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:cognitive-metaphor",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["illustrate-cognitive-metaphor"],
      artifactTypes: ["metaphor-illustration"],
      capabilityGaps: ["visual-metaphor"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Draft concepts as mental illustrations."
    },
    level3Data: {
      providerManifest: { renderMode: "svg" }
    }
  },
  {
    id: "res_physical_situation_storyboarder",
    name: "Physical Situation Storyboarder",
    type: "CORE_METHOD",
    lifecycleState: "APPROVED",
    authorityCeiling: "SUGGEST",
    license: "MIT",
    provenance: "internal:method:physical-storyboarder",
    modes: ["MARA"],
    capabilities: {
      actions: ["storyboard-physical-scene"],
      artifactTypes: ["cinematic-storyboard"],
      capabilityGaps: ["physical-space-mapping"]
    },
    activationRules: [
      { requiredPhase: "verify" }
    ],
    level2Data: {
      operationalInstructions: "Draw storyboard frames capturing physical limits."
    },
    level3Data: {
      providerManifest: { resolution: "16:9" }
    }
  },
  {
    id: "res_library_first_composition_router",
    name: "Library-First Composition Router",
    type: "CORE_METHOD",
    lifecycleState: "APPROVED",
    authorityCeiling: "PREPARE",
    license: "MIT",
    provenance: "internal:method:library-first-router",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["route-library-composition"],
      artifactTypes: ["composition-tree"],
      capabilityGaps: ["library-composition"]
    },
    activationRules: [
      { requiredPhase: "submit" }
    ],
    level2Data: {
      operationalInstructions: "Route composition packages in dependency order."
    },
    level3Data: {
      providerManifest: { packageManager: "npm" }
    }
  },
  {
    id: "res_ai_camera_movements",
    name: "AI Camera Movements",
    type: "PROVIDER",
    lifecycleState: "TEST_CANDIDATE",
    authorityCeiling: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:github:ai-camera-movements",
    sourceUrl: "https://github.com/example/ai-camera-movements",
    modes: ["MARA"],
    capabilities: {
      actions: ["generate-camera-path"],
      artifactTypes: ["camera-path-data"],
      capabilityGaps: ["ai-camera-movements"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Calculate camera trajectories automatically."
    },
    level3Data: {
      providerManifest: { apiEndpoint: "https://api.camera.ai" }
    }
  },
  {
    id: "res_cinematography_intelligence_layer",
    name: "Cinematography Intelligence Layer",
    type: "PROVIDER",
    lifecycleState: "TESTING",
    authorityCeiling: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:npm:cinematography-intelligence",
    sourceUrl: "https://npmjs.com/package/cinematography-intelligence",
    modes: ["MARA"],
    capabilities: {
      actions: ["analyze-shot-composition"],
      artifactTypes: ["cinematography-metrics"],
      capabilityGaps: ["cinematography-layer"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Assess color balance and focal length suitability."
    },
    level3Data: {
      providerManifest: { version: "2.1.0" }
    }
  },
  {
    id: "res_remocn",
    name: "Remocn",
    type: "PROVIDER",
    lifecycleState: "DEPRECATED",
    authorityCeiling: "PROHIBITED",
    license: "GPL-3.0",
    provenance: "external:github:remocn",
    sourceUrl: "https://github.com/example/remocn",
    modes: ["MARA"],
    capabilities: {
      actions: ["legacy-render"],
      artifactTypes: ["legacy-frame"],
      capabilityGaps: ["remocn-render"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Legacy renderer for backward compatibility."
    },
    level3Data: {
      providerManifest: { status: "deprecated" }
    }
  },
  {
    id: "res_originkit",
    name: "OriginKit",
    type: "PROVIDER",
    lifecycleState: "APPROVED",
    authorityCeiling: "READ_ONLY",
    license: "Apache-2.0",
    provenance: "external:github:originkit",
    sourceUrl: "https://github.com/example/originkit",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["bootstrap-originkit-asset"],
      artifactTypes: ["originkit-asset"],
      capabilityGaps: ["bootstrap-kit"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Extract foundational components."
    },
    level3Data: {
      providerManifest: { source: "git" }
    }
  },
  {
    id: "res_cineprompt",
    name: "CinePrompt",
    type: "PROVIDER",
    lifecycleState: "SUPERSEDED",
    authorityCeiling: "PROHIBITED",
    license: "Proprietary",
    provenance: "external:github:cineprompt",
    sourceUrl: "https://github.com/example/cineprompt",
    modes: ["MARA"],
    capabilities: {
      actions: ["prompt-camera-path"],
      artifactTypes: ["shotlist"],
      capabilityGaps: ["ai-camera-movements"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Generates prompts for camera rigs."
    },
    level3Data: {
      providerManifest: { replacedBy: "res_ai_camera_movements" }
    }
  },
  {
    id: "res_ai_world_builder",
    name: "AI World Builder",
    type: "PROVIDER",
    lifecycleState: "REJECTED",
    authorityCeiling: "PROHIBITED",
    license: "Proprietary",
    provenance: "external:github:ai-world-builder",
    sourceUrl: "https://github.com/example/ai-world-builder",
    modes: ["MARA"],
    capabilities: {
      actions: ["generate-3d-scene"],
      artifactTypes: ["3d-scene-model"],
      capabilityGaps: ["world-building"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Generates 3D models from descriptions."
    },
    level3Data: {
      providerManifest: { status: "unsafe" }
    }
  },
  {
    id: "res_open_kimi_ppt",
    name: "Open Kimi PPT",
    type: "DISCOVERY_FEED",
    lifecycleState: "CAPTURED",
    authorityCeiling: "READ_ONLY",
    license: "MIT",
    provenance: "external:github:open-kimi-ppt",
    sourceUrl: "https://github.com/example/open-kimi-ppt",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["scan-presentation-feeds"],
      artifactTypes: ["ppt-template"],
      capabilityGaps: ["ppt-generation"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Scrapes presentation slide feeds."
    },
    level3Data: {
      providerManifest: { query: "presentation" }
    }
  },
  {
    id: "res_tait_crt_interface_skill",
    name: "TaiT CRT Interface Skill",
    type: "SKILL",
    lifecycleState: "AUDITED",
    authorityCeiling: "READ_ONLY",
    license: "MIT",
    provenance: "external:github:tait-crt",
    sourceUrl: "https://github.com/example/tait-crt",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["render-crt-screen"],
      artifactTypes: ["crt-interface-layout"],
      capabilityGaps: ["crt-visualization"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Renders visual data with retro green phosphorus feel."
    },
    level3Data: {
      providerManifest: { color: "phosphor-green" }
    }
  },
  {
    id: "res_video_shotcraft",
    name: "Video Shotcraft",
    type: "PRODUCTION_PIPELINE",
    lifecycleState: "TEST_CANDIDATE",
    authorityCeiling: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:github:video-shotcraft",
    sourceUrl: "https://github.com/example/video-shotcraft",
    modes: ["MARA"],
    capabilities: {
      actions: ["process-video-draft"],
      artifactTypes: ["rough-cut-video"],
      capabilityGaps: ["video-editing"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Orchestrate raw footage compilation."
    },
    level3Data: {
      providerManifest: { codec: "h264" }
    }
  },
  {
    id: "res_gbro_collage_b_roll",
    name: "GBRO Collage B-roll",
    type: "PRODUCTION_PIPELINE",
    lifecycleState: "TESTING",
    authorityCeiling: "READ_ONLY",
    license: "Proprietary",
    provenance: "external:github:gbro-collage",
    sourceUrl: "https://github.com/example/gbro-collage",
    modes: ["MARA"],
    capabilities: {
      actions: ["compile-collage-broll"],
      artifactTypes: ["collage-broll-video"],
      capabilityGaps: ["b-roll-generation"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Assemble rapid-sequence montage clips."
    },
    level3Data: {
      providerManifest: { aspect: "16:9" }
    }
  },
  {
    id: "res_openmontage",
    name: "OpenMontage",
    type: "PRODUCTION_PIPELINE",
    lifecycleState: "APPROVED",
    authorityCeiling: "SUGGEST",
    license: "MIT",
    provenance: "external:github:openmontage",
    sourceUrl: "https://github.com/example/openmontage",
    modes: ["MARA"],
    capabilities: {
      actions: ["compose-open-montage"],
      artifactTypes: ["montage-video"],
      capabilityGaps: ["montage-generation"]
    },
    activationRules: [
      { requiredPhase: "verify" }
    ],
    level2Data: {
      operationalInstructions: "Assemble scenes using open-source timeline parameters."
    },
    level3Data: {
      providerManifest: { mode: "ffmpeg" }
    }
  },
  {
    id: "res_awesome_claude_code_skills",
    name: "Awesome Claude Code Skills",
    type: "SKILL",
    lifecycleState: "APPROVED",
    authorityCeiling: "SUGGEST",
    license: "MIT",
    provenance: "external:github:awesome-claude",
    sourceUrl: "https://github.com/example/awesome-claude",
    modes: ["HACKATHON"],
    capabilities: {
      actions: ["implement-claude-agent-code"],
      artifactTypes: ["autonomous-code-snippet"],
      capabilityGaps: ["code-generation"]
    },
    activationRules: [
      { requiredPhase: "submit" }
    ],
    level2Data: {
      operationalInstructions: "Inject high-performance assistant logic blocks."
    },
    level3Data: {
      providerManifest: { engine: "claude-v3.5" }
    }
  },
  {
    id: "res_helloianneo_ecosystem",
    name: "helloianneo ecosystem",
    type: "PROVIDER",
    lifecycleState: "CAPTURED",
    authorityCeiling: "READ_ONLY",
    license: "MIT",
    provenance: "external:github:helloianneo",
    sourceUrl: "https://github.com/example/helloianneo",
    modes: ["DATA_STORY"],
    capabilities: {
      actions: ["scan-ianneo-ecosystem"],
      artifactTypes: ["ecosystem-nodes"],
      capabilityGaps: ["ecosystem-discovery"]
    },
    activationRules: [],
    level2Data: {
      operationalInstructions: "Scans repository connectivity graphs."
    },
    level3Data: {
      providerManifest: { target: "ecosystem" }
    }
  },
  {
    id: "res_yummy_design_sprint",
    name: "Yummy Design Sprint",
    type: "CORE_METHOD",
    lifecycleState: "APPROVED",
    authorityCeiling: "LOCAL_REVERSIBLE",
    license: "MIT",
    provenance: "internal:method:yummy-sprint",
    modes: ["DAY_CHALLENGE"],
    capabilities: {
      actions: ["run-rapid-design-sprint"],
      artifactTypes: ["rapid-sprint-backlog"],
      capabilityGaps: ["rapid-prototyping"]
    },
    activationRules: [
      { requiredPhase: "verify" }
    ],
    level2Data: {
      operationalInstructions: "Plan 1-day collaborative sprints."
    },
    level3Data: {
      providerManifest: { participants: 5 }
    }
  }
]
