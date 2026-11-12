# schulte-miniapp

舒尔特方格小程序：视觉搜索训练工具，纯前端、本地优先。一套代码构建 H5 与微信小程序。

## 技术栈

- uni-app (Vue 3 + Vite)
- 目标平台：H5（静态部署）、微信小程序（`mp-weixin`）
- 无后端、无登录；训练记录存本地 `uni.setStorageSync`
- 不引入图表库；趋势图用 CSS 实现

## 常用命令

```bash
npm install
npm run dev:h5          # H5 开发
npm run build:h5        # H5 构建，产物 dist/build/h5
npm run dev:mp-weixin   # 微信小程序开发，产物 dist/dev/mp-weixin
npm run build:mp-weixin # 微信小程序构建，产物 dist/build/mp-weixin
```

微信开发者工具导入 `dist/dev/mp-weixin` 或 `dist/build/mp-weixin`；`src/manifest.json` 的 `mp-weixin.appid` 需替换为实际 AppID。

## 目录约定

```text
src/
  core/          # 纯逻辑：棋盘生成、指标计算、存储封装
  pages/
    index/       # 首页：尺寸选择、最佳成绩、每日挑战
    game/        # 训练页：棋盘、计时、暂停、结算
    records/     # 记录页：个人最佳、趋势、历史
  static/        # 静态资源
  pages.json     # 路由与导航栏
  manifest.json  # 应用配置
```

## 产品原则

- **定位**：工具 / 训练游戏，不是医疗、心理诊断或标准化测评。
- **禁止宣称**：提升智商、治疗 ADHD、提升阅读速度 X%、7 天根治注意力问题。
- **指标解释**：成绩受设备、视距、输入方式与练习影响；引导用户与自己的历史成绩比较。
- **公平随机**：Fisher–Yates + 公平性评分（避免连续数字相邻、长连续段）；每日挑战用日期种子，保证同一天同一张表。
- **纯前端边界**：MVP 不做账号、排行榜、云同步；后续需要时再评估微信云开发或后端。

## 代码规范

- 注释仅在非常规实现处添加，使用英文。
- 纯逻辑放 `src/core/`，页面只负责状态与渲染。
- 计时用 `Date.now()`；事件时间优先取 `event.timeStamp`。
- 触摸目标不小于 44px；连点需防抖；切后台自动暂停。
- 提交信息使用英文：`<type>(<scope>): <summary>`。

## 验证

- `npm run build:h5` 与 `npm run build:mp-weixin` 必须通过。
- 本地浏览器回归：3×3/4×4/5×5/6×6、计时、错误、暂停、结算、记录、每日挑战、移动端布局。
- 微信开发者工具检查：页面路由、本地存储、分享、切后台暂停。

## 参考

- 调研报告：`/Users/mack/Agents/research-agent/output/舒尔特方格-2026-11-12.md`
- 飞书调研文档：https://ucniizx1ebgh.feishu.cn/wiki/T1PKwFIBniUUNlkiWJvcSKdVnZf
- 代码底子参考：`IT-NuanxinPro/NeuroFlex`（MIT，仅抽取 Schulte 逻辑）
- 每日挑战算法：`schultelab/schulte-daily-seed`（MIT）
