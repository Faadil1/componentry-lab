# Canonical Evidence Provenance Governance

To manage stale evidence packets and prevent outdated data structures from being treated as canonical reviews, we have established a centralized evidence manifest.

## Evidence Manifest
* **File Location**: [manifest.json](file:///C:/Users/fboussari/componentry-lab-director/docs/evidence/manifest.json)
* **Governance Statuses**:
  - `CURRENT`: Active, validated evidence packets (e.g., `director-design-review-v4` and `creative-os-slice-3b2-v3`).
  - `SUPERSEDED`: Obsolete packets containing stale metadata or project presets (e.g. initial `director-design-review` with Eight-Bar Hole or musicology Mara references).
  - `ARCHIVED`: Retained historical logs not part of the active workspace lookup.

## Automated Verification
An automated test `Evidence: stale/superseded packet cannot be treated as current canonical evidence` is included in our suite to ensure that superseded review packets are marked as such and never processed as active canonical evidence.
