/* 翻箱 FanBox 前端 */
'use strict';

const $ = (s) => document.querySelector(s);
const api = (p) => fetch(p).then((r) => r.json());
const apiPost = (p, body) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

// ---------- SVG 图标系统（替代 emoji，统一矢量审美） ----------
const SVG = {
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  text: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  pdf: '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/>',
  data: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/>',
  json: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1 2 2 2 2 0 0 1-2 2v5a2 2 0 0 1-2 2h-1"/>',
  archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  // UI 装饰图标（统一矢量，替代散落的 emoji）
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  link: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  term: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  clip: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  edit3: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
};
// UI 图标快捷函数（默认 currentColor，随主题文字色自适应）
function ic(name, color, size) { return svgWrap(SVG[name], color || 'currentColor', size || 16, false); }
// ext → 类别 + 颜色
const EXT_KIND = {
  js: ['code', '#e8c95b'], mjs: ['code', '#e8c95b'], cjs: ['code', '#e8c95b'], jsx: ['code', '#5bc9e8'],
  ts: ['code', '#5b9ae8'], tsx: ['code', '#5b9ae8'], py: ['code', '#5b90c9'], go: ['code', '#5bc9d6'],
  rs: ['code', '#d68a5b'], swift: ['code', '#e8825b'], java: ['code', '#d68a5b'], rb: ['code', '#e85b5b'],
  c: ['code', '#7b9ae8'], cpp: ['code', '#7b9ae8'], h: ['code', '#7b9ae8'], php: ['code', '#9a7be8'],
  vue: ['code', '#5bd6a0'], sh: ['code', '#9aa3b2'], bash: ['code', '#9aa3b2'], lua: ['code', '#5b9ae8'],
  html: ['code', '#e87b5b'], htm: ['code', '#e87b5b'], css: ['code', '#5b9ae8'], scss: ['code', '#e85b9a'],
  json: ['json', '#e8c95b'], json5: ['json', '#e8c95b'], yml: ['json', '#d65b9a'], yaml: ['json', '#d65b9a'],
  toml: ['json', '#9a7be8'], ini: ['json', '#9aa3b2'], env: ['json', '#e8c95b'], xml: ['code', '#9aa3b2'],
  md: ['text', '#7bc9e8'], markdown: ['text', '#7bc9e8'], txt: ['text', '#9aa3b2'], log: ['text', '#9aa3b2'],
  csv: ['data', '#5bd6a0'], tsv: ['data', '#5bd6a0'], sql: ['data', '#e8a85b'],
  zip: ['archive', '#e8c95b'], rar: ['archive', '#e8c95b'], '7z': ['archive', '#e8c95b'],
  gz: ['archive', '#e8c95b'], tar: ['archive', '#e8c95b'],
};
const KIND_COLOR = { dir: '#6d8bff', image: '#5bd6a0', video: '#9a7be8', audio: '#e85b9a', pdf: '#e85b5b', text: '#9aa3b2', other: '#7a8294' };
// 缩略图加载失败时的回退图标
window.__svgVideo = svgWrap(SVG.video, KIND_COLOR.video, 34);
window.__svgImg = svgWrap(SVG.image, KIND_COLOR.image, 34);

// 图标配色随皮肤变化
function iconColorFor(e) {
  const ex = (e.name.split('.').pop() || '').toLowerCase();
  const t = state.theme;
  if (t === 'warm') {
    if (e.isDir) return '#c0714f';
    if (['md', 'markdown', 'txt', 'pdf'].includes(ex)) return '#a0895c';
    if (['csv', 'tsv', 'sql'].includes(ex)) return '#8a7a48';
    return '#9b8b6e';
  }
  if (t === 'editorial') {
    if (e.isDir) return '#0a0a0a';
    if (['html', 'htm'].includes(ex)) return '#ff433d';
    if (['md', 'markdown'].includes(ex)) return '#0000ee';
    if (e.kind === 'data' || ['csv', 'tsv'].includes(ex)) return '#00a33e';
    return '#0a0a0a';
  }
  // terminal：暖色多彩，文件夹用中性灰绿不抢 volt
  if (e.isDir) return '#9aa08a';
  if (EXT_KIND[ex]) return EXT_KIND[ex][1];
  return KIND_COLOR[e.kind] || KIND_COLOR.other;
}
function iconSvg(e, size = 22) {
  const color = iconColorFor(e);
  if (e.isDir) return svgWrap(SVG.folder, color, size, true);
  const ex = (e.name.split('.').pop() || '').toLowerCase();
  let shape = SVG[e.kind] || SVG.file;
  if (EXT_KIND[ex]) shape = SVG[EXT_KIND[ex][0]];
  return svgWrap(shape, color, size);
}
function svgWrap(inner, color, size, fill) {
  const isCur = color === 'currentColor';
  const fillVal = fill ? (isCur ? 'currentColor' : color + '22') : 'none';
  const fillOp = (fill && isCur) ? ' fill-opacity="0.15"' : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillVal}"${fillOp} stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const state = {
  cwd: null, home: null, platform: 'darwin', sep: '/',
  theme: localStorage.getItem('fb_theme') || 'terminal',
  entries: [], project: null, history: [],
  view: localStorage.getItem('fb_view') || 'grid',
  gridSize: localStorage.getItem('fb_gridsize') || 'md',
  sort: localStorage.getItem('fb_sort') || 'name',
  showHidden: localStorage.getItem('fb_hidden') === '1',
  filter: '', selected: null, cursor: -1, cols: 1, visible: [],
  favorites: [], recentOpened: [], recentMode: false,
  previewW: Number(localStorage.getItem('fb_preview_w')) || 480,
  previewH: Number(localStorage.getItem('fb_preview_h')) || 340,
  sidebarCollapsed: localStorage.getItem('fb_sidebar_collapsed') === '1',
};

// ---------- 工具 ----------
function fmtSize(n) {
  if (!n) return '';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)} ${u[i]}`;
}
function fmtTime(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  const diff = Date.now() - ms;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// 跨平台路径处理：用服务端返回的分隔符
function dirOf(p) { const i = p.lastIndexOf(state.sep); return i > 0 ? p.slice(0, i) : p; }
function baseOf(p) { const parts = p.split(state.sep).filter(Boolean); return parts[parts.length - 1] || p; }
function tilde(p) { return state.home && p.startsWith(state.home) ? '~' + p.slice(state.home.length) : p; }
function isFav(path) { return state.favorites.some((f) => f.path === path); }
function toast(msg, isErr) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast' + (isErr ? ' err' : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- 导航 ----------
async function navigate(p, pushHistory = true) {
  try {
    const data = await api('/api/list?path=' + encodeURIComponent(p));
    if (data.error) { toast('无法打开：' + data.error, true); return; }
    if (pushHistory && state.cwd) state.history.push(state.cwd);
    state.cwd = data.path;
    state.entries = data.entries;
    state.project = data.project;
    state.breadcrumb = data.breadcrumb;
    state.parent = data.parent;
    state.recentMode = false;
    state.filter = '';
    state.cursor = -1;
    $('#quick-filter').value = '';
    render();
    renderRootsActive();
    // 联动：监听此目录的文件变化（agent 改文件→自动刷新）；终端跟随则 cd 过去
    if (window.fanboxFs) window.fanboxFs.watch(state.cwd);
    if (typeof term !== 'undefined' && term.followBrowse && term.active) term.syncCd(state.cwd);
  } catch (e) { toast('打开失败', true); }
}
// shell 单引号转义（用于把路径塞进终端 cd 命令）
function shQuote(s) { return `'${String(s).replace(/'/g, `'\\''`)}'`; }
function goBack() { if (state.history.length) navigate(state.history.pop(), false); }
function goUp() { if (state.parent && state.parent !== state.cwd) navigate(state.parent); }

// ---------- 渲染 ----------
function render() {
  renderBreadcrumb();
  renderFiles();
  $('#btn-back').disabled = !state.history.length;
}
function renderBreadcrumb() {
  const bc = $('#breadcrumb');
  bc.innerHTML = '';
  if (state.recentMode) { bc.innerHTML = `<span class="crumb last">${ic('clock', 'currentColor', 15)} 最近修改的文件</span>`; return; }
  (state.breadcrumb || []).forEach((c, i, arr) => {
    if (i > 0) { const s = document.createElement('span'); s.className = 'sep'; s.textContent = '›'; bc.appendChild(s); }
    const el = document.createElement('span');
    el.className = 'crumb' + (i === arr.length - 1 ? ' last' : '');
    if (c.name === '/') el.innerHTML = ic('monitor', 'currentColor', 15);
    else el.textContent = c.name;
    el.onclick = () => navigate(c.path);
    bc.appendChild(el);
  });
  if (state.project) {
    const b = document.createElement('span');
    b.className = 'proj-badge';
    b.textContent = state.project.toUpperCase() + ' 项目';
    bc.appendChild(b);
  }
  // 滚到末尾，确保被挤压时也能看到当前所在目录（而非根目录）
  requestAnimationFrame(() => { bc.scrollLeft = bc.scrollWidth; });
}
function visibleEntries() {
  let list = state.entries.slice();
  if (!state.showHidden) list = list.filter((e) => !e.hidden);
  if (state.filter) { const f = state.filter.toLowerCase(); list = list.filter((e) => e.name.toLowerCase().includes(f)); }
  const dirFirst = (a, b) => (a.isDir !== b.isDir ? (a.isDir ? -1 : 1) : 0);
  if (state.sort === 'mtime') list.sort((a, b) => dirFirst(a, b) || b.mtime - a.mtime);
  else if (state.sort === 'size') list.sort((a, b) => dirFirst(a, b) || b.size - a.size);
  else list.sort((a, b) => dirFirst(a, b) || a.name.localeCompare(b.name, 'zh', { numeric: true }));
  return list;
}
function renderFiles() {
  const area = $('#file-area');
  const list = visibleEntries();
  state.visible = list;
  const dirs = list.filter((e) => e.isDir).length;
  $('#dir-meta').textContent = `${dirs} 个文件夹 · ${list.length - dirs} 个文件`;
  if (!list.length) {
    area.innerHTML = `<div class="empty-state"><div class="big">${ic('inbox', 'currentColor', 48)}</div>${state.filter ? '没有匹配的文件' : '这个文件夹是空的'}</div>`;
    return;
  }
  if (state.view === 'grid') {
    const grid = document.createElement('div');
    grid.className = 'grid size-' + state.gridSize;
    list.forEach((e, i) => grid.appendChild(gridItem(e, i)));
    area.innerHTML = '';
    area.appendChild(grid);
    measureCols();
  } else {
    const wrap = document.createElement('div');
    wrap.className = 'list';
    const head = document.createElement('div');
    head.className = 'row list-head';
    head.innerHTML = `<div></div><div>名称</div><div>修改时间</div><div>大小</div><div></div>`;
    wrap.appendChild(head);
    list.forEach((e, i) => wrap.appendChild(listRow(e, i)));
    area.innerHTML = '';
    area.appendChild(wrap);
    state.cols = 1;
  }
  highlightCursor();
}
function measureCols() {
  const items = $('#file-area').querySelectorAll('.item');
  if (!items.length) { state.cols = 1; return; }
  const top0 = items[0].offsetTop;
  let c = 0;
  for (const it of items) { if (it.offsetTop === top0) c++; else break; }
  state.cols = Math.max(1, c);
}
function favBtn(e) {
  const on = isFav(e.path);
  return `<span class="fav-btn ${on ? 'on' : ''}" title="收藏">${svgWrap(SVG.star, 'currentColor', 15, on)}</span>`;
}
function thumbHtml(e) {
  // 关键性能修复：用缩略图端点（sips/qlmanage 缓存小图），不再把原图/原视频整文件拉进来解码
  if (e.kind === 'image' || e.kind === 'video') {
    const w = state.gridSize === 'lg' ? 320 : (state.gridSize === 'sm' ? 160 : 240);
    const fb = e.kind === 'video' ? 'window.__svgVideo' : 'window.__svgImg';
    return `<img class="thumb" loading="lazy" decoding="async" src="/api/thumb?path=${encodeURIComponent(e.path)}&w=${w}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'svg-icon',innerHTML:${fb}}))">`;
  }
  return `<span class="svg-icon">${iconSvg(e, state.gridSize === 'lg' ? 44 : 34)}</span>`;
}
function gridItem(e, i) {
  const el = document.createElement('div');
  const chg = state.changed && state.changed.get(e.name);
  el.className = 'item' + (e.hidden ? ' hidden-file' : '') + (state.selected === e.path ? ' selected' : '') + (chg ? ' changed' : '');
  el.dataset.idx = i;
  el.dataset.path = e.path;
  if (chg) { el.dataset.changed = chg.count > 1 ? '改·' + chg.count : '改'; if (chg.files.size) el.title = '刚变更：\n' + [...chg.files].join('\n'); }
  el.innerHTML = `<div class="icon" style="--tint:${iconColorFor(e)}">${thumbHtml(e)}</div><div class="fname">${escapeHtml(e.name)}</div>${favBtn(e)}`;
  bindItem(el, e);
  return el;
}
function listRow(e, i) {
  const el = document.createElement('div');
  const chgR = state.changed && state.changed.get(e.name);
  el.className = 'row' + (e.hidden ? ' hidden-file' : '') + (state.selected === e.path ? ' selected' : '') + (chgR ? ' changed' : '');
  el.dataset.idx = i;
  el.dataset.path = e.path;
  if (chgR) { el.dataset.changed = chgR.count > 1 ? '改·' + chgR.count : '改'; if (chgR.files.size) el.title = '刚变更：\n' + [...chgR.files].join('\n'); }
  el.innerHTML = `<div class="icon">${(e.kind === 'image' || e.kind === 'video') ? `<img class="thumb-sm" loading="lazy" decoding="async" src="/api/thumb?path=${encodeURIComponent(e.path)}&w=96" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'svg-icon',innerHTML:this.dataset.fb||''}))" data-fb='${escapeHtml(iconSvg(e, 18))}'>` : `<span class="svg-icon">${iconSvg(e, 18)}</span>`}</div>
    <div class="fname">${escapeHtml(e.name)}</div>
    <div class="meta">${fmtTime(e.mtime)}</div>
    <div class="meta">${e.isDir ? '' : fmtSize(e.size)}</div>
    ${favBtn(e)}`;
  bindItem(el, e);
  return el;
}
function bindItem(el, e) {
  // 拖拽到终端：把路径作为上下文喂给 coding agent
  el.draggable = true;
  el.addEventListener('dragstart', (ev) => {
    ev.dataTransfer.setData('text/plain', e.path);
    ev.dataTransfer.setData('application/x-fanbox-path', e.path);
    ev.dataTransfer.effectAllowed = 'copy';
  });
  el.onclick = (ev) => {
    if (ev.target.closest('.fav-btn')) { ev.stopPropagation(); toggleFav(e); return; }
    state.cursor = Number(el.dataset.idx);
    onItemClick(e);
  };
  el.ondblclick = (ev) => { if (ev.target.closest('.fav-btn')) return; onItemOpen(e); };
  el.oncontextmenu = (ev) => { state.cursor = Number(el.dataset.idx); showContextMenu(ev, e); };
}
// 让任意元素可拖拽出一个路径（侧栏目录/收藏 → 终端）
function makeDraggablePath(el, p) {
  el.draggable = true;
  el.addEventListener('dragstart', (ev) => {
    ev.dataTransfer.setData('text/plain', p);
    ev.dataTransfer.setData('application/x-fanbox-path', p);
    ev.dataTransfer.effectAllowed = 'copy';
  });
}
// 只切换选中态的 class，绝不重建整个网格（重建会把所有缩略图重新解码 → 点击卡顿元凶）
function applySelection(path) {
  const area = $('#file-area');
  const prev = area.querySelector('.item.selected, .row.selected');
  if (prev) prev.classList.remove('selected');
  state.selected = path;
  if (path) { const el = area.querySelector(`[data-path="${CSS.escape(path)}"]`); if (el) el.classList.add('selected'); }
}
function onItemClick(e) {
  if (e.isDir) { state.selected = e.path; navigate(e.path); return; }
  applySelection(e.path);
  openPreview(e);
  recordRecent(e.path);
}
function onItemOpen(e) { if (e.isDir) navigate(e.path); else openWith(e.path, 'default'); }

// ---------- 主区键盘导航 ----------
function highlightCursor() {
  const area = $('#file-area');
  area.querySelectorAll('.cursor').forEach((x) => x.classList.remove('cursor'));
  if (state.cursor < 0) return;
  const el = area.querySelector(`[data-idx="${state.cursor}"]`);
  if (el) { el.classList.add('cursor'); el.scrollIntoView({ block: 'nearest' }); }
}
function moveCursor(d) {
  if (!state.visible.length) return;
  if (state.cursor < 0) state.cursor = 0;
  else state.cursor = Math.min(state.visible.length - 1, Math.max(0, state.cursor + d));
  highlightCursor();
}
function cursorEnter(editor) {
  const e = state.visible[state.cursor];
  if (!e) return;
  if (editor && !e.isDir) { openWith(e.path, 'editor'); return; }
  if (e.isDir) { state.selected = e.path; navigate(e.path); }
  else { applySelection(e.path); openPreview(e); recordRecent(e.path); }
}

// ---------- 预览 ----------
async function openPreview(e) {
  mona.disposeIfAny(); crepe.disposeIfAny(); imgEditState = null; // 离开编辑态时回收编辑器（连带 worker），避免泄漏
  showPreviewPanel();
  $('#preview-title').textContent = e.name;
  const body = $('#preview-body');
  body.innerHTML = '<div class="cmdk-loading">加载中…</div>';
  renderPreviewActions(e);
  renderPreviewFoot(e);
  const k = e.kind;
  if (k === 'image') {
    // 预览用中等缩略图（秒开），点击放大走原图 lightbox
    body.innerHTML = `<img class="pv-img" src="/api/thumb?path=${encodeURIComponent(e.path)}&w=1000" title="点击放大" onerror="this.src='/api/raw?path=${encodeURIComponent(e.path)}'">`;
    body.querySelector('.pv-img').onclick = () => lightbox(e.path);
  } else if (k === 'video') {
    body.innerHTML = `<video controls src="/api/raw?path=${encodeURIComponent(e.path)}"></video>`;
  } else if (k === 'audio') {
    body.innerHTML = `<div class="preview-meta"><span>${fmtSize(e.size)}</span></div><audio controls src="/api/raw?path=${encodeURIComponent(e.path)}"></audio>`;
  } else if (k === 'pdf') {
    body.innerHTML = `<iframe class="iframe-preview" src="/api/raw?path=${encodeURIComponent(e.path)}"></iframe>`;
  } else if (k === 'text') {
    renderTextPreview(await api('/api/read?path=' + encodeURIComponent(e.path)));
  } else {
    body.innerHTML = `<div class="empty-state"><div class="big">${iconSvg(e, 48)}</div>这个文件类型无法预览<br><br>${fmtSize(e.size)}</div>`;
  }
}
function renderTextPreview(data) {
  const body = $('#preview-body');
  const meta = `<div class="preview-meta"><span>${data.ext || 'txt'}</span><span>${fmtSize(data.size)}</span><span>${fmtTime(data.mtime)}</span></div>`;
  const ex = (data.ext || '').toLowerCase();
  if ((ex === 'md' || ex === 'markdown') && !window.__noMarked && window.marked) {
    body.innerHTML = meta + `<div class="md-body">${window.marked.parse(data.content || '')}</div>`;
    if (window.hljs) body.querySelectorAll('pre code').forEach((b) => { try { window.hljs.highlightElement(b); } catch {} });
  } else if (ex === 'csv' || ex === 'tsv') {
    body.innerHTML = meta + csvTable(data.content || '', ex === 'tsv' ? '\t' : ',');
  } else if (ex === 'html' || ex === 'htm') {
    renderHtmlPreview(data, meta);
  } else {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    if (ex) code.className = 'language-' + ex;
    code.textContent = data.content || '';
    pre.appendChild(code);
    body.innerHTML = meta;
    body.appendChild(pre);
    if (window.hljs && !window.__noHljs) { try { window.hljs.highlightElement(code); } catch {} }
  }
}
function csvTable(text, delim) {
  const rows = text.split('\n').filter((r) => r.trim()).slice(0, 500).map((r) => r.split(delim));
  if (!rows.length) return '<div class="empty-state">空表格</div>';
  let h = '<div class="csv-wrap"><table class="csv-table"><thead><tr>';
  rows[0].forEach((c) => { h += `<th>${escapeHtml(c)}</th>`; });
  h += '</tr></thead><tbody>';
  for (let i = 1; i < rows.length; i++) {
    h += '<tr>';
    rows[i].forEach((c) => { h += `<td>${escapeHtml(c)}</td>`; });
    h += '</tr>';
  }
  h += '</tbody></table></div>';
  return h;
}
function renderHtmlPreview(data, meta) {
  const body = $('#preview-body');
  body.innerHTML = meta +
    `<div class="pv-toolbar"><button id="html-toggle" class="ghost-btn">查看源码</button><button id="html-browser" class="ghost-btn">${ic('globe', 'currentColor', 13)} 浏览器打开（看完整交互）</button></div>` +
    `<iframe class="iframe-preview" sandbox="allow-scripts allow-same-origin" srcdoc="${escapeHtml(data.content || '')}"></iframe>`;
  let src = false;
  $('#html-browser').onclick = () => openWith(data.path, 'default');
  $('#html-toggle').onclick = () => {
    src = !src;
    if (src) {
      const pre = document.createElement('pre');
      pre.innerHTML = `<code class="language-html">${escapeHtml(data.content || '')}</code>`;
      body.querySelector('.iframe-preview').replaceWith(pre);
      if (window.hljs) pre.querySelectorAll('code').forEach((b) => { try { window.hljs.highlightElement(b); } catch {} });
      $('#html-toggle').textContent = '渲染预览';
    } else { renderHtmlPreview(data, meta); }
  };
}
function renderPreviewActions(e) {
  const box = $('#preview-actions');
  box.innerHTML = '';
  const clip = window.fanboxClipboard;
  // 图标为主、文字精简：主操作「打开」留字，其余只留图标 + tooltip
  const acts = [
    { icon: ic('link', 'currentColor', 14), label: '打开', title: '默认应用打开', cls: 'primary', fn: () => openWith(e.path, 'default') },
    ...(e.kind === 'text' ? [{ icon: ic('edit3', 'currentColor', 15), title: '编辑文本', fn: () => enterEditMode(e) }] : []),
    ...(e.kind === 'image' ? [{ icon: ic('edit3', 'currentColor', 15), title: '编辑图片', fn: () => enterImageEdit(e) }] : []),
    { icon: ic('term', 'currentColor', 15), title: '在编辑器打开', fn: () => openWith(e.path, 'editor') },
    { icon: ic('folder', 'currentColor', 15), title: '在访达显示', fn: () => openWith(e.path, 'reveal') },
    ...(e.kind === 'image' && clip ? [{ icon: ic('image', 'currentColor', 15), title: '复制图片（可粘贴到其它应用）', fn: () => copyImage(e.path) }] : []),
    ...(clip ? [{ icon: ic('copy', 'currentColor', 15), title: '复制文件（访达里可粘贴）', fn: () => copyFile(e.path) }] : []),
    { icon: ic('clip', 'currentColor', 15), title: '复制路径', fn: () => copyPath(e.path) },
  ];
  acts.forEach((a) => {
    const b = document.createElement('button');
    b.className = (a.cls || '') + (a.label ? '' : ' icon-only');
    b.title = a.title || a.label || '';
    b.innerHTML = a.label ? `${a.icon}<span>${a.label}</span>` : a.icon;
    b.onclick = a.fn;
    box.appendChild(b);
  });
}
// 预览底部：大小 · 创建 · 修改
function fmtDateTime(ms) {
  if (!ms) return '—';
  const d = new Date(ms); const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function renderPreviewFoot(e) {
  const f = $('#preview-foot');
  if (!f) return;
  if (!e || e.isDir) { f.innerHTML = ''; return; }
  f.innerHTML = `<span title="大小">${e.size ? fmtSize(e.size) : '0 B'}</span><span title="创建时间">创建 ${fmtDateTime(e.btime)}</span><span title="修改时间">改 ${fmtDateTime(e.mtime)}</span>`;
}
async function copyImage(p) { const r = await window.fanboxClipboard.copyImage(p); toast(r.ok ? '已复制图片，可粘贴到其它应用' : '复制图片失败：' + (r.error || ''), !r.ok); }
async function copyFile(p) { const r = await window.fanboxClipboard.copyFile(p); toast(r.ok ? '已复制文件，可在访达里粘贴' : '复制文件失败', !r.ok); }
function closePreview() {
  mona.disposeIfAny(); crepe.disposeIfAny(); imgEditState = null;
  animateLayout();
  $('#preview').classList.add('hidden');
  $('#preview-resizer').classList.add('hidden');
  applySelection(null);
  term.fitActive();
}
function lightbox(path) {
  const ov = document.createElement('div');
  ov.className = 'lightbox';
  ov.innerHTML = `<img src="/api/raw?path=${encodeURIComponent(path)}"><div class="lb-hint">点击空白处关闭 · 滚轮缩放</div>`;
  let scale = 1;
  const img = ov.querySelector('img');
  ov.onclick = (ev) => { if (ev.target === ov) ov.remove(); };
  ov.onwheel = (ev) => { ev.preventDefault(); scale = Math.min(8, Math.max(0.2, scale - ev.deltaY * 0.002)); img.style.transform = `scale(${scale})`; };
  document.body.appendChild(ov);
}
// 布局：侧栏(可折叠) + 主区；折叠时侧栏 display:none 退出栅格，故改单列 1fr 让主区铺满
function applyLayout() {
  $('#app').style.gridTemplateColumns = state.sidebarCollapsed ? '1fr' : '248px 1fr';
}
// 预览尺寸随 dock 翻转：终端在右→预览在下方用高度，否则用宽度
function applyPreviewSize() {
  const pv = $('#preview');
  if (!pv || pv.classList.contains('hidden')) return;
  pv.style.flexBasis = (term.dock === 'right' ? (state.previewH || 340) : state.previewW) + 'px';
}
// 离散布局切换时短暂开启过渡（拖拽时不开，保证跟手）
function animateLayout() {
  const mb = $('#main-body'); if (!mb) return;
  mb.classList.add('lay-anim');
  clearTimeout(animateLayout._t);
  animateLayout._t = setTimeout(() => mb.classList.remove('lay-anim'), 280);
}
function showPreviewPanel() {
  const wasHidden = $('#preview').classList.contains('hidden');
  $('#preview').classList.remove('hidden');
  $('#preview-resizer').classList.remove('hidden');
  if (wasHidden) animateLayout();
  applyPreviewSize();
}
function applyPreviewWidth() { applyPreviewSize(); } // 兼容旧调用名
function toggleSidebar(force) {
  state.sidebarCollapsed = force === undefined ? !state.sidebarCollapsed : force;
  localStorage.setItem('fb_sidebar_collapsed', state.sidebarCollapsed ? '1' : '0');
  $('#app').classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  $('#btn-sidebar')?.classList.toggle('on', state.sidebarCollapsed);
  applyLayout();
}

// ---------- 图片基础编辑（canvas：标注/打码/转格式/缩放/压缩，原生保存）----------
let imgEditState = null;
async function enterImageEdit(e) {
  recordRecent(e.path);
  mona.disposeIfAny(); crepe.disposeIfAny();
  showPreviewPanel();
  applySelection(e.path);
  $('#preview-title').textContent = '编辑 · ' + e.name;
  $('#preview-actions').innerHTML = '';
  renderPreviewFoot(null);
  const body = $('#preview-body');
  body.innerHTML = '<div class="cmdk-loading">加载图片…</div>';
  const img = new Image();
  img.onload = () => {
    // 大图 OOM 守卫：canvas 按 RGBA 估算，超 60MP（~240MB）拒绝编辑，回退预览
    if (img.naturalWidth * img.naturalHeight > 60e6) { toast('图片过大（>60MP），暂不支持编辑，请先压缩', true); openPreview(e); return; }
    buildImageEditor(e, img);
  };
  img.onerror = () => { toast('图片加载失败', true); openPreview(e); };
  img.src = '/api/raw?path=' + encodeURIComponent(e.path);
}
function ieSnapshot(st) { const c = document.createElement('canvas'); c.width = st.canvas.width; c.height = st.canvas.height; c.getContext('2d').drawImage(st.canvas, 0, 0); return c; }
function iePos(st, ev) { const r = st.canvas.getBoundingClientRect(); return { x: (ev.clientX - r.left) * (st.canvas.width / r.width), y: (ev.clientY - r.top) * (st.canvas.height / r.height) }; }
function ieDrawShape(st, x0, y0, x1, y1) {
  const c = st.ctx; c.save();
  c.strokeStyle = st.color; c.fillStyle = st.color; c.lineWidth = st.size; c.lineCap = 'round'; c.lineJoin = 'round';
  if (st.tool === 'rect') c.strokeRect(x0, y0, x1 - x0, y1 - y0);
  else if (st.tool === 'line' || st.tool === 'arrow') {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    if (st.tool === 'arrow') { const a = Math.atan2(y1 - y0, x1 - x0), h = Math.max(12, st.size * 3.2); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - h * Math.cos(a - 0.4), y1 - h * Math.sin(a - 0.4)); c.lineTo(x1 - h * Math.cos(a + 0.4), y1 - h * Math.sin(a + 0.4)); c.closePath(); c.fill(); }
  }
  c.restore();
}
function iePixelate(st, x0, y0, x1, y1) {
  const x = Math.max(0, Math.min(x0, x1)), y = Math.max(0, Math.min(y0, y1));
  const w = Math.min(st.canvas.width - x, Math.abs(x1 - x0)), h = Math.min(st.canvas.height - y, Math.abs(y1 - y0));
  if (w < 2 || h < 2) return;
  const block = Math.max(6, Math.round(Math.min(w, h) / 12));
  const c = st.ctx, data = c.getImageData(x, y, w, h), d = data.data;
  for (let by = 0; by < h; by += block) for (let bx = 0; bx < w; bx += block) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = by; yy < Math.min(by + block, h); yy++) for (let xx = bx; xx < Math.min(bx + block, w); xx++) { const i = (yy * w + xx) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    r = r / n; g = g / n; b = b / n;
    for (let yy = by; yy < Math.min(by + block, h); yy++) for (let xx = bx; xx < Math.min(bx + block, w); xx++) { const i = (yy * w + xx) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; }
  }
  c.putImageData(data, x, y);
}
function ieToolBtn(tool, title, inner, active) {
  return `<button data-tool="${tool}" title="${title}"${active ? ' class="active"' : ''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></button>`;
}
function buildImageEditor(e, img) {
  const origExt = (e.name.split('.').pop() || 'png').toLowerCase();
  const body = $('#preview-body');
  body.innerHTML =
    `<div class="imgedit-tools">
      <div class="ie-seg" id="ie-tools">
        ${ieToolBtn('pen', '自由画笔', '<path d="M3 21c0-3 2-5 5-6 2-.7 3-2 3.5-4M21 3c-1 4-3 7-6 9"/><path d="M11 11l2 2"/>', true)}
        ${ieToolBtn('rect', '矩形框', '<rect x="4" y="6" width="16" height="12" rx="1.5"/>')}
        ${ieToolBtn('line', '直线', '<line x1="5" y1="19" x2="19" y2="5"/>')}
        ${ieToolBtn('arrow', '箭头', '<line x1="5" y1="19" x2="18" y2="6"/><polyline points="10.5 6 18 6 18 13.5"/>')}
        ${ieToolBtn('text', '文字', '<polyline points="5 7 5 5 19 5 19 7"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="9" y1="19" x2="15" y2="19"/>')}
        ${ieToolBtn('mosaic', '打码', '<rect x="4" y="4" width="6.4" height="6.4"/><rect x="13.6" y="4" width="6.4" height="6.4"/><rect x="4" y="13.6" width="6.4" height="6.4"/><rect x="13.6" y="13.6" width="6.4" height="6.4"/>')}
      </div>
      <input type="color" id="ie-color" value="#ff3b30" title="颜色">
      <span class="ie-thick" title="粗细"><input type="range" id="ie-size" min="1" max="60" value="5"><i id="ie-dot"></i></span>
      <button id="ie-undo" class="ghost-btn" title="撤销 ⌘Z">撤销</button>
    </div>
    <div class="imgedit-canvas-wrap"><canvas id="ie-canvas"></canvas></div>
    <div class="imgedit-export">
      <label>格式 <select id="ie-format"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select></label>
      <label>宽度 <input id="ie-width" type="number" min="16" step="1"></label>
      <label id="ie-quality-wrap" style="display:none">质量 <input id="ie-quality" type="range" min="10" max="100" value="85"></label>
      <span class="ie-spacer"></span>
      <button id="ie-saveas" class="ghost-btn">另存为</button>
      <button id="ie-save" class="primary">保存</button>
    </div>`;
  const canvas = $('#ie-canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  $('#ie-width').value = img.naturalWidth;
  // 粗细随图分辨率自适应：大图默认更粗，才「看得出」；滑块上限也按图放大
  const defSize = Math.max(3, Math.round(img.naturalWidth / 250));
  const maxSize = Math.max(40, Math.round(img.naturalWidth / 30));
  const st = { e, img, canvas, ctx, tool: 'pen', color: '#ff3b30', size: defSize, undo: [], base: null, dragging: false, sx: 0, sy: 0, lastX: 0, lastY: 0, origExt };
  imgEditState = st;
  const sizeInput = $('#ie-size'); sizeInput.max = String(maxSize); sizeInput.value = String(defSize);
  const fmtSel = $('#ie-format');
  fmtSel.value = ['jpg', 'jpeg'].includes(origExt) ? 'jpeg' : (origExt === 'webp' ? 'webp' : 'png');
  const toggleQ = () => { $('#ie-quality-wrap').style.display = fmtSel.value === 'png' ? 'none' : ''; };
  toggleQ();
  bindImageEditor(st, toggleQ);
}
function bindImageEditor(st, toggleQ) {
  $('#ie-tools').querySelectorAll('button').forEach((b) => { b.onclick = () => { st.tool = b.dataset.tool; $('#ie-tools').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b)); }; });
  // 粗细可视化：滑块旁的小圆点直观显示当前笔触粗细
  const updateDot = () => { const d = $('#ie-dot'); if (d) { const px = Math.min(22, Math.max(3, st.size)); d.style.width = px + 'px'; d.style.height = px + 'px'; d.style.background = st.color; d.title = st.size + 'px'; } };
  updateDot();
  $('#ie-color').oninput = (ev) => { st.color = ev.target.value; updateDot(); };
  $('#ie-size').oninput = (ev) => { st.size = Number(ev.target.value); updateDot(); };
  $('#ie-format').onchange = toggleQ;
  $('#ie-undo').onclick = () => ieUndo(st);
  const canvas = st.canvas;
  canvas.addEventListener('pointerdown', async (ev) => {
    const { x, y } = iePos(st, ev);
    if (st.tool === 'text') {
      const txt = await inputDialog('添加文字', '', '输入文字');
      if (!txt) return;
      st.undo.push(ieSnapshot(st)); if (st.undo.length > 25) st.undo.shift();
      const c = st.ctx; c.save(); c.fillStyle = st.color; c.textBaseline = 'top';
      c.font = `600 ${Math.max(14, st.size * 6)}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-ui')}`;
      c.fillText(txt, x, y); c.restore();
      return;
    }
    st.base = ieSnapshot(st); st.dragging = true; st.sx = x; st.sy = y; st.lastX = x; st.lastY = y;
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!st.dragging) return;
    const { x, y } = iePos(st, ev);
    if (st.tool === 'pen') {
      // 自由画笔：逐段累加，画任意形状（不还原 base）
      const c = st.ctx; c.save(); c.strokeStyle = st.color; c.lineWidth = st.size; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(st.lastX, st.lastY); c.lineTo(x, y); c.stroke(); c.restore();
      st.lastX = x; st.lastY = y; return;
    }
    st.ctx.drawImage(st.base, 0, 0); // 还原到拖拽前，再画预览
    if (st.tool === 'mosaic') { st.ctx.save(); st.ctx.strokeStyle = st.color; st.ctx.setLineDash([6, 4]); st.ctx.lineWidth = 2; st.ctx.strokeRect(st.sx, st.sy, x - st.sx, y - st.sy); st.ctx.restore(); }
    else ieDrawShape(st, st.sx, st.sy, x, y);
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!st.dragging) return;
    st.dragging = false;
    const { x, y } = iePos(st, ev);
    if (st.tool !== 'pen') {
      st.ctx.drawImage(st.base, 0, 0);
      if (st.tool === 'mosaic') iePixelate(st, st.sx, st.sy, x, y);
      else ieDrawShape(st, st.sx, st.sy, x, y);
    }
    st.undo.push(st.base); if (st.undo.length > 25) st.undo.shift();
  });
  $('#ie-save').onclick = () => ieSave(st, false);
  $('#ie-saveas').onclick = () => ieSave(st, true);
}
function ieUndo(st) { const snap = st.undo.pop(); if (!snap) { toast('没有可撤销的'); return; } st.ctx.drawImage(snap, 0, 0); }
function ieExport(st) {
  const fmt = $('#ie-format').value;
  const w = Math.max(16, parseInt($('#ie-width').value, 10) || st.canvas.width);
  let out = st.canvas;
  if (w !== st.canvas.width) { const h = Math.round(st.canvas.height * (w / st.canvas.width)); out = document.createElement('canvas'); out.width = w; out.height = h; out.getContext('2d').drawImage(st.canvas, 0, 0, w, h); }
  const q = (parseInt($('#ie-quality').value, 10) || 85) / 100;
  const mime = fmt === 'jpeg' ? 'image/jpeg' : (fmt === 'webp' ? 'image/webp' : 'image/png');
  return { dataUrl: out.toDataURL(mime, q), ext: fmt === 'jpeg' ? 'jpg' : fmt };
}
async function ieSave(st, asNew) {
  const { dataUrl, ext } = ieExport(st);
  const sameType = st.origExt === ext || (['jpg', 'jpeg'].includes(st.origExt) && ext === 'jpg');
  let newName = null;
  if (asNew || !sameType) {
    const suggest = st.e.name.replace(/\.[^.]+$/, '') + (asNew ? '-编辑' : '') + '.' + ext;
    newName = await inputDialog(asNew ? '另存为' : '格式已变，另存为新文件', suggest, '文件名（含扩展名）');
    if (!newName) return;
  } else {
    // 覆盖原图不可逆且为有损重编码——给一次确认（删除都走废纸篓，覆盖更该拦）
    const ok = await confirmDialog('将覆盖原图、且重新编码（可能轻微降质），此操作不可恢复。确定覆盖？建议用「另存为」。');
    if (!ok) return;
  }
  const r = await apiPost('/api/image-save', { path: st.e.path, dataUrl, newName });
  if (r.error) { toast('保存失败：' + r.error, true); return; }
  toast(newName ? '已另存为 ' + baseOf(r.path) : '已保存（已覆盖原图）');
  imgEditState = null;
  await refresh();
  const saved = state.entries.find((x) => x.path === r.path) || st.e;
  applySelection(saved.path); openPreview(saved);
}

// ---------- 操作 ----------
async function openWith(p, withApp) {
  const r = await apiPost('/api/open', { path: p, with: withApp });
  if (r.ok) {
    const used = r.with;
    if (used === 'reveal') toast('已在文件管理器中显示');
    else if (used === 'terminal') toast('已在终端打开此目录');
    else if (used === 'editor') toast('已在编辑器打开');
    else if (withApp === 'editor' && used === 'default') toast('未找到 code 命令，已用默认应用打开');
    else toast('已打开');
    loadFavorites();
  } else toast('打开失败：' + (r.error || ''), true);
}
async function copyPath(p) {
  try { await navigator.clipboard.writeText(p); toast('已复制路径'); }
  catch { toast('复制失败（浏览器限制），路径：' + p, true); }
}
// 记录最近打开：内部预览/编辑也算「打开过」，本地即时置顶 + 异步落库
function recordRecent(p) {
  if (!p) return;
  state.recentOpened = [p, ...(state.recentOpened || []).filter((x) => x !== p)].slice(0, 30);
  renderRecentOpened();
  apiPost('/api/recent-open', { path: p }).catch(() => {});
}
async function toggleFav(e) {
  const r = await apiPost('/api/favorites', { path: e.path, name: e.name, isDir: e.isDir });
  state.favorites = r.favorites;
  renderFavs();
  if (!$('#preview').classList.contains('hidden') && state.selected === e.path) renderPreviewActions(e);
  // 只更新该项的星标，不重建网格（避免重新解码所有缩略图）
  const on = isFav(e.path);
  const star = $('#file-area').querySelector(`[data-path="${CSS.escape(e.path)}"] .fav-btn`);
  if (star) { star.classList.toggle('on', on); star.innerHTML = svgWrap(SVG.star, 'currentColor', 15, on); }
  toast(on ? '已收藏' : '已取消收藏');
}

// ---------- 文件操作（编辑 / 重命名 / 废纸篓 / 新建）----------
// 重拉当前目录但保留筛选词，操作后刷新视图
async function refresh() {
  if (!state.cwd || state.recentMode) return;
  const data = await api('/api/list?path=' + encodeURIComponent(state.cwd));
  if (data.error) return;
  state.entries = data.entries;
  state.project = data.project;
  state.breadcrumb = data.breadcrumb;
  renderBreadcrumb();
  renderFiles();
}
// 文本原地编辑：md → Milkdown Crepe 所见即所得；其它 → Monaco；都失败回退 textarea
async function enterEditMode(e) {
  mona.disposeIfAny();
  crepe.disposeIfAny();
  showPreviewPanel();
  state.selected = e.path;
  $('#preview-title').textContent = e.name;
  renderPreviewActions(e);
  renderPreviewFoot(e);
  const body = $('#preview-body');
  body.innerHTML = '<div class="cmdk-loading">加载中…</div>';
  const data = await api('/api/read?path=' + encodeURIComponent(e.path));
  if (data.tooLarge) { toast('文件太大，暂不支持原地编辑', true); openPreview(e); return; }
  const ex = (data.ext || '').toLowerCase();
  let baseMtime = data.mtime; // 并发覆盖保护基准
  let getValue, baseline = ''; // baseline：编辑器内的「已保存基准」，用于未保存守卫
  const leave = async () => {
    if (getValue && getValue() !== baseline) {
      const ok = await confirmDialog('有未保存的改动，放弃并退出？（保存请点取消后按 ⌘S）');
      if (!ok) return;
    }
    mona.disposeIfAny(); crepe.disposeIfAny(); openPreview(e);
  };
  const save = async (force) => {
    const content = getValue();
    const r = await apiPost('/api/write', { path: e.path, content, expectedMtime: force ? 0 : baseMtime });
    if (r.conflict) {
      const ok = await confirmDialog('文件已被外部修改（可能是 agent 改的）。覆盖会丢掉外部改动，确定覆盖？');
      if (ok) return save(true);
      return;
    }
    if (r.ok === false || r.error) { toast('保存失败：' + (r.error || ''), true); return; }
    baseMtime = r.mtime; baseline = content; // 更新已保存基准
    toast('已保存');
    refresh(); // 后台刷新文件区，不打断编辑（⌘S 留在编辑器里）
  };

  const isMd = ex === 'md' || ex === 'markdown';
  const C = isMd ? await crepe.load() : null;
  if (C) {
    body.innerHTML =
      `<div class="editor-bar"><button id="ed-save" class="primary">保存</button><button id="ed-cancel" class="ghost-btn">完成</button><span class="editor-hint">所见即所得 · ⌘S 保存 · Esc 完成</span></div>` +
      `<div id="ed-host" class="crepe-host"></div>`;
    const host = $('#ed-host');
    // 保护 YAML frontmatter：Crepe 不识别会丢掉，剥离后只把正文交给它，保存时再拼回
    const fm = /^(---\r?\n[\s\S]*?\r?\n---\r?\n)/.exec(data.content || '');
    const front = fm ? fm[1] : '';
    const inst = new C.Crepe({ root: host, defaultValue: front ? (data.content || '').slice(front.length) : (data.content || '') });
    await inst.create();
    crepe.editor = inst;
    getValue = () => front + inst.getMarkdown();
    // ⌘S 保存 / Esc 完成：捕获阶段拦在 ProseMirror 与全局键盘导航之前
    host.addEventListener('keydown', (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === 's') { ev.preventDefault(); ev.stopPropagation(); save(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); leave(); }
    }, true);
    setTimeout(() => host.querySelector('[contenteditable]')?.focus(), 0);
  } else if (await mona.load()) {
    const monaco = window.monaco;
    body.innerHTML =
      `<div class="editor-bar"><button id="ed-save" class="primary">保存</button><button id="ed-cancel" class="ghost-btn">完成</button><span class="editor-hint">⌘S 保存 · ⌘F 查找 · Esc 完成</span></div>` +
      `<div id="ed-host" class="mona-host"></div>`;
    const ed = monaco.editor.create($('#ed-host'), {
      value: data.content || '', language: mona.lang(ex), theme: mona.themeName(),
      fontFamily: getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace',
      fontSize: 13, lineHeight: 1.7, automaticLayout: true, minimap: { enabled: false },
      scrollBeyondLastLine: false, renderWhitespace: 'none', tabSize: 2, wordWrap: mona.wraps(ex) ? 'on' : 'off',
      smoothScrolling: true, padding: { top: 10, bottom: 10 }, fontLigatures: true,
    });
    mona.editor = ed;
    getValue = () => ed.getValue();
    ed.addCommand(monaco.KeyMod.CmdCtrl | monaco.KeyCode.KeyS, () => save());
    // Esc 退出编辑，但查找/建议浮窗打开时让 Esc 先关浮窗
    ed.addCommand(monaco.KeyCode.Escape, () => leave(), '!findWidgetVisible && !suggestWidgetVisible');
    setTimeout(() => ed.focus(), 0);
  } else {
    body.innerHTML =
      `<div class="editor-bar"><button id="ed-save" class="primary">保存</button><button id="ed-cancel" class="ghost-btn">完成</button><span class="editor-hint">⌘S 保存 · Esc 完成</span></div>` +
      `<textarea id="ed-host" class="editor-area" spellcheck="false"></textarea>`;
    const ta = $('#ed-host');
    ta.value = data.content || '';
    ta.focus();
    getValue = () => ta.value;
    ta.addEventListener('keydown', (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === 's') { ev.preventDefault(); save(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); leave(); }
      ev.stopPropagation(); // 别冒泡到主区键盘导航
    });
  }
  baseline = getValue ? getValue() : ''; // 以编辑器初始内容（Crepe 已规范化）为基准，避免误报未保存
  $('#ed-save').onclick = () => save();
  $('#ed-cancel').onclick = () => leave();
}
async function doRename(e) {
  const name = await inputDialog('重命名', e.name, '输入新名称');
  if (!name || name === e.name) return;
  const r = await apiPost('/api/rename', { path: e.path, newName: name });
  if (r.error) { toast('重命名失败：' + r.error, true); return; }
  toast('已重命名');
  if (state.selected === e.path) state.selected = r.path;
  await refresh();
}
async function doTrash(e) {
  // 文件秒删（花叔的选择），但删整个文件夹给一次轻确认——误删项目目录代价高
  if (e.isDir) {
    const ok = await confirmDialog(`把文件夹「${e.name}」移到废纸篓？可从废纸篓恢复。`);
    if (!ok) return;
  }
  const r = await apiPost('/api/trash', { path: e.path });
  if (r.error) { toast('删除失败：' + r.error + '（首次需在弹窗里允许控制 Finder）', true); return; }
  toast('已移到废纸篓，可从废纸篓恢复');
  if (state.selected === e.path) closePreview();
  await refresh();
}
async function doCreate(type) {
  const name = await inputDialog(type === 'dir' ? '新建文件夹' : '新建文件', '', type === 'dir' ? '文件夹名称' : '文件名（带扩展名，如 note.md）');
  if (!name) return;
  const r = await apiPost('/api/create', { path: state.cwd, name, type });
  if (r.error) { toast('新建失败：' + r.error, true); return; }
  toast(type === 'dir' ? '已新建文件夹' : '已新建文件');
  await refresh();
  // 新建文件顺手打开编辑
  if (type === 'file') { const ne = state.entries.find((x) => x.path === r.path); if (ne && ne.kind === 'text') enterEditMode(ne); }
}
// 通用输入弹窗（替代原生 prompt，配合皮肤）
function inputDialog(title, value = '', placeholder = '') {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'input-overlay';
    ov.innerHTML = `<div class="input-dialog"><div class="input-title">${escapeHtml(title)}</div>
      <input class="input-field" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" spellcheck="false">
      <div class="input-actions"><button class="ghost-btn" data-act="cancel">取消</button><button class="primary" data-act="ok">确定</button></div></div>`;
    document.body.appendChild(ov);
    const inp = ov.querySelector('.input-field');
    inp.focus();
    inp.select();
    const done = (v) => { ov.remove(); resolve(v); };
    ov.querySelector('[data-act=ok]').onclick = () => done(inp.value.trim());
    ov.querySelector('[data-act=cancel]').onclick = () => done(null);
    ov.onclick = (ev) => { if (ev.target === ov) done(null); };
    inp.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') { ev.preventDefault(); done(inp.value.trim()); }
      else if (ev.key === 'Escape') { ev.preventDefault(); done(null); }
    });
  });
}
// 是/否确认弹窗
function confirmDialog(msg) {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'input-overlay';
    ov.innerHTML = `<div class="input-dialog"><div class="input-title">${escapeHtml(msg)}</div><div class="input-actions"><button class="ghost-btn" data-act="no">取消</button><button class="primary" data-act="yes">确定</button></div></div>`;
    document.body.appendChild(ov);
    const done = (v) => { ov.remove(); document.removeEventListener('keydown', onKey, true); resolve(v); };
    function onKey(ev) { if (ev.key === 'Escape') { ev.preventDefault(); done(false); } else if (ev.key === 'Enter') { ev.preventDefault(); done(true); } }
    ov.querySelector('[data-act=yes]').onclick = () => done(true);
    ov.querySelector('[data-act=no]').onclick = () => done(false);
    ov.onclick = (ev) => { if (ev.target === ov) done(false); };
    document.addEventListener('keydown', onKey, true);
    ov.querySelector('[data-act=yes]').focus();
  });
}
// 右键上下文菜单
function closeContextMenu() { const m = $('#context-menu'); if (m) m.remove(); }
function showContextMenu(ev, e) {
  ev.preventDefault();
  closeContextMenu();
  const items = [];
  if (e.isDir) items.push({ label: '打开', fn: () => navigate(e.path) });
  else items.push({ label: '预览', fn: () => { state.selected = e.path; openPreview(e); renderFiles(); } });
  if (e.isDir) items.push({ label: '在终端打开', fn: () => term.openInDir(e.path) });
  else items.push({ label: '在所在目录开终端', fn: () => term.openInDir(dirOf(e.path)) });
  if (e.kind === 'text') items.push({ label: '编辑文本', fn: () => enterEditMode(e) });
  if (e.kind === 'image') items.push({ label: '编辑图片', fn: () => enterImageEdit(e) });
  items.push({ label: '在编辑器打开', fn: () => openWith(e.path, 'editor') });
  items.push({ label: '在 Finder 显示', fn: () => openWith(e.path, 'reveal') });
  items.push({ label: '复制路径', fn: () => copyPath(e.path) });
  items.push({ sep: true });
  items.push({ label: isFav(e.path) ? '取消收藏' : '收藏', fn: () => toggleFav(e) });
  items.push({ label: '重命名…', fn: () => doRename(e) });
  items.push({ label: '移到废纸篓', danger: true, fn: () => doTrash(e) });
  const menu = document.createElement('div');
  menu.id = 'context-menu';
  menu.className = 'context-menu';
  items.forEach((it) => {
    if (it.sep) { const s = document.createElement('div'); s.className = 'ctx-sep'; menu.appendChild(s); return; }
    const b = document.createElement('div');
    b.className = 'ctx-item' + (it.danger ? ' danger' : '');
    b.textContent = it.label;
    b.onclick = () => { closeContextMenu(); it.fn(); };
    menu.appendChild(b);
  });
  document.body.appendChild(menu);
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  menu.style.left = Math.min(ev.clientX, window.innerWidth - mw - 8) + 'px';
  menu.style.top = Math.min(ev.clientY, window.innerHeight - mh - 8) + 'px';
}

// ---------- 侧边栏 ----------
async function loadRoots() {
  const data = await api('/api/roots');
  state.home = data.home;
  state.platform = data.platform;
  state.sep = data.sep || '/';
  const ul = $('#roots-list');
  ul.innerHTML = '';
  data.roots.forEach((r) => {
    const li = document.createElement('li');
    li.dataset.path = r.path;
    li.innerHTML = `<span class="ico">${svgWrap(SVG.folder, 'currentColor', 16, true)}</span><span class="label">${r.name}</span>`;
    li.onclick = () => navigate(r.path);
    makeDraggablePath(li, r.path);
    ul.appendChild(li);
  });
}
function renderRootsActive() {
  $('#roots-list').querySelectorAll('li').forEach((li) => li.classList.toggle('active', li.dataset.path === state.cwd));
}
async function loadFavorites() {
  const data = await api('/api/favorites');
  state.favorites = data.favorites || [];
  state.recentOpened = data.recentOpened || [];
  renderFavs();
  renderRecentOpened();
}
function renderFavs() {
  const ul = $('#favs-list');
  ul.innerHTML = '';
  if (!state.favorites.length) { ul.innerHTML = '<div class="nav-empty">悬停文件点 ☆ 即可收藏</div>'; return; }
  state.favorites.forEach((f) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="ico">${svgWrap(f.isDir ? SVG.folder : SVG.file, 'currentColor', 16, f.isDir)}</span><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.name)}</span><span class="unfav" title="移除">✕</span>`;
    li.onclick = (ev) => {
      if (ev.target.classList.contains('unfav')) { toggleFav(f); return; }
      if (f.isDir) navigate(f.path);
      else navigate(dirOf(f.path)).then(() => { const e = state.entries.find((x) => x.path === f.path); if (e) { state.selected = f.path; openPreview(e); renderFiles(); } });
    };
    makeDraggablePath(li, f.path);
    ul.appendChild(li);
  });
}
function renderRecentOpened() {
  const ul = $('#recent-opened-list');
  ul.innerHTML = '';
  if (!state.recentOpened.length) { ul.innerHTML = '<div class="nav-empty">打开过的文件会出现在这里</div>'; return; }
  state.recentOpened.slice(0, 8).forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="ico">${svgWrap(SVG.file, 'currentColor', 16)}</span><span class="label">${escapeHtml(baseOf(p))}</span>`;
    li.title = p;
    li.onclick = () => openWith(p, 'default');
    ul.appendChild(li);
  });
}

// ---------- 最近修改 ----------
async function showRecent() {
  state.recentMode = true;
  state.cols = 1;
  state.cursor = -1;
  $('#file-area').innerHTML = '<div class="cmdk-loading">扫描最近修改的文件…</div>';
  renderBreadcrumb();
  const data = await api('/api/recent?root=' + encodeURIComponent(state.cwd || state.home));
  const wrap = document.createElement('div');
  wrap.className = 'list';
  const head = document.createElement('div');
  head.className = 'row list-head';
  head.innerHTML = `<div></div><div>名称</div><div>修改时间</div><div>大小</div><div></div>`;
  wrap.appendChild(head);
  state.visible = data.results;
  data.results.forEach((e, i) => {
    const row = listRow(e, i);
    row.querySelector('.fname').innerHTML = `${escapeHtml(e.name)} <span class="row-dir">· ${escapeHtml(tilde(e.dir || dirOf(e.path)))}</span>`;
    wrap.appendChild(row);
  });
  const area = $('#file-area');
  area.innerHTML = '';
  if (!data.results.length) area.innerHTML = `<div class="empty-state"><div class="big">${ic('clock', 'currentColor', 48)}</div>没找到最近修改的文件</div>`;
  else { area.appendChild(wrap); highlightCursor(); if (data.truncated) area.insertAdjacentHTML('beforeend', truncNote()); }
}
function truncNote() {
  return `<div class="trunc-note">⚠ 文件太多，结果可能不完整。进入更具体的子目录可看到全部。</div>`;
}

// ---------- 命令面板 ----------
const cmdk = {
  results: [], active: 0, timer: null, scopeAll: true,
  open() {
    $('#cmdk').classList.remove('hidden');
    this.updateScopeLabel();
    const inp = $('#cmdk-input');
    inp.value = '';
    inp.focus();
    $('#cmdk-results').innerHTML = '<div class="cmdk-loading">输入开始搜索 · 文件名模糊匹配，「内容:」搜全文</div>';
    this.results = [];
    this.active = 0;
  },
  close() { $('#cmdk').classList.add('hidden'); },
  toggleScope() { this.scopeAll = !this.scopeAll; this.updateScopeLabel(); this.search($('#cmdk-input').value); },
  root() { return this.scopeAll ? state.home : (state.cwd || state.home); },
  updateScopeLabel() {
    $('#cmdk-scope').textContent = this.scopeAll ? '全机（主目录及以下）' : '当前目录 ' + tilde(state.cwd || state.home);
    $('#scope-toggle').textContent = this.scopeAll ? '⤢ 全机' : '▢ 当前目录';
    $('#scope-toggle').classList.toggle('on', this.scopeAll);
  },
  search(q) {
    clearTimeout(this.timer);
    if (!q.trim()) { $('#cmdk-results').innerHTML = '<div class="cmdk-loading">输入开始搜索</div>'; return; }
    const isContent = /^(内容[:：]|content:)/i.test(q);
    $('#cmdk-results').innerHTML = '<div class="cmdk-loading">搜索中…</div>';
    this.timer = setTimeout(async () => {
      const root = this.root();
      let data, term;
      if (isContent) {
        term = q.replace(/^(内容[:：]|content:)/i, '').trim();
        data = await api(`/api/grep?q=${encodeURIComponent(term)}&root=${encodeURIComponent(root)}`);
        this.results = data.results.map((r) => ({ ...r, content: true }));
      } else {
        term = q.trim();
        data = await api(`/api/search?q=${encodeURIComponent(term)}&root=${encodeURIComponent(root)}`);
        this.results = data.results;
      }
      this.truncated = data.truncated;
      this.isContent = isContent;
      this.term = term;
      this.active = 0;
      this.renderResults();
    }, 150);
  },
  renderResults() {
    const ul = $('#cmdk-results');
    if (!this.results.length) { ul.innerHTML = '<div class="cmdk-loading">没有结果</div>'; return; }
    ul.innerHTML = '';
    this.results.forEach((r, i) => {
      const li = document.createElement('li');
      if (i === this.active) li.className = 'active';
      let hits = '';
      if (r.content && r.hits) hits = r.hits.map((h) => `<div class="r-hit">L${h.line}: ${hlTerm(h.text, this.term)}</div>`).join('');
      li.innerHTML = `<span class="r-icon">${iconSvg(r, 18)}</span>
        <div class="r-main">
          <div class="r-name">${this.isContent ? escapeHtml(r.name) : hlFuzzy(r.name, this.term)}</div>
          <div class="r-path">${escapeHtml(tilde(r.path))}</div>${hits}
        </div>`;
      li.onclick = () => this.choose(i, false);
      ul.appendChild(li);
    });
    if (this.truncated) ul.insertAdjacentHTML('beforeend', `<div class="cmdk-loading">⚠ 结果可能不完整，换更具体的关键词或缩小到当前目录</div>`);
    this.scrollActive();
  },
  move(d) { if (!this.results.length) return; this.active = (this.active + d + this.results.length) % this.results.length; this.renderResults(); },
  scrollActive() { const el = $('#cmdk-results').children[this.active]; if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); },
  choose(i, editor) {
    const r = this.results[i];
    if (!r) return;
    this.close();
    // ⌘↵ 对文件夹也走编辑器——找到项目名直接在 VS Code/编辑器整包打开（vibe coding 核心流）
    if (editor) { openWith(r.path, 'editor'); return; }
    if (r.isDir) { navigate(r.path); return; }
    recordRecent(r.path);
    navigate(dirOf(r.path)).then(() => {
      const entry = state.entries.find((e) => e.path === r.path) || { ...r };
      state.selected = r.path;
      openPreview(entry);
      renderFiles();
    });
  },
};
function hlFuzzy(name, q) {
  if (!q) return escapeHtml(name);
  const lower = name.toLowerCase(); const ql = q.toLowerCase();
  let qi = 0, out = '';
  for (let i = 0; i < name.length; i++) {
    if (qi < ql.length && lower[i] === ql[qi]) { out += `<mark>${escapeHtml(name[i])}</mark>`; qi++; }
    else out += escapeHtml(name[i]);
  }
  return out;
}
function hlTerm(text, term) {
  if (!term) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx < 0) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + term.length)) + '</mark>' + escapeHtml(text.slice(idx + term.length));
}

// ---------- 首次引导 ----------
function maybeShowGuide() {
  if (localStorage.getItem('fb_guided')) return;
  const ov = document.createElement('div');
  ov.className = 'guide-overlay';
  ov.innerHTML = `<div class="guide-card">
    <div class="guide-logo">${svgWrap(SVG.box, 'currentColor', 46, true)}</div>
    <h2>欢迎用翻箱 FanBox</h2>
    <p>vibe coding 的驾驶舱——找文件、跑 agent、看它改、随手改，都在一个窗口：</p>
    <ul>
      <li><b>⌘K</b> 全局搜文件和文件夹；<b>⌘↵</b> 把项目直接在编辑器整包打开；<code>内容:关键词</code> 搜文件里的字</li>
      <li>顶部 <b>终端</b> 按钮开内嵌终端跑 Claude Code 等 agent；<b>把文件/文件夹拖进终端</b> 即插入路径喂给它当上下文</li>
      <li><b>单击</b> 预览，<b>双击</b> 系统打开；预览里 <b>编辑</b> md 走所见即所得、<b>编辑图片</b> 可标注/打码/转格式</li>
      <li>agent 改了哪些文件，列表实时高亮「改·N」，不用切窗口盯着看</li>
    </ul>
    <button id="guide-ok">开始使用</button>
  </div>`;
  document.body.appendChild(ov);
  $('#guide-ok').onclick = () => { localStorage.setItem('fb_guided', '1'); ov.remove(); };
}

// ---------- 预览面板拖拽调宽 ----------
function bindResizer() {
  const handle = $('#preview-resizer');
  let dragging = false;
  handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); document.body.style.userSelect = 'none'; });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const fm = $('#filemgmt').getBoundingClientRect();
    if (term.dock === 'right') { // 预览在文件区下方 → 纵向拖
      state.previewH = Math.round(Math.min(fm.height - 120, Math.max(140, fm.bottom - e.clientY)));
    } else { // 预览在文件区右侧 → 横向拖
      state.previewW = Math.round(Math.min(fm.width - 220, Math.max(260, fm.right - e.clientX)));
    }
    applyPreviewSize();
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false; document.body.style.userSelect = '';
    localStorage.setItem('fb_preview_w', state.previewW);
    localStorage.setItem('fb_preview_h', state.previewH || 340);
  });
}

// 终端面板拖拽调整大小（底部拖高度 / 右侧拖宽度）
function bindTerminalResizer() {
  const handle = $('#terminal-resizer');
  let dragging = false;
  handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); document.body.style.userSelect = 'none'; });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const panel = $('#terminal-panel');
    const rect = $('#main-body').getBoundingClientRect();
    if (term.dock === 'bottom') {
      // 下限放宽到 8px：可把终端一路拖到铺满（文件区塌到 0，分隔条仍留在顶部可拖回）
      const h = Math.min(rect.height - 8, Math.max(80, rect.bottom - e.clientY));
      panel.style.height = Math.round(h) + 'px';
    } else {
      const w = Math.min(rect.width - 8, Math.max(160, rect.right - e.clientX));
      panel.style.width = Math.round(w) + 'px';
    }
    term.fitActive();
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false; document.body.style.userSelect = '';
    const panel = $('#terminal-panel');
    if (term.dock === 'bottom') localStorage.setItem('fb_term_h', parseInt(panel.style.height, 10) || 280);
    else localStorage.setItem('fb_term_w', parseInt(panel.style.width, 10) || 480);
  });
}

// ---------- 事件绑定 ----------
function bindEvents() {
  $('#btn-back').onclick = goBack;
  $('#btn-up').onclick = goUp;
  $('#preview-close').onclick = closePreview;
  $('#cmdk-trigger').onclick = () => cmdk.open();
  $('#btn-recent').onclick = showRecent;
  $('#btn-terminal').onclick = () => term.toggle();
  $('#term-newtab').onclick = () => term.newTab();
  $('#term-max').onclick = () => term.toggleMax();
  $('#term-dock').onclick = () => term.setDock(term.dock === 'bottom' ? 'right' : 'bottom');
  $('#term-close').onclick = () => term.close();
  $('#btn-sidebar').onclick = () => toggleSidebar();
  $('#term-follow').onclick = () => term.setFollow(!term.followBrowse);
  $('#term-locate').onclick = () => term.locateCwd();
  if (term.followBrowse) $('#term-follow').classList.add('on');
  // 终端随窗口尺寸变化重排，避免 TUI 错位
  window.addEventListener('resize', () => term.fitActive());
  if (window.ResizeObserver) new ResizeObserver(() => term.fitActive()).observe($('#xterm-host'));
  bindTerminalResizer();
  // 拖拽文件/文件夹到终端 → 插入路径
  const tp = $('#terminal-panel');
  tp.addEventListener('dragover', (ev) => {
    if (!ev.dataTransfer.types.includes('application/x-fanbox-path') && !ev.dataTransfer.types.includes('text/plain')) return;
    ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; tp.classList.add('term-drop');
  });
  tp.addEventListener('dragleave', (ev) => { if (!tp.contains(ev.relatedTarget)) tp.classList.remove('term-drop'); });
  tp.addEventListener('drop', (ev) => {
    ev.preventDefault(); tp.classList.remove('term-drop');
    const p = ev.dataTransfer.getData('application/x-fanbox-path') || ev.dataTransfer.getData('text/plain');
    if (p) term.insertPath(p);
  });
  $('#btn-new-dir').onclick = () => doCreate('dir');
  $('#btn-new-file').onclick = () => doCreate('file');
  document.addEventListener('click', (e) => { if (!e.target.closest('#context-menu')) closeContextMenu(); });
  window.addEventListener('blur', closeContextMenu);
  $('#scope-toggle').onclick = () => cmdk.toggleScope();

  $('#toggle-hidden').checked = state.showHidden;
  $('#toggle-hidden').onchange = (e) => { state.showHidden = e.target.checked; localStorage.setItem('fb_hidden', state.showHidden ? '1' : '0'); renderFiles(); };
  $('#quick-filter').oninput = (e) => { state.filter = e.target.value; state.cursor = -1; renderFiles(); };

  $('#sort-seg').querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.sort === state.sort);
    b.onclick = () => { state.sort = b.dataset.sort; localStorage.setItem('fb_sort', state.sort); $('#sort-seg').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b)); renderFiles(); };
  });
  $('#view-seg').querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === state.view);
    b.onclick = () => { state.view = b.dataset.view; localStorage.setItem('fb_view', state.view); $('#view-seg').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b)); updateGridSizeVisibility(); renderFiles(); };
  });
  $('#gridsize-seg').querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.gridSize);
    b.onclick = () => { state.gridSize = b.dataset.size; localStorage.setItem('fb_gridsize', state.gridSize); $('#gridsize-seg').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b)); renderFiles(); };
  });
  updateGridSizeVisibility();

  $('#cmdk-input').oninput = (e) => cmdk.search(e.target.value);
  $('#cmdk').onclick = (e) => { if (e.target.id === 'cmdk') cmdk.close(); };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#context-menu')) { closeContextMenu(); return; }
    const cmdkOpen = !$('#cmdk').classList.contains('hidden');
    const lbOpen = !!document.querySelector('.lightbox');
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); cmdkOpen ? cmdk.close() : cmdk.open(); return; }
    if (cmdkOpen) {
      if (e.key === 'Escape') cmdk.close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); cmdk.move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cmdk.move(-1); }
      else if (e.key === 'Tab') { e.preventDefault(); cmdk.toggleScope(); }
      else if (e.key === 'Enter') { e.preventDefault(); cmdk.choose(cmdk.active, e.metaKey || e.ctrlKey); }
      return;
    }
    if (lbOpen) { if (e.key === 'Escape') document.querySelector('.lightbox').remove(); return; }
    if (imgEditState && (e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); ieUndo(imgEditState); return; }
    const inInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === 'Escape' && !$('#preview').classList.contains('hidden')) { closePreview(); return; }
    if (e.key === '/' && !inInput) { e.preventDefault(); $('#quick-filter').focus(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === '[') { e.preventDefault(); goBack(); return; }
    if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B') && !inInput) { e.preventDefault(); toggleSidebar(); return; }
    if (inInput) return;
    // 主区键盘导航
    if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(state.cols); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveCursor(-state.cols); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveCursor(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveCursor(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); cursorEnter(e.metaKey || e.ctrlKey); }
    else if (e.key === 'Backspace') { e.preventDefault(); goUp(); }
  });
}
function updateGridSizeVisibility() {
  $('#gridsize-seg').style.display = state.view === 'grid' ? '' : 'none';
}

// ---------- 主题 / 皮肤 ----------
function applyTheme(skin, rerender = true) {
  if (!['terminal', 'warm', 'editorial'].includes(skin)) skin = 'terminal';
  state.theme = skin;
  document.documentElement.dataset.theme = skin;
  localStorage.setItem('fb_theme', skin);
  const link = document.getElementById('hljs-theme');
  if (link) link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11/styles/' + (skin === 'terminal' ? 'github-dark' : 'github') + '.min.css';
  document.querySelectorAll('#theme-switch .theme-seg button').forEach((b) => b.classList.toggle('active', b.dataset.skin === skin));
  if (typeof term !== 'undefined' && term.sessions.length) term.retheme();
  if (typeof mona !== 'undefined') mona.retheme();
  if (rerender && state.entries.length) {
    renderFiles();
    // 预览里的代码高亮配色随皮肤切换，重渲染当前选中项
    if (state.selected && !$('#preview').classList.contains('hidden')) {
      const e = state.entries.find((x) => x.path === state.selected);
      if (e) openPreview(e);
    }
  }
}

// ---------- 内嵌终端（仅桌面 app；浏览器版优雅降级）----------
const term = {
  sessions: [], seq: 0, active: null, maximized: false,
  dock: localStorage.getItem('fb_term_dock') || 'bottom',
  followBrowse: localStorage.getItem('fb_term_follow') === '1',
  available() { return !!(window.fanboxPty && window.Terminal && !window.__noXterm); },
  // 每套皮肤一整套手调 ANSI 主题——暗皮肤暗终端、亮皮肤亮终端，不再出现「暖纸里嵌黑块」
  themes: {
    terminal: {
      background: '#0b0c0a', foreground: '#d6dac9', cursor: '#cdf24b', cursorAccent: '#0b0c0a', selectionBackground: '#cdf24b40',
      black: '#1c1e17', red: '#e8825b', green: '#cdf24b', yellow: '#e8c95b', blue: '#7bc9e8', magenta: '#d68ad6', cyan: '#5bd6c0', white: '#d6dac9',
      brightBlack: '#62655a', brightRed: '#ff9b73', brightGreen: '#dcff66', brightYellow: '#ffe082', brightBlue: '#9ad8ff', brightMagenta: '#f0a8f0', brightCyan: '#7fffe0', brightWhite: '#f2f2ea',
    },
    warm: {
      background: '#ece2d2', foreground: '#4a3f30', cursor: '#cc785c', cursorAccent: '#ece2d2', selectionBackground: '#cc785c33',
      black: '#3a3025', red: '#b5502f', green: '#5f7a36', yellow: '#9a7b2e', blue: '#3a6a8a', magenta: '#9a5a7a', cyan: '#3a7a70', white: '#6b6355',
      brightBlack: '#8a7d68', brightRed: '#c75f38', brightGreen: '#6f8a40', brightYellow: '#b08a30', brightBlue: '#4a7a9a', brightMagenta: '#aa6a8a', brightCyan: '#4a8a82', brightWhite: '#3a3025',
    },
    editorial: {
      background: '#eae5d8', foreground: '#1a1a1a', cursor: '#ff433d', cursorAccent: '#eae5d8', selectionBackground: '#ff433d22',
      black: '#0a0a0a', red: '#cc1f1a', green: '#00803a', yellow: '#8a6d00', blue: '#0000cc', magenta: '#9a2a8a', cyan: '#007a8a', white: '#57534a',
      brightBlack: '#57534a', brightRed: '#e8302a', brightGreen: '#00a33e', brightYellow: '#a67c00', brightBlue: '#2222dd', brightMagenta: '#b03aa0', brightCyan: '#008a9a', brightWhite: '#0a0a0a',
    },
  },
  theme() { return this.themes[state.theme] || this.themes.terminal; },
  toggle() {
    if (!this.available()) { if (state.cwd) openWith(state.cwd, 'terminal'); return; } // 浏览器降级到系统终端
    const hidden = $('#terminal-panel').classList.contains('hidden');
    hidden ? this.open() : this.close();
  },
  open() {
    $('#terminal-panel').classList.remove('hidden');
    $('#terminal-resizer').classList.remove('hidden');
    this.applyDock();
    if (!this.sessions.length) this.newTab();
    else this.fitActive();
    $('#btn-terminal').classList.add('active');
    localStorage.setItem('fb_term_open', '1');
    if (!localStorage.getItem('fb_term_draghint')) { localStorage.setItem('fb_term_draghint', '1'); setTimeout(() => toast('提示：把左侧文件 / 文件夹拖进终端，即插入路径喂给 agent'), 700); }
  },
  close() {
    $('#terminal-panel').classList.add('hidden');
    $('#terminal-resizer').classList.add('hidden');
    $('#btn-terminal').classList.remove('active');
    localStorage.setItem('fb_term_open', '0');
  },
  applyDock() {
    const mb = $('#main-body');
    mb.classList.toggle('dock-bottom', this.dock === 'bottom');
    mb.classList.toggle('dock-right', this.dock === 'right');
    const panel = $('#terminal-panel');
    if (this.dock === 'bottom') { panel.style.height = (Number(localStorage.getItem('fb_term_h')) || 280) + 'px'; panel.style.width = ''; }
    else { panel.style.width = (Number(localStorage.getItem('fb_term_w')) || 480) + 'px'; panel.style.height = ''; }
    applyPreviewSize(); // 预览随 dock 翻转轴向
    this.fitActive();
  },
  setDock(d) { animateLayout(); this.dock = d; localStorage.setItem('fb_term_dock', d); this.applyDock(); },
  // 终端最大化：铺满整个中区（文件区让位），再点还原
  toggleMax(force) {
    animateLayout();
    this.maximized = force === undefined ? !this.maximized : force;
    $('#main-body').classList.toggle('term-max', this.maximized);
    const b = $('#term-max');
    if (b) { b.classList.toggle('on', this.maximized); b.title = this.maximized ? '还原终端' : '终端铺满'; }
    this.fitActive();
  },
  // 在指定目录开终端（新标签）；浏览器版降级到系统终端
  openInDir(dir) {
    if (!this.available()) { openWith(dir, 'terminal'); return; }
    $('#terminal-panel').classList.remove('hidden');
    $('#terminal-resizer').classList.remove('hidden');
    this.applyDock();
    $('#btn-terminal').classList.add('active');
    this.newTab(dir);
  },
  // 拖拽文件/文件夹进来：把 shell 转义后的路径插入活动终端（作为 agent 上下文）
  insertPath(p) {
    if (!this.available()) { openWith(dirOf(p), 'terminal'); return; }
    const wasHidden = $('#terminal-panel').classList.contains('hidden');
    if (wasHidden) this.open();
    const write = () => { if (this.active) window.fanboxPty.input(this.active, shQuote(p) + ' '); const s = this.sessions.find((x) => x.id === this.active); if (s) s.xterm.focus(); };
    if (wasHidden) setTimeout(write, 280); else write();
  },
  // 点终端里的文件名/路径 → 结合 cwd + 搜索定位真实文件，在翻箱里打开
  async openTermPath(id, raw) {
    let p = String(raw).replace(/[)\]'"`,.:;]+$/, '');
    let cwd = state.cwd;
    let candidate = p;
    if (!p.startsWith('/') && !p.startsWith('~')) {
      try { const r = await window.fanboxPty.cwd(id); if (r && r.ok && r.cwd) cwd = r.cwd; } catch { /* */ }
      candidate = (cwd || '').replace(/\/$/, '') + '/' + p.replace(/^\.\//, '');
    }
    const name = p.split('/').pop();
    const q = encodeURIComponent;
    const r = await api(`/api/locate?path=${q(candidate)}&name=${q(name)}&root=${q(cwd || state.home)}`);
    if (!r.found) { toast('没找到「' + name + '」', true); return; }
    if (r.isDir) { navigate(r.path); toast('已跳到该目录'); return; }
    await navigate(dirOf(r.path));
    const e = state.entries.find((x) => x.path === r.path) || { path: r.path, name: baseOf(r.path), kind: 'text', isDir: false };
    applySelection(r.path); openPreview(e); recordRecent(r.path);
    toast(r.viaSearch ? '未精确命中，已打开最接近的「' + baseOf(r.path) + '」' : '已打开');
  },
  // 终端跟随浏览：把活动终端 cd 到指定目录
  syncCd(dir) {
    if (!this.active || !dir) return;
    window.fanboxPty.input(this.active, 'cd ' + shQuote(dir) + '\r');
  },
  setFollow(on) {
    this.followBrowse = on;
    localStorage.setItem('fb_term_follow', on ? '1' : '0');
    $('#term-follow').classList.toggle('on', on);
    if (on && this.active && state.cwd) this.syncCd(state.cwd);
  },
  // 定位文件区到活动终端的真实目录
  async locateCwd() {
    if (!this.active) return;
    const r = await window.fanboxPty.cwd(this.active);
    if (r && r.ok && r.cwd) navigate(r.cwd);
    else toast('取终端目录失败', true);
  },
  async newTab(cwdOverride) {
    const startDir = cwdOverride || state.cwd;
    const id = 't' + (++this.seq);
    const host = document.createElement('div');
    host.className = 'xterm-instance';
    $('#xterm-host').appendChild(host);
    const FitCtor = window.FitAddon ? (window.FitAddon.FitAddon || window.FitAddon) : null;
    const xterm = new window.Terminal({
      fontFamily: getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace',
      fontSize: 13, lineHeight: 1.2, cursorBlink: true, theme: this.theme(), scrollback: 5000,
      allowProposedApi: true, // unicode11 宽度 API 需要
    });
    const fit = FitCtor ? new FitCtor() : null;
    if (fit) xterm.loadAddon(fit);
    // CJK 宽字符正确宽度：没有它，中文目录名会让 zsh 提示符重绘错列（乱码）
    if (!window.__noUnicode11 && window.Unicode11Addon) {
      try { const U = window.Unicode11Addon.Unicode11Addon || window.Unicode11Addon; xterm.loadAddon(new U()); xterm.unicode.activeVersion = '11'; } catch { /* */ }
    }
    xterm.open(host);
    // WebGL 渲染加速（大输出/TUI 不掉帧），失败或上下文丢失回退 DOM
    if (!window.__noWebgl && window.WebglAddon) {
      try {
        const Wg = window.WebglAddon.WebglAddon || window.WebglAddon;
        const wg = new Wg();
        wg.onContextLoss(() => { try { wg.dispose(); } catch { /* */ } });
        xterm.loadAddon(wg);
      } catch { /* 回退默认 DOM renderer */ }
    }
    if (fit) try { fit.fit(); } catch { /* */ }
    const sess = { id, xterm, fit, host, dead: false, startDir, title: baseOf(startDir || '') || 'shell' };
    this.sessions.push(sess);
    this.activate(id);
    const r = await window.fanboxPty.spawn({ id, cwd: startDir, cols: xterm.cols, rows: xterm.rows });
    if (!r.ok) { xterm.write('\r\n  \x1b[31m终端启动失败：' + (r.error || '') + '\x1b[0m\r\n'); }
    xterm.onData((d) => {
      if (sess.dead) { if (d === '\r' || d === '\n') this.respawn(sess); return; } // 进程退出后回车真重开
      window.fanboxPty.input(id, d);
    });
    xterm.onResize(({ cols, rows }) => window.fanboxPty.resize(id, cols, rows));
    // 识别终端输出里的文件路径 → hover 高亮 + 点击在翻箱打开
    if (xterm.registerLinkProvider) {
      xterm.registerLinkProvider({
        provideLinks: (lineNo, cb) => {
          const ln = xterm.buffer.active.getLine(lineNo - 1);
          if (!ln) { cb(undefined); return; }
          const text = ln.translateToString(true);
          const re = /(~\/[^\s'"`:]+|\/[^\s'"`:()]+|\.{1,2}\/[^\s'"`:]+|\b[\w.\-]+\.[A-Za-z][A-Za-z0-9]{0,7}\b)/g;
          const links = []; let m;
          while ((m = re.exec(text)) !== null) {
            const raw = m[0];
            if (raw.length < 3) continue;
            links.push({
              range: { start: { x: m.index + 1, y: lineNo }, end: { x: m.index + raw.length, y: lineNo } },
              text: raw,
              decorations: { pointerCursor: true, underline: true },
              activate: () => this.openTermPath(id, raw),
            });
          }
          cb(links.length ? links : undefined);
        },
      });
    }
    this.renderTabs();
  },
  async respawn(sess) {
    sess.dead = false;
    sess.xterm.reset(); // 清掉死亡残留，新 shell 提示符不和旧画面叠在一起
    const r = await window.fanboxPty.spawn({ id: sess.id, cwd: sess.startDir || state.cwd, cols: sess.xterm.cols, rows: sess.xterm.rows });
    if (!r.ok) { sess.dead = true; sess.xterm.write('\x1b[31m重开失败：' + (r.error || '') + '\x1b[0m\r\n'); }
  },
  activate(id) {
    this.active = id;
    this.sessions.forEach((s) => s.host.classList.toggle('show', s.id === id));
    this.renderTabs();
    const s = this.sessions.find((x) => x.id === id);
    if (s) { this.fitActive(); setTimeout(() => s.xterm.focus(), 0); }
  },
  closeTab(id) {
    const i = this.sessions.findIndex((x) => x.id === id);
    if (i < 0) return;
    const s = this.sessions[i];
    try { window.fanboxPty.kill(id); } catch { /* */ }
    try { s.xterm.dispose(); } catch { /* */ }
    s.host.remove();
    this.sessions.splice(i, 1);
    if (!this.sessions.length) { this.close(); return; }
    if (this.active === id) this.activate(this.sessions[Math.max(0, i - 1)].id);
    else this.renderTabs();
  },
  fitActive() {
    const s = this.sessions.find((x) => x.id === this.active);
    if (!s || !s.fit) return;
    requestAnimationFrame(() => { try { s.fit.fit(); } catch { /* */ } });
  },
  renderTabs() {
    const bar = $('#term-tabs');
    bar.innerHTML = '';
    this.sessions.forEach((s) => {
      const t = document.createElement('div');
      t.className = 'term-tab' + (s.id === this.active ? ' active' : '');
      t.innerHTML = `${ic('term', 'currentColor', 12)}<span>${escapeHtml(s.title)}</span><span class="tab-x" title="关闭">✕</span>`;
      t.onclick = (e) => { if (e.target.classList.contains('tab-x')) { this.closeTab(s.id); return; } this.activate(s.id); };
      bar.appendChild(t);
    });
  },
  retheme() { const th = this.theme(); this.sessions.forEach((s) => { s.xterm.options.theme = th; }); },
};

// ---------- Monaco 编辑器（本地 vendor，离线可用；加载失败回退 textarea）----------
const mona = {
  editor: null, _p: null,
  themeFor: { terminal: 'fb-dark', warm: 'fb-paper', editorial: 'fb-editorial' },
  themeName() { return this.themeFor[state.theme] || 'fb-dark'; },
  // 散文类（md/txt/字幕）默认软换行，代码不换行
  wraps(ex) { return ['md', 'markdown', 'txt', 'log', 'srt', 'vtt', 'ass'].includes(ex); },
  lang(ex) {
    const m = {
      js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      json: 'json', json5: 'json', jsonc: 'json', md: 'markdown', markdown: 'markdown', html: 'html', htm: 'html', vue: 'html',
      css: 'css', scss: 'scss', less: 'less', py: 'python', go: 'go', rs: 'rust', java: 'java', rb: 'ruby', php: 'php',
      c: 'c', cpp: 'cpp', cc: 'cpp', h: 'cpp', hpp: 'cpp', cs: 'csharp', sh: 'shell', bash: 'shell', zsh: 'shell',
      yml: 'yaml', yaml: 'yaml', toml: 'ini', ini: 'ini', conf: 'ini', xml: 'xml', sql: 'sql', swift: 'swift', lua: 'lua', kt: 'kotlin', dart: 'dart', r: 'r',
    };
    return m[ex] || 'plaintext';
  },
  load() {
    if (this._p) return this._p;
    if (window.__noMonaco) return Promise.resolve(null);
    this._p = new Promise((resolve) => {
      if (window.monaco) { resolve(window.monaco); return; }
      // 语言服务 worker 走 blob 代理（同源），无 worker 也能用基础高亮
      window.MonacoEnvironment = {
        getWorkerUrl() {
          return URL.createObjectURL(new Blob([
            `self.MonacoEnvironment={baseUrl:'${location.origin}/vendor/monaco/'};importScripts('${location.origin}/vendor/monaco/vs/base/worker/workerMain.js');`,
          ], { type: 'text/javascript' }));
        },
      };
      const s = document.createElement('script');
      s.src = '/vendor/monaco/vs/loader.js';
      s.onload = () => {
        try {
          window.require.config({ paths: { vs: '/vendor/monaco/vs' } });
          window.require(['vs/editor/editor.main'], () => { this.defineThemes(window.monaco); resolve(window.monaco); }, () => resolve(null));
        } catch { resolve(null); }
      };
      s.onerror = () => { window.__noMonaco = 1; resolve(null); };
      document.head.appendChild(s);
    });
    return this._p;
  },
  // 三皮肤各配一套编辑器配色，和文件区、终端区同呼吸
  defineThemes(m) {
    m.editor.defineTheme('fb-dark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#0b0c0a', 'editor.foreground': '#d6dac9', 'editorLineNumber.foreground': '#4a4d42', 'editorCursor.foreground': '#cdf24b', 'editor.selectionBackground': '#cdf24b33', 'editor.lineHighlightBackground': '#ffffff08' } });
    m.editor.defineTheme('fb-paper', { base: 'vs', inherit: true, rules: [], colors: { 'editor.background': '#ece2d2', 'editor.foreground': '#4a3f30', 'editorLineNumber.foreground': '#b3a589', 'editorCursor.foreground': '#cc785c', 'editor.selectionBackground': '#cc785c33', 'editor.lineHighlightBackground': '#00000008' } });
    m.editor.defineTheme('fb-editorial', { base: 'vs', inherit: true, rules: [], colors: { 'editor.background': '#eae5d8', 'editor.foreground': '#1a1a1a', 'editorLineNumber.foreground': '#9a958a', 'editorCursor.foreground': '#ff433d', 'editor.selectionBackground': '#ff433d22', 'editor.lineHighlightBackground': '#00000008' } });
  },
  retheme() { if (this.editor && window.monaco) window.monaco.editor.setTheme(this.themeName()); },
  disposeIfAny() { if (this.editor) { try { this.editor.dispose(); } catch { /* */ } this.editor = null; } },
};

// ---------- Milkdown Crepe（Notion 式所见即所得 Markdown；本地 vendor，离线可用）----------
const crepe = {
  editor: null, _p: null,
  load() {
    if (this._p) return this._p;
    if (window.__noCrepe) return Promise.resolve(null);
    this._p = new Promise((resolve) => {
      if (window.FanboxCrepe) { resolve(window.FanboxCrepe); return; }
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = '/vendor/milkdown/milkdown.css';
      document.head.appendChild(link);
      const s = document.createElement('script'); s.src = '/vendor/milkdown/milkdown.js';
      s.onload = () => resolve(window.FanboxCrepe || null);
      s.onerror = () => { window.__noCrepe = 1; resolve(null); };
      document.head.appendChild(s);
    });
    return this._p;
  },
  disposeIfAny() { if (this.editor) { try { this.editor.destroy(); } catch { /* */ } this.editor = null; } },
};

// pty 数据回流（全局一次）
if (window.fanboxPty) {
  window.fanboxPty.onData(({ id, data }) => { const s = term.sessions.find((x) => x.id === id); if (s) s.xterm.write(data); });
  window.fanboxPty.onExit(({ id }) => { const s = term.sessions.find((x) => x.id === id); if (s) { s.dead = true; s.xterm.write('\r\n\x1b[90m[进程已退出 — 回车重开，或 ✕ 关闭]\x1b[0m\r\n'); } });
}
// 文件变化 → 自动刷新列表（看着 agent 干活）；编辑中不动预览，避免吞掉未保存内容
if (window.fanboxFs) {
  let rt = null;
  state.changed = new Map(); // 顶层名 → { count, files:Set, ts }
  let sweep = null;
  const scheduleSweep = () => {
    if (sweep) return;
    sweep = setInterval(() => {
      const now = Date.now(); let dirty = false;
      for (const [k, v] of state.changed) { if (now - v.ts > 4500) { state.changed.delete(k); dirty = true; } }
      if (!state.changed.size) { clearInterval(sweep); sweep = null; }
      if (dirty) renderFiles();
    }, 1000); // 单一清理定时器，避免大批量变更时堆积成千上万个 timer
  };
  window.fanboxFs.onChanged(({ dir, filename }) => {
    if (dir !== state.cwd || state.recentMode) return;
    // 高亮被 agent 改动的项：递归监听下 src/foo.js 归到顶层 src，并累计计数 + 记子路径供 tooltip 定位
    if (filename) {
      const sub = String(filename);
      const top = sub.split('/')[0];
      let rec = state.changed.get(top);
      if (!rec) { rec = { count: 0, files: new Set(), ts: 0 }; state.changed.set(top, rec); }
      rec.count++; rec.ts = Date.now();
      if (rec.files.size < 8 && sub !== top) rec.files.add(sub);
      scheduleSweep();
    }
    clearTimeout(rt);
    rt = setTimeout(async () => {
      await refresh();
      if (state.selected && !$('#preview').classList.contains('hidden') && !$('#ed-host') && !imgEditState) {
        const e = state.entries.find((x) => x.path === state.selected);
        if (e && (e.kind === 'text' || e.kind === 'image')) openPreview(e);
      }
    }, 250);
  });
}

// ---------- 启动 ----------
async function init() {
  // 桌面 app：标记 body，给顶部交通灯留位、顶部可拖拽
  if (window.fanboxEnv && window.fanboxEnv.isDesktopApp) document.documentElement.classList.add('desktop');
  applyTheme(state.theme, false);
  if (state.sidebarCollapsed) { $('#app').classList.add('sidebar-collapsed'); $('#btn-sidebar')?.classList.add('on'); }
  applyLayout();
  term.applyDock(); // 初始就给 #main-body 设好 dock 类，决定预览/文件管理方向
  bindEvents();
  bindResizer();
  document.querySelectorAll('#theme-switch .theme-seg button').forEach((b) => { b.onclick = () => applyTheme(b.dataset.skin); });
  await loadRoots();
  await loadFavorites();
  await navigate(state.home, false);
  // 恢复上次终端开合状态（dock 方位已由 applyDock 自带记忆）
  if (localStorage.getItem('fb_term_open') === '1' && term.available()) term.open();
  maybeShowGuide();
}
init();
