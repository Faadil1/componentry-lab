import fs from "node:fs"
import path from "node:path"

import { runPhysicalSituationStoryboarder } from "../lib/creative-os/methods/physical-situation-storyboarder"
import { runRelationshipPreservingAbstraction } from "../lib/creative-os/methods/relationship-preserving-abstraction"
import { runCognitiveMetaphorIllustrator } from "../lib/creative-os/methods/cognitive-metaphor-illustrator"
import { runLibraryFirstCompositionRouter } from "../lib/creative-os/methods/library-first-composition-router"

const outputDir = path.join(process.cwd(), "fixtures", "slice-3b2-v3")
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 1. PSS Fixtures
const pssA = runPhysicalSituationStoryboarder({
  methodId: "method_physical_situation_storyboarder",
  projectMode: "MARA",
  phase: "build",
  subjectDescription: "Mara pottery sequence",
  subjectContext: "Short film",
  capabilityGap: "narrative-staging",
  supplementaryFields: {
    projectObjective: "observe and mirror incompleteness",
    narrativeBeat: "accepting incompleteness",
    subjectOrCharacter: "Mara",
    emotionalTension: "existential anxiety / incompleteness",
    desiredTransformation: "acceptance",
    locationConstraints: "interior pottery studio",
    propConstraints: "unfinished clay pot"
  }
})

const pssB = runPhysicalSituationStoryboarder({
  methodId: "method_physical_situation_storyboarder",
  projectMode: "MARA",
  phase: "build",
  subjectDescription: "Mara pottery sequence",
  subjectContext: "Short film",
  capabilityGap: "narrative-staging",
  supplementaryFields: {
    projectObjective: "observe and mirror incompleteness",
    narrativeBeat: "labor",
    subjectOrCharacter: "Sarah",
    emotionalTension: "invisible labor",
    desiredTransformation: "acceptance",
    locationConstraints: "interior pottery studio",
    propConstraints: "unfinished clay pot"
  }
})

const pssC = runPhysicalSituationStoryboarder({
  methodId: "method_physical_situation_storyboarder",
  projectMode: "MARA",
  phase: "build",
  subjectDescription: "accountability drift sequence",
  subjectContext: "Short film",
  capabilityGap: "narrative-staging",
  supplementaryFields: {
    projectObjective: "make responsibility tangible",
    narrativeBeat: "accountability drift",
    subjectOrCharacter: "John",
    emotionalTension: "accountability drift",
    desiredTransformation: "visible ownership",
    locationConstraints: "broken office desk",
    propConstraints: "broken office desk"
  }
})

fs.writeFileSync(
  path.join(outputDir, "physical-situation-storyboarder.json"),
  JSON.stringify({ A: pssA, B: pssB, C: pssC }, null, 2)
)

// 2. RPA Fixtures
const rpaA = runRelationshipPreservingAbstraction({
  methodId: "method_relationship_preserving_abstraction",
  projectMode: "DATA_STORY",
  phase: "build",
  subjectDescription: "High-rise structural photo",
  subjectContext: "Editorial poster",
  capabilityGap: "editorial-abstraction",
  supplementaryFields: {
    sourceDescription: "architectural photograph of grid facade",
    projectObjective: "convey vertical architectural height",
    communicationIntent: "highlight grid scale ratios",
    sourceType: "architectural",
    abstractionLevel: "high"
  }
})

// Human portrait with explicit knownSpatialRelationships to avoid UNKNOWN facts and hit COMPLETE status
const rpaB = runRelationshipPreservingAbstraction({
  methodId: "method_relationship_preserving_abstraction",
  projectMode: "DATA_STORY",
  phase: "build",
  subjectDescription: "Human portrait",
  subjectContext: "Editorial poster",
  capabilityGap: "editorial-abstraction",
  supplementaryFields: {
    sourceDescription: "portrait of staring athlete",
    projectObjective: "convey concentration",
    communicationIntent: "highlight direct gaze tension",
    sourceType: "human",
    abstractionLevel: "high",
    knownSpatialRelationships: JSON.stringify([
      "gaze line intersects off-center focal point",
      "negative space exceeds subject mass",
      "shoulders form horizontal stabilizing axis"
    ])
  }
})

// Data visualization without explicit relationships (allow returning PARTIAL)
const rpaC = runRelationshipPreservingAbstraction({
  methodId: "method_relationship_preserving_abstraction",
  projectMode: "DATA_STORY",
  phase: "build",
  subjectDescription: "Data visualization",
  subjectContext: "Editorial poster",
  capabilityGap: "editorial-abstraction",
  supplementaryFields: {
    sourceDescription: "exponential line chart",
    projectObjective: "test empty relationships",
    communicationIntent: "editorial abstraction of chart",
    sourceType: "custom-insufficient",
    abstractionLevel: "high"
  }
})

fs.writeFileSync(
  path.join(outputDir, "relationship-preserving-abstraction.json"),
  JSON.stringify({ A: rpaA, B: rpaB, C: rpaC }, null, 2)
)

// 3. CMI Fixtures
const cmiA = runCognitiveMetaphorIllustrator({
  methodId: "method_cognitive_metaphor_illustrator",
  projectMode: "DATA_STORY",
  phase: "build",
  subjectDescription: "invisible technical debt accumulation",
  subjectContext: "Developer roadmap",
  capabilityGap: "visual-metaphor",
  supplementaryFields: {
    concept: "technical debt",
    projectObjective: "convey structural load instability",
    audience: "product managers",
    projectSymbols: "granite blocks, wooden support sticks"
  }
})

const cmiB = runCognitiveMetaphorIllustrator({
  methodId: "method_cognitive_metaphor_illustrator",
  projectMode: "DATA_STORY",
  phase: "build",
  subjectDescription: "trust erosion",
  subjectContext: "Brand strategy",
  capabilityGap: "visual-metaphor",
  supplementaryFields: {
    concept: "trust erosion",
    projectObjective: "convey gradual breakdown of foundation",
    audience: "stakeholders",
    projectSymbols: "eroding coastal cliff, unstable sand pillars"
  }
})

const cmiC = runCognitiveMetaphorIllustrator({
  methodId: "method_cognitive_metaphor_illustrator",
  projectMode: "DATA_STORY",
  phase: "build",
  subjectDescription: "operational bottleneck",
  subjectContext: "Process diagram",
  capabilityGap: "visual-metaphor",
  supplementaryFields: {
    concept: "operational bottleneck",
    projectObjective: "convey flow restriction",
    audience: "operations team",
    projectSymbols: "converging funnel channels, narrow gate valve"
  }
})

fs.writeFileSync(
  path.join(outputDir, "cognitive-metaphor-illustrator.json"),
  JSON.stringify({ A: cmiA, B: cmiB, C: cmiC }, null, 2)
)

// 4. LFCR Fixtures
const lfcrA = runLibraryFirstCompositionRouter({
  methodId: "method_library_first_composition_router",
  projectMode: "HACKATHON",
  phase: "route",
  subjectDescription: "simple fade transition",
  subjectContext: "UI layout",
  capabilityGap: "library-composition",
  supplementaryFields: {
    requestedCapability: "simple fade",
    projectObjective: "minimize asset weight",
    artifactType: "composition-tree"
  }
})

const lfcrB = runLibraryFirstCompositionRouter({
  methodId: "method_library_first_composition_router",
  projectMode: "HACKATHON",
  phase: "route",
  subjectDescription: "web component animation",
  subjectContext: "UI layout",
  capabilityGap: "library-composition",
  supplementaryFields: {
    requestedCapability: "web-component-animation",
    projectObjective: "optimize performance",
    artifactType: "composition-tree",
    frameworkOrSurface: "React/NextJS"
  }
})

const lfcrC = runLibraryFirstCompositionRouter({
  methodId: "method_library_first_composition_router",
  projectMode: "HACKATHON",
  phase: "route",
  subjectDescription: "complex scroll choreography",
  subjectContext: "UI layout",
  capabilityGap: "library-composition",
  supplementaryFields: {
    requestedCapability: "complex scroll choreography",
    projectObjective: "rich interactive experience",
    artifactType: "composition-tree",
    frameworkOrSurface: "React/NextJS"
  }
})

fs.writeFileSync(
  path.join(outputDir, "library-first-composition-router.json"),
  JSON.stringify({ A: lfcrA, B: lfcrB, C: lfcrC }, null, 2)
)

console.log("Regenerated all slice-3b2-v3 fixtures successfully!")
