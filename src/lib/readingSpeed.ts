export const PPM = 250 // palabras por minuto

export function calcReadingSeconds(wordCount: number): number {
  if (wordCount <= 0) return 0
  return Math.max(30, Math.round((wordCount / PPM) * 60))
}
