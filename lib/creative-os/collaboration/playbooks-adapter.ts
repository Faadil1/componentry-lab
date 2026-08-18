import { searchPlaybooks } from "../../playbooks"
import type {
  CollaborationJsonValue,
  CollaborationRequest,
  CollaborationResult,
  CollaborationValidationReport,
} from "./types"
import { COLLABORATION_SCHEMA_VERSION } from "./types"
import { validateCollaborationRequest, validateCollaborationResult } from "./validation"

export interface PlaybooksCollaborationProjection {
  valid: boolean
  errors: readonly string[]
  result: CollaborationResult | null
}

function jsonValue(value: unknown): CollaborationJsonValue {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw new Error("Playbooks collaboration payload is not JSON serializable")
  return JSON.parse(serialized) as CollaborationJsonValue
}

function getQuery(request: CollaborationRequest): string {
  const query = request.structuredInputs.query
  return typeof query === "string" ? query.trim() : ""
}

function getLimit(request: CollaborationRequest): number {
  const raw = request.structuredInputs.limit
  if (typeof raw !== "number" || !Number.isInteger(raw)) return 5
  return Math.min(Math.max(raw, 1), 10)
}

function validatePlaybooksRequest(request: CollaborationRequest): CollaborationValidationReport {
  const base = validateCollaborationRequest(request)
  const errors = [...base.errors]

  if (request.sourceSystem !== "CREATIVE_DIRECTOR") {
    errors.push("Playbooks knowledge request must originate from CREATIVE_DIRECTOR")
  }
  if (request.targetSystem !== "PLAYBOOKS") {
    errors.push("Playbooks knowledge request must target PLAYBOOKS")
  }
  if (request.intent !== "REQUEST_CONTEXT") {
    errors.push("Playbooks knowledge request intent must be REQUEST_CONTEXT")
  }
  if (request.requestedEffectClass !== "NONE") {
    errors.push("Playbooks collaboration is read-only and requires effect class NONE")
  }
  if (request.authorityContext.requestedAuthority !== "READ_ONLY" && request.authorityContext.requestedAuthority !== "SUGGEST") {
    errors.push("Playbooks knowledge lookup requires READ_ONLY or SUGGEST requested authority")
  }
  if (!getQuery(request)) {
    errors.push("Playbooks knowledge lookup requires structuredInputs.query")
  }

  return { valid: errors.length === 0, errors }
}

export function projectPlaybooksKnowledgeCollaboration(
  request: CollaborationRequest,
): PlaybooksCollaborationProjection {
  const requestValidation = validatePlaybooksRequest(request)
  if (!requestValidation.valid) {
    return { valid: false, errors: requestValidation.errors, result: null }
  }

  const query = getQuery(request)
  const limit = getLimit(request)
  const matches = searchPlaybooks(query).slice(0, limit)

  const projectedMatches = matches.map(({ entry, score, matchedFields }) => ({
    playbookRef: `playbooks:${entry.id}`,
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    classification: entry.classification,
    collectionId: entry.collectionId,
    format: entry.format,
    phases: [...entry.phases],
    audiences: [...entry.audiences],
    outcomes: [...entry.outcomes],
    maturity: entry.maturity,
    ecosystemTarget: entry.ecosystemTarget,
    source: entry.source,
    canonical: entry.canonical,
    relatedRegistryIds: [...entry.relatedRegistryIds],
    relatedPlaybookIds: [...entry.relatedPlaybookIds],
    recommendedFor: [...entry.recommendedFor],
    limitations: [...entry.limitations],
    score,
    matchedFields: [...matchedFields],
  }))

  const limitations = [
    "Playbooks collaboration returns metadata/search evidence only; full Markdown content is not transferred through this adapter.",
    "Playbook or public-reference classification never grants execution authority.",
  ]

  const result: CollaborationResult = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: request.projectId,
    correlationId: request.correlationId,
    sourceSystem: "PLAYBOOKS",
    targetSystem: "CREATIVE_DIRECTOR",
    capabilityUsed: null,
    resultStatus: projectedMatches.length > 0 ? "COMPLETE" : "NO_MATCH",
    structuredOutput: {
      query,
      matchCount: projectedMatches.length,
      matches: jsonValue(projectedMatches),
    },
    qualityResults: [],
    evidenceRefs: [
      ...request.evidenceRefs,
      ...projectedMatches.map((match) => match.playbookRef),
    ],
    provenanceRefs: ["playbooks:catalog", "playbooks:search-index"],
    limitations,
    recommendedNextStep:
      projectedMatches.length > 0
        ? "Use matching playbook metadata as advisory context; preserve Registry V2 authority for any capability decision."
        : "Continue without fabricated playbook evidence or refine the knowledge query.",
    sideEffectRequest: null,
  }

  const resultValidation = validateCollaborationResult(result)
  if (!resultValidation.valid) {
    return { valid: false, errors: resultValidation.errors, result: null }
  }

  return { valid: true, errors: [], result }
}
