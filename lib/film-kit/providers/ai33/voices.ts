export function buildVoiceRequest(text: string, voiceId: string, speed = 1) {
  return { text, voiceId, speed }
}