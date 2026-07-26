export function serializeFilmProject(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
