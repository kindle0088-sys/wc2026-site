# 🌍 WC2026 v3 · 实时数据版

## 概述

纯静态 2026 世界杯资讯网站，数据直接从 ESPN API 实时获取。

## 一键部署

### GitHub Pages

```bash
# 1. 创建 GitHub 仓库
gh repo create wc2026-site --public --push --source /home/admin/wc2026-site

# 2. 在仓库 Settings → Pages → 选 main 分支 / (root) → Save
# 3. 等待几分钟，访问 https://你的用户名.github.io/wc2026-site/
```

### Pinme / 任意静态托管

直接把整个 `wc2026-site/` 文件夹上传即可。

## 技术亮点

| 特性 | 说明 |
|------|------|
| 🚀 实时数据 | 页面加载后自动从 ESPN API 获取最新赛果 |
| 📡 离线缓存 | data.js 作为回退数据，ESPN 离线时也能显示 |
| 🔄 自动刷新 | 每 5 分钟自动拉取最新数据 |
| ⚡ 零依赖 | 纯 HTML + CSS + JS，无框架、无后端 |
| 🌐 CORS 友好 | ESPN API 支持跨域，浏览器直连 |
| 📱 响应式 | 移动端优先，手机/平板/桌面均适配 |

## 页面结构

```
wc2026-site/
├── index.html          # 首页
├── matches/            # 赛事信息（小组赛看板 + 淘汰赛树形图）
├── dashboard/          # 数据看板（积分榜、射手榜、精彩看点）
├── news/               # 资讯博客
├── teams/              # 球队数据
└── assets/
    ├── css/style.css   # 全局样式
    └── js/
        ├── data.js     # 初始缓存数据（离线回退）
        └── app.js      # 实时数据引擎（ESPN 获取 + 渲染）
```

## v3 更新说明

- **v2 → v3 核心变化**：从 cron 定时更新 data.js 改为浏览器实时从 ESPN 获取
- **不再需要**：server.py、cron 定时任务、更新脚本
- **纯静态部署**：支持 GitHub Pages / Pinme / 任何静态托管

## 数据来源

[ESPN Sports API](https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard)（公开，免费，无需 API Key）

---

⚽ 2026 FIFA World Cup · Unofficial Fan Site