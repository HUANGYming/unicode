<div align="center">

# 🐱 UniCode

**离线优先的 AI 编程助手 · 支持本地模型与国内外云端 API**

[![Version](https://img.shields.io/badge/version-2.1.88-blue.svg)](https://github.com/HUANGYming/unicode)
[![License](https://img.shields.io/badge/license-research_only-red.svg)](#免责声明)

[快速开始](#快速开始) · [本地离线部署](#本地离线部署) · [云端接入](#云端-api-提供商) · [构建说明](#构建说明)

</div>

---

## 是什么

UniCode 是一款终端 AI 编程助手，支持交互式 TUI 和管道模式。

最大特点：**无需注册任何账号**，可接入任何兼容的模型——无论是跑在本机的 Ollama，还是国内的 AnyRouter、DMXAPI，抑或海外的任何服务。

```
unicode                  # 启动交互式对话
unicode -p "帮我重构这段代码"  # 管道模式，输出结果后退出
```

---

## 核心特性

| | |
|--|--|
| **🖥️ 完全离线** | 接入本地 Ollama / vLLM，代码不出内网，适合企业保密场景 |
| **🌐 国内可用** | 支持 AnyRouter、DMXAPI 等国内可直连的 API，无需科学上网 |
| **🔀 自动切换** | 本地服务在线时优先走本地，不可用时自动切换云端 |
| **⚡ 完整功能** | 文件读写、代码执行、Bash 工具、多轮对话 |
| **🔑 只需 API Key** | 无需 OAuth 登录，填入任意兼容服务的 key 即可 |

---

## 快速开始

### 环境要求

- [Bun](https://bun.sh) 1.3.11+
- Node.js 18+（运行时）

### 1. 克隆项目

```bash
git clone https://github.com/HUANGYming/unicode.git
cd unicode
npm install
```

### 2. 构建

```bash
chmod +x build.sh
./build.sh
```

生成 `dist/cli.cjs`。

### 3. 配置 API

编辑项目根目录的 `unicode` 脚本，填入你的服务地址和 key：

```bash
# ── 远程 API（云端）──────────────────────
REMOTE_BASE_URL="https://anyrouter.top"          # 服务地址
REMOTE_MODEL="claude-haiku-4-5-20251001"         # 模型名
REMOTE_API_KEY="your-api-key-here"               # 你的 key

# ── 本地模型（离线）──────────────────────
LOCAL_BASE_URL="http://localhost:4000"            # LiteLLM 地址
LOCAL_MODEL="deepseek-v3"                        # 本地模型名
LOCAL_API_KEY="dummy"                            # 本地不校验
```

### 4. 注册为全局命令

```bash
echo 'alias unicode="/path/to/unicode/unicode"' >> ~/.zshrc
source ~/.zshrc
```

### 5. 运行

```bash
unicode            # 交互式 TUI
unicode -p "你好"  # 快速提问
```

---

## 本地离线部署

适合**代码需要保密**的场景，所有数据留在内网。

### 方式一：Ollama（最简单）

```bash
# 安装 Ollama 并拉取模型
ollama pull qwen2.5-coder:32b   # 推荐代码模型

# 安装 LiteLLM（API 格式转换层）
pip install litellm[proxy]

# 启动 LiteLLM，监听 4000 端口
litellm --model ollama/qwen2.5-coder:32b --port 4000
```

或使用项目自带配置（支持多模型）：

```bash
# 编辑 litellm-config.yaml，填入你的模型
litellm --config litellm-config.yaml --port 4000
```

### 方式二：vLLM（GPU 高性能）

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-Coder-32B-Instruct \
  --port 8000

# LiteLLM 转发
litellm --model openai/Qwen2.5-Coder-32B-Instruct \
  --api_base http://localhost:8000/v1 --port 4000
```

### 启动本地模式

```bash
unicode --local   # 强制使用本地，不走云端
```

---

## 云端 API 提供商

### Anthropic Messages 格式（直接兼容，无需额外配置）

| 提供商 | Base URL | 特点 |
|--------|----------|------|
| [AnyRouter](https://anyrouter.top) | `https://anyrouter.top` | 国内直连，Claude 全系列 |
| [DMXAPI](https://www.dmxapi.com) | `https://www.dmxapi.com` | 国内直连，按量计费 |
| Anthropic 官方 | `https://api.anthropic.com` | 需要官方账号 |

### OpenAI Chat 格式（需 LiteLLM 中转，见上方配置）

| 提供商 | 推荐模型 | 特点 |
|--------|----------|------|
| [SiliconFlow](https://siliconflow.cn) | Qwen2.5-Coder-32B | 国内，有免费额度 |
| [DeepSeek](https://platform.deepseek.com) | deepseek-coder-v2 | 编码极强，价格极低 |
| [阿里云百炼](https://bailian.aliyun.com) | qwen-coder-turbo | 企业级稳定 |

---

## 命令参数

```bash
unicode                   # 自动模式：本地优先，不可用则走远程
unicode --local           # 强制使用本地模型
unicode --remote          # 强制使用远程 API
unicode -p "问题"         # 非交互模式（适合脚本/管道）
unicode --model <name>    # 指定模型名称
unicode --dangerously-skip-permissions  # 跳过权限确认（自动化场景）
```

---

## 构建说明

使用 esbuild 打包（Bun bundle 在大型代码库上有 segfault 问题）。

```
构建工具：  esbuild（通过 Bun 调用）
输出格式：  CommonJS (dist/cli.cjs)
运行时：    Bun 1.3.11+
Node.js：   18+
```

`build.sh` 做了两件事：
1. esbuild 打包整个 TypeScript 源码
2. 运行时补丁：修复错误被静默吞掉的问题

---

## 项目结构

```
.
├── src/                    # TypeScript 源码
│   ├── components/         # React + Ink 终端 UI 组件
│   ├── services/           # 核心业务逻辑（API、会话、工具调用）
│   ├── tools/              # Bash、文件读写、搜索等工具实现
│   ├── stubs/              # 原生 NAPI 模块的 TS 桩实现
│   └── utils/              # 认证、配置、环境等工具函数
├── build-esbuild.ts        # esbuild 构建配置（含 stub 插件）
├── build.sh                # 一键构建 + 运行时补丁脚本
├── unicode                 # 启动脚本（配置 API、自动切换逻辑）
├── litellm-config.yaml     # LiteLLM 多模型代理配置
└── dist/cli.cjs            # 构建产物（构建后生成）
```

---

## 免责声明

本项目包含第三方软件代码，相关版权归原始版权持有人所有。本项目不代表任何原始版权持有人的官方立场，不用于商业用途，仅供个人学习与研究。

---

## 致谢

- [ponponon/claude_code_src](https://github.com/ponponon/claude_code_src) — 源码还原工作
