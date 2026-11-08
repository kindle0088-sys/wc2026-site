# 🌍 WC2026 v4 · 赛事归档

> **⚠️ 状态：已归档（2026-11-08）**
> 2026 世界杯已于 **2026-07-19** 结束。本站数据冻结在 **2026-07-25**，
> 自动刷新已停用，页面顶部显示归档提示。内容仍可完整查阅，但**不再更新**。
> 线上：https://kindle0088-sys.github.io/wc2026-site/

## 概述

纯静态 2026 世界杯资讯网站。赛事期间数据从 ESPN API 实时获取；
归档后改用本地缓存（`data-groups.js` / `data-knockout.js`）作为唯一数据源，不再发起轮询。

## 部署

站点由 GitHub Pages 直接托管：**分支 `master` / 根目录 `/`**。

```bash
# 已有仓库，直接推送即可（GitHub Pages 会在 push 后自动重建）
git push origin master
```

> ✅ 仓库根目录含 `.nojekyll`：跳过 Jekyll 构建，纯静态文件原样发布，构建更快、少一层出错面。
>
> ⚠️ **不要在一秒内连续 push 多次**。2026-07-25 就是因为两次 push 相隔 1 秒，
> 两次 Pages 构建撞在一起双双失败，站点状态卡在 `errored` 三个多月。
> 多个改动请合并成一次 commit 再推。

## 技术亮点

| 特性 | 说明 |
|------|------|
| 📡 离线缓存 | 分组数据(data-groups.js) + 淘汰赛数据(data-knockout.js) 双回退 |
| 🔄 自动刷新 | ~~每 5 分钟自动拉取~~ → **已于 2026-11-08 停用**（赛事结束） |
| ⚡ 零依赖 | 纯 HTML + CSS + JS，无框架、无后端 |
| 🌐 CORS 友好 | ESPN API 返回 `Access-Control-Allow-Origin: *`，浏览器可直连 |
| 📱 响应式 | 移动端优先，手机/平板/桌面均适配 |

## 页面结构

```
wc2026-site/
├── .nojekyll           # 跳过 Jekyll（纯静态站必须）
├── index.html          # 首页（R32 网格导航）
├── matches/            # 赛事信息（小组赛看板 + 淘汰赛树形图）
├── dashboard/          # 数据看板（积分榜、射手榜、精彩看点）
├── news/               # 资讯博客（AI 战报）
├── teams/              # 球队详情
├── assets/
│   ├── css/style.css   # 全局样式（暗色主题）
│   └── js/
│       ├── data-groups.js     # 小组赛/射手榜/助攻榜/精彩看点（静态）
│       ├── data-knockout.js    # 淘汰赛 R32→Final + 文章（静态，冻结于 07-25）
│       └── app.js             # 渲染引擎（自动刷新已停用）
└── tools/
    ├── refresh_data.py  # ESPN → data-knockout.js 刷新脚本（归档后未使用）
    ├── gen_knockout_block.js  # 淘汰赛配对生成工具
    └── refresh_knockout.js    # 淘汰赛状态参考工具
```

## 若要重新启用（下一届赛事）

1. 删除 6 个 HTML 页面里 `<body>` 后的 `.archive-banner` 区块
2. `assets/js/app.js` 的 `_startAutoRefresh()` 恢复 `setInterval` 实现
3. 改 `_buildDateRange()` 里的赛事起止日期
4. 跑 `python3 tools/refresh_data.py --push` 重建数据文件

## 数据来源

[ESPN Sports API](https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard)（公开，免费，无需 API Key）
归档后仅作原始来源记录，页面不再请求。

---

⚽ 2026 FIFA World Cup · Unofficial Fan Site · Archived 2026-11-08
