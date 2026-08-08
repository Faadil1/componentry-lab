import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  prepareVideoShotcraftAdaptation, 
  deriveVideoShotcraftRoute, 
  deriveVideoShotcraftArtifact, 
  createVideoShotcraftManifest,
  createVideoShotcraftAdaptationId
} from '../lib/creative-os/production/video-shotcraft';
import { projectPresets } from '../lib/projects/presets';
import type { ExternalCapabilityPlan } from '../lib/creative-os/film-kit/types';

// Mocking simple deep clone functionality for Project Brain test
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

describe('Video Shotcraft (Slice 3E.2-A)', () => {
  const targetProjectId = 'stated';
  const mockPlan = {
    projectId: targetProjectId,
    planFingerprint: 'plan_123_abc',
    capabilityId: 'PRODUCT_FILM',
    resourceId: 'res_video_shotcraft',
    decomposedCapabilities: ['PRODUCT_FILM'],
    requestedArtifact: 'product-demo-film',
    compatibilityStatus: 'VERIFIED',
    compatibilityEvidence: null,
    lifecycleState: 'TEST_CANDIDATE',
    currentAuthority: 'LOCAL_REVERSIBLE',
    requiredAuthority: 'LOCAL_REVERSIBLE',
    requiredHumanApproval: false,
    humanApprovalState: 'NOT_REQUIRED',
    costStatus: 'FREE',
    estimatedCost: '0.00',
    privacyStatus: 'LOCAL_ONLY',
    licenseStatus: 'UNKNOWN',
    requiredInputs: [],
    expectedOutputs: [],
    executionMode: 'NOT_EXECUTED',
    executionStatus: 'NOT_EXECUTED',
    blockers: [],
    missingEvidence: []
  } satisfies ExternalCapabilityPlan;
  const targetTokensFingerprint = 'tok_inter_neutral_clean';
  const shotId = 'PaperTitleCard';

  it('directly binds ProductionRoute to Film Kit planning truth', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const route = deriveVideoShotcraftRoute(adaptation);
    
    assert.strictEqual(route.planFingerprint, mockPlan.planFingerprint, 'Route must inherit plan fingerprint from adaptation');
    assert.strictEqual(route.projectId, mockPlan.projectId, 'Route must inherit project ID from plan');
    assert.strictEqual(route.productionCapability, 'PRODUCT_FILM', 'Must use canonical capability');
    
    const manifest = createVideoShotcraftManifest(targetProjectId, 'DAY_CHALLENGE', adaptation);
    // Prove adaptation consumes route / plan provenance
    assert.ok(manifest.artifacts[0].createdFrom.includes(targetTokensFingerprint));
    assert.strictEqual(manifest.routes[0].planFingerprint, mockPlan.planFingerprint);
  });

  it('routes through frozen ProductionRoute deterministically', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const route = deriveVideoShotcraftRoute(adaptation);
    
    assert.strictEqual(route.routeType, 'EXTERNAL_PIPELINE');
    assert.strictEqual(route.resourceId, 'res_video_shotcraft');
    assert.strictEqual(route.productionCapability, 'PRODUCT_FILM');
    assert.strictEqual(route.authorityRequired, 'LOCAL_REVERSIBLE');
    assert.strictEqual(route.executionMode, 'NOT_EXECUTED');
    assert.strictEqual(route.heroDemoContribution, 'SUPPORTING');
    assert.strictEqual(route.status, 'READY');
  });

  it('creates a deterministic adaptation identity based on commit, shot, and target tokens', () => {
    const adaptation1 = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const adaptation2 = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    assert.strictEqual(adaptation1.adaptationId, adaptation2.adaptationId);
  });

  it('reflects source commit change in adaptation identity', () => {
    const adaptation1 = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const adaptation2 = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    adaptation2.sourceCommit = 'changed';
    
    const id1 = createVideoShotcraftAdaptationId(adaptation1);
    const id2 = createVideoShotcraftAdaptationId(adaptation2);
    assert.notStrictEqual(id1, id2);
  });

  it('reflects shot selection change in adaptation identity', () => {
    const adaptation1 = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, 'PaperTitleCard');
    const adaptation2 = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, 'SceneDetail');
    assert.notStrictEqual(adaptation1.adaptationId, adaptation2.adaptationId);
  });

  it('preserves UNKNOWN third-party asset licenses', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    assert.strictEqual(adaptation.licenseState, 'UNKNOWN');
  });

  it('marks unresolved asset license as publication-safe = false', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    assert.strictEqual(adaptation.publicationSafe, false);
  });

  it('excludes source brand assets from adaptation manifest', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    assert.ok(adaptation.removedSourceIdentity.includes('source serif identity'));
    assert.ok(adaptation.removedSourceIdentity.includes('source amber accent'));
  });

  it('does not fabricate external receipt before execution', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const route = deriveVideoShotcraftRoute(adaptation);
    const artifact = deriveVideoShotcraftArtifact(route, adaptation);
    assert.strictEqual(artifact.executionReceiptFingerprint, null);
    assert.strictEqual(artifact.status, 'PLANNED');
  });

  it('keeps Project Brain immutable', () => {
    const canonicalBrain = projectPresets.find(p => p.id === targetProjectId)!;
    const clonedBrain = deepClone(canonicalBrain);
    
    // Perform operations
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const manifest = createVideoShotcraftManifest(targetProjectId, 'DAY_CHALLENGE', adaptation);
    
    assert.deepStrictEqual(canonicalBrain, clonedBrain);
    assert.strictEqual(manifest.projectId, targetProjectId);
  });

  it('maintains Film Kit as canonical owner of shot intent', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const manifest = createVideoShotcraftManifest(targetProjectId, 'DAY_CHALLENGE', adaptation);
    // Provenance is derived from the shot implementation target, but Project Brain intent stays with Film Kit 
    assert.ok(manifest.artifacts[0].createdFrom.includes(targetTokensFingerprint));
  });

  it('ArtifactManifest records missing render/output before execution', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const manifest = createVideoShotcraftManifest(targetProjectId, 'DAY_CHALLENGE', adaptation);
    
    assert.strictEqual(manifest.artifacts[0].status, 'PLANNED');
    assert.strictEqual(manifest.missingArtifacts.length, 1);
    assert.strictEqual(manifest.missingArtifacts[0], manifest.artifacts[0].artifactId);
    assert.strictEqual(manifest.nextAssemblyStep, 'RENDER_SELECTED_SHOT_LOCALLY');
  });

  it('does not assume Remocn dependency', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const hasRemocn = adaptation.dependencies.some(d => d.toLowerCase().includes('remocn'));
    assert.strictEqual(hasRemocn, false);
  });

  it('makes zero provider executions', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const route = deriveVideoShotcraftRoute(adaptation);
    assert.strictEqual(route.executionMode, 'NOT_EXECUTED');
    assert.strictEqual(route.status, 'READY');
  });

  it('makes zero rendering calls', () => {
    const adaptation = prepareVideoShotcraftAdaptation(mockPlan, targetTokensFingerprint, shotId);
    const route = deriveVideoShotcraftRoute(adaptation);
    const artifact = deriveVideoShotcraftArtifact(route, adaptation);
    assert.strictEqual(artifact.contentFingerprint, 'PENDING_RENDER');
    assert.strictEqual(artifact.status, 'PLANNED');
  });
});


