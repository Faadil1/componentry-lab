export let providerExecuteCallCount = 0

export function resetProviderExecuteCount(): void {
  providerExecuteCallCount = 0
}

export function runMockRemocnProvider(payload: Record<string, unknown>): Record<string, unknown> {
  providerExecuteCallCount++
  return {
    renderedUrl: "https://remocn.internal.film-kit/render/mock-1234.mp4",
    renderTime: 12.5,
    payloadEcho: payload
  }
}
