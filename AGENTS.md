# schulte-web

舒尔特方格 Web 应用：视觉搜索训练工具，纯前端、本地优先。

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router（hash 模式，静态部署无需 rewrite）
- Vitest（核心逻辑单测）
- 无 UI 库；CSS 变量 + 手写样式
- 无后端、无登录；训练记录存 `localStorage`

## 常用命令

```bash
npm install
npm run dev        # 开发
npm run build      # 类型检查 + 构建，产物 dist/
npm run preview    # 预览构建产物
npm run typecheck  # vue-tsc --noEmit
npm run test       # vitest run
```

## 目录约定

```text
src/
  core/          # 纯逻辑：棋盘生成、每日种子、指标、存储
  composables/   # useGame 状态机
  pages/         # Home / Game / Records
  components/    # GridBoard / ResultCard / TrendBars
  styles/        # 全局样式
  router/        # hash 路由
```

## 产品原则

- **定位**：工具 / 训练游戏，不是医疗、心理诊断或标准化测评。
- **禁止宣称**：提升智商、治疗 ADHD、提升阅读速度 X%、7 天根治注意力问题。
- **指标解释**：成绩受设备、视距、输入方式与练习影响；引导用户与自己的历史成绩比较。
- **公平随机**：Fisher–Yates + 公平性评分（避免连续数字相邻、长连续段）；每日挑战用日期种子，保证同一天同一张表。
- **纯前端边界**：MVP 不做账号、排行榜、云同步。

## 代码规范

- 注释仅在非常规实现处添加，使用英文。
- 纯逻辑放 `src/core/`，页面只负责状态与渲染。
- 计时用 `performance.now()`；事件间隔优先取 `event.timeStamp`。
- 触摸目标不小于 44px；连点需防抖；`visibilitychange` 自动暂停。
- 提交信息使用英文：`<type>(<scope>): <summary>`。

## Git / GitHub

- 主分支：`main`
- 功能分支：`feat-` / `fix-` 前缀
- PR 使用 `gh pr create --base main`
- 禁止 force push

## 验证

- `npm run typecheck`、`npm run build`、`npm run test` 必须通过。
- 浏览器回归：3×3/4×4/5×5/6×6、计时、错误、暂停、结算、记录、每日挑战、刷新持久化、移动端布局。

## 参考

- 调研报告：`/Users/mack/Agents/research-agent/output/舒尔特方格-2026-11-12.md`
- 飞书调研文档：https://ucniizx1ebgh.feishu.cn/wiki/T1PKwFIBniUUNlkiWJvcSKdVnZf
- 代码底子参考：`IT-NuanxinPro/NeuroFlex`（MIT，仅抽取 Schulte 逻辑）
- 每日挑战算法：`schultelab/schulte-daily-seed`（MIT）
