"use client"

import * as React from "react"
import { LabNavigation } from "@/components/navigation/lab-navigation"
import { InteractionPlayer } from "@/components/player/interaction-player"
import { PlayerProvider } from "@/components/player/player-provider"
import { PlayerStage } from "@/components/player/player-stage"
import { PlayerTimeline } from "@/components/player/player-timeline"
import { PlayerControls } from "@/components/player/player-controls"
import { PlayerCapturePanel } from "@/components/player/player-capture-panel"
import { PlayerTokenExport } from "@/components/player/player-token-export"
import { playerPresets } from "@/lib/player/presets"
import type { PlayerConfig } from "@/lib/player/types"

const etdPreset = playerPresets.evidenceToDecision

const heroConfig: PlayerConfig = {
  fps: etdPreset.fps,
  aspectRatio: etdPreset.defaultAspectRatio,
  loop: true,
  autoplay: false,
}

const keyboardShortcuts = [
  { key: "Space", action: "Play / Pause" },
  { key: "←", action: "Rewind 1 second" },
  { key: "→", action: "Forward 1 second" },
  { key: "Shift + ←", action: "Previous frame" },
  { key: "Shift + →", action: "Next frame" },
  { key: "Home", action: "Go to start" },
  { key: "End", action: "Go to end" },
  { key: "M", action: "Next marker" },
  { key: "R", action: "Restart" },
]

const usageRules = [
  "Scenes must be pure functions of the render context. No Math.random(), no Date.now(), no network calls.",
  "The player does not use setInterval. Playback is driven exclusively by requestAnimationFrame.",
  "Capture mode auto-pauses. Frame stepping produces identical output at the same currentTime.",
  "The timeline is the primary navigation surface. Controls are secondary transport.",
  "Markers are temporal bookmarks, not interactive triggers.",
  "Every preset is a temporal structure, not a video file.",
]

const limitations = [
  "The player does not export images or video. It produces capture-ready states for external tools.",
  "Remotion integration is deferred to the next phase.",
  "No audio track support in this version.",
  "CSS transitions in capture mode may be suppressed for deterministic output.",
  "Safe area overlays are visual guides, not pixel-accurate broadcast specifications.",
]

export default function PlayerPage() {
  return (
    <main className="min-h-screen bg-[#0a0a09] text-stone-100 selection:bg-cyan-400/20 selection:text-stone-100 font-sans">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-[#0a0a09]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500 font-bold">Componentry Lab</p>
            <h1 className="text-base font-bold tracking-tight text-stone-100">Interaction Playback Workbench</h1>
          </div>
          <LabNavigation
            className="contents"
            linkClassName="px-3.5"
            activeClassName="bg-stone-100 font-semibold text-stone-900 shadow-xs"
            inactiveClassName="border border-stone-700 bg-stone-900/80 text-stone-400 transition hover:border-stone-500 hover:text-stone-200"
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 md:px-8 md:py-12">

        {/* ── 1. HERO — Live Player ──────────────────────── */}
        <section className="space-y-6" data-player-section="hero">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Interaction Player
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-100 max-w-2xl leading-[1.05]">
              Every interaction needs a playhead.
            </h2>
            <p className="text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed">
              Control time, inspect state, and reproduce the exact frame.
            </p>
          </div>

          {/* Main player — Evidence to Decision */}
          <PlayerProvider
            config={heroConfig}
            scenes={etdPreset.scenes}
            markers={etdPreset.markers}
            initialMode="interactive"
          >
            <div className="space-y-3">
              <PlayerStage theme="cinematic" showCaptureOverlay />
              <PlayerTimeline />
              <PlayerControls />
            </div>
          </PlayerProvider>
        </section>

        {/* ── 2. Scene Anatomy ────────────────────────────── */}
        <section className="space-y-6" data-player-section="scene-anatomy">
          <div className="border-b border-stone-800 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Scene Anatomy</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Evidence to Decision</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {etdPreset.scenes.map((scene, i) => (
              <div
                key={scene.id}
                className="rounded-lg border border-stone-800 bg-[#121110] p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-stone-600 font-bold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-xs font-bold text-stone-200 uppercase tracking-wider">{scene.label}</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">{scene.description}</p>
                <div className="flex items-center gap-3 font-mono text-[10px] text-stone-600">
                  <span>Start: {scene.start}s</span>
                  <span>·</span>
                  <span>Dur: {scene.duration}s</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Playback Modes ───────────────────────────── */}
        <section className="grid gap-6 md:grid-cols-2" data-player-section="modes">
          <div className="rounded-xl border border-stone-800 bg-[#121110] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="font-mono text-sm font-bold text-stone-200 uppercase tracking-wider">Interactive Mode</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Standard playback mode. The player advances time using requestAnimationFrame.
              Scene transitions include opacity and motion. Timeline and controls are fully interactive.
            </p>
            <div className="font-mono text-[10px] text-stone-600 space-y-1">
              <p>• rAF-driven playback loop</p>
              <p>• Playback rates: 0.5×, 1×, 1.5×, 2×</p>
              <p>• Timeline seek on click</p>
              <p>• Keyboard shortcuts active</p>
            </div>
          </div>

          <div className="rounded-xl border border-stone-800 bg-[#121110] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <h3 className="font-mono text-sm font-bold text-stone-200 uppercase tracking-wider">Capture Mode</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Capture mode auto-pauses playback and suppresses non-deterministic transitions.
              Frame stepping advances exactly one frame at a time for stable output.
            </p>
            <div className="font-mono text-[10px] text-stone-600 space-y-1">
              <p>• Auto-pause on mode switch</p>
              <p>• Frame-level stepping (Shift + arrows)</p>
              <p>• Deterministic scene output</p>
              <p>• Capture state copy to clipboard</p>
            </div>
          </div>
        </section>

        {/* ── 4. Capture Mode Demo ────────────────────────── */}
        <section className="space-y-6" data-player-section="capture-demo">
          <div className="border-b border-stone-800 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Capture Mode</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Frame-level precision</h2>
          </div>

          <PlayerProvider
            config={{ ...heroConfig, loop: false }}
            scenes={etdPreset.scenes}
            markers={etdPreset.markers}
            initialMode="capture"
            initialTime={5}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                <PlayerStage theme="cinematic" showCaptureOverlay />
                <PlayerTimeline />
                <PlayerControls />
              </div>
              <PlayerCapturePanel />
            </div>
          </PlayerProvider>
        </section>

        {/* ── 5. Three Presets ─────────────────────────────── */}
        <section className="space-y-6" data-player-section="presets">
          <div className="border-b border-stone-800 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Presets</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Three temporal structures</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {Object.values(playerPresets).map((preset) => (
              <div key={preset.id} className="space-y-3">
                <div className="rounded-lg border border-stone-800 bg-[#121110] p-4 space-y-2">
                  <h3 className="font-mono text-xs font-bold text-stone-200 uppercase tracking-wider">{preset.label}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{preset.description}</p>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-stone-600">
                    <span>{preset.duration}s</span>
                    <span>·</span>
                    <span>{preset.fps} fps</span>
                    <span>·</span>
                    <span>{preset.scenes.length} scenes</span>
                    <span>·</span>
                    <span>{preset.markers.length} markers</span>
                  </div>
                </div>
                <InteractionPlayer
                  preset={preset}
                  initialMode="interactive"
                  theme="cinematic"
                  showMarkers={false}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Full Player with Markers + Inspector ──── */}
        <section className="space-y-6" data-player-section="full-player">
          <div className="border-b border-stone-800 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Full Player</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Markers and Inspector</h2>
          </div>

          <InteractionPlayer
            preset={etdPreset}
            initialMode="interactive"
            theme="cinematic"
            showMarkers
            showInspector
            showCapturePanel
          />
        </section>

        {/* ── 7. Keyboard Shortcuts ───────────────────────── */}
        <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8" data-player-section="shortcuts">
          <div className="space-y-6">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Controls</p>
              <h2 className="text-2xl font-bold tracking-tight text-stone-100">Keyboard Shortcuts</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {keyboardShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-3 rounded-md border border-stone-800 bg-stone-900/30 px-3 py-2.5">
                  <kbd className="inline-flex items-center justify-center min-w-[2.5rem] rounded border border-stone-700 bg-stone-800 px-2 py-1 font-mono text-[10px] font-bold text-stone-300">
                    {shortcut.key}
                  </kbd>
                  <span className="text-xs text-stone-400">{shortcut.action}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-600 font-mono">
              Shortcuts are disabled when focus is inside an input, textarea, or contentEditable element.
            </p>
          </div>
        </section>

        {/* ── 8. API & Token Export ────────────────────────── */}
        <section className="space-y-6" data-player-section="export">
          <div className="border-b border-stone-800 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">API</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Token Export</h2>
          </div>

          <PlayerProvider
            config={heroConfig}
            scenes={etdPreset.scenes}
            markers={etdPreset.markers}
            initialMode="interactive"
          >
            <PlayerTokenExport />
          </PlayerProvider>
        </section>

        {/* ── 9. Usage Rules ──────────────────────────────── */}
        <section className="rounded-xl border border-stone-800 bg-[#121110] p-6 md:p-8 space-y-6" data-player-section="rules">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Usage Rules</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Deterministic playback constraints</h2>
          </div>
          <div className="space-y-2">
            {usageRules.map((rule) => (
              <div key={rule} className="flex gap-3 rounded-md border border-stone-800 bg-stone-900/30 p-3 text-xs text-stone-300 leading-relaxed">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                <p className="text-pretty">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. Limitations ─────────────────────────────── */}
        <section className="rounded-xl border border-stone-800 bg-[#0e0d0c] p-6 md:p-8 space-y-6" data-player-section="limitations">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Limitations</p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Current boundaries</h2>
          </div>
          <div className="space-y-2">
            {limitations.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-stone-800/60 bg-stone-900/20 p-3 text-xs text-stone-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 shrink-0" />
                <p className="text-pretty">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 11. Memory Hook ─────────────────────────────── */}
        <section className="text-center py-12" data-player-section="memory">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-600 mb-4">Memory Hook</p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-200 italic">
            &ldquo;Every interaction needs a playhead.&rdquo;
          </p>
        </section>
      </div>
    </main>
  )
}
