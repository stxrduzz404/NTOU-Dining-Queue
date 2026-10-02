"use strict";

const STORAGE_KEY = "ntou-dining-queue-v1";
const WAIT_MINUTES_PER_GROUP = 8;

const initialState = {
  waiting: [],
  nextNo: 1,
  nowServing: null,
  logs: [],
};

let state = loadState();

const elements = {
  form: document.querySelector("#join-form"),
  name: document.querySelector("#customer-name"),
  phone: document.querySelector("#customer-phone"),
  partySize: document.querySelector("#party-size"),
  area: document.querySelector("#dining-area"),
  formError: document.querySelector("#form-error"),
  queueBody: document.querySelector("#queue-body"),
  emptyState: document.querySelector("#empty-state"),
  callNextButton: document.querySelector("#call-next-button"),
  peekButton: document.querySelector("#peek-button"),
  demoButton: document.querySelector("#demo-button"),
  clearButton: document.querySelector("#clear-button"),
  clearLogButton: document.querySelector("#clear-log-button"),
  lookupForm: document.querySelector("#lookup-form"),
  lookupNumber: document.querySelector("#lookup-number"),
  lookupResult: document.querySelector("#lookup-result"),
  confirmDialog: document.querySelector("#confirm-dialog"),
  operationLog: document.querySelector("#operation-log"),
  toastRegion: document.querySelector("#toast-region"),
  currentTime: document.querySelector("#current-time"),
  waitingCount: document.querySelector("#waiting-count"),
  peopleCount: document.querySelector("#people-count"),
  estimatedWait: document.querySelector("#estimated-wait"),
  nextTicket: document.querySelector("#next-ticket"),
  previewTicket: document.querySelector("#preview-ticket"),
  nowServingNumber: document.querySelector("#now-serving-number"),
  nowServingName: document.querySelector("#now-serving-name"),
  nowServingParty: document.querySelector("#now-serving-party"),
  queueRange: document.querySelector("#queue-range"),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.waiting)) return structuredClone(initialState);

    return {
      waiting: saved.waiting,
      nextNo: Number.isInteger(saved.nextNo) && saved.nextNo > 0 ? saved.nextNo : 1,
      nowServing: saved.nowServing ?? null,
      logs: Array.isArray(saved.logs) ? saved.logs.slice(0, 30) : [],
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatTicket(no) {
  return `A${String(no).padStart(3, "0")}`;
}

function normalizePhone(phone) {
  return phone.replace(/[\s-]/g, "");
}

function displayPhone(phone) {
  const digits = normalizePhone(phone);
  if (/^09\d{8}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function maskPhone(phone) {
  const formatted = displayPhone(phone);
  if (formatted.length < 7) return formatted;
  return `${formatted.slice(0, 4)}-***-${formatted.slice(-3)}`;
}

function nowTime() {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function updateClock() {
  elements.currentTime.textContent = nowTime().slice(0, 5);
  elements.currentTime.dateTime = new Date().toISOString();
}

function minutesWaiting(joinedAt) {
  return Math.max(0, Math.floor((Date.now() - new Date(joinedAt).getTime()) / 60000));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addLog(message) {
  state.logs.unshift({ message, time: nowTime() });
  state.logs = state.logs.slice(0, 30);
}

function joinQueue({ name, phone, partySize, area }) {
  const customer = {
    no: state.nextNo,
    name: name.trim(),
    phone: displayPhone(phone.trim()),
    partySize: Number(partySize),
    area,
    joinedAt: new Date().toISOString(),
  };

  state.nextNo += 1;
  state.waiting.push(customer);
  addLog(`登記 ${formatTicket(customer.no)}｜${customer.name}｜${customer.partySize} 人`);
  commit();
  return customer;
}

function callNext() {
  if (state.waiting.length === 0) {
    showToast("目前沒有候位客人。", "error");
    return;
  }

  const customer = state.waiting.shift();
  state.nowServing = { ...customer, calledAt: new Date().toISOString() };
  addLog(`叫號 ${formatTicket(customer.no)}｜${customer.name} 入座`);
  commit();
  showToast(`${formatTicket(customer.no)} ${customer.name}，請準備入座。`);
}

function peekNext() {
  if (state.waiting.length === 0) {
    showToast("隊伍目前是空的，沒有下一位。", "error");
    return;
  }

  const customer = state.waiting[0];
  addLog(`查看下一位：${formatTicket(customer.no)}｜${customer.name}`);
  commit();
  showToast(`下一位是 ${formatTicket(customer.no)} ${customer.name}（不會移出隊伍）。`);
}

function ahead(no) {
  return state.waiting.findIndex((customer) => customer.no === no);
}

function commit() {
  saveState();
  render();
}

function render() {
  renderStats();
  renderNowServing();
  renderQueue();
  renderLogs();
  elements.callNextButton.disabled = state.waiting.length === 0;
  elements.peekButton.disabled = state.waiting.length === 0;
  elements.clearButton.disabled = state.waiting.length === 0;
}

function renderStats() {
  const waitingPeople = state.waiting.reduce((sum, customer) => sum + customer.partySize, 0);
  const next = formatTicket(state.nextNo);

  elements.waitingCount.textContent = state.waiting.length;
  elements.peopleCount.textContent = waitingPeople;
  elements.estimatedWait.textContent = state.waiting.length * WAIT_MINUTES_PER_GROUP;
  elements.nextTicket.textContent = next;
  elements.previewTicket.textContent = next;
}

function renderNowServing() {
  if (!state.nowServing) {
    elements.nowServingNumber.textContent = "—";
    elements.nowServingName.textContent = "尚未開始叫號";
    elements.nowServingParty.textContent = "— 人";
    return;
  }

  elements.nowServingNumber.textContent = formatTicket(state.nowServing.no);
  elements.nowServingName.textContent = state.nowServing.name;
  elements.nowServingParty.textContent = `${state.nowServing.partySize} 人`;
}

function renderQueue() {
  const hasCustomers = state.waiting.length > 0;
  elements.emptyState.hidden = hasCustomers;
  elements.queueBody.hidden = !hasCustomers;

  if (!hasCustomers) {
    elements.queueBody.innerHTML = "";
    elements.queueRange.textContent = "FRONT — BACK";
    return;
  }

  const front = formatTicket(state.waiting[0].no);
  const back = formatTicket(state.waiting.at(-1).no);
  elements.queueRange.textContent = `${front} — ${back}`;

  elements.queueBody.innerHTML = state.waiting
    .map((customer, index) => {
      const wait = minutesWaiting(customer.joinedAt);
      const status = index === 0
        ? '<span class="front-badge">NEXT</span>'
        : '<span class="waiting-badge">候位中</span>';

      return `
        <tr>
          <td class="order-cell">${String(index + 1).padStart(2, "0")}</td>
          <td><span class="number-badge">${formatTicket(customer.no)}</span></td>
          <td class="customer-cell">
            <strong>${escapeHtml(customer.name)}</strong>
            <span>${escapeHtml(maskPhone(customer.phone))}</span>
          </td>
          <td>${customer.partySize} 人</td>
          <td>${escapeHtml(customer.area)}</td>
          <td>${wait === 0 ? "剛剛" : `${wait} 分鐘`}</td>
          <td>${status}</td>
        </tr>
      `;
    })
    .join("");
}

function renderLogs() {
  if (state.logs.length === 0) {
    elements.operationLog.innerHTML = '<li class="log-empty"><time>--:--:--</time><span>尚無操作紀錄</span></li>';
    return;
  }

  elements.operationLog.innerHTML = state.logs
    .map((log) => `<li><time>${escapeHtml(log.time)}</time><span>${escapeHtml(log.message)}</span></li>`)
    .join("");
}

function validateForm() {
  const name = elements.name.value.trim();
  const phone = normalizePhone(elements.phone.value);
  elements.name.classList.remove("invalid");
  elements.phone.classList.remove("invalid");

  if (name.length < 2) {
    elements.name.classList.add("invalid");
    elements.formError.textContent = "請輸入至少 2 個字的姓名。";
    elements.name.focus();
    return false;
  }

  if (!/^09\d{8}$/.test(phone)) {
    elements.phone.classList.add("invalid");
    elements.formError.textContent = "請輸入有效的台灣手機號碼，例如 0912-345-678。";
    elements.phone.focus();
    return false;
  }

  elements.formError.textContent = "";
  return true;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function addDemoCustomer() {
  const samples = [
    { name: "林海洋", phone: "0912-345-678", partySize: 2, area: "靠窗區" },
    { name: "陳雨晴", phone: "0922-618-305", partySize: 4, area: "一般座位" },
    { name: "許港都", phone: "0988-731-420", partySize: 3, area: "不限" },
    { name: "吳潮生", phone: "0935-106-829", partySize: 1, area: "不限" },
  ];
  const customer = joinQueue(samples[state.waiting.length % samples.length]);
  showToast(`已加入範例客人 ${formatTicket(customer.no)} ${customer.name}。`);
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const customer = joinQueue({
    name: elements.name.value,
    phone: elements.phone.value,
    partySize: elements.partySize.value,
    area: elements.area.value,
  });

  showToast(`登記完成！${formatTicket(customer.no)}，前面有 ${state.waiting.length - 1} 組。`);
  elements.form.reset();
  elements.partySize.value = "2";
  elements.name.focus();
});

elements.callNextButton.addEventListener("click", callNext);
elements.peekButton.addEventListener("click", peekNext);
elements.demoButton.addEventListener("click", addDemoCustomer);

elements.lookupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const match = elements.lookupNumber.value.trim().toUpperCase().match(/^(?:A)?(\d+)$/);
  elements.lookupResult.classList.remove("found");

  if (!match) {
    elements.lookupResult.textContent = "請輸入正確號碼，例如 A003。";
    return;
  }

  const no = Number(match[1]);
  const count = ahead(no);

  if (count >= 0) {
    elements.lookupResult.textContent = count === 0
      ? `${formatTicket(no)} 就是下一位，請留意叫號。`
      : `${formatTicket(no)} 前面還有 ${count} 組，預估約 ${count * WAIT_MINUTES_PER_GROUP} 分鐘。`;
    elements.lookupResult.classList.add("found");
    addLog(`查詢 ${formatTicket(no)}：前方 ${count} 組`);
    commit();
    return;
  }

  if (state.nowServing?.no === no) {
    elements.lookupResult.textContent = `${formatTicket(no)} 正在叫號，請至櫃台報到。`;
    elements.lookupResult.classList.add("found");
    return;
  }

  elements.lookupResult.textContent = `名單中找不到 ${formatTicket(no)}，可能尚未登記或已經入座。`;
});

elements.clearButton.addEventListener("click", () => {
  if (state.waiting.length === 0) return;
  if (typeof elements.confirmDialog.showModal === "function") {
    elements.confirmDialog.showModal();
  } else if (window.confirm("確定清空候位名單？")) {
    clearQueue();
  }
});

elements.confirmDialog.addEventListener("close", () => {
  if (elements.confirmDialog.returnValue === "confirm") clearQueue();
});

function clearQueue() {
  const removed = state.waiting.length;
  state.waiting = [];
  addLog(`清空候位名單，共移除 ${removed} 組`);
  commit();
  showToast(`已清空 ${removed} 組候位資料。`);
}

elements.clearLogButton.addEventListener("click", () => {
  state.logs = [];
  commit();
});

[elements.name, elements.phone].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("invalid");
    elements.formError.textContent = "";
  });
});

updateClock();
render();
window.setInterval(updateClock, 1000);
window.setInterval(renderQueue, 60000);
