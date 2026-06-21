# 项目识别与快捷运行开发计划

## TL;DR

> **Quick Summary**: 扩展 FanBox 的项目识别能力，支持 15 种语言/框架，并提供路径复制和快捷运行功能
>
> **Deliverables**:
> - 扩展 projectOf() 函数，支持 15 种语言/框架识别
> - 路径复制 API（绝对路径 + 相对路径）
> - 项目信息 API（框架类型 + 运行命令）
> - 前端路径复制功能
> - 前端项目信息卡片 + 快捷运行按钮
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: 步骤 1 → 步骤 2/3/4 → 步骤 5/6/7 → 步骤 8

---

## Context

### Original Request

用户希望 FanBox 能像 JetBrains IDE 一样：
1. 复制文件路径（绝对路径 + 相对路径）
2. 自动识别项目配置文件（Vue、Java、Python、.NET 等）
3. 提供快捷运行功能

### Interview Summary

**Key Discussions**:
- 用户希望支持 15 种语言/框架：Node.js、Vue、React、Angular、Next.js、Python、Django、Flask、Java、PHP、Rust、Go、.NET、Ruby、Swift、Dart
- JetBrains 的做法：通过检测配置文件（pom.xml、composer.json、Cargo.toml 等）识别项目类型
- FanBox 已有 projectOf() 函数，支持 Node.js、Python、Rust、Go，需要扩展

**Research Findings**:
- JetBrains 使用 XML 配置存储运行配置，格式为 `类型.名称`
- 项目识别通过检测配置文件 + 分析依赖字段实现
- 运行命令根据框架类型映射

---

## Work Objectives

### Core Objective

扩展 FanBox 的项目识别能力，支持 15 种语言/框架，并提供路径复制和快捷运行功能。

### Concrete Deliverables

- 扩展 `server.js` 中的 `projectOf()` 函数
- 新增路径信息 API：`GET /api/path-info`
- 新增项目信息 API：`GET /api/project-info`
- 前端路径复制功能（右键菜单）
- 前端项目信息卡片 + 快捷运行按钮

### Definition of Done

- [ ] 15 种语言/框架均可正确识别
- [ ] 路径复制功能正常工作
- [ ] 项目信息卡片正确显示
- [ ] 快捷运行按钮功能正常
- [ ] 三套皮肤（Volt/Archive/Index）均适配

### Must Have

- 支持 15 种语言/框架识别
- 路径复制（绝对路径 + 相对路径）
- 项目信息展示（框架类型 + 运行命令）
- 快捷运行按钮

### Must NOT Have (Guardrails)

- 不实现自定义运行配置（类似 JetBrains Run Configuration）
- 不实现调试功能
- 不实现环境变量配置
- 不实现多模块项目支持（Monorepo）

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: NO
- **Automated tests**: NO
- **Framework**: none

### QA Policy

Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - foundation):
├── Task 1: 扩展项目识别函数 [unspecified-high]
├── Task 2: 新增路径信息 API [unspecified-high]
├── Task 3: 新增运行命令映射 [unspecified-high]
└── Task 4: 新增项目信息 API [unspecified-high]

Wave 2 (After Wave 1 - frontend):
├── Task 5: 前端路径复制功能 [visual-engineering]
├── Task 6: 前端项目信息展示 [visual-engineering]
├── Task 7: 前端快捷运行按钮 [visual-engineering]
└── Task 8: 样式适配 [visual-engineering]

Critical Path: Task 1 → Task 2/3/4 → Task 5/6/7 → Task 8
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 4 (Wave 1 & 2)
```

---

## TODOs

- [ ] 1. 扩展项目识别函数

  **What to do**:
  - 扩展 `server.js` 中的 `projectOf()` 函数
  - 新增 `detectNodeFramework()` — 细分 Vue/React/Next/Angular/Svelte
  - 新增 `detectPythonFramework()` — 细分 Django/Flask/FastAPI
  - 新增 `detectPhpFramework()` — 细分 Laravel/Symfony
  - 新增 `detectMavenFramework()` — 检测 Spring Boot/Quarkus/Micronaut
  - 新增 `detectDotNetFramework()` — 检测 ASP.NET/Blazor/MAUI/WPF/WinForms
  - 新增 `hasCsprojFile()` — 扫描 .csproj 文件

  **识别规则**：

  | 语言/框架 | 识别文件 | 框架细分 |
  |---|---|---|
  | Node.js | `package.json` | vue/react/next/nuxt/angular/svelte/express |
  | Python | `requirements.txt` / `pyproject.toml` | django/flask/fastapi |
  | Java | `pom.xml` / `build.gradle` | spring-boot/quarkus/micronaut |
  | PHP | `composer.json` | laravel/symfony/yii |
  | .NET | `*.csproj` | dotnet/aspnet-core/blazor/maui/wpf/winforms |
  | Rust | `Cargo.toml` | rust |
  | Go | `go.mod` | go |
  | Ruby | `Gemfile` | ruby/rails |
  | Swift | `Package.swift` | swift |
  | Dart | `pubspec.yaml` | dart/flutter |

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要理解多种语言的配置文件结构
  - **Skills**: []
    - 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: None

  **References**:
  - `server.js:69-77` — 现有 projectOf() 函数
  - `server.js:28-32` — IGNORE_DIRS 常量

  **Acceptance Criteria**:
  - [ ] projectOf() 返回正确的框架类型
  - [ ] 15 种语言/框架均可识别

  **QA Scenarios**:

  ```
  Scenario: 识别 Vue 项目
    Tool: Bash
    Preconditions: 存在包含 vue 依赖的 package.json
    Steps:
      1. 创建测试目录，包含 package.json（dependencies 有 vue）
      2. 调用 projectOf() 函数
      3. 验证返回 'vue'
    Expected Result: 返回 'vue'
    Evidence: .sisyphus/evidence/task-1-vue-detection.txt

  Scenario: 识别 .NET 项目
    Tool: Bash
    Preconditions: 存在 .csproj 文件
    Steps:
      1. 创建测试目录，包含 Demo.csproj
      2. 调用 projectOf() 函数
      3. 验证返回 'dotnet'
    Expected Result: 返回 'dotnet'
    Evidence: .sisyphus/evidence/task-1-dotnet-detection.txt
  ```

  **Commit**: YES
  - Message: `feat(server): 扩展项目识别函数，支持 15 种语言/框架`
  - Files: `server.js`
  - Pre-commit: `node -e "require('./server.js')"`

---

- [ ] 2. 新增路径信息 API

  **What to do**:
  - 新增 `getPathInfo(filePath, projectRoot)` 函数
  - 返回 `{ absolute, relative }` 路径信息
  - 注册为 HTTP API：`GET /api/path-info?path=xxx&root=xxx`
  - 处理中文路径、空格路径

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要理解路径处理和 API 设计
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `server.js:62-66` — ext() 函数
  - `server.js:93-99` — resolvePath() 函数

  **Acceptance Criteria**:
  - [ ] API 返回正确的绝对路径和相对路径
  - [ ] 处理中文路径、空格路径

  **QA Scenarios**:

  ```
  Scenario: 获取路径信息
    Tool: Bash (curl)
    Preconditions: server.js 正在运行
    Steps:
      1. 发送 GET 请求到 /api/path-info?path=test.txt&root=/project
      2. 验证返回 JSON 包含 absolute 和 relative 字段
    Expected Result: 返回正确的路径信息
    Evidence: .sisyphus/evidence/task-2-path-info.json
  ```

  **Commit**: YES
  - Message: `feat(server): 新增路径信息 API`
  - Files: `server.js`
  - Pre-commit: `node -e "require('./server.js')"`

---

- [ ] 3. 新增运行命令映射

  **What to do**:
  - 新增 `RUN_COMMANDS` 常量，映射框架类型到运行命令
  - 新增 `getRunCommand(framework)` 函数
  - 支持读取 `package.json` 的 scripts 字段（让用户选择）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要理解多种语言的运行命令
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **References**:
  - `server.js:69-77` — projectOf() 函数

  **Acceptance Criteria**:
  - [ ] 每种框架返回正确的运行命令
  - [ ] Node.js 项目可读取 package.json scripts

  **QA Scenarios**:

  ```
  Scenario: 获取 Vue 项目运行命令
    Tool: Bash
    Preconditions: 项目类型为 'vue'
    Steps:
      1. 调用 getRunCommand('vue')
      2. 验证返回 'npm run serve'
    Expected Result: 返回 'npm run serve'
    Evidence: .sisyphus/evidence/task-3-run-command.txt
  ```

  **Commit**: YES
  - Message: `feat(server): 新增运行命令映射`
  - Files: `server.js`
  - Pre-commit: `node -e "require('./server.js')"`

---

- [ ] 4. 新增项目信息 API

  **What to do**:
  - 新增 `getProjectInfo(dirPath)` 函数
  - 返回 `{ type, framework, runCommand, scripts }`
  - 注册为 HTTP API：`GET /api/project-info?path=xxx`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要整合项目识别和运行命令
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `server.js:69-77` — projectOf() 函数

  **Acceptance Criteria**:
  - [ ] API 返回正确的项目信息
  - [ ] 包含框架类型和运行命令

  **QA Scenarios**:

  ```
  Scenario: 获取项目信息
    Tool: Bash (curl)
    Preconditions: server.js 正在运行
    Steps:
      1. 发送 GET 请求到 /api/project-info?path=/project
      2. 验证返回 JSON 包含 type、framework、runCommand 字段
    Expected Result: 返回正确的项目信息
    Evidence: .sisyphus/evidence/task-4-project-info.json
  ```

  **Commit**: YES
  - Message: `feat(server): 新增项目信息 API`
  - Files: `server.js`
  - Pre-commit: `node -e "require('./server.js')"`

---

- [ ] 5. 前端路径复制功能

  **What to do**:
  - 文件右键菜单新增「复制绝对路径」和「复制相对路径」
  - 调用 `/api/path-info` 获取路径信息
  - 使用 `navigator.clipboard.writeText()` 复制到剪贴板
  - 复制成功后显示 toast 提示

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 需要修改前端 UI 和交互
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `public/app.js` — 前端主文件

  **Acceptance Criteria**:
  - [ ] 右键菜单显示两个复制选项
  - [ ] 点击后路径正确复制到剪贴板
  - [ ] 显示复制成功提示

  **QA Scenarios**:

  ```
  Scenario: 复制绝对路径
    Tool: Playwright
    Preconditions: FanBox 正在运行，文件浏览器显示文件列表
    Steps:
      1. 右键点击文件
      2. 点击「复制绝对路径」
      3. 验证剪贴板内容
    Expected Result: 剪贴板包含正确的绝对路径
    Evidence: .sisyphus/evidence/task-5-copy-absolute.png
  ```

  **Commit**: YES
  - Message: `feat(frontend): 新增路径复制功能`
  - Files: `public/app.js`
  - Pre-commit: 无

---

- [ ] 6. 前端项目信息展示

  **What to do**:
  - 文件浏览器顶部新增项目信息卡片
  - 显示：框架类型、运行命令、项目图标
  - 调用 `/api/project-info` 获取信息

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 需要设计和实现 UI 组件
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 4

  **References**:
  - `public/app.js` — 前端主文件
  - `public/style.css` — 样式文件

  **Acceptance Criteria**:
  - [ ] 打开目录时显示项目信息卡片
  - [ ] 显示正确的框架类型和运行命令

  **QA Scenarios**:

  ```
  Scenario: 显示 Vue 项目信息
    Tool: Playwright
    Preconditions: 打开 Vue 项目目录
    Steps:
      1. 打开 FanBox
      2. 导航到 Vue 项目目录
      3. 验证项目信息卡片显示
    Expected Result: 显示 "Vue" 框架和 "npm run serve" 命令
    Evidence: .sisyphus/evidence/task-6-project-card.png
  ```

  **Commit**: YES
  - Message: `feat(frontend): 新增项目信息展示`
  - Files: `public/app.js`, `public/style.css`
  - Pre-commit: 无

---

- [ ] 7. 前端快捷运行按钮

  **What to do**:
  - 项目信息卡片新增「运行」按钮
  - 点击后向内嵌终端注入运行命令
  - 支持多 scripts 时弹出选择框

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 需要实现交互逻辑
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `public/app.js` — 前端主文件

  **Acceptance Criteria**:
  - [ ] 点击运行按钮后终端执行对应命令
  - [ ] 多 scripts 时显示选择框

  **QA Scenarios**:

  ```
  Scenario: 运行 Vue 项目
    Tool: Playwright
    Preconditions: 打开 Vue 项目目录
    Steps:
      1. 打开 FanBox
      2. 导航到 Vue 项目目录
      3. 点击「运行」按钮
      4. 验证终端执行命令
    Expected Result: 终端执行 "npm run serve"
    Evidence: .sisyphus/evidence/task-7-run-project.png
  ```

  **Commit**: YES
  - Message: `feat(frontend): 新增快捷运行按钮`
  - Files: `public/app.js`
  - Pre-commit: 无

---

- [ ] 8. 样式适配

  **What to do**:
  - 项目信息卡片样式
  - 运行按钮样式
  - 右键菜单样式调整
  - 三套皮肤（Volt/Archive/Index）均适配

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 需要设计和实现样式
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `public/style.css` — 样式文件

  **Acceptance Criteria**:
  - [ ] 与现有 UI 风格一致
  - [ ] 三套皮肤（Volt/Archive/Index）均适配

  **QA Scenarios**:

  ```
  Scenario: Volt 皮肤适配
    Tool: Playwright
    Preconditions: 切换到 Volt 皮肤
    Steps:
      1. 打开 FanBox
      2. 切换到 Volt 皮肤
      3. 打开项目目录
      4. 验证项目信息卡片样式
    Expected Result: 样式与 Volt 皮肤一致
    Evidence: .sisyphus/evidence/task-8-volt-skin.png
  ```

  **Commit**: YES
  - Message: `style(frontend): 适配三套皮肤`
  - Files: `public/style.css`
  - Pre-commit: 无

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Review all changed files for: empty catches, console.log in prod, commented-out code, unused imports.

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task.

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1.

---

## Commit Strategy

- **1-4**: `feat(server): 扩展项目识别和 API` - server.js
- **5-8**: `feat(frontend): 路径复制和项目信息展示` - public/app.js, public/style.css

---

## Success Criteria

### Verification Commands

```bash
node server.js  # Expected: server starts without errors
curl http://localhost:4567/api/project-info?path=.  # Expected: project info JSON
curl http://localhost:4567/api/path-info?path=server.js&root=.  # Expected: path info JSON
```

### Final Checklist

- [ ] 15 种语言/框架均可正确识别
- [ ] 路径复制功能正常工作
- [ ] 项目信息卡片正确显示
- [ ] 快捷运行按钮功能正常
- [ ] 三套皮肤均适配
- [ ] 中文路径、空格路径处理正确
- [ ] 无 package.json 的 Node.js 项目不误判
