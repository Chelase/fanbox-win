'use strict';
/**
 * FanBox — 跨平台 CLI 驱动
 *
 * 无头跑 claude / codex 的流式模式，把一轮对话的完整结果（作为微信消息的"回复"）
 * 用户的文本换一行（stdin），中间过程不返回/不打印（claude 有 session_id 追踪）
 *
 * 跨平台适配：
 * - macOS/Linux: 用 $SHELL -lc 启动登录式 shell
 * - Windows: 用 PowerShell 或 cmd.exe 启动
 */
const { spawn, execFile, exec } = require('child_process');
const { fullEnv } = require('./env');

/**
 * 获取登录式 shell 命令和参数
 */
function getShellConfig() {
  if (process.platform === 'win32') {
    // Windows: 优先用 PowerShell，降级用 cmd.exe
    const comspec = process.env.COMSPEC || 'cmd.exe';
    const isPowerShell = comspec.toLowerCase().includes('powershell') || comspec.toLowerCase().includes('pwsh');
    return {
      shell: isPowerShell ? comspec : 'powershell.exe',
      args: isPowerShell ? ['-NoProfile', '-NonInteractive', '-Command'] : ['/c'],
      isPowerShell
    };
  }
  // macOS/Linux: 用用户默认 shell 的登录模式
  return {
    shell: process.env.SHELL || '/bin/zsh',
    args: ['-lc'],
    isPowerShell: false
  };
}

/**
 * 跑一条命令，prompt 写 stdin，env 用用户的真实登录式 shell（由 env.js 提供）
 *
 * onLine（可选）：stdout 每收到一行就会回调一次（流式模式进程不退出，会持续输出，尾部不足一行算作它）
 * 超时设置："小超时"是"总耗时"，防止 agent 绞尽脑汁；stream-json 记录会自动会长时间
 * 通过活动信号不断续命；默认不设上限（100% 按活动信号续命）
 * 超出 timedOut / timeoutReason('idle'|'max')，上层调用者要不要重试，只看 idle（只有
 * max 是真的循环一直记录、失败了 agent 的绞尽脑汁，现在只是断路器）
 */
async function run(cmd, stdinText, cwd, opts = {}, onLine = null) {
  const idleMs = opts.idleMs || 120000;   // 无任何数据的时间 → 判定为无响应
  const maxMs = opts.maxMs || 1800000;    // 硬上限（30min），防止绞尽脑汁
  const env = await fullEnv();
  const started = Date.now();
  
  const shellConfig = getShellConfig();
  
  // 构建命令：Windows 和 Unix 的命令传递方式不同
  let spawnCmd, spawnArgs;
  if (process.platform === 'win32') {
    if (shellConfig.isPowerShell) {
      // PowerShell: 把命令作为字符串传递
      spawnCmd = shellConfig.shell;
      spawnArgs = [...shellConfig.args, cmd];
    } else {
      // cmd.exe: 用 /c 传递命令
      spawnCmd = shellConfig.shell;
      spawnArgs = ['/c', cmd];
    }
  } else {
    // Unix: 用 -lc 传递命令
    spawnCmd = shellConfig.shell;
    spawnArgs = ['-lc', cmd];
  }
  
  return new Promise((resolve) => {
    const child = spawn(spawnCmd, spawnArgs, { 
      cwd: cwd || env.HOME || env.USERPROFILE || process.env.HOME || process.env.USERPROFILE, 
      env,
      windowsHide: true
    });
    
    let out = '', err = '', done = false, lineBuf = '', idleTimer = null;
    
    const finish = (r) => { 
      if (done) return; 
      done = true; 
      clearTimeout(idleTimer); 
      clearTimeout(maxTimer); 
      resolve({ ...r, ms: Date.now() - started }); 
    };
    
    const kill = (reason) => { 
      try { child.kill('SIGKILL'); } catch { /* */ } 
      finish({ ok: false, out, err: err + `\n[超时:${reason}]`, timedOut: true, timeoutReason: reason }); 
    };
    
    const armIdle = () => { 
      clearTimeout(idleTimer); 
      idleTimer = setTimeout(() => kill('idle'), idleMs); 
    };
    
    const maxTimer = setTimeout(() => kill('max'), maxMs);
    armIdle(); // 在 spawn 之前：有些"链接"之前的系统连接窗口
    
    child.stdout.on('data', (d) => {
      if (done) return; // 杀掉进程后迟到的 data 不会再次进入 finish 的流程
      armIdle();
      const s = d.toString('utf8'); 
      out += s;
      if (!onLine) return;
      lineBuf += s; 
      let nl;
      while ((nl = lineBuf.indexOf('\n')) >= 0) { 
        const line = lineBuf.slice(0, nl); 
        lineBuf = lineBuf.slice(nl + 1); 
        try { onLine(line); } catch { /* */ } 
      }
    });
    
    child.stderr.on('data', (d) => { 
      if (done) return; 
      armIdle(); 
      err += d.toString('utf8'); 
    }); // stderr 也叫"链接"
    
    child.on('error', (e) => finish({ ok: false, out, err: String(e && e.message || e) }));
    child.on('close', (code) => finish({ ok: code === 0, code, out, err }));
    
    try { 
      child.stdin.write(stdinText || ''); 
      child.stdin.end(); 
    } catch { /* */ }
  });
}

/**
 * 解析一条 usage 记录中的 token 数（claude 的 input + cache = 大头，现在存写=远小于总输入量）
 * 对于 codex/openai 类 total/prompt，也有自动会动断路，不需要重试，就小就大
 */
function usageTokens(u) {
  if (!u || typeof u !== 'object') return 0;
  const claudeInput = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
  if (claudeInput) return claudeInput;
  return u.total_tokens || u.prompt_tokens || 0;
}

/**
 * 一条工具调用的描述（一行，只做工具名/参数摘要，null 表示此步不值得展示）
 */
function progressNote(name, input) {
  const i = input || {};
  const base = (p) => (p ? require('path').basename(String(p)) : '');
  switch (name) {
    case 'Read': return `正在看 ${base(i.file_path)}`.trim();
    case 'Edit': case 'Write': case 'MultiEdit': case 'NotebookEdit': return `正在改 ${base(i.file_path)}`.trim();
    case 'Bash': return i.description ? `正在执行：${i.description}` : '正在执行命令';
    case 'Grep': case 'Glob': return `正在搜索 ${i.pattern || ''}`.trim();
    case 'WebFetch': case 'WebSearch': return '正在搜索';
    case 'Task': return '正在启动子任务';
    default: return name ? `正在用 ${name}` : '';
  }
}

/**
 * codex 记录的描述（带命令，摘要提取，但同类通用（正在改文件/正在执行命令等）
 */
function codexNote(item) {
  if (!item) return '';
  if (item.command) { 
    const c = Array.isArray(item.command) ? item.command.join(' ') : item.command; 
    return `正在执行：${String(c).slice(0, 60)}`; 
  }
  if (item.path || item.file) return `正在改 ${require('path').basename(item.path || item.file)}`;
  return '正在处理';
}

/**
 * 跨平台 which 命令：检查本地是否有某个 CLI
 */
function which(bin) {
  if (process.platform === 'win32') {
    // Windows: 用 where.exe 或 Get-Command
    return run(`where.exe ${bin} 2>nul || echo.`, '', null, { idleMs: 8000, maxMs: 10000 })
      .then((r) => !!(r.out || '').trim() && !(r.out || '').includes('echo.'));
  }
  // Unix: 用 command -v
  return run(`command -v ${bin} || true`, '', null, { idleMs: 8000, maxMs: 10000 })
    .then((r) => !!(r.out || '').trim());
}

/**
 * claude 无头启动：带 --session-id <随机生成的 uuid>，之后 --resume 同一 uuid，
 * 关键是：不要 claude 自动创建 session，print 模式不会自动创建会话 resume 否则会报 No conversation found
 *
 * onProgress(note)（可选）：对 stream-json 进行边解析压缩边把调用的工具名提取出来，给上层一条一句的进展
 *
 * 跨平台引号处理：
 * - Unix: 单引号包裹，内部单引号转义
 * - Windows PowerShell: 双引号包裹，内部双引号转义
 */
function shq(s) {
  if (process.platform === 'win32') {
    // PowerShell: 双引号包裹，内部双引号用两个双引号转义
    return `"${String(s).replace(/"/g, '""')}"`;
  }
  // Unix: 单引号包裹，内部单引号用 '\'' 转义
  return `'${String(s).replace(/'/g, "'\\''")}'`;
}

/**
 * 运行 claude 无头会话
 */
async function runClaude(text, cwd, sessionId, persona, onProgress) {
  const sid = sessionId || require('crypto').randomUUID();
  const flag = sessionId ? `--resume ${sid}` : `--session-id ${sid}`;
  const sys = persona ? `--append-system-prompt ${shq(persona)}` : '';
  // 用 stream-json 流式解析，防止超时，用活动信号断路器续命，流式 json 有被断掉默认会被杀掉
  const cmd = `claude -p --output-format stream-json --verbose --dangerously-skip-permissions ${sys} ${flag}`;
  let result = '', outSid = sid, tokens = 0, cost = 0, r, ms = 0, attempts = 0;
  // 有"链接"的系统连接窗口。有重试就是无响应重试（共 3 次：首次 + 2 次重试），每条命令独立累积，防止串内容
  for (attempts = 1; attempts <= 3; attempts++) {
    result = ''; outSid = sid; tokens = 0; cost = 0;
    // 解析 JSONL，result 记录 = 最终文本/session/最终成本，边解析边给 onProgress 时符
    const onLine = (line) => {
      const t = line.trim(); if (!t || t[0] !== '{') return;
      let o; try { o = JSON.parse(t); } catch { return; }
      if (o.type === 'result') { result = o.result || result; outSid = o.session_id || outSid; if (o.usage) tokens = usageTokens(o.usage) || tokens; if (o.total_cost_usd != null) cost = o.total_cost_usd; return; }
      if (onProgress && o.type === 'assistant' && o.message && Array.isArray(o.message.content)) {
        for (const b of o.message.content) { if (b.type === 'tool_use') { const p = progressNote(b.name, b.input); if (p) onProgress(p); } }
      }
    };
    if (attempts > 1 && onProgress) onProgress('链接已断开，正在重试…');
    r = await run(cmd, text, cwd, { idleMs: 120000, maxMs: 1800000 }, onLine);
    ms += r.ms || 0;
    if (!result) {
      // onLine 漏抓 result 记录 → 兜底扫一遍全量输出
      for (const line of (r.out || '').split('\n')) { 
        const t = line.trim(); 
        if (t[0] !== '{') continue; 
        let o; 
        try { o = JSON.parse(t); } catch { continue; } 
        if (o.type === 'result') { 
          result = o.result || result; 
          outSid = o.session_id || outSid; 
          if (o.usage) tokens = usageTokens(o.usage) || tokens; 
          if (o.total_cost_usd != null) cost = o.total_cost_usd; 
        } 
      }
    }
    // 只在"链接"有用，底层绞尽脑汁(max)不重试，有结果就返回
    if (r.timeoutReason === 'idle' && !result && attempts < 3) continue;
    break;
  }
  // resume 的会话失效（id 过期/已删除）→ 自动重建会话，但已被断开的不重试
  if (sessionId && /No conversation found|session.*not found/i.test(result + ' ' + (r.err || ''))) {
    return runClaude(text, cwd, null, persona, onProgress);
  }
  if (!result && !r.ok) {
    result = r.timedOut
      ? `⚠️ claude 执行过程超时（重试了 ${attempts} 次均无响应），请重试/检查网络`
      : `⚠️ claude 报错：${(r.err || '').trim().slice(-300)}`;
  }
  return { text: result || '📭 没有返回数据', sessionId: outSid, tokens, cost, ms, attempts, timedOut: !!r.timedOut };
}

/**
 * codex 无头启动：用 `codex exec` 无会话模式，从 thread.started 抓 thread_id，之后 `codex exec resume <id> -` 续命（兼容 codex 0.139+）
 */
async function runCodex(text, cwd, persona, sessionId, onProgress) {
  const flags = '--json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox';
  // 无命令/prompt 写 stdin（尾部 `-`），会话续命/恢复（兼容），当前配置（带命令的）恢复（带 codex 会限制 system-prompt 的）
  const cmd = sessionId ? `codex exec resume ${sessionId} ${flags} -` : `codex exec ${flags}`;
  const stdin = sessionId ? text : (persona ? `${persona}\n\n---\n${text}` : text);
  // 流式输出：codex 输出量 JSONL，包含工具调用/文件改动/进度广播等（正在改文件/正在执行命令等），尾部的描述（用户侧）需要提取最后的 assistant 文本
  const onLine = onProgress ? (line) => {
    const t = line.trim(); if (!t || t[0] !== '{') return;
    let o; try { o = JSON.parse(t); } catch { return; }
    const item = o.item || o.msg || o;
    const ty = (item.type || o.type || '').toLowerCase();
    if (/command|exec|tool|function|patch|file/.test(ty)) { const n = codexNote(item); if (n) onProgress(n); }
  } : null;
  
  let result = '', outSid = sessionId || '', tokens = 0, r, ms = 0, attempts = 0;
  // 有"链接"的系统连接窗口。有重试就是无响应重试（共 3 次：首次 + 2 次重试）
  for (attempts = 1; attempts <= 3; attempts++) {
    result = ''; outSid = sessionId || ''; tokens = 0;
    if (attempts > 1 && onProgress) onProgress('链接已断开，正在重试…');
    r = await run(cmd, stdin, cwd, { idleMs: 120000, maxMs: 1800000 }, onLine);
    ms += r.ms || 0;
    // --json 的 JSONL 记录，抓 thread_id + 最终 assistant 文本（最后的工具前的文本）+ 最终成本（取记录为取最大）
    for (const line of (r.out || '').split('\n')) {
      const t = line.trim(); if (!t || t[0] !== '{') continue;
      let o; try { o = JSON.parse(t); } catch { continue; }
      if (o.type === 'thread.started' && o.thread_id) outSid = o.thread_id;
      const item = o.item || o.msg || o;
      const ty = item.type || o.type || '';
      const u = o.usage || item.usage || (/token|usage/i.test(ty) ? (item || o) : null);
      if (u) { const tk = usageTokens(u); if (tk > tokens) tokens = tk; } // codex 的记录结构多样，只抓取最大
      if (/agent_message|assistant|message\.completed|item\.completed/i.test(ty)) {
        const txt = item.text || item.message || (item.content && item.content.text) || '';
        if (txt && typeof txt === 'string') result = txt;
      }
    }
    if (r.timeoutReason === 'idle' && !result && attempts < 3) continue;
    break;
  }
  // resume 的会话失效（id 过期/已崩溃）→ 自动重建会话，但已被断开的不重试
  if (sessionId && !result && /No .*session|not found|no conversation|未.*会话/i.test(r.err || r.out || '')) {
    return runCodex(text, cwd, persona, null);
  }
  if (!result) { // 没有 JSON 时 → 取文本的最后一段（去掉 header 前的 prompt 区域）
    const parts = stripAnsi(r.out || '').split(/-{6,}/);
    result = (parts[parts.length - 1] || '').replace(/^\s*user[\s\S]*?\n/i, '').trim();
  }
  if (!result && !r.ok) {
    result = r.timedOut
      ? `⚠️ codex 执行过程超时（重试了 ${attempts} 次均无响应），请重试/检查网络`
      : `⚠️ codex 报错：${stripAnsi(r.err || r.out || '').trim().slice(-300)}`;
  }
  return { text: result || '📭 没有返回数据', sessionId: outSid, tokens, cost: 0, ms, attempts, timedOut: !!r.timedOut };
}

/**
 * 去掉 ANSI 转义序列
 */
function stripAnsi(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }

/**
 * 预热环境变量（提前加载到 env.js，这样第一条消息就不用等待 shell 启动）
 */
function warmEnv() { fullEnv().catch(() => { /* 失败就降级到 process.env，run 时再获取 */ }); }

module.exports = { runClaude, runCodex, which, warmEnv };
