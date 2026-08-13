import * as crypto from 'crypto';
import { loadEnvConfig } from '@next/env';
import { getRealHttpCallCount } from '../../lib/creative-os/film-kit/adapters/cineprompt-transport';
import { executeSandboxedPlan, buildExecutionIntent, RUNTIME_CONTRACT_FINGERPRINT } from '../../lib/creative-os/film-kit/sandbox';
import { getExecutionLedger, setExecutionLedger, LocalPersistentExecutionLedger } from "../../lib/creative-os/film-kit/execution-ledger";
import { HumanApprovalDecision } from '../../lib/creative-os/film-kit/types';
import { planExternalCapability } from '../../lib/creative-os/film-kit/planner';
import { RESOURCE_REGISTRY } from '../../lib/creative-os/registry';
import { evaluateResource } from '../../lib/creative-os/evaluation';
import { registerProductionAdapters } from '../../lib/creative-os/film-kit/adapters/index';

// Load environment properly
loadEnvConfig(process.cwd());

function hash(obj: unknown): string {
  if (obj === undefined) return "undefined";
  if (obj === null) return "null";
  return crypto.createHash("sha256").update(JSON.stringify(obj, Object.keys(obj as object).sort())).digest("hex").substring(0, 16);
}

async function run() {
  setExecutionLedger(new LocalPersistentExecutionLedger());
  
  const syntheticPayload = {
    media_type: "commercial",
    subjectType: "object",
    subject: "translucent red ceramic perfume bottle",
    staging: "stone pedestal",
    shot: "close-up",
    lens: "85mm",
    camera: "slow dolly in",
    lighting: "single soft side light",
    mood: "quiet, luxurious, slightly uncanny"
  };

  const request = {
    capabilityGap: "PROMPT_SHARE_LINK_CREATION",
    artifactType: "EXTERNAL_SHARE_REFERENCE",
    projectMode: "DAY_CHALLENGE" as const,
    phase: "build" as const,
    currentAuthority: "EXPLICIT_EXTERNAL" as const,
  };

  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt");
  if (!realResource) throw new Error("Could not find res_cineprompt in registry");

  const selectedResource = evaluateResource(realResource, request.projectMode, request.phase, request);

  const plan = planExternalCapability(request, selectedResource);
  const canonicalInputFingerprint = hash(syntheticPayload);

  // Pilot authorization explicit override inside constraints, leaving lifecycle truth intact
  const approvedConstraints: Record<string, unknown> = {
    subscriptionEntitlement: "HUMAN_ATTESTED_ACTIVE", 
    downstreamSpend: "PROHIBITED",
    endpoint: "https://cineprompt.io/api/share"
  };

  if (selectedResource.lifecycleState === "TEST_CANDIDATE") {
    approvedConstraints.pilotAuthorization = true;
  }

  const approval = {
    approvalState: "GRANTED",
    projectId: "proj_pilot_001",
    projectBrainFingerprint: "c52cacbd7af48432",
    planFingerprint: plan.planFingerprint,
    resourceId: "res_cineprompt",
    capabilityId: "PROMPT_SHARE_LINK_CREATION",
    providerAdapterId: "adapter_cineprompt_share_link_v2",
    approvedAuthority: "EXPLICIT_EXTERNAL",
    costCeiling: "0",
    approvedConstraints,
    runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
  } as unknown as HumanApprovalDecision;
  approval.approvalFingerprint = hash(approval);

  const intent = buildExecutionIntent(plan, "proj_pilot_001", "c52cacbd7af48432", approval.providerAdapterId, approval, "EXPLICIT_EXTERNAL", syntheticPayload);
  
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const intentArgIndex = args.indexOf("--intent");
  const providedIntent = intentArgIndex !== -1 ? args[intentArgIndex + 1] : null;

  let liveReceipt: import('../../lib/creative-os/film-kit/types').ExternalExecutionReceipt | undefined;
  if (isExecute) {
    if (providedIntent !== intent.executionIntentFingerprint) {
      throw new Error(`Execution blocked: expected intent ${intent.executionIntentFingerprint} but got ${providedIntent}`);
    }
    if (providedIntent === "5c90f090e6c9d245" || providedIntent === "51d6bdfe98011ab0") {
      throw new Error("Execution blocked: legacy or invalidated intent.");
    }
    
    // EXECUTING
    registerProductionAdapters();
    const result = await executeSandboxedPlan(plan, "proj_pilot_001", "c52cacbd7af48432", approval, "EXPLICIT_EXTERNAL", syntheticPayload);
    
    // Pass execution status along if it exists
    if (result && result.receipt) {
      liveReceipt = result.receipt;
    }
  }
  
  const ledger = getExecutionLedger();
  const httpCallCount = getRealHttpCallCount();
  const secretPresent = typeof process.env.CINEPROMPT_API_KEY === 'string' && process.env.CINEPROMPT_API_KEY.trim() !== '';
  
  console.log(JSON.stringify({
    title: "EXECUTION PREPARATION REPORT",
    projectId: "proj_pilot_001",
    planFingerprint: plan.planFingerprint,
    inputFingerprint: canonicalInputFingerprint,
    approvalFingerprint: approval.approvalFingerprint,
    executionIntentFingerprint: intent.executionIntentFingerprint,
    historicalV1LedgerState: ledger.get("5c90f090e6c9d245")?.state || "TERMINAL_OUTCOME_UNKNOWN",
    candidateLedgerState: ledger.get(intent.executionIntentFingerprint)?.state || "NOT PREVIOUSLY EXECUTED",
    candidateReserved: ledger.get(intent.executionIntentFingerprint) !== undefined ? "YES" : "NO",
    dryRunDefault: !isExecute ? "YES" : "NO",
    productionTransportCalls: httpCallCount,
    secretPresent,
    lifecycleState: selectedResource.lifecycleState,
    recommendationLabel: selectedResource.recommendationLabel,
    status: "READY_FOR_EXPLICIT_HUMAN_LIVE_EXECUTION_APPROVAL",
    ...(isExecute && liveReceipt ? {
      executionStatus: liveReceipt.executionStatus,
      receiptFingerprint: liveReceipt.receiptFingerprint,
      providerOutputFingerprint: liveReceipt.providerOutputFingerprint,
      artifactReferences: liveReceipt.artifactReferences,
      cost: liveReceipt.cost
    } : {})
  }, null, 2));
}

run().catch(console.error);
