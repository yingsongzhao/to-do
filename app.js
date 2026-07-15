const STORAGE_KEY = "reminders-demo-v1";
const $ = (selector) => document.querySelector(selector);

const today = new Date();
const dateKey = (date) => date.toISOString().slice(0, 10);
const formatDate = (date) => new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(date);
const daysFromNow = (offset) => { const date = new Date(today); date.setDate(date.getDate() + offset); return dateKey(date); };

const seed = {
  lists: [
    { id: "personal", name: "个人", color: "#0a84ff" },
    { id: "work", name: "工作", color: "#ff9f0a" },
    { id: "shopping", name: "购物清单", color: "#30d158" },
  ],
  tasks: [
    { id: "t1", listId: "personal", title: "预约牙医复诊", notes: "确认周五下午的时间", date: daysFromNow(0), time: "14:00", priority: "high", flagged: false, completed: false },
    { id: "t2", listId: "work", title: "整理项目周报", notes: "补充本周的进度和风险", date: daysFromNow(0), time: "10:00", priority: "medium", flagged: true, completed: false },
    { id: "t3", listId: "personal", title: "给妈妈打电话", notes: "", date: daysFromNow(0), time: "19:00", priority: "none", flagged: false, completed: false },
    { id: "t4", listId: "shopping", title: "购买咖啡豆", notes: "中度烘焙", date: daysFromNow(1), time: "09:00", priority: "low", flagged: false, completed: false },
    { id: "t5", listId: "work", title: "发送设计评审邀请", notes: "", date: daysFromNow(-1), time: "", priority: "none", flagged: false, completed: true },
  ],
};

let state = loadState();
let currentView = "today";
let editingTaskId = null;
let searchQuery = "";
let showCompleted = true;
let currentSort = "default";

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(seed); }
  catch { return structuredClone(seed); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function isToday(task) { return task.date === dateKey(today); }
function incompleteCount(tasks) { return tasks.filter((task) => !task.completed).length; }
function listById(id) { return state.lists.find((list) => list.id === id); }

function getViewTasks() {
  let tasks;
  switch (currentView) {
    case "today": tasks = state.tasks.filter(isToday); break;
    case "scheduled": tasks = state.tasks.filter((task) => task.date); break;
    case "all": tasks = state.tasks; break;
    case "flagged": tasks = state.tasks.filter((task) => task.flagged); break;
    case "completed": tasks = state.tasks.filter((task) => task.completed); break;
    default: tasks = state.tasks.filter((task) => task.listId === currentView);
  }
  // 搜索过滤
  if (searchQuery) {
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery))
    );
  }
  // 隐藏已完成
  if (!showCompleted && currentView !== "completed") {
    tasks = tasks.filter((task) => !task.completed);
  }
  return tasks;
}

function viewInfo() {
  const smart = {
    today: ["今天", formatDate(today)], scheduled: ["已计划", "按日期排列的提醒事项"], all: ["全部", "所有提醒事项"],
    flagged: ["旗标", "标记为重要的提醒事项"], completed: ["已完成", "已完成的提醒事项"],
  };
  if (smart[currentView]) return smart[currentView];
  const list = listById(currentView);
  return [list?.name || "提醒事项", "我的列表"];
}

function renderSidebar() {
  $("#today-date").textContent = today.getDate();
  $("#count-today").textContent = incompleteCount(state.tasks.filter(isToday));
  $("#count-scheduled").textContent = incompleteCount(state.tasks.filter((task) => task.date));
  $("#count-all").textContent = incompleteCount(state.tasks);
  $("#count-flagged").textContent = incompleteCount(state.tasks.filter((task) => task.flagged));
  $("#count-completed").textContent = state.tasks.filter((task) => task.completed).length;

  document.querySelectorAll(".smart-card").forEach((card) => card.classList.toggle("active", card.dataset.view === currentView));
  $("#list-navigation").innerHTML = state.lists.map((list) => `
    <button class="list-item ${currentView === list.id ? "active" : ""}" data-view="${list.id}">
      <span class="list-dot" style="background:${list.color}">☰</span><span>${escapeHtml(list.name)}</span>
      <span class="count">${incompleteCount(state.tasks.filter((task) => task.listId === list.id))}</span>
    </button>`).join("");
}

function renderTasks() {
  const [title, subtitle] = viewInfo();
  $("#view-title").textContent = title;
  $("#view-subtitle").textContent = subtitle;
  const tasks = getViewTasks();
  const groups = groupTasks(tasks);
  $("#task-groups").innerHTML = tasks.length === 0 ? "" : groups.map(([heading, group]) => `
    <section class="task-group"><h3 class="group-title">${heading}</h3><div class="task-list">
      ${group.map(taskMarkup).join("")}
    </div></section>`).join("");
  $("#empty-state").hidden = tasks.length > 0;
}

function groupTasks(tasks) {
  if (currentView === "today") return [["今天", tasks]];
  if (["all", "scheduled"].includes(currentView)) {
    const buckets = new Map();
    tasks.forEach((task) => {
      const label = task.date ? new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(new Date(`${task.date}T12:00:00`)) : "无日期";
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label).push(task);
    });
    return [...buckets.entries()];
  }
  return [[currentView === "completed" ? "已完成" : "提醒事项", tasks]];
}

function taskMarkup(task) {
  const list = listById(task.listId);
  const isOverdue = task.date && task.date < dateKey(today) && !task.completed;
  const due = task.date ? `<span class="due-date ${isOverdue ? "overdue" : ""}">${shortDate(task.date)}${task.time ? ` ${formatTime(task.time)}` : ""}</span>` : "";
  const priority = task.priority !== "none" ? `<span class="priority">${task.priority === "high" ? "!!!" : task.priority === "medium" ? "!!" : "!"}</span>` : "";
  const listColor = list?.color || "#86868b";
  const bgStyle = `background: ${listColor}08; border-left: 3px solid ${listColor};`;
  return `<article class="task-row ${task.completed ? "completed" : ""}" data-task-id="${task.id}" draggable="true" style="${bgStyle}">
    <button class="task-toggle ${task.completed ? "done" : ""}" data-action="toggle" aria-label="${task.completed ? "取消完成" : "完成"}">${task.completed ? "✓" : ""}</button>
    <button class="task-main" data-action="edit"><span class="task-copy"><span class="task-name">${escapeHtml(task.title)}</span>${task.notes ? `<span class="task-notes">${escapeHtml(task.notes)}</span>` : ""}</span><span class="task-meta">${priority}${due}<span title="${escapeHtml(list?.name || "")}" class="list-color" style="width:8px;height:8px;border-radius:50%;background:${list?.color || "#86868b"}"></span></span></button>
    <button class="task-flag ${task.flagged ? "active" : ""}" data-action="flag" aria-label="旗标"></button>
    <button class="task-delete" data-action="delete" aria-label="删除">×</button>
  </article>`;
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const period = hour >= 12 ? "下午" : "上午";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period}${displayHour}:${m}`;
}

function shortDate(value) {
  if (value === dateKey(today)) return "今天";
  const tomorrow = daysFromNow(1);
  if (value === tomorrow) return "明天";
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(new Date(`${value}T12:00:00`));
}
function escapeHtml(value) { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }
function render() { renderSidebar(); renderTasks(); }

function openTaskModal(task = null, flagged = false) {
  editingTaskId = task?.id || null;
  $("#task-modal-title").textContent = task ? "编辑提醒事项" : "新建提醒事项";
  $("#task-title").value = task?.title || "";
  $("#task-notes").value = task?.notes || "";
  $("#task-date").value = task?.date || (currentView === "today" ? dateKey(today) : "");
  // 新建时默认当前时间，编辑时保持原时间
  $("#task-time").value = task?.time || getCurrentTime();
  $("#task-priority").value = task?.priority || "none";
  $("#task-flagged").checked = task?.flagged || flagged;
  $("#task-repeat").value = task?.repeat || "none";
  $("#task-delete-btn").hidden = !task;
  // 填充列表选项
  const listSelect = $("#task-list");
  listSelect.innerHTML = state.lists.map((list) =>
    `<option value="${list.id}" ${task?.listId === list.id ? "selected" : ""}>${escapeHtml(list.name)}</option>`
  ).join("");
  $("#task-modal").hidden = false;
  setTimeout(() => $("#task-title").focus(), 30);
}

function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

$("#task-delete-btn").addEventListener("click", () => {
  if (!editingTaskId) return;
  if (confirm("确定要删除这个提醒事项吗？")) {
    state.tasks = state.tasks.filter((item) => item.id !== editingTaskId);
    saveState(); closeModal("task-modal"); render();
  }
});
function closeModal(id) { $(`#${id}`).hidden = true; }

$("#task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const selectedList = data.get("list") || (listById(currentView) ? currentView : "personal");
  const task = {
    id: editingTaskId || uid("task"),
    listId: selectedList,
    title: data.get("title").trim(), notes: data.get("notes").trim(),
    date: data.get("date"), time: data.get("time") || "",
    priority: data.get("priority"), flagged: data.get("flagged") === "on",
    repeat: data.get("repeat") || "none", advance: data.get("advance") || "0",
    completed: false,
  };
  if (editingTaskId) {
    const original = state.tasks.find((item) => item.id === editingTaskId);
    // 保留完成状态，但允许更改列表
    Object.assign(original, task, { completed: original.completed });
  } else state.tasks.unshift(task);
  saveState(); closeModal("task-modal"); render();
});

$("#list-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const list = { id: uid("list"), name: data.get("name").trim(), color: data.get("color") };
  state.lists.push(list); currentView = list.id; saveState(); closeModal("list-modal"); event.currentTarget.reset(); render();
});

$("#add-task").addEventListener("click", () => openTaskModal());
$("#quick-flag").addEventListener("click", () => openTaskModal(null, true));
$("#add-list").addEventListener("click", () => $("#list-modal").hidden = false);
$("#add-list-bottom").addEventListener("click", () => $("#list-modal").hidden = false);
$("#open-sidebar").addEventListener("click", () => $("#sidebar").classList.add("open"));
$("#close-sidebar").addEventListener("click", () => $("#sidebar").classList.remove("open"));

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) { currentView = viewButton.dataset.view; $("#sidebar").classList.remove("open"); render(); return; }
  const taskRow = event.target.closest("[data-task-id]");
  if (taskRow) {
    const task = state.tasks.find((item) => item.id === taskRow.dataset.taskId);
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "toggle") {
      task.completed = !task.completed;
      if (task.completed) {
        playCelebration(taskRow, task);
        // 处理重复任务
        if (task.repeat && task.repeat !== "none" && task.date) {
          const nextDate = getNextRepeatDate(task.date, task.repeat);
          if (nextDate) {
            const newTask = {
              ...task,
              id: uid("task"),
              date: nextDate,
              completed: false,
            };
            state.tasks.push(newTask);
          }
        }
      }
    }
    if (action === "flag") task.flagged = !task.flagged;
    if (action === "edit") { openTaskModal(task); return; }
    if (action === "delete") { if (confirm("确定要删除这个提醒事项吗？")) { state.tasks = state.tasks.filter((item) => item.id !== task.id); } }
    if (action) { saveState(); render(); }
  }
  const close = event.target.closest("[data-close-modal]");
  if (close) closeModal(close.dataset.closeModal);
  if (event.target.classList.contains("modal-backdrop")) event.target.hidden = true;
});

/* ===== 下拉菜单功能 ===== */
function toggleDropdown(menuId) {
  const menu = $(`#${menuId}`);
  const isHidden = menu.hidden;
  document.querySelectorAll(".dropdown-menu").forEach((m) => (m.hidden = true));
  if (isHidden) menu.hidden = false;
}

$("#sidebar-more").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleDropdown("sidebar-dropdown");
});

$("#content-more").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleDropdown("content-dropdown");
});

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu").forEach((m) => (m.hidden = true));
});

document.querySelectorAll(".dropdown-menu").forEach((menu) => {
  menu.addEventListener("click", (e) => e.stopPropagation());
});

/* ===== 搜索功能 ===== */
$("#btn-search").addEventListener("click", () => {
  const container = $("#search-container");
  container.hidden = !container.hidden;
  if (!container.hidden) {
    setTimeout(() => $("#search-input").focus(), 50);
  } else {
    searchQuery = "";
    $("#search-input").value = "";
    render();
  }
});

$("#search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderTasks();
});

/* ===== 显示/隐藏已完成 ===== */
$("#btn-show-completed").addEventListener("click", () => {
  showCompleted = !showCompleted;
  $("#btn-show-completed").textContent = showCompleted ? "✓ 隐藏已完成" : "✓ 显示已完成";
  renderTasks();
});

/* ===== 排序功能 ===== */
$("#btn-sort-name").addEventListener("click", () => {
  currentSort = "name";
  sortTasks();
});

$("#btn-sort-date").addEventListener("click", () => {
  currentSort = "date";
  sortTasks();
});

$("#btn-sort-priority").addEventListener("click", () => {
  currentSort = "priority";
  sortTasks();
});

function sortTasks() {
  const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
  state.tasks.sort((a, b) => {
    if (currentSort === "name") return a.title.localeCompare(b.title, "zh-CN");
    if (currentSort === "date") {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    }
    if (currentSort === "priority") return priorityOrder[b.priority] - priorityOrder[a.priority];
    return 0;
  });
  saveState();
  render();
}

/* ===== 切换已完成显示 ===== */
$("#btn-toggle-completed").addEventListener("click", () => {
  showCompleted = !showCompleted;
  $("#btn-toggle-completed").textContent = showCompleted ? "✓ 隐藏已完成" : "✓ 显示已完成";
  $("#btn-show-completed").textContent = showCompleted ? "✓ 隐藏已完成" : "✓ 显示已完成";
  renderTasks();
});

/* ===== 关于弹窗 ===== */
$("#btn-about").addEventListener("click", () => {
  $("#about-total").textContent = state.tasks.length;
  $("#about-completed").textContent = state.tasks.filter((t) => t.completed).length;
  $("#about-lists").textContent = state.lists.length;
  $("#about-modal").hidden = false;
});

/* ===== 浏览器通知提醒 ===== */
const NOTIFICATION_KEY = "reminders-notifications";
let notificationEnabled = false;
let notifiedTaskIds = new Set();

function loadNotificationState() {
  try {
    const saved = localStorage.getItem(NOTIFICATION_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      notifiedTaskIds = new Set(data.notifiedIds || []);
      notificationEnabled = data.enabled || false;
    }
  } catch {}
}

function saveNotificationState() {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify({
    enabled: notificationEnabled,
    notifiedIds: [...notifiedTaskIds],
    date: dateKey(today),
  }));
}

function updateNotificationButton() {
  const btn = $("#btn-notifications");
  if (!("Notification" in window)) {
    btn.textContent = "🔕 浏览器不支持";
    btn.style.opacity = "0.5";
    return;
  }
  const permission = Notification.permission;
  if (permission === "granted") {
    btn.textContent = notificationEnabled ? "🔔 提醒已开启" : "🔕 提醒已关闭";
  } else if (permission === "denied") {
    btn.textContent = " 通知被拒绝";
    btn.style.opacity = "0.5";
  } else {
    btn.textContent = "🔔 开启提醒";
  }
}

$("#btn-notifications").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("你的浏览器不支持通知功能");
    return;
  }
  if (Notification.permission === "denied") {
    alert("你已拒绝通知权限，请在浏览器设置中允许 todo.clawopen.ink 发送通知");
    return;
  }
  if (Notification.permission === "granted") {
    notificationEnabled = !notificationEnabled;
    saveNotificationState();
    updateNotificationButton();
    if (notificationEnabled) {
      checkReminders();
    }
    return;
  }
  // permission === "default" — 需要请求权限
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    notificationEnabled = true;
    saveNotificationState();
    // 发送一条测试通知
    new Notification("提醒事项", {
      body: "通知已开启！到期的任务会自动提醒你。",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>",
    });
    updateNotificationButton();
    checkReminders();
  } else {
    updateNotificationButton();
  }
});

function sendNotification(task) {
  if (!notificationEnabled || Notification.permission !== "granted") return;
  const list = listById(task.listId);
  const listName = list?.name || "提醒事项";
  const title = task.title;
  const timeStr = task.time ? ` · ${formatTime(task.time)}` : "";
  const body = task.notes ? `${task.notes}${timeStr} · ${listName}` : `${listName}${timeStr}`;
  try {
    new Notification(`📌 ${title}`, {
      body,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>",
      tag: task.id, // 同一任务不重复弹出
      requireInteraction: false,
    });
    notifiedTaskIds.add(task.id);
    saveNotificationState();
  } catch {}
}

function checkReminders() {
  if (!notificationEnabled || Notification.permission !== "granted") return;
  // 清理过期的通知记录（日期变了就重置）
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIFICATION_KEY));
    if (saved && saved.date !== dateKey(today)) {
      notifiedTaskIds = new Set();
    }
  } catch {}

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // 找出到期时间已到、未完成、未通知的任务
  const dueTasks = state.tasks.filter((task) => {
    if (task.completed || !task.date || notifiedTaskIds.has(task.id)) return false;
    // 日期必须≤今天
    if (task.date > dateKey(today)) return false;
    // 如果设了具体时间，需要时间也到了
    if (task.time) {
      const [h, m] = task.time.split(":").map(Number);
      const taskMinutes = h * 60 + m;
      if (taskMinutes > nowMinutes) return false;
    }
    return true;
  });
  dueTasks.forEach(sendNotification);
}

// 页面加载时初始化
loadNotificationState();
updateNotificationButton();
// 启动后检查一次，然后每 60 秒检查一次
checkReminders();
setInterval(checkReminders, 60000);

render();

/* ===== 重复日期计算 ===== */
function getNextRepeatDate(dateStr, repeat) {
  const date = new Date(dateStr + "T12:00:00");
  const next = new Date(date);
  switch (repeat) {
    case "daily": next.setDate(next.getDate() + 1); break;
    case "weekly": next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly": next.setFullYear(next.getFullYear() + 1); break;
    case "weekday":
      // 找到下一个工作日
      do { next.setDate(next.getDate() + 1); } while (next.getDay() === 0 || next.getDay() === 6);
      break;
    case "lunar":
      // 农历简化：近似按 29.5 天计算
      next.setDate(next.getDate() + 30);
      break;
    default: return null;
  }
  return dateKey(next);
}

/* ===== 任务完成庆祝动画 ===== */
const PARTICLE_COLORS = ["#534AB7", "#1D9E75", "#D85A30", "#D4537E", "#378ADD", "#EF9F27", "#639922"];

function playCelebration(taskRow, task) {
  // Layer a: Background transition
  taskRow.classList.add("celebrating");
  setTimeout(() => taskRow.classList.remove("celebrating"), 2000);

  // Layer b: Checkmark animation
  const toggle = taskRow.querySelector(".task-toggle");
  if (toggle) {
    toggle.classList.add("celebrate-check");
    toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
    setTimeout(() => toggle.classList.remove("celebrate-check"), 400);
  }

  // Layer c: Particle burst
  const rect = taskRow.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  for (let i = 0; i < 28; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.5;
    const distance = 60 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rot = (Math.random() - 0.5) * 720;
    particle.style.cssText = `
      left: ${centerX - 4}px;
      top: ${centerY - 4}px;
      background: ${PARTICLE_COLORS[i % PARTICLE_COLORS.length]};
      --tx: ${tx}px;
      --ty: ${ty}px;
      --rot: ${rot}deg;
      animation-delay: ${Math.random() * 0.15}s;
    `;
    document.body.appendChild(particle);
    requestAnimationFrame(() => particle.classList.add("animate"));
    setTimeout(() => particle.remove(), 1350);
  }

  // Layer d: "任务完成" toast
  const toast = document.createElement("div");
  toast.className = "complete-toast";
  toast.textContent = "你真棒";
  toast.style.left = `${centerX - 30}px`;
  toast.style.top = `${centerY - 15}px`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => toast.remove(), 1500);
}

/* ===== 拖拽排序 ===== */
let draggedTaskId = null;

document.addEventListener("dragstart", (e) => {
  const row = e.target.closest(".task-row");
  if (!row) return;
  draggedTaskId = row.dataset.taskId;
  row.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedTaskId);
});

document.addEventListener("dragend", (e) => {
  const row = e.target.closest(".task-row");
  if (row) row.classList.remove("dragging");
  document.querySelectorAll(".task-row").forEach((r) => r.classList.remove("drag-over"));
  draggedTaskId = null;
});

document.addEventListener("dragover", (e) => {
  const row = e.target.closest(".task-row");
  if (!row || row.dataset.taskId === draggedTaskId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  document.querySelectorAll(".task-row").forEach((r) => r.classList.remove("drag-over"));
  row.classList.add("drag-over");
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  const targetRow = e.target.closest(".task-row");
  if (!targetRow || !draggedTaskId) return;
  const targetId = targetRow.dataset.taskId;
  if (draggedTaskId === targetId) return;

  const fromIdx = state.tasks.findIndex((t) => t.id === draggedTaskId);
  const toIdx = state.tasks.findIndex((t) => t.id === targetId);
  if (fromIdx < 0 || toIdx < 0) return;

  const [moved] = state.tasks.splice(fromIdx, 1);
  state.tasks.splice(toIdx, 0, moved);
  saveState();
  render();
});
