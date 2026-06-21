# macOS 特性 Windows 适配开发计划

## TL;DR

> **Quick Summary**: 将 FanBox 中 5 个仅 macOS 可用的核心功能（微信远程禁休眠、磁盘占用、缩略图、HEIC 预览、Spotlight 搜索）改造为 Windows 兼容实现。
>
> **Deliverables**:
> - 微信 ClawBot 「离开不待机」开关在 Windows 可用
> - 「磁盘占用透视」功能在 Windows 可用
> - 文件缩略图（JPG/PNG/WebP/AVIF/TIFF）在 Windows 可生成
> - 视频/PDF 缩略图在 Windows 可生成（依赖 ffmpeg-static）
> - HEIC 图片预览在 Windows 可用（依赖 sharp + libheif）
> - 内容搜索在 Windows 可用（依赖 @vscode/ripgrep）
>
> **Estimated Effort**: Large（含 npm 依赖安装、原生模块编译、4 个 GitHub Actions 平台矩阵测试）
> **Parallel Execution**: NO — 严格按实现难度递进（每阶段验证通过再做下一阶段）
> **Critical Path**: 阶段 1 (微信休眠) → 阶段 2 (磁盘占用) → 阶段 3 (缩略图) → 阶段 4 (HEIC) → 阶段 5 (Spotlight)

---

## Context

### Original Request

用户要求按实现难度调研并生成计划，依次修改 5 个 macOS 专用功能，使 FanBox 在 Windows 上提供对等体验。

### 调研摘要

5 个功能分别由以下机制支持：

| 功能 | macOS 机制 | Windows 缺失影响 | 用户日常使用频率 |
|---|---|---|---|
| 微信远程禁休眠 | `pmset disablesleep` + sudoers 免密 | 离开电脑无法用微信遥控 | 高（核心差异化） |
| 磁盘占用 | `du -sk` | 右键「占用透视」无响应 | 中（清理时用） |
| 缩略图 | `sips` / `qlmanage` | 文件浏览器全是默认图标 | **极高（核心体验）** |
| HEIC 预览 | `sips -s format jpeg` | iPhone 截图直接裂图 | 低（Win 用户少） |
| Spotlight 搜索 | `mdfind` | 内容搜索走纯 Node.js 兜底（慢） | 中 |

### 关键约束

- **零新原生模块依赖原则**（除 sharp / ffmpeg-static / @vscode/ripgrep 三个明确必要）
- **保持零 npm dep 兼容路径**（PowerShell 兜底）
- **不能引入 UAC 弹窗**（用户体验破坏）
- **跨平台 CI 测试**：4 个平台（win-x64 / win-arm64 / macOS-arm64 / linux-x64）都要通过
- **CHANGELOG.md 必更新**（v2.4.1 记录此批改动）

### 已查阅的项目规则

- `.agent-rules/README.md` 规则链
- `.agent-rules/rules/git-operations.md` 提交规范（中文 + Conventional Commits）
- `.agent-rules/rules/complex-feature-mechanism.md` 强制要求：跨模块功能须生成机制文档
- `.agent-rules/mechanisms/README.md` 七段强制结构
- `.agent-rules/dev-plans/README.md` 开发计划文档结构

### 配套机制文档

> 本计划触发 `complex-feature-mechanism.md` 规则（跨模块改动 server.js / main.js / app.js / package.json / CI）
> 实施时**必须**同步生成 `.agent-rules/mechanisms/platform-adaptation.md`，按七段结构记录跨平台分支策略
> （实施阶段由执行 Agent 写入，Prometheus 不可写 `.agent-rules/`）

---

## Implementation Strategy: 按实现难度递进

| 阶段 | 功能 | 实现难度 | 新依赖 | 预计工作量 | 风险等级 |
|---|---|---|---|---|---|
| **1** | 微信 setStayAwake 放开 Windows | 🟢 极低 | 无 | 0.5 天 | 🟢 低 |
| **2** | 磁盘占用 du → PowerShell | 🟢 低 | 无 | 0.5 天 | 🟢 低 |
| **3** | 缩略图 sips/qlmanage → sharp + ffmpeg-static | 🟡 中 | sharp + ffmpeg-static | 2 天 | 🟡 中 |
| **4** | HEIC 预览 → sharp + libheif | 🟡 中（依赖 3） | libheif | 1 天 | 🟡 中 |
| **5** | Spotlight 搜索 → @vscode/ripgrep | 🔴 高 | @vscode/ripgrep | 2 天 | 🟡 中 |

**为什么这个顺序？**
- **阶段 1-2 是「解锁式」改动**：原有 macOS 代码保留，加 Windows 分支。不引入新依赖、不破坏现有功能。
- **阶段 3-4 是「替换式」改动**：引入新 npm 依赖（sharp 约 25-40MB、ffmpeg-static 约 70MB），需重新打包、CI 矩阵测试。
- **阶段 5 是「增强式」改动**：原 grep 兜底保留，新增 ripgrep 作为快速路径。

每个阶段独立可发版（CHANGELOG 分版本号），失败可回滚不污染其他阶段。

---

## 阶段 1: 微信 setStayAwake 放开 Windows 🟢

### 1.1 改动范围

| 文件 | 行号 | 改动内容 |
|---|---|---|
| `electron/main.js` | 374 | `ensurePmsetRule()`:  `if (process.platform !== 'darwin') return false;` → `return true;` |
| `electron/main.js` | 417-425 | `setLidIntent()`:  `installSudoers` 调用包到 `if (process.platform === 'darwin')` 内 |
| `electron/main.js` | 870 | 删除 `if (process.platform !== 'darwin') return { ok: false, error: 'macOS only' };` |
| `electron/main.js` | 494 | `app.on('will-quit', ...)`:  添加 `\|\| process.platform === 'win32'` 条件 |
| `public/app.js` | 2335-2336 | `!mac` → `!(mac \|\| this.platform === 'win32')` 显示 Windows 按钮 |

### 1.2 关键代码段

```javascript
// main.js:870 - 删除硬编码
ipcMain.handle('wechat:setStayAwake', async (e, { on } = {}) => {
  ensureWechat();
  // 删除这一行：if (process.platform !== 'darwin') return { ok: false, error: 'macOS only' };
  if (on) {
    // ... 保留 dialog 和 ensurePmsetRule（已改为 Windows 返回 true）
    const ruleOk = await ensurePmsetRule();
    if (!ruleOk) return { ok: false, error: 'setup-cancelled', on: wechatStayAwake };
  }
  // ... 其余保持不变
});
```

### 1.3 验收清单

- [ ] Windows 启动 FanBox → 微信面板 → 勾选「离开不待机」→ 成功开启
- [ ] 关闭微信连接 → 自动恢复休眠
- [ ] 退出 FanBox → 系统恢复正常休眠（`will-quit` 验证）
- [ ] macOS 路径不受影响（已用 `git` 验证）
- [ ] CHANGELOG.md 增加 `feat(wechat): 放开 Windows 平台「离开不待机」开关`

### 1.4 不在阶段 1 做的事

- 不改动底层 `trySetDisableSleep`（已有 Windows 分支）
- 不改菜单项「合盖继续运行」（保持 macOS only，笔记本场景差异大）
- 不改 dialog 文案（中文/英文双版本已通用）

---

## 阶段 2: 磁盘占用 du → PowerShell 🟢

### 2.1 改动范围

| 文件 | 行号 | 改动内容 |
|---|---|---|
| `server.js` | 957-981 | `diskUsage()` 函数：Windows 分支用 PowerShell；macOS/Linux 保持 `du -sk` |
| `public/i18n-dict.js` | — | 无需改（错误信息通用） |

### 2.2 关键代码段

```javascript
// server.js - 新增跨平台分支
async function getDirSizesWindows(dirs) {
  // 包装 PowerShell 调用：单目录返回字节数
  const results = await Promise.all(dirs.map(async (dir) => {
    const ps = `(Get-ChildItem -Path '${dir.replace(/'/g, "''")}' -Force -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum`;
    return new Promise((resolve) => {
      execFile('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps],
        { timeout: 120000, maxBuffer: 8 * 1024 * 1024 },
        (err, stdout) => {
          const bytes = parseInt((stdout || '0').trim(), 10);
          resolve({ path: dir, size: isNaN(bytes) ? 0 : bytes });
        });
    });
  }));
  return results;
}

async function diskUsage(p) {
  const dir = resolvePath(p);
  let names;
  try { names = await fsp.readdir(dir, { withFileTypes: true }); } catch (e) { return { ok: false, error: '读取失败：' + e.message }; }
  const dirs = [], items = [];
  await Promise.all(names.map(async (d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory() && !d.isSymbolicLink()) { dirs.push(full); return; }
    try { const st = await fsp.lstat(full); if (st.isFile()) items.push({ name: d.name, size: st.size, isDir: false }); } catch { /* */ }
  }));
  if (dirs.length) {
    if (process.platform === 'win32') {
      // Windows: PowerShell 批量查询
      const psResults = await getDirSizesWindows(dirs);
      for (const r of psResults) {
        items.push({ name: path.basename(r.path), size: r.size, isDir: true });
      }
    } else {
      // macOS/Linux: 保持 du -sk
      const out = await new Promise((resolve) => {
        execFile('du', ['-sk', ...dirs], { timeout: 120000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => resolve(stdout || ''));
      });
      for (const line of out.split('\n')) {
        const m = line.match(/^(\d+)\s+(.+)$/);
        if (m) items.push({ name: path.basename(m[2]), size: Number(m[1]) * 1024, isDir: true });
      }
    }
  }
  items.sort((a, b) => b.size - a.size);
  const total = items.reduce((a, b) => a + b.size, 0);
  return { ok: true, dir, total, items: items.slice(0, 60), more: Math.max(0, items.length - 60) };
}
```

### 2.3 验收清单

- [ ] Windows 上右键任意目录 → 「磁盘占用透视」→ 弹出排序榜
- [ ] 数字合理（`node_modules` 应该最大）
- [ ] 不可访问子目录不阻塞（`-ErrorAction SilentlyContinue` 验证）
- [ ] macOS/Linux 行为不变（用 `du -sk`）
- [ ] 性能可接受（PowerShell 单目录 < 2s，批量 10 个目录 < 8s）
- [ ] CHANGELOG.md 增加 `feat(server): 磁盘占用支持 Windows（PowerShell Get-ChildItem）`

### 2.4 不在阶段 2 做的事

- 不引入 `get-folder-size` 或 `fast-folder-size` npm 包（保持零新依赖）
- 不做目录树下钻（已有 UI 行为不变）
- 不优化 PowerShell 性能（用户感知不明显的优化延后）

---

## 阶段 3: 缩略图 sips/qlmanage → sharp + ffmpeg-static 🟡

### 3.1 改动范围

| 文件 | 行号 | 改动内容 |
|---|---|---|
| `package.json` | — | 新增依赖：`sharp@^0.35.0`、`ffmpeg-static@^5.2.0` |
| `server.js` | 1346-1362 | `generateThumb()`：Windows 用 sharp + ffmpeg-static；macOS 保持 sips/qlmanage |
| `server.js` | 1399-1401 | `serveThumb()` 错误处理：Windows 失败时返回 415 + SVG 占位 |
| `scripts/rebuild-win.js` | — | 验证 sharp / ffmpeg-static 在 Windows rebuild 时正常处理 |
| `.github/workflows/release.yml` | — | macOS run 不变，Windows run 加 `npm rebuild sharp` 步骤 |
| `.github/workflows/build-test.yml` | — | 全平台矩阵测试缩略图 API |

### 3.2 关键代码段

```javascript
// server.js:1346 - 跨平台缩略图生成
let sharpModule = null;
let ffmpegPath = null;
function ensureImageLibs() {
  if (process.platform === 'darwin') return; // macOS 用 sips/qlmanage，不需要
  if (!sharpModule) {
    try { sharpModule = require('sharp'); } catch (e) { console.log('[thumb] sharp not available:', e.message); }
  }
  if (!ffmpegPath) {
    try { ffmpegPath = require('ffmpeg-static'); } catch (e) { console.log('[thumb] ffmpeg-static not available:', e.message); }
  }
}

async function generateThumb(src, e, size, cacheFile, isImg) {
  await fsp.mkdir(THUMB_DIR, { recursive: true });
  
  if (process.platform === 'darwin') {
    // 保留原 macOS 逻辑
    if (isImg) {
      const fmt = cacheFile.endsWith('.png') ? 'png' : 'jpeg';
      await run('sips', ['-s', 'format', fmt, '-Z', String(size), src, '--out', cacheFile]);
      return;
    }
    const tmpDir = path.join(THUMB_DIR, '_ql_' + process.pid + '_' + crypto.randomBytes(4).toString('hex'));
    await fsp.mkdir(tmpDir, { recursive: true });
    try {
      await run('qlmanage', ['-t', '-s', String(size), '-o', tmpDir, src]);
      const png = (await fsp.readdir(tmpDir)).find((f) => f.endsWith('.png'));
      if (!png) throw new Error('no thumb');
      await fsp.rename(path.join(tmpDir, png), cacheFile);
    } finally { fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
    return;
  }
  
  // Windows / Linux 分支
  ensureImageLibs();
  if (isImg) {
    if (!sharpModule) throw new Error('sharp not available');
    const fmt = cacheFile.endsWith('.png') ? 'png' : 'jpeg';
    await sharpModule(src).resize(size, size, { fit: 'inside', withoutEnlargement: true }).toFormat(fmt).toFile(cacheFile);
    return;
  }
  // 视频/PDF：用 ffmpeg 抽帧
  if (!ffmpegPath) throw new Error('ffmpeg-static not available');
  await run(ffmpegPath, [
    '-ss', '00:00:01', '-i', src, '-vframes', '1',
    '-vf', `scale=${size}:-1`, '-q:v', '3', '-y', cacheFile
  ]);
}
```

### 3.3 package.json 依赖添加

```json
{
  "dependencies": {
    "sharp": "^0.35.0",
    "ffmpeg-static": "^5.2.0"
  }
}
```

### 3.4 验收清单

- [ ] Windows 安装：`npm install` → sharp / ffmpeg-static 正常装好
- [ ] Windows 本地打包：`npm run dist:win` → 安装包可运行
- [ ] 文件列表显示 JPG/PNG/WebP 缩略图（验证 `D:\Apps\Test\photo.jpg`）
- [ ] 视频文件显示首帧缩略图（验证 `D:\Apps\Test\demo.mp4`）
- [ ] PDF 文件显示首页缩略图（验证 `D:\Apps\Test\doc.pdf`）
- [ ] macOS 缩略图行为不变（用 sips/qlmanage）
- [ ] Linux 缩略图正常（sharp + ffmpeg-static 都跨平台）
- [ ] GitHub Actions 4 平台全通过
- [ ] CHANGELOG.md 增加 `feat(server): 缩略图支持 Windows（sharp + ffmpeg-static）`

### 3.5 不在阶段 3 做的事

- 不做 HEIC 支持（阶段 4）
- 不做智能视频帧选择（永远从 1 秒抽帧）
- 不做 PDF 多页缩略图（只首页）
- 不优化 sharp 性能（libvips 已接近原生）

### 3.6 风险与缓解

| 风险 | 缓解措施 |
|---|---|
| sharp 在 Windows ARM64 编译失败 | CI 验证；如失败暂时禁 ARM64 平台 |
| ffmpeg-static 70MB 包体积过大 | 考虑后续阶段拆分为可选依赖；先不处理 |
| sharp 预编译包在不同 Windows 版本兼容 | 用 sharp 官方推荐 Node 22 LTS + Windows-2022 runner |
| ffmpeg-static 被杀毒软件误报 | 文档说明：需将 FanBox 加入白名单 |

---

## 阶段 4: HEIC 预览 → sharp + libheif 🟡

### 4.1 改动范围

| 文件 | 行号 | 改动内容 |
|---|---|---|
| `package.json` | — | 新增依赖：`libheif-node-dy@^1.0.0`（动态链接 libheif） |
| `server.js` | 1406-1425 | `serveHeicAsJpeg()`：Windows/Linux 用 libheif + sharp；macOS 保持 sips |
| `server.js` | 1433 | `serveRaw()` 中 HEIC 分支：错误处理返回 415 + SVG fallback |

### 4.2 关键代码段

```javascript
// server.js:1406 - 跨平台 HEIC 转码
let libheifModule = null;
function ensureHeifLib() {
  if (process.platform === 'darwin') return; // macOS 用 sips
  if (!libheifModule) {
    try { libheifModule = require('libheif-node-dy'); } catch (e) { console.log('[heic] libheif not available:', e.message); }
  }
}

async function serveHeicAsJpeg(req, res, file, st) {
  const key = crypto.createHash('md5').update(file + ':' + st.mtimeMs).digest('hex');
  const cacheFile = path.join(THUMB_DIR, key + '.heic.jpg');
  const send = () => {
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=604800' });
    const rs = fs.createReadStream(cacheFile);
    rs.on('error', () => { try { res.destroy(); } catch { /* */ } });
    rs.pipe(res);
  };
  if (fs.existsSync(cacheFile)) return send();
  let pr = thumbInflight.get(cacheFile);
  if (!pr) {
    pr = (async () => {
      await fsp.mkdir(THUMB_DIR, { recursive: true });
      if (process.platform === 'darwin') {
        // macOS: 保持 sips
        await run('sips', ['-s', 'format', 'jpeg', file, '--out', cacheFile]);
      } else {
        // Windows/Linux: libheif + sharp
        ensureHeifLib(); ensureImageLibs();
        if (!libheifModule || !sharpModule) throw new Error('heic libs not available');
        const { decode, getInfo } = libheifModule;
        const data = fs.readFileSync(file);
        const decoded = decode(data);
        const info = getInfo(data);
        await sharpModule(decoded, { raw: { width: info.width, height: info.height, channels: 4 } })
          .jpeg({ quality: 85 })
          .toFile(cacheFile);
      }
    })()
      .finally(() => thumbInflight.delete(cacheFile));
    thumbInflight.set(cacheFile, pr);
  }
  try { await pr; pruneThumbs(); send(); }
  catch { res.writeHead(415); res.end('heic transcode failed'); }
}
```

### 4.3 package.json 依赖添加

```json
{
  "dependencies": {
    "libheif-node-dy": "^1.0.0"
  }
}
```

### 4.4 验收清单

- [ ] Windows 安装：`npm install libheif-node-dy` → 动态库 libheif 正常下载
- [ ] iPhone 截屏（HEIC）在文件列表显示预览
- [ ] Markdown 里 `![](photo.heic)` 显示正常
- [ ] macOS HEIC 行为不变（用 sips）
- [ ] GitHub Actions 4 平台全通过
- [ ] CHANGELOG.md 增加 `feat(server): HEIC 预览支持 Windows/Linux（libheif + sharp）`

### 4.5 不在阶段 4 做的事

- 不做 HEIC 全尺寸原图查看（仅缩略图级别）
- 不支持 HEIC 序列/动画
- 不做 Windows HEIF 扩展检测（依赖 libheif 自带解码器）

### 4.6 风险与缓解

| 风险 | 缓解措施 |
|---|---|
| libheif-node-dy 在 Windows 下载 libheif DLL 失败 | CI 验证；提供手动下载指引 |
| HEIC 解码速度慢 | 用 LRU 缓存（同 sips 实现） |
| libheif 许可证争议 | libheif 是 LGPL/3-clause BSD，可商用 |

---

## 阶段 5: Spotlight 搜索 → @vscode/ripgrep 🔴

### 5.1 改动范围

| 文件 | 行号 | 改动内容 |
|---|---|---|
| `package.json` | — | 新增依赖：`@vscode/ripgrep@^1.15.0` |
| `server.js` | 501-548 | `contentSearch()`：新增 ripgrep 引擎（mdfind → ripgrep → grepFiles 三级回退） |
| `server.js` | — | 新增 `rgSearch()` 函数：包装 @vscode/ripgrep 二进制调用 |
| `public/app.js` | — | 前端无需改（API 兼容） |

### 5.2 关键代码段

```javascript
// server.js - 新增 ripgrep 引擎
let rgPath = null;
function ensureRipgrep() {
  if (!rgPath) {
    try { rgPath = require('@vscode/ripgrep').rgPath; } catch (e) { console.log('[search] ripgrep not available:', e.message); }
  }
  return rgPath;
}

async function rgSearch(query, rootPath) {
  const rg = ensureRipgrep();
  if (!rg) return null;
  return new Promise((resolve) => {
    const args = [
      '--files-with-matches', '--hidden', '-i',
      '--max-count', '1',
      '-g', '!node_modules', '-g', '!.git', '-g', '!dist',
      '-g', '!Library/Caches', '-g', '!target', '-g', '!build',
      '--', query.replace(/[\\"*]/g, ''), rootPath
    ];
    execFile(rg, args, { timeout: 6000, maxBuffer: 8 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return resolve(null);
        resolve(String(stdout).split('\n').filter(Boolean));
      });
  });
}

async function contentSearch(query, rootPath) {
  const root = resolvePath(rootPath);
  const q = (query || '').trim();
  if (!q || q.length < 2) return { results: [] };
  const esc = q.replace(/[\\"*]/g, '');
  
  // 1. macOS: mdfind（保留原逻辑）
  // 2. Windows/Linux: ripgrep
  // 3. 兜底: grepFiles（已有）
  let paths = null;
  if (process.platform === 'darwin') {
    paths = await mdfind(['-onlyin', root, `(kMDItemTextContent == "*${esc}*"cd) || (kMDItemDisplayName == "*${esc}*"cd)`]);
  } else {
    paths = await rgSearch(esc, root);
  }
  
  if (paths === null || !paths.length) {
    const fb = await grepFiles(query, rootPath);
    return { ...fb, engine: process.platform === 'darwin' ? 'grep' : 'ripgrep-fallback' };
  }
  
  const results = [];
  const deadline = Date.now() + 2500;
  for (const p of paths) {
    if (results.length >= 60 || Date.now() > deadline) break;
    if (/\/(node_modules|\.git|Library\/Caches|dist|build|target)/.test(p)) continue;
    let st; try { st = await fsp.stat(p); } catch { continue; }
    if (st.isDirectory()) continue;
    const name = path.basename(p);
    results.push({ name, path: p, isDir: false, kind: kindOf(name, false), hidden: name.startsWith('.'), size: st.size, mtime: st.mtimeMs, btime: st.birthtimeMs || 0 });
  }
  results.sort((a, b) => b.mtime - a.mtime);
  // 行级预览（保留原逻辑）
  const lower = q.toLowerCase();
  let read = 0;
  for (const r of results) {
    if (read >= 12) break;
    if (r.kind !== 'text' || r.size > 512 * 1024) continue;
    read++;
    let content; try { content = await fsp.readFile(r.path, 'utf8'); } catch { continue; }
    const lines = content.split('\n');
    const hits = [];
    for (let i = 0; i < lines.length && hits.length < 3; i++) {
      if (lines[i].toLowerCase().includes(lower)) hits.push({ line: i + 1, text: lines[i].trim().slice(0, 200) });
    }
    if (hits.length) r.hits = hits;
  }
  return { results, truncated: paths.length > results.length, engine: process.platform === 'darwin' ? 'spotlight' : 'ripgrep' };
}
```

### 5.3 package.json 依赖添加

```json
{
  "dependencies": {
    "@vscode/ripgrep": "^1.15.0"
  }
}
```

### 5.4 验收清单

- [ ] Windows 安装：`npm install @vscode/ripgrep` → rg.exe 正常下载到 node_modules
- [ ] 搜索文件名：`contentSearch('config', 'D:\\TestProj')` → 毫秒级返回
- [ ] 搜索文件内容：`contentSearch('login', 'D:\\TestProj')` → 含行号预览
- [ ] macOS 行为不变（仍用 mdfind）
- [ ] GitHub Actions 4 平台全通过
- [ ] 搜索响应时间：1k 文件 < 200ms（vs 纯 Node.js 5s）
- [ ] CHANGELOG.md 增加 `feat(server): 内容搜索支持 Windows/Linux（@vscode/ripgrep）`

### 5.5 不在阶段 5 做的事

- 不做 Everything SDK 集成（filename-only，不是 mdfind 等价物）
- 不做 SQLite 索引（一次性投入太大）
- 不做 PDF/docx OCR 内容搜索（mdfind 也只在 macOS 上有）

### 5.6 风险与缓解

| 风险 | 缓解措施 |
|---|---|
| @vscode/ripgrep 在 Windows ARM64 没有预编译 | 文档说明：先尝试自动 build，否则回退到 grepFiles |
| rg.exe 被杀毒软件拦截 | 文档说明：加入白名单 |
| ripgrep 8MB 包体积 | 接受（vs 5s → 200ms 体验飞跃） |
| 行为差异（rg 不支持 -onlyin 之类 mdfind 标志） | 测试覆盖主要查询模式 |

---

## Verification Strategy (通用)

> **零人工干预验证**：所有验收通过命令行或 Playwright 完成。

### Test Strategy

- **本计划不强制 TDD**（现有代码无测试框架），但每个阶段必须含手动冒烟脚本
- **GitHub Actions 4 平台矩阵**：每个 PR 触发 `windows-2022` / `macos-latest` / `ubuntu-latest` × x64/arm64
- **证据保存**：截图 / 终端输出存到 `.sisyphus/evidence/stage-N/`

### Per-Stage QA Scenarios

每个阶段必须有：

```
Scenario 1 (功能): 正常路径
  Tool: Bash (curl) / Playwright
  Steps:
    1. 启动 FanBox
    2. 触发功能入口
    3. 验证返回/显示
  Expected: 功能正常，结果合理
  Evidence: .sisyphus/evidence/stage-N/happy.png / output.json

Scenario 2 (降级): 错误/边界路径
  Tool: Bash (curl)
  Steps:
    1. 故意触发错误（如无权限目录、不存在的文件）
    2. 验证错误处理
  Expected: 不崩溃，返回 415/4xx
  Evidence: .sisyphus/evidence/stage-N/error.log
```

---

## Execution Strategy

### 阶段顺序

```
阶段 1 (微信) ──验证──> 阶段 2 (磁盘占用) ──验证──> 阶段 3 (缩略图) ──验证──> 阶段 4 (HEIC) ──验证──> 阶段 5 (Spotlight) ──验证──> 发版 v2.5.0
   0.5 天                    0.5 天                       2 天                       1 天                       2 天                          共 6 天
```

**每个阶段后立即发版**（v2.4.1 / v2.4.2 / v2.4.3 / v2.4.4 / v2.5.0），失败可回滚不污染后续阶段。

### 提交粒度

每阶段一个 feature commit + 必要的 fix commit：

```
阶段 1: feat(wechat): 放开 Windows 平台「离开不待机」开关
阶段 2: feat(server): 磁盘占用支持 Windows（PowerShell Get-ChildItem）
阶段 3: feat(server): 缩略图支持 Windows（sharp + ffmpeg-static）
       build(deps): 新增 sharp + ffmpeg-static 依赖
       ci(actions): 验证 Windows 缩略图构建
阶段 4: feat(server): HEIC 预览支持 Windows/Linux（libheif + sharp）
       build(deps): 新增 libheif-node-dy 依赖
阶段 5: feat(server): 内容搜索支持 Windows/Linux（@vscode/ripgrep）
       build(deps): 新增 @vscode/ripgrep 依赖
```

### CI/CD 触发

- 每阶段 PR 触发：`.github/workflows/build-test.yml`（全平台测试）
- 阶段完成后：合并到 main → 推送 tag → 触发 `.github/workflows/release.yml`（4 平台发版）
- 文档同步：每阶段后更新 README.md（已验证能力 + Roadmap）

---

## Documentation Updates

### 必更新文档

1. **CHANGELOG.md** — 每个阶段追加条目
2. **README.md** — 更新「已验证能力」+「Roadmap」勾选
3. **.agent-rules/mechanisms/platform-adaptation.md**（实施时新建）— 跨平台分支策略机制文档
4. **package.json** — 依赖说明（在 README "建在巨人肩膀上" 表格追加）

### 文档审查

每阶段完成时检查：
- 文档是否与代码同步？
- 是否引入未文档化的新依赖？
- 是否有破坏性变更需在 README 标注？

---

## Risk Summary

| 阶段 | 风险等级 | 主要风险 | 缓解 |
|---|---|---|---|
| 1 | 🟢 低 | 6 行代码改动 | 单元测试 + macOS 回归 |
| 2 | 🟢 低 | PowerShell 性能 | 用 `Measure-Object` 而非 `Get-ChildItem \| ForEach` |
| 3 | 🟡 中 | sharp / ffmpeg 跨平台 | CI 4 平台测试 + 降级路径 |
| 4 | 🟡 中 | libheif DLL 下载 | 文档说明 + 手动下载指引 |
| 5 | 🟡 中 | ripgrep 兼容 | 兜底 grepFiles 不删除 |

**整体风险**：低。所有阶段都有 macOS / 原逻辑兜底。

---

## Final Verification Wave (通用)

每个阶段完成后必须通过：

- [ ] F1 (Plan Compliance): 检查所有 "Must Have" 已实现，"Must NOT Have" 未引入
- [ ] F2 (Code Quality): `node -c server.js && node -c electron/main.js` 通过
- [ ] F3 (Real Manual QA): 本地运行功能 + 跨平台 CI 通过
- [ ] F4 (Scope Fidelity): diff 仅含本阶段改动，无混入无关重构

每个阶段都等待用户明确 "okay" 后才标记完成。

---

## Success Criteria

### 终极成功标准

- [ ] 阶段 1-5 全部完成，CHANGELOG 记录完整
- [ ] 5 个功能在 Windows 上提供对等体验
- [ ] GitHub Actions 4 平台矩阵全绿
- [ ] 没有任何 macOS 平台回归
- [ ] 用户可以顺利地从 v2.4.0 升级到 v2.5.0
- [ ] 配套机制文档 `.agent-rules/mechanisms/platform-adaptation.md` 已创建
- [ ] README.md "已验证能力" + "Roadmap" 已更新

### 验证命令

```bash
# 本地启动
npm install
npm run rebuild
npm run app

# 构建测试
npm run dist:win
npm run dist:mac
npm run dist:linux

# CI 验证
gh workflow run build-test.yml
gh run watch
```

---

> 计划生成时间：2026-06-21
> 配套机制文档：`.agent-rules/mechanisms/platform-adaptation.md`（待执行 Agent 生成）
> 计划等级：Large（6 天工作量 + 跨平台验证）
