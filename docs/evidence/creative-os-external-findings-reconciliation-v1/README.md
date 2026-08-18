# Creative OS External Findings Reconciliation V1

Status: `IMPLEMENTATION_CANDIDATE`

Branch target: `release/public-integration-01`

Baseline HEAD: `0995491567a167b8492748ab5334c9acaa06a037`

Purpose: make the live Registry V2 cumulative without rewriting the legacy 20-entity engine contract.

## Product decision

The live governed library is cumulative:

`existing governed entities + qualified external findings`

External findings do not need to be executable to be visible. They may remain sources, references, providers, resources, or discovery candidates. Discovery candidates are represented conservatively through `CAPTURED` source/reference entries with unresolved locators where necessary; they receive no execution authority.

## Architecture decision

- `buildLibraryV2ReadModel()` remains the 20-entity legacy projection contract.
- `buildLiveLibraryV2ReadModel()` is the cumulative product read model.
- Existing V1 entities are reconciled in V2 without mutating V1 registry snapshots.
- Qualified findings missing from the legacy registry are V2-native entries.
- Historical placeholder warnings are removed from the live model only when a real locator is explicitly reconciled.
- No external provider is executed or installed by this change.

## Reconciled historical radar inventory

| # | Historical finding | Live classification | Representation | Reconciliation action |
|---|---|---|---|---|
| 1 | Sacred Rules Breaker | METHOD | existing `res_sacred_rules_breaker` | Keep governed method; mark historical external origin unresolved. |
| 2 | Somatic Response Design | METHOD | existing `res_somatic_response_design` | Keep governed method; mark historical external origin unresolved. |
| 3 | Relationship-Preserving Abstraction | METHOD + REFERENCE lineage | existing method + new `ref_photo_abstract_editorial` | Preserve internal method and its external method-origin reference separately. |
| 4 | Cognitive Metaphor Illustrator | METHOD + REFERENCE lineage | existing method + new `ref_ian_xiaohei_illustrations` | Preserve internal method and external reasoning source separately. |
| 5 | Physical Situation Storyboarder | METHOD + REFERENCE lineage | existing method + new `ref_ian_xiaohei_scenes` | Preserve internal method and external reasoning source separately. |
| 6 | Library-First Composition Router | METHOD + SOURCE lineage | existing method + existing `res_yummy_design_sprint` | Preserve internal method; reconcile Yummy external source locator. |
| 7 | AI Camera Movements | RESOURCE | existing `res_ai_camera_movements` | Reconcile public source locator; remain knowledge/reference resource. |
| 8 | OriginKit | SOURCE | existing `res_originkit` | Preserve connector identity; add public catalog locator; no auto-install. |
| 9 | Remocn | SOURCE | existing `res_remocn` | Reconcile canonical repository and observed MIT license. |
| 10 | CinePrompt | PROVIDER | existing `res_cineprompt` | Reconcile public product/API locator; external generation remains gated. |
| 11 | AI World Builder | PROVIDER | existing `res_ai_world_builder` | Reconcile public app locator; Project Brain remains authority. |
| 12 | AI Camera Control | REFERENCE / discovery candidate | new `ref_ai_camera_control` | Keep non-executable until capabilities are independently established. |
| 13 | Open Kimi PPT | PROVIDER | existing `res_open_kimi_ppt` | Reconcile canonical repository; isolate before professional use. |
| 14 | TaiT CRT Interface Skill | RESOURCE | existing `res_tait_crt_interface_skill` | Reconcile repository; license remains unclaimed/unknown in live evidence. |
| 15 | Video Shotcraft | RESOURCE / production pipeline | existing `res_video_shotcraft` | Reconcile repository and observed Apache-2.0 license. |
| 16 | GBRO Collage B-roll | RESOURCE / production pipeline | existing `res_gbro_collage_b_roll` | Reconcile repository and observed MIT license; paid generation stays gated. |
| 17 | OpenMontage | RESOURCE / production pipeline | existing `res_openmontage` | Reconcile repository and observed AGPL-3.0 license; study/test only. |
| 18 | Awesome Claude Code Skills | SOURCE / discovery feed | existing `res_awesome_claude_code_skills` | Reconcile canonical repository; individual skills require separate review. |
| 19 | helloianneo ecosystem | SOURCE / discovery feed | existing `res_helloianneo_ecosystem` | Reconcile ecosystem source; preserve selected sub-projects separately. |
| 20 | Ian Xiaohei Illustrations | REFERENCE | new `ref_ian_xiaohei_illustrations` | Preserve as method-origin and illustration reference. |
| 21 | Ian Xiaohei Scenes | REFERENCE | new `ref_ian_xiaohei_scenes` | Preserve as method-origin and physical-storytelling reference. |
| 22 | Ian Handdrawn PPT | REFERENCE | new `ref_ian_handdrawn_ppt` | Preserve page-planning/presentation visual reference; not native PPTX provider. |
| 23 | Obsidian AI Second Brain | REFERENCE | new `ref_obsidian_ai_second_brain` | Preserve knowledge-architecture reference; do not replace Project Brain. |
| 24 | Claude Code Handbook | REFERENCE | new `ref_claude_code_handbook` | Preserve for source-by-source verification before internalization. |
| 25 | 21st.dev | SOURCE | new `src_21st_dev` | Governed component discovery source; no automatic component approval. |
| 26 | StillsLab | REFERENCE | new `ref_stillslab` | Human-browse cinematography/lookbook reference. |
| 27 | FilmGrab | REFERENCE | new `ref_filmgrab` | Human-browse film-still/cinematography reference. |
| 28 | shuohao-skills | SOURCE / discovery candidate | new `src_shuohao_skills_candidate` | Preserve identity but keep exact source unresolved and non-routable. |
| 29 | photo-relic-editorial | REFERENCE / discovery candidate | new `ref_photo_relic_editorial` | Preserve for later source recovery; non-routable. |
| 30 | photo-distill | REFERENCE / discovery candidate | new `ref_photo_distill` | Preserve for later source recovery; non-routable. |
| 31 | poetic-line-zine-poster | REFERENCE / discovery candidate | new `ref_poetic_line_zine_poster` | Preserve for later source recovery; non-routable. |

Note: the radar contains 29 distinct reusable finding families when method-origin derivatives are grouped with their internalized methods. The table has 31 rows because three internal methods expose their source references as separate governed entities for lineage visibility.

## Cumulative live counts

Legacy projection engine:

- SOURCE: 5
- RESOURCE: 6
- REFERENCE: 0
- METHOD: 6
- PROVIDER: 3
- TOTAL: 20

V2-native additions:

- SOURCE: 2
- REFERENCE: 12
- TOTAL: 14

Expected cumulative live model:

- SOURCE: 7
- RESOURCE: 6
- REFERENCE: 12
- METHOD: 6
- PROVIDER: 3
- TOTAL: 34

## Source and license corrections in the live layer

The V1 snapshot is intentionally left intact. The live V2 reconciliation overlays real locators where the historical source is known:

- OriginKit: `https://www.originkit.dev/intro`
- Remocn: `https://github.com/Remocn/remocn` — observed license `MIT`
- CinePrompt: `https://cineprompt.io/`
- AI World Builder: `https://ai-world-builder-nine.vercel.app/`
- AI Camera Movements: `https://aicameramovements.com/`
- Open Kimi PPT: `https://github.com/Binaryify/open-kimi-ppt-skill`
- TaiT CRT Interface Skill: `https://github.com/TaiT-tt/tait-crt-interface-skill` — license remains `UNCLAIMED/UNKNOWN`
- Video Shotcraft: `https://github.com/Vincentwei1021/video-shotcraft` — observed license `Apache-2.0`
- GBRO Collage B-roll: `https://github.com/pyang5166/gbro-collage-broll` — observed license `MIT`
- OpenMontage: `https://github.com/calesthio/OpenMontage` — observed license `AGPL-3.0`
- Awesome Claude Code Skills: `https://github.com/helloianneo/awesome-claude-code-skills`
- helloianneo ecosystem: `https://github.com/helloianneo`
- Yummy Design Sprint: `https://yummy-design-sprint.notion.site/32762791470980f79c59f4580d377f3f`

## Unresolved source identities

These remain deliberately visible but non-routable until the exact source is recovered:

- `shuohao-skills`
- `photo-relic-editorial`
- `photo-distill`
- `poetic-line-zine-poster`
- original external source locator for Sacred Rules Breaker
- original external source locator for Somatic Response Design

No guessed URL is written into the canonical library.

## Authority boundary

This reconciliation adds metadata and browseable references only.

It does not authorize or implement:

- automatic package installation
- provider execution
- external API calls
- generation spend
- publishing
- submission
- deployment to Production
- automatic approval
- Project Brain mutation
- Director/Film Kit runtime changes

## Next gate

After repository validation and preview QA, Production promotion remains a separate explicit decision.
