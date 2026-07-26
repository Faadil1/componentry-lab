import type { FlowGenerationPacket } from "../../types"
export function formatFlowGenerationPacket(packet: FlowGenerationPacket): string { return JSON.stringify(packet, null, 2) }