# Slice 3C — Authority Boundary Governance

## Authority Level Behavior
- `SUGGEST`: Identifies potential provider candidates.
- `PREPARE`: Constructs `ExternalCapabilityPlan`.
- `LOCAL_REVERSIBLE`: Permits planning for local/reversible components.
- `EXPLICIT_EXTERNAL`: Represents potential external action. Returns `HUMAN_APPROVAL_REQUIRED` (`humanApprovalState: "REQUIRED"`). Execution is 0 calls.
- `PROHIBITED`: Fails closed, returning `BLOCKED`.
