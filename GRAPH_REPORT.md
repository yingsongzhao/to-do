# Graph Report - .  (2026-07-15)

## Corpus Check
- Corpus is ~39,157 words - fits in a single context window. You may not need a graph.

## Summary
- 116 nodes · 166 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Playwright UI Screenshots
- Task Modal & UI Components
- Demo Data & Smart Lists
- App Shell & Layout
- State Management & Animation
- Scheduling & Notifications
- View Rendering & Filtering
- Task Completion & Drag Flow
- Core Utility Functions
- Date & Lookup Helpers
- Priority UI Element
- Final Screenshot

## God Nodes (most connected - your core abstractions)
1. `提醒事项 (Reminders Demo)` - 11 edges
2. `dateKey()` - 9 edges
3. `提醒事项 App Shell` - 9 edges
4. `UI Snapshot: Initial Today View (3 tasks, no times)` - 9 edges
5. `Smart Lists Navigation` - 8 edges
6. `taskMarkup()` - 7 edges
7. `Task Edit/Create Modal` - 7 edges
8. `Reminders today view with scheduled times visible` - 7 edges
9. `renderTasks()` - 6 edges
10. `renderSidebar()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Step 3: Interactive Experience (app.js)` --conceptually_related_to--> `Task Edit/Create Modal`  [INFERRED]
  .zcode/plans/plan-sess_e623a11d-c165-4cca-af1b-8a3e7fced7dc.md → index.html
- `Smart Lists Feature` --conceptually_related_to--> `Smart Lists Navigation`  [INFERRED]
  README.md → index.html
- `UI Snapshot: Initial Today View (3 tasks, no times)` --conceptually_related_to--> `Today Smart Card (今天)`  [INFERRED]
  .playwright-cli/page-2026-07-15T02-06-41-571Z.yml → index.html
- `Custom Lists Feature` --conceptually_related_to--> `My Lists Section (我的列表)`  [INFERRED]
  README.md → index.html
- `UI Snapshot: Edit Task Modal (整理项目周报)` --conceptually_related_to--> `Task Edit/Create Modal`  [INFERRED]
  .playwright-cli/page-2026-07-15T02-49-23-531Z.yml → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Smart Lists View System (Today/Scheduled/All/Flagged/Completed)** — index_html_smart_lists, index_html_today_card, index_html_scheduled_card, index_html_all_card, index_html_flagged_card, index_html_completed_card [EXTRACTED 1.00]
- **Demo Task-List Assignments (tasks belong to personal/work lists)** — demo_task_dentist, demo_task_call_mom, demo_list_personal [EXTRACTED 1.00]
- **Three-File Implementation (HTML+CSS+JS)** — plan_sess_e623_static_page, plan_sess_e623_visual_language, plan_sess_e623_interactive [EXTRACTED 1.00]

## Communities (12 total, 2 thin omitted)

### Community 0 - "Playwright UI Screenshots"
Cohesion: 0.09
Nodes (27): Reminders app initial view with context menu open, Reminders context menu, High priority indicator (!!!), Reminders sidebar with smart lists, Reminder: Call mom (给妈妈打电话), Reminder: Dental appointment (预约牙医复诊), Reminder: Project weekly report (整理项目周报), Today task list view (+19 more)

### Community 1 - "Task Modal & UI Components"
Cohesion: 0.17
Nodes (16): Priority Selector (高/中/低/无), Repeat Options (每天/每周/每月/每年/工作日/农历), Task Edit/Create Modal, UI Snapshot: Edit Task Modal (整理项目周报), UI Snapshot: New Task Modal Open, Graphify Extraction Pipeline Plan, Browser Notification API, Custom Lists Feature (+8 more)

### Community 2 - "Demo Data & Smart Lists"
Cohesion: 0.17
Nodes (15): Demo List: 个人 (Personal), Demo List: 购物清单 (Shopping), Demo List: 工作 (Work), Demo Task: 给妈妈打电话, Demo Task: 预约牙医复诊确认周五下午的时间, Demo Task: 整理项目周报补充本周的进度和风险, All Smart Card (全部), Completed Smart Card (已完成) (+7 more)

### Community 3 - "App Shell & Layout"
Cohesion: 0.15
Nodes (14): About Modal, app.js Script Reference, Content Main Area, List Color Selector, List Create Modal (新建列表), My Lists Section (我的列表), 提醒事项 App Shell, Sidebar (aside) (+6 more)

### Community 4 - "State Management & Animation"
Cohesion: 0.15
Nodes (5): notifiedTaskIds, PARTICLE_COLORS, seed, state, today

### Community 5 - "Scheduling & Notifications"
Cohesion: 0.33
Nodes (9): checkReminders(), dateKey(), daysFromNow(), formatTime(), getNextRepeatDate(), saveNotificationState(), sendNotification(), shortDate() (+1 more)

### Community 6 - "View Rendering & Filtering"
Cohesion: 0.25
Nodes (9): getViewTasks(), groupTasks(), incompleteCount(), isToday(), render(), renderSidebar(), renderTasks(), saveState() (+1 more)

### Community 7 - "Task Completion & Drag Flow"
Cohesion: 0.40
Nodes (5): Today view with reorderable task list and blue selection borders, Today view after marking task complete with updated counts, Task completion state with updated sidebar counts, Today view with all three reminders visible, Drag-to-reorder visual with blue selection borders

### Community 8 - "Core Utility Functions"
Cohesion: 0.67
Nodes (3): escapeHtml(), getCurrentTime(), openTaskModal()

### Community 9 - "Date & Lookup Helpers"
Cohesion: 0.67
Nodes (3): formatDate(), listById(), viewInfo()

## Knowledge Gaps
- **33 isolated node(s):** `today`, `seed`, `state`, `notifiedTaskIds`, `PARTICLE_COLORS` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `提醒事项 App Shell` connect `App Shell & Layout` to `Task Modal & UI Components`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `Smart Lists Navigation` connect `Demo Data & Smart Lists` to `Task Modal & UI Components`, `App Shell & Layout`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `提醒事项 (Reminders Demo)` connect `Task Modal & UI Components` to `App Shell & Layout`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `UI Snapshot: Initial Today View (3 tasks, no times)` (e.g. with `Smart Lists Navigation` and `Today Smart Card (今天)`) actually correct?**
  _`UI Snapshot: Initial Today View (3 tasks, no times)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Smart Lists Navigation` (e.g. with `UI Snapshot: Initial Today View (3 tasks, no times)` and `Smart Lists Feature`) actually correct?**
  _`Smart Lists Navigation` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `today`, `seed`, `state` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Playwright UI Screenshots` be split into smaller, more focused modules?**
  _Cohesion score 0.09116809116809117 - nodes in this community are weakly interconnected._