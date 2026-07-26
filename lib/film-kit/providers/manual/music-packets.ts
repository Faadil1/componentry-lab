import type { MusicGenerationPacket } from "../../types"
export function formatMusicGenerationPacket(packet: MusicGenerationPacket): string { return JSON.stringify(packet, null, 2) }