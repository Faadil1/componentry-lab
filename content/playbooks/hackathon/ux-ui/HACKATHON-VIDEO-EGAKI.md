# HACKATHON-VIDEO-EGAKI.md

## Purpose

Use Egaki as the controlled judge-facing video module for hackathon submissions.

Egaki is best used when the final video needs to be scripted, versioned, reviewed, and iterated scene by scene from text/MDX.

## Positioning

```txt
/brag = fast trailer
Egaki = controlled judge video
```

Egaki is the preferred module for 60–120 second submission videos because the structure can be enforced directly in the script.

## Use When

Use this module when:

- the hackathon requires or benefits from a polished demo video;
- the target duration is 60–120 seconds;
- the project has a real UI, CLI output, dashboard, receipt, report, or workflow to show;
- sponsor technology needs to be explained visually;
- evidence labels must appear clearly;
- the video should be reproducible from Git;
- the agent needs to iterate on specific scenes.

## Do Not Use When

Do not use Egaki before:

- the happy path is stable;
- screenshots or live demo footage are available;
- sponsor relevance is known;
- evidence files exist;
- claims and limitations are written.

## Recommended Duration

```txt
60s    = compressed judge demo
90s    = ideal concise submission video
120s   = maximum recommended judge-facing video
>120s  = avoid unless hackathon explicitly asks for a longer walkthrough
```

## Required Inputs

Before generating the MDX video, collect:

```txt
project_name:
one_line_promise:
judge_memory_sentence:
target_user:
problem_tension:
demo_flow:
sponsor_tech:
evidence_items:
proof_labels:
limitations:
repo_link:
live_demo_link:
submission_video_link:
```

## Standard 120s Judge Video Structure

```txt
0:00–0:08   Hook: problem + tension
0:08–0:18   Promise: what the project does
0:18–0:45   Live demo: input → action → result
0:45–1:05   Sponsor tech: where the sponsor/API/protocol/model is used
1:05–1:25   Evidence: tests, receipts, reports, logs, proof labels
1:25–1:40   Impact: why this matters
1:40–1:52   Limitations: honest constraints
1:52–2:00   Final screen: repo, live demo, submission status
```

## Standard MDX Skeleton

```mdx
---
fps: 30
bpm: 120
title: "<PROJECT_NAME> Hackathon Demo"
---

# Hook duration=8s

<Title>
  <PROJECT_NAME>
</Title>

<Subtitle>
  <PROBLEM_TENSION>
</Subtitle>

# Promise duration=10s

<Headline>
  <ONE_LINE_PROMISE>
</Headline>

<Caption>
  <JUDGE_MEMORY_SENTENCE>
</Caption>

# Live Demo duration=27s

<DemoFlow>
  input="<INPUT>"
  action="<ACTION>"
  result="<RESULT>"
</DemoFlow>

# Sponsor Tech duration=20s

<TechStack>
  sponsor="<SPONSOR_TECH>"
  role="<HOW_IT_IS_USED>"
</TechStack>

# Evidence duration=20s

<EvidenceCards>
  <Evidence label="LOCAL_VERIFIED" title="Test run" detail="<TEST_RESULT>" />
  <Evidence label="LIVE" title="Live endpoint" detail="<LIVE_PROOF_IF_TRUE>" />
  <Evidence label="SIMULATED" title="Simulation" detail="<SIMULATION_SCOPE_IF_USED>" />
</EvidenceCards>

# Impact duration=15s

<Impact>
  <WHY_IT_MATTERS>
</Impact>

# Limitations duration=12s

<Limitations>
  <Limitation><LIMITATION_1></Limitation>
  <Limitation><LIMITATION_2></Limitation>
</Limitations>

# Final Screen duration=8s

<FinalLinks
  repo="<REPO_LINK>"
  demo="<LIVE_DEMO_LINK>"
  status="<SUBMISSION_STATUS>"
/>
```

## Required Evidence Labels

Use only the standard Hackathon OS labels:

```txt
LIVE
LOCAL_VERIFIED
LOCAL_STUB
SIMULATED
PRESEEDED
FAILED
```

Rules:

- `LIVE` means a judge can actually access or reproduce the thing.
- `LOCAL_VERIFIED` means it worked locally and evidence exists.
- `LOCAL_STUB` means the real integration was unavailable but fallback behavior is labeled.
- `SIMULATED` means the behavior is simulated and must not be sold as live.
- `PRESEEDED` means the demo data was prepared in advance.
- `FAILED` means the test failed and is disclosed honestly.

## Egaki Generation Workflow

```txt
1. Freeze demo path.
2. Capture screenshots or UI clips.
3. Prepare evidence cards.
4. Generate MDX script.
5. Preview scene by scene.
6. Check each claim against evidence.
7. Export MP4.
8. Produce short cutdowns if needed.
9. Add video link to submission.
10. Update HACKATHON-STATE.md.
```

## Review Checklist

Before final export:

- Does the first 5 seconds explain the project?
- Is the sponsor technology visible and accurately described?
- Is the live demo path understandable?
- Are all evidence labels truthful?
- Are limitations included before the final screen?
- Is there no fake traction, fake user count, or fake revenue?
- Are screenshots or recordings from the actual project?
- Does the final screen include repo/live/submission links?
- Is the video under 120 seconds unless explicitly justified?

## Final Rule

Egaki is the preferred Hackathon OS module for judge-facing videos.

It should create a reproducible, evidence-based, score-aligned submission video, not a generic AI-generated promo.
