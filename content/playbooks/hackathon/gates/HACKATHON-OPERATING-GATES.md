# HACKATHON-OPERATING-GATES.md

## Added Gate: Final Video Packaging Gate

Run this gate after evidence generation and UI polish, but before submission freeze.

## Preconditions

Do not enter the Final Video Packaging Gate until:

- happy path is working;
- sponsor integration is visible;
- evidence files exist;
- proof labels are assigned;
- README/SUBMISSION/LIMITATIONS are drafted;
- demo path is frozen.

## Gate Objective

Produce one or both of the following:

```txt
/brag trailer:
  20–30s social or launch teaser

Egaki judge video:
  60–120s structured submission video
```

## Required Decision

Choose one:

```txt
A. No video needed
B. /brag teaser only
C. Egaki judge video only
D. Both /brag teaser + Egaki judge video
```

Default for serious hackathon submissions:

```txt
D. Both /brag teaser + Egaki judge video
```

## Required Video Truth Rules

All video outputs must obey:

- no fake metrics;
- no fake users;
- no fake live integrations;
- no unlabeled simulations;
- no unlabeled preseeded data;
- no hiding major limitations;
- no claiming sponsor usage unless it is real and visible.

## Required Judge Structure for 60–120s Videos

```txt
0:00–0:08   Problem tension
0:08–0:18   Promise
0:18–0:45   Live demo
0:45–1:05   Sponsor tech
1:05–1:25   Evidence
1:25–1:40   Impact
1:40–1:52   Limitations
1:52–2:00   Final links
```

## Exit Criteria

This gate passes only if:

- the video can be understood in 5 seconds;
- the judge can see what the project does;
- sponsor relevance is explicit;
- proof labels are truthful;
- limitations are included for longer videos;
- repo/live/demo links are correct;
- final video link is added to the submission package;
- HACKATHON-STATE.md is updated.

## HACKATHON-STATE.md Required Update

At the end of this gate, update:

```yaml
video_packaging:
  brag:
    status: NOT_USED | GENERATED | USED_IN_SUBMISSION
    duration_seconds:
    format:
    output_path:
  egaki:
    status: NOT_USED | GENERATED | USED_IN_SUBMISSION
    duration_seconds:
    format:
    output_path:
  final_submission_video:
    url:
    proof_labels_checked: true
    limitations_included: true
```
