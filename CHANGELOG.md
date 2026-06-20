# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
