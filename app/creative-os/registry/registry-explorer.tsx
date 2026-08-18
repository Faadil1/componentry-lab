"use client"

import * as React from "react"

import { Button } from "../../../components/ui/button"
import type { AuthorityCeiling, ResourceLifecycleState } from "../../../lib/creative-os/types"
import type { CreativeMethodDefinition } from "../../../lib/creative-os/methods/types"
import type { AutomationOperation, AutomationPolicy, LibraryEntityKind, OperationDefinition, ProjectionWarning } from "../../../lib/creative-os/library-v2"
import type {
  RegistryV2AuthoritySignal,
  RegistryV2Detail,
  RegistryV2Row,
  RegistryV2ViewModel,
} from "./registry-view-model"

export type RegistryV2AuthorityFilter = AuthorityCeiling | "NOT_MODELED"

export type RegistryV2ExplorerFilters = {
  readonly search: string
  readonly entityKinds: readonly LibraryEntityKind[]
  readonly lifecycleStates: readonly ResourceLifecycleState[]
  readonly authority: readonly RegistryV2AuthorityFilter[]
  readonly warningOnly: boolean
}

const LIFECYCLE_ORDER: readonly ResourceLifecycleState[] = [
  "APPROVED",
  "VALIDATED",
  "AUDITED",
  "CAPTURED",
  "TEST_CANDIDATE",
  "TESTING",
  "REJECTED",
  "DEPRECATED",
  "SUPERSEDED"
]

const AUTOMATION_OPERATION_ORDER: readonly AutomationOperation[] = [
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

function entityKindLabel(entityKind: LibraryEntityKind): string {
  switch (entityKind) {
    case "SOURCE":
      return "Source"
    case "RESOURCE":
      return "Resource"
    case "REFERENCE":
      return "Reference"
    case "METHOD":
      return "Method"
    case "PROVIDER":
      return "Provider"
  }
}

function formatAuthority(authority: RegistryV2AuthoritySignal): string {
  return authority.kind === "MODELED" ? authority.maximumAuthority : "NOT MODELED"
}

function matches(source: string, query: string): boolean {
  return source.toLowerCase().includes(query.toLowerCase())
}

function toggleValue<T extends string>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value]
}

function buildDefaultFilters(model: RegistryV2ViewModel, entityKinds: readonly LibraryEntityKind[]): RegistryV2ExplorerFilters {
  const lifecycleStates = Array.from(new Set(model.sections.flatMap((section) => section.rows.map((row) => row.lifecycleState))))
  const authority = Array.from(
    new Set(
      model.sections.flatMap((section) =>
        section.rows.map((row) => (row.authority.kind === "MODELED" ? row.authority.maximumAuthority : "NOT_MODELED"))
      )
    )
  ) as RegistryV2AuthorityFilter[]

  return {
    search: "",
    entityKinds: [...entityKinds],
    lifecycleStates: lifecycleStates.length > 0 ? lifecycleStates : [...LIFECYCLE_ORDER],
    authority,
    warningOnly: false
  }
}

function filterRows(rows: readonly RegistryV2Row[], filters: RegistryV2ExplorerFilters): readonly RegistryV2Row[] {
  const search = filters.search.trim()
  return rows.filter((row) => {
    if (!filters.entityKinds.includes(row.entityKind)) return false
    if (!filters.lifecycleStates.includes(row.lifecycleState)) return false
    if (filters.warningOnly && row.warningCount === 0) return false
    if (
      !(
        row.authority.kind === "NOT_MODELED"
          ? filters.authority.includes("NOT_MODELED")
          : filters.authority.includes(row.authority.maximumAuthority)
      )
    ) {
      return false
    }

    if (!search) return true
    return matches(row.id, search) || matches(row.name, search) || matches(row.subtypeLabel, search)
  })
}

const SUBTYPE_BADGE_CLASS = "border-border bg-muted text-foreground"
const LIFECYCLE_BADGE_CLASS = "border-border bg-muted text-muted-foreground"

function authorityClass(
  authority: RegistryV2AuthoritySignal
): string {
  return authority.kind === "MODELED"
    ? "border-border bg-card text-foreground"
    : "border-dashed border-border bg-transparent text-muted-foreground"
}

function warningClass(hasWarnings: boolean): string {
  return hasWarnings
    ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    : "border-border bg-muted text-muted-foreground"
}

function railClass(entityKind: LibraryEntityKind): string {
  switch (entityKind) {
    case "SOURCE":
      return "border-l-slate-400"
    case "RESOURCE":
      return "border-l-emerald-400"
    case "REFERENCE":
      return "border-l-violet-400"
    case "METHOD":
      return "border-l-amber-400"
    case "PROVIDER":
      return "border-l-cyan-400"
  }
}

function locationFor(detail: RegistryV2Detail | null): { label: string; href?: string } | null {
  if (!detail) return null
  if (detail.entityKind === "SOURCE") {
    if (detail.sourceUrl) return { label: detail.sourceUrl, href: detail.sourceUrl }
    return { label: detail.locator }
  }

  const locator = detail.packageDescriptor?.packageLocator
  if (!locator) return null
  return /^https?:\/\//i.test(locator) ? { label: locator, href: locator } : { label: locator }
}

function renderPackageDescriptor(packageDescriptor: NonNullable<RegistryV2Detail["packageDescriptor"]>) {
  const packageLocator = packageDescriptor.packageLocator
  const packageLocatorIsLink = Boolean(packageLocator && /^https?:\/\//i.test(packageLocator))

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Package descriptor</p>
      <div className="mt-2 grid gap-1 text-sm text-foreground">
        <div><span className="text-muted-foreground">Type:</span> {packageDescriptor.packageType}</div>
        <div><span className="text-muted-foreground">Name:</span> {packageDescriptor.packageName}</div>
        {packageLocator ? (
          <div>
            <span className="text-muted-foreground">Locator:</span>{" "}
            {packageLocatorIsLink ? (
              <a href={packageLocator} target="_blank" rel="noreferrer" className="break-all text-blue-700 underline-offset-2 hover:underline dark:text-blue-300">
                {packageLocator}
              </a>
            ) : (
              <span className="break-all">{packageLocator}</span>
            )}
          </div>
        ) : null}
        {packageDescriptor.packageVersion ? <div><span className="text-muted-foreground">Version:</span> {packageDescriptor.packageVersion}</div> : null}
      </div>
    </div>
  )
}

function renderAutomationPolicy(automationPolicy: AutomationPolicy) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Automation policy</p>
      <div className="mt-2 grid gap-1 text-sm">
        {AUTOMATION_OPERATION_ORDER.map((operation) => (
          <div key={operation} className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{operation}</span>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground">{automationPolicy.operations[operation]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderMethodDefinition(methodDefinition: CreativeMethodDefinition) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Method definition</p>
      <div className="mt-2 grid gap-1 text-sm text-foreground">
        <div><span className="text-muted-foreground">ID:</span> {methodDefinition.id}</div>
        <div><span className="text-muted-foreground">Resource ID:</span> {methodDefinition.resourceId}</div>
        <div><span className="text-muted-foreground">Name:</span> {methodDefinition.name}</div>
        <div><span className="text-muted-foreground">Version:</span> {methodDefinition.version}</div>
        <div><span className="text-muted-foreground">Supported modes:</span> {methodDefinition.supportedModes.join(", ") || "NONE"}</div>
        <div><span className="text-muted-foreground">Supported phases:</span> {methodDefinition.supportedPhases.join(", ") || "NONE"}</div>
        <div><span className="text-muted-foreground">Capability gaps:</span> {methodDefinition.capabilityGaps.join(", ") || "NONE"}</div>
        <div><span className="text-muted-foreground">Required inputs:</span> {methodDefinition.requiredInputs.join(", ") || "NONE"}</div>
        <div><span className="text-muted-foreground">Optional inputs:</span> {methodDefinition.optionalInputs.join(", ") || "NONE"}</div>
        <div><span className="text-muted-foreground">Output schema:</span> {methodDefinition.outputSchemaId}</div>
        <div><span className="text-muted-foreground">Quality gates:</span> {methodDefinition.qualityGateIds.join(", ") || "NONE"}</div>
        <div><span className="text-muted-foreground">Authority required:</span> {methodDefinition.authorityRequired}</div>
        <div><span className="text-muted-foreground">Deterministic:</span> {methodDefinition.deterministic ? "true" : "false"}</div>
      </div>
    </div>
  )
}

function renderOperationDefinition(operationDefinition: OperationDefinition) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Operation definition</p>
      <div className="mt-2 grid gap-1 text-sm text-foreground">
        <div><span className="text-muted-foreground">Operation ID:</span> {operationDefinition.operationId}</div>
        <div><span className="text-muted-foreground">Name:</span> {operationDefinition.operationName}</div>
        <div><span className="text-muted-foreground">Operator:</span> {operationDefinition.operator}</div>
        <div><span className="text-muted-foreground">Effect class:</span> {operationDefinition.effectClass}</div>
        <div><span className="text-muted-foreground">Output role:</span> {operationDefinition.outputRole}</div>
        <div><span className="text-muted-foreground">Permission:</span> {operationDefinition.permission}</div>
      </div>
    </div>
  )
}

function renderAutomationAndLifecycle(detail: RegistryV2Detail) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {"authorityPolicy" in detail ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Authority policy</p>
          <div className="mt-2 grid gap-1 text-sm text-foreground">
            <div><span className="text-muted-foreground">Maximum:</span> {detail.authorityPolicy.maximumAuthority}</div>
            <div><span className="text-muted-foreground">Requested:</span> {detail.authorityPolicy.requestedAuthority}</div>
            <div><span className="text-muted-foreground">Human review:</span> {detail.authorityPolicy.humanReviewRequired ? "yes" : "no"}</div>
          </div>
        </div>
      ) : null}
      {"automationPolicy" in detail ? renderAutomationPolicy(detail.automationPolicy) : null}
    </div>
  )
}

function renderEvidenceRecords(row: RegistryV2Row) {
  const detail = row.detail
  if (!detail) return null

  return (
    <div className="grid gap-4 text-sm text-foreground lg:grid-cols-2">
      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Evidence</p>
        <div className="space-y-2">
          {detail.evidenceRecords.map((record, index) => (
            <div key={`${row.id}-evidence-${index}`} className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono uppercase tracking-[0.18em] text-muted-foreground">{record.evidenceType}</span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono uppercase tracking-[0.18em] text-muted-foreground">{record.status}</span>
              </div>
              <div className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{record.locator}</div>
              {record.notes ? <p className="mt-1 text-sm text-foreground">{record.notes}</p> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">License / status</p>
        <div className="space-y-2">
          {detail.licenseEvidenceRecords.map((record, index) => (
            <div key={`${row.id}-license-${index}`} className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono uppercase tracking-[0.18em] text-muted-foreground">{record.licenseValue}</span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono uppercase tracking-[0.18em] text-muted-foreground">{record.status}</span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono uppercase tracking-[0.18em] text-muted-foreground">{record.scope}</span>
              </div>
              <div className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{record.locator}</div>
              {record.notes ? <p className="mt-1 text-sm text-foreground">{record.notes}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderDetail(row: RegistryV2Row, warnings: readonly ProjectionWarning[]) {
  if (!row.detail) return null
  const detail = row.detail

  return (
    <div className="grid gap-4 text-sm text-foreground lg:grid-cols-2">
      <div className="space-y-4">
        {renderEvidenceRecords(row)}
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Provenance</p>
          <div className="mt-2 break-all font-mono text-[12px] text-foreground">{detail.provenance}</div>
        </div>
        {detail.packageDescriptor ? renderPackageDescriptor(detail.packageDescriptor) : null}
      </div>

      <div className="space-y-4">
        {renderAutomationAndLifecycle(detail)}

        {detail.entityKind === "SOURCE" ? (
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Source</p>
              <div className="mt-2 grid gap-1 text-sm text-foreground">
                <div><span className="text-muted-foreground">Kind:</span> {detail.sourceKind}</div>
                <div><span className="text-muted-foreground">Verification:</span> {detail.sourceVerificationStatus}</div>
                <div><span className="text-muted-foreground">Compatibility:</span> {detail.compatibilityEvidenceStatus ?? "NOT MODELED"}</div>
                {detail.sourceUrl ? (
                  <div>
                    <span className="text-muted-foreground">Source URL:</span>{" "}
                    <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-blue-700 underline-offset-2 hover:underline dark:text-blue-300">
                      {detail.sourceUrl}
                    </a>
                  </div>
                ) : null}
                {detail.sourceUrl && detail.sourceUrl !== detail.locator ? (
                  <div><span className="text-muted-foreground">Locator:</span> {detail.locator}</div>
                ) : null}
                {!detail.sourceUrl ? <div><span className="text-muted-foreground">Locator:</span> {detail.locator}</div> : null}
              </div>
            </div>
          </div>
        ) : null}

        {detail.entityKind === "RESOURCE" ? (
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Resource</p>
              <div className="mt-2 grid gap-1 text-sm text-foreground">
                <div><span className="text-muted-foreground">Kind:</span> {detail.resourceKind}</div>
                <div><span className="text-muted-foreground">Compatibility:</span> {detail.compatibilityEvidenceStatus ?? "NOT MODELED"}</div>
                {detail.supportedFrameworks ? <div><span className="text-muted-foreground">Supported frameworks:</span> {detail.supportedFrameworks.join(", ") || "NONE"}</div> : null}
                {detail.supportedSurfaces ? <div><span className="text-muted-foreground">Supported surfaces:</span> {detail.supportedSurfaces.join(", ") || "NONE"}</div> : null}
                {detail.supportedArtifacts ? <div><span className="text-muted-foreground">Supported artifacts:</span> {detail.supportedArtifacts.join(", ") || "NONE"}</div> : null}
                {detail.supportedCapabilities ? <div><span className="text-muted-foreground">Supported capabilities:</span> {detail.supportedCapabilities.join(", ") || "NONE"}</div> : null}
              </div>
            </div>
          </div>
        ) : null}

        {detail.entityKind === "REFERENCE" ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
            <div className="mt-2 grid gap-1 text-sm text-foreground">
              <div><span className="text-muted-foreground">Domain:</span> {detail.referenceDomain}</div>
              <div><span className="text-muted-foreground">Stage affinity:</span> {detail.stageAffinity}</div>
              <div><span className="text-muted-foreground">Usage mode:</span> {detail.usageMode}</div>
            </div>
          </div>
        ) : null}

        {detail.entityKind === "METHOD" ? (
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Method</p>
              <div className="mt-2 grid gap-1 text-sm text-foreground">
                <div><span className="text-muted-foreground">Domain:</span> {detail.methodDomain}</div>
                <div><span className="text-muted-foreground">Recipe promotion:</span> {detail.recipePromotionStatus}</div>
              </div>
            </div>
            {renderMethodDefinition(detail.methodDefinition)}
            {renderOperationDefinition(detail.operationDefinition)}
          </div>
        ) : null}

        {detail.entityKind === "PROVIDER" ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Provider</p>
            <div className="mt-2 grid gap-1 text-sm text-foreground">
              <div><span className="text-muted-foreground">Kind:</span> {detail.providerKind}</div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Warnings</p>
          {warnings.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={`${row.id}-warning-${index}`} className="text-sm text-amber-700 dark:text-amber-300">
                  {warning.code}: {warning.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No warnings for this row.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function zeroStateMessage(entityKind: LibraryEntityKind): string {
  switch (entityKind) {
    case "SOURCE":
      return "No sources are registered."
    case "RESOURCE":
      return "No resources are registered."
    case "REFERENCE":
      return "No references are registered."
    case "METHOD":
      return "No methods are registered."
    case "PROVIDER":
      return "No providers are registered."
  }
}

export function RegistryExplorer({ viewModel }: { readonly viewModel: RegistryV2ViewModel }) {
  const entityKinds = React.useMemo(() => viewModel.sections.map((section) => section.entityKind), [viewModel.sections])
  const defaultFilters = React.useMemo(() => buildDefaultFilters(viewModel, entityKinds), [viewModel, entityKinds])
  const [filters, setFilters] = React.useState<RegistryV2ExplorerFilters>(defaultFilters)
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set())

  const visibleSections = React.useMemo(() => {
    return viewModel.sections.map((section) => {
      const visibleRows = filterRows(section.rows, filters)
      return {
        ...section,
        visibleRows,
        visibleCount: visibleRows.length
      }
    })
  }, [viewModel.sections, filters])

  const visibleRowCount = visibleSections.reduce((total, section) => total + section.visibleCount, 0)
  const hasVisibleZeroState = visibleRowCount === 0 && viewModel.summary.total > 0

  if (!viewModel.valid) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-border bg-card px-4 py-5 shadow-sm" role="alert">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Registry model invalid</p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-foreground">Registry model invalid</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The registry view model failed validation and cannot be rendered as an empty registry.
          </p>
          {viewModel.warnings.length > 0 ? (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">Warnings: {viewModel.warnings.length}</p>
          ) : null}
          <div className="mt-4 space-y-2">
            {viewModel.errors.map((error, index) => (
              <div key={`${error}-${index}`} className="rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-foreground">
                {error}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm transition-colors duration-150 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Search</span>
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="name, id, subtype"
                aria-label="Search registry"
              />
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(buildDefaultFilters(viewModel, entityKinds))}
              className="transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Reset filters
            </Button>
          </div>

          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Entity</span>
              {entityKinds.map((entityKind) => {
                const active = filters.entityKinds.includes(entityKind)
                return (
                  <button
                    key={entityKind}
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, entityKinds: toggleValue(current.entityKinds, entityKind) }))}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-muted"}`}
                  >
                    {entityKindLabel(entityKind)}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Lifecycle</span>
              {LIFECYCLE_ORDER.map((state) => {
                const active = filters.lifecycleStates.includes(state)
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, lifecycleStates: toggleValue(current.lifecycleStates, state) }))}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${active ? LIFECYCLE_BADGE_CLASS : "border-border bg-card text-muted-foreground hover:bg-muted"}`}
                  >
                    {state}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Authority</span>
              {Array.from(
                new Set(
                  viewModel.sections.flatMap((section) =>
                    section.rows.map((row) => (row.authority.kind === "MODELED" ? row.authority.maximumAuthority : "NOT_MODELED"))
                  )
                )
              ).map((authority) => {
                const value = authority as RegistryV2AuthorityFilter
                const active = filters.authority.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, authority: toggleValue(current.authority, value) }))}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-muted"}`}
                  >
                    {value === "NOT_MODELED" ? "Not modeled" : value}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setFilters((current) => ({ ...current, warningOnly: !current.warningOnly }))}
                className={`rounded-full border px-3 py-1 text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${warningClass(filters.warningOnly)}`}
              >
                Warning only
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-10 sm:px-6 lg:px-8">
        <header className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">Total {viewModel.summary.total}</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">Warnings {viewModel.summary.warningCount}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {Object.entries(viewModel.summary.countsByKind).map(([kind, count]) => (
              <span key={kind} className="rounded-full border border-border bg-card px-2 py-1">
                {kind} {count}
              </span>
            ))}
            {Object.entries(viewModel.summary.methodCountsByDomain).map(([domain, count]) => (
              <span key={domain} className="rounded-full border border-border bg-card px-2 py-1">
                {domain} {count}
              </span>
            ))}
          </div>
        </header>

        {hasVisibleZeroState ? (
          <div className="mb-6 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            No registry rows match the active filters.
          </div>
        ) : null}

        <div className="space-y-8">
          {visibleSections.map((section) => {
            const emptyMessage = section.count === 0 ? zeroStateMessage(section.entityKind) : "No rows in this section match the active filters."
            return (
              <section key={section.entityKind} className={`rounded-3xl border border-border bg-card shadow-sm ${railClass(section.entityKind)}`}>
                <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
                  <div>
                    <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{section.label}</h2>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{section.entityKind}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="rounded-full border border-border bg-muted px-3 py-1">Canonical {section.count}</span>
                    <span className="rounded-full border border-border bg-muted px-3 py-1">Visible {section.visibleCount}</span>
                  </div>
                </header>

                <div className="divide-y divide-border">
                  {section.count === 0 || section.visibleCount === 0 ? (
                    <div className="px-4 py-5 text-sm text-muted-foreground sm:px-6">{emptyMessage}</div>
                  ) : null}

                  {section.visibleRows.map((row) => {
                    const expanded = openIds.has(row.id)
                    const detailId = `registry-detail-${row.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`
                    const location = locationFor(row.detail)
                    const warnings = row.detail?.warnings ?? []

                    return (
                      <div key={row.id} className="px-4 py-4 sm:px-6">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-[15px] font-semibold tracking-tight text-foreground">{row.name}</div>
                                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{row.id}</div>
                              </div>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${SUBTYPE_BADGE_CLASS}`}>{row.subtypeLabel}</span>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${LIFECYCLE_BADGE_CLASS}`}>{row.lifecycleState}</span>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${authorityClass(row.authority)}`}>{formatAuthority(row.authority)}</span>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${warningClass(row.warningCount > 0)}`}>
                                {row.warningCount > 0 ? `${row.warningCount} warning${row.warningCount === 1 ? "" : "s"}` : "No warnings"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                              <span className="rounded-full border border-border bg-muted px-2 py-1">
                                Evidence {row.evidence.evidenceStatuses.join(", ") || "NONE"}
                              </span>
                              <span className="rounded-full border border-border bg-muted px-2 py-1">
                                License {row.evidence.licenseStatuses.join(", ") || "NONE"}
                              </span>
                              {row.evidence.sourceVerificationStatus ? (
                                <span className="rounded-full border border-border bg-muted px-2 py-1">
                                  Source {row.evidence.sourceVerificationStatus}
                                </span>
                              ) : null}
                              {row.evidence.compatibilityEvidenceStatus ? (
                                <span className="rounded-full border border-border bg-muted px-2 py-1">
                                  Compatibility {row.evidence.compatibilityEvidenceStatus}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-2 lg:items-end">
                            <div className="text-sm text-foreground">
                              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Provenance</span>
                              <div className="break-all font-mono text-[12px]">{row.provenance}</div>
                            </div>

                            {location ? (
                              <div className="text-sm text-foreground lg:text-right">
                                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Location</span>
                                {location.href ? (
                                  <a href={location.href} className="block break-all text-blue-700 underline-offset-2 hover:underline dark:text-blue-300" target="_blank" rel="noreferrer">
                                    {location.label}
                                  </a>
                                ) : (
                                  <div className="break-all">{location.label}</div>
                                )}
                              </div>
                            ) : null}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setOpenIds((current) => {
                                  const next = new Set(current)
                                  if (next.has(row.id)) {
                                    next.delete(row.id)
                                  } else {
                                    next.add(row.id)
                                  }
                                  return next
                                })
                              }
                              aria-expanded={expanded}
                              aria-controls={detailId}
                              className="transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              {expanded ? "Hide details" : "Show details"}
                            </Button>
                          </div>
                        </div>

                        {expanded ? (
                          <div id={detailId} className="mt-4 rounded-2xl border border-border bg-muted p-4">
                            {renderDetail(row, warnings)}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
