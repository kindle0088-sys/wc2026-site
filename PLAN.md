# 🌍 2026 世界杯资讯网站 — 设计方案

## 一、整体架构

```
wc2026-site/
├── index.html              # 首页 / 导航
├── matches/                # 赛事信息
│   └── index.html          #   小组赛看板 + 淘汰赛树形图（Tabs 切换）
├── dashboard/              # 数据看板
│   └── index.html          #   积分总览、射手榜、精彩看点
├── news/                   # 资讯博客
│   ├── index.html          #   文章列表
│   └── article.html        #   文章详情（模板）
├── teams/                  # 球队详情
│   └── index.html          #   48 队卡片
├── assets/
│   ├── css/
│   │   └── style.css       # 全局样式（暗色主题世界杯风格）
│   └── js/
│       ├── data-groups.js  # 🗄️ 小组赛数据（分组、积分、射手榜、精彩看点）
│       ├── data-knockout.js # 🗄️ 淘汰赛数据（R32→Final + 文章）
│       └── app.js          # 通用交互逻辑 + ESPN 实时数据引擎
└── tools/
    ├── refresh_data.py     # ESPN → data-knockout.js 自动更新脚本
    ├── gen_knockout_block.js  # 淘汰赛配对生成工具
    └── refresh_knockout.js    # 淘汰赛状态参考
```

## 二、页面详细设计

### 1️⃣ 赛事信息页

**小组赛（看板模式）**
- 12 个小组（A-L）以卡片网格排列，每小组一张「看板」
- 每张看板包含：小组名、四队积分榜（排名 / 队名 / 赛 / 胜 / 平 / 负 / 进 / 失 / 净 / 分）
- 每个小组的已赛结果列表
- 颜色标识：晋级区/淘汰区

**淘汰赛（树形图）**
- R32 → R16 → QF → SF → Final + 3rd Place
- 左右双侧汇聚布局：上半区左、下半区右，决赛居中
- 已完赛标注比分 + 点球信息(国家 (X) N-N (Y) 国家)
- R32 卡片支持状态标签（LIVE / FT / 比赛日期）

### 2️⃣ 数据看板

- 🏆 **积分总览**：12 组积分横向对比
- ⚽ **射手榜**：金靴奖竞争实时排名（Top 10）
- 🤝 **助攻榜**：助攻榜 Top 10
- 📊 **精彩看点**：最大比分、冷门、精彩对决

### 3️⃣ 资讯博客

- 文章列表页：按时间倒序排列
- 文章详情页：支持 `?id=a17` 参数读取对应文章
- AI 自动战报，覆盖小组赛全程

## 三、技术方案

| 项目 | 选择 |
|------|------|
| 前端 | 纯 HTML + CSS + JavaScript（零依赖，快速部署） |
| 样式 | 暗色主题，世界杯品牌配色（深蓝/金/白） |
| 数据 | 双文件结构：data-groups.js（静态）+ data-knockout.js（动态更新） |
| 实时数据 | 页面加载后自动从 ESPN API 获取，5 分钟自动刷新 |
| 部署 | GitHub Pages / 任意静态托管 |
| 响应式 | 移动端优先，适配手机/平板/桌面 |

## 四、数据更新

```bash
# 快速更新（仅比分）
python3 tools/refresh_data.py --no-scorers

# 完整更新（含射手榜）
python3 tools/refresh_data.py

# 更新并推送到 GitHub
python3 tools/refresh_data.py --push
```

---

⚽ 2026 FIFA World Cup · Unofficial Fan Site