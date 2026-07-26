export function getAi33BaseUrl() {
  return process.env.AI33_API_BASE_URL ?? "https://api.ai33.pro"
}

export function getAi33ApiKey() {
  return process.env.AI33_API_KEY ?? ""
}