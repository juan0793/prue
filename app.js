const STORAGE_KEY = "gym-tracker-entries-v1";
const AUTH_KEY = "gym-tracker-auth-v1";
const AUTH_NAME_KEY = "gym-tracker-auth-name-v1";
const AUTH_USER = "admin";
const AUTH_PASS = "12345";

const loginView = document.querySelector("#login-view");
const appRoot = document.querySelector("#app-root");
const loginForm = document.querySelector("#login-form");
const loginUserInput = document.querySelector("#login-user");
const loginPassInput = document.querySelector("#login-pass");
const loginError = document.querySelector("#login-error");
const logoutButton = document.querySelector("#logout-btn");
const welcomeMessage = document.querySelector("#welcome-message");

const form = document.querySelector("#entry-form");
const entriesBody = document.querySelector("#entries-body");
const searchInput = document.querySelector("#search");
const clearAllButton = document.querySelector("#clear-all");

const totalEntriesEl = document.querySelector("#total-entries");
const totalVolumeEl = document.querySelector("#total-volume");
const lastWorkoutEl = document.querySelector("#last-workout");
const recordsListEl = document.querySelector("#records-list");

let entries = loadEntries();
let authFallback = false;
let authNameFallback = "";

init();

function init() {
  const today = new Date().toISOString().slice(0, 10);
  document.querySelector("#date").value = today;

  loginForm.addEventListener("submit", onLoginSubmit);
  logoutButton.addEventListener("click", onLogout);

  form.addEventListener("submit", onSubmit);
  searchInput.addEventListener("input", render);
  clearAllButton.addEventListener("click", onClearAll);

  if (isAuthenticated()) {
    showApp();
    render();
  } else {
    showLogin();
  }
}

function onLoginSubmit(event) {
  event.preventDefault();

  const userRaw = loginUserInput.value.trim();
  const user = userRaw.toLowerCase();
  const pass = loginPassInput.value.trim();

  if (user === AUTH_USER && pass === AUTH_PASS) {
    setAuthState(true, userRaw || AUTH_USER);
    loginForm.reset();
    loginError.textContent = "";
    showApp();
    render();
    return;
  }

  loginError.textContent = "Usuario o contrasena incorrectos.";
}

function onLogout() {
  setAuthState(false, "");
  showLogin();
}

function isAuthenticated() {
  try {
    return sessionStorage.getItem(AUTH_KEY) === "1" || authFallback;
  } catch {
    return authFallback;
  }
}

function setAuthState(isAuthenticatedValue, userName) {
  authFallback = isAuthenticatedValue;
  authNameFallback = userName;
  try {
    if (isAuthenticatedValue) {
      sessionStorage.setItem(AUTH_KEY, "1");
      sessionStorage.setItem(AUTH_NAME_KEY, userName);
    } else {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_NAME_KEY);
    }
  } catch {
    // Fallback in-memory when sessionStorage is not available.
  }
}

function getAuthName() {
  try {
    return sessionStorage.getItem(AUTH_NAME_KEY) || authNameFallback || AUTH_USER;
  } catch {
    return authNameFallback || AUTH_USER;
  }
}

function showLogin() {
  appRoot.classList.add("hidden");
  loginView.classList.remove("hidden");
  loginUserInput.focus();
}

function showApp() {
  loginView.classList.add("hidden");
  appRoot.classList.remove("hidden");
  welcomeMessage.textContent = `Bienvenido ${getAuthName()}`;
}

function onSubmit(event) {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    date: getValue("date"),
    exercise: getValue("exercise"),
    sets: Number(getValue("sets")),
    reps: Number(getValue("reps")),
    weight: Number(getValue("weight")),
    notes: getValue("notes"),
  };

  entries.unshift(entry);
  persistEntries();
  form.reset();
  document.querySelector("#date").value = new Date().toISOString().slice(0, 10);
  render();
}

function onDelete(id) {
  entries = entries.filter((entry) => entry.id !== id);
  persistEntries();
  render();
}

function onClearAll() {
  if (!entries.length) return;
  const shouldDelete = window.confirm("Borrar todo el historial?");
  if (!shouldDelete) return;

  entries = [];
  persistEntries();
  render();
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = entries.filter((entry) =>
    entry.exercise.toLowerCase().includes(query)
  );

  renderRows(filtered);
  renderStats();
  renderRecords();
}

function renderRows(data) {
  entriesBody.innerHTML = "";

  if (!data.length) {
    entriesBody.innerHTML = `<tr><td colspan="8">Sin registros aun.</td></tr>`;
    return;
  }

  for (const entry of data) {
    const tr = document.createElement("tr");
    const volume = calculateVolume(entry);

    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${escapeHtml(entry.exercise)}</td>
      <td>${entry.sets}</td>
      <td>${entry.reps}</td>
      <td>${entry.weight}</td>
      <td>${volume.toFixed(1)}</td>
      <td>${escapeHtml(entry.notes || "-")}</td>
      <td><button class="inline-button" data-id="${entry.id}" type="button">Eliminar</button></td>
    `;
    entriesBody.appendChild(tr);
  }

  entriesBody.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", () => onDelete(button.dataset.id));
  });
}

function renderStats() {
  totalEntriesEl.textContent = String(entries.length);

  const totalVolume = entries.reduce(
    (acc, entry) => acc + calculateVolume(entry),
    0
  );
  totalVolumeEl.textContent = totalVolume.toFixed(1);

  const last = entries
    .map((entry) => entry.date)
    .sort((a, b) => (a < b ? 1 : -1))[0];
  lastWorkoutEl.textContent = last || "-";
}

function renderRecords() {
  recordsListEl.innerHTML = "";
  if (!entries.length) {
    recordsListEl.innerHTML = "<li>Sin datos.</li>";
    return;
  }

  const bestByExercise = new Map();

  for (const entry of entries) {
    const key = entry.exercise.trim().toLowerCase();
    const current = bestByExercise.get(key);
    if (!current || entry.weight > current.weight) {
      bestByExercise.set(key, entry);
    }
  }

  const sorted = [...bestByExercise.values()].sort((a, b) =>
    a.exercise.localeCompare(b.exercise, "es")
  );

  for (const record of sorted) {
    const li = document.createElement("li");
    li.textContent = `${record.exercise}: ${record.weight} kg x ${record.reps} reps (${record.date})`;
    recordsListEl.appendChild(li);
  }
}

function calculateVolume(entry) {
  return entry.sets * entry.reps * entry.weight;
}

function getValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
