import { createHash } from 'crypto';
import type { ProductionRoute, ProductionArtifact, ProductionArtifactManifest } from './types';
import type { CreativeProjectMode } from '../../director/types';

import type { ExternalCapabilityPlan } from '../film-kit/types';

export interface VideoShotcraftAdaptationRecord {
  adaptationId: string;
  sourceRepository: string;
  sourceCommit: string;
  shotId: string;
  sourcePaths: string[];
  targetProjectId: string;
  targetPlanFingerprint: string;
  targetTokensFingerprint: string;
  retainedMechanics: string[];
  removedSourceIdentity: string[];
  injectedProductTokens: string[];
  dependencies: string[];
  licenseState: string;
  publicationSafe: boolean;
  expectedArtifactType: string;
  qualityGates: string[];
}

export function createVideoShotcraftAdaptationId(record: Omit<VideoShotcraftAdaptationRecord, 'adaptationId'>): string {
  const hash = createHash('sha256');
  hash.update(record.sourceRepository);
  hash.update(record.sourceCommit);
  hash.update(record.shotId);
  hash.update(record.targetProjectId);
  hash.update(record.targetPlanFingerprint);
  hash.update(record.targetTokensFingerprint);
  // deterministic based on these canonical semantic inputs
  return `vsc_adapt_${hash.digest('hex').substring(0, 12)}`;
}

export function prepareVideoShotcraftAdaptation(
  plan: ExternalCapabilityPlan,
  targetTokensFingerprint: string,
  shotId: string
): VideoShotcraftAdaptationRecord {
  const record: Omit<VideoShotcraftAdaptationRecord, 'adaptationId'> = {
    sourceRepository: 'https://github.com/Vincentwei1021/video-shotcraft',
    sourceCommit: '0022ec45d28800cecb5b16624a3179093c93f4e9',
    shotId,
    sourcePaths: [`template/src/aifl/${shotId}.tsx`],
    targetProjectId: plan.projectId || 'UNKNOWN',
    targetPlanFingerprint: plan.planFingerprint,
    targetTokensFingerprint,
    retainedMechanics: [
      'word-by-word reveal mechanics',
      'scale/blur reveal',
      'underline timing mechanic if appropriate',
      'fade-out mechanic'
    ],
    removedSourceIdentity: [
      'source serif identity',
      'source warm-paper palette',
      'source amber accent',
      'source-specific typography treatment'
    ],
    injectedProductTokens: [
      'Creative OS synthetic fixture typography (Inter)',
      'fixture palette (Neutral)',
      'fixture spacing/layout tokens'
    ],
    dependencies: [
      '@remotion/cli 4.0.484',
      'remotion 4.0.484',
      'react 19.2.7',
      'react-dom 19.2.7'
    ],
    licenseState: 'UNKNOWN', // Pending third-party asset clearance
    publicationSafe: false,
    expectedArtifactType: 'VIDEO_SHOT_COMPONENT',
    qualityGates: [
      'NO_SOURCE_BRANDING_LEAK',
      'PRODUCT_TOKENS_APPLIED',
      'LICENSE_CLEARED'
    ]
  };

  return {
    ...record,
    adaptationId: createVideoShotcraftAdaptationId(record)
  };
}

export function deriveVideoShotcraftRoute(adaptation: VideoShotcraftAdaptationRecord): ProductionRoute {
  return {
    routeId: `route_${adaptation.adaptationId}`,
    projectId: adaptation.targetProjectId,
    planFingerprint: adaptation.targetPlanFingerprint,
    requestedArtifactType: adaptation.expectedArtifactType,
    productionCapability: 'PRODUCT_FILM',
    routeType: 'EXTERNAL_PIPELINE',
    resourceId: 'res_video_shotcraft',
    providerAdapterId: null,
    authorityRequired: 'LOCAL_REVERSIBLE',
    executionMode: 'NOT_EXECUTED',
    estimatedCost: '0.00',
    licenseState: adaptation.licenseState,
    privacyClass: 'LOCAL_ONLY',
    inputArtifacts: [],
    expectedOutputArtifacts: [`art_${adaptation.adaptationId}_output`],
    heroDemoContribution: 'SUPPORTING',
    qualityGates: adaptation.qualityGates,
    evidenceRequired: ['adaptation_record'],
    reversibility: 'LOCAL_REVERSIBLE',
    status: 'READY'
  };
}

export function deriveVideoShotcraftArtifact(route: ProductionRoute, adaptation: VideoShotcraftAdaptationRecord): ProductionArtifact {
  return {
    artifactId: route.expectedOutputArtifacts[0],
    artifactType: route.requestedArtifactType,
    projectId: route.projectId,
    sourceRouteId: route.routeId,
    sourceResourceId: route.resourceId,
    provenance: `adapted_from:${adaptation.sourceCommit}_${adaptation.shotId}`,
    localPath: null,
    externalReference: null,
    contentFingerprint: 'PENDING_RENDER',
    licenseState: adaptation.licenseState,
    privacyClass: route.privacyClass,
    createdBy: 'creative-os-director',
    createdFrom: [adaptation.targetTokensFingerprint],
    version: '1',
    status: 'PLANNED', // Pre-render status
    qualityEvidence: [],
    executionReceiptFingerprint: null // Absent before execution
  };
}

export function createVideoShotcraftManifest(
  projectId: string,
  mode: CreativeProjectMode,
  adaptation: VideoShotcraftAdaptationRecord
): ProductionArtifactManifest {
  const route = deriveVideoShotcraftRoute(adaptation);
  const artifact = deriveVideoShotcraftArtifact(route, adaptation);
  
  return {
    manifestId: `man_${adaptation.adaptationId}`,
    projectId,
    projectMode: mode,
    requestedArtifacts: [artifact.artifactType],
    artifacts: [artifact],
    routes: [route],
    missingArtifacts: [artifact.artifactId], // Render not yet executed
    nextAssemblyStep: 'RENDER_SELECTED_SHOT_LOCALLY' // Concrete action
  };
}
