# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [2.4.1] - 2026-06-21

### Added
- **feat(wechat)**: 放开 Windows 平台「离开不待机」开关
  - 底层 `trySetDisableSleep()` 已有 Windows 分支（PowerShell + SetThreadExecutionState），本次解锁前端 UI 调用
  - `wechat:setStayAwake` IPC handler 删除 macOS only 硬编码
  - `ensurePmsetRule()` 在 Windows 直接返回 true（无需 sudoers）
  - `will-quit` 退出时恢复休眠（含 Windows）
  - 微信面板「离开不待机」按钮在 Windows 也显示
  - macOS 行为完全不变

## [2.4.0] - 2026-06-20

### Added
- 项目识别增强：支持 15 种语言/框架（Vue、React、Angular、Next.js、Nuxt、Svelte、Django、Flask、FastAPI、Spring Boot、Laravel、.NET、Rust、Go、Ruby、Swift、Dart）
- 路径复制功能：右键菜单新增「复制绝对路径」和「复制相对路径」
- 项目信息卡片：显示当前目录的框架类型和运行命令
- 快捷运行按钮：一键运行项目（支持多 scripts 选择）
- API `/api/path-info` — 获取路径信息（绝对路径 + 相对路径）
- API `/api/project-info` — 获取项目信息（框架类型 + 运行命令）

### Changed
- `projectOf()` 函数改为异步，支持更细粒度的框架检测
- 前端右键菜单新增路径复制选项

## [2.3.1] - 2026-06-20

### Added
- `scripts/rebuild-win.js` — Windows node-pty 构建修复脚本，自动处理 winpty.gyp 的 batch 文件路径问题
- `scripts/verify-windows-build.js` — Windows 构建验证诊断工具，9 项自动化检查
- `scripts/run-app.js` — 跨平台 Electron 启动脚本，避免 `electron .` 被当成 Node 执行
- `npm run verify:build` 命令
- `npm run rebuild:legacy` 命令（保留原 electron-rebuild 直接调用）

### Changed
- `npm run app` 改用 `scripts/run-app.js` 启动
- `npm run rebuild` 改用 `scripts/rebuild-win.js`（Windows 自动 patch，其他平台透传）

### Credits
- 构建脚本移植自 [wxhBadUser/fanbox-master](https://github.com/wxhBadUser/fanbox-master) (MIT License)

## [2.3.0] - 2026-06-19

### Added
- 初始 Windows 移植版
- 基于 [alchaincyf/fanbox](https://github.com/alchaincyf/fanbox) Fork
- Windows NSIS 安装包打包
- macOS 签名配置
- Linux AppImage 支持
