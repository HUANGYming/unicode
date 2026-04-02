// Stub for color-diff-napi native module
export class ColorDiff {
  constructor(_options?: unknown) {}
  diff(_a: unknown, _b: unknown): unknown[] { return [] }
}

export class ColorFile {
  constructor(_options?: unknown) {}
}

export type SyntaxTheme = Record<string, unknown>

export function getSyntaxTheme(_name?: string): SyntaxTheme {
  return {}
}

export default {}
