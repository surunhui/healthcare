// 统一获取页面节点，后续所有交互都围绕这些元素展开。
const navLinks = document.querySelectorAll(".nav-link");
const panels = document.querySelectorAll(".panel");
const loginOverlay = document.querySelector("#login-overlay");
const loginForm = document.querySelector("#login-form");
const breadcrumbCurrent = document.querySelector("#breadcrumb-current");
const notificationCount = document.querySelector("#notification-count");
const notificationList = document.querySelector("#notification-list");
const notificationFilters = document.querySelectorAll(".notification-filter");
const welcomeTitle = document.querySelector("#welcome-title");
const welcomeText = document.querySelector("#welcome-text");
const sqlResult = document.querySelector("#sql-result");
const sqlPageStatus = document.querySelector("#sql-page-status");
const sqlPrev = document.querySelector("#sql-prev");
const sqlNext = document.querySelector("#sql-next");
const sqlLoading = document.querySelector("#sql-loading");
const dbSearch = document.querySelector("#db-search");
const dbSortToggle = document.querySelector("#db-sort-toggle");
const dbExport = document.querySelector("#db-export");
const apiResponseView = document.querySelector("#api-response-view");
const apiLogResult = document.querySelector("#api-log-result");
const apiLoading = document.querySelector("#api-loading");
const serverOutput = document.querySelector("#server-output");
const serverLoading = document.querySelector("#server-loading");
const tomcatBadge = document.querySelector("#tomcat-badge");
const portBadge = document.querySelector("#port-badge");
const diskBadge = document.querySelector("#disk-badge");
const tomcatText = document.querySelector("#tomcat-text");
const portText = document.querySelector("#port-text");
const diskText = document.querySelector("#disk-text");
const jumpServerButton = document.querySelector("#jump-server");
const detailModal = document.querySelector("#detail-modal");
const modalClose = document.querySelector("#modal-close");
const modalTitle = document.querySelector("#modal-title");
const modalSubtitle = document.querySelector("#modal-subtitle");
const modalBody = document.querySelector("#modal-body");
const dbView = document.querySelector("#db-view");
const dbDept = document.querySelector("#db-dept");
const apiMode = document.querySelector("#api-mode");
const serverMode = document.querySelector("#server-mode");
const currentRole = document.querySelector("#current-role");
const logoutButton = document.querySelector("#logout-button");
const metricLabel1 = document.querySelector("#metric-label-1");
const metricValue1 = document.querySelector("#metric-value-1");
const metricTrend1 = document.querySelector("#metric-trend-1");
const metricLabel2 = document.querySelector("#metric-label-2");
const metricValue2 = document.querySelector("#metric-value-2");
const metricTrend2 = document.querySelector("#metric-trend-2");
const metricLabel3 = document.querySelector("#metric-label-3");
const metricValue3 = document.querySelector("#metric-value-3");
const metricTrend3 = document.querySelector("#metric-trend-3");
const activityLog = document.querySelector("#activity-log");
const refreshLogButton = document.querySelector("#refresh-log");
const clearLogButton = document.querySelector("#clear-log");
const startDemoTourButton = document.querySelector("#start-demo-tour");
const stopDemoTourButton = document.querySelector("#stop-demo-tour");
const nextDemoStepButton = document.querySelector("#next-demo-step");
const demoStatusText = document.querySelector("#demo-status-text");
const demoOverlay = document.querySelector("#demo-overlay");
const demoTitle = document.querySelector("#demo-title");
const demoText = document.querySelector("#demo-text");
const demoContinueButton = document.querySelector("#demo-continue");
const demoSkipButton = document.querySelector("#demo-skip");
const toastStack = document.querySelector("#toast-stack");
const demoData = window.demoData;

// 这些变量用于保存当前界面状态，例如分页、排序和演示步骤。
const sqlPageSize = 2;
const defaultNotificationLevelByRole = { implementer: "all", ops: "risk", analyst: "warn" };
let sqlCurrentRows = [];
let sqlCurrentColumns = [];
let sqlCurrentPage = 1;
let sqlSortAsc = true;
let activeSortKey = "doctor";
let activeNotificationLevel = "all";
let currentUserRole = "implementer";
let demoStepIndex = -1;
let demoRunning = false;
let demoTimer = null;

// 预设演示步骤，点击“开始演示”后会按顺序执行。
const demoSteps = [
  {
    title: "总览页面就绪",
    text: "先从总览页开始，让面试官看到系统范围、通知中心和角色 KPI。",
    panel: "overview",
    status: "当前展示总览工作台。",
    action: () => setNotificationFilter(defaultNotificationLevelByRole[currentUserRole] || "all")
  },
  {
    title: "挂号统计演示",
    text: "切换到挂号数据库，执行日汇总查询，展示医生工作量和挂号收入。",
    panel: "database",
    status: "正在执行挂号日汇总。",
    action: () => document.querySelector("#run-sql-summary")?.click()
  },
  {
    title: "退费核对演示",
    text: "继续演示退费核对场景，说明为什么收费和退费需要单独审计。",
    panel: "database",
    status: "正在执行退费核对视图。",
    action: () => document.querySelector("#run-sql-refund")?.click()
  },
  {
    title: "接口成功回放",
    text: "打开接口模块，回放一条合法报文，说明正常的 HIS 到 EMR 消息链路。",
    panel: "interface",
    status: "正在回放成功接口消息。",
    action: () => document.querySelector("#send-api-success")?.click()
  },
  {
    title: "接口失败回放",
    text: "再回放一条失败报文，演示缺少必填字段时如何排查接口异常。",
    panel: "interface",
    status: "正在回放失败接口消息。",
    action: () => document.querySelector("#send-api-fail")?.click()
  },
  {
    title: "服务器风险场景",
    text: "最后切到服务器巡检，展示磁盘告警如何影响应用运行稳定性。",
    panel: "server",
    status: "正在执行节点风险场景。",
    action: () => {
      if (serverMode) serverMode.value = "risk";
      applyScenario("risk");
    }
  }
];


// 页面右上角的短提示，用来告诉用户按钮点击后发生了什么。
function showToast(type, title, message) {
  if (!toastStack) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
  toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-6px)";
    window.setTimeout(() => toast.remove(), 180);
  }, 2200);
}

// 将用户操作写入会话日志，便于页面展示和演示排查过程。
function appendLog(level, source, message) {
  const current = JSON.parse(sessionStorage.getItem("medsys_logs") || "[]");
  current.unshift({ time: new Date().toISOString(), level, source, message });
  sessionStorage.setItem("medsys_logs", JSON.stringify(current.slice(0, 80)));
  renderLogs();
}

// 把 sessionStorage 中的日志渲染到操作日志区域。
function renderLogs() {
  if (!activityLog) return;
  const current = JSON.parse(sessionStorage.getItem("medsys_logs") || "[]");
  if (current.length === 0) {
    activityLog.innerHTML = '<div class="log-item"><div class="log-message">暂无日志记录。</div></div>';
    return;
  }
  activityLog.innerHTML = current.map((item) => `
    <div class="log-item ${String(item.level || "").toLowerCase()}">
      <div class="log-time">${item.time}</div>
      <div class="log-level">${item.level}</div>
      <div class="log-source">${item.source}</div>
      <div class="log-message">${item.message}</div>
    </div>
  `).join("");
}

// 将角色代码转换为页面展示名称。
function roleLabel(role) {
  return { implementer: "实施工程师", ops: "运维工程师", analyst: "数据分析员" }[role] || "实施工程师";
}

// 根据当前角色控制菜单、按钮和首页 KPI 显示内容。
function applyRolePermissions() {
  const role = sessionStorage.getItem("medsys_role") || "implementer";
  const user = sessionStorage.getItem("medsys_user") || "demo.user";
  const avatar = document.querySelector(".user-avatar");
  const userName = document.querySelector(".user-name");
  currentUserRole = role;

  if (currentRole) currentRole.textContent = roleLabel(role);
  if (userName) userName.textContent = user;
  if (avatar) avatar.textContent = role.slice(0, 2).toUpperCase();
  if (welcomeTitle) welcomeTitle.textContent = `欢迎你，${user}。`;
  if (welcomeText) {
    const roleMessage = {
      implementer: "实施视角优先关注接口流程、挂号数据和节点风险。",
      ops: "运维视角优先关注严重告警、服务器诊断和手册动作。",
      analyst: "分析视角优先关注数据报表、接口结果和业务可追溯性。"
    };
    welcomeText.textContent = roleMessage[role];
  }

  const metrics = demoData.roleMetrics[role] || demoData.roleMetrics.implementer;
  [[metricLabel1, metricValue1, metricTrend1, metrics[0]], [metricLabel2, metricValue2, metricTrend2, metrics[1]], [metricLabel3, metricValue3, metricTrend3, metrics[2]]].forEach(([label, value, trend, metric]) => {
    if (!metric) return;
    if (label) label.textContent = metric.label;
    if (value) value.textContent = metric.value;
    if (trend) trend.textContent = metric.trend;
  });

  navLinks.forEach((button) => {
    const roles = (button.dataset.roles || "").split(",");
    button.classList.toggle("hidden", !roles.includes(role));
  });
  document.querySelectorAll("[data-roles]").forEach((element) => {
    const roles = (element.dataset.roles || "").split(",");
    element.classList.toggle("hidden", !roles.includes(role));
  });

  const activeButton = [...navLinks].find((button) => !button.classList.contains("hidden"));
  if (activeButton && !activeButton.classList.contains("active")) activatePanel(activeButton.dataset.target);
  appendLog("INFO", "AUTH", `已为用户 ${user} 初始化 ${roleLabel(role)} 工作台`);
}

// 根据登录角色进入默认面板，模拟真实系统的角色工作台入口。
function activateRoleLanding() {
  const targetPanel = sessionStorage.getItem("medsys_default_panel") || "overview";
  const targetButton = [...navLinks].find((button) => button.dataset.target === targetPanel && !button.classList.contains("hidden"));
  if (targetButton) {
    activatePanel(targetButton.dataset.target);
    appendLog("INFO", "ROLE", `默认进入页面：${targetButton.textContent}`);
  }
  if (targetPanel === "server") {
    if (serverMode) serverMode.value = "risk";
    applyScenario("risk");
  }
  if (targetPanel === "database") {
    document.querySelector("#run-sql-summary")?.click();
  }
}

// 控制左侧菜单切换，并更新当前面包屑。
function activatePanel(targetId) {
  navLinks.forEach((button) => button.classList.toggle("active", button.dataset.target === targetId));
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
    panel.classList.toggle("demo-focus", demoRunning && panel.id === targetId);
  });
  const currentLabel = [...navLinks].find((button) => button.dataset.target === targetId)?.textContent || "总览";
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = currentLabel;
}
navLinks.forEach((button) => button.addEventListener("click", () => {
  activatePanel(button.dataset.target);
  showToast("info", "页面已切换", `当前模块：${button.textContent}`);
}));

// 清理自动演示的定时器，防止重复触发。
function clearDemoTimer() {
  if (demoTimer) {
    window.clearTimeout(demoTimer);
    demoTimer = null;
  }
}

function updateDemoBanner(text) {
  if (demoStatusText) demoStatusText.textContent = text;
}

function hideDemoOverlay() {
  demoOverlay?.classList.add("hidden");
}

function showDemoOverlay(title, text) {
  if (demoTitle) demoTitle.textContent = title;
  if (demoText) demoText.textContent = text;
  demoOverlay?.classList.remove("hidden");
}

// 演示结束时恢复普通浏览状态。
function finishDemoTour(reason = "演示已完成，你可以继续手动浏览系统。") {
  clearDemoTimer();
  demoRunning = false;
  demoStepIndex = -1;
  hideDemoOverlay();
  stopDemoTourButton?.classList.add("hidden");
  panels.forEach((panel) => panel.classList.remove("demo-focus"));
  updateDemoBanner(reason);
  appendLog("INFO", "DEMO", reason);
}

function queueNextDemoStep() {
  clearDemoTimer();
  if (!demoRunning) return;
  demoTimer = window.setTimeout(() => runDemoStep(demoStepIndex + 1), 1400);
}

// 按顺序执行单个演示步骤，并把步骤说明展示在浮层中。
function runDemoStep(index) {
  clearDemoTimer();
  if (!demoRunning) return;
  if (index >= demoSteps.length) {
    finishDemoTour();
    return;
  }

  demoStepIndex = index;
  const step = demoSteps[index];
  activatePanel(step.panel);
  updateDemoBanner(step.status);
  showDemoOverlay(step.title, step.text);
  if (typeof step.action === "function") step.action();
  appendLog("INFO", "DEMO", `执行演示步骤 ${index + 1}：${step.title}`);
}

function startDemoTour() {
  clearDemoTimer();
  demoRunning = true;
  demoStepIndex = -1;
  stopDemoTourButton?.classList.remove("hidden");
  updateDemoBanner("演示已开始，可跟随浮层提示自动播放，也可手动点下一步。 ");
  appendLog("INFO", "DEMO", "已启动引导式演示");
  runDemoStep(0);
}

// 生成表格 HTML，供数据库结果和接口日志共用。
function renderTable(columns, rows, options = {}) {
  const sortable = options.sortable === true;
  const header = columns.map((column) => {
    const marker = sortable && activeSortKey === column.key ? (sqlSortAsc ? " ▲" : " ▼") : "";
    const attr = sortable ? `data-sort-key="${column.key}" class="sortable-header"` : "";
    return `<th ${attr}>${column.label}${marker}</th>`;
  }).join("");
  const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${row[column.key] ?? ""}</td>`).join("")}</tr>`).join("");
  return `<table class="data-table"><thead><tr>${header}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length}">暂无数据</td></tr>`}</tbody></table>`;
}

// 根据筛选级别渲染通知中心。
function renderNotifications() {
  if (!notificationList) return;
  const rows = demoData.notifications.filter((item) => activeNotificationLevel === "all" ? true : item.level === activeNotificationLevel);
  notificationList.innerHTML = rows.map((item) => `<div class="notification-item"><span class="notification-tag ${item.level}">${item.label}</span><div>${item.message}</div></div>`).join("");
  if (notificationCount) notificationCount.textContent = `${rows.length} 条活动`;
}

function setNotificationFilter(level) {
  activeNotificationLevel = level;
  notificationFilters.forEach((button) => button.classList.toggle("active", button.dataset.level === level));
  renderNotifications();
}
notificationFilters.forEach((button) => button.addEventListener("click", () => setNotificationFilter(button.dataset.level)));

// 更新数据库结果区的分页状态。
function updateSqlPagination() {
  const totalPages = Math.max(1, Math.ceil(sqlCurrentRows.length / sqlPageSize));
  if (sqlCurrentPage > totalPages) sqlCurrentPage = totalPages;
  const start = (sqlCurrentPage - 1) * sqlPageSize;
  const pageRows = sqlCurrentRows.slice(start, start + sqlPageSize);
  if (sqlResult) sqlResult.innerHTML = renderTable(sqlCurrentColumns, pageRows, { sortable: true });
  if (sqlPageStatus) sqlPageStatus.textContent = `第 ${sqlCurrentPage} 页 / 共 ${totalPages} 页`;
  if (sqlPrev) sqlPrev.disabled = sqlCurrentPage <= 1;
  if (sqlNext) sqlNext.disabled = sqlCurrentPage >= totalPages;
}

function setSqlDataset(columns, rows) {
  sqlCurrentColumns = columns;
  sqlCurrentRows = rows;
  sqlCurrentPage = 1;
  updateSqlPagination();
}

// 根据当前视图模式返回不同的表头和数据。
function getSqlConfig(view) {
  if (view === "refund") {
    return {
      columns: [
        { key: "regNo", label: "挂号单号" },
        { key: "paymentNo", label: "支付流水号" },
        { key: "doctor", label: "医生" },
        { key: "dept", label: "科室" },
        { key: "refund", label: "退费金额" },
        { key: "operator", label: "操作员" }
      ],
      rows: demoData.sql.refund
    };
  }
  return {
    columns: [
      { key: "doctor", label: "医生" },
      { key: "dept", label: "科室" },
      { key: "count", label: "挂号次数" },
      { key: "amount", label: "挂号总额" }
    ],
    rows: demoData.sql.summary
  };
}

// 模拟真实系统的加载中状态，让演示更接近现场体验。
function simulateLoading(element, work, delay = 350) {
  if (element) element.classList.remove("hidden");
  window.setTimeout(() => {
    work();
    if (element) element.classList.add("hidden");
  }, delay);
}

function sortRows(rows, key) {
  return [...rows].sort((a, b) => sqlSortAsc
    ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""))
    : String(b[key] ?? "").localeCompare(String(a[key] ?? "")));
}

// 应用筛选条件后返回数据库模块当前应显示的数据。
function filteredSqlRows() {
  const config = getSqlConfig(dbView.value);
  let rows = dbDept.value === "all" ? [...config.rows] : config.rows.filter((row) => row.dept === dbDept.value);
  const keyword = dbSearch.value.trim().toLowerCase();
  if (keyword) rows = rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(keyword)));
  return { columns: config.columns, rows: sortRows(rows, activeSortKey) };
}

// 将当前查询结果导出成 CSV，模拟报表导出场景。
function exportCurrentSql() {
  const header = sqlCurrentColumns.map((column) => column.label).join(",");
  const body = sqlCurrentRows.map((row) => sqlCurrentColumns.map((column) => `"${String(row[column.key] ?? "")}"`).join(",")).join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "挂号报表.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#run-sql-summary")?.addEventListener("click", () => {
  dbView.value = "summary";
  dbSearch.value = "";
  activeSortKey = "doctor";
  simulateLoading(sqlLoading, () => {
    const config = getSqlConfig("summary");
    setSqlDataset(config.columns, sortRows(config.rows, activeSortKey));
    appendLog("INFO", "SQL", "已执行挂号日汇总查询");
    showToast("success", "查询已完成", "已更新医生当日挂号汇总结果。")
  }, 450);
});

document.querySelector("#run-sql-refund")?.addEventListener("click", () => {
  dbView.value = "refund";
  dbSearch.value = "";
  activeSortKey = "doctor";
  simulateLoading(sqlLoading, () => {
    const config = getSqlConfig("refund");
    setSqlDataset(config.columns, sortRows(config.rows, activeSortKey));
    appendLog("WARN", "SQL", "已执行退费核对查询");
    showToast("info", "退费核对已完成", "已更新退费核对结果。")
  }, 450);
});

sqlPrev?.addEventListener("click", () => {
  if (sqlCurrentPage > 1) {
    sqlCurrentPage -= 1;
    updateSqlPagination();
  }
});

sqlNext?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(sqlCurrentRows.length / sqlPageSize));
  if (sqlCurrentPage < totalPages) {
    sqlCurrentPage += 1;
    updateSqlPagination();
  }
});

document.querySelector("#db-apply-filters")?.addEventListener("click", () => {
  simulateLoading(sqlLoading, () => {
    const config = filteredSqlRows();
    setSqlDataset(config.columns, config.rows);
    appendLog("INFO", "SQL", `已应用数据库筛选：科室=${dbDept.value}，视图=${dbView.value}，搜索=${dbSearch.value || "无"}`);
    showToast("success", "筛选已应用", "数据库结果已根据条件刷新。")
  });
});

dbSortToggle?.addEventListener("click", () => {
  sqlSortAsc = !sqlSortAsc;
  dbSortToggle.textContent = sqlSortAsc ? "A-Z 排序" : "Z-A 排序";
  appendLog("INFO", "SQL", `已切换排序方式：${sqlSortAsc ? "升序" : "降序"}`);
  document.querySelector("#db-apply-filters")?.click();
});

dbExport?.addEventListener("click", () => {
  exportCurrentSql();
  appendLog("INFO", "SQL", "已导出当前挂号结果为 CSV");
  showToast("success", "导出成功", "挂号报表 CSV 已开始下载。")
});

sqlResult?.addEventListener("click", (event) => {
  const header = event.target.closest("[data-sort-key]");
  if (!header) return;
  activeSortKey = header.dataset.sortKey;
  document.querySelector("#db-apply-filters")?.click();
});

document.querySelector("#send-api-success")?.addEventListener("click", () => {
  apiMode.value = "success";
  simulateLoading(apiLoading, () => {
    apiResponseView.textContent = JSON.stringify(demoData.api.success, null, 2);
    appendLog("INFO", "API", "已回放成功接口消息");
    showToast("success", "接口回放成功", "已展示合法报文的返回结果。")
  }, 300);
});

document.querySelector("#send-api-fail")?.addEventListener("click", () => {
  apiMode.value = "fail";
  simulateLoading(apiLoading, () => {
    apiResponseView.textContent = JSON.stringify(demoData.api.fail, null, 2);
    appendLog("ERROR", "API", "已回放失败接口消息：缺少必填字段");
    showToast("error", "接口回放失败", "已展示缺少必填字段的异常响应。")
  }, 300);
});

document.querySelector("#api-apply-mode")?.addEventListener("click", () => {
  simulateLoading(apiLoading, () => {
    apiResponseView.textContent = JSON.stringify(demoData.api[apiMode.value], null, 2);
    appendLog("INFO", "API", `已应用接口回放模式：${apiMode.value === "success" ? "合法报文" : "缺少必填字段"}`);
    showToast("info", "接口模式已切换", `当前模式：${apiMode.value === "success" ? "合法报文" : "缺少必填字段"}`)
  }, 300);
});

// 渲染接口日志表格，用于展示消息追踪队列。
function renderApiLogs() {
  if (!apiLogResult) return;
  apiLogResult.innerHTML = renderTable([
    { key: "selected", label: "是否选中" },
    { key: "messageId", label: "消息号" },
    { key: "traceId", label: "追踪号" },
    { key: "direction", label: "方向" },
    { key: "status", label: "状态" },
    { key: "time", label: "时间" }
  ], demoData.api.logs);
}

// 根据不同的运维场景更新服务器状态卡片和巡检输出。
function applyScenario(name) {
  const scenario = demoData.server[name];
  simulateLoading(serverLoading, () => {
    serverOutput.textContent = scenario.output;
    [[tomcatBadge, scenario.tomcat.label, scenario.tomcat.className], [portBadge, scenario.port.label, scenario.port.className], [diskBadge, scenario.disk.label, scenario.disk.className]].forEach(([element, label, className]) => {
      element.textContent = label;
      element.classList.remove("ok", "risk", "fail");
      element.classList.add(className);
    });
    tomcatText.textContent = scenario.tomcat.text;
    portText.textContent = scenario.port.text;
    diskText.textContent = scenario.disk.text;
    appendLog(scenario.disk.className === "risk" || scenario.tomcat.className === "fail" ? "ERROR" : "INFO", "OPS", `已执行服务器场景：${name}`);
    showToast(scenario.tomcat.className === "fail" ? "error" : scenario.disk.className === "risk" ? "info" : "success", "巡检结果已更新", `当前服务器场景：${name}`);
  }, 420);
}

document.querySelector("#server-normal")?.addEventListener("click", () => applyScenario("normal"));
document.querySelector("#server-risk")?.addEventListener("click", () => applyScenario("risk"));
document.querySelector("#server-fail")?.addEventListener("click", () => applyScenario("fail"));
document.querySelector("#server-apply-mode")?.addEventListener("click", () => applyScenario(serverMode.value));
jumpServerButton?.addEventListener("click", () => {
  activatePanel("server");
  if (serverMode) serverMode.value = "risk";
  applyScenario("risk");
});
logoutButton?.addEventListener("click", () => {
  appendLog("INFO", "AUTH", "用户已退出登录");
  showToast("info", "即将退出", "当前会话正在返回登录页。")
  sessionStorage.removeItem("medsys_role");
  sessionStorage.removeItem("medsys_user");
  sessionStorage.removeItem("medsys_default_panel");
  window.location.href = "login.html";
});
if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginOverlay.classList.add("hidden");
  });
}
document.querySelectorAll("[data-open-panel]").forEach((button) => button.addEventListener("click", () => {
  activatePanel(button.dataset.openPanel);
  showToast("info", "快捷入口已打开", `当前模块：${button.querySelector(".action-tile-title")?.textContent || button.dataset.openPanel}`);
}));

// 打开详情弹窗，展示当前模块的补充说明。
function openDetail(type) {
  const detail = demoData.details[type];
  modalTitle.textContent = detail.title;
  modalSubtitle.textContent = detail.subtitle;
  modalBody.innerHTML = `<div class="detail-list">${detail.items.map((item) => `<div class="detail-item">${item}</div>`).join("")}</div>`;
  detailModal.classList.remove("hidden");
}

document.querySelector("#db-open-detail")?.addEventListener("click", () => openDetail("database"));
document.querySelector("#api-open-detail")?.addEventListener("click", () => openDetail("interface"));
document.querySelector("#server-open-detail")?.addEventListener("click", () => openDetail("server"));
document.querySelector("#api-open-log-detail")?.addEventListener("click", () => openDetail("interface"));
refreshLogButton?.addEventListener("click", () => {
  renderLogs();
  showToast("info", "日志已刷新", "操作日志区域已更新。")
});
clearLogButton?.addEventListener("click", () => {
  sessionStorage.removeItem("medsys_logs");
  renderLogs();
});
startDemoTourButton?.addEventListener("click", startDemoTour);
nextDemoStepButton?.addEventListener("click", () => {
  if (!demoRunning) {
    startDemoTour();
    return;
  }
  runDemoStep(demoStepIndex + 1);
});
stopDemoTourButton?.addEventListener("click", () => finishDemoTour("演示已停止，页面仍可继续手动操作。"));
demoContinueButton?.addEventListener("click", () => {
  hideDemoOverlay();
  queueNextDemoStep();
});
demoSkipButton?.addEventListener("click", () => runDemoStep(demoStepIndex + 1));
modalClose?.addEventListener("click", () => detailModal.classList.add("hidden"));
detailModal?.addEventListener("click", (event) => {
  if (event.target === detailModal) detailModal.classList.add("hidden");
});

// 捕获页面脚本报错，统一记到操作日志中，方便演示“报错有日志”。
window.addEventListener("error", (event) => {
  appendLog("ERROR", "UI", `${event.message}，位置：${event.filename || "unknown"}:${event.lineno || 0}`);
});
window.addEventListener("unhandledrejection", (event) => {
  appendLog("ERROR", "PROMISE", `检测到未处理的 Promise 异常：${event.reason || "unknown"}`);
});

// 页面初始化：应用角色、预加载数据、设置默认通知和默认落点。
applyRolePermissions();
document.querySelector("#run-sql-summary")?.click();
if (apiResponseView) apiResponseView.textContent = JSON.stringify(demoData.api.success, null, 2);
renderApiLogs();
applyScenario("risk");
setNotificationFilter(defaultNotificationLevelByRole[currentUserRole] || "all");
activateRoleLanding();
renderLogs();
updateDemoBanner("准备演示挂号统计、接口回放与服务器巡检流程。");



