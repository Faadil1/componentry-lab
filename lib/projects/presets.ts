// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Presets (3 Sample Projects)
// ─────────────────────────────────────────────────────────────

import type { ProjectBrain } from "./types"

export const projectPresets: ProjectBrain[] = [
  // ── 1. STATED — RESEARCH COMMITMENT SYSTEM ───────────────────
  {
    id: "stated",
    slug: "stated-research-commitment",
    title: "Stated — Research Commitment System",
    shortTitle: "Stated",
    description: "An evidence-locking product prototype designed to eliminate confirmation bias by forcing researchers to lock their commitments before revealing technical proof.",
    kind: "product-prototype",
    status: "building",
    currentPhase: "build",
    completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept", "design", "prototype"],
    blockedPhases: [],
    nextRecommendedPhase: "verify",
    priority: "high",
    createdLabel: "2026-07-01",
    updatedLabel: "2026-07-25",
    challenge: "Ensure scientific integrity and deterministic evidence audits.",
    deadlineLabel: "2026-08-15",

    // CONTEXT
    problem: "Researchers selectively choose evidence to support their existing assumptions, leading to unscientific confirmation bias.",
    audience: "UX researchers, laboratory auditors, data scientists",
    primaryGoal: "Forcing commitment verification prior to technical evidence disclosure.",
    successDefinition: "100% of audits are verifiable, with 0% post-facto commitment alteration.",
    constraints: [
      { id: "c1", type: "technical", description: "Immutable client-side lock state with server-side validation stubs." },
      { id: "c2", type: "compliance", description: "Audit logs must adhere to cryptographic verification patterns." }
    ],
    stakeholders: [
      { id: "s1", label: "Dr. Sarah Miller", role: "Principal Investigator" }
    ],
    requirements: [
      { id: "r1", label: "Server verification", description: "Server must sign commitment hashes before revealing underlying data.", priority: "high" }
    ],
    evaluationCriteria: [
      { id: "ec1", label: "Tamper resistance", description: "Verifies that commitment logs cannot be modified retroactively.", weight: 0.6 },
      { id: "ec2", label: "Auditor clarity", description: "Ensures the dashboard presents clear cryptographic proof details.", weight: 0.4 }
    ],
    sourceLinks: [
      { id: "sl1", label: "Initial Brief", sourceType: "user-input", description: "User constraints regarding researchers behavior." }
    ],
    references: ["Double-blind research protocols", "ZK-proof commitments principles"],

    // POSITIONING
    positioningStatement: "Stated is the only commitment-first research system that guarantees research integrity by locking assertions before revealing observations.",
    tension: "Honest hypotheses vs. retrospective data alignment.",
    memoryHook: "Commit before you know.",
    judgeMemorySentence: "A research platform that locks your guess before showing the truth.",
    differentiation: "Unlike standard notebook interfaces that allow post-hoc edits, Stated locks the inputs mathematically.",
    categoryClaim: "Scientific proof management systems.",
    alternatives: ["Jupyter Notebooks", "Notion research logs"],
    rejectedAngles: ["Gamified research logs", "Simple data dashboards"],

    // DESIGN
    visualDirection: "Sleek, industrial clinical laboratory look. Ivory backgrounds, graphite borders, cyan indicators for active locks, discrete emerald approval markers.",
    typographyDirection: "Monospace font for hashes and receipts (Geist Mono), clean grotesque for controls (Satoshi).",
    colorDirection: "Stone and Mineral base tones. Cyan #06b6d4 for commitment locks.",
    layoutDirection: "Two-column split view layout: Left column contains the commitment input and lock trigger, right column contains the evidence board.",
    interactionDirection: "Verbal click action on Switchyard levers to lock commitments. Progressive disclosure animation.",
    responsiveStrategy: "Responsive stack structure. Left column wraps above Right column on mobile with lock state banner.",
    accessibilityStrategy: "Aria-live announcements for state change ('Commitment Locked'). High contrast 7:1 ratio on monochrome receipts.",
    designPrinciples: ["Structure first, beauty second.", "Proof must be irreversible and visual."],
    antiPatterns: ["Faux locking animations.", "Editable logs."],
    rejectedDirections: ["Neon dark-mode theme.", "Colorful gradients."],

    // PROOF
    primaryClaim: "Evidence remains cryptographically locked until the user locks their hypothesis commitment.",
    evidence: [
      {
        id: "ev1",
        label: "Commitment hash audit receipt",
        claimSupported: "Evidence remains cryptographically locked until hypothesis commitment is locked.",
        type: "technical-proof",
        source: "Audit ledger validation output",
        strength: "direct",
        status: "available",
        routeOrFile: "components/stated/receipt-ledger.tsx",
        linkedDecisionId: "d1"
      }
    ],
    proofMoment: "The transition from 'Locked Case' to 'Evidence Revealed' through a server-signed receipt.",
    technicalProof: "Verifiable hash signatures printed on the final receipt overlay.",
    failureMode: "Commitment not provided before accessing direct links.",
    fallback: "Graceful access blocking with 'Hypothesis Required' verdict.",
    unresolvedProofGaps: ["Offline verification mode validation."],

    // BUILD
    selectedRegistryIds: ["decision-systems", "evidence-ledger", "capture-bridge", "layout-split"],
    selectedPlaybookIds: ["system-principles", "evidence-cards", "proof-moment-pattern", "hackathon-evidence", "hackathon-audit"],
    selectedReadingPathIds: ["win-first-five-seconds", "make-proof-visible"],
    selectedRecipeIds: ["operational-workspace"],
    architectureNotes: "Uses a clean unidirectional flow context. The locking lever sets the state on a server-validated mock hook.",
    implementationConstraints: ["Zero network requirements — stubs only."],
    acceptanceCriteria: ["Lock state must be irreversible without full workspace reset.", "Receipt prints hash, order, and client validation signature."],
    technicalRisks: ["Browser reload loss (session-only warning must be visible)."],

    // CAPTURE
    capturePlan: {
      states: [
        { id: "case-loaded", label: "Case Loaded", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Blank case brief visible with Locked hypothesis field.", notes: "Initial step." },
        { id: "commitment-written", label: "Commitment Written", time: 1.5, frame: 45, stateType: "intermediate", isCapturePoint: true, expectedVisualResult: "User writes hypothesis, lock lever becomes active.", notes: "Text entered." },
        { id: "commitment-locked", label: "Commitment Locked", time: 2.5, frame: 75, stateType: "signature", isCapturePoint: true, expectedVisualResult: "Lever switched, screen flashes cyan, status becomes LOCKED.", notes: "VERDICT: LOCKED." },
        { id: "evidence-revealed", label: "Evidence Revealed", time: 4.0, frame: 120, stateType: "evidence", isCapturePoint: true, expectedVisualResult: "Verifiable evidence card renders, hashes matched.", notes: "VERDICT: REVEALED." },
        { id: "interpretation-complete", label: "Interpretation Complete", time: 5.5, frame: 165, stateType: "result", isCapturePoint: true, expectedVisualResult: "User logs evaluation notes.", notes: "Draft saved." },
        { id: "audit-complete", label: "Audit Complete", time: 7.0, frame: 210, stateType: "result", isCapturePoint: true, expectedVisualResult: "Final receipt printed with SHA-256 verification code.", notes: "Receipt visible." }
      ]
    },
    signatureStateId: "commitment-locked",
    signatureFrame: 75,
    heroDemoMoment: "Switched locking lever to cryptographically secure the hypothesis prior to viewing results.",
    cleanViewRoute: "/projects/stated?clean=true",
    restoreUrls: {
      initial: "/projects/stated?step=1",
      locked: "/projects/stated?step=3",
      complete: "/projects/stated?step=6"
    },
    captureLimitations: ["Requires local execution thread, Remotion wrapper is not configured."],

    // VIDEO
    videoPlan: {
      purpose: "Demonstrate scientific integrity validation to hackathon judges.",
      audience: "Hackathon judges and potential research sponsors.",
      durationSeconds: 90,
      formats: ["16:9", "9:16"],
      narrative: "How confirmation bias ruins UX research, and how Stated forces objectivity through design.",
      hook: "Scientists are human. We selectively find what we already believe.",
      scenes: ["Problem statement", "Intake and Hypothesis", "The Lock Moment", "Evidence Reveal", "Receipt Verification"],
      proofMoments: ["Commitment locked receipt", "Tamper-proof hash display"],
      transitions: ["Clean cuts", "Cyan signal flash for lock"],
      voiceover: "We're building Stated to bring truth back to research. See how this commitment mechanism locks...",
      subtitles: "FR/EN bilingual subtitles available.",
      soundDirection: "Minimal atmospheric drone, high mechanical click for lock moment.",
      cta: "Try Stated live or check the open source proof system.",
      outputVariants: ["Full trailer", "Short brag teaser"],
      missingAssets: ["Final audio voiceover mix"],
      captureDependencies: ["case-loaded", "commitment-locked", "evidence-revealed", "audit-complete"],
      productionReadiness: "ready",
      shots: [
        {
          id: "shot1",
          order: 1,
          label: "Intro & Problem",
          purpose: "Hook the viewer with bias problem",
          sourceRoute: "/projects/stated",
          captureState: "case-loaded",
          duration: 15,
          screenAction: "Cursor hovers over disabled evidence cards",
          overlay: "CONFIRMATION BIAS IS RUINING RESEARCH",
          voiceover: "We read what we want. We see what we wish.",
          proofShown: "Disabled evidence state",
          transition: "fade",
          fallback: "Static card view"
        },
        {
          id: "shot2",
          order: 2,
          label: "The Hypothesis Lock",
          purpose: "Show the commitment action",
          sourceRoute: "/projects/stated",
          captureState: "commitment-locked",
          duration: 30,
          screenAction: "User types a hypothesis and drags the lock lever",
          overlay: "COMMITMENT VERIFIED & LOCKED",
          voiceover: "But what if you had to lock your claim first?",
          proofShown: "Active cyan lock state and receipt generation",
          transition: "cut",
          fallback: "Pre-rendered locked screen"
        }
      ]
    },

    // STATE
    facts: [
      { id: "f1", label: "Local stubs", description: "System has no remote backend; all audits are processed client-side.", category: "technical", phase: "intake" },
      { id: "f2", label: "Deterministic hashing", description: "Audit receipts use SHA-256 for integrity verification.", category: "technical", phase: "concept" }
    ],
    assumptions: [
      { id: "a1", label: "Lever usability", description: "Users understand the drag-lock gesture immediately without onboarding.", status: "unresolved", validationCriteria: "Observe 5 users during demo run." }
    ],
    decisions: [
      {
        id: "d1",
        label: "Client-side crypto mock",
        description: "Generate mock hashes locally instead of executing full WebCrypto in worker to preserve performance.",
        status: "approved",
        rationale: "Speed and dependency avoidance are vital in hackathons.",
        alternativesConsidered: ["WebCrypto API in Web Worker", "Server-side hashing stub"],
        evidenceIds: ["f1"],
        source: "Hackathon Guidelines",
        phase: "prototype",
        reversible: true,
        impact: "medium"
      }
    ],
    rejections: [
      {
        id: "rej1",
        label: "Editable log entries",
        reason: "Allowing post-lock edits violates the core tenant of commitment-first research.",
        rejectedPhase: "concept",
        riskAvoided: "Confirmation bias reintroduction",
        reconsiderCondition: "Never",
        source: "Principal feedback"
      }
    ],
    risks: [
      { id: "risk1", label: "Session Reset Loss", description: "Users lose their audit trace on reload because there is no DB.", severity: "medium", probability: "high", mitigationStrategy: "Provide explicit JSON export CTA.", status: "open" }
    ],
    outputs: [
      { id: "out1", label: "Lock mechanism component", description: "The Switchyard drag-lever component.", format: "code", phase: "build", status: "completed", filepath: "components/stated/lock-lever.tsx" }
    ],
    nextActions: [
      { id: "act1", label: "Integrate Audit Panel", description: "Add the receipt download button to the final state.", phase: "verify", status: "todo" }
    ],
    learnings: [
      { id: "lrn1", label: "Determinisitc video flows", description: "Scripting components via capture states makes Remotion rendering 100% stable.", impactArea: "Video Production" }
    ],
    openQuestions: ["Should the receipt also show local computer hardware markers?"],
    blockedBy: [],

    // AUDIT
    auditResults: [
      { id: "ar1", label: "Unique slugs verified", passed: true, consequence: "Static generation will succeed.", severity: "info" },
      { id: "ar2", label: "No external call detected", passed: true, consequence: "App is offline-safe.", severity: "info" }
    ],
    currentScore: 85,
    readiness: 85,
    blockers: [],
    warnings: ["Unresolved assumptions regarding lever gesture usability."],
    publicationGate: true,
    submissionGate: true
  },

  // ── 2. GLOW ATELIER HAIR — LOCAL SERVICE WORKFLOW ────────────
  {
    id: "glow-atelier",
    slug: "glow-atelier-hair-workflow",
    title: "Glow Atelier Hair — Local Service Workflow",
    shortTitle: "Glow Atelier",
    description: "A customer wig customization request manager designed to streamline measurements, quote approvals, and Square invoice workflows for Gatineau-Ottawa residents.",
    kind: "client-product",
    status: "designing",
    currentPhase: "design",
    completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept"],
    blockedPhases: [],
    nextRecommendedPhase: "prototype",
    priority: "medium",
    createdLabel: "2026-07-10",
    updatedLabel: "2026-07-24",
    client: "Glow Atelier Hair Inc.",
    challenge: "Translate visual hair preferences and measurements into clear technical order sheets.",
    deadlineLabel: "2026-09-01",

    // CONTEXT
    problem: "Scattered Instagram direct messages and text messages lead to missing measurements and incorrect product specifications.",
    audience: "Local boutique customers, salon technicians, boutique owner",
    primaryGoal: "Provide a bilingual structured intake with traceable measurement guides.",
    successDefinition: "95% of orders submitted contain complete, valid head measurements.",
    constraints: [
      { id: "g_c1", type: "budget", description: "Small boutique owner, zero server hosting costs preferred." },
      { id: "g_c2", type: "compliance", description: "Customer photos must not be stored on public repos." }
    ],
    stakeholders: [
      { id: "g_s1", label: "Mélanie Tremblay", role: "Boutique Owner & Wig Stylist" }
    ],
    requirements: [
      { id: "g_r1", label: "Bilingual intake", description: "Must support French and English fluently.", priority: "critical" },
      { id: "g_r2", label: "Timeline tracking", description: "Customers need a simple status tracking link.", priority: "high" }
    ],
    evaluationCriteria: [
      { id: "g_ec1", label: "Customer intake completion rate", description: "Measures the percentage of users completing all measurements.", weight: 0.7 },
      { id: "g_ec2", label: "Square invoice reconciliation speed", description: "Verifies the delay between submit and final payment invoice receipt.", weight: 0.3 }
    ],
    sourceLinks: [
      { id: "g_sl1", label: "Client Interview Notes", sourceType: "user-input", description: "Boutique requirements for invoicing and measurement guides." }
    ],
    references: ["Standard head measurements system guidelines", "Square invoicing integration API docs"],

    // POSITIONING
    positioningStatement: "Glow Atelier is the dedicated wig consultation workspace that turns vague messages into exact measurements and approved invoices in one place.",
    tension: "Vague fashion descriptors vs. exact wig construction specifications.",
    memoryHook: "From scattered messages to one traceable request.",
    judgeMemorySentence: "A boutique booking flow that secures wig measurements before client deposit.",
    differentiation: "Unlike general booking apps, Glow Atelier has interactive wig sizing visual tutorials built in.",
    categoryClaim: "Custom local beauty services intake.",
    alternatives: ["Instagram DMs + email", "Shopify custom forms"],
    rejectedAngles: ["Full automated AI stylist advice", "Global marketplace platform"],

    // DESIGN
    visualDirection: "Warm, premium editor feel. Soft ivory background (#faf9f6), dark stone text, rose gold or soft sand accents. Elegant editorial serif typography.",
    typographyDirection: "Serif for titles (Instrument Serif), warm sans-serif for UI forms (Manrope).",
    colorDirection: "Warm ivory (#faf9f6), rose gold accent (#d4af37), charcoal stone (#2c2a29).",
    layoutDirection: "Single page layout with collapsible progressive stages.",
    interactionDirection: "Interactive measurement fields showing highlighted lines on a head model when selected.",
    responsiveStrategy: "Fluid mobile stacking. Sizing tables collapse into interactive slides.",
    accessibilityStrategy: "High contrast inputs with explicit label associations. Zoom 200% compatible forms.",
    designPrinciples: ["Premium is readable.", "Customer confidence depends on visual clarity."],
    antiPatterns: ["Bland SaaS grids.", "Hidden step indicators."],
    rejectedDirections: ["Neon cyber elements.", "Cold corporate blue palettes."],

    // PROOF
    primaryClaim: "Complete, valid measurements must be entered before generating quote or invoicing status.",
    evidence: [
      {
        id: "g_ev1",
        label: "Bilingual size validation check",
        claimSupported: "Complete, valid measurements must be entered before generating quote or invoicing status.",
        type: "user-research",
        source: "Client intake size validator function",
        strength: "direct",
        status: "available",
        routeOrFile: "components/glow-atelier/size-validator.ts",
        linkedDecisionId: "g_d1"
      }
    ],
    proofMoment: "The validation block when size fields are left blank, preventing customer request submission.",
    technicalProof: "Bilingual confirmation receipts with size data and client status timestamps.",
    failureMode: "Incomplete sizing fields on submit.",
    fallback: "Inline highlighting of missing measurements with helper tutorial guides.",
    unresolvedProofGaps: ["Offline customer photo resizing optimization."],

    // BUILD
    selectedRegistryIds: ["scrub-input", "typography", "foundations", "layouts"],
    selectedPlaybookIds: ["landing-blueprint", "typography-system", "color-system", "responsive-rules", "hackathon-ux"],
    selectedReadingPathIds: ["build-trustworthy-interface"],
    selectedRecipeIds: ["product-launch"],
    architectureNotes: "Uses React local state for step progression. Sizing calculations use standard local helpers.",
    implementationConstraints: ["Offline static HTML stubs for consult forms."],
    acceptanceCriteria: ["Measurement validation triggers when next step is clicked.", "Bilingual switch changes all labels dynamically."],
    technicalRisks: ["Lack of database makes client tracking session-dependent until JSON export."],

    // CAPTURE
    capturePlan: {
      states: [
        { id: "customer-home", label: "Customer Landing", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Premium welcoming landing page with Consult button.", notes: "Step 1" },
        { id: "service-selected", label: "Wig Selection", time: 1.5, frame: 45, stateType: "intermediate", isCapturePoint: true, expectedVisualResult: "Style choices visible: length, density, parting.", notes: "Step 2" },
        { id: "measurements-guided", label: "Measurements Guide", time: 3.0, frame: 90, stateType: "intermediate", isCapturePoint: true, expectedVisualResult: "Interactive sizing guide showing head measuring lines.", notes: "Step 3" },
        { id: "request-submitted", label: "Request Submitted", time: 4.5, frame: 135, stateType: "evidence", isCapturePoint: true, expectedVisualResult: "Confirmation screen showing tracking token and recap.", notes: "Step 4" },
        { id: "owner-review", label: "Owner Dashboard", time: 6.0, frame: 180, stateType: "result", isCapturePoint: true, expectedVisualResult: "Stylist review portal showing client specifications.", notes: "Step 5" },
        { id: "quote-ready", label: "Quote Ready", time: 7.5, frame: 225, stateType: "result", isCapturePoint: true, expectedVisualResult: "Invoice preview screen with Square workflow payload.", notes: "Step 6" }
      ]
    },
    signatureStateId: "measurements-guided",
    signatureFrame: 90,
    heroDemoMoment: "Showed the interactive measurement tutorial guiding the customer to input precise sizing before invoice generation.",
    cleanViewRoute: "/projects/glow-atelier?clean=true",
    restoreUrls: {
      landing: "/projects/glow-atelier?step=1",
      sizing: "/projects/glow-atelier?step=3",
      owner: "/projects/glow-atelier?step=5"
    },
    captureLimitations: ["Local image stubs are static files."],

    // VIDEO
    videoPlan: {
      purpose: "Show client service automation to the boutique owner.",
      audience: "Boutique owner, local business investors.",
      durationSeconds: 120,
      formats: ["16:9"],
      narrative: "From chaotic text messages to structured boutique intake with exact measurements.",
      hook: "Every custom wig starts with numbers. But when clients guess, they get poor results.",
      scenes: ["The DM Chaos", "Bilingual Intake", "Measurement Guide", "Stylist Dashboard", "Square Invoice Generation"],
      proofMoments: ["Interactive measurement validation", "Stylist summary view"],
      transitions: ["Soft cross-dissolves", "Wig asset zooms"],
      voiceover: "Consulting custom hair shouldn't be a guessing game. Meet Glow Atelier...",
      subtitles: "FR/EN bilingual options.",
      soundDirection: "Elegant acoustic guitar, acoustic confirmation chime.",
      cta: "Automate your beauty appointments intake.",
      outputVariants: ["Full demo", "Stylist tutorial"],
      missingAssets: ["High res logo vector file"],
      captureDependencies: ["customer-home", "measurements-guided", "owner-review"],
      productionReadiness: "draft",
      shots: [
        {
          id: "shot1",
          order: 1,
          label: "Intake form bilingual switch",
          purpose: "Show localized intake",
          sourceRoute: "/projects/glow-atelier",
          captureState: "customer-home",
          duration: 10,
          screenAction: "User clicks FR language pill, labels translate instantly",
          overlay: "FULLY BILINGUAL INTAKE FLOW",
          voiceover: "Serving clients in French or English with equal care.",
          proofShown: "Bilingual label translation",
          transition: "fade",
          fallback: "Static EN home screen"
        }
      ]
    },

    // STATE
    facts: [
      { id: "g_f1", label: "Bilingual labels", description: "French and English translations are hardcoded in local JSON dictionaries.", category: "context", phase: "qualify" }
    ],
    assumptions: [
      { id: "g_a1", label: "Square invoice mapping", description: "Local Square invoice URLs generated can be directly opened in sandbox.", status: "unresolved", validationCriteria: "Test link opens Square Sandbox." }
    ],
    decisions: [
      {
        id: "g_d1",
        label: "Manual JSON Export",
        description: "Due to serverless constraints, requests are exported as copyable JSON text or tracking URLs.",
        status: "approved",
        rationale: "Ensures absolute confidentiality without hosting costs.",
        alternativesConsidered: ["Firebase free tier", "Email mailto fallback"],
        evidenceIds: ["g_f1"],
        source: "Melanie feedback",
        phase: "design",
        reversible: true,
        impact: "high"
      }
    ],
    rejections: [
      {
        id: "g_rej1",
        label: "Automated AI face measurement",
        reason: "Inaccurate results under poor room lighting, leading to client returns.",
        rejectedPhase: "qualify",
        riskAvoided: "Material waste",
        reconsiderCondition: "Accurate depth sensor API access on mobile web",
        source: "Intake research"
      }
    ],
    risks: [
      { id: "g_risk1", label: "Incorrect user sizing", description: "User measures incorrectly despite tutorial.", severity: "high", probability: "medium", mitigationStrategy: "Require secondary verification checkbox.", status: "open" }
    ],
    outputs: [
      { id: "g_out1", label: "Intake form", description: "The progressive multi-step consultation form.", format: "design", phase: "design", status: "in-progress" }
    ],
    nextActions: [
      { id: "g_act1", label: "Sizing graphics check", description: "Verify contrast on head measurement lines.", phase: "design", status: "todo" }
    ],
    learnings: [
      { id: "g_lrn1", label: "Localized guides", description: "Bilingual instructions must be placed directly beside the inputs for validation clarity.", impactArea: "User Interface" }
    ],
    openQuestions: ["Should the tracking page allow clients to cancel requests?"],
    blockedBy: [],

    // AUDIT
    auditResults: [
      { id: "g_ar1", label: "Bilingual assets complete", passed: true, consequence: "Boutique fits regulatory norms.", severity: "info" }
    ],
    currentScore: 70,
    readiness: 70,
    blockers: [],
    warnings: ["Unresolved Square sandbox invoicing integration mapping."],
    publicationGate: false,
    submissionGate: false
  },
  {
    // Required fields for the third preset
    id: "before-bar-one",
    slug: "before-bar-one-music-workflow",
    title: "Before Bar One — Music Workflow",
    shortTitle: "Before Bar One",
    description: "An interactive musicological proof system demonstrating key differences between score editions of Horn in F compositions, focusing on the 'Eight-Bar Hole' mystery.",
    kind: "creative-experiment",
    status: "verifying",
    currentPhase: "verify",
    completedPhases: ["intake", "qualify", "research", "position", "differentiate", "concept", "design", "prototype", "build"],
    blockedPhases: [],
    nextRecommendedPhase: "audit",
    priority: "low",
    createdLabel: "2026-07-15",
    updatedLabel: "2026-07-25",
    challenge: "Illustrate editorial transposition variations across historical score publications.",
    deadlineLabel: "2026-08-30",

    // CONTEXT
    problem: "Performers make systematic errors due to missing transposition labels and editorial gaps in standard orchestral scores prior to the first downbeat.",
    audience: "Conductors, musicologists, horn players",
    primaryGoal: "Visualize the 'Eight-Bar Hole' difference between 1987-F and 2001-R publications.",
    successDefinition: "Performers can instantly locate the missing bars using the Switchyard lever.",
    constraints: [
      { id: "m_c1", type: "technical", description: "Score rendering must use pure SVG shapes without external plugins." }
    ],
    stakeholders: [
      { id: "m_s1", label: "Prof. Arthur Pendelton", role: "Musicology Lead" }
    ],
    requirements: [
      { id: "m_r1", label: "A/B comparison lever", description: "User must be able to switch editions and watch notes update.", priority: "high" }
    ],
    evaluationCriteria: [
      { id: "m_ec1", label: "Transposition error reduction", description: "Measures error rates among horn players navigating transposition key shifts.", weight: 0.5 },
      { id: "m_ec2", label: "Note-read speed", description: "Evaluates the speed at which musicians correctly identify transposed pitches.", weight: 0.5 }
    ],
    sourceLinks: [
      { id: "m_sl1", label: "1987 Score PDF", sourceType: "project-file", description: "The original print containing the missing transposition bar." }
    ],
    references: ["German Horn Transposition Codex", "Eight-Bar Hole analysis"],

    // POSITIONING
    positioningStatement: "Before Bar One is the visual score comparison system that reveals historical editing mistakes before the first note is played.",
    tension: "Printed notes vs. intended transposition.",
    memoryHook: "Some mistakes begin before bar one.",
    judgeMemorySentence: "A music tool that exposes the 1987 ↔ 2001 edition transposition gap.",
    differentiation: "Interactive score player illustrating differences through sound and transposition sliders.",
    categoryClaim: "Interactive musicology tool.",
    alternatives: ["Static PDF notes", "General midi software"],
    rejectedAngles: ["Complete music editing suite", "Faux sheet generator"],

    // DESIGN
    visualDirection: "Editorial archive room style. Deep charcoal background, warm cream sheet music paper overlays, dark ink notes. Amber accents for alerts, green highlights for corrected notes.",
    typographyDirection: "Serif for musical headings (Playfair or editorial), Monospace for bars indicators.",
    colorDirection: "Sheet paper cream (#fdfbf7), deep ink (#1a1a1a), transposition orange (#f59e0b).",
    layoutDirection: "Score stage view layout with horizontal sheet timeline.",
    interactionDirection: "A/B lever click. Transposition scrubbing.",
    responsiveStrategy: "Responsive notation wrap. Scales score size to viewport width.",
    accessibilityStrategy: "Screen reader vocalizes the active transposition ('Horn in F transposed to C').",
    designPrinciples: ["Notes must remain legible at any scale.", "Tension is revealed through difference."],
    antiPatterns: ["Auto-playing audio without cue.", "Scrolled note clipping."],
    rejectedDirections: ["Modern dashboard charts.", "Neon sound waves."],

    // PROOF
    primaryClaim: "The 1987-F edition lacks 8 bars after letter C compared to the 2001-R revision.",
    evidence: [
      {
        id: "m_ev1",
        label: "SVG side-by-side edition diff",
        claimSupported: "The 1987-F edition lacks 8 bars after letter C compared to the 2001-R revision.",
        type: "technical-proof",
        source: "Arthur musicological data",
        strength: "direct",
        status: "available",
        routeOrFile: "components/music/svg-score.tsx",
        linkedDecisionId: "m_d1"
      }
    ],
    proofMoment: "Switching the Switchyard lever to '1987-F' collapses the letter C region, showing the Eight-Bar Hole.",
    technicalProof: "SVG side-by-side transposition alignment showing the missing block.",
    failureMode: "Lever disabled or transposition not locked.",
    fallback: "Defaulting to full composite sheet.",
    unresolvedProofGaps: ["Audio playback sync stubs."],

    // BUILD
    selectedRegistryIds: ["kinetic-text", "layouts", "typography"],
    selectedPlaybookIds: ["system-principles", "color-system", "controlled-visual-risk"],
    selectedReadingPathIds: ["win-first-five-seconds"],
    selectedRecipeIds: ["data-story-recipe"],
    architectureNotes: "Uses SVG layers with translation properties based on state.",
    implementationConstraints: ["SVG score path parsing limits."],
    acceptanceCriteria: ["Switching lever removes the letter C region instantly.", "Alert displays warning when 1987-F is active."],
    technicalRisks: ["Browser SVG layout engine performance on complex notes."],

    // CAPTURE
    capturePlan: {
      states: [
        { id: "score-loaded", label: "Score Loaded", time: 0, frame: 0, stateType: "setup", isCapturePoint: true, expectedVisualResult: "Sheet paper visible with the 2001-R score fully loaded.", notes: "Initial load" },
        { id: "edition-selected", label: "Edition Selected", time: 1.5, frame: 45, stateType: "intermediate", isCapturePoint: true, expectedVisualResult: "1987-F option hovered, alert highlighted.", notes: "Selection pending" },
        { id: "lever-switched", label: "Lever Switched", time: 3.0, frame: 90, stateType: "signature", isCapturePoint: true, expectedVisualResult: "Switchyard lever moves to 1987-F, letter C collapses.", notes: "VERDICT: Eight-Bar Hole revealed." },
        { id: "bars-revealed", label: "Bars Revealed", time: 4.5, frame: 135, stateType: "evidence", isCapturePoint: true, expectedVisualResult: "Orange callout box highlights the collapsed area.", notes: "Evidence focus" },
        { id: "correction-confirmed", label: "Correction Confirmed", time: 6.0, frame: 180, stateType: "result", isCapturePoint: true, expectedVisualResult: "User confirms the edition change, status shows RESOLVED.", notes: "Complete state" }
      ]
    },
    signatureStateId: "lever-switched",
    signatureFrame: 90,
    heroDemoMoment: "Switched edition lever to expose the 'Eight-Bar Hole' discrepancy in the 1987-F score print.",
    cleanViewRoute: "/projects/before-bar-one?clean=true",
    restoreUrls: {
      initial: "/projects/before-bar-one?step=1",
      hole: "/projects/before-bar-one?step=3"
    },
    captureLimitations: ["MIDI output is not operational."],

    // VIDEO
    videoPlan: {
      purpose: "Illustrate historical score editing error to musicologists.",
      audience: "Music professors, orchestra conductors, conservatory alumni.",
      durationSeconds: 90,
      formats: ["16:9"],
      narrative: "How a single transposition mistake in 1987 caused orchestra confusion, and how interactive notation reveals the hole.",
      hook: "Some mistakes begin before bar one.",
      scenes: ["Conductor frustration", "SVG score load", "A/B comparison lever", "The Eight-Bar Hole", "transposition proof"],
      proofMoments: ["A/B comparison notes mapping", "Hole highlighting"],
      transitions: ["Clean cuts", "Notes sliding animation"],
      voiceover: "It's the horn player's nightmare. You wait 8 bars and play... in the wrong key.",
      subtitles: "English subtitles.",
      soundDirection: "Warm French horn solo, sudden stop on error.",
      cta: "Explore the Eight-Bar Hole interaction.",
      outputVariants: ["Musicology case trailer"],
      missingAssets: ["Acoustic horn audio recordings"],
      captureDependencies: ["score-loaded", "lever-switched"],
      productionReadiness: "ready",
      shots: [
        {
          id: "m_shot1",
          order: 1,
          label: "Score transposition A/B",
          purpose: "Show notes moving",
          sourceRoute: "/projects/before-bar-one",
          captureState: "score-loaded",
          duration: 15,
          screenAction: "Conductor switches lever, notes transpose in real time",
          overlay: "EIGHT-BAR HOLE EXPOSED",
          voiceover: "Switching the Switchyard lever reveals the missing transposition...",
          proofShown: "Notes transposition update",
          transition: "cut",
          fallback: "Static score page"
        }
      ]
    },

    // STATE
    facts: [
      { id: "m_f1", label: "SVG layout", description: "Score render uses pure SVG path shapes.", category: "technical", phase: "intake" }
    ],
    assumptions: [
      { id: "m_a1", label: "MIDI stubs", description: "Standard audio synth triggers sound when notes are clicked.", status: "unresolved", validationCriteria: "Audible sine wave plays on click." }
    ],
    decisions: [
      {
        id: "m_d1",
        label: "SVG Score Render",
        description: "Use custom SVG path drawings instead of heavy open-source sheet music loaders.",
        status: "approved",
        rationale: "Ensures fast rendering and total control over layout collapsing.",
        alternativesConsidered: ["Verovio notation engine", "Static images"],
        evidenceIds: ["m_f1"],
        source: "Arthur advice",
        phase: "prototype",
        reversible: false,
        impact: "high"
      }
    ],
    rejections: [
      {
        id: "m_rej1",
        label: "Full audio recording playback",
        reason: "File size exceeds static repo limits and delays load times.",
        rejectedPhase: "concept",
        riskAvoided: "Slow page load",
        reconsiderCondition: "Audio compression to under 1MB",
        source: "Performance audit"
      }
    ],
    risks: [
      { id: "m_risk1", label: "Conductor adoption", description: "Conductors prefer paper scores and reject interactive screens.", severity: "low", probability: "high", mitigationStrategy: "Printable PDF layout export button.", status: "open" }
    ],
    outputs: [
      { id: "m_out1", label: "SVG Score Timeline", description: "The timeline container holding notes.", format: "code", phase: "build", status: "completed", filepath: "components/music/svg-score.tsx" }
    ],
    nextActions: [
      { id: "m_act1", label: "Transposition verification", description: "Verify transposition formulas with classical horn players.", phase: "verify", status: "todo" }
    ],
    learnings: [
      { id: "m_lrn1", label: "Graphic music notation", description: "Conductors respond faster when differences are highlighted in warm colors.", impactArea: "Musicology design" }
    ],
    openQuestions: ["Should the interface support full transposition for C, Eb, and Bb horns?"],
    blockedBy: [],

    // AUDIT
    auditResults: [
      { id: "m_ar1", label: "SVG validation passed", passed: true, consequence: "Browser can parse the score correctly.", severity: "info" }
    ],
    currentScore: 90,
    readiness: 90,
    blockers: [],
    warnings: ["Missing MIDI audio synthesis playback stubs."],
    publicationGate: true,
    submissionGate: false
  }
]



