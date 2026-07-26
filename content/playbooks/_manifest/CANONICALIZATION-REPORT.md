# Canonicalization Report

## Inventory

- Total source files: **86**
- UI/UX archive files: **38**
- Hackathon system files: **48**
- Public-import files: **61**
- Exact duplicate groups: **1**

## Classification

- `archive`: 5
- `archive-meta`: 5
- `internal`: 11
- `internal-state`: 4
- `public-playbook`: 57
- `public-reference`: 4

## Exact duplicate resolution

`FAADIL-FABLE-REASONING-SKILL-V2_1.md` occurs in both archives with the same SHA-256. The Hackathon OS copy is retained as the canonical internal copy. It is excluded from the public import because it is an orchestration/router instruction rather than a public-facing playbook.

## Public-import policy

Included:
- UI/UX positioning, judge-path, landing, dashboard, evidence, typography, color, component, responsive, composition, research, anti-slop, controlled-risk, demo-video, and visual-direction documents.
- Hackathon evidence, gates, templates, UX, UI-polish, demo, video, and visual-production documents.

Excluded from the public import and retained in the private vault:
- Claude/project instructions and handoff files.
- Orchestrator and reasoning-router files.
- Current project state, memory, and control-tower files.
- Export metadata, missing-file reports, coherence snapshots, migration scripts, and explicitly superseded archives.
- The UI/UX complete-export document, because it repeats and packages the individual source documents and contains current project state.

## Source limitations preserved

The Hackathon export reports that `ASSISTANT-HACKATON-SYSTEM-INSTRUCTION-V3.md` and `FAADIL-CLIENT-OS.md` were not present in the exported workspace. The naming-distinction file was remapped by the source export. No replacement content was invented.
