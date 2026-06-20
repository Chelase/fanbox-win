#!/usr/bin/env node
/**
 * run-app.js — 跨平台启动 Electron 应用
 *
 * Based on https://github.com/wxhBadUser/fanbox-master (MIT License)
 * Original author: wxhBadUser
 *
 * 解决 `electron .` 在某些环境下被当成 Node 执行的问题。
 * 自动找到 electron 二进制并启动。
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

function findElectron() {
  // 1. 尝试 node_modules/.bin/electron
  for (const name of ['electron.cmd', 'electron']) {
    const fp = path.join(ROOT, 'node_modules', '.bin', name);
    if (fs.existsSync(fp)) return fp;
  }
  // 2. 尝试 require('electron')
  try {
    return require('electron');
  } catch {}
  return null;
}

function main() {
  const electronPath = findElectron();
  if (!electronPath) {
    console.error('找不到 Electron，请先运行 npm install');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const cmd = `"${electronPath}" . ${args.join(' ')}`;

  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: process.env });
  } catch (err) {
    process.exit(err.status || 1);
  }
}

main();
