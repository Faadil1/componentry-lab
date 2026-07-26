export type Ai33VoiceProvider =
  | "elevenlabs"
  | "minimax"
  | "clone"
  | "edge"
  | "kokoro"
  | "vbee"
  | "fishaudio"

export const AI33_VOICE_PROVIDERS: Ai33VoiceProvider[] = [
  "elevenlabs",
  "minimax",
  "clone",
  "edge",
  "kokoro",
  "vbee",
  "fishaudio",
]

export const AI33_VOICE_PREFIXES = [
  "elevenlabs_",
  "minimax_",
  "clone_",
  "edge_",
  "kokoro_",
  "vbee_",
  "fishaudio_",
] as const

export function isAi33VoiceProvider(value: string | null | undefined): value is Ai33VoiceProvider {
  return !!value && AI33_VOICE_PROVIDERS.includes(value as Ai33VoiceProvider)
}

export function isValidAi33TaskId(taskId: string) {
  return /^[A-Za-z0-9_-]{8,128}$/.test(taskId)
}

export function normalizeErrorMessage(input: unknown) {
  if (typeof input === "string") {
    return input.slice(0, 240)
  }

  if (input && typeof input === "object") {
    const message = (input as { error?: unknown; message?: unknown; detail?: unknown }).message ?? (input as { error?: unknown }).error ?? (input as { detail?: unknown }).detail
    if (typeof message === "string") {
      return message.slice(0, 240)
    }
  }

  return "AI33 request failed."
}

export async function readUpstreamBody(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export function safeJson(data: unknown) {
  return JSON.stringify(data)
}