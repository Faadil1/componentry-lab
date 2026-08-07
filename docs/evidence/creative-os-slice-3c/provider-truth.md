# Slice 3C — Provider Truth & Evidence Governance

## Grounding Rules
All provider properties are grounded strictly in registry metadata:
- If `license` is missing, `licenseStatus` = `UNKNOWN`.
- If `cost` is missing, `costStatus` = `UNKNOWN`.
- If `privacy` is missing, `privacyStatus` = `UNKNOWN`.
- If `compatibilityEvidenceStatus` is `UNKNOWN`, `executionStatus` = `DISCOVERY_REQUIRED`.
- Discovery feeds (`DISCOVERY_FEED`) can NEVER become production providers.
