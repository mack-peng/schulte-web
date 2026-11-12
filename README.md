# schulte-web

舒尔特方格 Web 应用：按顺序找到数字，训练视觉搜索与持续注意。纯前端、本地优先。

## 开发

```bash
npm install
npm run dev        # 本地开发
npm run typecheck  # 类型检查
npm run test       # 核心逻辑单测
npm run build      # 类型检查 + 构建，产物 dist/
npm run preview    # 预览构建产物
```

## 部署

`npm run build` 后把 `dist/` 部署到任意静态服务器即可。Vite 使用 `base: './'`，Vue Router 使用 hash 模式，无需服务端 rewrite，可部署到子路径。

## 结构

```text
src/
  core/          # 纯逻辑：棋盘生成、每日种子、指标、存储
  composables/   # useGame 状态机
  pages/         # Home / Game / Records
  components/    # GridBoard / ResultCard / TrendBars
  styles/        # 全局样式
  router/        # hash 路由
```

## 数据与隐私

- 训练记录、每日挑战、设置仅存浏览器 `localStorage`，不上传任何数据。
- 存储 key：`schulte.sessions.v1` / `schulte.daily.v1` / `schulte.settings.v1`。
- 记录页可清空全部本地数据。

## 说明

本工具为视觉搜索训练游戏，不构成医疗或心理诊断。成绩受设备、视距与练习影响，请与自己历史成绩比较。评分带为成人参考区间，非官方常模。
