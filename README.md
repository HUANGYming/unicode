# UniCode

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.1.88-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Based_on-Claude_Code_2.1.88-orange.svg" alt="Based on">
  <img src="https://img.shields.io/badge/Provider-AnyRouter_%7C_DMXAPI_%7C_Local-green.svg" alt="Provider">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue.svg" alt="Language">
</p>

> 基于 Claude Code 2.1.88 源码重建的 AI 编程助手，支持国内第三方 API 提供商（AnyRouter、DMXAPI 等）及本地私有化部署模型，无需 Anthropic 账号即可使用。

---

## 特性

- **无需 Anthropic 账号** — 通过第三方 API（AnyRouter、DMXAPI 等）或本地模型使用
- **国内可用** — 不依赖 OpenRouter，支持国内可访问的 API 提供商
- **自动切换** — 本地模型在线时优先使用本地，离线自动切换远程
- **私有化部署** — 支持接入内网 Ollama / vLLM / LiteLLM，代码不出内网
- **完整 TUI** — 完整的终端交互界面，支持文件编辑、代码执行、Bash 工具等
- **猫猫主题** — 定制化 UI 🐱

---

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone https://github.com/YOUR_USERNAME/unicode.git
cd unicode
npm install
```

### 2. 构建

```bash
./build.sh
```

构建完成后生成 `dist/cli.cjs`。

### 3. 配置 API

编辑 `unicode` 脚本，填入你的 API 信息：

```bash
# 远程 API 配置（AnyRouter 示例）
REMOTE_BASE_URL="https://anyrouter.top"
REMOTE_MODEL="claude-haiku-4-5-20251001"
REMOTE_API_KEY="your-api-key-here"
```

### 4. 注册命令（可选）

```bash
echo 'alias unicode="/path/to/unicode"' >> ~/.zshrc
source ~/.zshrc
```

### 5. 启动

```bash
unicode          # 交互式 TUI 模式
unicode -p "帮我写一个排序算法"   # 非交互模式
```

---

## 支持的 API 提供商

### 原生 Anthropic 格式（直接兼容）

| 提供商 | Base URL | 备注 |
|--------|----------|------|
| [AnyRouter](https://anyrouter.top) | `https://anyrouter.top` | 国内可用，支持 Claude 全系列 |
| [DMXAPI](https://www.dmxapi.com) | `https://www.dmxapi.com` | 国内可用，需充值 |
| Anthropic 官方 | `https://api.anthropic.com` | 需官方账号 |

### OpenAI 格式（需 LiteLLM 中转）

| 提供商 | 备注 |
|--------|------|
| [SiliconFlow](https://siliconflow.cn) | DeepSeek、Qwen 等，国内免费额度 |
| [DeepSeek API](https://platform.deepseek.com) | 编码能力强，价格低 |
| Ollama | 本地私有化部署 |
| vLLM | GPU 高性能推理 |

---

## 本地私有化部署

适用于代码保密场景，数据完全不出内网。

### 使用 LiteLLM 接入本地模型

```bash
pip install litellm[proxy]

# 对接 Ollama（需先 ollama pull qwen2.5-coder:32b）
litellm --model ollama/qwen2.5-coder:32b --port 4000
```

或使用项目自带的配置文件：

```bash
litellm --config litellm-config.yaml --port 4000
```

启动后运行：

```bash
unicode --local   # 强制使用本地模型
```

---

## 命令参数

```bash
unicode                        # 自动模式（本地优先，不可用则走远程）
unicode --local                # 强制使用本地模型
unicode --remote               # 强制使用远程 API
unicode -p "问题"              # 非交互（管道）模式
unicode --model claude-3-5-sonnet-20241022   # 指定模型
unicode --dangerously-skip-permissions       # 跳过权限确认（适合自动化）
```

---

## 构建说明

项目使用 esbuild 构建，替代原版的 Bun bundle（Bun 在大型代码库上有 segfault 问题）。

```
构建工具：  esbuild（通过 Bun 调用）
输出格式：  CommonJS（dist/cli.cjs）
运行时：    Bun 1.3.11+
```

构建脚本 `build.sh` 会自动：
1. 运行 esbuild 打包
2. 应用运行时补丁（修复 void runHeadless2() 的错误吞噬问题）

---

## 与原版的主要差异

| 功能 | 原版 Claude Code | UniCode |
|------|-----------------|---------|
| API 提供商 | 仅 Anthropic 官方 | 支持第三方 + 本地 |
| 国内访问 | 需科学上网 | 直接可用 |
| 登录方式 | Anthropic 账号 | API Key |
| 品牌名称 | Claude Code | UniCode |
| TUI 图案 | 小机器人 | 猫猫 🐱 |
| extended thinking | 默认开启 | 默认关闭（避免 TUI 卡死）|

---

## 项目结构

```
.
├── src/                    # 源码（基于 Claude Code 2.1.88 还原）
│   ├── components/         # React + Ink 终端 UI 组件
│   ├── services/           # 核心业务逻辑
│   ├── tools/              # Bash、文件、搜索等工具
│   ├── stubs/              # 原生模块桩实现
│   └── native-ts/          # TS 纯实现替代原生模块
├── build-esbuild.ts        # esbuild 构建配置
├── build.sh                # 一键构建脚本
├── unicode                 # 启动脚本（含 API 配置）
├── litellm-config.yaml     # LiteLLM 本地代理配置
└── dist/
    └── cli.cjs             # 构建产物
```

---

## 免责声明

- 本项目基于 Claude Code 2.1.88 的 npm source map 还原源码，仅供学习研究。
- 原始代码版权归 Anthropic 所有。
- 本项目不代表 Anthropic 官方立场，不应用于商业用途。
- 使用第三方 API 时，请遵守各提供商的使用条款。

---

## 致谢

- [Claude Code 2.1.88](https://www.npmjs.com/package/@anthropic-ai/claude-code) — 原始工程基础
- [ponponon/claude_code_src](https://github.com/ponponon/claude_code_src) — 源码还原工作
