# 🌍 WC2026 v4 · 实时数据版

## 概述

纯静态 2026 世界杯资讯网站，数据直接从 ESPN API 实时获取。

## 一键部署

### GitHub Pages

```bash
# 创建 GitHub 仓库并推送
gh repo create wc2026-site --public --push --source /home/admin/wc2026-site

# 在仓库 Settings → Pages → 选 main 分支 / (root) → Save
```

## 技术亮点

| 特性 | 说明 |
|------|------|
| 🚀 实时数据 | 页面加载后自动从 ESPN API 获取最新赛果 |
| 📡 离线缓存 | 分组数据(data-groups.js) + 淘汰赛数据(data-knockout.js) 双回退 |
| 🔄 自动刷新 | 每 5 分钟自动拉取最新数据 |
| ⚡ 零依赖 | 纯 HTML + CSS + JS，无框架、无后端 |
| 🌐 CORS 友好 | ESPN API 支持跨域，浏览器直连 |
| 📱 响应式 | 移动端优先，手机/平板/桌面均适配 |

## 页面结构

```
wc2026-site/
├── index.html          # 首页（R32 网格导航）
├── matches/            # 赛事信息（小组赛看板 + 淘汰赛树形图）
├── dashboard/          # 数据看板（积分榜、射手榜、精彩看点）
├── news/               # 资讯博客（AI 战报）
├── teams/              # 球队详情
├── assets/
│   ├── css/style.css   # 全局样式（暗色主题）
│   └── js/
│       ├── data-groups.js     # 小组赛/射手榜/助攻榜/精彩看点（静态）
│       ├── data-knockout.js    # 淘汰赛 R32→Final + 文章（动态更新）
│       └── app.js             # 实时数据引擎 + 渲染
└── tools/
    ├── refresh_data.py  # ESPN → data-knockout.js 自动刷新脚本
    ├── gen_knockout_block.js  # 淘汰赛配对生成工具
    └── refresh_knockout.js    # 淘汰赛状态参考工具
```

## 数据刷新

```bash
# 快速更新（仅赛场结果，跳过射手榜）
python3 tools/refresh_data.py --no-scorers --push

# 完整更新（含射手榜/助攻榜）
python3 tools/refresh_data.py --push
```

## 数据来源

[ESPN Sports API](https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard)（公开，免费，无需 API Key）

---

⚽ 2026 FIFA World Cup · Unofficial Fan Site