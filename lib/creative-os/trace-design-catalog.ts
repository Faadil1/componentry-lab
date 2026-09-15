import { registryComponents } from "@/lib/registry"
import { RESOURCE_REGISTRY } from "./registry"
import {
  TRACE_STUDIO_STATIC_ASSETS,
  type TraceDesignAsset,
  type TraceDesignAuthority,
  type TraceDesignConcern,
  type TraceDesignStatus,
} from "./trace-design-studio"

const REFERENCE_REGISTRY_RAW =
  "https://raw.githubusercontent.com/Faadil1/trace-design-workflow/main/registry/references.yaml"
const REFERENCE_REGISTRY_SOURCE =
  "https://github.com/Faadil1/trace-design-workflow/blob/main/registry/references.yaml"

const FULL_REFERENCE_REGISTRY_ASSET: TraceDesignAsset = {
  id: "canonical-reference-registry-source",
  name: "Canonical Reference Registry",
  kind: "REFERENCE",
  group: "Canonical Reference Registry",
  summary:
    "Authoritative full TRACE Design reference inventory. Runtime parsing is opportunistic; this source pointer remains visible even when the upstream repository is not readable from the deployed runtime.",
  status: "CANONICAL",
  authority: "READ_ONLY",
  source: "trace-design-workflow/registry/references.yaml",
  sourceUrl: REFERENCE_REGISTRY_SOURCE,
  concerns: ["COMPONENT_COMPOSITION", "AESTHETIC_LINEAGE", "ANTI_SLOP", "RUNTIME_ASSURANCE"],
}

function humanize(value: string): string {
  return value
    .replace(/^res_/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function safeExternalSourceUrl(value?: string | null): string | undefined {
  if (!value || value === "null") return undefined
  if (/github\.com\/example\//i.test(value)) return undefined
  if (/https?:\/\/(www\.)?example\.(com|org|net)(\/|$)/i.test(value)) return undefined
  return value
}

function mapAuthority(value: string): TraceDesignAuthority {
  switch (value) {
    case "SUGGEST":
    case "PREPARE":
    case "LOCAL_REVERSIBLE":
    case "EXPLICIT_EXTERNAL":
    case "READ_ONLY":
      return value
    default:
      return "NO_AUTHORITY"
  }
}

function mapResourceStatus(value: string): TraceDesignStatus {
  if (value === "APPROVED" || value === "VALIDATED") return "ACTIVE"
  if (value === "AUDITED") return "STABLE"
  if (value === "TEST_CANDIDATE" || value === "TESTING" || value === "CAPTURED") {
    return "DEVELOPMENT_CANDIDATE"
  }
  return "LAB"
}

function concernsForGate(gate?: string): TraceDesignConcern[] {
  switch (gate) {
    case "product_flow":
      return ["MOBILE_NATIVE_UX", "COMPONENT_COMPOSITION"]
    case "visual_direction":
      return ["AESTHETIC_LINEAGE", "ANTI_SLOP"]
    case "differentiation":
    case "uniqueness_audit":
      return ["ANTI_SLOP", "AESTHETIC_LINEAGE"]
    case "design_system":
      return ["COMPONENT_COMPOSITION", "BRAND_SYSTEM", "ACCESSIBILITY"]
    case "qa_polish":
      return ["RUNTIME_ASSURANCE", "ACCESSIBILITY"]
    case "typography_lock":
      return ["BRAND_SYSTEM", "AESTHETIC_LINEAGE"]
    case "visual_assets":
      return ["TEXTURE", "AESTHETIC_LINEAGE"]
    case "targeted_reference":
      return ["COMPONENT_COMPOSITION"]
    default:
      return ["COMPONENT_COMPOSITION"]
  }
}

function parseCanonicalReferenceRegistry(yaml: string): TraceDesignAsset[] {
  const lines = yaml.split(/\r?\n/)
  const result: TraceDesignAsset[] = []
  let current: { id: string; url?: string; gate?: string; role?: string; sourceClass?: string } | null = null

  const flush = () => {
    if (!current) return
    result.push({
      id: `canonical-ref-${current.id}`,
      name: humanize(current.id),
      kind: "REFERENCE",
      group: "Canonical Reference Registry",
      summary: [current.role, current.sourceClass, current.gate ? `Gate: ${humanize(current.gate)}` : null]
        .filter(Boolean)
        .join(" · ") || "Canonical TRACE Design reference registered in trace-design-workflow.",
      status: "CANONICAL",
      authority: "READ_ONLY",
      source: "trace-design-workflow/registry/references.yaml",
      sourceUrl: safeExternalSourceUrl(current.url),
      concerns: concernsForGate(current.gate),
    })
  }

  for (const line of lines) {
    const entry = line.match(/^  ([a-zA-Z0-9_-]+):\s*$/)
    if (entry) {
      flush()
      current = { id: entry[1] }
      continue
    }
    if (!current) continue

    const url = line.match(/^    url:\s*(.+?)\s*$/)
    if (url) current.url = url[1].replace(/^['"]|['"]$/g, "")

    const gate = line.match(/^    gate:\s*(.+?)\s*$/)
    if (gate) current.gate = gate[1].trim()

    const role = line.match(/^    role:\s*(.+?)\s*$/)
    if (role) current.role = humanize(role[1].trim())

    const sourceClass = line.match(/^    source_class:\s*(.+?)\s*$/)
    if (sourceClass) current.sourceClass = humanize(sourceClass[1].trim())
  }
  flush()
  return result
}

async function loadCanonicalReferences(): Promise<{ assets: TraceDesignAsset[]; synced: boolean }> {
  try {
    const response = await fetch(REFERENCE_REGISTRY_RAW, { next: { revalidate: 300 } })
    if (!response.ok) return { assets: [], synced: false }
    const yaml = await response.text()
    const assets = parseCanonicalReferenceRegistry(yaml)
    return { assets, synced: assets.length > 0 }
  } catch {
    return { assets: [], synced: false }
  }
}

function projectCreativeOsRegistry(): TraceDesignAsset[] {
  return RESOURCE_REGISTRY.map((resource) => ({
    id: `creative-os-${resource.id}`,
    name: resource.name,
    kind: resource.type === "SKILL" ? "SKILL" : "RESOURCE",
    group: `Creative OS · ${humanize(resource.type)}`,
    summary:
      resource.capabilities.capabilityGaps.length > 0
        ? `Capabilities: ${resource.capabilities.capabilityGaps.map(humanize).join(", ")}.`
        : `Governed Creative OS ${humanize(resource.type).toLowerCase()} resource.`,
    status: mapResourceStatus(resource.lifecycleState),
    authority: mapAuthority(resource.maxExecutionAuthority),
    source: resource.provenance,
    sourceUrl: safeExternalSourceUrl(resource.sourceUrl),
    modes: resource.modes,
    concerns: resource.capabilities.capabilityGaps.map((gap) => {
      const normalized = gap.toLowerCase()
      if (normalized.includes("camera") || normalized.includes("motion") || normalized.includes("video")) return "MOTION"
      if (normalized.includes("component") || normalized.includes("ui")) return "COMPONENT_COMPOSITION"
      if (normalized.includes("design") || normalized.includes("visual")) return "AESTHETIC_LINEAGE"
      return "EVIDENCE"
    }) as TraceDesignConcern[],
    tags: resource.capabilities.actions,
  }))
}

function projectComponentRegistry(): TraceDesignAsset[] {
  return registryComponents.map((entry) => ({
    id: `component-${entry.id}`,
    name: entry.label,
    kind: "COMPONENT",
    group: `Component Registry · ${humanize(entry.kind)}`,
    summary: entry.summary,
    status: entry.maturity === "production-candidate" ? "ACTIVE" : entry.maturity === "reusable" ? "STABLE" : "LAB",
    authority: "LOCAL_REVERSIBLE",
    source: entry.sourcePaths.join(", ") || "Component Registry V2",
    href: entry.route,
    concerns: ["COMPONENT_COMPOSITION", ...(entry.capabilities.includes("reduced-motion") ? ["ACCESSIBILITY" as const] : [])],
    tags: [...entry.tags, ...entry.capabilities],
  }))
}

function dedupeAssets(assets: TraceDesignAsset[]): TraceDesignAsset[] {
  const seen = new Set<string>()
  const output: TraceDesignAsset[] = []

  for (const asset of assets) {
    const key = (asset.sourceUrl || asset.name).toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
    if (seen.has(key)) continue
    seen.add(key)
    output.push(asset)
  }
  return output
}

export interface TraceDesignCatalogSnapshot {
  assets: TraceDesignAsset[]
  sync: {
    canonicalReferenceRegistry: boolean
    canonicalReferenceCount: number
    staticStudioCount: number
    creativeOsCount: number
    componentRegistryCount: number
  }
}

export async function buildTraceDesignCatalog(): Promise<TraceDesignCatalogSnapshot> {
  const canonical = await loadCanonicalReferences()
  const creativeOs = projectCreativeOsRegistry()
  const components = projectComponentRegistry()

  const assets = dedupeAssets([
    ...TRACE_STUDIO_STATIC_ASSETS,
    FULL_REFERENCE_REGISTRY_ASSET,
    ...canonical.assets,
    ...creativeOs,
    ...components,
  ])

  return {
    assets,
    sync: {
      canonicalReferenceRegistry: canonical.synced,
      canonicalReferenceCount: canonical.assets.length,
      staticStudioCount: TRACE_STUDIO_STATIC_ASSETS.length + 1,
      creativeOsCount: creativeOs.length,
      componentRegistryCount: components.length,
    },
  }
}
