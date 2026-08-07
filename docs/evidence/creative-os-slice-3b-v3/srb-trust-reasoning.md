# Belief-Based Trust Reasoning Spec

## Trust Impact Contract
The V3 runtime evaluates conventions against trust requirements by translating them into **Audience Beliefs** and analyzing their **Convention Effect** dynamically.

```typescript
export type TrustConventionEffect = "SUPPORTS" | "WEAKENS" | "NEUTRAL" | "CONTEXT_DEPENDENT"

export interface TrustImpactEvaluation {
  requirement: string;
  audienceBelief: string;
  conventionEffect: TrustConventionEffect;
  reasoning: string;
}
```

## Supported Categories & Belief Mappings

### 1. Skincare Category
* **Efficacy**: "I believe the product is scientifically formulated and will actually work." (supports → SACRED + KEEP)
* **Safety**: "I feel safe using this product on my body without anxiety." (supports/weakens based on activism context)
* **Environmental Credibility**: "I believe the brand's environmental claims are true and verifiable." (supports → SACRED)

### 2. SaaS Category
* **Credibility**: "I believe the product features are mature and comparable to competitors." (supports → SACRED)

### 3. Renovation Category
* **Reliability**: "I believe the contractor will complete the work safely and reliably." (supports → SACRED)
* **Price Confidence**: "I understand what I am likely to pay and why, without feeling tricked." (weakens → HABIT + BREAK/BEND)
* **Competence**: "I believe the contractor's work is backed by true technical capability." (supports → SACRED)
