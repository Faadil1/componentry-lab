// ─────────────────────────────────────────────────────────────
// Universal Interaction Player — Scene Presets
// Temporal structures, not videos.
// ─────────────────────────────────────────────────────────────

import type { PlayerPreset, PlayerRenderContext } from "./types"
import React from "react"

// ── Shared scene render helpers ──────────────────────────────
// Each scene renders a visual specimen driven solely by the
// deterministic render context (progress, frame, mode).

function sceneBlock(
  title: string,
  subtitle: string,
  accentColor: string,
  ctx: PlayerRenderContext
): React.ReactNode {
  const opacity = ctx.sceneProgress < 0.1
    ? ctx.sceneProgress / 0.1
    : ctx.sceneProgress > 0.9
      ? (1 - ctx.sceneProgress) / 0.1
      : 1
  const clampedOpacity = Math.min(1, Math.max(0, opacity))
  const translateY = (1 - clampedOpacity) * 8

  return React.createElement("div", {
    className: "flex flex-col items-center justify-center gap-3 text-center w-full h-full",
    style: {
      opacity: clampedOpacity,
      transform: `translateY(${translateY}px)`,
      ...(ctx.mode === "capture" ? { opacity: 1, transform: "none" } : {}),
    },
  }, [
    React.createElement("div", {
      key: "accent",
      className: "w-10 h-1 rounded-full",
      style: { backgroundColor: accentColor },
    }),
    React.createElement("h3", {
      key: "title",
      className: "text-lg sm:text-xl font-bold tracking-tight text-stone-100",
    }, title),
    React.createElement("p", {
      key: "subtitle",
      className: "text-xs sm:text-sm text-stone-400 max-w-xs font-mono",
    }, subtitle),
    React.createElement("div", {
      key: "meta",
      className: "flex items-center gap-3 text-[10px] font-mono text-stone-500 mt-2",
    }, [
      React.createElement("span", { key: "frame" }, `F${ctx.frame}`),
      React.createElement("span", { key: "dot" }, "·"),
      React.createElement("span", { key: "progress" }, `${Math.round(ctx.sceneProgress * 100)}%`),
    ]),
  ])
}

// ─────────────────────────────────────────────────────────────
// 1. PRODUCT REVEAL — 8 seconds
// ─────────────────────────────────────────────────────────────

export const productRevealPreset: PlayerPreset = {
  id: "product-reveal",
  label: "Product Reveal",
  description: "A four-act product introduction sequence: orientation, interface reveal, primary interaction, and result state.",
  duration: 8,
  fps: 30,
  defaultAspectRatio: "16:9",
  scenes: [
    {
      id: "pr-orientation",
      label: "Orientation",
      start: 0,
      duration: 2,
      description: "The product context establishes itself.",
      render: (ctx) => sceneBlock("Orientation", "Context establishes itself", "#67e8f9", ctx),
    },
    {
      id: "pr-interface-reveal",
      label: "Interface Reveal",
      start: 2,
      duration: 2,
      description: "Core interface surfaces into view.",
      render: (ctx) => sceneBlock("Interface Reveal", "Core surface visible", "#a5f3fc", ctx),
    },
    {
      id: "pr-primary-interaction",
      label: "Primary Interaction",
      start: 4,
      duration: 2,
      description: "The key interaction plays out.",
      render: (ctx) => sceneBlock("Primary Interaction", "Key action performed", "#22d3ee", ctx),
    },
    {
      id: "pr-result-state",
      label: "Result State",
      start: 6,
      duration: 2,
      description: "The final result is presented.",
      render: (ctx) => sceneBlock("Result State", "Outcome confirmed", "#06b6d4", ctx),
    },
  ],
  markers: [
    { id: "pr-m-start", label: "Start", time: 0, type: "scene" },
    { id: "pr-m-reveal", label: "Reveal", time: 2, type: "interaction" },
    { id: "pr-m-action", label: "Action", time: 4, type: "interaction" },
    { id: "pr-m-result", label: "Result", time: 6, type: "capture" },
  ],
}

// ─────────────────────────────────────────────────────────────
// 2. EVIDENCE TO DECISION — 10 seconds
// ─────────────────────────────────────────────────────────────

export const evidenceToDecisionPreset: PlayerPreset = {
  id: "evidence-to-decision",
  label: "Evidence to Decision",
  description: "A diagnostic sequence moving from anomaly detection through structured evidence gathering to a locked decision state.",
  duration: 10,
  fps: 30,
  defaultAspectRatio: "16:9",
  scenes: [
    {
      id: "etd-signal",
      label: "Signal",
      start: 0,
      duration: 2.5,
      description: "An anomaly or variation appears in the data stream.",
      markerType: "interaction",
      render: (ctx) => {
        const bars = [0.3, 0.5, 0.7, 0.4, 0.9, 0.6, 0.8, 0.35]
        return React.createElement("div", {
          className: "flex flex-col items-center justify-center gap-4 w-full h-full",
          style: ctx.mode === "capture" ? {} : {
            opacity: Math.min(1, ctx.sceneProgress / 0.15),
          },
        }, [
          React.createElement("div", {
            key: "eyebrow",
            className: "flex items-center gap-2",
          }, [
            React.createElement("span", {
              key: "dot",
              className: "w-2 h-2 rounded-full bg-amber-400",
              style: ctx.mode === "capture" ? {} : {
                opacity: ctx.sceneProgress > 0.3 ? 1 : 0.4,
              },
            }),
            React.createElement("span", {
              key: "label",
              className: "font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/80",
            }, "Signal Detected"),
          ]),
          React.createElement("div", {
            key: "bars",
            className: "flex items-end gap-1.5 h-16",
          }, bars.map((h, i) =>
            React.createElement("div", {
              key: i,
              className: "w-3 sm:w-4 rounded-sm transition-none",
              style: {
                height: `${h * 100 * Math.min(1, ctx.sceneProgress * 2)}%`,
                backgroundColor: i === 4 ? "#fbbf24" : "#44403c",
              },
            })
          )),
          React.createElement("p", {
            key: "title",
            className: "text-lg sm:text-xl font-bold text-stone-100 tracking-tight",
          }, "Anomaly Variation"),
          React.createElement("p", {
            key: "sub",
            className: "text-xs text-stone-500 font-mono",
          }, `Frame ${ctx.frame} · ${Math.round(ctx.sceneProgress * 100)}%`),
        ])
      },
    },
    {
      id: "etd-evidence",
      label: "Evidence",
      start: 2.5,
      duration: 2.5,
      description: "Structured evidence becomes visible and measurable.",
      markerType: "evidence",
      render: (ctx) => {
        const rows = [
          { label: "Confidence", value: "92.4%", color: "#22d3ee" },
          { label: "Deviation", value: "+3.7σ", color: "#fbbf24" },
          { label: "Frequency", value: "1.2 kHz", color: "#a8a29e" },
        ]
        return React.createElement("div", {
          className: "flex flex-col items-center justify-center gap-4 w-full h-full",
          style: ctx.mode === "capture" ? {} : {
            opacity: Math.min(1, ctx.sceneProgress / 0.15),
          },
        }, [
          React.createElement("span", {
            key: "eyebrow",
            className: "font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80",
          }, "Evidence Layer"),
          React.createElement("div", {
            key: "table",
            className: "w-full max-w-xs space-y-2",
          }, rows.map((row, i) =>
            React.createElement("div", {
              key: i,
              className: "flex items-center justify-between border-b border-stone-800 pb-2",
              style: ctx.mode === "capture" ? {} : {
                opacity: ctx.sceneProgress > (i * 0.2 + 0.1) ? 1 : 0.2,
              },
            }, [
              React.createElement("span", {
                key: "l",
                className: "text-xs text-stone-400 font-mono",
              }, row.label),
              React.createElement("span", {
                key: "v",
                className: "text-sm font-bold font-mono tabular-nums",
                style: { color: row.color },
              }, row.value),
            ])
          )),
          React.createElement("p", {
            key: "sub",
            className: "text-xs text-stone-500 font-mono mt-2",
          }, `Frame ${ctx.frame}`),
        ])
      },
    },
    {
      id: "etd-interpretation",
      label: "Interpretation",
      start: 5,
      duration: 2.5,
      description: "A relationship or provisional conclusion is highlighted.",
      markerType: "evidence",
      render: (ctx) => {
        return React.createElement("div", {
          className: "flex flex-col items-center justify-center gap-4 w-full h-full",
          style: ctx.mode === "capture" ? {} : {
            opacity: Math.min(1, ctx.sceneProgress / 0.15),
          },
        }, [
          React.createElement("span", {
            key: "eyebrow",
            className: "font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500",
          }, "Interpretation"),
          React.createElement("div", {
            key: "diagram",
            className: "flex items-center gap-3",
          }, [
            React.createElement("div", {
              key: "a",
              className: "w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center font-mono text-xs text-cyan-300",
            }, "A"),
            React.createElement("div", {
              key: "arrow",
              className: "text-stone-600 font-mono text-sm",
              style: ctx.mode === "capture" ? {} : {
                opacity: ctx.sceneProgress > 0.3 ? 1 : 0,
              },
            }, "→"),
            React.createElement("div", {
              key: "b",
              className: "w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-amber-500/40 bg-amber-950/30 flex items-center justify-center font-mono text-xs text-amber-300",
            }, "B"),
          ]),
          React.createElement("p", {
            key: "conclusion",
            className: "text-sm sm:text-base font-bold text-stone-100 tracking-tight max-w-xs text-center",
            style: ctx.mode === "capture" ? {} : {
              opacity: ctx.sceneProgress > 0.5 ? 1 : 0,
            },
          }, "Correlation confirmed at 92.4% confidence"),
          React.createElement("p", {
            key: "sub",
            className: "text-xs text-stone-500 font-mono",
          }, `Frame ${ctx.frame}`),
        ])
      },
    },
    {
      id: "etd-decision-lock",
      label: "Decision Lock",
      start: 7.5,
      duration: 2.5,
      description: "The decision is recorded and the system enters a locked state.",
      markerType: "decision",
      render: (ctx) => {
        const isLocked = ctx.mode === "capture" || ctx.sceneProgress > 0.4
        return React.createElement("div", {
          className: "flex flex-col items-center justify-center gap-4 w-full h-full",
          style: ctx.mode === "capture" ? {} : {
            opacity: Math.min(1, ctx.sceneProgress / 0.15),
          },
        }, [
          React.createElement("div", {
            key: "badge",
            className: `inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.15em] border ${
              isLocked
                ? "border-red-500/60 bg-red-950/40 text-red-400"
                : "border-stone-700 bg-stone-900 text-stone-500"
            }`,
          }, [
            React.createElement("span", {
              key: "icon",
              className: `w-2 h-2 rounded-full ${isLocked ? "bg-red-400" : "bg-stone-600"}`,
            }),
            React.createElement("span", { key: "text" }, isLocked ? "Decision Locked" : "Pending…"),
          ]),
          React.createElement("p", {
            key: "title",
            className: "text-lg sm:text-xl font-bold text-stone-100 tracking-tight",
            style: ctx.mode === "capture" ? {} : {
              opacity: isLocked ? 1 : 0.3,
            },
          }, "Accept correlation as causal"),
          React.createElement("div", {
            key: "stamp",
            className: "font-mono text-[10px] text-stone-600 flex items-center gap-3",
          }, [
            React.createElement("span", { key: "f" }, `Frame ${ctx.frame}`),
            React.createElement("span", { key: "dot" }, "·"),
            React.createElement("span", { key: "state" }, isLocked ? "LOCKED" : "UNLOCKED"),
          ]),
        ])
      },
    },
  ],
  markers: [
    { id: "etd-m-signal", label: "Signal", time: 0, type: "interaction", description: "Anomaly variation detected" },
    { id: "etd-m-evidence", label: "Evidence", time: 2.5, type: "evidence", description: "Structured proof surfaces" },
    { id: "etd-m-interpretation", label: "Interpretation", time: 5, type: "evidence", description: "Provisional conclusion" },
    { id: "etd-m-lock", label: "Decision Lock", time: 7.5, type: "decision", description: "System enters locked state" },
    { id: "etd-m-end", label: "End", time: 10, type: "capture", description: "Capture-ready final frame" },
  ],
}

// ─────────────────────────────────────────────────────────────
// 3. BROADCAST CUE — 8 seconds
// ─────────────────────────────────────────────────────────────

export const broadcastCuePreset: PlayerPreset = {
  id: "broadcast-cue",
  label: "Broadcast Cue",
  description: "A live broadcast sequence from standby through the live state, an event marker, to a lower-third result.",
  duration: 8,
  fps: 30,
  defaultAspectRatio: "16:9",
  scenes: [
    {
      id: "bc-standby",
      label: "Standby",
      start: 0,
      duration: 2,
      description: "Pre-broadcast standby state.",
      render: (ctx) => sceneBlock("Standby", "Awaiting cue", "#78716c", ctx),
    },
    {
      id: "bc-live-state",
      label: "Live State",
      start: 2,
      duration: 2,
      description: "Broadcast is live.",
      render: (ctx) => {
        return React.createElement("div", {
          className: "flex flex-col items-center justify-center gap-3 text-center w-full h-full",
          style: ctx.mode === "capture" ? {} : {
            opacity: Math.min(1, ctx.sceneProgress / 0.1),
          },
        }, [
          React.createElement("div", {
            key: "live",
            className: "inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/50 px-3 py-1",
          }, [
            React.createElement("span", {
              key: "dot",
              className: "w-2 h-2 rounded-full bg-red-500",
            }),
            React.createElement("span", {
              key: "text",
              className: "font-mono text-xs font-bold text-red-400 uppercase tracking-wider",
            }, "Live"),
          ]),
          React.createElement("h3", {
            key: "title",
            className: "text-lg sm:text-xl font-bold tracking-tight text-stone-100",
          }, "On Air"),
          React.createElement("p", {
            key: "sub",
            className: "text-xs text-stone-500 font-mono",
          }, `Frame ${ctx.frame}`),
        ])
      },
    },
    {
      id: "bc-event-marker",
      label: "Event Marker",
      start: 4,
      duration: 2,
      description: "A significant broadcast event is marked.",
      render: (ctx) => sceneBlock("Event Marker", "Key moment captured", "#fbbf24", ctx),
    },
    {
      id: "bc-lower-third",
      label: "Lower Third",
      start: 6,
      duration: 2,
      description: "The result appears as a lower-third overlay.",
      render: (ctx) => sceneBlock("Lower Third", "Result displayed", "#67e8f9", ctx),
    },
  ],
  markers: [
    { id: "bc-m-standby", label: "Standby", time: 0, type: "scene" },
    { id: "bc-m-live", label: "Live", time: 2, type: "interaction" },
    { id: "bc-m-event", label: "Event", time: 4, type: "capture" },
    { id: "bc-m-lower", label: "Lower Third", time: 6, type: "scene" },
  ],
}

// ── All presets ──────────────────────────────────────────────

export const playerPresets = {
  productReveal: productRevealPreset,
  evidenceToDecision: evidenceToDecisionPreset,
  broadcastCue: broadcastCuePreset,
} as const
