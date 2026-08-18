import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const scriptA = `
import { LocalPersistentExecutionLedger } from '../../lib/creative-os/film-kit/execution-ledger';
const ledger = new LocalPersistentExecutionLedger();
const res = ledger.get('5c90f090e6c9d245');
console.log('Process A checking intent 5c90f090e6c9d245:', res ? res.state : 'NOT FOUND');
`;

const scriptB = `
import { executeSandboxedPlan } from '../../lib/creative-os/film-kit/sandbox';
import { LocalPersistentExecutionLedger, setExecutionLedger } from '../../lib/creative-os/film-kit/execution-ledger';
import { registerProviderAdapter, clearProviderAdapters } from '../../lib/creative-os/film-kit/adapters';

setExecutionLedger(new LocalPersistentExecutionLedger());
clearProviderAdapters();

let providerInvocations = 0;

registerProviderAdapter({
  id: "adapter_cineprompt_share_link_v1",
  name: "CinePrompt V1 Mock",
  sideEffectProfile: { canPerformNetwork: false, canWriteFiles: false, canSpawnProcess: false, canSpendCredits: false, canGenerateArtifact: false, canInvokeExternalService: false },
  environment: "PRODUCTION",
  supportedCapabilities: ["PROMPT_SHARE_LINK_CREATION"],
  canExecute: () => true,
  execute: async () => {
    providerInvocations++;
    return { status: "EXECUTED", rawOutput: {}, providerUsed: "mock" };
  }
} );

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

const plan: any = {
  projectId: "proj_pilot_001",
  projectBrainFingerprint: "c52cacbd7af48432",
  requiredInputs: syntheticPayload,
  resourceId: "cineprompt",
  capabilityId: "PROMPT_SHARE_LINK_CREATION",
  requestedArtifact: "EXTERNAL_SHARE_REFERENCE",
  costStatus: "UNKNOWN",
  planFingerprint: "1eb44652c882715b",
  requiredHumanApproval: true,
  humanApprovalState: "REQUIRED",
  requiredAuthority: "EXPLICIT_EXTERNAL",
  currentAuthority: "EXPLICIT_EXTERNAL",
  executionStatus: "EXTERNAL_PLAN_READY"
};

const approval: any = {
  approvalState: "GRANTED",
  projectId: "proj_pilot_001",
  projectBrainFingerprint: "c52cacbd7af48432",
  planFingerprint: "1eb44652c882715b",
  resourceId: "cineprompt",
  capabilityId: "PROMPT_SHARE_LINK_CREATION",
  providerAdapterId: "adapter_cineprompt_share_link_v1",
  approvedAuthority: "EXPLICIT_EXTERNAL",
  costCeiling: "0",
  approvedConstraints: {
    subscriptionEntitlement: "ACTIVE", 
    downstreamSpend: "PROHIBITED",
    endpoint: "https://cineprompt.io/api/share"
  },
  approvalFingerprint: "6b94a00d6cd171f4"
};

async function run() {
  const result = await executeSandboxedPlan(plan, "proj_pilot_001", "c52cacbd7af48432", approval, "EXPLICIT_EXTERNAL");
  console.log('Process B execution result:', result.status);
  console.log('Provider invocations:', providerInvocations);
}
run();
`;

fs.writeFileSync(path.join(__dirname, 'processA.ts'), scriptA);
fs.writeFileSync(path.join(__dirname, 'processB.ts'), scriptB);

console.log('Running Process A...');
try {
  console.log(execSync('npx tsx scripts/creative-os/processA.ts').toString());
} catch (e: unknown) {
  if (e instanceof Error) console.error(e.toString());
}

console.log('Running Process B...');
try {
  console.log(execSync('npx tsx scripts/creative-os/processB.ts').toString());
} catch (e: unknown) {
  if (e instanceof Error) {
    console.error((e as Error & { stdout?: Buffer }).stdout?.toString() || "");
    console.error(e.toString());
  }
}

// Cleanup
fs.unlinkSync(path.join(__dirname, 'processA.ts'));
fs.unlinkSync(path.join(__dirname, 'processB.ts'));
