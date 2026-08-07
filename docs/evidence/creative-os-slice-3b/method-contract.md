# Creative Method Contract Spec

## TypeScript Types
All runtime types are declared in [`lib/creative-os/methods/types.ts`](file:///C:/Users/fboussari/componentry-lab-director/lib/creative-os/methods/types.ts).

### 1. `CreativeMethodDefinition`
Declared immutable metadata defining the capability boundaries:
```typescript
export interface CreativeMethodDefinition {
  id: string
  resourceId: string
  name: string
  version: string
  supportedModes: CreativeProjectMode[]
  supportedPhases: CreativeProjectPhase[]
  capabilityGaps: string[]
  requiredInputs: string[]
  optionalInputs: string[]
  outputSchemaId: string
  qualityGateIds: string[]
  authorityRequired: CreativeMethodAuthority
  deterministic: true
}
```

### 2. `CreativeMethodInput`
Structured input payload passed to the runtime executor:
```typescript
export interface CreativeMethodInput {
  methodId: string
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  subjectDescription: string
  subjectContext: string
  capabilityGap: string
  evaluatorType?: string
  supplementaryFields?: Record<string, string>
}
```

### 3. `CreativeMethodExecutionResult`
Typed output structure representing execution results:
```typescript
export interface CreativeMethodExecutionResult {
  methodId: string
  resourceId: string
  input: CreativeMethodInput
  result: CreativeMethodResult
  qualityResults: CreativeMethodQualityResult[]
  allGatesPassed: boolean
  advisoryEvidence: string[]
  status: CreativeMethodStatus
  isReadOnly: true
  sideEffects: null
}
```
* **Read-Only Constraint**: `isReadOnly` is always true, and `sideEffects` is always null.
