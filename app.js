const STORAGE_KEY = "linoleumCalcProject";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFNDZVhVu4z5hBoYhcRXyzpuOYWewZ77Lo8_AsEUu0kt_ctwbRQYRplixFn7kjoAeL/exec";

const ROOM_TYPES = [
  {code:"living", name:"гостиная"},
  {code:"bedroom", name:"спальня"},
  {code:"kitchen", name:"кухня"},
  {code:"hall", name:"коридор"},
  {code:"bath", name:"санузел"},
  {code:"custom", name:"своё помещение"}
];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function parseNum(v) {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function toMeters(value, units) {
  return units === "mm" ? value / 1000 : value;
}

function fmtLen(v, units) {
  return units === "mm" ? Math.round(v * 1000) + " мм" : v.toFixed(2) + " м";
}

function fmt(v) {
  return v.toFixed(2);
}

function showMessage(text, isError) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.style.color = isError ? "#c53030" : "#1f6f43";
}

function roomTypeName(select, customInput) {
  if (select.value === "custom") return customInput.value.trim() || "Своё помещение";
  const t = ROOM_TYPES.find((t) => t.code === select.value);
  return t ? t.name : select.value;
}

function collectData(units) {
  const apartments = [];
  document.querySelectorAll("#apartments .apartment").forEach((apt) => {
    const number = apt.querySelector(".apt-number").value.trim();
    const name = apt.querySelector(".apt-name").value.trim() || number || "Квартира";
    const comment = apt.querySelector(".apt-comment").value.trim();
    const rooms = [];
    apt.querySelectorAll(".room").forEach((r) => {
      const typeSelect = r.querySelector(".room-type");
      const customInput = r.querySelector(".room-custom");
      const codeInput = r.querySelector(".room-code");
      const rawLength = parseNum(r.querySelector(".room-length").value);
      const rawWidth = parseNum(r.querySelector(".room-width").value);
      const roomComment = r.querySelector(".room-comment").value.trim();
      const rawAllowance = r.querySelector(".room-allowance").value.trim();
      const customAllowanceCm = rawAllowance === "" ? null : parseNum(rawAllowance);
      if (!Number.isFinite(rawLength) || !Number.isFinite(rawWidth)) return;
      rooms.push({
        typeName: roomTypeName(typeSelect, customInput),
        code: codeInput.value.trim(),
        length: toMeters(rawLength, units),
        width: toMeters(rawWidth, units),
        comment: roomComment,
        allowanceCm: Number.isFinite(customAllowanceCm) ? customAllowanceCm : null
      });
    });
    if (rooms.length) apartments.push({ number, name, comment, rooms });
  });
  return apartments;
}

function calculateRoom(room, allowanceM, rollWidths, mode) {
  const roomLenWithAllowance = room.length + allowanceM * 2;
  const roomWidthWithAllowance = room.width + allowanceM * 2;
  const area = room.length * room.width;
  let best = null;
  rollWidths.forEach((rw) => {
    const options = [
      { rollWidth: rw, length: roomWidthWithAllowance, width: roomLenWithAllowance },
      { rollWidth: rw, length: roomLenWithAllowance, width: roomWidthWithAllowance }
    ];
    options.forEach((opt) => {
      const strips = Math.ceil(opt.width / rw);
      const waste = strips * rw - opt.width;
      const seams = strips - 1;
      const score = mode === "seams" ? seams : waste;
      if (!best || score < best.score) {
        best = { rollWidth: rw, length: opt.length, width: opt.width, strips, waste, seams, score, area };
      }
    });
  });
  return best;
}

function createRoom(container) {
  const tpl = document.getElementById("roomTpl").content.cloneNode(true);
  const room = tpl.querySelector(".room");
  const typeSelect = room.querySelector(".room-type");
  const customInput = room.querySelector(".room-custom");
  const codeInput = room.querySelector(".room-code");

  typeSelect.innerHTML = "";
  ROOM_TYPES.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.code;
    opt.textContent = t.name;
    typeSelect.appendChild(opt);
  });

  typeSelect.addEventListener("change", () => {
    const isCustom = typeSelect.value === "custom";
    customInput.hidden = !isCustom;
    codeInput.hidden = isCustom;
  });

  room.querySelector(".delete-room").addEventListener("click", () => room.remove());
  room.querySelector(".copy-room").addEventListener("click", () => {
    const clone = createRoom(container);
    clone.querySelector(".room-type").value = room.querySelector(".room-type").value;
    clone.querySelector(".room-type").dispatchEvent(new Event("change"));
    clone.querySelector(".room-custom").value = room.querySelector(".room-custom").value;
    clone.querySelector(".room-code").value = room.querySelector(".room-code").value;
    clone.querySelector(".room-length").value = room.querySelector(".room-length").value;
    clone.querySelector(".room-width").value = room.querySelector(".room-width").value;
    clone.querySelector(".room-allowance").value = room.querySelector(".room-allowance").value;
    clone.querySelector(".room-comment").value = room.querySelector(".room-comment").value;
  });

  container.appendChild(room);
  return room;
}

function createApartment() {
  const tpl = document.getElementById("apartmentTpl").content.cloneNode(true);
  const apt = tpl.querySelector(".apartment");
  const roomsContainer = apt.querySelector(".rooms");

  apt.querySelector(".add-room").addEventListener("click", () => createRoom(roomsContainer));
  apt.querySelector(".delete-apt").addEventListener("click", () => apt.remove());
  apt.querySelector(".copy-apt").addEventListener("click", () => {
    const clone = createApartment();
    clone.querySelector(".apt-number").value = apt.querySelector(".apt-number").value;
    clone.querySelector(".apt-name").value = apt.querySelector(".apt-name").value;
    clone.querySelector(".apt-comment").value = apt.querySelector(".apt-comment").value;
    const cloneRooms = clone.querySelector(".rooms");
    roomsContainer.querySelectorAll(".room").forEach((r) => {
      const nr = createRoom(cloneRooms);
      nr.querySelector(".room-type").value = r.querySelector(".room-type").value;
      nr.querySelector(".room-type").dispatchEvent(new Event("change"));
      nr.querySelector(".room-custom").value = r.querySelector(".room-custom").value;
      nr.querySelector(".room-code").value = r.querySelector(".room-code").value;
      nr.querySelector(".room-length").value = r.querySelector(".room-length").value;
      nr.querySelector(".room-width").value = r.querySelector(".room-width").value;
      nr.querySelector(".room-allowance").value = r.querySelector(".room-allowance").value;
      nr.querySelector(".room-comment").value = r.querySelector(".room-comment").value;
    });
  });

  document.getElementById("apartments").appendChild(apt);
  createRoom(roomsContainer);
  return apt;
}

function getSettings() {
  const units = document.getElementById("units").value;
  const projectName = document.getElementById("projectName").value.trim();
  const material = document.getElementById("material").value.trim();
  const rollWidths = document.getElementById("rollWidths").value
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  const allowanceCm = parseNum(document.getElementById("allowance").value) || 0;
  const allowanceM = allowanceCm / 100;
  const mode = document.getElementById("mode").value;
  return { projectName, material, units, rollWidths, allowanceM, mode };
}

function saveProject() {
  const settings = getSettings();
  const apartments = collectData(settings.units);
  window.linoleumStorage.save({ settings, apartments });
  showMessage("Проект сохранён в браузере", false);
}

function fillRoomFields(r, room, units) {
  const typeSelect = r.querySelector(".room-type");
  const match = ROOM_TYPES.find((t) => t.name === room.typeName);
  typeSelect.value = match ? match.code : "custom";
  typeSelect.dispatchEvent(new Event("change"));
  if (!match) r.querySelector(".room-custom").value = room.typeName;
  r.querySelector(".room-code").value = room.code || "";
  r.querySelector(".room-length").value = units === "mm" ? Math.round(room.length * 1000) : room.length;
  r.querySelector(".room-width").value = units === "mm" ? Math.round(room.width * 1000) : room.width;
  r.querySelector(".room-allowance").value = (room.allowanceCm !== null && room.allowanceCm !== undefined) ? room.allowanceCm : "";
  r.querySelector(".room-comment").value = room.comment || "";
}

function loadProject() {
  const data = window.linoleumStorage.load();
  if (!data) { createApartment(); return; }
  const { settings, apartments } = data;
  document.getElementById("projectName").value = settings.projectName || "";
  document.getElementById("material").value = settings.material || "";
  document.getElementById("units").value = settings.units || "m";
  document.getElementById("rollWidths").value = settings.rollWidths.join(", ") || "";
  document.getElementById("allowance").value = settings.allowanceM * 100 || "";
  document.getElementById("mode").value = settings.mode || "seams";

  const container = document.getElementById("apartments");
  container.innerHTML = "";
  apartments.forEach((a) => {
    const apt = createApartment();
    apt.querySelector(".apt-number").value = a.number || "";
    apt.querySelector(".apt-name").value = a.name || "";
    apt.querySelector(".apt-comment").value = a.comment || "";
    const roomsContainer = apt.querySelector(".rooms");
    roomsContainer.innerHTML = "";
    a.rooms.forEach((room) => {
      const r = createRoom(roomsContainer);
      fillRoomFields(r, room, settings.units);
    });
  });
}

function calculate() {
  const settings = getSettings();
  const apartments = collectData(settings.units);
  if (!apartments.length) { showMessage("Добавьте хотя бы одну квартиру с помещениями", true); return; }

  const rows = [];
  const summaryMap = new Map();

  apartments.forEach((apt) => {
    apt.rooms.forEach((room) => {
      const roomAllowanceM = (room.allowanceCm !== null && room.allowanceCm !== undefined)
        ? room.allowanceCm / 100
        : settings.allowanceM;
      const res = calculateRoom(room, roomAllowanceM, settings.rollWidths, settings.mode);
      const marking = `${apt.name} ${room.typeName} ${room.code}`.trim();
      const roomLenWithAllowance = room.length + roomAllowanceM * 2;
      const roomWidthWithAllowance = room.width + roomAllowanceM * 2;

      rows.push({
        marking,
        apartment: apt.name,
        room: room.typeName,
        size: `${fmtLen(room.length, settings.units)} × ${fmtLen(room.width, settings.units)}`,
        sizeWithAllowance: `${fmtLen(roomLenWithAllowance, settings.units)} × ${fmtLen(roomWidthWithAllowance, settings.units)}`,
        rollWidth: res.rollWidth,
        strips: res.strips,
        length: res.length,
        area: res.area,
        waste: res.waste,
        seams: res.seams,
        allowanceM: roomAllowanceM,
        comment: room.comment
      });

      const key = res.rollWidth;
      if (!summaryMap.has(key)) summaryMap.set(key, { totalLength: 0, totalArea: 0, apartments: new Set(), markings: [] });
      const s = summaryMap.get(key);
      s.totalLength += res.length;
      s.totalArea += res.area;
      s.apartments.add(apt.name);
      s.markings.push(marking);
    });
  });

  renderResults(rows, summaryMap, settings);
  window.__linumLastCalc = { settings, apartments, rows, summaryMap };
  showMessage("Расчёт выполнен", false);
}

function renderResults(rows, summaryMap, settings) {
  const tbody = document.getElementById("results");
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>${escapeHtml(r.marking)}</td>
      <td>${escapeHtml(r.apartment)}</td>
      <td>${escapeHtml(r.room)}</td>
      <td>${escapeHtml(r.size)}</td>
      <td>${escapeHtml(r.sizeWithAllowance)}</td>
      <td>${fmtLen(r.rollWidth, settings.units)}</td>
      <td>${r.strips}</td>
      <td>${fmtLen(r.length, settings.units)}</td>
      <td>${fmt(r.area)} м²</td>
      <td>${fmt(r.waste)} м²</td>
      <td>${r.seams}</td>
      <td>${escapeHtml(r.comment)}</td>
    </tr>
  `).join("");

  const summaryBody = document.getElementById("summary");
  summaryBody.innerHTML = [...summaryMap.entries()].sort((a,b)=>a[0]-b[0]).map(([rw, s]) => `
    <tr>
      <td>${fmtLen(rw, settings.units)}</td>
      <td>${fmtLen(s.totalLength, settings.units)}</td>
      <td>${fmt(s.totalArea)} м²</td>
      <td>${[...s.apartments].join("; ")}</td>
      <td>${s.markings.join("; ")}</td>
    </tr>
  `).join("");
}

function downloadCsv() {
  const last = window.__linumLastCalc;
  if (!last) { showMessage("Сначала выполните расчёт", true); return; }
  const units = last.settings.units;
  const rows = [["Ширина рулона","Погонный метраж","Площадь","Помещений","Маркировки"]];
  [...last.summaryMap.entries()].sort((a,b)=>a[0]-b[0]).forEach(([rw, s]) => {
    rows.push([fmtLen(rw, units), fmtLen(s.totalLength, units), fmt(s.totalArea) + " м²", [...s.apartments].join("; "), s.markings.join("; ")]);
  });
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = (last.settings.projectName || "linoleum") + "_zakaz.csv";
  link.click();
}

function computeOffcutPercent(row) {
  const offcutArea = row.waste * row.length;
  const totalArea = row.area + offcutArea;
  return totalArea > 0 ? (offcutArea / totalArea) * 100 : 0;
}

function downloadXlsx() {
  const last = window.__linumLastCalc;
  if (!last) { showMessage("Сначала выполните расчёт", true); return; }
  if (typeof XLSX === "undefined") {
    showMessage("Не удалось загрузить библиотеку Excel. Проверьте интернет-соединение и обновите страницу.", true);
    return;
  }

  const units = last.settings.units;

  const resultsData = [[
    "Маркировка","Квартира","Помещение","Размер","С запасом","Рулон","Полос",
    "Метраж","Площадь, м²","Остаток, м²","Остаток/обрезки, %","Стыков","Комментарий"
  ]];

  last.rows.forEach((r) => {
    const offcutPercent = computeOffcutPercent(r);
    resultsData.push([
      r.marking,
      r.apartment,
      r.room,
      r.size,
      r.sizeWithAllowance,
      fmtLen(r.rollWidth, units),
      r.strips,
      fmtLen(r.length, units),
      Number(r.area.toFixed(2)),
      Number(r.waste.toFixed(2)),
      Number(offcutPercent.toFixed(1)),
      r.seams,
      r.comment || ""
    ]);
  });

  const summaryData = [[
    "Ширина рулона","Погонный метраж","Площадь, м²","Помещений","Средний остаток/обрезки, %","Маркировки"
  ]];

  [...last.summaryMap.entries()].sort((a,b)=>a[0]-b[0]).forEach(([rw, s]) => {
    const groupRows = last.rows.filter((r) => r.rollWidth === rw);
    let totalOffcutArea = 0;
    let totalWithOffcut = 0;
    groupRows.forEach((r) => {
      const offcutArea = r.waste * r.length;
      totalOffcutArea += offcutArea;
      totalWithOffcut += r.area + offcutArea;
    });
    const avgOffcutPercent = totalWithOffcut > 0 ? (totalOffcutArea / totalWithOffcut) * 100 : 0;

    summaryData.push([
      fmtLen(rw, units),
      fmtLen(s.totalLength, units),
      Number(s.totalArea.toFixed(2)),
      [...s.apartments].join("; "),
      Number(avgOffcutPercent.toFixed(1)),
      s.markings.join("; ")
    ]);
  });

  const wb = XLSX.utils.book_new();
  const wsResults = XLSX.utils.aoa_to_sheet(resultsData);
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsResults, "Результаты");
  XLSX.utils.book_append_sheet(wb, wsSummary, "Сводка");

  const fileName = (last.settings.projectName || "linoleum") + "_zakaz.xlsx";
  XLSX.writeFile(wb, fileName);
  showMessage("Файл Excel сформирован: " + fileName, false);
}

function isAppsScriptConfigured() {
  return !!APPS_SCRIPT_URL && APPS_SCRIPT_URL.indexOf("https://") === 0;
}

async function exportSheets() {
  const last = window.__linumLastCalc;
  if (!last) { showMessage("Сначала выполните расчёт", true); return; }
  if (!isAppsScriptConfigured()) {
    showMessage("Функция экспорта в Google таблицы требует подключения скрипта", true);
    return;
  }
  const payload = {
    id: "linoleum-" + Date.now(),
    dateISO: new Date().toISOString(),
    settings: last.settings,
    apartments: collectData(last.settings.units),
    rows: last.rows
  };
  showMessage("Сохраняется в Google таблицу…", false);
  try {
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (data.ok) {
      showMessage("Сохранено в архив (" + new Date(data.dateISO).toLocaleString("ru-RU") + ")", false);
      refreshArchiveList();
    } else {
      showMessage("Ошибка сохранения: " + (data.error || "неизвестная ошибка"), true);
    }
  } catch (err) {
    showMessage("Ошибка отправки: " + err.message, true);
  }
}

async function refreshArchiveList() {
  if (!isAppsScriptConfigured()) return;
  const select = document.getElementById("archiveSelect");
  select.innerHTML = '<option value="">Загрузка…</option>';
  try {
    const resp = await fetch(APPS_SCRIPT_URL);
    const data = await resp.json();
    select.innerHTML = '<option value="">Выберите расчёт</option>';
    (data.items || []).forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = new Date(item.dateISO).toLocaleString("ru-RU") + " — " + (item.projectName || "Без названия");
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = '<option value="">Ошибка загрузки</option>';
  }
}

async function loadArchive() {
  const id = document.getElementById("archiveSelect").value;
  if (!id) { showMessage("Выберите расчёт из списка", true); return; }
  showMessage("Загрузка из архива…", false);
  try {
    const resp = await fetch(APPS_SCRIPT_URL + "?id=" + encodeURIComponent(id));
    const data = await resp.json();
    if (!data.ok) { showMessage("Ошибка загрузки: " + (data.error || "неизвестная"), true); return; }
    loadProjectFromData(data);
    showMessage("Расчёт загружен из архива", false);
  } catch (err) {
    showMessage("Ошибка загрузки: " + err.message, true);
  }
}

function loadProjectFromData(data) {
  const { settings, apartments } = data;
  document.getElementById("projectName").value = settings.projectName || "";
  document.getElementById("material").value = settings.material || "";
  document.getElementById("units").value = settings.units || "m";
  document.getElementById("rollWidths").value = settings.rollWidths.join(", ") || "";
  document.getElementById("allowance").value = settings.allowanceM * 100 || "";
  document.getElementById("mode").value = settings.mode || "seams";

  const container = document.getElementById("apartments");
  container.innerHTML = "";
  apartments.forEach((a) => {
    const apt = createApartment();
    apt.querySelector(".apt-number").value = a.number || "";
    apt.querySelector(".apt-name").value = a.name || "";
    apt.querySelector(".apt-comment").value = a.comment || "";
    const roomsContainer = apt.querySelector(".rooms");
    roomsContainer.innerHTML = "";
    a.rooms.forEach((room) => {
      const r = createRoom(roomsContainer);
      fillRoomFields(r, room, settings.units);
    });
  });
}

function init() {
  window.linoleumStorage = {
    save: (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)),
    load: () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    clear: () => localStorage.removeItem(STORAGE_KEY)
  };

  document.getElementById("addApartmentBottom").addEventListener("click", createApartment);
  document.getElementById("clearApartments").addEventListener("click", () => {
    document.getElementById("apartments").innerHTML = "";
    createApartment();
  });
  document.getElementById("calculateBottom").addEventListener("click", calculate);
  document.getElementById("saveProject").addEventListener("click", saveProject);
  document.getElementById("clearSettings").addEventListener("click", () => {
    document.getElementById("projectName").value = "";
    document.getElementById("material").value = "";
    document.getElementById("units").value = "m";
    document.getElementById("rollWidths").value = "2, 2.5, 3, 3.5, 4, 5";
    document.getElementById("allowance").value = "10";
    document.getElementById("mode").value = "seams";
  });
  document.getElementById("clearAll").addEventListener("click", () => {
    window.linoleumStorage.clear();
    location.reload();
  });
  document.getElementById("downloadCsv").addEventListener("click", downloadCsv);
  document.getElementById("downloadXlsx").addEventListener("click", downloadXlsx);
  document.getElementById("exportSheets").addEventListener("click", exportSheets);
  document.getElementById("refreshArchive").addEventListener("click", refreshArchiveList);
  document.getElementById("loadArchive").addEventListener("click", loadArchive);
  document.getElementById("printBtn").addEventListener("click", () => window.print());

  loadProject();
  refreshArchiveList();
}

document.addEventListener("DOMContentLoaded", init);
