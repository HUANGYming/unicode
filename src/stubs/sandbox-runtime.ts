// Stub for @anthropic-ai/sandbox-runtime

export type FsReadRestrictionConfig = Record<string, unknown>
export type FsWriteRestrictionConfig = Record<string, unknown>
export type IgnoreViolationsConfig = Record<string, unknown>
export type NetworkHostPattern = string
export type NetworkRestrictionConfig = Record<string, unknown>
export type SandboxAskCallback = () => Promise<boolean>
export type SandboxDependencyCheck = Record<string, unknown>
export type SandboxRuntimeConfig = Record<string, unknown>
export type SandboxViolationEvent = Record<string, unknown>

export class SandboxManager {
  constructor(..._args: unknown[]) {}
  start() { return Promise.resolve() }
  stop() { return Promise.resolve() }
  isRunning() { return false }

  static isSupportedPlatform(): boolean { return false }
  static isSandboxingEnabled(): boolean { return false }
  static isSandboxEnabledInSettings(): boolean { return false }
  static isSandboxRequired(): boolean { return false }
  static isAutoAllowBashIfSandboxedEnabled(): boolean { return false }
  static areUnsandboxedCommandsAllowed(): boolean { return true }
  static getAllowUnixSockets(): boolean { return false }
  static getSandboxUnavailableReason(): string | null { return null }
  static getSandboxViolationStore(): SandboxViolationStore { return new SandboxViolationStore() }
  static getFsReadConfig(): FsReadRestrictionConfig | null { return null }
  static getFsWriteConfig(): FsWriteRestrictionConfig | null { return null }
  static getNetworkRestrictionConfig(): NetworkRestrictionConfig | null { return null }
  static getIgnoreViolations(): IgnoreViolationsConfig | null { return null }
  static checkDependencies(): SandboxDependencyCheck { return {} }
  static refreshConfig(): void {}
  static async initialize(_callback: SandboxAskCallback): Promise<void> {}
  static annotateStderrWithSandboxFailures(_cmd: string, stderr: string): string { return stderr }
}

export const SandboxRuntimeConfigSchema = {
  parse: (v: unknown) => v,
  safeParse: (v: unknown) => ({ success: true, data: v }),
}

export class SandboxViolationStore {
  getViolations() { return [] }
  addViolation(_v: unknown) {}
}

export default {}
