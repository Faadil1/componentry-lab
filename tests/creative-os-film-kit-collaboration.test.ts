import test from "node:test"
import assert from "node:assert/strict"

import { buildFilmProject, getFilmProductionTruth } from "../lib/film-kit"
import {
  COLLABORATION_SCHEMA_VERSION,
  projectFilmKitPlanningCollaboration,
  type CollaborationRequest
} from "../lib/creative-os/collaboration"

function requestFor(projectId: string): CollaborationRequest {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId,
    correlationId: "film-kit-plan-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "FILM_KIT",
    intent: "REQUEST_PRODUCTION",
    projectPhase: "build",
    projectMode: "HACKATHON",
    capabilityRefs: [],
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false
    },
    structuredInputs: { productionNeed: "Plan proof film without executing providers" },
    inputRefs: [`project-brain:${projectId}`],
    evidenceRefs: ["director:production-need:001"],
    requestedEffectClass: "NONE",
    hopTrace: [{ sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }],
    status: "REQUESTED"
  }
}

test("FILM_KIT_COLLABORATION_RETURNS_PLANNING_INTENT_WITHOUT_FABRICATED_PRODUCTION", () => {
  const film = buildFilmProject("stated")
  const projection = projectFilmKitPlanningCollaboration(requestFor(film.id), film)

  assert.equal(projection.valid, true)
  assert.ok(projection.result)
  assert.equal(projection.result!.sourceSystem, "FILM_KIT")
  assert.equal(projection.result!.targetSystem, "CREATIVE_DIRECTOR")
  assert.equal(projection.result!.capabilityUsed, null, "Film Kit must not fabricate a Registry V2 capability identity")
  assert.equal(projection.result!.resultStatus, "PARTIAL")
  assert.equal(projection.result!.sideEffectRequest, null)
  assert.deepEqual(projection.result!.structuredOutput.productionTruth, getFilmProductionTruth(film.id))
  assert.ok(projection.result!.limitations.some((item) => item.includes("NO_CANONICAL_PRODUCTION_SPINE")))
})

test("FILM_KIT_PLANNING_PRESERVES_FILM_PROJECT_IMMUTABILITY", () => {
  const film = buildFilmProject("stated")
  const before = JSON.stringify(film)
  const projection = projectFilmKitPlanningCollaboration(requestFor(film.id), film)

  assert.equal(projection.valid, true)
  assert.equal(JSON.stringify(film), before)
})

test("FILM_KIT_EXTERNAL_EFFECT_REQUEST_FAILS_CLOSED", () => {
  const film = buildFilmProject("stated")
  const request = {
    ...requestFor(film.id),
    requestedEffectClass: "EXTERNAL_SIDE_EFFECT" as const,
    authorityContext: {
      currentAuthority: "READ_ONLY" as const,
      requestedAuthority: "EXPLICIT_EXTERNAL" as const,
      ownerSystem: null,
      humanReviewRequired: true
    }
  }

  const projection = projectFilmKitPlanningCollaboration(request, film)
  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("planning-only")))
})

test("FILM_KIT_REQUEST_MUST_ORIGINATE_FROM_DIRECTOR", () => {
  const film = buildFilmProject("stated")
  const request = { ...requestFor(film.id), sourceSystem: "PROJECT_BRAIN" as const }

  const projection = projectFilmKitPlanningCollaboration(request, film)
  assert.equal(projection.valid, false)
  assert.ok(projection.errors.some((error) => error.includes("CREATIVE_DIRECTOR")))
})

test("INVALID_FILM_PROJECT_FAILS_CLOSED_BEFORE_PLANNING_RETURN", () => {
  const film = buildFilmProject("stated")
  const invalidFilm = {
    ...film,
    brief: { ...film.brief, primaryProof: "" }
  }

  const projection = projectFilmKitPlanningCollaboration(requestFor(film.id), invalidFilm)
  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("Primary proof is required")))
})

test("FILM_KIT_PLANNING_COLLABORATION_IS_DETERMINISTIC", () => {
  const film = buildFilmProject("stated")
  const request = requestFor(film.id)

  const first = projectFilmKitPlanningCollaboration(request, film)
  const second = projectFilmKitPlanningCollaboration(request, film)
  assert.equal(first.valid, true)
  assert.equal(second.valid, true)
  assert.deepEqual(first.result, second.result)
})
