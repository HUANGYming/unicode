// Shim for bun:bundle — makes all feature() calls return false at runtime
// This disables optional/experimental features in non-Bun-bundled builds
export function feature(_name: string): boolean {
  return false
}
