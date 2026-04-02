import esbuild from 'esbuild'
import { existsSync } from 'fs'
import { resolve, dirname, join } from 'path'

const ROOT = import.meta.dir
const SRC = resolve(ROOT, 'src')

// Plugin: resolve bun:bundle shim + .js→.ts + stub missing files
const resolverPlugin: esbuild.Plugin = {
  name: 'ts-resolver-and-stubber',
  setup(build) {
    // bun:bundle shim — feature() always returns false
    build.onResolve({ filter: /^bun:bundle$/ }, () => ({
      path: resolve(ROOT, 'src/stubs/bun-bundle.ts'),
    }))

    // Handle src/-prefixed imports that reference missing files (before alias expansion)
    build.onResolve({ filter: /^src\/(tasks|coordinator|bridge|assistant|proactive|services\/contextCollapse|services\/compact\/snip|services\/compact\/cached|services\/skillSearch|utils\/uds|memdir\/memory)/ }, (args) => {
      // Try to resolve as a real file first
      const withoutSrc = args.path.replace(/^src\//, '')
      const candidates = [
        resolve(ROOT, 'src', withoutSrc.replace(/\.js$/, '.ts')),
        resolve(ROOT, 'src', withoutSrc.replace(/\.js$/, '.tsx')),
        resolve(ROOT, 'src', withoutSrc),
      ]
      for (const c of candidates) {
        if (existsSync(c)) return { path: c }
      }
      return { path: args.path, namespace: 'missing-stub' }
    })

    // Stub native modules with known named exports
    build.onResolve({ filter: /^color-diff-napi$/ }, () => ({
      path: resolve(ROOT, 'src/stubs/color-diff-napi.ts'),
    }))

    // Stub @ant/claude-for-chrome-mcp with real typed exports
    build.onResolve({ filter: /^@ant\/claude-for-chrome-mcp$/ }, () => ({
      path: resolve(ROOT, 'src/stubs/claude-for-chrome-mcp.ts'),
    }))

    // Stub all other @ant/* packages and unavailable Anthropic packages
    build.onResolve({ filter: /^@ant\/|^@anthropic-ai\/(claude-agent-sdk|foundry-sdk)$/ }, () => ({
      path: 'stub', namespace: 'missing-stub',
    }))

    // Stub missing generated content files
    build.onResolve({ filter: /claudeApiContent/ }, () => ({
      path: 'stub', namespace: 'missing-stub',
    }))

    // Stub SPECIFIC missing tool/service files (exact match on filename)
    // Use precise patterns to avoid catching files that DO exist (e.g. SleepTool/prompt.ts)
    build.onResolve({
      filter: /\/(TungstenTool\/TungstenTool|TungstenTool\/TungstenLiveMonitor|SuggestBackgroundPRTool\/SuggestBackgroundPRTool|VerifyPlanExecutionTool\/VerifyPlanExecutionTool|VerifyPlanExecutionTool\/constants|OverflowTestTool\/OverflowTestTool|SleepTool\/SleepTool|MonitorTool\/MonitorTool|SendUserFileTool\/SendUserFileTool|PushNotificationTool\/PushNotificationTool|SubscribePRTool\/SubscribePRTool|CtxInspectTool\/CtxInspectTool|TerminalCaptureTool\/TerminalCaptureTool|TerminalCaptureTool\/prompt|WebBrowserTool\/WebBrowserTool|WebBrowserTool\/WebBrowserPanel|SnipTool\/SnipTool|ListPeersTool\/ListPeersTool|WorkflowTool\/WorkflowTool|WorkflowTool\/bundled\/index|WorkflowTool\/WorkflowPermissionRequest|WorkflowTool\/createWorkflowCommand|ReviewArtifactTool\/ReviewArtifactTool|ReviewArtifactPermissionRequest\/ReviewArtifactPermissionRequest|MonitorPermissionRequest\/MonitorPermissionRequest|SnapshotUpdateDialog|AssistantSessionChooser|agents-platform\/index|protectedNamespace|postCommitAttribution|attributionHooks|attributionTrailer|sessionTranscript|cachedMicrocompact|cachedMCConfig|cachedMCModule|devtools\.js|snipCompact|snipProjection|contextCollapse|reactiveCompact|skillSearch\/(featureCheck|prefetch|localSearch|remoteSkill|telemetry)|proactive\/index|proactive\/useProactive|coordinator\/workerAgent|environment-runner\/main|daemon\/main|daemon\/workerRegistry|self-hosted-runner\/main|cli\/bg|cli\/handlers\/templateJobs|DiscoverSkillsTool\/prompt|SendUserFileTool\/prompt|SnipTool\/prompt|SleepTool\/prompt|jobs\/classifier|taskSummary|tasks\/MonitorMcpTask|tasks\/LocalWorkflowTask|udsClient|udsMessaging|bridge\/peerSessions|bridge\/webhookSanitizer|assistant\/index|assistant\/AssistantSessionChooser|memoryShapeTelemetry|systemThemeWatcher|mcpSkills|SnipBoundaryMessage|UserForkBoilerplateMessage|UserGitHubWebhookMessage|UserCrossS|skills\/mcpSkills)\.(js|ts)$/,
    }, (args) => ({
      path: args.path, namespace: 'missing-stub',
    }))

    // Stub missing commands
    build.onResolve({
      filter: /\/commands\/(assistant\/assistant|autofix-pr|backfill-sessions|good-claude|issue\/index|ctx_viz|break-cache|onboarding|share|teleport|bughunter|mock-limits|summary|reset-limits|ant-trace|perf-issue|env\/index|oauth-refresh|debug-tool-call|proactive|remoteControlServer|force-snip|workflows\/index|subscribe-pr|torch|peers\/index|fork\/index|buddy\/index|assistant\/index)\.(js|ts)/,
    }, (args) => ({
      path: args.path, namespace: 'missing-stub',
    }))

    // Resolve relative and absolute .js imports from our source as .ts/.tsx
    build.onResolve({ filter: /\.js$/ }, (args) => {
      if (args.importer.includes('node_modules')) return null

      const path = args.path
      let candidates: string[] = []

      if (path.startsWith('/')) {
        // Absolute path (after alias resolution)
        const base = path.slice(0, -3)
        candidates = [base + '.ts', base + '.tsx']
      } else if (path.startsWith('.')) {
        // Relative path from our source
        const base = path.slice(0, -3)
        const dir = dirname(args.importer)
        candidates = [
          join(dir, base + '.ts'),
          join(dir, base + '.tsx'),
          join(dir, base, 'index.ts'),
          join(dir, base, 'index.tsx'),
        ]
      } else {
        return null
      }

      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          return { path: candidate }
        }
      }

      // File genuinely missing — stub with CJS proxy
      return { path: args.path, namespace: 'cjs-stub' }
    })

    // CJS proxy stub: satisfies named imports via runtime Proxy (no static analysis)
    build.onLoad({ filter: /.*/, namespace: 'cjs-stub' }, (args) => {
      console.warn(`  [cjs-stub] ${args.path}`)
      return {
        // CJS format: esbuild wraps this, named imports access proxy at runtime
        contents: `
var __p = new Proxy(function(){}, { get: function(_, k) { return k === '__esModule' ? true : __p; } });
module.exports = __p;
module.exports.__esModule = true;
module.exports.default = __p;
`,
        loader: 'js',
      }
    })

    // Named stub for explicitly listed missing stubs (returns empty object)
    build.onLoad({ filter: /.*/, namespace: 'missing-stub' }, (args) => {
      console.warn(`  [stub]     ${args.path}`)
      return {
        contents: `
var __p = new Proxy(function(){}, { get: function(_, k) { return k === '__esModule' ? true : __p; } });
module.exports = __p;
module.exports.__esModule = true;
module.exports.default = __p;
`,
        loader: 'js',
      }
    })
  },
}

console.log('Building Claude Code from source (esbuild)...')

await esbuild.build({
  entryPoints: [resolve(ROOT, 'src/entrypoints/cli.tsx')],
  bundle: true,
  outfile: resolve(ROOT, 'dist/cli.cjs'),
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: false,
  minify: false,
  treeShaking: true,
  jsx: 'automatic',
  jsxImportSource: 'react',
  plugins: [resolverPlugin],

  banner: {
    js: 'var __importMetaUrl = typeof __filename !== "undefined" ? require("url").pathToFileURL(__filename).href : "file://unknown"; var __importMetaDir = typeof __dirname !== "undefined" ? __dirname : "/";',
  },

  define: {
    // Polyfill import.meta.url for CJS output (references banner globals)
    'import.meta.url': '__importMetaUrl',
    'import.meta.dir': '__importMetaDir',
    'import.meta.path': '__filename',
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
    // @ant/* packages are stubbed via plugin above (not external)
    '@anthropic-ai/bedrock-sdk', '@anthropic-ai/vertex-sdk',
    'axios', 'tree-kill', 'supports-hyperlinks', 'picomatch',
    'shell-quote',
  ],

  logLevel: 'warning',
})

console.log('\nBuild complete! Output: dist/cli.cjs')
console.log('Run with: ~/.bun/bin/bun dist/cli.cjs')
