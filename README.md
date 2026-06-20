<div align="center">

# 📦 FanBox for Windows（多平台版）

> **FanBox — the cockpit for coding agents. Command Claude Code or Codex, watch every file and line they change, and take over anytime.**

</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-2.3.1-blue)](https://github.com/Chelase/fanbox-win/releases/latest)
[![Platform](https://img.shields.io/badge/Windows-win64-black?logo=windows)](https://github.com/Chelase/fanbox-win/releases/latest)
[![Platform](https://img.shields.io/badge/macOS-arm64-black?logo=apple)](https://github.com/Chelase/fanbox-win/releases/latest)
[![Platform](https://img.shields.io/badge/Linux-x64-black?logo=linux)](https://github.com/Chelase/fanbox-win/releases/latest)

</div>

<br>

<div align="center">

**本地优先 · AI Coding Cockpit · Electron 桌面端 · 多平台支持**

<br>

本地文件浏览 · 内嵌终端 · Claude Code / Codex CLI · Agent 规则体系

<br>

所有 agent 调用发生在**用户本机**。

</div>

---

## 与上游关系

本项目基于 [alchaincyf/fanbox](https://github.com/alchaincyf/fanbox)（原作者花叔 Huashu）修改而来。

**我们的重点**：

- **多平台打包**：Windows NSIS 安装包 + macOS 签名 + Linux AppImage
- **Windows 构建修复**：移植自 [wxhBadUser/fanbox-master](https://github.com/wxhBadUser/fanbox-master) 的 node-pty 构建脚本
- **Agent 规则体系**：`.agent-rules/` 四层架构，规范 AI Agent 协作流程

> **macOS 用户也可使用本仓库**，已配置签名和 entitlements。原项目仅支持 macOS arm64 DMG。

---

## Why FanBox · 为什么要做 FanBox

AI 帮你一个下午起十个项目，但它们散在各处、名字认不出、改了啥看不见。每天的真实流程是：文件管理器里翻半天 → 切到终端起 agent → 再切浏览器看效果，三个窗口来回跳。

FanBox 把这条链路收进一个窗口：**左边文件 × 右边/下边终端 × 原地预览**，一个有机整体。它不跟文件管理器拼文件操作，不跟 VS Code 拼编辑，专注「找回 + 预览 + 轻改 + 指挥 agent」这一条链路做到顺手。

**不做云、不做远程、不做账号。本地、零配置、运行时零依赖。**

---

## 已验证能力

### Windows

- ✅ Windows NSIS 安装包（可选安装目录、桌面快捷方式、开始菜单）
- ✅ node-pty Windows 构建和打包可用
- ✅ 内嵌终端可用（xterm.js + WebGL）
- ✅ Claude Code CLI 可识别和调用
- ✅ bridge → driver → Claude 链路通过
- ✅ 打包版 exe 通过

### macOS

- ✅ macOS DMG 打包（arm64）
- ✅ 代码签名配置（hardenedRuntime + entitlements）
- ✅ Claude Code CLI 链路验证

### Linux

- ✅ Linux AppImage 打包

### 通用

- ✅ Agent 规则链路（`.agent-rules/` 四层架构）
- ✅ Codex 未安装时优雅降级

---

## 使用前提

> ⚠️ **重要说明**

- **FanBox 不内置 Claude**。使用 Claude 功能需要用户本机自行安装并登录 [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/overview)。
- 使用 Codex 功能需要用户本机自行安装 [Codex CLI](https://github.com/openai/codex)。
- **FanBox 不上传、不托管、不分发用户 Claude/Codex 凭据**。所有数据存储在用户本机。

---

## 下载 & 安装

### 桌面版（推荐）

从 [GitHub Releases](https://github.com/Chelase/fanbox-win/releases/latest) 下载对应平台的安装包：

| 平台 | 文件 | 说明 |
|---|---|---|
| Windows | `FanBox Setup 2.3.1.exe` | NSIS 安装包，可选安装目录 |
| macOS | `FanBox-2.3.1-arm64.dmg` | 需在「系统设置 → 隐私与安全性」中允许运行 |
| Linux | `FanBox-2.3.1.AppImage` | `chmod +x` 后直接运行 |

> ⚠️ 当前构建**未签名**。Windows 首次运行可能出现 SmartScreen 提示，点击「更多信息」→「仍要运行」。

### 源码运行

```bash
npm install
npm run rebuild       # 构建 node-pty 原生模块（Windows 自动修复 winpty.gyp）
npm run verify:build  # 验证构建状态
npm run app           # 启动 FanBox
```

### 打包

```bash
npm run dist:win      # Windows NSIS 安装包
npm run dist          # macOS DMG
npm run dist:linux    # Linux AppImage
```

---

## 构建环境

### Windows

- Windows 10 或 Windows 11
- [Node.js](https://nodejs.org/) 22 LTS 或更新版本
- [Python 3.11+](https://www.python.org/downloads/)
- [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
  - 工作负载：**Desktop development with C++**
  - 组件：MSVC v143、Windows 10/11 SDK

> `npm run rebuild` 会调用 `scripts/rebuild-win.js`，自动处理 node-pty 的 winpty.gyp 路径问题。

### macOS

- macOS 12+
- Xcode Command Line Tools（`xcode-select --install`）
- Node.js 22+

### Linux

- Ubuntu 20.04+ 或其他主流发行版
- Node.js 22+
- 基本构建工具（`build-essential`）

---

## 三套皮肤

界面在 [huashu-design](https://github.com/wxhBadUser/huashu-design) 辅助下完成设计。三套皮肤不是换个主题色——配色、字体、图标、代码高亮、终端 ANSI 主题整体随之变化。

| | |
|---|---|
| **终端 · Volt** | 荧光绿 × 炭黑 × 等宽字，工业仪器面板感（默认） |
| **档案 · Archive** | 奶油纸 × 赤陶橙 × 衬线，温暖纸感档案馆 |
| **索引 · Index** | 黑白 × 信号红/绿 × 巨号字，编辑式索引日报 |

---

## 快捷键

| 操作 | 键 |
|---|---|
| 全局搜索 | `Ctrl+K` |
| 用编辑器打开 | `Ctrl+Enter` |
| 折叠侧栏 | `Ctrl+B` |
| 后退 | `Ctrl+[` |
| 当前目录筛选 | `/` |
| 打开/预览 | `Enter` |
| 结果上下选择 | `↑` `↓` |
| 关闭 | `Esc` |

> Windows/Linux 使用 `Ctrl`，macOS 使用 `⌘`。

---

## 数据与隐私

- **本地优先**：所有数据存储在本机，不上传云端。
- **不上传 Claude/Codex 凭据**：凭据仅在用户本机用于 API 调用。
- **不内置任何账号**：FanBox 不要求注册或登录。
- **agent 调用发生在用户本机**：所有 Claude/Codex 进程在用户本机运行。
- **不要提交** `account.json`、`config.json`、logs、`dist/`、`node_modules/` 到版本控制。

---

## Agent 规则体系

本项目使用 `.agent-rules/` 目录管理 Agent 协作规范：

```
.agent-rules/
├─ README.md        # 规则总纲 + 读取链路
├─ rules/           # 项目执行规则（Git 规范、提交规范）
├─ mechanisms/      # 系统机制文档（七段强制结构）
├─ dev-plans/       # 开发计划
├─ handoffs/        # 会话交接摘要
└─ docs/            # 参考资料
```

Agent 开工前必须先读 `.agent-rules/README.md`，按链路定位规则再执行。详见 [CLAUDE.md](CLAUDE.md) 和 [AGENTS.md](AGENTS.md)。

---

## 常见问题

### node-pty rebuild 失败

确保已安装 Visual Studio Build Tools 2022，然后运行：

```bash
npm run rebuild
```

如果仍然失败，检查 Python 3.11+ 和 MSVC v143 是否安装。

### Claude 找不到

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

### Codex 未安装

FanBox 会在 Codex 未安装时优雅降级，不报错。

### Windows SmartScreen 提示

当前构建未签名。点击「更多信息」→「仍要运行」。

### macOS 提示"已损坏"

在「系统设置 → 隐私与安全性」中点击「仍要打开」，或执行：

```bash
xattr -cr /Applications/FanBox.app
```

---

## 当前限制

- **Codex 完整链路尚未验证**：当前主要验证了 Claude 链路。
- **Windows 搜索/缩略图/防休眠仍在完善**。
- **安装包未签名**：当前构建为未签名版本。
- **Windows 版目前是 MVP**：功能稳定但还有完善空间。

---

## Roadmap

- [x] Windows 路径治理
- [x] Windows node-pty 构建修复
- [x] Windows NSIS 安装包打包
- [x] macOS 签名配置
- [x] Linux AppImage 打包
- [x] Claude Code CLI Windows 链路验证
- [x] Agent 规则链路初始化
- [ ] Codex Windows 链路验证
- [ ] Windows 搜索适配
- [ ] Windows 缩略图适配
- [ ] Windows 防休眠
- [ ] 安装包签名
- [ ] 自动更新

---

## Architecture · 技术架构

| 层 | 技术 |
|---|---|
| 后端 | 零依赖 Node.js `server.js`（文件 API + 静态服务） |
| 桌面壳 | Electron 33 + node-pty（asarUnpack 原生模块） |
| 终端 | xterm.js + WebGL + unicode11 |
| 编辑器 | Monaco（代码）+ Milkdown Crepe（Markdown） |
| 打包 | electron-builder → NSIS / DMG / AppImage |

```
fanbox-win/
├── server.js               # 零依赖 Node 后端
├── electron/
│   ├── main.js             # 主进程（窗口/pty/剪贴板/菜单）
│   ├── preload.js          # 暴露 fanboxPty / fanboxFs / fanboxClipboard
│   └── wechat/             # 微信 ClawBot
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js              # 前端单页应用
│   └── vendor/             # xterm / monaco / milkdown 本地资源
├── scripts/
│   ├── rebuild-win.js      # Windows node-pty 构建修复
│   ├── verify-windows-build.js
│   └── run-app.js          # 跨平台启动脚本
├── .agent-rules/           # Agent 规则体系
├── build/                  # 图标 + entitlements
└── CHANGELOG.md            # 版本变更记录
```

---

## Standing on the shoulders of giants · 建在巨人肩膀上

| 项目 | 用在哪 | License |
|---|---|---|
| [Electron](https://www.electronjs.org/) | 桌面壳 | MIT |
| [node-pty](https://github.com/microsoft/node-pty) | 伪终端 | MIT |
| [xterm.js](https://xtermjs.org/) | 终端渲染 | MIT |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 代码编辑与 Git diff | MIT |
| [Milkdown](https://milkdown.dev/) (Crepe) | Markdown 所见即所得编辑 | MIT |
| [marked](https://marked.js.org/) | Markdown 预览渲染 | MIT |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮 | BSD-3-Clause |
| [esbuild](https://esbuild.github.io/) | 前端 vendor 打包 | MIT |
| [electron-builder](https://www.electron.build/) | 多平台打包 | MIT |

---

## Credits · 致谢

- **上游项目**：[alchaincyf/fanbox](https://github.com/alchaincyf/fanbox) — 感谢原作者花叔（Huashu）提供的 FanBox 设计与实现
- **构建脚本**：[wxhBadUser/fanbox-master](https://github.com/wxhBadUser/fanbox-master) — Windows node-pty 构建修复脚本（MIT License）
- **界面设计**：[huashu-design](https://github.com/wxhBadUser/huashu-design)

---

## About Me · 关于作者

FanBox for Windows 多平台版的维护者。在原项目基础上增加了多平台打包支持和 Agent 规则体系。

如果这个项目对你有帮助，**点个 Star ⭐** 就是最大的鼓励。欢迎提 Issue 和 PR！

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
