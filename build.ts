import { resolve, dirname, join } from 'path'
import { existsSync } from 'fs'

const ROOT = import.meta.dir
const SRC = resolve(ROOT, 'src')

// Plugin: resolve .js imports from OUR source as .ts/.tsx, stub truly missing files
const resolverPlugin: BunPlugin = {
  name: 'ts-resolver-and-stubber',
  setup(build) {

    // Stub known-missing internal tools (referenced via src/ alias or relative)
    build.onResolve({
      filter: /TungstenTool|SuggestBackgroundPRTool|VerifyPlanExecutionTool|SnapshotUpdateDialog|AssistantSessionChooser|cachedMicrocompact|devtools\.js|agents-platform\/index|protectedNamespace|snipCompact|contextCollapse|services\/contextCollapse/,
    }, (args) => ({
      path: args.path, namespace: 'missing-stub'
    }))

    // Stub missing commands (referenced from src/commands.ts / dialogLaunchers.tsx)
    build.onResolve({
      filter: /commands\/(assistant\/assistant|autofix-pr|backfill-sessions|good-claude|issue\/index|ctx_viz|break-cache|onboarding|share|teleport|bughunter|mock-limits|summary|reset-limits|ant-trace|perf-issue|env\/index|oauth-refresh|debug-tool-call)\/?(index)?\.js/,
    }, (args) => ({
      path: args.path, namespace: 'missing-stub'
    }))

    // Stub vendor native modules not in vendor/
    build.onResolve({ filter: /^color-diff-napi$/ }, () => ({
      path: 'color-diff-napi', namespace: 'missing-stub'
    }))

    // Stub Anthropic-internal / unavailable packages
    build.onResolve({
      filter: /^@anthropic-ai\/(claude-agent-sdk|foundry-sdk)$/,
    }, () => ({ path: 'stub', namespace: 'missing-stub' }))

    // Resolve relative .js imports FROM our source files as .ts/.tsx
    // Critically: skip node_modules internals (their .js files should resolve natively)
    build.onResolve({ filter: /\.js$/ }, (args) => {
      if (!args.path.startsWith('.')) return           // not relative — let Bun handle
      if (args.importer.includes('node_modules')) return  // don't touch node_modules

      const base = args.path.slice(0, -3) // strip .js
      const dir = dirname(args.importer)

      const candidates = [
        join(dir, base + '.ts'),
        join(dir, base + '.tsx'),
        join(dir, base, 'index.ts'),
        join(dir, base, 'index.tsx'),
      ]

      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          return { path: candidate }
        }
      }

      // Source file genuinely missing — stub it
      return { path: args.path, namespace: 'missing-stub' }
    })

    // Return empty module for all stubs
    build.onLoad({ filter: /.*/, namespace: 'missing-stub' }, (args) => {
      console.warn(`  [stub] ${args.path}`)
      return {
        contents: 'export default {}; export const __stub = true;',
        loader: 'js',
      }
    })
  },
}

console.log('Building Claude Code from source...')

const result = await Bun.build({
  entrypoints: [resolve(ROOT, 'src/entrypoints/cli.tsx')],
  outdir: resolve(ROOT, 'dist'),
  target: 'bun',
  format: 'esm',
  sourcemap: 'none',
  minify: false,
  plugins: [resolverPlugin],

  define: {
    'MACRO.VERSION': '"2.1.88"',
    'MACRO.BUILD_TIME': 'undefined',
    'MACRO.VERSION_CHANGELOG': 'undefined',
    'MACRO.PACKAGE_URL': '"@anthropic-ai/claude-code"',
    'MACRO.NATIVE_PACKAGE_URL': 'undefined',
    'MACRO.ISSUES_EXPLAINER': '"open a GitHub issue at https://github.com/anthropics/claude-code/issues"',
    'MACRO.FEEDBACK_CHANNEL': '"https://github.com/anthropics/claude-code/issues"',
  },

  alias: {
    'src': SRC,
    '@anthropic-ai/sandbox-runtime': resolve(ROOT, 'src/stubs/sandbox-runtime.ts'),
    'audio-capture-napi': resolve(ROOT, 'vendor/audio-capture-src/index.ts'),
    'modifiers-napi': resolve(ROOT, 'vendor/modifiers-napi-src/index.ts'),
    'image-processor-napi': resolve(ROOT, 'vendor/image-processor-src/index.ts'),
    'url-handler-napi': resolve(ROOT, 'vendor/url-handler-src/index.ts'),
  },

  loader: {
    '.md': 'text',
    '.txt': 'text',
  },

  external: [
    '@img/sharp-darwin-arm64', '@img/sharp-darwin-x64',
    '@img/sharp-linux-arm64', '@img/sharp-linux-x64',
    '@img/sharp-linux-arm', '@img/sharp-linuxmusl-arm64',
    '@img/sharp-linuxmusl-x64', '@img/sharp-win32-arm64', '@img/sharp-win32-x64',
    '@grpc/grpc-js', '@grpc/proto-loader',
    '@ant/claude-for-chrome-mcp', '@ant/computer-use-mcp', '@ant/computer-use-swift',
  ],
})

if (!result.success) {
  console.error('\nBuild failed:')
  for (const message of result.logs) {
    console.error(message)
  }
  process.exit(1)
}

console.log('\nBuild complete! Output: dist/cli.js')
console.log('Run with: ~/.bun/bin/bun dist/cli.js')
