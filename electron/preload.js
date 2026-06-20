'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// ---------- 终端（node-pty）----------
contextBridge.exposeInMainWorld('fanboxPty', {
  spawn: (opts) => ipcRenderer.invoke('pty:spawn', opts),
  input: (id, data) => ipcRenderer.send('pty:input', { id, data }),
  resize: (id, cols, rows) => ipcRenderer.send('pty:resize', { id, cols, rows }),
  kill: (id) => ipcRenderer.send('pty:kill', { id }),
  cwd: (id) => ipcRenderer.invoke('pty:cwd', { id }),
  proc: (id) => ipcRenderer.invoke('pty:proc', { id }),
  onData: (cb) => ipcRenderer.on('pty:data', (e, d) => cb(d)),
  onExit: (cb) => ipcRenderer.on('pty:exit', (e, d) => cb(d)),
});

// ---------- 文件监听 ----------
contextBridge.exposeInMainWorld('fanboxFs', {
  watch: (dir) => ipcRenderer.invoke('fs:watch', { dir }),
  watchSet: (dirs) => ipcRenderer.invoke('fs:watch-set', { dirs }),
  onChange: (cb) => ipcRenderer.on('fs:changed', (e, d) => cb(d)),
  onChanged: (cb) => ipcRenderer.on('fs:changed', (e, d) => cb(d)),
});

// ---------- 拖拽落盘 ----------
contextBridge.exposeInMainWorld('fanboxDrop', {
  saveTemp: (name, buf) => ipcRenderer.invoke('drop:save', { name, buf }),
  saveInto: (dir, name, buf) => ipcRenderer.invoke('drop:save-into', { dir, name, buf }),
  copyInto: (srcPath, dir) => ipcRenderer.invoke('drop:copy-into', { srcPath, dir }),
  pathForFile: (f) => (f && f.path) || null,
});

// ---------- 剪贴板 ----------
contextBridge.exposeInMainWorld('fanboxClipboard', {
  copyImage: (p) => ipcRenderer.invoke('clip:image', { path: p }),
  copyFile: (p) => ipcRenderer.invoke('clip:file', { path: p }),
});

// ---------- 截图直通车 ----------
contextBridge.exposeInMainWorld('fanboxShot', {
  onNew: (cb) => ipcRenderer.on('shot:new', (e, m) => cb(m)),
});

// ---------- 微信 ClawBot ----------
contextBridge.exposeInMainWorld('fanboxWechat', {
  env: () => ipcRenderer.invoke('wechat:env'),
  setTarget: (id) => ipcRenderer.invoke('wechat:setTarget', { target: id }),
  setCwd: (dir) => ipcRenderer.invoke('wechat:setCwd', { dir }),
  setPersona: (p) => ipcRenderer.invoke('wechat:setPersona', { persona: p }),
  send: (text) => ipcRenderer.invoke('wechat:send', { text }),
  conversation: (id) => ipcRenderer.invoke('wechat:conversation', { id }),
  newConversation: (id) => ipcRenderer.invoke('wechat:newConversation', { id }),
  compact: (id) => ipcRenderer.invoke('wechat:compact', { id }),
  login: () => ipcRenderer.invoke('wechat:login'),
  disconnect: () => ipcRenderer.invoke('wechat:disconnect'),
  cancel: () => ipcRenderer.invoke('wechat:cancel'),
  check: () => ipcRenderer.invoke('wechat:check'),
  setStayAwake: (on) => ipcRenderer.invoke('wechat:setStayAwake', { on }),
  powerState: () => ipcRenderer.invoke('wechat:powerState'),
  onMessage: (cb) => { const handler = () => cb(); ipcRenderer.on('wechat:message', handler); return () => ipcRenderer.removeListener('wechat:message', handler); },
  onQr: (cb) => { const handler = (e, m) => cb(m); ipcRenderer.on('wechat:qr', handler); return () => ipcRenderer.removeListener('wechat:qr', handler); },
  onConnected: (cb) => { const handler = () => cb(); ipcRenderer.on('wechat:connected', handler); return () => ipcRenderer.removeListener('wechat:connected', handler); },
  onExpired: (cb) => { const handler = () => cb(); ipcRenderer.on('wechat:expired', handler); return () => ipcRenderer.removeListener('wechat:expired', handler); },
  onPower: (cb) => { const handler = (e, m) => cb(m); ipcRenderer.on('wechat:power', handler); return () => ipcRenderer.removeListener('wechat:power', handler); },
});

// ---------- 录制文件管理 ----------
contextBridge.exposeInMainWorld('fanboxRec', {
  list: () => ipcRenderer.invoke('rec:list'),
  read: (p) => ipcRenderer.invoke('rec:read', { path: p }),
  remove: (p) => ipcRenderer.invoke('rec:delete', { path: p }),
  reveal: (p) => ipcRenderer.invoke('rec:reveal', { path: p }),
  export: (name, buf, format) => ipcRenderer.invoke('rec:export', { name, buf, format }),
  saveExport: (name, buf) => ipcRenderer.invoke('rec:save-export', { name, buf }),
});

// ---------- 窗口控制 ----------
contextBridge.exposeInMainWorld('fanboxWin', {
  focus: () => ipcRenderer.invoke('win:focus'),
  trafficLights: (show) => ipcRenderer.invoke('win:traffic', { show }),
});

// ---------- 环境信息 ----------
contextBridge.exposeInMainWorld('fanboxEnv', {
  platform: process.platform,
  isDesktopApp: true,
});

// ---------- 更新 ----------
contextBridge.exposeInMainWorld('fanboxUpdate', {
  get: () => ipcRenderer.invoke('update:get'),
  open: (url) => ipcRenderer.invoke('update:open', { url }),
  onAvailable: (cb) => { const handler = (e, m) => cb(m); ipcRenderer.on('update:available', handler); return () => ipcRenderer.removeListener('update:available', handler); },
});
