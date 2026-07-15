# 提醒事项 (Reminders Demo)

一个仿 Apple Reminders 风格的网页版待办提醒应用，纯静态实现，无需构建工具。

**线上地址：** <https://todo.clawopen.ink>

---

## 功能特性

### 智能列表
- **今天** — 查看今天到期的任务
- **已计划** — 按日期排列所有有日期的任务
- **全部** — 所有提醒事项
- **旗标** — 标记为重要的事项
- **已完成** — 已完成的事项

### 自定义列表
- 新建列表并设置颜色
- 每个事项左边框和底色自动匹配列表颜色
- 支持在编辑弹窗中切换事项归属的列表

### 任务管理
- 创建 / 编辑 / 删除提醒事项
- 设置标题、备注、日期、时间
- 优先级：高 / 中 / 低 / 无
- 旗标标记重要事项
- 勾选完成时播放庆祝动画（粒子 + 对勾 + "你真棒" 提示）

### 重复任务
- 不重复 / 每天 / 每周 / 每月 / 每年
- 工作日重复（跳过周末）
- 农历重复（简化，约 30 天周期）

### 其他功能
- **拖拽排序** — 上下拖拽调整任务顺序
- **搜索** — 按标题或备注模糊搜索
- **浏览器通知** — 开启后到期的任务会自动推送通知（每 60 秒检查一次）
- **显示/隐藏已完成** — 一键切换已完成任务的可见性
- **排序** — 按名称 / 日期 / 优先级排序
- **本地持久化** — 数据保存在浏览器 localStorage 中，刷新不丢失

---

## 技术栈

| 层 | 技术 |
|---|---|
| 结构 | HTML5 |
| 样式 | CSS3（系统字体、Grid、Flexbox、Keyframe 动画） |
| 逻辑 | Vanilla JavaScript（ES6+） |
| 存储 | localStorage |
| 通知 | Browser Notification API |
| 部署 | Nginx + Let's Encrypt SSL |

无框架、无构建工具、无外部依赖，开箱即用。

---

## 文件结构

```
D:\zcode\0714daiban\
├── index.html      # 页面结构（侧栏、主区域、弹窗）
├── styles.css      # 样式（Apple 风格视觉语言）
├── app.js          # 全部逻辑（数据管理、渲染、交互、动画）
└── README.md       # 本文件
```

---

## 本地运行

直接在浏览器中打开 `index.html`，或使用任意静态服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

---

## 线上部署

服务器：阿里云 `139.224.223.125`  
Nginx 版本：1.20.1  
域名：`todo.clawopen.ink`  
SSL：Let's Encrypt

### Nginx 配置位置

```
/etc/nginx/conf.d/todo.conf
```

### 静态文件位置

```
/usr/share/nginx/todo/
├── index.html
├── styles.css
└── app.js
```

### 缓存策略

| 资源 | 策略 |
|---|---|
| HTML | `no-cache`（始终验证） |
| JS | `no-cache`（始终验证） |
| CSS | `max-age=86400`（1 天） |

版本更新通过在 HTML 中给 CSS/JS 加 `?v=N` 参数实现缓存击穿。

### 部署方式

使用 Python paramiko 通过 SFTP 上传文件并 reload Nginx：

```python
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("139.224.223.125", port=22, username="root", password="<密码>")
sftp = ssh.open_sftp()

for f in ["index.html", "styles.css", "app.js"]:
    sftp.put(f, f"/usr/share/nginx/todo/{f}")

ssh.exec_command("nginx -s reload")
sftp.close()
ssh.close()
```

> **安全提示：** 包含密码的部署脚本用后请立即删除。

---

## 数据说明

首次打开时会自动生成示例数据（3 个列表、5 个任务）。所有数据保存在浏览器 localStorage 中：

| Key | 内容 |
|---|---|
| `reminders-demo-v1` | 列表与任务数据 |
| `reminders-notifications` | 通知开关与已通知记录 |

清除浏览器数据即可恢复初始示例。

---

## 浏览器兼容

- Chrome / Edge 90+
- Firefox 88+
- Safari 15+
- 移动端浏览器均可使用（响应式布局）

---

## 与生产环境的差异

当前为纯前端 DEMO，与完整上线方案相比缺少：

| 项目 | DEMO | 生产环境 |
|---|---|---|
| 数据存储 | localStorage | 后端数据库（MySQL/PostgreSQL） |
| 多设备同步 | ❌ | ✅ 通过账号体系 |
| 推送通知 | 仅浏览器在线时 | 服务端推送（APNs / FCM / 微信模板消息） |
| 用户体系 | ❌ | 登录 / 注册 / 多用户 |
| 协作共享 | ❌ | 共享列表、分配任务 |
| 离线支持 | ❌ | Service Worker + IndexedDB |
