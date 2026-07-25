# HACKATHON-VIDEO-BRAG.md

## Purpose

Use `/brag` as a fast final-packaging module for hackathon projects.

`/brag` is for creating a short, high-energy project trailer after the build is stable. It should not replace the judge-facing demo video when the submission needs proof, architecture, sponsor relevance, or limitations.

## Positioning

```txt
/brag = teaser / launch trailer / social cutdown
Egaki = controlled judge-facing demo video
```

## Use When

Use this module when all of the following are true:

- The project has a stable UI or visible product surface.
- The happy path works.
- The sponsor technology is visibly integrated.
- Evidence files exist.
- Claims have been checked.
- Limitations are written.
- README or submission page is mostly ready.

## Do Not Use When

Do not run `/brag` before:

- the product has a working demo flow;
- the sponsor integration is visible;
- proof labels are assigned;
- claims are verified;
- limitations are documented.

## Recommended Durations

```txt
20–30s  = best use case: social teaser / launch video
45–60s  = possible mini-demo
90–120s = only allowed with Hackathon OS structure imposed
```

For anything above 30 seconds, `/brag` must be treated as a visual director, not as the final narrative authority.

## Target Commands

Short social trailer:

```bash
/brag --tone polished --format landscape --duration 25
```

Vertical social version:

```bash
/brag --tone cinematic --format vertical --duration 20
```

Longer judge-support version:

```bash
/brag --tone polished --format landscape --duration 60
```

Experimental maximum:

```bash
/brag --tone polished --format landscape --duration 120
```

## Rules for Durations Above 30 Seconds

If duration is greater than 30 seconds, enforce this structure:

```txt
0:00–0:08   Hook: problem + tension
0:08–0:18   Promise: what the project solves
0:18–0:45   Product/demo moment
0:45–1:05   Sponsor tech visibility
1:05–1:25   Evidence / receipt / report / test result
1:25–1:40   Why it matters
1:40–1:52   Honest limitations
1:52–2:00   Final screen: repo, live demo, video, status
```

## Judge-Winning Constraints

Every `/brag` output used for hackathons must preserve:

- one-line promise;
- judge memory sentence;
- visible UI or product moment;
- sponsor relevance;
- proof/evidence labels;
- no unverifiable claims;
- no fake metrics;
- honest limitations if the video is over 60 seconds.

## Required Evidence Labels

Use the existing Hackathon OS labels:

```txt
LIVE
LOCAL_VERIFIED
LOCAL_STUB
SIMULATED
PRESEEDED
FAILED
```

Never imply `LIVE` if the proof is only local, stubbed, simulated, or preseeded.

## Output Review Checklist

Before using the `/brag` video in a submission:

- Can a judge understand the project in 5 seconds?
- Is the product promise clear?
- Is at least one real UI/product moment visible?
- Is the sponsor technology visible or named accurately?
- Are proof labels truthful?
- Are limitations included for longer videos?
- Does the final screen include the right links?
- Does the video avoid generic SaaS language?

## Final Rule

`/brag` is an accelerator, not the source of truth.

The Hackathon OS remains responsible for narrative, proof, score alignment, and submission truthfulness.
