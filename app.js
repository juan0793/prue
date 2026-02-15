const KEYS = {
  entries: "gym-tracker-entries-by-user-v1",
  users: "gym-tracker-users-v1",
  profiles: "gym-tracker-profiles-by-user-v1",
  favorites: "gym-tracker-favorites-by-user-v1",
  posts: "gym-tracker-posts-v1",
  auth: "gym-tracker-auth-v1",
  authName: "gym-tracker-auth-name-v1",
};

const q = (s) => document.querySelector(s);
const qa = (s) => [...document.querySelectorAll(s)];

const loginView = q("#login-view");
const appRoot = q("#app-root");
const authForm = q("#auth-form");
const authUserInput = q("#auth-user");
const authPassInput = q("#auth-pass");
const authPassConfirmInput = q("#auth-pass-confirm");
const confirmWrap = q("#confirm-wrap");
const authSubmitButton = q("#auth-submit");
const tabLoginButton = q("#tab-login");
const tabRegisterButton = q("#tab-register");
const twitterLoginButton = q("#twitter-login");
const loginError = q("#login-error");
const logoutButton = q("#logout-btn");
const welcomeMessage = q("#welcome-message");

const navTabs = qa(".nav-tab");
const appViews = qa(".app-view");
const adminTab = q("#admin-tab");

const feedList = q("#feed-list");
const loadMoreTrendsButton = q("#load-more-trends");
const communityUserList = q("#community-user-list");
const postForm = q("#post-form");
const postInput = q("#post-input");
const myPostsList = q("#my-posts-list");

const form = q("#entry-form");
const entriesBody = q("#entries-body");
const searchInput = q("#search");
const clearAllButton = q("#clear-all");
const muscleOptionsEl = q("#muscle-options");
const exerciseMenuEl = q("#exercise-menu");
const selectedGroupLabelEl = q("#selected-group-label");
const exerciseOptionsEl = q("#exercise-options");
const exerciseInput = q("#exercise");
const recommendationIntroEl = q("#recommendation-intro");
const recommendationListEl = q("#recommendation-list");
const routineStyleSelect = q("#routine-style");

const periodDateInput = q("#period-date");
const totalEntriesEl = q("#total-entries");
const totalVolumeEl = q("#total-volume");
const lastWorkoutEl = q("#last-workout");
const quickTotalEntriesEl = q("#quick-total-entries");
const quickTotalVolumeEl = q("#quick-total-volume");
const quickLastWorkoutEl = q("#quick-last-workout");
const recordsListEl = q("#records-list");
const periodDayEl = q("#period-day");
const periodMonthEl = q("#period-month");
const periodYearEl = q("#period-year");

const profileNameInput = q("#profile-name");
const profileAgeInput = q("#profile-age");
const profileHeightInput = q("#profile-height");
const profileWeightInput = q("#profile-weight");
const profileGoalInput = q("#profile-goal");
const profileRoutineSelect = q("#profile-routine");
const profilePhotoInput = q("#profile-photo");
const profileAvatar = q("#profile-avatar");
const saveProfileButton = q("#save-profile");
const profileMessage = q("#profile-message");

const favoriteInput = q("#favorite-input");
const addFavoriteButton = q("#add-favorite");
const favoriteListEl = q("#favorite-list");

const adminUsersCount = q("#admin-users-count");
const adminPostsCount = q("#admin-posts-count");
const adminMessagesCount = q("#admin-messages-count");
const adminEntriesCount = q("#admin-entries-count");
const adminUsersBody = q("#admin-users-body");

let users = read(KEYS.users, []);
let entriesByUser = read(KEYS.entries, {});
let profilesByUser = read(KEYS.profiles, {});
let favoritesByUser = read(KEYS.favorites, {});
let posts = read(KEYS.posts, []);
let entries = [];
let favorites = [];
let selectedGroup = "";
let authMode = "login";
let trendsVisibleCount = 18;
const trendsPool = buildTrendPool();

const WORKOUT_CATALOG = {
  pierna: ["Sentadilla", "Prensa", "Peso muerto rumano", "Zancadas", "Curl femoral"],
  pecho: ["Press banca", "Press inclinado", "Aperturas", "Cruce en polea"],
  espalda: ["Dominadas", "Jalon al pecho", "Remo con barra", "Face pull"],
  hombro: ["Press militar", "Elevaciones laterales", "Pajaro", "Encogimientos"],
};

seedAdmin();
init();

function init() {
  const today = new Date().toISOString().slice(0, 10);
  if (q("#date")) q("#date").value = today;
  if (periodDateInput) periodDateInput.value = today;

  tabLoginButton?.addEventListener("click", () => setAuthMode("login"));
  tabRegisterButton?.addEventListener("click", () => setAuthMode("register"));
  twitterLoginButton?.addEventListener("click", onTwitterLogin);
  authForm?.addEventListener("submit", onAuthSubmit);
  logoutButton?.addEventListener("click", onLogout);
  navTabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

  loadMoreTrendsButton?.addEventListener("click", onLoadMoreTrends);
  postForm?.addEventListener("submit", onCreatePost);

  form?.addEventListener("submit", onSubmit);
  searchInput?.addEventListener("input", renderWorkoutRows);
  clearAllButton?.addEventListener("click", onClearAll);
  muscleOptionsEl?.addEventListener("click", onMuscleGroupClick);
  routineStyleSelect?.addEventListener("input", renderRoutineRecommendation);
  periodDateInput?.addEventListener("input", renderPeriodResults);

  saveProfileButton?.addEventListener("click", onSaveProfile);
  profileRoutineSelect?.addEventListener("input", onProfileRoutineChange);
  profilePhotoInput?.addEventListener("change", onProfilePhotoSelected);
  addFavoriteButton?.addEventListener("click", onAddFavorite);

  if (isAuthenticated()) {
    hydrateUserData();
    showApp();
    render();
  } else {
    showLogin();
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const isRegister = mode === "register";
  tabLoginButton?.classList.toggle("active", !isRegister);
  tabRegisterButton?.classList.toggle("active", isRegister);
  confirmWrap?.classList.toggle("hidden", !isRegister);
  if (authPassConfirmInput) authPassConfirmInput.required = isRegister;
  if (authSubmitButton) authSubmitButton.textContent = isRegister ? "Crear cuenta" : "Entrar";
  if (loginError) loginError.textContent = "";
}

function onAuthSubmit(event) {
  event.preventDefault();
  const username = authUserInput.value.trim();
  const password = authPassInput.value.trim();
  if (authMode === "register") return handleRegister(username, password, authPassConfirmInput.value.trim());
  handleLogin(username, password);
}

function handleRegister(username, password, confirm) {
  if (username.length < 3) return (loginError.textContent = "Usuario muy corto.");
  if (password.length < 4) return (loginError.textContent = "Contrasena muy corta.");
  if (password !== confirm) return (loginError.textContent = "Contrasenas no coinciden.");
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return (loginError.textContent = "Ese usuario ya existe.");
  users.push({ username, password, provider: "local" });
  write(KEYS.users, users);
  setAuthState(true, username);
  hydrateUserData();
  showApp();
  render();
}

function handleLogin(username, password) {
  const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!found) return (loginError.textContent = "Usuario no encontrado.");
  if (found.provider === "twitter") return (loginError.textContent = "Usa el boton de Twitter.");
  if (found.password !== password) return (loginError.textContent = "Contrasena incorrecta.");
  setAuthState(true, found.username);
  hydrateUserData();
  showApp();
  render();
}

function onTwitterLogin() {
  const handle = window.prompt("Usuario de Twitter (sin @):", "");
  if (!handle) return;
  const username = handle.replaceAll("@", "").trim();
  if (!username) return;
  if (!users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    users.push({ username, password: "", provider: "twitter" });
    write(KEYS.users, users);
  }
  setAuthState(true, username);
  hydrateUserData();
  showApp();
  render();
}

function onLogout() {
  setAuthState(false, "");
  entries = [];
  favorites = [];
  selectedGroup = "";
  showLogin();
}

function showLogin() {
  appRoot?.classList.add("hidden");
  loginView?.classList.remove("hidden");
  setAuthMode("login");
  authUserInput?.focus();
}

function showApp() {
  loginView?.classList.add("hidden");
  appRoot?.classList.remove("hidden");
  if (welcomeMessage) welcomeMessage.textContent = `Bienvenido ${getAuthName()}`;
  adminTab?.classList.toggle("hidden", !isAdmin());
  switchView("home");
}

function switchView(viewName) {
  if (viewName === "admin" && !isAdmin()) return;
  navTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  appViews.forEach((view) => view.classList.toggle("hidden", view.id !== `view-${viewName}`));
}

function renderTrends() {
  if (!feedList) return;
  feedList.innerHTML = "";
  trendsPool.slice(0, trendsVisibleCount).forEach((item) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `<header><strong>@${escapeHtml(item.user)}</strong><small>${formatDateTime(item.date)}</small></header><p>${escapeHtml(item.text)}</p>`;
    feedList.appendChild(card);
  });
  loadMoreTrendsButton?.classList.toggle("hidden", trendsVisibleCount >= trendsPool.length);
}

function onLoadMoreTrends() {
  trendsVisibleCount = Math.min(trendsPool.length, trendsVisibleCount + 15);
  renderTrends();
}
function onCreatePost(event) {
  event.preventDefault();
  const text = postInput?.value.trim();
  if (!text) return;
  posts.unshift({ id: crypto.randomUUID(), user: getAuthName(), text, date: new Date().toISOString() });
  write(KEYS.posts, posts);
  postInput.value = "";
  renderMyPosts();
  renderAdmin();
}

function renderMyPosts() {
  if (!myPostsList) return;
  const mine = posts.filter((p) => p.user.toLowerCase() === getAuthName().toLowerCase());
  myPostsList.innerHTML = mine.length ? "" : "<p class='muted-message'>Aun no publicaste nada.</p>";
  mine.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `<header><strong>@${escapeHtml(post.user)}</strong><small>${formatDateTime(post.date)}</small></header><p>${escapeHtml(post.text)}</p>`;
    myPostsList.appendChild(card);
  });
}

function renderCommunityUsers() {
  if (!communityUserList) return;
  const list = users.filter((u) => u.username.toLowerCase() !== getAuthName().toLowerCase());
  communityUserList.innerHTML = list.length ? "" : "<p class='muted-message'>No hay otros usuarios por ahora.</p>";
  list.forEach((user) => {
    const row = document.createElement("div");
    row.className = "community-user";
    row.innerHTML = `<div><strong>@${escapeHtml(user.username)}</strong><small>${escapeHtml(user.provider || "local")}</small></div><button type='button' class='msg-icon' title='Mensaje privado'>✉</button>`;
    communityUserList.appendChild(row);
  });
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
  persistEntriesForCurrentUser();
  form.reset();
  q("#date").value = new Date().toISOString().slice(0, 10);
  render();
}

function onDelete(id) {
  entries = entries.filter((e) => e.id !== id);
  persistEntriesForCurrentUser();
  render();
}

function onClearAll() {
  if (!entries.length) return;
  if (!window.confirm("Borrar todo el historial del usuario actual?")) return;
  entries = [];
  persistEntriesForCurrentUser();
  render();
}

function onMuscleGroupClick(event) {
  const button = event.target.closest("button[data-group]");
  if (!button) return;
  selectedGroup = button.dataset.group;
  qa("#muscle-options button[data-group]").forEach((b) => b.classList.toggle("active", b.dataset.group === selectedGroup));
  renderExerciseMenu();
  renderRoutineRecommendation();
}

function renderExerciseMenu() {
  const exercises = WORKOUT_CATALOG[selectedGroup] || [];
  if (!selectedGroup || !exercises.length) {
    exerciseMenuEl?.classList.add("hidden");
    if (exerciseOptionsEl) exerciseOptionsEl.innerHTML = "";
    return;
  }
  selectedGroupLabelEl.textContent = capitalize(selectedGroup);
  exerciseMenuEl.classList.remove("hidden");
  exerciseOptionsEl.innerHTML = "";
  exercises.forEach((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "exercise-chip";
    chip.textContent = name;
    chip.addEventListener("click", () => {
      exerciseInput.value = name;
      exerciseInput.focus();
    });
    exerciseOptionsEl.appendChild(chip);
  });
}

function renderRoutineRecommendation() {
  if (!recommendationListEl) return;
  recommendationListEl.innerHTML = "";
  if (!selectedGroup) {
    recommendationIntroEl.textContent = "Selecciona un grupo muscular para generar una rutina.";
    recommendationListEl.innerHTML = "<li>Sin recomendaciones por ahora.</li>";
    return;
  }
  const style = routineStyleSelect?.value || profileRoutineSelect?.value || "hypertrophy";
  const groupExercises = WORKOUT_CATALOG[selectedGroup] || [];
  const groupHistory = entries.filter((e) =>
    groupExercises.some((ex) => ex.toLowerCase() === e.exercise.toLowerCase())
  );
  const weeklyVolume = groupHistory
    .filter((e) => daysAgo(e.date) <= 7)
    .reduce((acc, e) => acc + calculateVolume(e), 0);
  const bestByExercise = getBestSetByExercise(groupHistory);
  const profileGoal = (profileGoalInput?.value || "").toLowerCase();
  const profileLevel = inferLevel(groupHistory);
  const basePrescription = buildSmartPrescription(style, profileGoal, weeklyVolume, profileLevel);

  const orderedExercises = prioritizeExercises(groupExercises, bestByExercise, favorites);
  recommendationIntroEl.textContent = `Plan ${style.toUpperCase()} para ${capitalize(
    selectedGroup
  )} (${profileLevel}, volumen semanal ${weeklyVolume.toFixed(0)} kg).`;

  orderedExercises.slice(0, 4).forEach((exercise, index) => {
    const best = bestByExercise.get(exercise.toLowerCase());
    const progression = best ? ` | ultima marca: ${best.weight}kg x ${best.reps}` : " | primera semana";
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${exercise}: ${basePrescription}${progression}`;
    recommendationListEl.appendChild(li);
  });
}

function getBestSetByExercise(data) {
  const map = new Map();
  data.forEach((entry) => {
    const key = entry.exercise.toLowerCase();
    const current = map.get(key);
    if (!current || entry.weight > current.weight) {
      map.set(key, entry);
    }
  });
  return map;
}

function prioritizeExercises(groupExercises, bestMap, favs) {
  const favSet = new Set((favs || []).map((f) => f.toLowerCase()));
  return [...groupExercises].sort((a, b) => {
    const af = favSet.has(a.toLowerCase()) ? 1 : 0;
    const bf = favSet.has(b.toLowerCase()) ? 1 : 0;
    if (af !== bf) return bf - af;
    const aw = bestMap.get(a.toLowerCase())?.weight || 0;
    const bw = bestMap.get(b.toLowerCase())?.weight || 0;
    return bw - aw;
  });
}

function buildSmartPrescription(style, goal, weeklyVolume, level) {
  const isStrength = goal.includes("fuerza");
  const lowVolume = weeklyVolume < 5000;
  const highVolume = weeklyVolume > 18000;

  if (style === "heavy-duty") {
    return isStrength
      ? "2 series pesadas (4-6 reps), descanso 3-4 min"
      : "1 serie efectiva al fallo + 1 aproximacion (6-10 reps)";
  }
  if (style === "ppl") {
    if (isStrength) return "3 ejercicios, 4-5 series x 4-6 reps";
    if (lowVolume) return "3 ejercicios, 3 series x 10-12 reps";
    if (highVolume) return "2-3 ejercicios, 2-3 series x 10 reps";
    return "3-4 ejercicios, 3-4 series x 8-12 reps";
  }
  if (style === "upper-lower") {
    return level === "principiante"
      ? "3 ejercicios, 3 series x 10-12 reps"
      : "4 ejercicios, 3-4 series x 8-12 reps";
  }
  if (style === "full-body") {
    return "2-3 ejercicios, 2-3 series x 10-12 reps";
  }
  return isStrength ? "5 series x 5 reps" : "3-4 series x 8-12 reps";
}

function inferLevel(data) {
  if (!data.length) return "principiante";
  const sessions = data.length;
  const heavySets = data.filter((e) => Number(e.weight) >= 60).length;
  if (sessions > 40 || heavySets > 20) return "avanzado";
  if (sessions > 18 || heavySets > 8) return "intermedio";
  return "principiante";
}

function daysAgo(dateValue) {
  const today = new Date();
  const then = new Date(dateValue);
  return Math.floor((today - then) / (1000 * 60 * 60 * 24));
}

function onSaveProfile() {
  const previous = loadProfileForCurrentUser();
  profilesByUser[getAuthName()] = {
    name: profileNameInput.value.trim(),
    age: profileAgeInput.value.trim(),
    height: profileHeightInput.value.trim(),
    weight: profileWeightInput.value.trim(),
    goal: profileGoalInput.value.trim(),
    routine: profileRoutineSelect.value,
    avatar: previous.avatar || "",
  };
  write(KEYS.profiles, profilesByUser);
  profileMessage.textContent = "Perfil actualizado.";
}

function onProfileRoutineChange() {
  if (routineStyleSelect) routineStyleSelect.value = profileRoutineSelect.value;
  renderRoutineRecommendation();
}

function onProfilePhotoSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const profile = loadProfileForCurrentUser();
    profile.avatar = String(reader.result || "");
    profilesByUser[getAuthName()] = profile;
    write(KEYS.profiles, profilesByUser);
    applyProfileAvatar(profile.avatar);
    profileMessage.textContent = "Foto actualizada.";
  };
  reader.readAsDataURL(file);
}

function onAddFavorite() {
  const value = favoriteInput.value.trim();
  if (!value) return;
  if (favorites.some((f) => f.toLowerCase() === value.toLowerCase())) return;
  favorites.push(value);
  favoritesByUser[getAuthName()] = favorites;
  write(KEYS.favorites, favoritesByUser);
  favoriteInput.value = "";
  renderFavorites();
}

function onRemoveFavorite(name) {
  favorites = favorites.filter((f) => f.toLowerCase() !== name.toLowerCase());
  favoritesByUser[getAuthName()] = favorites;
  write(KEYS.favorites, favoritesByUser);
  renderFavorites();
}

function renderFavorites() {
  favoriteListEl.innerHTML = favorites.length ? "" : "<li>Sin favoritos aun.</li>";
  favorites.forEach((name) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(name)}</span><button type='button' class='inline-button' data-fav='${escapeHtml(name)}'>Quitar</button>`;
    favoriteListEl.appendChild(li);
  });
  qa("#favorite-list button[data-fav]").forEach((b) => b.addEventListener("click", () => onRemoveFavorite(b.dataset.fav)));
}

function renderWorkoutRows() {
  if (!entriesBody) return;
  const query = (searchInput?.value || "").trim().toLowerCase();
  const data = entries.filter((e) => e.exercise.toLowerCase().includes(query));
  entriesBody.innerHTML = data.length ? "" : "<tr><td colspan='8'>Sin registros aun.</td></tr>";
  data.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.date}</td><td>${escapeHtml(e.exercise)}</td><td>${e.sets}</td><td>${e.reps}</td><td>${e.weight}</td><td>${calculateVolume(e).toFixed(1)}</td><td>${escapeHtml(e.notes || "-")}</td><td><button type='button' class='inline-button' data-id='${e.id}'>Eliminar</button></td>`;
    entriesBody.appendChild(tr);
  });
  qa("#entries-body button[data-id]").forEach((b) => b.addEventListener("click", () => onDelete(b.dataset.id)));
}

function renderStats() {
  const totalEntries = entries.length;
  const totalVolume = entries.reduce((acc, e) => acc + calculateVolume(e), 0);
  const last = entries.map((e) => e.date).sort((a, b) => (a < b ? 1 : -1))[0] || "-";
  totalEntriesEl.textContent = quickTotalEntriesEl.textContent = String(totalEntries);
  totalVolumeEl.textContent = quickTotalVolumeEl.textContent = totalVolume.toFixed(1);
  lastWorkoutEl.textContent = quickLastWorkoutEl.textContent = last;
}

function renderRecords() {
  recordsListEl.innerHTML = "";
  if (!entries.length) return (recordsListEl.innerHTML = "<li>Sin datos.</li>");
  const best = new Map();
  entries.forEach((e) => {
    const k = e.exercise.toLowerCase();
    if (!best.get(k) || e.weight > best.get(k).weight) best.set(k, e);
  });
  [...best.values()].forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `${r.exercise}: ${r.weight} kg x ${r.reps} reps (${r.date})`;
    recordsListEl.appendChild(li);
  });
}

function renderPeriodResults() {
  const selectedDate = periodDateInput.value || new Date().toISOString().slice(0, 10);
  const day = entries.filter((e) => e.date === selectedDate);
  const month = entries.filter((e) => e.date.startsWith(selectedDate.slice(0, 7)));
  const year = entries.filter((e) => e.date.startsWith(selectedDate.slice(0, 4)));
  periodDayEl.textContent = formatPeriodResult(day);
  periodMonthEl.textContent = formatPeriodResult(month);
  periodYearEl.textContent = formatPeriodResult(year);
}

function renderAdmin() {
  if (!isAdmin()) return;
  const totalEntries = Object.values(entriesByUser).reduce((acc, list) => acc + (Array.isArray(list) ? list.length : 0), 0);
  adminUsersCount.textContent = String(users.length);
  adminPostsCount.textContent = String(posts.length);
  adminMessagesCount.textContent = "0";
  adminEntriesCount.textContent = String(totalEntries);
  adminUsersBody.innerHTML = "";
  users.forEach((u) => {
    const tr = document.createElement("tr");
    const canDelete = u.username.toLowerCase() !== "admin";
    const postCount = posts.filter((p) => p.user.toLowerCase() === u.username.toLowerCase()).length;
    tr.innerHTML = `<td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.provider || "local")}</td><td>${(entriesByUser[u.username] || []).length}</td><td>${postCount}</td><td>${escapeHtml(profilesByUser[u.username]?.goal || "-")}</td><td>${canDelete ? `<button type='button' class='inline-button' data-del='${escapeHtml(u.username)}'>Eliminar</button>` : "-"}</td>`;
    adminUsersBody.appendChild(tr);
  });
  qa("#admin-users-body button[data-del]").forEach((b) => b.addEventListener("click", () => deleteUser(b.dataset.del)));
}

function deleteUser(username) {
  if (!isAdmin()) return;
  if (!window.confirm(`Eliminar usuario ${username}?`)) return;
  users = users.filter((u) => u.username.toLowerCase() !== username.toLowerCase());
  delete entriesByUser[username];
  delete profilesByUser[username];
  delete favoritesByUser[username];
  posts = posts.filter((p) => p.user.toLowerCase() !== username.toLowerCase());
  write(KEYS.users, users);
  write(KEYS.entries, entriesByUser);
  write(KEYS.profiles, profilesByUser);
  write(KEYS.favorites, favoritesByUser);
  write(KEYS.posts, posts);
  render();
}

function hydrateUserData() {
  entries = Array.isArray(entriesByUser[getAuthName()]) ? entriesByUser[getAuthName()] : [];
  favorites = Array.isArray(favoritesByUser[getAuthName()]) ? favoritesByUser[getAuthName()] : [];
  const profile = loadProfileForCurrentUser();
  profileNameInput.value = profile.name || "";
  profileAgeInput.value = profile.age || "";
  profileHeightInput.value = profile.height || "";
  profileWeightInput.value = profile.weight || "";
  profileGoalInput.value = profile.goal || "";
  profileRoutineSelect.value = profile.routine || "hypertrophy";
  routineStyleSelect.value = profile.routine || "hypertrophy";
  applyProfileAvatar(profile.avatar || "");
  renderFavorites();
}

function render() {
  renderTrends();
  renderCommunityUsers();
  renderMyPosts();
  renderWorkoutRows();
  renderStats();
  renderRecords();
  renderPeriodResults();
  renderRoutineRecommendation();
  renderAdmin();
}

function seedAdmin() {
  if (users.some((u) => u.username.toLowerCase() === "admin")) return;
  users.push({ username: "admin", password: "12345", provider: "local" });
  write(KEYS.users, users);
}

function buildTrendPool() {
  const bots = ["fitpulse", "gymdaily", "strengthlab", "coachnova", "leanwave", "hypertrophyhq", "movemotion", "fitinside"];
  const topics = ["Rutina de gluteo en 20 minutos", "Top 5 desayunos altos en proteina", "Errores comunes en sentadilla", "Movilidad de hombro para press", "Como progresar en dominadas", "Mini circuito HIIT", "Recuperacion activa post pierna", "Guia de volumen semanal"];
  const tags = ["#fitness", "#gym", "#muscle", "#hypertrophy", "#strength", "#wellness", "#nutrition"];
  const out = [];
  for (let i = 0; i < 220; i += 1) {
    out.push({ user: bots[i % bots.length], text: `${topics[i % topics.length]}. Consejo #${(i % 12) + 1} ${tags[i % tags.length]} ${tags[(i + 3) % tags.length]}`, date: new Date(Date.now() - i * 1000 * 60 * 23).toISOString() });
  }
  return out;
}

function loadProfileForCurrentUser() {
  return profilesByUser[getAuthName()] || { name: "", age: "", height: "", weight: "", goal: "", routine: "hypertrophy", avatar: "" };
}

function applyProfileAvatar(value) {
  const fallback = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='24' fill='#dbeafe'/><circle cx='60' cy='44' r='20' fill='#1d4ed8'/><rect x='24' y='72' width='72' height='30' rx='15' fill='#1e3a8a'/></svg>");
  if (profileAvatar) profileAvatar.src = value || fallback;
}

function formatPeriodResult(list) { return `${list.length} ejercicios | ${list.reduce((acc, e) => acc + calculateVolume(e), 0).toFixed(1)} kg`; }
function calculateVolume(e) { return e.sets * e.reps * e.weight; }
function getValue(id) { return q(`#${id}`).value.trim(); }
function formatDateTime(v) { try { return new Date(v).toLocaleString(); } catch { return v; } }
function capitalize(v) { return v.charAt(0).toUpperCase() + v.slice(1); }
function isAdmin() { return getAuthName().toLowerCase() === "admin"; }
function isAuthenticated() { try { return sessionStorage.getItem(KEYS.auth) === "1" || authFallback; } catch { return authFallback; } }
function setAuthState(v, name) { authFallback = v; authNameFallback = name; try { if (v) { sessionStorage.setItem(KEYS.auth, "1"); sessionStorage.setItem(KEYS.authName, name); } else { sessionStorage.removeItem(KEYS.auth); sessionStorage.removeItem(KEYS.authName); } } catch {} }
function getAuthName() { try { return sessionStorage.getItem(KEYS.authName) || authNameFallback || "admin"; } catch { return authNameFallback || "admin"; } }
function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadUsers() { const v = read(KEYS.users, []); return Array.isArray(v) ? v : []; }
function loadEntriesByUser() { const v = read(KEYS.entries, {}); return v && typeof v === "object" ? v : {}; }
function loadProfilesByUser() { const v = read(KEYS.profiles, {}); return v && typeof v === "object" ? v : {}; }
function loadFavoritesByUser() { const v = read(KEYS.favorites, {}); return v && typeof v === "object" ? v : {}; }
function loadPosts() { const v = read(KEYS.posts, []); return Array.isArray(v) ? v : []; }
function persistEntriesForCurrentUser() { entriesByUser[getAuthName()] = entries; write(KEYS.entries, entriesByUser); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
