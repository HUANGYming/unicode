#!/usr/bin/env bash
# Build Claude Code from source and apply runtime patches
set -e

echo "=== Building Claude Code from source ==="
~/.bun/bin/bun build-esbuild.ts

echo "=== Applying runtime patches ==="
python3 << 'PYEOF'
with open('dist/cli.cjs', 'r') as f:
    content = f.read()

lines = content.split('\n')

# Patch 1: Catch unhandled rejections from main entry
for i, line in enumerate(lines):
    if line.strip() == 'void main2();':
        lines[i] = 'main2().catch(e => { process.stderr.write("FATAL: " + (e && e.stack || String(e)) + "\\n"); process.exit(1); });'
        print(f'  [patch] main2 error handler added at line {i+1}')
        break

content = '\n'.join(lines)

# Patch 2: Catch errors from runHeadless2 (void suppresses them)
old = 'void runHeadless2(inputPrompt, () => headlessStore.getState(), headlessStore.setState, commandsHeadless, tools, sdkMcpConfigs, agentDefinitions.activeAgents, {'
new_code = 'runHeadless2(inputPrompt, () => headlessStore.getState(), headlessStore.setState, commandsHeadless, tools, sdkMcpConfigs, agentDefinitions.activeAgents, {'
if old in content:
    content = content.replace(old, new_code, 1)
    pos = content.find(new_code)
    close_pos = content.find('});\n      return;', pos)
    if close_pos != -1:
        content = content[:close_pos+2] + '.catch(e => { process.stderr.write("[headless error] " + (e && e.stack || String(e)) + "\\n"); process.exit(1); })' + content[close_pos+2:]
        print('  [patch] runHeadless2 error handler added')

with open('dist/cli.cjs', 'w') as f:
    f.write(content)

print('=== Build complete! ===')
PYEOF
