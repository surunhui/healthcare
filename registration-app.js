const SESSION_KEY = "registration_session_token";
const SECTION_KEY = "registration_current_section";

const UI = {
  title: "苏衡门诊挂号系统医院端工作台",
  loginTitle: "苏衡门诊挂号系统医院端登录",
  loginSubtitle: "登录后才可查看患者、排班、挂号和审计数据。默认演示账号见下方提示。",
  loginUsernameLabel: "用户名",
  loginPasswordLabel: "密码",
  loginSubmit: "登录",
  loginHint: "可用账号：demo.registrar / demo.supervisor，默认密码：Demo@123456",
  brandTitle: "苏衡门诊挂号系统",
  brandSubtitle: "供挂号窗口与运营管理人员使用",
  sessionCardLabel: "当前会话",
  defaultSessionName: "未登录",
  defaultSessionRole: "请先登录",
  defaultSessionNote: "这是医院端工作台，挂号员可建档和挂号，运营主管可维护排班、退号和查看审计。",
  quickLinksLabel: "目录",
  navOverview: "今日总览",
  navSchedule: "医生排班",
  navPatient: "患者建档",
  navRegistration: "发起挂号",
  navAudit: "审计日志",
  heroEyebrow: "苏衡门诊挂号系统",
  heroTitle: "面向医院工作人员的门诊挂号工作台",
  heroCopy: "用于医院窗口完成患者建档、医生排班、挂号、退号和审计管理，不是患者自助预约页面。",
  visitDateLabel: "业务日期",
  refreshAll: "刷新数据",
  logoutButton: "退出登录",
  statusReady: "系统准备中。",
  metricCountLabel: "当日挂号总数",
  metricBookedLabel: "当日实收挂号费",
  metricRefundedLabel: "当日退号金额",
  scheduleTitle: "医生排班维护",
  scheduleCopy: "按业务日期设置医生号源和停诊状态。保存动作会写入审计日志。",
  schedulePermissionTip: "当前角色没有排班维护权限。",
  scheduleDoctorLabel: "医生",
  scheduleDateLabel: "排班日期",
  scheduleQuotaLabel: "总号源",
  scheduleStatusLabel: "状态",
  scheduleAvailableYes: "出诊",
  scheduleAvailableNo: "停诊",
  scheduleSubmit: "保存排班",
  scheduleEditorTitle: "当前排班",
  scheduleEditorCopy: "上方选择排班记录后，即可在本框内完成修改、删除或新增。",
  scheduleDeleteCurrent: "删除当前",
  scheduleCreateNew: "新增排班",
  dayScheduleTitle: "当日排班与号源",
  dayScheduleCopy: "展示每位医生的总号源、已挂号数量和剩余号源。",
  schThDoctor: "医生",
  schThDept: "科室",
  schThStatus: "状态",
  schThTotal: "总号源",
  schThBooked: "已挂号",
  schThRemaining: "剩余号源",
  schThAction: "操作",
  patientTitle: "患者建档",
  patientCopy: "新患者先建档，后续挂号时可直接检索复用。",
  patientNoLabel: "患者编号",
  patientNameLabel: "姓名",
  patientGenderLabel: "性别",
  patientGenderMale: "男",
  patientGenderFemale: "女",
  patientBirthLabel: "出生日期",
  patientPhoneLabel: "手机号",
  patientIdCardLabel: "身份证号",
  patientSubmit: "保存患者",
  patientSearchTitle: "患者检索",
  patientSearchCopy: "支持按患者编号、姓名或手机号检索，检索结果可直接用于挂号。",
  patientEditorTitle: "当前患者",
  patientEditorCopy: "上方查到记录后点击编辑，即可在本框完成修改、删除或新增。",
  patientSearchButton: "查询患者",
  patientSearchPlaceholder: "输入患者编号 / 姓名 / 手机号",
  patThNo: "患者编号",
  patThName: "姓名",
  patThGender: "性别",
  patThPhone: "手机号",
  patThAction: "操作",
  patientEdit: "编辑",
  actionDelete: "删除",
  scheduleEditLoaded: "已载入排班信息，可修改后保存。",
  scheduleDeleted: "排班已删除。",
  patientDeleted: "患者已删除。",
  patientCancelEdit: "取消编辑",
  patientDeleteCurrent: "删除当前",
  patientCreateNew: "新增患者",
  patientCreateSuccess: "患者建档成功。",
  patientUpdateSuccess: "患者信息已更新。",
  patientEditLoaded: "已载入患者信息，可直接编辑。",
  patientEditCancelled: "已退出编辑状态。",
  patientSubmitCreate: "保存患者",
  patientSubmitUpdate: "保存修改",
  registrationEdit: "编辑",
  registrationEditorTitle: "当前挂号",
  registrationEditorCopy: "上方选择挂号记录后，即可在本框内完成修改、删除或新增。",
  registrationCancelEdit: "取消编辑",
  registrationCreateSuccess: "挂号成功。",
  registrationUpdateSuccess: "挂号记录已更新。",
  registrationEditLoaded: "已载入挂号记录，可修改后保存。",
  registrationEditCancelled: "已退出挂号编辑。",
  registrationSubmitCreate: "确认挂号",
  registrationSubmitUpdate: "保存挂号修改",
  registrationDeleted: "挂号记录已删除。",
  registrationDeleteCurrent: "删除当前",
  registrationCreateNew: "新增挂号",
  registrationTitle: "发起挂号",
  registrationCopy: "可见每位医生当前剩余号源。系统会在前后端双重校验，不允许超额挂号。",
  registrationPatientLabel: "患者",
  registrationDoctorLabel: "医生",
  registrationDateLabel: "就诊日期",
  registrationNoteLabel: "备注",
  registrationNotePlaceholder: "例如 初诊 / 复诊 / 家属代办说明",
  quotaTipDefault: "请选择医生查看号源。",
  registrationSubmit: "确认挂号",
  doctorStatsTitle: "医生当日统计",
  doctorStatsCopy: "将业务结果和号源一起展示，便于收费处和门诊管理查看当日运行情况。",
  statsThDoctor: "医生",
  statsThDept: "科室",
  statsThTotal: "号源",
  statsThBooked: "已挂号",
  statsThRemaining: "剩余",
  statsThAmount: "实收金额",
  recordsTitle: "挂号记录",
  recordsCopy: "可按业务日期和状态过滤，支持直接退号。",
  recordStatusAll: "全部状态",
  recordStatusBooked: "已挂号",
  recordStatusRefunded: "已退号",
  refreshRecords: "刷新记录",
  regThNo: "挂号单号",
  regThPatient: "患者",
  regThDoctor: "医生",
  regThDept: "科室",
  regThDate: "日期",
  regThFee: "费用",
  regThStatus: "状态",
  regThAction: "操作",
  auditTitle: "审计日志",
  auditCopy: "记录登录、排班维护、建档、挂号和退号等关键动作。",
  auditThTime: "时间",
  auditThActor: "操作人",
  auditThAction: "动作",
  auditThEntity: "对象",
  auditThDetail: "详情",
  patientNoPlaceholder: "例如 P202603130001",
  patientNamePlaceholder: "患者姓名",
  patientIdCardPlaceholder: "可选",
};

const ROLE_LABELS = {
  REGISTRAR: "挂号员",
  SUPERVISOR: "运营主管",
};

const ACTION_LABELS = {
  LOGIN: "登录",
  LOGOUT: "退出登录",
  CREATE_PATIENT: "新建患者",
  UPDATE_PATIENT: "修改患者",
  DELETE_PATIENT: "删除患者",
  SAVE_SCHEDULE: "保存排班",
  DELETE_SCHEDULE: "删除排班",
  CREATE_REGISTRATION: "创建挂号",
  UPDATE_REGISTRATION: "修改挂号",
  DELETE_REGISTRATION: "删除挂号",
  REFUND_REGISTRATION: "退号",
};

const ENTITY_LABELS = {
  SESSION: "会话",
  PATIENT: "患者",
  SCHEDULE: "排班",
  REGISTRATION: "挂号",
};

// 医院端页面状态：把当前登录态、患者、排班、挂号记录等数据集中放在这里。
const state = {
  token: localStorage.getItem(SESSION_KEY) || "",
  account: null,
  patients: [],
  doctors: [],
  schedules: [],
  registrations: [],
  auditLogs: [],
  hasAlignedVisitDate: false,
  currentSection: sessionStorage.getItem(SECTION_KEY) || "overview-section",
};

const loginOverlay = document.querySelector("#login-overlay");
const loginForm = document.querySelector("#login-form");
const loginUsername = document.querySelector("#login-username");
const loginPassword = document.querySelector("#login-password");
const loginError = document.querySelector("#login-error");
const sessionName = document.querySelector("#session-name");
const sessionRole = document.querySelector("#session-role");
const sessionNote = document.querySelector("#session-note");
const logoutButton = document.querySelector("#logout-button");
const visitDateInput = document.querySelector("#visit-date");
const refreshAllButton = document.querySelector("#refresh-all");
const statusStrip = document.querySelector("#status-strip");
const metricCount = document.querySelector("#metric-count");
const metricBooked = document.querySelector("#metric-booked");
const metricRefunded = document.querySelector("#metric-refunded");
const patientForm = document.querySelector("#patient-form");
const patientEditIdInput = document.querySelector("#patient-edit-id");
const patientSearchInput = document.querySelector("#patient-search");
const searchPatientsButton = document.querySelector("#search-patients");
const patientTableBody = document.querySelector("#patient-table-body");
const patientCancelEditButton = document.querySelector("#patient-cancel-edit");
const patientDeleteCurrentButton = document.querySelector("#patient-delete-current");
const patientCreateNewButton = document.querySelector("#patient-create-new");
const patientSelect = document.querySelector("#registration-patient");
const doctorSelect = document.querySelector("#registration-doctor");
const scheduleDoctorSelect = document.querySelector("#schedule-doctor");
const scheduleDateInput = document.querySelector("#schedule-date");
const scheduleQuotaInput = document.querySelector("#schedule-quota");
const scheduleAvailableSelect = document.querySelector("#schedule-available");
const scheduleForm = document.querySelector("#schedule-form");
const scheduleDeleteCurrentButton = document.querySelector("#schedule-delete-current");
const scheduleCreateNewButton = document.querySelector("#schedule-create-new");
const schedulePermissionTip = document.querySelector("#schedule-permission-tip");
const scheduleTableBody = document.querySelector("#schedule-table-body");
const registrationForm = document.querySelector("#registration-form");
const registrationEditIdInput = document.querySelector("#registration-edit-id");
const registrationDateInput = document.querySelector("#registration-date");
const quotaTip = document.querySelector("#quota-tip");
const registrationSubmit = document.querySelector("#registration-submit");
const registrationDeleteCurrentButton = document.querySelector("#registration-delete-current");
const registrationCreateNewButton = document.querySelector("#registration-create-new");
const registrationCancelEditButton = document.querySelector("#registration-cancel-edit");
const recordStatusSelect = document.querySelector("#record-status");
const refreshRecordsButton = document.querySelector("#refresh-records");
const registrationTableBody = document.querySelector("#registration-table-body");
const doctorStatsBody = document.querySelector("#doctor-stats-body");
const auditTableBody = document.querySelector("#audit-table-body");
const auditWorkspaceSection = document.querySelector("#audit-workspace-section");
const auditSection = document.querySelector("#audit-section");
const auditNavLink = document.querySelector("#nav-audit");
const workspaceSections = Array.from(document.querySelectorAll(".workspace-section"));
const directoryLinks = Array.from(document.querySelectorAll("[data-target-section]"));

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.textContent = value;
  }
}

function setPlaceholder(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.placeholder = value;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyStaticCopy() {
  document.title = UI.title;
  Object.entries({
    "login-title": UI.loginTitle,
    "login-subtitle": UI.loginSubtitle,
    "login-username-label": UI.loginUsernameLabel,
    "login-password-label": UI.loginPasswordLabel,
    "login-submit": UI.loginSubmit,
    "login-hint": UI.loginHint,
    "brand-title": UI.brandTitle,
    "brand-subtitle": UI.brandSubtitle,
    "session-card-label": UI.sessionCardLabel,
    "quick-links-label": UI.quickLinksLabel,
    "nav-overview": UI.navOverview,
    "nav-schedule": UI.navSchedule,
    "nav-patient": UI.navPatient,
    "nav-registration": UI.navRegistration,
    "nav-audit": UI.navAudit,
    "hero-eyebrow": UI.heroEyebrow,
    "hero-title": UI.heroTitle,
    "hero-copy": UI.heroCopy,
    "visit-date-label": UI.visitDateLabel,
    "refresh-all": UI.refreshAll,
    "logout-button": UI.logoutButton,
    "status-strip": UI.statusReady,
    "metric-count-label": UI.metricCountLabel,
    "metric-booked-label": UI.metricBookedLabel,
    "metric-refunded-label": UI.metricRefundedLabel,
    "schedule-title": UI.scheduleTitle,
    "schedule-copy": UI.scheduleCopy,
    "schedule-permission-tip": UI.schedulePermissionTip,
    "schedule-doctor-label": UI.scheduleDoctorLabel,
    "schedule-date-label": UI.scheduleDateLabel,
    "schedule-quota-label": UI.scheduleQuotaLabel,
    "schedule-status-label": UI.scheduleStatusLabel,
    "schedule-available-yes": UI.scheduleAvailableYes,
    "schedule-available-no": UI.scheduleAvailableNo,
    "schedule-submit": UI.scheduleSubmit,
    "schedule-editor-title": UI.scheduleEditorTitle,
    "schedule-editor-copy": UI.scheduleEditorCopy,
    "schedule-delete-current": UI.scheduleDeleteCurrent,
    "schedule-create-new": UI.scheduleCreateNew,
    "day-schedule-title": UI.dayScheduleTitle,
    "day-schedule-copy": UI.dayScheduleCopy,
    "sch-th-doctor": UI.schThDoctor,
    "sch-th-dept": UI.schThDept,
    "sch-th-status": UI.schThStatus,
    "sch-th-total": UI.schThTotal,
    "sch-th-booked": UI.schThBooked,
    "sch-th-remaining": UI.schThRemaining,
    "sch-th-action": UI.schThAction,
    "patient-title": UI.patientTitle,
    "patient-copy": UI.patientCopy,
    "patient-no-label": UI.patientNoLabel,
    "patient-name-label": UI.patientNameLabel,
    "patient-gender-label": UI.patientGenderLabel,
    "patient-gender-m": UI.patientGenderMale,
    "patient-gender-f": UI.patientGenderFemale,
    "patient-birth-label": UI.patientBirthLabel,
    "patient-phone-label": UI.patientPhoneLabel,
    "patient-id-card-label": UI.patientIdCardLabel,
    "patient-submit": UI.patientSubmit,
    "patient-search-title": UI.patientSearchTitle,
    "patient-search-copy": UI.patientSearchCopy,
    "patient-editor-title": UI.patientEditorTitle,
    "patient-editor-copy": UI.patientEditorCopy,
    "search-patients": UI.patientSearchButton,
    "pat-th-no": UI.patThNo,
    "pat-th-name": UI.patThName,
    "pat-th-gender": UI.patThGender,
    "pat-th-phone": UI.patThPhone,
    "pat-th-action": UI.patThAction,
    "registration-title": UI.registrationTitle,
    "registration-copy": UI.registrationCopy,
    "registration-patient-label": UI.registrationPatientLabel,
    "registration-doctor-label": UI.registrationDoctorLabel,
    "registration-date-label": UI.registrationDateLabel,
    "registration-note-label": UI.registrationNoteLabel,
    "quota-tip": UI.quotaTipDefault,
    "registration-submit": UI.registrationSubmit,
    "registration-editor-title": UI.registrationEditorTitle,
    "registration-editor-copy": UI.registrationEditorCopy,
    "registration-delete-current": UI.registrationDeleteCurrent,
    "registration-create-new": UI.registrationCreateNew,
    "doctor-stats-title": UI.doctorStatsTitle,
    "doctor-stats-copy": UI.doctorStatsCopy,
    "stats-th-doctor": UI.statsThDoctor,
    "stats-th-dept": UI.statsThDept,
    "stats-th-total": UI.statsThTotal,
    "stats-th-booked": UI.statsThBooked,
    "stats-th-remaining": UI.statsThRemaining,
    "stats-th-amount": UI.statsThAmount,
    "records-title": UI.recordsTitle,
    "records-copy": UI.recordsCopy,
    "record-status-all": UI.recordStatusAll,
    "record-status-booked": UI.recordStatusBooked,
    "record-status-refunded": UI.recordStatusRefunded,
    "refresh-records": UI.refreshRecords,
    "reg-th-no": UI.regThNo,
    "reg-th-patient": UI.regThPatient,
    "reg-th-doctor": UI.regThDoctor,
    "reg-th-dept": UI.regThDept,
    "reg-th-date": UI.regThDate,
    "reg-th-fee": UI.regThFee,
    "reg-th-status": UI.regThStatus,
    "reg-th-action": UI.regThAction,
    "registration-cancel-edit": UI.registrationCancelEdit,
    "audit-title": UI.auditTitle,
    "audit-copy": UI.auditCopy,
    "audit-th-time": UI.auditThTime,
    "audit-th-actor": UI.auditThActor,
    "audit-th-action": UI.auditThAction,
    "audit-th-entity": UI.auditThEntity,
    "audit-th-detail": UI.auditThDetail,
    "patient-cancel-edit": UI.patientCancelEdit,
    "patient-delete-current": UI.patientDeleteCurrent,
    "patient-create-new": UI.patientCreateNew,
  }).forEach(([id, value]) => setText(id, value));

  setPlaceholder("patient-no", UI.patientNoPlaceholder);
  setPlaceholder("patient-name", UI.patientNamePlaceholder);
  setPlaceholder("patient-id-card", UI.patientIdCardPlaceholder);
  setPlaceholder("patient-search", UI.patientSearchPlaceholder);
  setPlaceholder("registration-note", UI.registrationNotePlaceholder);
  document.querySelector("#patient-submit").textContent = UI.patientSubmitCreate;
  registrationSubmit.textContent = UI.registrationSubmitCreate;
  setSession(state.token, state.account);
}

function isSupervisor() {
  return state.account?.role_name === "SUPERVISOR";
}

function roleLabel(roleName) {
  return ROLE_LABELS[roleName] || UI.defaultSessionRole;
}

function actionLabel(actionName) {
  return ACTION_LABELS[actionName] || actionName;
}

function entityLabel(entityType) {
  return ENTITY_LABELS[entityType] || entityType;
}

function setStatus(message, kind = "info") {
  statusStrip.textContent = message;
  statusStrip.dataset.kind = kind;
}

function formatRefreshTime(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function setSession(token, account) {
  state.token = token;
  state.account = account;
  if (token) {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }

  sessionName.textContent = account?.display_name || UI.defaultSessionName;
  sessionRole.textContent = roleLabel(account?.role_name);
  sessionNote.textContent = account?.role_name === "SUPERVISOR"
    ? "当前可维护排班、退号并查看审计日志。"
    : account?.role_name === "REGISTRAR"
      ? "当前可建档、维护排班、发起或修改挂号，但不查看审计日志。"
      : UI.defaultSessionNote;

  applyRoleView();
}

// 医院端所有 fetch 都走统一入口，便于自动带 token 和统一处理错误。
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get("Content-Type") || "";
  const raw = await response.text();
  const data = contentType.includes("application/json") ? JSON.parse(raw || "{}") : { error: raw || "请求失败" };
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

// 搜索结果和编辑表单是同卡片协作，所以先渲染列表，再由编辑按钮回填表单。
function renderPatients() {
  patientTableBody.innerHTML = state.patients.map((patient) => `
    <tr>
      <td>${escapeHtml(patient.patient_no)}</td>
      <td>${escapeHtml(patient.patient_name)}</td>
      <td>${patient.gender === "M" ? "男" : "女"}</td>
      <td>${escapeHtml(patient.phone || "-")}</td>
      <td><button class="text-button" type="button" data-edit-patient-id="${patient.patient_id}">${UI.patientEdit}</button></td>
    </tr>
  `).join("") || '<tr><td colspan="5">暂无患者数据</td></tr>';

  patientSelect.innerHTML = state.patients.map((patient) => `
    <option value="${patient.patient_id}">
      ${escapeHtml(patient.patient_name)} (${escapeHtml(patient.patient_no)})
    </option>
  `).join("") || '<option value="">请先创建患者</option>';
}

function renderDoctorOptions() {
  const currentDoctorId = String(doctorSelect.value || "");
  const preferredDoctor = state.doctors.find((doctor) => String(doctor.doctor_id) === currentDoctorId)
    || state.doctors.find((doctor) => Number(doctor.available) === 1 && Number(doctor.remaining_quota) > 0)
    || state.doctors.find((doctor) => Number(doctor.available) === 1)
    || state.doctors[0];

  doctorSelect.innerHTML = state.doctors.map((doctor) => {
    const fee = Number(doctor.fee_amount).toFixed(2);
    const scheduleText = Number(doctor.available) === 1
      ? `剩余 ${doctor.remaining_quota}/${doctor.total_quota}`
      : "停诊";
    return `<option value="${doctor.doctor_id}">${escapeHtml(doctor.doctor_name)} / ${escapeHtml(doctor.dept_name)} / CNY ${fee} / ${escapeHtml(scheduleText)}</option>`;
  }).join("") || '<option value="">暂无可选医生</option>';
  doctorSelect.value = preferredDoctor ? String(preferredDoctor.doctor_id) : "";

  scheduleDoctorSelect.innerHTML = state.doctors.map((doctor) => `
    <option value="${doctor.doctor_id}">${escapeHtml(doctor.doctor_name)} / ${escapeHtml(doctor.dept_name)}</option>
  `).join("") || '<option value="">暂无医生</option>';

  updateQuotaTip();
}

function renderSchedules() {
  scheduleTableBody.innerHTML = state.schedules.map((item) => `
    <tr>
      <td>${escapeHtml(item.doctor_name)}</td>
      <td>${escapeHtml(item.dept_name)}</td>
      <td><span class="badge ${Number(item.available) === 1 ? "ok" : "warn"}">${Number(item.available) === 1 ? "出诊" : "停诊"}</span></td>
      <td>${item.total_quota}</td>
      <td>${item.booked_count}</td>
      <td>${item.remaining_quota}</td>
      <td>
        <button class="text-button" type="button" data-edit-schedule-doctor="${item.doctor_id}" data-edit-schedule-date="${item.visit_date}">${UI.patientEdit}</button>
      </td>
    </tr>
  `).join("") || '<tr><td colspan="7">当前日期暂无排班</td></tr>';
}

function renderOverview(data) {
  metricCount.textContent = String(data.summary.total_count || 0);
  metricBooked.textContent = Number(data.summary.booked_amount || 0).toFixed(2);
  metricRefunded.textContent = Number(data.summary.refunded_amount || 0).toFixed(2);
  doctorStatsBody.innerHTML = data.doctor_stats.map((item) => `
    <tr>
      <td>${escapeHtml(item.doctor_name)}</td>
      <td>${escapeHtml(item.dept_name)}</td>
      <td>${item.total_quota || 0}</td>
      <td>${item.reg_count || 0}</td>
      <td>${item.remaining_quota || 0}</td>
      <td>${Number(item.booked_amount || 0).toFixed(2)}</td>
    </tr>
  `).join("") || '<tr><td colspan="6">暂无统计数据</td></tr>';
}

function renderRegistrations() {
  registrationTableBody.innerHTML = state.registrations.map((item) => `
    <tr>
      <td>${escapeHtml(item.reg_no)}</td>
      <td>${escapeHtml(item.patient_name)}</td>
      <td>${escapeHtml(item.doctor_name)}</td>
      <td>${escapeHtml(item.dept_name)}</td>
      <td>${escapeHtml(item.visit_date)}</td>
      <td>${Number(item.reg_fee).toFixed(2)}</td>
      <td><span class="badge ${item.status === "BOOKED" ? "ok" : "warn"}">${item.status === "BOOKED" ? "已挂号" : "已退号"}</span></td>
      <td>
        ${item.status === "BOOKED" ? `<button class="text-button" type="button" data-edit-registration-id="${item.reg_id}">${UI.registrationEdit}</button>` : "-"}
        ${item.status === "BOOKED" && isSupervisor() ? `<button class="text-button" type="button" data-refund-id="${item.reg_id}">退号</button>` : ""}
      </td>
    </tr>
  `).join("") || '<tr><td colspan="8">暂无挂号记录</td></tr>';
}

function showWorkspaceSection(sectionId) {
  state.currentSection = sectionId;
  sessionStorage.setItem(SECTION_KEY, sectionId);
  workspaceSections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== sectionId);
  });
  directoryLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.targetSection === sectionId);
  });
}

function renderAuditLogs() {
  auditTableBody.innerHTML = state.auditLogs.map((item) => `
    <tr>
      <td>${escapeHtml(item.created_at)}</td>
      <td>${escapeHtml(item.actor_name)}</td>
      <td>${actionLabel(item.action_name)}</td>
      <td>${escapeHtml(entityLabel(item.entity_type))}${item.entity_id ? ` #${escapeHtml(item.entity_id)}` : ""}</td>
      <td>${escapeHtml(item.detail_text || "-")}</td>
    </tr>
  `).join("") || '<tr><td colspan="5">暂无审计日志</td></tr>';
}

function populatePatientForm(patient) {
  patientEditIdInput.value = String(patient.patient_id);
  document.querySelector("#patient-no").value = patient.patient_no || "";
  document.querySelector("#patient-name").value = patient.patient_name || "";
  document.querySelector("#patient-gender").value = patient.gender || "M";
  document.querySelector("#patient-birth-date").value = patient.birth_date || "";
  document.querySelector("#patient-phone").value = patient.phone || "";
  document.querySelector("#patient-id-card").value = patient.id_card || "";
  document.querySelector("#patient-submit").textContent = UI.patientSubmitUpdate;
  patientDeleteCurrentButton.classList.remove("hidden");
  patientCreateNewButton.classList.remove("hidden");
  patientCancelEditButton.classList.remove("hidden");
}

function resetPatientForm() {
  patientEditIdInput.value = "";
  patientForm.reset();
  document.querySelector("#patient-gender").value = "M";
  document.querySelector("#patient-submit").textContent = UI.patientSubmitCreate;
  patientDeleteCurrentButton.classList.add("hidden");
  patientCreateNewButton.classList.add("hidden");
  patientCancelEditButton.classList.add("hidden");
}

function populateRegistrationForm(record) {
  registrationEditIdInput.value = String(record.reg_id);
  patientSelect.value = String(record.patient_id);
  doctorSelect.value = String(record.doctor_id);
  registrationDateInput.value = record.visit_date || visitDateInput.value;
  document.querySelector("#registration-note").value = record.note || "";
  registrationSubmit.textContent = UI.registrationSubmitUpdate;
  registrationDeleteCurrentButton.classList.remove("hidden");
  registrationCreateNewButton.classList.remove("hidden");
  registrationCancelEditButton.classList.remove("hidden");
  updateQuotaTip();
}

function populateScheduleForm(schedule) {
  scheduleDoctorSelect.value = String(schedule.doctor_id);
  scheduleDateInput.value = schedule.visit_date || visitDateInput.value;
  scheduleQuotaInput.value = schedule.total_quota;
  scheduleAvailableSelect.value = String(schedule.available);
  document.querySelector("#schedule-submit").textContent = UI.scheduleSubmit;
  scheduleDeleteCurrentButton.classList.remove("hidden");
  scheduleCreateNewButton.classList.remove("hidden");
}

function resetScheduleForm() {
  scheduleDoctorSelect.value = state.doctors[0] ? String(state.doctors[0].doctor_id) : "";
  scheduleDateInput.value = visitDateInput.value;
  scheduleQuotaInput.value = 10;
  scheduleAvailableSelect.value = "1";
  document.querySelector("#schedule-submit").textContent = UI.scheduleSubmit;
  scheduleDeleteCurrentButton.classList.add("hidden");
  scheduleCreateNewButton.classList.add("hidden");
}

function resetRegistrationForm() {
  registrationEditIdInput.value = "";
  registrationDateInput.value = visitDateInput.value;
  document.querySelector("#registration-note").value = "";
  registrationSubmit.textContent = UI.registrationSubmitCreate;
  registrationDeleteCurrentButton.classList.add("hidden");
  registrationCreateNewButton.classList.add("hidden");
  registrationCancelEditButton.classList.add("hidden");
  updateQuotaTip();
}

function updateQuotaTip() {
  const currentDoctorId = Number(doctorSelect.value || 0);
  const doctor = state.doctors.find((item) => Number(item.doctor_id) === currentDoctorId);
  if (!doctor) {
    quotaTip.textContent = UI.quotaTipDefault;
    registrationSubmit.disabled = true;
    return;
  }
  if (Number(doctor.available) !== 1) {
    quotaTip.textContent = `${doctor.doctor_name} 在所选日期停诊，不能挂号。`;
    registrationSubmit.disabled = true;
    return;
  }
  quotaTip.textContent = `${doctor.doctor_name} 当前剩余号源 ${doctor.remaining_quota}/${doctor.total_quota}。`;
  registrationSubmit.disabled = doctor.remaining_quota <= 0;
}

async function loadDoctors() {
  const data = await request(`/api/doctors?date=${visitDateInput.value}`);
  state.doctors = data.items;
  renderDoctorOptions();
}

async function alignVisitDateIfNeeded() {
  const hasOpenDoctor = state.doctors.some((doctor) => Number(doctor.available) === 1);
  const hasSchedule = state.schedules.length > 0;
  if (hasOpenDoctor || hasSchedule || state.hasAlignedVisitDate) {
    return false;
  }
  const data = await request(`/api/default-visit-date?date=${visitDateInput.value}`);
  const suggestedDate = data.visit_date || visitDateInput.value;
  if (!suggestedDate || suggestedDate === visitDateInput.value) {
    state.hasAlignedVisitDate = true;
    return false;
  }
  state.hasAlignedVisitDate = true;
  visitDateInput.value = suggestedDate;
  registrationDateInput.value = suggestedDate;
  scheduleDateInput.value = suggestedDate;
  return true;
}

async function loadSchedules() {
  const data = await request(`/api/schedules?date=${visitDateInput.value}`);
  state.schedules = data.items;
  renderSchedules();
}

async function loadPatients(keyword = "") {
  const query = keyword ? `?q=${encodeURIComponent(keyword)}` : "";
  const data = await request(`/api/patients${query}`);
  state.patients = data.items;
  renderPatients();
}

async function loadOverview() {
  const data = await request(`/api/overview?date=${visitDateInput.value}`);
  renderOverview(data);
}

async function loadRegistrations() {
  const status = recordStatusSelect.value ? `&status=${encodeURIComponent(recordStatusSelect.value)}` : "";
  const data = await request(`/api/registrations?date=${visitDateInput.value}${status}`);
  state.registrations = data.items;
  renderRegistrations();
}

async function loadAuditLogs() {
  if (!isSupervisor()) {
    state.auditLogs = [];
    renderAuditLogs();
    return;
  }
  const data = await request("/api/audit-logs?limit=30");
  state.auditLogs = data.items;
  renderAuditLogs();
}

function applyRoleView() {
  const supervisor = isSupervisor();
  auditWorkspaceSection.classList.toggle("hidden", !supervisor);
  auditNavLink?.classList.toggle("hidden", !supervisor);
  if (!supervisor && directoryLinks.some((link) => link.classList.contains("active") && link.dataset.targetSection === "audit-workspace-section")) {
    showWorkspaceSection("overview-section");
  }
  schedulePermissionTip.classList.add("hidden");
  scheduleForm.querySelectorAll("input, select, button").forEach((element) => {
    element.disabled = false;
  });
}

async function refreshAll() {
  setStatus("正在同步最新数据...", "info");
  await Promise.all([
    loadDoctors(),
    loadSchedules(),
    loadPatients(patientSearchInput.value.trim()),
    loadOverview(),
    loadRegistrations(),
    loadAuditLogs(),
  ]);
  if (await alignVisitDateIfNeeded()) {
    await Promise.all([
      loadDoctors(),
      loadSchedules(),
      loadPatients(patientSearchInput.value.trim()),
      loadOverview(),
      loadRegistrations(),
      loadAuditLogs(),
    ]);
  }
  setStatus(`数据已刷新，业务日期 ${visitDateInput.value}，刷新时间 ${formatRefreshTime()}`, "info");
}

async function restoreSession() {
  if (!state.token) {
    loginOverlay.classList.remove("hidden");
    return;
  }
  try {
    const data = await request("/api/me");
    setSession(state.token, data.account);
    loginOverlay.classList.add("hidden");
    await refreshAll();
  } catch (error) {
    setSession("", null);
    loginOverlay.classList.remove("hidden");
    setStatus(error.message, "error");
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  loginError.classList.add("hidden");
  try {
    const data = await request("/api/login", {
      method: "POST",
      headers: {},
      body: JSON.stringify({
        username: loginUsername.value.trim(),
        password: loginPassword.value,
      }),
    });
    setSession(data.token, data.account);
    loginOverlay.classList.add("hidden");
    await refreshAll();
    setStatus("登录成功。", "success");
  } catch (error) {
    loginError.textContent = error.message;
    loginError.classList.remove("hidden");
  }
});

logoutButton?.addEventListener("click", async () => {
  if (!state.token) {
    return;
  }
  try {
    await request("/api/logout", { method: "POST", body: "{}" });
  } catch (error) {
    setStatus(error.message, "error");
  }
  setSession("", null);
  state.auditLogs = [];
  renderAuditLogs();
  applyRoleView();
  loginOverlay.classList.remove("hidden");
  setStatus("已退出登录。", "info");
});

patientForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    patient_no: document.querySelector("#patient-no").value.trim(),
    patient_name: document.querySelector("#patient-name").value.trim(),
    gender: document.querySelector("#patient-gender").value,
    birth_date: document.querySelector("#patient-birth-date").value,
    phone: document.querySelector("#patient-phone").value.trim(),
    id_card: document.querySelector("#patient-id-card").value.trim(),
  };
  try {
    const editingId = patientEditIdInput.value.trim();
    const savedPatient = await request("/api/patients", {
      method: "POST",
      headers: editingId ? { "X-Patient-Edit": "1" } : {},
      body: JSON.stringify({ ...payload, patient_id: editingId || "" }),
    });
    resetPatientForm();
    await Promise.all([loadPatients(), loadAuditLogs()]);
    patientSelect.value = String(savedPatient.patient_id);
    setStatus(editingId ? UI.patientUpdateSuccess : UI.patientCreateSuccess, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

patientCancelEditButton?.addEventListener("click", () => {
  resetPatientForm();
  setStatus(UI.patientEditCancelled, "info");
});

patientCreateNewButton?.addEventListener("click", () => {
  resetPatientForm();
  document.querySelector("#patient-no").focus();
  setStatus(UI.patientEditCancelled, "info");
});

scheduleCreateNewButton?.addEventListener("click", () => {
  resetScheduleForm();
  showWorkspaceSection("schedule-section");
  setStatus(UI.scheduleEditLoaded, "info");
});

scheduleDeleteCurrentButton?.addEventListener("click", () => {
  const doctorId = Number(scheduleDoctorSelect.value || 0);
  const visitDate = scheduleDateInput.value;
  if (!doctorId || !visitDate) {
    return;
  }
  request("/api/schedules", {
    method: "POST",
    headers: { "X-Schedule-Delete": "1" },
    body: JSON.stringify({ doctor_id: doctorId, visit_date: visitDate }),
  })
    .then(() => Promise.all([loadSchedules(), loadDoctors(), loadOverview(), loadAuditLogs()]))
    .then(() => resetScheduleForm())
    .then(() => setStatus(UI.scheduleDeleted, "success"))
    .catch((error) => setStatus(error.message, "error"));
});

registrationCreateNewButton?.addEventListener("click", () => {
  resetRegistrationForm();
  patientSelect.focus();
  showWorkspaceSection("registration-section");
  setStatus(UI.registrationEditCancelled, "info");
});

registrationDeleteCurrentButton?.addEventListener("click", () => {
  const regId = Number(registrationEditIdInput.value || 0);
  if (!regId) {
    return;
  }
  request("/api/registrations", {
    method: "POST",
    headers: { "X-Registration-Delete": "1" },
    body: JSON.stringify({ reg_id: regId }),
  })
    .then(() => {
      resetRegistrationForm();
      return Promise.all([loadDoctors(), loadSchedules(), loadOverview(), loadRegistrations(), loadAuditLogs()]);
    })
    .then(() => setStatus(UI.registrationDeleted, "success"))
    .catch((error) => setStatus(error.message, "error"));
});

patientDeleteCurrentButton?.addEventListener("click", () => {
  const editingId = Number(patientEditIdInput.value || 0);
  const patientNo = document.querySelector("#patient-no").value.trim();
  if (!editingId) {
    return;
  }
  request("/api/patients", {
    method: "POST",
    headers: { "X-Patient-Delete": "1" },
    body: JSON.stringify({ patient_id: editingId }),
  })
    .then(() => {
      resetPatientForm();
      return Promise.all([
        loadPatients(patientSearchInput.value.trim()),
        loadDoctors(),
        loadSchedules(),
        loadOverview(),
        loadRegistrations(),
        loadAuditLogs(),
      ]);
    })
    .then(() => {
      showWorkspaceSection("patient-workspace-section");
      setStatus(`${UI.patientDeleted} ${patientNo || ""}`.trim(), "success");
    })
    .catch((error) => setStatus(error.message, "error"));
});

scheduleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    doctor_id: Number(scheduleDoctorSelect.value),
    visit_date: scheduleDateInput.value,
    total_quota: Number(scheduleQuotaInput.value),
    available: scheduleAvailableSelect.value === "1",
  };
  try {
    await request("/api/schedules", { method: "POST", body: JSON.stringify(payload) });
    await Promise.all([loadSchedules(), loadDoctors(), loadOverview(), loadAuditLogs()]);
    resetScheduleForm();
    setStatus("排班已保存。", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

searchPatientsButton?.addEventListener("click", async () => {
  try {
    await loadPatients(patientSearchInput.value.trim());
    setStatus("患者检索已完成。", "info");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

registrationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const editingId = registrationEditIdInput.value.trim();
  const payload = {
    reg_id: editingId || "",
    patient_id: patientSelect.value,
    doctor_id: doctorSelect.value,
    visit_date: registrationDateInput.value,
    note: document.querySelector("#registration-note").value.trim(),
  };
  try {
    await request("/api/registrations", { method: "POST", body: JSON.stringify(payload) });
    resetRegistrationForm();
    await Promise.all([loadDoctors(), loadSchedules(), loadOverview(), loadRegistrations(), loadAuditLogs()]);
    setStatus(editingId ? UI.registrationUpdateSuccess : UI.registrationCreateSuccess, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

scheduleTableBody?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-schedule-doctor]");
  if (editButton) {
    scheduleDoctorSelect.value = editButton.dataset.editScheduleDoctor;
    scheduleDateInput.value = editButton.dataset.editScheduleDate;
    const schedule = state.schedules.find(
      (item) => Number(item.doctor_id) === Number(editButton.dataset.editScheduleDoctor)
        && item.visit_date === editButton.dataset.editScheduleDate,
    );
    if (schedule) {
      populateScheduleForm(schedule);
    }
    showWorkspaceSection("schedule-section");
    setStatus(UI.scheduleEditLoaded, "info");
    return;
  }
});

registrationCancelEditButton?.addEventListener("click", () => {
  resetRegistrationForm();
  setStatus(UI.registrationEditCancelled, "info");
});

registrationTableBody?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-registration-id]");
  const refundButton = event.target.closest("[data-refund-id]");
  if (editButton) {
    const record = state.registrations.find((item) => Number(item.reg_id) === Number(editButton.dataset.editRegistrationId));
    if (!record) {
      return;
    }
    populateRegistrationForm(record);
    showWorkspaceSection("registration-section");
    setStatus(UI.registrationEditLoaded, "info");
    return;
  }
  if (!refundButton) {
    return;
  }
  try {
    await request(`/api/registrations/${refundButton.dataset.refundId}/refund`, { method: "POST", body: "{}" });
    await Promise.all([loadDoctors(), loadSchedules(), loadOverview(), loadRegistrations(), loadAuditLogs()]);
    setStatus("退号完成。", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

patientTableBody?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-patient-id]");
  if (!editButton) {
    return;
  }
  const patient = state.patients.find((item) => Number(item.patient_id) === Number(editButton.dataset.editPatientId));
  if (!patient) {
    return;
  }
  populatePatientForm(patient);
  setStatus(UI.patientEditLoaded, "info");
});

doctorSelect?.addEventListener("change", updateQuotaTip);

refreshAllButton?.addEventListener("click", () => {
  refreshAll().catch((error) => setStatus(error.message, "error"));
});

refreshRecordsButton?.addEventListener("click", () => {
  loadRegistrations()
    .then(() => setStatus("挂号记录已刷新。", "info"))
    .catch((error) => setStatus(error.message, "error"));
});

directoryLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showWorkspaceSection(link.dataset.targetSection);
  });
});

visitDateInput?.addEventListener("change", () => {
  state.hasAlignedVisitDate = false;
  registrationDateInput.value = visitDateInput.value;
  scheduleDateInput.value = visitDateInput.value;
  refreshAll().catch((error) => setStatus(error.message, "error"));
});

recordStatusSelect?.addEventListener("change", () => {
  loadRegistrations().catch((error) => setStatus(error.message, "error"));
});

function initializePage() {
  const today = new Date().toISOString().slice(0, 10);
  applyStaticCopy();
  visitDateInput.value = today;
  registrationDateInput.value = today;
  scheduleDateInput.value = today;
  showWorkspaceSection(state.currentSection);
  resetScheduleForm();
  restoreSession().catch((error) => setStatus(error.message, "error"));
}

initializePage();
