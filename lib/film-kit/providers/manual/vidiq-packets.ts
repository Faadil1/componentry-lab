import type { VidIqConceptPacket } from "../../types"
export function formatVidIqConceptPacket(packet: VidIqConceptPacket): string { return JSON.stringify(packet, null, 2) }