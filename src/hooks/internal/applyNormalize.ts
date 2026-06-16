export function applyNormalize(normalize: ((digits: string) => string) | undefined, digits: string): string {
  return normalize ? normalize(digits) : digits;
}
