const UI = {
  title: "苏衡门诊挂号系统患者端",
  backHome: "返回入口",
  heroKicker: "患者端",
  heroTitle: "患者自助挂号",
  heroCopy: "无需注册登录，可直接查询医生排班、提交挂号，并查看自己的预约记录。",
  statusLoading: "正在加载最新号源...",
  doctorPanelTitle: "可预约医生",
  doctorPanelCopy: "先选择就诊日期，再点击医生卡片完成选择。",
  visitDateLabel: "就诊日期",
  formTitle: "提交挂号",
  formCopy: "患者端与医院端共用同一套排班和号源，提交后医院端会立刻看到这条挂号记录。",
  patientNameLabel: "姓名",
  patientGenderLabel: "性别",
  genderMale: "男",
  genderFemale: "女",
  patientPhoneLabel: "手机号",
  patientBirthLabel: "出生日期",
  patientIdCardLabel: "身份证号",
  selectedDoctorLabel: "已选医生",
  noteLabel: "备注",
  bookingSubmit: "提交挂号",
  lookupTitle: "我的预约",
  lookupCopy: "输入姓名、手机号和挂号单号后查询预约。",
  lookupButton: "查询",
  regNo: "挂号单号",
  doctor: "医生",
  date: "日期",
  status: "状态",
  selectedDoctorEmpty: "尚未选择医生",
  quotaTipEmpty: "请先从上方选择一位医生。",
  patientNamePlaceholder: "请输入姓名",
  patientPhonePlaceholder: "请输入手机号",
  patientIdCardPlaceholder: "有身份证可填写",
  notePlaceholder: "例如 初诊 / 复诊 / 帮家人挂号",
  lookupNamePlaceholder: "姓名",
  lookupPhonePlaceholder: "手机号",
  lookupRegNoPlaceholder: "挂号单号",
  doctorFeePrefix: "费用 CNY ",
  doctorQuotaPrefix: "剩余号源 ",
  noDoctors: "当前日期暂无可预约医生。",
  doctorAvailable: "可预约",
  doctorUnavailable: "当前停诊，请重新选择。",
  doctorFull: "当前号源已满，请选择其他医生。",
  doctorQuotaTip: "当前剩余号源",
  doctorFullLabel: "号源已满",
  doctorClosedLabel: "停诊",
  booked: "已挂号",
  refunded: "已退号",
  emptyLookup: "暂无预约记录",
  submitSuccess: "挂号成功，单号",
  successTitle: "挂号成功",
  successCopy: "您的预约已提交到医院端工作台。",
  successClose: "我知道了",
  successMetaDoctor: "就诊医生",
  successMetaRegNo: "挂号单号",
  lookupRefreshed: "预约记录已刷新。",
  quotaSynced: "已同步最新号源。",
  requestFailed: "请求失败",
  defaultDateAligned: "已自动切换到最近可预约日期",
  validationMissingPrefix: "请填写或选择：",
  validationPatientName: "姓名",
  validationGender: "性别",
  validationPhone: "手机号",
  validationBirthDate: "出生日期",
  validationDoctor: "医生",
  validationVisitDate: "就诊日期",
  validationPhoneFormat: "手机号格式不正确，请填写 11 位手机号",
  validationBirthDateFuture: "出生日期不能晚于今天",
  lookupPrivacyReset: "页面已重置，方便下一位患者继续使用。",
};

// 患者端页面状态：当前医生列表、当前选择的医生、我的预约查询结果。
const state = {
  doctors: [],
  selectedDoctor: null,
  registrations: [],
};

const visitDateInput = document.querySelector("#visit-date");
const doctorGrid = document.querySelector("#doctor-grid");
const statusStrip = document.querySelector("#status-strip");
const bookingForm = document.querySelector("#booking-form");
const selectedDoctorInput = document.querySelector("#selected-doctor");
const quotaTip = document.querySelector("#quota-tip");
const bookingSubmit = document.querySelector("#booking-submit");
const lookupButton = document.querySelector("#lookup-button");
const lookupTableBody = document.querySelector("#lookup-table-body");
const successToast = document.querySelector("#success-toast");
const successToastTitle = document.querySelector("#success-toast-title");
const successToastCopy = document.querySelector("#success-toast-copy");
const successToastMeta = document.querySelector("#success-toast-meta");
const successToastClose = document.querySelector("#success-toast-close");
let successToastTimer = null;
let statusTimer = null;

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

function applyCopy() {
  document.title = UI.title;
  Object.entries({
    "back-home": UI.backHome,
    "hero-kicker": UI.heroKicker,
    "hero-title": UI.heroTitle,
    "hero-copy": UI.heroCopy,
    "status-strip": UI.statusLoading,
    "doctor-panel-title": UI.doctorPanelTitle,
    "doctor-panel-copy": UI.doctorPanelCopy,
    "visit-date-label": UI.visitDateLabel,
    "form-title": UI.formTitle,
    "form-copy": UI.formCopy,
    "patient-name-label": UI.patientNameLabel,
    "patient-gender-label": UI.patientGenderLabel,
    "gender-m": UI.genderMale,
    "gender-f": UI.genderFemale,
    "patient-phone-label": UI.patientPhoneLabel,
    "patient-birth-label": UI.patientBirthLabel,
    "patient-id-card-label": UI.patientIdCardLabel,
    "selected-doctor-label": UI.selectedDoctorLabel,
    "note-label": UI.noteLabel,
    "booking-submit": UI.bookingSubmit,
    "lookup-title": UI.lookupTitle,
    "lookup-copy": UI.lookupCopy,
    "lookup-button": UI.lookupButton,
    "success-toast-title": UI.successTitle,
    "success-toast-copy": UI.successCopy,
    "success-toast-close": UI.successClose,
    "th-reg-no": UI.regNo,
    "th-doctor": UI.doctor,
    "th-date": UI.date,
    "th-status": UI.status,
  }).forEach(([id, value]) => setText(id, value));

  setPlaceholder("patient-name", UI.patientNamePlaceholder);
  setPlaceholder("patient-phone", UI.patientPhonePlaceholder);
  setPlaceholder("patient-id-card", UI.patientIdCardPlaceholder);
  setPlaceholder("booking-note", UI.notePlaceholder);
  setPlaceholder("lookup-name", UI.lookupNamePlaceholder);
  setPlaceholder("lookup-phone", UI.lookupPhonePlaceholder);
  setPlaceholder("lookup-reg-no", UI.lookupRegNoPlaceholder);
  selectedDoctorInput.value = UI.selectedDoctorEmpty;
  quotaTip.textContent = UI.quotaTipEmpty;
}

function setStatus(message, kind = "info") {
  if (statusTimer) {
    window.clearTimeout(statusTimer);
    statusTimer = null;
  }
  statusStrip.textContent = message;
  statusStrip.dataset.kind = kind;
  if (kind === "success") {
    statusTimer = window.setTimeout(() => {
      statusStrip.textContent = UI.statusLoading;
      statusStrip.dataset.kind = "info";
      statusTimer = null;
    }, 5000);
  }
}

function markFieldInvalid(element, invalid) {
  if (!element) {
    return;
  }
  element.classList.toggle("field-error", invalid);
}

function clearValidation() {
  [
    "#patient-name",
    "#patient-gender",
    "#patient-phone",
    "#patient-birth-date",
    "#patient-id-card",
    "#selected-doctor",
    "#visit-date",
  ].forEach((selector) => {
    markFieldInvalid(document.querySelector(selector), false);
  });
}

// 提交前先在前端拦住明显错误，减少患者重复提交和脏数据进入后端。
function validateBookingForm() {
  clearValidation();
  const patientName = document.querySelector("#patient-name");
  const patientGender = document.querySelector("#patient-gender");
  const patientPhone = document.querySelector("#patient-phone");
  const patientBirthDate = document.querySelector("#patient-birth-date");
  const visitDate = document.querySelector("#visit-date");

  const missingItems = [];

  if (!patientName.value.trim()) {
    missingItems.push(UI.validationPatientName);
    markFieldInvalid(patientName, true);
  }
  if (!patientGender.value.trim()) {
    missingItems.push(UI.validationGender);
    markFieldInvalid(patientGender, true);
  }
  if (!patientPhone.value.trim()) {
    missingItems.push(UI.validationPhone);
    markFieldInvalid(patientPhone, true);
  } else if (!/^1\d{10}$/.test(patientPhone.value.trim())) {
    missingItems.push(UI.validationPhoneFormat);
    markFieldInvalid(patientPhone, true);
  }
  if (!patientBirthDate.value.trim()) {
    missingItems.push(UI.validationBirthDate);
    markFieldInvalid(patientBirthDate, true);
  } else if (patientBirthDate.value > new Date().toISOString().slice(0, 10)) {
    missingItems.push(UI.validationBirthDateFuture);
    markFieldInvalid(patientBirthDate, true);
  }
  if (!visitDate.value.trim()) {
    missingItems.push(UI.validationVisitDate);
    markFieldInvalid(visitDate, true);
  }
  if (!state.selectedDoctor) {
    missingItems.push(UI.validationDoctor);
    markFieldInvalid(selectedDoctorInput, true);
  }

  return missingItems;
}

function showSuccessToast(data) {
  if (successToastTimer) {
    window.clearTimeout(successToastTimer);
  }
  successToastTitle.textContent = UI.successTitle;
  successToastCopy.textContent = UI.successCopy;
  successToastMeta.textContent = `${UI.successMetaRegNo} ${data.reg_no} | ${UI.successMetaDoctor} ${data.doctor_name}`;
  successToast.classList.remove("hidden");
  successToastTimer = window.setTimeout(() => {
    hideSuccessToast();
  }, 3500);
}

function hideSuccessToast() {
  if (successToastTimer) {
    window.clearTimeout(successToastTimer);
    successToastTimer = null;
  }
  successToast.classList.add("hidden");
  successToastMeta.textContent = "";
}

function resetLookupArea() {
  document.querySelector("#lookup-name").value = "";
  document.querySelector("#lookup-phone").value = "";
  document.querySelector("#lookup-reg-no").value = "";
  state.registrations = [];
  renderLookupResults();
}

function resetBookingArea() {
  hideSuccessToast();
  clearValidation();
  bookingForm?.reset();
  document.querySelector("#patient-gender").value = "M";
  state.selectedDoctor = null;
  selectedDoctorInput.value = UI.selectedDoctorEmpty;
  quotaTip.textContent = UI.quotaTipEmpty;
}

function resetPatientPage(showStatus = false) {
  resetBookingArea();
  resetLookupArea();
  renderDoctors();
  updateSelection();
  if (showStatus) {
    setStatus(UI.lookupPrivacyReset, "success");
  }
}

// 患者端所有接口请求都走这里，便于统一处理 JSON 和错误提示。
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get("Content-Type") || "";
  const raw = await response.text();
  const data = contentType.includes("application/json") ? JSON.parse(raw || "{}") : { error: raw || UI.requestFailed };
  if (!response.ok) {
    throw new Error(data.error || UI.requestFailed);
  }
  return data;
}

function renderDoctors() {
  doctorGrid.innerHTML = state.doctors.map((doctor) => {
    const selected = state.selectedDoctor && Number(state.selectedDoctor.doctor_id) === Number(doctor.doctor_id);
    const schedulable = Number(doctor.available) === 1 && Number(doctor.remaining_quota) > 0;
    const statusClass = schedulable ? "ok" : "warn";
    const statusText = schedulable
      ? UI.doctorAvailable
      : Number(doctor.available) === 1
        ? UI.doctorFullLabel
        : UI.doctorClosedLabel;
    return `
      <article class="doctor-card ${selected ? "selected" : ""}" data-doctor-id="${doctor.doctor_id}">
        <span class="badge ${statusClass}">${escapeHtml(statusText)}</span>
        <h3>${escapeHtml(doctor.doctor_name)}</h3>
        <div class="doctor-meta">
          ${escapeHtml(doctor.dept_name)}<br>
          ${escapeHtml(doctor.title_name || "-")}<br>
          ${escapeHtml(UI.doctorFeePrefix)}${Number(doctor.fee_amount).toFixed(2)}<br>
          ${escapeHtml(UI.doctorQuotaPrefix)}${doctor.remaining_quota}/${doctor.total_quota}
        </div>
      </article>
    `;
  }).join("") || `<article class="doctor-card"><div class="doctor-meta">${escapeHtml(UI.noDoctors)}</div></article>`;
}

function updateSelection() {
  if (!state.selectedDoctor) {
    selectedDoctorInput.value = UI.selectedDoctorEmpty;
    quotaTip.textContent = UI.quotaTipEmpty;
    bookingSubmit.disabled = true;
    return;
  }

  selectedDoctorInput.value = `${state.selectedDoctor.doctor_name} / ${state.selectedDoctor.dept_name}`;
  if (Number(state.selectedDoctor.available) !== 1) {
    quotaTip.textContent = `${state.selectedDoctor.doctor_name} ${UI.doctorUnavailable}`;
    bookingSubmit.disabled = true;
    return;
  }
  if (Number(state.selectedDoctor.remaining_quota) <= 0) {
    quotaTip.textContent = `${state.selectedDoctor.doctor_name} ${UI.doctorFull}`;
    bookingSubmit.disabled = true;
    return;
  }

  quotaTip.textContent = `${state.selectedDoctor.doctor_name} ${UI.doctorQuotaTip} ${state.selectedDoctor.remaining_quota}/${state.selectedDoctor.total_quota}`;
  bookingSubmit.disabled = false;
}

function renderLookupResults() {
  lookupTableBody.innerHTML = state.registrations.map((item) => `
    <tr>
      <td>${escapeHtml(item.reg_no)}</td>
      <td>${escapeHtml(item.doctor_name)}</td>
      <td>${escapeHtml(item.visit_date)}</td>
      <td>${item.status === "BOOKED" ? UI.booked : UI.refunded}</td>
    </tr>
  `).join("") || `<tr><td colspan="4">${escapeHtml(UI.emptyLookup)}</td></tr>`;
}

async function loadDefaultVisitDate() {
  const data = await request(`/api/default-visit-date?date=${visitDateInput.value}`);
  return data.visit_date || visitDateInput.value;
}

// 患者端页面状态：当前医生列表、当前选择的医生、我的预约查询结果。???
async function loadDoctors() {
  const data = await request(`/api/public/doctors?date=${visitDateInput.value}`);
  state.doctors = data.items;
  if (!state.doctors.some((doctor) => Number(doctor.available) === 1)) {
    const suggestedDate = await loadDefaultVisitDate();
    if (suggestedDate !== visitDateInput.value) {
      visitDateInput.value = suggestedDate;
      const fallbackData = await request(`/api/public/doctors?date=${visitDateInput.value}`);
      state.doctors = fallbackData.items;
      setStatus(`${UI.defaultDateAligned} ${suggestedDate}`, "info");
    }
  }
  if (state.selectedDoctor) {
    state.selectedDoctor = state.doctors.find((item) => Number(item.doctor_id) === Number(state.selectedDoctor.doctor_id)) || null;
  }
  renderDoctors();
  updateSelection();
}

async function lookupRegistrations() {
  const patientName = document.querySelector("#lookup-name").value.trim();
  const phone = document.querySelector("#lookup-phone").value.trim();
  const regNo = document.querySelector("#lookup-reg-no").value.trim();
  const data = await request(`/api/public/registrations?patient_name=${encodeURIComponent(patientName)}&phone=${encodeURIComponent(phone)}&reg_no=${encodeURIComponent(regNo)}`);
  state.registrations = data.items;
  renderLookupResults();
}

doctorGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-doctor-id]");
  if (!card) {
    return;
  }
  state.selectedDoctor = state.doctors.find((item) => Number(item.doctor_id) === Number(card.dataset.doctorId)) || null;
  markFieldInvalid(selectedDoctorInput, false);
  renderDoctors();
  updateSelection();
});

visitDateInput?.addEventListener("change", () => {
  markFieldInvalid(visitDateInput, false);
  loadDoctors().catch((error) => setStatus(error.message, "error"));
});

["#patient-name", "#patient-phone", "#patient-birth-date"].forEach((selector) => {
  document.querySelector(selector)?.addEventListener("input", (event) => {
    markFieldInvalid(event.currentTarget, false);
  });
});

document.querySelector("#patient-gender")?.addEventListener("change", (event) => {
  markFieldInvalid(event.currentTarget, false);
});

// 患者点击提交挂号后的主流程：校验 -> 组装 payload -> 调后端接口 -> 重置页面。
bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const missingItems = validateBookingForm();
  if (missingItems.length > 0) {
    setStatus(`${UI.validationMissingPrefix}${missingItems.join("、")}`, "error");
    return;
  }
  bookingSubmit.disabled = true;
  const payload = {
    patient_name: document.querySelector("#patient-name").value.trim(),
    gender: document.querySelector("#patient-gender").value,
    phone: document.querySelector("#patient-phone").value.trim(),
    birth_date: document.querySelector("#patient-birth-date").value,
    id_card: document.querySelector("#patient-id-card").value.trim(),
    doctor_id: Number(state.selectedDoctor.doctor_id),
    visit_date: visitDateInput.value,
    note: document.querySelector("#booking-note").value.trim(),
  };
  try {
    const data = await request("/api/public/registrations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showSuccessToast(data);
    resetLookupArea();
    resetBookingArea();
    await loadDoctors();
    updateSelection();
    setStatus(`${UI.submitSuccess} ${data.reg_no}`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    updateSelection();
  }
});

successToastClose?.addEventListener("click", hideSuccessToast);

lookupButton?.addEventListener("click", () => {
  lookupRegistrations()
    .then(() => setStatus(UI.lookupRefreshed, "success"))
    .catch((error) => setStatus(error.message, "error"));
});

function initializePage() {
  applyCopy();
  const today = new Date().toISOString().slice(0, 10);
  visitDateInput.value = today;
  resetPatientPage();
  renderLookupResults();
  loadDoctors()
    .then(() => setStatus(UI.quotaSynced, "success"))
    .catch((error) => setStatus(error.message, "error"));
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetPatientPage(true);
  }
});

initializePage();
