'use strict';
/**
 * FanBox — 跨平台环境变量重建
 *
 * 用户没有终端环境变量（App 从 Finder/Dock 启动），拿到的 PATH 很残缺、
 * 没有代理、没有 ANTHROPIC_BASE_URL 等自定义配置，claude/codex 子进程就会
 * 找不到命令、连不上 api、报 403 等各种诡异错误。
 *
 * 解决：用「用户平时用的 shell」登录式跑一遍 env，抓到的环境和用户平时在
 * 终端里跑 claude/codex 的完全一致。不需要任何特定的配置文件格式。
 *
 * macOS: $SHELL -ilc 'env'（读 .zshrc/.bash_profile/fish config 等）
 * Windows: PowerShell 获取环境变量 + 注册表读取代理
 *
 * 补充：如果用户没有配置代理，读取系统代理（macOS: scutil --proxy，Windows: 注册表）
 */
const { execFile, exec } = require('child_process');
const path = require('path');

let cached = null; // Promise<env 对象>，只跑一次后缓存

const PROXY_KEYS = ['https_proxy', 'HTTPS_PROXY', 'http_proxy', 'HTTP_PROXY', 'all_proxy', 'ALL_PROXY'];

/**
 * 获取用户 shell 路径
 */
function userShell() {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/zsh';
}

/**
 * macOS/Linux: 用 $SHELL -ilc 'env' 抓登录式 shell 环境变量
 * 包含用户 PATH、代理、BASE_URL 等
 */
function dumpShellEnvUnix() {
  return new Promise((resolve) => {
    // 用两个 marker 包住 env 输出，防止 .zshrc 里的 echo/打印等干扰解析
    const marker = '__FANBOX_ENV_8f3a__';
    const cmd = `printf '%s\\n' '${marker}'; env; printf '%s\\n' '${marker}'`;
    execFile(userShell(), ['-ilc', cmd], { timeout: 8000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => {
      const out = String(stdout || '');
      const seg = out.split(marker)[1] || ''; // 取两个 marker 之间的大段 env 输出
      const env = {};
      for (const line of seg.split('\n')) {
        const i = line.indexOf('=');
        if (i > 0) env[line.slice(0, i)] = line.slice(i + 1);
      }
      resolve(env); // 抓不到（err）也不致命，后续用终端环境 process.env 兜底
    });
  });
}

/**
 * Windows: 用 PowerShell 获取所有环境变量（用户级 + 系统级）
 */
function dumpShellEnvWindows() {
  return new Promise((resolve) => {
    // PowerShell 命令：获取所有环境变量并输出为 KEY=VALUE 格式
    const psCmd = '[Environment]::GetEnvironmentVariables([EnvironmentVariableTarget]::Machine).GetEnumerator() + [Environment]::GetEnvironmentVariables([EnvironmentVariableTarget]::User).GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }';
    
    exec(`powershell.exe -NoProfile -NonInteractive -Command "${psCmd}"`, { 
      timeout: 8000, 
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true 
    }, (err, stdout) => {
      if (err) {
        // 降级：尝试用 cmd.exe 的 set 命令
        exec('cmd.exe /c set', { timeout: 5000, windowsHide: true }, (err2, stdout2) => {
          if (err2) return resolve({});
          const env = {};
          for (const line of String(stdout2 || '').split('\n')) {
            const i = line.indexOf('=');
            if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
          }
          resolve(env);
        });
        return;
      }
      
      const env = {};
      for (const line of String(stdout || '').split('\n')) {
        const trimmed = line.trim();
        const i = trimmed.indexOf('=');
        if (i > 0) env[trimmed.slice(0, i)] = trimmed.slice(i + 1);
      }
      resolve(env);
    });
  });
}

/**
 * 获取 shell 环境变量（跨平台）
 */
function dumpShellEnv() {
  if (process.platform === 'win32') {
    return dumpShellEnvWindows();
  }
  return dumpShellEnvUnix();
}

/**
 * macOS: 读取系统代理设置
 */
function sysProxyEnvDarwin() {
  return new Promise((resolve) => {
    execFile('scutil', ['--proxy'], { timeout: 3000 }, (err, stdout) => {
      if (err) return resolve({});
      const out = String(stdout || '');
      const grab = (k) => (out.match(new RegExp(`\\b${k} : (\\S+)`)) || [])[1];
      let url = '';
      if (grab('HTTPSEnable') === '1') url = `http://${grab('HTTPSProxy')}:${grab('HTTPSPort')}`;
      else if (grab('HTTPEnable') === '1') url = `http://${grab('HTTPProxy')}:${grab('HTTPPort')}`;
      else if (grab('SOCKSEnable') === '1') url = `socks5h://${grab('SOCKSProxy')}:${grab('SOCKSPort')}`;
      if (!url) return resolve({});
      resolve({ http_proxy: url, https_proxy: url, HTTP_PROXY: url, HTTPS_PROXY: url, all_proxy: url, ALL_PROXY: url });
    });
  });
}

/**
 * Windows: 从注册表读取系统代理设置
 */
function sysProxyEnvWindows() {
  return new Promise((resolve) => {
    // 读取 IE 代理设置（Windows 系统代理标准位置）
    const psCmd = `
      $regPath = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'
      $proxyEnable = Get-ItemProperty -Path $regPath -Name ProxyEnable -ErrorAction SilentlyContinue
      if ($proxyEnable.ProxyEnable -eq 1) {
        $proxyServer = Get-ItemProperty -Path $regPath -Name ProxyServer -ErrorAction SilentlyContinue
        if ($proxyServer.ProxyServer) {
          $url = if ($proxyServer.ProxyServer -match '^http') { $proxyServer.ProxyServer } else { "http://$($proxyServer.ProxyServer)" }
          Write-Output $url
        }
      }
    `;
    
    exec(`powershell.exe -NoProfile -NonInteractive -Command "${psCmd.replace(/"/g, '\\"')}"`, { 
      timeout: 3000, 
      windowsHide: true 
    }, (err, stdout) => {
      if (err) return resolve({});
      const url = String(stdout || '').trim();
      if (!url) return resolve({});
      resolve({ 
        http_proxy: url, 
        https_proxy: url, 
        HTTP_PROXY: url, 
        HTTPS_PROXY: url, 
        all_proxy: url, 
        ALL_PROXY: url 
      });
    });
  });
}

/**
 * 获取系统代理（跨平台）
 */
function sysProxyEnv() {
  if (process.platform === 'win32') {
    return sysProxyEnvWindows();
  }
  if (process.platform === 'darwin') {
    return sysProxyEnvDarwin();
  }
  // Linux: 通常从环境变量获取，不读系统设置
  return Promise.resolve({});
}

/**
 * 构建完整环境变量
 */
async function build() {
  const shellEnv = await dumpShellEnv();
  const env = { ...process.env, ...shellEnv }; // process.env 兜底，shell 获取的覆盖（PATH/代理/BASE_URL/key 等）
  
  // 如果没有代理配置，读取系统代理补充（macOS/Windows 都支持）
  if (!PROXY_KEYS.some((k) => env[k])) {
    Object.assign(env, await sysProxyEnv());
  }
  
  // claude/codex 强制要求 UTF-8
  if (process.platform !== 'win32') {
    if (!/UTF-8/i.test(env.LC_ALL || env.LC_CTYPE || env.LANG || '')) {
      env.LANG = 'en_US.UTF-8';
    }
  } else {
    // Windows: 确保 LANG 设置为 UTF-8
    if (!env.LANG) env.LANG = 'en_US.UTF-8';
  }
  
  return env;
}

/**
 * 获取完整环境变量（进程级缓存，只跑一次后缓存）
 */
function fullEnv() {
  if (!cached) cached = build();
  return cached;
}

module.exports = { fullEnv };
