import assert from "node:assert/strict"
import test from "node:test"

import { buildLibraryV2ReadModel, LIBRARY_V2_ENTITY_KINDS, type AutomationOperation, type AutomationPermission, type AuthorityPolicy, type EvidenceRecord, type LicenseEvidenceRecord, type LibraryV2ReadModel, type MethodEntity, type PackageDescriptor, type ProviderEntity, type ReferenceEntity, type ResourceEntity, type SourceEntity, type SourceVerificationStatus } from "../lib/creative-os/library-v2"
import type { AuthorityCeiling } from "../lib/creative-os/types"
import type { CreativeMethodDefinition } from "../lib/creative-os/methods/types"
import { buildRegistryV2ViewModel, type RegistryV2MethodDetail, type RegistryV2ProviderDetail, type RegistryV2ReferenceDetail, type RegistryV2ResourceDetail, type RegistryV2SourceDetail } from "../app/creative-os/registry/registry-view-model"

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

function createAuthorityPolicy(maximumAuthority: AuthorityCeiling = "READ_ONLY"): AuthorityPolicy {
  return {
    requestedAuthority: "READ_ONLY",
    maximumAuthority,
    humanReviewRequired: true
  }
}

function createAutomationPolicy(permission: AutomationPermission = "ALLOWED") {
  return {
    operations: AUTOMATION_OPERATIONS.reduce((acc, operation) => {
      acc[operation] = permission
      return acc
    }, {} as Record<AutomationOperation, AutomationPermission>)
  }
}

function createEvidenceRecords(locator: string, notes?: string): EvidenceRecord[] {
  return [{ evidenceType: "PROVENANCE", status: "DECLARED", locator, ...(notes ? { notes } : {}) }]
}

function createLicenseEvidenceRecords(locator: string, notes?: string): LicenseEvidenceRecord[] {
  return [
    {
      evidenceType: "LICENSE",
      status: "DECLARED",
      scope: "UNKNOWN",
      licenseValue: "UNCLAIMED",
      locator,
      ...(notes ? { notes } : {})
    }
  ]
}

function createMethodDefinition(resourceId: string): CreativeMethodDefinition {
  return {
    id: `${resourceId}-method-definition`,
    resourceId,
    name: `${resourceId} method`,
    version: "1.0.0",
    supportedModes: ["DAY_CHALLENGE"],
    supportedPhases: ["route", "build"],
    capabilityGaps: ["gap-a"],
    requiredInputs: ["subjectDescription"],
    optionalInputs: ["supplementaryFields"],
    outputSchemaId: `${resourceId}-schema`,
    qualityGateIds: ["gate-a"],
    authorityRequired: "READ_ONLY",
    deterministic: true
  }
}

function createPackageDescriptor(packageName: string, packageLocator?: string): PackageDescriptor {
  return {
    packageType: "REPOSITORY",
    packageName,
    ...(packageLocator ? { packageLocator } : {})
  }
}

function createSyntheticReadModel(options: {
  readonly includeOptionalFields?: boolean
  readonly sourceUrl?: string
  readonly sourceLocator?: string
  readonly sourceVerificationStatus?: SourceVerificationStatus
} = {}): LibraryV2ReadModel {
  const includeOptionalFields = options.includeOptionalFields ?? true
  const sourceLocator = options.sourceLocator ?? "connector:test_reference_registry_v2"
  const sourceUrl = options.sourceUrl
  const source: SourceEntity = {
    id: "test_source_registry_v2",
    name: "Test Source Registry V2",
    entityKind: "SOURCE",
    lifecycleState: "VALIDATED",
    provenance: sourceLocator,
    evidenceRefs: [],
    sourceKind: "CONNECTOR",
    locator: sourceLocator,
    accessChannels: [],
    sourceVerificationStatus: options.sourceVerificationStatus ?? "DECLARED",
    authorityPolicy: createAuthorityPolicy(),
    automationPolicy: createAutomationPolicy(),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(includeOptionalFields ? { packageDescriptor: createPackageDescriptor("Test Source Registry V2", sourceUrl ?? sourceLocator) } : {}),
    evidenceRecords: createEvidenceRecords(sourceLocator, "source evidence"),
    licenseEvidenceRecords: createLicenseEvidenceRecords(sourceLocator, "source license")
  }

  const resource: ResourceEntity = {
    id: "test_resource_registry_v2",
    name: "Test Resource Registry V2",
    entityKind: "RESOURCE",
    lifecycleState: "AUDITED",
    provenance: "resource:test_reference_registry_v2",
    evidenceRefs: [],
    resourceKind: "COMPONENT",
    authorityPolicy: createAuthorityPolicy(),
    automationPolicy: createAutomationPolicy(),
    ...(includeOptionalFields ? { supportedFrameworks: ["Next.js"], supportedSurfaces: ["registry"], supportedArtifacts: ["page"], supportedCapabilities: ["browse"] } : {}),
    compatibilityEvidenceStatus: "VERIFIED",
    ...(includeOptionalFields ? { packageDescriptor: createPackageDescriptor("Test Resource Registry V2", "https://example.com/resource") } : {}),
    evidenceRecords: createEvidenceRecords("resource:test_reference_registry_v2", "resource evidence"),
    licenseEvidenceRecords: createLicenseEvidenceRecords("resource:test_reference_registry_v2", "resource license")
  }

  const reference: ReferenceEntity = {
    id: "test_reference_registry_v2",
    name: "Test Reference Registry V2",
    entityKind: "REFERENCE",
    lifecycleState: "CAPTURED",
    provenance: "reference:test_reference_registry_v2",
    evidenceRefs: [],
    referenceDomain: "TECHNICAL_PATTERN",
    stageAffinity: "TARGETED_REFERENCE_GATE",
    usageMode: "LINK_OUT",
    ...(includeOptionalFields ? { packageDescriptor: createPackageDescriptor("Test Reference Registry V2") } : {}),
    evidenceRecords: createEvidenceRecords("reference:test_reference_registry_v2", "reference evidence"),
    licenseEvidenceRecords: createLicenseEvidenceRecords("reference:test_reference_registry_v2", "reference license")
  }

  const methodDefinition = createMethodDefinition("test_method_registry_v2")
  const method: MethodEntity = {
    id: "test_method_registry_v2",
    name: "Test Method Registry V2",
    entityKind: "METHOD",
    lifecycleState: "TEST_CANDIDATE",
    provenance: "method:test_reference_registry_v2",
    evidenceRefs: [],
    methodDomain: "STRATEGY",
    authorityPolicy: createAuthorityPolicy(),
    methodDefinitionId: methodDefinition.id,
    methodDefinition,
    recipePromotionStatus: "REFERENCE",
    operationDefinition: {
      operationId: "test_method_registry_v2-operation",
      operationName: "Test Method Registry V2 operation",
      operator: "DETERMINISTIC",
      effectClass: "NONE",
      outputRole: "ADVISORY",
      permission: "ALLOWED"
    },
    ...(includeOptionalFields ? { packageDescriptor: createPackageDescriptor("Test Method Registry V2") } : {}),
    evidenceRecords: createEvidenceRecords("method:test_reference_registry_v2", "method evidence"),
    licenseEvidenceRecords: createLicenseEvidenceRecords("method:test_reference_registry_v2", "method license")
  }

  const provider: ProviderEntity = {
    id: "test_provider_registry_v2",
    name: "Test Provider Registry V2",
    entityKind: "PROVIDER",
    lifecycleState: "APPROVED",
    provenance: "provider:test_reference_registry_v2",
    evidenceRefs: [],
    providerKind: "HOSTING",
    authorityPolicy: createAuthorityPolicy(),
    automationPolicy: createAutomationPolicy(),
    ...(includeOptionalFields ? { packageDescriptor: createPackageDescriptor("Test Provider Registry V2") } : {}),
    evidenceRecords: createEvidenceRecords("provider:test_reference_registry_v2", "provider evidence"),
    licenseEvidenceRecords: createLicenseEvidenceRecords("provider:test_reference_registry_v2", "provider license")
  }

  const entities = [source, resource, reference, method, provider]

  return {
    valid: true,
    errors: [],
    warnings: [],
    entities,
    countsByKind: {
      SOURCE: 1,
      RESOURCE: 1,
      REFERENCE: 1,
      METHOD: 1,
      PROVIDER: 1
    },
    methodCountsByDomain: {
      STRATEGY: 1,
      PERCEPTUAL: 0,
      CREATIVE_TRANSFORMATION: 0,
      CONCEPTUAL: 0,
      PRODUCTION: 0,
      ORCHESTRATION: 0
    }
  }
}

test("REGISTRY_VIEW_MODEL_DETERMINISM", () => {
  const first = buildRegistryV2ViewModel(buildLibraryV2ReadModel())
  const second = buildRegistryV2ViewModel(buildLibraryV2ReadModel())

  assert.deepStrictEqual(second, first)
  assert.deepStrictEqual(first.sections.map((section) => section.entityKind), ["SOURCE", "RESOURCE", "REFERENCE", "METHOD", "PROVIDER"])
  assert.equal(first.summary.warningCount, first.warnings.length)
})

test("REGISTRY_VIEW_MODEL_NO_SEMANTIC_ESCALATION", () => {
  const viewModel = buildRegistryV2ViewModel(createSyntheticReadModel({ includeOptionalFields: false, sourceVerificationStatus: "DECLARED" }))
  const referenceSection = viewModel.sections.find((section) => section.entityKind === "REFERENCE")
  const referenceRow = referenceSection?.rows[0]

  assert.ok(referenceSection)
  assert.ok(referenceRow)
  assert.deepStrictEqual(referenceRow?.authority, { kind: "NOT_MODELED" })
  assert.equal(referenceRow?.detail?.entityKind, "REFERENCE")
  assert.equal(Object.hasOwn(referenceRow?.detail ?? {}, "authorityPolicy"), false)
  assert.equal(Object.hasOwn(referenceRow?.detail ?? {}, "recommendable"), false)
  assert.equal(Object.hasOwn(referenceRow?.detail ?? {}, "modes"), false)
  assert.deepStrictEqual(referenceRow?.evidence.evidenceStatuses, ["DECLARED"])
  assert.deepStrictEqual(referenceRow?.evidence.licenseStatuses, ["DECLARED"])
  assert.deepStrictEqual(referenceRow?.detail?.warnings, [])
})

test("REGISTRY_VIEW_MODEL_GROUPING_AND_ORDER", () => {
  const model = buildLibraryV2ReadModel()
  const viewModel = buildRegistryV2ViewModel(model)

  assert.deepStrictEqual(viewModel.sections.map((section) => section.entityKind), LIBRARY_V2_ENTITY_KINDS)

  for (const section of viewModel.sections) {
    const expectedIds = model.entities.filter((entity) => entity.entityKind === section.entityKind).map((entity) => entity.id)
    assert.deepStrictEqual(section.rows.map((row) => row.id), expectedIds)
    assert.equal(section.count, model.countsByKind[section.entityKind])
  }

  const referenceSection = viewModel.sections.find((section) => section.entityKind === "REFERENCE")
  assert.ok(referenceSection)
  assert.equal(referenceSection?.count, 0)
  assert.deepStrictEqual(referenceSection?.rows, [])
})

test("REGISTRY_VIEW_MODEL_WARNING_ASSOCIATION", () => {
  const readModel = buildLibraryV2ReadModel()
  const viewModel = buildRegistryV2ViewModel(readModel)

  assert.equal(viewModel.summary.warningCount, readModel.warnings.length)

  for (const section of viewModel.sections) {
    for (const row of section.rows) {
      const expected = readModel.warnings.filter((warning) => warning.resourceId === row.id)
      assert.equal(row.warningCount, expected.length)
      assert.deepStrictEqual(row.detail?.warnings, expected)
    }
  }
})

test("REGISTRY_VIEW_MODEL_INVALID_FAIL_CLOSED", () => {
  const invalid = buildLibraryV2ReadModel([])
  const viewModel = buildRegistryV2ViewModel(invalid)

  assert.equal(viewModel.valid, false)
  assert.deepStrictEqual(viewModel.errors, invalid.errors)
  assert.deepStrictEqual(viewModel.warnings, invalid.warnings)
  assert.equal(viewModel.summary.total, 0)
  assert.equal(viewModel.summary.warningCount, invalid.warnings.length)
  assert.deepStrictEqual(viewModel.summary.countsByKind, {
    SOURCE: 0,
    RESOURCE: 0,
    REFERENCE: 0,
    METHOD: 0,
    PROVIDER: 0
  })
  assert.deepStrictEqual(viewModel.summary.methodCountsByDomain, {
    STRATEGY: 0,
    PERCEPTUAL: 0,
    CREATIVE_TRANSFORMATION: 0,
    CONCEPTUAL: 0,
    PRODUCTION: 0,
    ORCHESTRATION: 0
  })
  assert.deepStrictEqual(viewModel.sections.map((section) => section.count), [0, 0, 0, 0, 0])
  assert.deepStrictEqual(viewModel.sections.map((section) => section.rows.length), [0, 0, 0, 0, 0])
})

test("REGISTRY_VIEW_MODEL_ENTITY_KIND_OPTIONAL_FIELD_SAFETY", () => {
  const model = createSyntheticReadModel()
  const viewModel = buildRegistryV2ViewModel(model)

  const sourceEntity = model.entities.find((entity): entity is SourceEntity => entity.entityKind === "SOURCE")!
  const resourceEntity = model.entities.find((entity): entity is ResourceEntity => entity.entityKind === "RESOURCE")!
  const referenceEntity = model.entities.find((entity): entity is ReferenceEntity => entity.entityKind === "REFERENCE")!
  const methodEntity = model.entities.find((entity): entity is MethodEntity => entity.entityKind === "METHOD")!
  const providerEntity = model.entities.find((entity): entity is ProviderEntity => entity.entityKind === "PROVIDER")!

  const source = viewModel.sections.find((section) => section.entityKind === "SOURCE")?.rows[0]
  const resource = viewModel.sections.find((section) => section.entityKind === "RESOURCE")?.rows[0]
  const reference = viewModel.sections.find((section) => section.entityKind === "REFERENCE")?.rows[0]
  const method = viewModel.sections.find((section) => section.entityKind === "METHOD")?.rows[0]
  const provider = viewModel.sections.find((section) => section.entityKind === "PROVIDER")?.rows[0]

  assert.ok(source)
  assert.ok(resource)
  assert.ok(reference)
  assert.ok(method)
  assert.ok(provider)

  assert.equal(source?.detail?.entityKind, "SOURCE")
  assert.equal(resource?.detail?.entityKind, "RESOURCE")
  assert.equal(reference?.detail?.entityKind, "REFERENCE")
  assert.equal(method?.detail?.entityKind, "METHOD")
  assert.equal(provider?.detail?.entityKind, "PROVIDER")

  assert.equal(source?.subtypeLabel, sourceEntity.sourceKind)
  assert.equal(resource?.subtypeLabel, resourceEntity.resourceKind)
  assert.equal(reference?.subtypeLabel, referenceEntity.referenceDomain)
  assert.equal(method?.subtypeLabel, methodEntity.methodDomain)
  assert.equal(provider?.subtypeLabel, providerEntity.providerKind)

  for (const row of [source, resource, reference, method, provider]) {
    assert.ok(row)
    assert.equal(Object.hasOwn(row, "recommendable"), false)
    assert.equal(Object.hasOwn(row, "modes"), false)
    assert.equal(Object.hasOwn(row, "location"), false)
    assert.equal(Object.hasOwn(row, "sourceUrl"), false)
  }

  assert.equal(Object.hasOwn(source?.detail ?? {}, "packageDescriptor"), true)
  assert.equal(Object.hasOwn(source?.detail ?? {}, "sourceUrl"), false)
  assert.equal(Object.hasOwn(resource?.detail ?? {}, "packageDescriptor"), true)
  assert.equal(Object.hasOwn(resource?.detail ?? {}, "supportedFrameworks"), true)
  assert.equal(Object.hasOwn(resource?.detail ?? {}, "supportedSurfaces"), true)
  assert.equal(Object.hasOwn(resource?.detail ?? {}, "supportedArtifacts"), true)
  assert.equal(Object.hasOwn(resource?.detail ?? {}, "supportedCapabilities"), true)
  assert.equal(Object.hasOwn(reference?.detail ?? {}, "authorityPolicy"), false)
  assert.equal(Object.hasOwn(method?.detail ?? {}, "sourceVerificationStatus"), false)
  assert.equal(Object.hasOwn(method?.detail ?? {}, "providerKind"), false)
  assert.equal(Object.hasOwn(provider?.detail ?? {}, "methodDefinition"), false)
  assert.equal(Object.hasOwn(provider?.detail ?? {}, "sourceUrl"), false)
  assert.equal(((source?.detail as RegistryV2SourceDetail | undefined)?.warnings?.length ?? 0), source?.warningCount)

  assert.equal(Object.isFrozen(sourceEntity.evidenceRecords!), false)
  assert.equal(Object.isFrozen(sourceEntity.evidenceRecords![0]), false)
  assert.equal(Object.isFrozen(sourceEntity.licenseEvidenceRecords!), false)
  assert.equal(Object.isFrozen(resourceEntity.supportedFrameworks!), false)
  assert.equal(Object.isFrozen(resourceEntity.supportedSurfaces!), false)
  assert.equal(Object.isFrozen(resourceEntity.supportedArtifacts!), false)
  assert.equal(Object.isFrozen(resourceEntity.supportedCapabilities!), false)
  assert.equal(Object.isFrozen(methodEntity.methodDefinition), false)
  assert.equal(Object.isFrozen(methodEntity.operationDefinition), false)
  assert.equal(Object.isFrozen(providerEntity.packageDescriptor!), false)

  sourceEntity.evidenceRecords![0].notes = "mutated source evidence"
  sourceEntity.licenseEvidenceRecords![0].notes = "mutated source license"
  if (sourceEntity.packageDescriptor) sourceEntity.packageDescriptor.packageName = "mutated source package"
  sourceEntity.authorityPolicy.humanReviewRequired = false
  sourceEntity.automationPolicy.operations.BROWSE = "PROHIBITED"
  resourceEntity.supportedFrameworks!.push("Svelte")
  resourceEntity.supportedSurfaces!.push("mobile")
  resourceEntity.supportedArtifacts!.push("widget")
  resourceEntity.supportedCapabilities!.push("inspect")
  if (resourceEntity.packageDescriptor) resourceEntity.packageDescriptor.packageName = "mutated resource package"
  if (referenceEntity.packageDescriptor) referenceEntity.packageDescriptor.packageName = "mutated reference package"
  methodEntity.methodDefinition.name = "mutated method name"
  methodEntity.operationDefinition.permission = "PROHIBITED"
  if (methodEntity.packageDescriptor) methodEntity.packageDescriptor.packageName = "mutated method package"
  if (providerEntity.packageDescriptor) providerEntity.packageDescriptor.packageName = "mutated provider package"

  assert.equal((source?.detail as RegistryV2SourceDetail | undefined)!.evidenceRecords[0].notes, "source evidence")
  assert.equal((source?.detail as RegistryV2SourceDetail | undefined)!.licenseEvidenceRecords[0].notes, "source license")
  assert.equal((source?.detail as RegistryV2SourceDetail | undefined)!.packageDescriptor?.packageName, "Test Source Registry V2")
  assert.equal((source?.detail as RegistryV2SourceDetail | undefined)!.authorityPolicy.humanReviewRequired, true)
  assert.equal((source?.detail as RegistryV2SourceDetail | undefined)!.automationPolicy.operations.BROWSE, "ALLOWED")
  assert.deepStrictEqual((resource?.detail as RegistryV2ResourceDetail | undefined)!.supportedFrameworks, ["Next.js"])
  assert.deepStrictEqual((resource?.detail as RegistryV2ResourceDetail | undefined)!.supportedSurfaces, ["registry"])
  assert.deepStrictEqual((resource?.detail as RegistryV2ResourceDetail | undefined)!.supportedArtifacts, ["page"])
  assert.deepStrictEqual((resource?.detail as RegistryV2ResourceDetail | undefined)!.supportedCapabilities, ["browse"])
  assert.equal((resource?.detail as RegistryV2ResourceDetail | undefined)!.packageDescriptor?.packageName, "Test Resource Registry V2")
  assert.equal((reference?.detail as RegistryV2ReferenceDetail | undefined)!.packageDescriptor?.packageName, "Test Reference Registry V2")
  assert.equal((method?.detail as RegistryV2MethodDetail | undefined)!.methodDefinition.name, "test_method_registry_v2 method")
  assert.equal((method?.detail as RegistryV2MethodDetail | undefined)!.operationDefinition.permission, "ALLOWED")
  assert.equal((method?.detail as RegistryV2MethodDetail | undefined)!.packageDescriptor?.packageName, "Test Method Registry V2")
  assert.equal((provider?.detail as RegistryV2ProviderDetail | undefined)!.packageDescriptor?.packageName, "Test Provider Registry V2")
})
