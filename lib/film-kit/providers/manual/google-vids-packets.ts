import type { GoogleVidsAssemblyPacket } from "../../types"
export function formatGoogleVidsAssemblyPacket(packet: GoogleVidsAssemblyPacket): string { return JSON.stringify(packet, null, 2) }