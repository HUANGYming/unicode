<div align="center">

# 🐱 UniCode

**离线优先的 AI 编程助手 · 支持本地模型与国内外云端 API**

[![Version](https://img.shields.io/badge/version-2.1.88-blue.svg)](https://github.com/HUANGYming/unicode)
[![License](https://img.shields.io/badge/license-research_only-red.svg)](#免责声明)

[快速开始](#快速开始) · [核心能力](#核心能力) · [本地离线部署](#本地离线部署) · [云端接入](#云端-api-提供商) · [构建说明](#构建说明)

</div>

---

## 是什么

UniCode 是一款终端 AI 编程助手，支持交互式 TUI 和管道模式。

最大特点：**无需注册任何账号**，可接入任何兼容的模型——无论是跑在本机的 Ollama，还是国内的 AnyRouter、DMXAPI，抑或海外的任何服务。

```bash
unicode                       # 启动交互式 TUI
unicode -p "帮我重构这段代码"   # 管道模式，输出后退出
```

---

## 核心能力

### 🤖 多智能体协同

UniCode 内置子智能体调度系统，可将复杂任务拆分为多个并行子任务同时执行，大幅提升完成效率。

```
主智能体
 ├─ 子智能体 A：分析前端代码
 ├─ 子智能体 B：分析后端接口
 └─ 子智能体 C：检查测试覆盖率
```

适合：大型代码库重构、跨模块联动分析、并发执行多个独立任务。

---

### 🗜️ 上下文自动压缩

长对话不会因 Token 耗尽而中断。UniCode 支持多级上下文压缩策略：

- **自动压缩**：接近上下文窗口上限时，自动将历史对话摘要化，保留关键信息
- **微粒度压缩**：对局部历史进行细粒度精简，不丢失代码上下文
- **手动触发**：`/compact` 命令随时压缩，释放 Token 空间继续工作

---

### 🛠️ 全套工具调用（并行执行）

UniCode 拥有完整的工具体系，且支持**多工具并行调用**，减少等待时间：

| 工具 | 说明 |
|------|------|
| **Bash** | 执行终端命令，支持交互确认 |
| **FileEdit / FileWrite** | 直接读写编辑文件，展示 diff 预览 |
| **WebSearch / WebFetch** | 搜索网页、抓取页面内容 |
| **NotebookEdit** | 编辑 Jupyter Notebook 单元格 |
| **Git** | diff、commit、push、创建 PR |

---

### 🧠 项目记忆（CLAUDE.md）

在项目根目录放置 `CLAUDE.md`，UniCode 每次启动时自动读取，无需重复交代背景：

```markdown
# 项目规范
- 使用 TypeScript strict 模式
- 所有 API 调用必须加错误处理
- 提交信息遵循 Conventional Commits
```

支持多层目录的记忆文件，自动合并全局 + 项目 + 子目录规范。

---

### 🔐 细粒度权限审批

每次执行危险操作前，UniCode 会请求确认，你可以：

- **单次允许**：仅本次执行
- **本会话允许**：本次启动期间不再询问
- **永久允许**：写入配置，下次不再提示
- `--dangerously-skip-permissions`：自动化脚本场景跳过所有确认

---

### 🔀 自动切换本地/云端

```
启动时检测本地服务
  ├─ 在线 → 使用本地模型（数据不出内网）
  └─ 离线 → 自动切换云端 API
```

适合日常连公网时用云端模型，断网/内网环境自动降级到本地模型。

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

编辑项目根目录的 `unicode` 脚本：

```bash
# ── 远程 API（云端）──────────────────────
REMOTE_BASE_URL="https://anyrouter.top"
REMOTE_MODEL="claude-haiku-4-5-20251001"
REMOTE_API_KEY="your-api-key-here"

# ── 本地模型（离线）──────────────────────
LOCAL_BASE_URL="http://localhost:4000"
LOCAL_MODEL="deepseek-v3"
LOCAL_API_KEY="dummy"
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
ollama pull qwen2.5-coder:32b

pip install litellm[proxy]
litellm --model ollama/qwen2.5-coder:32b --port 4000
```

或使用项目自带多模型配置：

```bash
litellm --config litellm-config.yaml --port 4000
```

### 方式二：vLLM（GPU 高性能）

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-Coder-32B-Instruct \
  --port 8000

litellm --model openai/Qwen2.5-Coder-32B-Instruct \
  --api_base http://localhost:8000/v1 --port 4000
```

---

## 云端 API 提供商

### Anthropic Messages 格式（直接兼容）

| 提供商 | Base URL | 特点 |
|--------|----------|------|
| [AnyRouter](https://anyrouter.top) | `https://anyrouter.top` | 国内直连，Claude 全系列 |
| [DMXAPI](https://www.dmxapi.com) | `https://www.dmxapi.com` | 国内直连，按量计费 |
| Anthropic 官方 | `https://api.anthropic.com` | 需要官方账号 |

### OpenAI Chat 格式（需 LiteLLM 中转）

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
unicode --dangerously-skip-permissions  # 跳过权限确认
```

---

## 构建说明

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
├── src/
│   ├── components/         # React + Ink 终端 UI 组件
│   ├── services/           # 核心逻辑（API、会话、上下文压缩、工具执行）
│   ├── tools/              # Bash、文件、搜索、Git、子智能体等工具
│   ├── stubs/              # 原生 NAPI 模块的 TS 桩实现
│   └── utils/              # 认证、权限、配置等工具函数
├── build-esbuild.ts
├── build.sh
├── unicode                 # 启动脚本
├── litellm-config.yaml
└── dist/cli.cjs
```

---

## 免责声明

本项目包含第三方软件代码，相关版权归原始版权持有人所有。本项目不代表任何原始版权持有人的官方立场，不用于商业用途，仅供个人学习与研究。

---

## 致谢

- [ponponon/claude_code_src](https://github.com/ponponon/claude_code_src) — 源码还原工作
