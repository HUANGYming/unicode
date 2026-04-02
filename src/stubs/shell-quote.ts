// Re-export shell-quote CJS package as named ESM exports
// shell-quote uses CommonJS module.exports so esbuild warns about named imports
// This stub bridges the gap by using require() directly

// eslint-disable-next-line @typescript-eslint/no-require-imports
const _mod = require('shell-quote') as { parse: Function; quote: Function }

export type ParseEntry = string | { op: string } | { op: 'glob'; pattern: string }

export const parse = _mod.parse as (cmd: string, env?: Record<string, string | undefined> | ((key: string) => string | undefined)) => ParseEntry[]
export const quote = _mod.quote as (args: ReadonlyArray<string | number>) => string

export default _mod
