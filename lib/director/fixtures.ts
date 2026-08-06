import type { DirectorFixture, SkillMetadata } from "./types"

const baseSkills: SkillMetadata[] = [
  {
    skillId: "director-core-readonly",
    title: "Director Core Readonly",
    description: "Deterministic analysis and read-only director evaluation.",
    version: "1.0.0",
    provenance: "local-fixture",
    supportedModes: ["DAY_CHALLENGE", "HACKATHON", "MARA", "DATA_STORY"],
    supportedPhases: ["intake", "clarify", "route", "build", "verify", "review", "submit", "publish"],
    activationConditions: ["project available"],
    requiredInputs: ["canonical project", "authority context"],
    producedOutputs: ["director result"],
    dependencies: [],
    conflicts: [],
    authorityRequirement: "suggest",
    maturity: "approved",
    loadingPolicy: "metadata-first",
    sourcePaths: ["lib/director"],
    status: "available",
  },
]

export const directorFixtures: Record<string, DirectorFixture> = {
  "the-second-absence": {
    project: {
      id: "the-second-absence",
      slug: "the-second-absence",
      title: "The Second Absence",
      shortTitle: "Second Absence",
      description: "An premium observational campaign visualising customer-service accountability by transforming anonymous status notifications into a named responsible owner.",
      kind: "portfolio-case-study",
      status: "building",
      currentPhase: "build",
      completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept", "design", "prototype"],
      blockedPhases: [],
      nextRecommendedPhase: "build",
      priority: "high",
      createdLabel: "2026-08-01",
      updatedLabel: "2026-08-05",
      challenge: "Transforming anonymous resolution status into visible responsibility.",
      problem: "Institutional resolutions often lack human ownership, leaving customers frustrated by anonymous support loops.",
      audience: "General public and accountability advocates",
      primaryGoal: "Visualising human accountability by transforming anonymous status notifications into a named responsible owner.",
      successDefinition: "The customer sees a named accountable contact (Alex) and a clear callback promise for the £149 discrepancy.",
      constraints: [
        { id: "tsa_c1", type: "scope", description: "Visual reframe must use the premium observational campaign style." }
      ],
      stakeholders: [
        { id: "tsa_s1", label: "Marcus Aurelius", role: "Creative Director" }
      ],
      requirements: [
        { id: "tsa_r1", label: "Accountable contact display", description: "Show named support agent (Alex) with direct callback options.", priority: "critical" }
      ],
      evaluationCriteria: [
        { id: "tsa_ec1", label: "Accountability perception", description: "Measures stakeholder perception of human ownership.", weight: 0.8 }
      ],
      sourceLinks: [
        { id: "tsa_sl1", label: "Customer Complaint Brief", sourceType: "user-input", description: "The original customer support ticket highlighting the £149 dispute." }
      ],
      references: ["Human-centric campaign guidelines"],
      positioningStatement: "The Second Absence reframes customer-service disputes as a premium campaign about human responsibility.",
      tension: "Anonymous status versus human ownership.",
      memoryHook: "No One to Alex.",
      judgeMemorySentence: "An observational campaign exposing the missing human element in corporate support.",
      differentiation: "Focuses on explicit names and callback promises instead of ticket status numbers.",
      categoryClaim: "Accountability reframe.",
      alternatives: ["Standard status email notification", "Automated phone support line"],
      rejectedAngles: ["Security locking protocols", "Session loss warning reports"],
      visualDirection: "Sleek, minimalist editorial layouts. Warm cream backdrops, high-contrast typography, charcoal-black status indicators.",
      typographyDirection: "Sora for UI typography, Outfit for headings.",
      colorDirection: "Warm cream, charcoal black, alert orange.",
      layoutDirection: "Observational chronological timeline layout.",
      interactionDirection: "Collapsible status disclosure elements.",
      responsiveStrategy: "Responsive vertical timeline grids.",
      accessibilityStrategy: "High color contrast ratio.",
      designPrinciples: ["Ownership is personal, not institutional.", "Show the human behind the ticket."],
      antiPatterns: ["Vague 'Support Team' labels.", "Hiding callback promises."],
      rejectedDirections: ["Compliance token generators.", "transposition edition diffs."],
      primaryClaim: "Anonymous resolution transforms into a named accountable contact.",
      evidence: [
        {
          id: "tsa_ev1",
          label: "Accountability end frame review",
          claimSupported: "Anonymous resolution transforms into a named accountable contact.",
          type: "visual-proof",
          source: "Observational campaign timeline",
          strength: "direct",
          status: "available",
          routeOrFile: "components/second-absence/accountability.tsx",
          linkedDecisionId: "tsa_d1"
        }
      ],
      proofMoment: "The transitional screen showing ticket resolution changing to a personal callback card.",
      technicalProof: "Before/after status timeline comparison.",
      failureMode: "Unresolved £149 discrepancy remains hidden.",
      fallback: "Display default general support owner card.",
      unresolvedProofGaps: [],
      selectedRegistryIds: ["timeline", "typography"],
      selectedPlaybookIds: ["campaign-guidelines"],
      selectedReadingPathIds: [],
      selectedRecipeIds: [],
      architectureNotes: "Client-side static campaign display.",
      implementationConstraints: ["Static copy blocks representing £149 support dispute."],
      acceptanceCriteria: ["Timeline shows clear transition from 'Resolved' to 'Alex'."],
      technicalRisks: [],
      capturePlan: {
        states: [
          { id: "timeline-loaded", label: "Timeline Loaded", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Timeline showing ticket status.", notes: "Initial load" }
        ]
      },
      signatureStateId: "timeline-loaded",
      signatureFrame: 0,
      heroDemoMoment: "The institutional case changes from 'resolved' without ownership to a named accountable human with a callback promise.",
      cleanViewRoute: "/projects/the-second-absence?clean=true",
      restoreUrls: {},
      captureLimitations: [],
      videoPlan: {
        purpose: "Expose missing human ownership in corporate support.",
        audience: "Accountability advocates.",
        durationSeconds: 45,
        formats: ["16:9"],
        narrative: "How corporate tickets dehumanise customers, and how our reframe campaign rebuilds trust.",
        hook: "When tickets say resolved, who actually took responsibility?",
        scenes: ["Intro", "Dehumanisation", "The Alex Reframe"],
        proofMoments: ["Accountability end frame review"],
        shots: [],
        transitions: [],
        voiceover: "",
        subtitles: "",
        soundDirection: "",
        cta: "",
        outputVariants: [],
        missingAssets: [],
        captureDependencies: [],
        productionReadiness: "draft"
      },
      facts: [
        { id: "tsa_f1", label: "Complaint logs", description: "Represents customer-service transaction highlighting unresolved £149 discrepancy.", category: "context", phase: "intake" }
      ],
      assumptions: [],
      decisions: [
        {
          id: "tsa_d1",
          label: "Named owner display",
          description: "Explicitly display the name Alex and callback callback parameters directly on the success screen.",
          status: "approved",
          rationale: "Fosters instant connection and removes support anonymity.",
          alternativesConsidered: ["Generic avatar", "Department name"],
          evidenceIds: ["tsa_ev1"],
          source: "Creative strategist",
          phase: "prototype",
          reversible: true,
          impact: "medium"
        }
      ],
      rejections: [
        {
          id: "tsa_rej1",
          label: "Generic resolution message",
          reason: "Anonymous resolutions fail to build brand loyalty.",
          rejectedPhase: "concept",
          riskAvoided: "Customer churn",
          reconsiderCondition: "Never",
          source: "Executive producer"
        }
      ],
      risks: [],
      outputs: [],
      nextActions: [
        {
          id: "act-day-1",
          label: "Validate accountability reveal proof",
          description: "Verify the accountability reveal or continuity proof before final film assembly.",
          phase: "build",
          status: "todo",
        }
      ],
      learnings: [],
      openQuestions: [],
      blockedBy: [],
      auditResults: [],
      currentScore: 90,
      readiness: 90,
      blockers: [],
      warnings: [],
      publicationGate: true,
      submissionGate: false
    },
    mode: "DAY_CHALLENGE",
    phaseContext: "build",
    evaluationTimestamp: "2026-08-06T12:00:00Z",
    lockedDecisions: [],
    learningProposals: [],
    authorityContext: {
      authorityLevel: "suggest",
      requestedAction: "analyze",
      target: "the-second-absence",
      reversibility: "reversible",
      risk: "low",
      approvalRequirement: "none",
      grantedScope: ["analysis"],
      status: "granted",
    },
    availableSkills: baseSkills,
    evidence: [],
  },
  "cleanverse-build-round-2": {
    project: {
      id: "cleanverse-build-round-2",
      slug: "cleanverse-build-round-2",
      title: "Cleanverse Build Round 2",
      shortTitle: "Cleanverse Build",
      description: "A compliance-native financial verification system designed to provide judge-verifiable audit traces and asset state compliance checks.",
      kind: "hackathon",
      status: "verifying",
      currentPhase: "verify",
      completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept", "design", "prototype", "build"],
      blockedPhases: [],
      nextRecommendedPhase: "verify",
      priority: "high",
      createdLabel: "2026-08-02",
      updatedLabel: "2026-08-05",
      challenge: "Providing a judge-verifiable audit trace showing clean finance asset verification.",
      problem: "Hackathon judges need proof of protocol auditability and verification receipts to award compliance points.",
      audience: "Hackathon judges and protocol evaluators",
      primaryGoal: "Provide a judge-verifiable audit trace showing clean finance asset verification.",
      successDefinition: "Verify signed audit trace and output verification receipt with zero session loss warnings.",
      constraints: [
        { id: "cv_c1", type: "compliance", description: "Cryptographic signed receipt conforms to compliance-native finance protocols." }
      ],
      stakeholders: [
        { id: "cv_s1", label: "Judges Panel", role: "Sponsor Evaluators" }
      ],
      requirements: [
        { id: "cv_r1", label: "Verification receipt generator", description: "Must issue cryptographically signed state receipt on verification completion.", priority: "critical" }
      ],
      evaluationCriteria: [
        { id: "cv_ec1", label: "Verification auditability", description: "Ease of auditing signed state receipt.", weight: 0.9 }
      ],
      sourceLinks: [
        { id: "cv_sl1", label: "Sponsor API brief", sourceType: "registry", description: "The compliance protocol specifications required by sponsors." }
      ],
      references: ["Sponsor native submission guidelines"],
      positioningStatement: "Cleanverse Build is the compliance-first ledger verification engine built for judge evaluation.",
      tension: "Decentralised speed versus compliance auditability.",
      memoryHook: "Compliance-native verification.",
      judgeMemorySentence: "A protocol demo validating financial assets with a secure verification receipt.",
      differentiation: "Generates signed audit logs immediately upon block confirmation.",
      categoryClaim: "Financial protocol verification.",
      alternatives: ["Manual transaction auditing", "Off-chain verification databases"],
      rejectedAngles: ["Customer complaints campaign", "Support ticket reframe"],
      visualDirection: "Secure dashboard layout. Slate grey slate headers, emerald active indicators, monospace audit fields.",
      typographyDirection: "Monospace for audit keys, Inter for layout.",
      colorDirection: "Slate grey, emerald green, warning gold.",
      layoutDirection: "Structured ledger table grid.",
      interactionDirection: "Log expansion and signature check.",
      responsiveStrategy: "Stacking database columns.",
      accessibilityStrategy: "Aria table roles.",
      designPrinciples: ["Trust requires verifiability.", "Logs must be chronological and signed."],
      antiPatterns: ["Unsigned ledger edits.", "Hiding transaction history."],
      rejectedDirections: ["Productivity coaches.", "Editorial transposition codex."],
      primaryClaim: "Cryptographic audit logs are signed by verification key.",
      evidence: [
        {
          id: "cv_ev1",
          label: "Cleanverse verification receipt",
          claimSupported: "Cryptographic audit logs are signed by verification key.",
          type: "technical-proof",
          source: "Cleanverse verification ledger",
          strength: "direct",
          status: "available",
          routeOrFile: "components/cleanverse/audit-receipt.tsx",
          linkedDecisionId: "cv_d1"
        }
      ],
      proofMoment: "The successful production of a cryptographic verification receipt for the transaction ledger.",
      technicalProof: "Verifiable transaction signature verification.",
      failureMode: "Unhanded session loss warnings during compilation.",
      fallback: "Display offline cached verification stub.",
      unresolvedProofGaps: [],
      selectedRegistryIds: ["ledger", "tables"],
      selectedPlaybookIds: ["auditability-guidelines"],
      selectedReadingPathIds: [],
      selectedRecipeIds: [],
      architectureNotes: "Pure ledger verification interface.",
      implementationConstraints: ["Requires zero unhandled session loss warnings."],
      acceptanceCriteria: ["Ledger logs verify signature correctly."],
      technicalRisks: [],
      capturePlan: {
        states: [
          { id: "ledger-loaded", label: "Ledger Loaded", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Ledger displaying active transactions.", notes: "Initial load" }
        ]
      },
      signatureStateId: "ledger-loaded",
      signatureFrame: 0,
      heroDemoMoment: "Sponsor-native clean build asset verification and live audit receipt generation for judges.",
      cleanViewRoute: "/projects/cleanverse-build?clean=true",
      restoreUrls: {},
      captureLimitations: [],
      videoPlan: {
        purpose: "Demonstrate protocol compliance to judges.",
        audience: "Protocol evaluators.",
        durationSeconds: 50,
        formats: ["16:9"],
        narrative: "Why manual compliance fails, and how Cleanverse automates verification.",
        hook: "If it's not auditable, it's not compliant.",
        scenes: ["Intro", "Asset verification", "Signed receipt generation"],
        proofMoments: ["Cleanverse verification receipt"],
        shots: [],
        transitions: [],
        voiceover: "",
        subtitles: "",
        soundDirection: "",
        cta: "",
        outputVariants: [],
        missingAssets: [],
        captureDependencies: [],
        productionReadiness: "draft"
      },
      facts: [
        { id: "cv_f1", label: "Sponsor guidelines", description: "Verification receipt template matches hackathon rules.", category: "technical", phase: "intake" }
      ],
      assumptions: [],
      decisions: [
        {
          id: "cv_d1",
          label: "On-chain signature check",
          description: "Expose verification receipts directly on-screen to allow immediate judge auditing.",
          status: "approved",
          rationale: "Fulfills primary sponsor requirement directly in the first UI block.",
          alternativesConsidered: ["JSON download option", "Command-line logs"],
          evidenceIds: ["cv_ev1"],
          source: "Technical lead",
          phase: "prototype",
          reversible: true,
          impact: "high"
        }
      ],
      rejections: [
        {
          id: "cv_rej1",
          label: "Off-chain transaction cache",
          reason: "Off-chain cache breaks audit integrity requirements.",
          rejectedPhase: "concept",
          riskAvoided: "Disqualification",
          reconsiderCondition: "Never",
          source: "Sponsor rules"
        }
      ],
      risks: [],
      outputs: [],
      nextActions: [
        {
          id: "act-hackathon-1",
          label: "Resolve hackathon audit receipt blocker",
          description: "Resolve session reset loss warning and verify audit receipt generator for judge evaluation.",
          phase: "verify",
          status: "blocked",
        }
      ],
      learnings: [],
      openQuestions: [],
      blockedBy: [],
      auditResults: [],
      currentScore: 92,
      readiness: 92,
      blockers: ["Hackathon submission gate requires verified audit log proof and zero unhandled session loss warnings."],
      warnings: [],
      publicationGate: true,
      submissionGate: false
    },
    mode: "HACKATHON",
    phaseContext: "verify",
    evaluationTimestamp: "2026-08-06T12:00:00Z",
    lockedDecisions: [],
    learningProposals: [],
    authorityContext: {
      authorityLevel: "prepare",
      requestedAction: "prepare submission",
      target: "cleanverse-build-round-2",
      reversibility: "reversible",
      risk: "medium",
      approvalRequirement: "explicit",
      grantedScope: ["prepare"],
      status: "granted",
    },
    availableSkills: baseSkills,
    evidence: [],
  },
  "mara-episode": {
    project: {
      id: "mara-episode",
      slug: "mara-episode",
      title: "MARA Episode",
      shortTitle: "MARA Episode",
      description: "An episodic cinematic project focusing on the narrative and emotional continuity of Mara Keïta across complex wardrobe and environmental changes.",
      kind: "demo-film",
      status: "verifying",
      currentPhase: "verify",
      completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept", "design", "prototype", "build"],
      blockedPhases: [],
      nextRecommendedPhase: "retrospective",
      priority: "high",
      createdLabel: "2026-07-15",
      updatedLabel: "2026-08-05",
      challenge: "Verify emotional and wardrobe continuity for Mara Keita across all shot sequences.",
      problem: "Cinematic storytelling requires perfect wardrobe, environment, and emotional continuity to prevent breaking reader immersion.",
      audience: "Cinematic audience and creative stakeholders",
      primaryGoal: "Verify emotional and wardrobe continuity for Mara Keita across all shot sequences.",
      successDefinition: "Viewer recognizes emotional mirrors and wardrobe remains consistent across shots.",
      constraints: [
        { id: "mara_c1", type: "scope", description: "Narrative transitions must prioritize quiet acceptance over productivity cues." }
      ],
      stakeholders: [
        { id: "mara_s1", label: "Mara Keïta", role: "Protagonist" }
      ],
      requirements: [
        { id: "mara_r1", label: "Wardrobe continuity review", description: "Ensure wardrobe details remain consistent between shot cuts.", priority: "high" }
      ],
      evaluationCriteria: [
        { id: "mara_ec1", label: "Emotional authenticity", description: "Measures reader empathy with Mara's narrative beat.", weight: 0.7 }
      ],
      sourceLinks: [
        { id: "mara_sl1", label: "Storyboards draft", sourceType: "project-file", description: "The storyboard layout listing character states." }
      ],
      references: ["Episode state card guidelines"],
      positioningStatement: "MARA Episode captures quiet moments of acceptance, avoiding traditional achievement tropes.",
      tension: "Productivity expectations versus emotional authenticity.",
      memoryHook: "Emotional truth over product proof.",
      judgeMemorySentence: "A cinematic character study highlighting quiet human complexity.",
      differentiation: "Avoids generic action-hero tropes in favor of quiet, observational continuity.",
      categoryClaim: "Episodic storytelling.",
      alternatives: ["Generic corporate branding film", "High-paced product ad"],
      rejectedAngles: ["Classical orchestral research", "Cryptographic proof systems"],
      visualDirection: "Warm, cinematic lighting. Natural wood overlays, muted earth tones, soft highlights.",
      typographyDirection: "Serif for credits, Inter for workspace layout.",
      colorDirection: "Warm ochre, forest green, deep earth shadows.",
      layoutDirection: "Widescreen frame sequence.",
      interactionDirection: "Horizontal sequence scrubbers.",
      responsiveStrategy: "Letterboxed aspect ratio layouts.",
      accessibilityStrategy: "Full audio descriptions.",
      designPrinciples: ["Quietness builds connection.", "Immersion requires uninterrupted continuity."],
      antiPatterns: ["Faux action sequences.", "Inconsistent wardrobe colors."],
      rejectedDirections: ["Quantitative metric tables.", "Service scaling checklists."],
      primaryClaim: "Mara allows task to remain unfinished expressing acceptance theme.",
      evidence: [
        {
          id: "mara_ev1",
          label: "Continuity safe hero frame",
          claimSupported: "Mara allows task to remain unfinished expressing acceptance theme.",
          type: "visual-proof",
          source: "MARA episode timeline review",
          strength: "direct",
          status: "available",
          routeOrFile: "components/mara/continuity-review.tsx",
          linkedDecisionId: "mara_d1"
        }
      ],
      proofMoment: "The quiet frame of Mara sitting in the office space with an unfinished task list.",
      technicalProof: "Shot-to-shot wardrobe color match validation.",
      failureMode: "Productivity performance markers break the quiet theme.",
      fallback: "Display default bedroom shot.",
      unresolvedProofGaps: [],
      selectedRegistryIds: ["frames", "grids"],
      selectedPlaybookIds: ["cinematography-guidelines"],
      selectedReadingPathIds: [],
      selectedRecipeIds: [],
      architectureNotes: "Episodic frame review.",
      implementationConstraints: ["Muted color guidelines only."],
      acceptanceCriteria: ["Shot timeline matches wardrobe schema exactly."],
      technicalRisks: [],
      capturePlan: {
        states: [
          { id: "sequence-loaded", label: "Sequence Loaded", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Cinematic shot layout active.", notes: "Initial load" }
        ]
      },
      signatureStateId: "sequence-loaded",
      signatureFrame: 0,
      heroDemoMoment: "Mara stops performing productivity and allows one unfinished task to remain visible without correcting it.",
      cleanViewRoute: "/projects/mara-episode?clean=true",
      restoreUrls: {},
      captureLimitations: [],
      videoPlan: {
        purpose: "Review narrative beats with director.",
        audience: "Creative stakeholders.",
        durationSeconds: 40,
        formats: ["16:9"],
        narrative: "How cinematic continuity reinforces the central emotional reframe.",
        hook: "When nothing happens, everything changes.",
        scenes: ["Intro", "The Unfinished Task", "Silence"],
        proofMoments: ["Continuity safe hero frame"],
        shots: [],
        transitions: [],
        voiceover: "",
        subtitles: "",
        soundDirection: "",
        cta: "",
        outputVariants: [],
        missingAssets: [],
        captureDependencies: [],
        productionReadiness: "draft"
      },
      facts: [
        { id: "mara_f1", label: "Scene layout", description: "Defines location and environment properties for sequence cuts.", category: "context", phase: "intake" }
      ],
      assumptions: [],
      decisions: [
        {
          id: "mara_d1",
          label: "Incomplete task presentation",
          description: "Allow the final task list to display one uncompleted checkbox explicitly on screen.",
          status: "approved",
          rationale: "Aligns with the theme of quiet acceptance.",
          alternativesConsidered: ["Fully cleared list", "Hide the task list entirely"],
          evidenceIds: ["mara_ev1"],
          source: "Film director",
          phase: "prototype",
          reversible: true,
          impact: "high"
        }
      ],
      rejections: [
        {
          id: "mara_rej1",
          label: "Upbeat background score",
          reason: "Fast upbeat audio conflicts with the quiet pacing.",
          rejectedPhase: "concept",
          riskAvoided: "Narrative break",
          reconsiderCondition: "Never",
          source: "Sound designer"
        }
      ],
      risks: [],
      outputs: [],
      nextActions: [
        {
          id: "act-mara-1",
          label: "Validate episode continuity proof",
          description: "Verify the episode's emotional and visual continuity before final sequence assembly.",
          phase: "verify",
          status: "todo",
        }
      ],
      learnings: [],
      openQuestions: [],
      blockedBy: [],
      auditResults: [],
      currentScore: 94,
      readiness: 94,
      blockers: [],
      warnings: [],
      publicationGate: true,
      submissionGate: false
    },
    mode: "MARA",
    phaseContext: "verify",
    evaluationTimestamp: "2026-08-06T12:00:00Z",
    lockedDecisions: [],
    learningProposals: [],
    authorityContext: {
      authorityLevel: "suggest",
      requestedAction: "review continuity",
      target: "mara-episode",
      reversibility: "reversible",
      risk: "low",
      approvalRequirement: "none",
      grantedScope: ["analysis"],
      status: "granted",
    },
    availableSkills: baseSkills,
    evidence: [],
  },
  "power-bi-service-performance": {
    project: {
      id: "power-bi-service-performance",
      slug: "power-bi-service-performance",
      title: "Power BI Service Performance",
      shortTitle: "Power BI Service",
      description: "An interactive data story visualising the relationship between monthly service metrics, answered versus abandoned calls, and operational performance levers.",
      kind: "data-story",
      status: "verifying",
      currentPhase: "verify",
      completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept", "design", "prototype", "build"],
      blockedPhases: [],
      nextRecommendedPhase: "audit",
      priority: "medium",
      createdLabel: "2026-07-20",
      updatedLabel: "2026-07-25",
      challenge: "Providing stakeholders with clear, evidence-backed visual proof of monthly call center performance trends.",
      problem: "Stakeholders make incorrect service scaling decisions because raw monthly service metrics hide the critical relationship between answered and abandoned calls.",
      audience: "Operational stakeholders and business leaders",
      primaryGoal: "Providing stakeholders with clear, evidence-backed visual proof of monthly call center performance trends.",
      successDefinition: "Stakeholders can instantly locate the primary operational performance irritant and the positive metric signal.",
      constraints: [
        { id: "ds_c1", type: "technical", description: "Dashboard rendering must use pure SVG shapes without external database dependencies." }
      ],
      stakeholders: [
        { id: "ds_s1", label: "John Carter", role: "Director of Operations" }
      ],
      requirements: [
        { id: "ds_r1", label: "Interactive call metrics chart", description: "Plot answered and abandoned calls side-by-side with interactive tooltips.", priority: "high" }
      ],
      evaluationCriteria: [
        { id: "ds_ec1", label: "Stakeholder decision speed", description: "Measures the time taken to identify performance irritants.", weight: 0.5 }
      ],
      sourceLinks: [
        { id: "ds_sl1", label: "Operational Call Logs", sourceType: "project-file", description: "The raw CSV log file containing weekly performance metrics." }
      ],
      references: ["Call Center Performance Standards", "Data Storytelling best practices"],
      positioningStatement: "Power BI Service Performance is the decision-ready visual report that clarifies resource allocation before budget cycles begin.",
      tension: "Raw metrics complexity vs. clear resource decisions.",
      memoryHook: "See the service trend behind the numbers.",
      judgeMemorySentence: "An executive performance dashboard revealing answered and abandoned call performance trends.",
      differentiation: "Unlike general dashboards, this highlights resource gaps directly.",
      categoryClaim: "Operational performance analysis.",
      alternatives: ["Static Excel spreadsheets", "Generic Power BI dashboards"],
      rejectedAngles: ["Real-time database integration", "AI-based forecasting projections"],
      visualDirection: "Sleek, administrative dashboard styling. Cool stone backgrounds, graphite borders, cyan active indicators, discrete emerald metrics.",
      typographyDirection: "Inter for UI controls, Satoshi for metric numbers.",
      colorDirection: "Slate grey, graphite charcoal, cyan metric lines.",
      layoutDirection: "Executive executive workspace grid format.",
      interactionDirection: "Metric range selectors, tooltip details.",
      responsiveStrategy: "Metrics stack on mobile.",
      accessibilityStrategy: "Screen reader vocalises active metrics values.",
      designPrinciples: ["Decisions require clarity, not noise.", "Data must tell a story."],
      antiPatterns: ["Faux loading animations.", "Overcrowded charts."],
      rejectedDirections: ["Gamified badges.", "Playful fonts."],
      primaryClaim: "The visual SVG performance chart reveals a clear relationship between response times and satisfaction levels.",
      evidence: [
        {
          id: "ds_ev1",
          label: "Answered versus abandoned call trend data",
          claimSupported: "The visual SVG performance chart reveals a clear relationship between response times and satisfaction levels.",
          type: "technical-proof",
          source: "Operational call center logs",
          strength: "direct",
          status: "available",
          routeOrFile: "components/datastory/call-metrics.tsx",
          linkedDecisionId: "ds_d1"
        }
      ],
      proofMoment: "The transition from raw data tables to visual SVG charts displaying call center satisfaction peaks.",
      technicalProof: "SVG side-by-side metric overlay plotting trend lines.",
      failureMode: "Metrics filter invalid or unselected.",
      fallback: "Display default weekly average composite chart.",
      unresolvedProofGaps: [],
      selectedRegistryIds: ["kinetic-text", "layouts", "typography"],
      selectedPlaybookIds: ["system-principles", "color-system", "controlled-visual-risk"],
      selectedReadingPathIds: ["win-first-five-seconds"],
      selectedRecipeIds: ["data-story-recipe"],
      architectureNotes: "Uses pure client-side SVG plotting.",
      implementationConstraints: ["Offline static dataset stubs only."],
      acceptanceCriteria: ["Chart plots trends accurately.", "Metrics details display on hover."],
      technicalRisks: [],
      capturePlan: {
        states: [
          { id: "dashboard-loaded", label: "Dashboard Loaded", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Slate dashboard with summary cards.", notes: "Initial load" }
        ]
      },
      signatureStateId: "dashboard-loaded",
      signatureFrame: 0,
      heroDemoMoment: "Analyzed the trend of answered versus abandoned calls to pinpoint the primary irritant for operational scaling.",
      cleanViewRoute: "/projects/power-bi-service-performance?clean=true",
      restoreUrls: {},
      captureLimitations: [],
      videoPlan: {
        purpose: "Expose operational resource gaps to business leaders.",
        audience: "Operational stakeholders.",
        durationSeconds: 60,
        formats: ["16:9"],
        narrative: "Why raw call logs hide key resource insights, and how our interactive data story visualises the solution.",
        hook: "Numbers lie when they hide relationships.",
        scenes: ["Intro", "The Chart Reveal", "Resource Decision"],
        proofMoments: ["Interactive call metrics chart"],
        shots: [],
        transitions: [],
        voiceover: "",
        subtitles: "",
        soundDirection: "",
        cta: "",
        outputVariants: [],
        missingAssets: [],
        captureDependencies: [],
        productionReadiness: "draft"
      },
      facts: [
        { id: "ds_f1", label: "Static performance logs", description: "Historical data stubs represent a typical high-volume operational week.", category: "technical", phase: "intake" }
      ],
      assumptions: [],
      decisions: [
        {
          id: "ds_d1",
          label: "Static SVG rendering",
          description: "Use inline SVG elements to plot call metrics for zero-latency loading.",
          status: "approved",
          rationale: "Guarantees offline reliability during executive pitches.",
          alternativesConsidered: ["Highcharts library", "Static images"],
          evidenceIds: ["ds_ev1"],
          source: "Technical architect",
          phase: "prototype",
          reversible: true,
          impact: "medium"
        }
      ],
      rejections: [
        {
          id: "ds_rej1",
          label: "Real-time database integration",
          reason: "Real-time DB updates are out of scope for static storytelling.",
          rejectedPhase: "concept",
          riskAvoided: "Scope creep",
          reconsiderCondition: "If backend budget is allocated",
          source: "Stakeholder brief"
        }
      ],
      risks: [],
      outputs: [],
      nextActions: [
        {
          id: "act-datastory-1",
          label: "Validate Power BI metric evidence",
          description: "Validate controlling SVG performance metric evidence and clarify stakeholder decision criteria.",
          phase: "verify",
          status: "todo",
        }
      ],
      learnings: [],
      openQuestions: [],
      blockedBy: [],
      auditResults: [],
      currentScore: 95,
      readiness: 95,
      blockers: [],
      warnings: [],
      publicationGate: true,
      submissionGate: false
    },
    mode: "DATA_STORY",
    phaseContext: "verify",
    evaluationTimestamp: "2026-08-06T12:00:00Z",
    lockedDecisions: [],
    learningProposals: [],
    authorityContext: {
      authorityLevel: "suggest",
      requestedAction: "inspect metric evidence",
      target: "power-bi-service-performance",
      reversibility: "reversible",
      risk: "low",
      approvalRequirement: "none",
      grantedScope: ["analysis"],
      status: "granted",
    },
    availableSkills: baseSkills,
    evidence: [],
  },
}
