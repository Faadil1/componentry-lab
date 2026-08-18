import assert from "node:assert/strict"
import test from "node:test"

import {
  EXTERNAL_FINDING_ENTITIES,
  buildLibraryV2ReadModel,
  buildLiveLibraryV2ReadModel,
  getLibraryV2EntityById,
  type ProviderEntity,
  type ResourceEntity,
  type SourceEntity
} from "../lib/creative-os/library-v2"

const EXPECTED_EXTERNAL_FINDING_IDS = [
  "src_21st_dev",
  "ref_ai_camera_control",
  "ref_photo_abstract_editorial",
  "ref_ian_xiaohei_illustrations",
  "ref_ian_xiaohei_scenes",
  "ref_ian_handdrawn_ppt",
  "ref_obsidian_ai_second_brain",
  "ref_claude_code_handbook",
  "ref_stillslab",
  "ref_filmgrab",
  "src_shuohao_skills_candidate",
  "ref_photo_relic_editorial",
  "ref_photo_distill",
  "ref_poetic_line_zine_poster"
].sort()

test("LIVE_LIBRARY_V2_PRESERVES_LEGACY_ENGINE_AND_ADDS_EXTERNAL_FINDINGS", () => {
  const legacy = buildLibraryV2ReadModel()
  const live = buildLiveLibraryV2ReadModel()

  assert.equal(legacy.valid, true)
  assert.equal(legacy.entities.length, 20)
  assert.equal(legacy.countsByKind.REFERENCE, 0)

  assert.equal(live.valid, true)
  assert.equal(live.entities.length, 34)
  assert.deepStrictEqual(live.countsByKind, {
    SOURCE: 7,
    RESOURCE: 6,
    REFERENCE: 12,
    METHOD: 6,
    PROVIDER: 3
  })

  const ids = live.entities.map((entity) => entity.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.deepStrictEqual(
    EXTERNAL_FINDING_ENTITIES.map((entity) => entity.id).sort(),
    EXPECTED_EXTERNAL_FINDING_IDS
  )
})

test("LIVE_LIBRARY_V2_RECONCILES_KNOWN_EXTERNAL_LOCATORS_WITHOUT_V1_MUTATION", () => {
  const legacy = buildLibraryV2ReadModel()
  const live = buildLiveLibraryV2ReadModel()

  const legacyRemocn = getLibraryV2EntityById(legacy, "res_remocn") as SourceEntity
  const liveRemocn = getLibraryV2EntityById(live, "res_remocn") as SourceEntity
  assert.ok(legacyRemocn.sourceUrl?.includes("github.com/example/"))
  assert.equal(liveRemocn.sourceUrl, "https://github.com/Remocn/remocn")
  assert.equal(liveRemocn.locator, "https://github.com/Remocn/remocn")
  assert.equal(liveRemocn.sourceKind, "REPOSITORY")
  assert.equal(liveRemocn.licenseEvidenceRecords?.[0]?.licenseValue, "MIT")
  assert.equal(liveRemocn.licenseEvidenceRecords?.[0]?.status, "OBSERVED")

  const originKit = getLibraryV2EntityById(live, "res_originkit") as SourceEntity
  assert.equal(originKit.sourceUrl, "https://www.originkit.dev/intro")
  assert.equal(originKit.sourceKind, "CONNECTOR")
  assert.equal(originKit.compatibilityEvidenceStatus, "UNKNOWN")

  const cinePrompt = getLibraryV2EntityById(live, "res_cineprompt") as ProviderEntity
  assert.equal(cinePrompt.packageDescriptor?.packageLocator, "https://cineprompt.io/")

  const cameraMovements = getLibraryV2EntityById(live, "res_ai_camera_movements") as ResourceEntity
  assert.equal(cameraMovements.packageDescriptor?.packageLocator, "https://aicameramovements.com/")
})

test("LIVE_LIBRARY_V2_CORRECTS_OBSERVED_LICENSE_METADATA_CONSERVATIVELY", () => {
  const live = buildLiveLibraryV2ReadModel()

  const videoShotcraft = getLibraryV2EntityById(live, "res_video_shotcraft") as ResourceEntity
  const gbro = getLibraryV2EntityById(live, "res_gbro_collage_b_roll") as ResourceEntity
  const openMontage = getLibraryV2EntityById(live, "res_openmontage") as ResourceEntity
  const tait = getLibraryV2EntityById(live, "res_tait_crt_interface_skill") as ResourceEntity

  assert.equal(videoShotcraft.licenseEvidenceRecords?.[0]?.licenseValue, "Apache-2.0")
  assert.equal(videoShotcraft.licenseEvidenceRecords?.[0]?.status, "OBSERVED")
  assert.equal(gbro.licenseEvidenceRecords?.[0]?.licenseValue, "MIT")
  assert.equal(gbro.licenseEvidenceRecords?.[0]?.status, "OBSERVED")
  assert.equal(openMontage.licenseEvidenceRecords?.[0]?.licenseValue, "AGPL-3.0")
  assert.equal(openMontage.licenseEvidenceRecords?.[0]?.status, "OBSERVED")
  assert.equal(tait.licenseEvidenceRecords?.[0]?.licenseValue, "UNCLAIMED")
  assert.equal(tait.licenseEvidenceRecords?.[0]?.status, "UNKNOWN")
})

test("LIVE_LIBRARY_V2_PRESERVES_UNRESOLVED_FINDINGS_AS_NON_ROUTABLE_DISCOVERY_CANDIDATES", () => {
  const live = buildLiveLibraryV2ReadModel()

  const shuohao = getLibraryV2EntityById(live, "src_shuohao_skills_candidate") as SourceEntity
  assert.equal(shuohao.lifecycleState, "CAPTURED")
  assert.equal(shuohao.sourceVerificationStatus, "UNKNOWN")
  assert.equal(shuohao.packageDescriptor, undefined)
  assert.ok(shuohao.tags?.includes("DISCOVERY_CANDIDATE"))

  for (const id of ["ref_photo_relic_editorial", "ref_photo_distill", "ref_poetic_line_zine_poster"]) {
    const reference = getLibraryV2EntityById(live, id)
    assert.ok(reference)
    assert.equal(reference?.entityKind, "REFERENCE")
    assert.equal(reference?.lifecycleState, "CAPTURED")
    if (reference?.entityKind === "REFERENCE") {
      assert.equal(reference.packageDescriptor, undefined)
      assert.ok(reference.tags?.includes("DISCOVERY_CANDIDATE"))
    }
  }
})

test("LIVE_LIBRARY_V2_LINKS_INTERNALIZED_METHODS_TO_PRESERVED_EXTERNAL_ORIGINS", () => {
  const live = buildLiveLibraryV2ReadModel()

  const rpa = getLibraryV2EntityById(live, "res_relationship_preserving_abstraction")
  const cmi = getLibraryV2EntityById(live, "res_cognitive_metaphor_illustrator")
  const pss = getLibraryV2EntityById(live, "res_physical_situation_storyboarder")
  const lfcr = getLibraryV2EntityById(live, "res_library_first_composition_router")
  const srb = getLibraryV2EntityById(live, "res_sacred_rules_breaker")
  const srd = getLibraryV2EntityById(live, "res_somatic_response_design")

  assert.ok(rpa?.tags?.includes("ref_photo_abstract_editorial"))
  assert.ok(cmi?.tags?.includes("ref_ian_xiaohei_illustrations"))
  assert.ok(pss?.tags?.includes("ref_ian_xiaohei_scenes"))
  assert.ok(lfcr?.tags?.includes("res_yummy_design_sprint"))
  assert.ok(srb?.tags?.includes("ORIGIN_LOCATOR_UNRESOLVED"))
  assert.ok(srd?.tags?.includes("ORIGIN_LOCATOR_UNRESOLVED"))
})

test("LIVE_LIBRARY_V2_FILTERS_STALE_PLACEHOLDER_WARNINGS_ONLY_AFTER_RECONCILIATION", () => {
  const legacy = buildLibraryV2ReadModel()
  const live = buildLiveLibraryV2ReadModel()

  const legacyPlaceholderIds = legacy.warnings
    .filter((warning) => warning.code === "LEGACY_PLACEHOLDER_SOURCE")
    .map((warning) => warning.resourceId)

  assert.ok(legacyPlaceholderIds.includes("res_remocn"))
  assert.equal(
    live.warnings.some(
      (warning) => warning.code === "LEGACY_PLACEHOLDER_SOURCE" && warning.resourceId === "res_remocn"
    ),
    false
  )
})

test("LIVE_LIBRARY_V2_EXTERNAL_FINDINGS_ARE_READ_ONLY_OR_REFERENCE_ONLY", () => {
  const live = buildLiveLibraryV2ReadModel()
  const externalIds = new Set(EXTERNAL_FINDING_ENTITIES.map((entity) => entity.id))

  for (const entity of live.entities.filter((candidate) => externalIds.has(candidate.id))) {
    if (entity.entityKind === "SOURCE") {
      assert.equal(entity.authorityPolicy.maximumAuthority, "READ_ONLY")
      for (const permission of Object.values(entity.automationPolicy.operations)) {
        assert.equal(permission, "UNKNOWN")
      }
    } else {
      assert.equal(entity.entityKind, "REFERENCE")
      assert.equal(Object.hasOwn(entity, "authorityPolicy"), false)
      assert.equal(Object.hasOwn(entity, "automationPolicy"), false)
    }
  }
})
