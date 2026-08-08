# Slice 3E.1: Mode Routing Scenarios

## Four Canonical Scenarios

The tests implemented and validated zero-side-effect routing mapping for all four Creative OS project modes:

### 1. DAY_CHALLENGE
- **Scenario**: Resolving an unknown `CSS_FADE` requirement where native capability is flagged.
- **Result**: Route type resolves to `NATIVE` directly without interrogating external adapters.
- **Hero Demo Contribution**: Maps to `SUPPORTING`.

### 2. HACKATHON
- **Scenario**: Requesting a `product-demo-film` artifact leveraging `res_shotcraft`.
- **Result**: Resolves correctly via standard external routing.
- **Hero Demo Contribution**: Overridden to `PRIMARY` based on the targeted artifact.

### 3. MARA
- **Scenario**: Leveraging the internal narrative-staging method `res_physical_situation_storyboarder`.
- **Result**: Resolves to `INTERNAL_COMPONENT`.
- **Hero Demo Contribution**: Maps to `SUPPORTING`.

### 4. DATA_STORY
- **Scenario**: Final step share-link integration via CinePrompt API (`res_cineprompt`).
- **Result**: Resolves safely to `EXTERNAL_PROVIDER` requiring explicit `EXPLICIT_EXTERNAL` authority.
- **Hero Demo Contribution**: Standard mapping to `PRIMARY` via the specific capability identifier.

## Zero Mutation Validation
All four scenarios were processed across the same router instance using a deep-cloned `Project Brain` state. Validation proves zero mutations to the canonical state after execution.
