# 2026 世界杯网站 · 自动数据更新方案

## 一、目标

每天自动抓取最新世界杯赛果，更新 `data.js` 中的比赛比分、积分榜、淘汰赛对阵，让网站始终展示最新数据。

## 二、更新频率

| 时段 | 北京时间 | UTC | 说明 |
|:----:|:--------:|:---:|:----|
| ☀️ 早更 | **09:00** | 01:00 | 更新前夜北美晚间场赛果 |
| 🌆 晚更 | **16:00** | 08:00 | 更新当天所有已赛完比赛 |

## 三、技术方案

### 3.1 数据抓取脚本

**位置**：`/home/admin/wc2026-site/scripts/fetch-live-data.sh`

**流程**：
```
1. 用 curl 抓取公开世界杯数据源（如 ESPN、FIFA 官网）
2. 解析 HTML/JSON 提取：
   - 已赛完比赛的比分
   - 各队积分、净胜球、排名
   - 淘汰赛对阵和晋级球队
   - 射手榜数据
3. 对比当前 data.js 中的数据
4. 如果有变化 → 更新 data.js
5. 如果没有变化 → 跳过（避免无意义的部署）
```

### 3.2 数据源选择

优先使用以下免费公开来源（无需 API Key）：

| 来源 | 类型 | 可靠性 |
|:----|:----|:------:|
| `site:espn.com/football` 世界杯页面 | 公开 HTML | ⭐⭐⭐⭐⭐ |
| `site:fifa.com` 官方赛程 | 公开 HTML | ⭐⭐⭐⭐⭐ |
| Wikipedia "2026 FIFA World Cup" 页面 | 公开 HTML | ⭐⭐⭐⭐ |
| 或 football-data.org 免费 API（需注册） | API | ⭐⭐⭐⭐⭐ |

### 3.3 数据变更检测

脚本执行后：
- **数据有变化** → 生成新的 `data.js` → 自动提交 git（如果有 repo）或直接覆盖
- **数据无变化** → 输出 "No changes" 并安静退出

### 3.4 定时任务（Cronjob）

使用 Hermes cronjob 设置两个定时触发器：

```yaml
cronjob 1:
  时间: 每天 01:00 UTC（09:00 北京时间）
  动作: 运行 fetch-live-data.sh，检查更新

cronjob 2:
  时间: 每天 08:00 UTC（16:00 北京时间）
  动作: 运行 fetch-live-data.sh，检查更新
```

### 3.5 通知方式

- 更新成功 → 微信推送 "✅ 世界杯数据已更新" + 新增赛果摘要
- 无变化 → 静默跳过
- 抓取失败 → 微信告警 "⚠️ 数据抓取失败，将下次重试"

## 四、文件变更范围

### 更新 `data.js` 中的以下部分：

```javascript
// 1. 各组比赛比分（已赛完的比赛）
matches: [
  { round: 1, date: 'Jun 11', home: 'GER', away: 'CUW', homeScore: 7, awayScore: 1, status: 'completed' },
  // ... 更新为新赛果
]

// 2. 各组积分榜
teams: [
  { code: 'GER', name: 'Germany', played: 2, won: 2, ..., pts: 6 },
  // ... 更新积分、净胜球、排名
]

// 3. 淘汰赛对阵（当晋级球队确定后）
knockout: {
  round32: [ ... ],  // 更新已确定的对阵
  // ...
}

// 4. 射手榜
topScorers: [
  { player: '...', team: 'GER', goals: 5 },
  // ...
]
```

### 不涉及修改：
- `index.html` — 页面结构不变
- `style.css` — 样式不变
- `app.js` — 渲染逻辑不变

## 五、执行步骤

### Step 1 — 创建数据抓取脚本
创建 `scripts/fetch-live-data.sh`，包含：
- 从公开数据源抓取比赛结果
- 解析并更新 data.js
- 变更检测逻辑

### Step 2 — 本地测试
手动运行脚本，验证能否正确抓取并更新数据。

### Step 3 — 设置 Cronjob
创建两个 Hermes cronjob：
1. `wc2026-data-morning` — 每天 09:00 CST
2. `wc2026-data-evening` — 每天 16:00 CST

### Step 4 — 验证
观察第一次自动执行是否正常。

## 六、回滚方案

如果脚本出错导致 data.js 损坏：
- 备份机制：每次更新前自动备份为 `data.js.bak`
- 手动恢复：复制备份文件即可还原