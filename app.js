const KEYS = {
  entries: "gym-tracker-entries-by-user-v1",
  users: "gym-tracker-users-v1",
  profiles: "gym-tracker-profiles-by-user-v1",
  favorites: "gym-tracker-favorites-by-user-v1",
  posts: "gym-tracker-posts-v1",
  backup: "gym-tracker-backup-v1",
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
const notificationButton = q("#notification-btn");
const notificationCountEl = q("#notification-count");
const notificationPanel = q("#notification-panel");
const notificationListEl = q("#notification-list");

const navTabs = qa(".nav-tab");
const appViews = qa(".app-view");
const adminTab = q("#admin-tab");

const feedList = q("#feed-list");
const loadMoreTrendsButton = q("#load-more-trends");
const homeSpotlightList = q("#home-spotlight-list");
const homeAchievements = q("#home-achievements");
const homeTopicButtons = qa("#home-topic-tabs button[data-topic]");
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
const groupedStatsListEl = q("#grouped-stats-list");
const aiCoachSummaryEl = q("#ai-coach-summary");
const periodDayEl = q("#period-day");
const periodMonthEl = q("#period-month");
const periodYearEl = q("#period-year");
const dailyDateInput = q("#daily-date");
const dailySummaryEl = q("#daily-summary");
const dailyExerciseListEl = q("#daily-exercise-list");
const dailyInsightEl = q("#daily-insight");
const calendarGridEl = q("#calendar-grid");
const calendarMonthLabelEl = q("#calendar-month-label");
const calendarPrevButton = q("#calendar-prev");
const calendarNextButton = q("#calendar-next");
const insightSummaryEl = q("#insight-summary");
const insightLoadEl = q("#insight-load");
const insightProgressEl = q("#insight-progress");
const insightNextEl = q("#insight-next");

const profileNameInput = q("#profile-name");
const profileAgeInput = q("#profile-age");
const profileHeightInput = q("#profile-height");
const profileWeightInput = q("#profile-weight");
const profileGoalInput = q("#profile-goal");
const profileRoutineSelect = q("#profile-routine");
const profilePhotoInput = q("#profile-photo");
const profileAvatar = q("#profile-avatar");
const saveProfileButton = q("#save-profile");
const exportBackupButton = q("#export-backup");
const importBackupButton = q("#import-backup");
const importBackupFileInput = q("#import-backup-file");
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
let feedPage = 1;
let homeTopic = "logros";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const FEED_PAGE_SIZE = 10;

const WORKOUT_CATALOG = {
  pierna: ["Sentadilla", "Prensa", "Peso muerto rumano", "Zancadas", "Curl femoral"],
  pecho: ["Press banca", "Press inclinado", "Aperturas", "Cruce en polea"],
  espalda: ["Dominadas", "Jalon al pecho", "Remo con barra", "Face pull"],
  hombro: ["Press militar", "Elevaciones laterales", "Pajaro", "Encogimientos"],
  gemelo: ["Elevacion de talones de pie", "Elevacion de talones sentado", "Donkey calf raise", "Prensa para gemelo"],
  gluteo: ["Hip thrust", "Patada de gluteo en polea", "Sentadilla sumo", "Puente de gluteo"],
};
const EXERCISE_GROUP_MAP = buildExerciseGroupMap(WORKOUT_CATALOG);

seedAdmin();
init();

function init() {
  const today = new Date().toISOString().slice(0, 10);
  if (q("#date")) q("#date").value = today;
  if (periodDateInput) periodDateInput.value = today;
  if (dailyDateInput) dailyDateInput.value = today;
  restoreFromBackupIfNeeded();
  requestPersistentStorage();

  tabLoginButton?.addEventListener("click", () => setAuthMode("login"));
  tabRegisterButton?.addEventListener("click", () => setAuthMode("register"));
  twitterLoginButton?.addEventListener("click", onTwitterLogin);
  authForm?.addEventListener("submit", onAuthSubmit);
  logoutButton?.addEventListener("click", onLogout);
  notificationButton?.addEventListener("click", onToggleNotifications);
  navTabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

  loadMoreTrendsButton?.addEventListener("click", onLoadMoreTrends);
  postForm?.addEventListener("submit", onCreatePost);
  homeTopicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      homeTopic = button.dataset.topic || "logros";
      homeTopicButtons.forEach((b) => b.classList.toggle("active", b === button));
      renderHomeHighlights();
    });
  });

  form?.addEventListener("submit", onSubmit);
  searchInput?.addEventListener("input", renderWorkoutRows);
  clearAllButton?.addEventListener("click", onClearAll);
  if (clearAllButton) {
    clearAllButton.textContent = "Historial protegido";
    clearAllButton.disabled = true;
  }
  muscleOptionsEl?.addEventListener("click", onMuscleGroupClick);
  routineStyleSelect?.addEventListener("input", renderRoutineRecommendation);
  periodDateInput?.addEventListener("input", renderPeriodResults);
  dailyDateInput?.addEventListener("input", renderDailyAnalysis);
  calendarPrevButton?.addEventListener("click", () => moveCalendarMonth(-1));
  calendarNextButton?.addEventListener("click", () => moveCalendarMonth(1));

  saveProfileButton?.addEventListener("click", onSaveProfile);
  exportBackupButton?.addEventListener("click", onExportBackup);
  importBackupButton?.addEventListener("click", () => importBackupFileInput?.click());
  importBackupFileInput?.addEventListener("change", onImportBackupFile);
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
  feedPage = 1;
  notificationPanel?.classList.add("hidden");
  switchView("home");
}

function switchView(viewName) {
  if (viewName === "admin" && !isAdmin()) return;
  navTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  appViews.forEach((view) => view.classList.toggle("hidden", view.id !== `view-${viewName}`));
}

function renderHomeFeed() {
  if (!feedList) return;
  renderHomeHighlights();
  const items = buildHomeFeedItems();
  const visible = items.slice(0, feedPage * FEED_PAGE_SIZE);

  feedList.innerHTML = "";
  visible.forEach((item) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `<header><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(
      item.meta
    )}</small></header><p>${escapeHtml(item.text)}</p>`;
    feedList.appendChild(card);
  });

  loadMoreTrendsButton?.classList.toggle("hidden", visible.length >= items.length);
}

function renderHomeHighlights() {
  renderHomeSpotlight();
  renderHomeAchievements();
}

function renderHomeSpotlight() {
  if (!homeSpotlightList) return;
  const items = getHomeSpotlightItems(homeTopic);
  homeSpotlightList.innerHTML = "";
  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "spotlight-card";
    article.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" /><div><small>${escapeHtml(
      item.badge
    )}</small><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p></div>`;
    homeSpotlightList.appendChild(article);
  });
}

function renderHomeAchievements() {
  if (!homeAchievements) return;
  const badges = buildUserAchievementBadges();
  homeAchievements.innerHTML = "";
  badges.forEach((badge) => {
    const node = document.createElement("article");
    node.className = "achievement-pill";
    node.innerHTML = `<strong>${escapeHtml(badge.title)}</strong><span>${escapeHtml(badge.text)}</span>`;
    homeAchievements.appendChild(node);
  });
}

function getHomeSpotlightItems(topic) {
  const goal = (profileGoalInput?.value || "").toLowerCase();
  const isCut = goal.includes("defin") || goal.includes("bajar");
  const nutritionText = isCut
    ? "Prioriza proteina alta y carbohidrato alrededor del entreno."
    : "Sube calorias limpias con proteina y carbohidratos complejos.";
  const catalog = {
    logros: [
      {
        badge: "Progreso",
        title: "Consistencia semanal",
        text: "Completa 3-4 dias para acelerar resultados visibles.",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60",
      },
      {
        badge: "Fuerza",
        title: "Sobrecarga progresiva",
        text: "Si cumples repeticiones objetivo, sube 2.5 kg la proxima sesion.",
        image:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60",
      },
    ],
    comida: [
      {
        badge: "Nutricion",
        title: "Plato inteligente",
        text: nutritionText,
        image:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=60",
      },
      {
        badge: "Hidratacion",
        title: "Objetivo diario",
        text: "Apunta a 30-35 ml de agua por kg de peso corporal.",
        image:
          "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=60",
      },
    ],
    recuperacion: [
      {
        badge: "Recuperacion",
        title: "Dormir para crecer",
        text: "7-9 horas mejora rendimiento, hormonas y sintesis muscular.",
        image:
          "https://images.unsplash.com/photo-1455642305367-68834a7a4f3f?auto=format&fit=crop&w=800&q=60",
      },
      {
        badge: "Movilidad",
        title: "Reset post-entreno",
        text: "8 minutos de movilidad reducen rigidez y mejoran tecnica.",
        image:
          "https://images.unsplash.com/photo-1599058917212-d750089bc0be?auto=format&fit=crop&w=800&q=60",
      },
    ],
  };
  return catalog[topic] || catalog.logros;
}

function buildUserAchievementBadges() {
  const weekEntries = entries.filter((entry) => daysAgo(entry.date) <= 7);
  const weekVolume = weekEntries.reduce((acc, entry) => acc + calculateVolume(entry), 0);
  const activeDays = new Set(weekEntries.map((entry) => entry.date)).size;
  const streak = getCurrentStreakDays(entries);
  const best = entries.reduce((max, entry) => Math.max(max, Number(entry.weight || 0)), 0);

  return [
    { title: `Racha ${streak} dias`, text: streak >= 3 ? "Muy buena constancia." : "Suma 1 sesion para extender la racha." },
    { title: `${weekVolume.toFixed(0)} kg semana`, text: `${activeDays} dias activos en los ultimos 7 dias.` },
    { title: `Carga tope ${best.toFixed(1)} kg`, text: "Tu mejor marca registrada hasta ahora." },
  ];
}

function getCurrentStreakDays(data) {
  if (!data.length) return 0;
  const uniqueDates = [...new Set(data.map((entry) => entry.date))].sort((a, b) => (a < b ? 1 : -1));
  let streak = 0;
  let cursor = new Date(uniqueDates[0]);
  for (let i = 0; i < uniqueDates.length; i += 1) {
    const current = new Date(uniqueDates[i]);
    const diff = Math.floor((cursor - current) / 86400000);
    if (i === 0 || diff <= 1) {
      streak += 1;
      cursor = current;
    } else {
      break;
    }
  }
  return streak;
}

function onLoadMoreTrends() {
  feedPage += 1;
  renderHomeFeed();
}

function buildHomeFeedItems() {
  const items = [];
  const now = new Date();
  const allEntries = Object.values(entriesByUser).flatMap((list) =>
    Array.isArray(list) ? list : []
  );

  items.push(buildDailyChallenge(now));
  items.push(buildWeeklySummary());
  items.push(...buildPopularExerciseCards(allEntries));

  const recentPosts = posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((post) => ({
      title: `@${post.user}`,
      meta: formatDateTime(post.date),
      text: post.text,
    }));

  return [...items, ...recentPosts];
}

function buildDailyChallenge(date) {
  const challenges = [
    "Reto del dia: 4 series de plancha de 45 segundos.",
    "Reto del dia: termina 8,000 pasos y 2L de agua.",
    "Reto del dia: agrega 2 series de movilidad de cadera.",
    "Reto del dia: 3 series de dominadas asistidas o jalon controlado.",
    "Reto del dia: 15 minutos de cardio suave post entrenamiento.",
  ];
  const dayIndex = Math.floor(date.getTime() / 86400000) % challenges.length;
  return {
    title: "Reto diario",
    meta: date.toLocaleDateString(),
    text: challenges[dayIndex],
  };
}

function buildWeeklySummary() {
  const weekEntries = entries.filter((entry) => daysAgo(entry.date) <= 7);
  const weekVolume = weekEntries.reduce((acc, entry) => acc + calculateVolume(entry), 0);
  const uniqueDays = new Set(weekEntries.map((entry) => entry.date)).size;
  return {
    title: "Tu semana",
    meta: `${uniqueDays} dias activos`,
    text: `Llevas ${weekEntries.length} ejercicios y ${weekVolume.toFixed(
      1
    )} kg de volumen en 7 dias.`,
  };
}

function buildPopularExerciseCards(allEntries) {
  const counter = new Map();
  allEntries.forEach((entry) => {
    const key = entry.exercise.trim();
    counter.set(key, (counter.get(key) || 0) + 1);
  });

  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([exercise, count], index) => ({
      title: `Top ${index + 1}: ${exercise}`,
      meta: "Comunidad",
      text: `Aparece en ${count} registros. Excelente opcion para progresion.`,
    }));
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
  window.alert("El historial esta protegido y no se puede borrar desde la app.");
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
    const next = best ? suggestNextWeight(best, null) : 0;
    const progression = best
      ? ` | ultima marca: ${best.weight}kg x ${best.reps} | sugerido: ${next.toFixed(1)}kg`
      : " | primera semana";
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

function onExportBackup() {
  const payload = JSON.stringify(buildBackupPayload(), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `gym-tracker-backup-${stamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  if (profileMessage) profileMessage.textContent = "Respaldo descargado correctamente.";
}

function onImportBackupFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || "{}"));
      if (!isValidBackupPayload(data)) throw new Error("Formato invalido");
      users = data.users || [];
      entriesByUser = data.entriesByUser || {};
      profilesByUser = data.profilesByUser || {};
      favoritesByUser = data.favoritesByUser || {};
      posts = data.posts || [];
      write(KEYS.users, users);
      write(KEYS.entries, entriesByUser);
      write(KEYS.profiles, profilesByUser);
      write(KEYS.favorites, favoritesByUser);
      write(KEYS.posts, posts);
      hydrateUserData();
      render();
      if (profileMessage) profileMessage.textContent = "Respaldo restaurado correctamente.";
    } catch {
      if (profileMessage) profileMessage.textContent = "No se pudo restaurar el archivo de respaldo.";
    } finally {
      if (importBackupFileInput) importBackupFileInput.value = "";
    }
  };
  reader.readAsText(file);
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
  entriesBody.innerHTML = data.length ? "" : "<tr><td colspan='9'>Sin registros aun.</td></tr>";
  data.forEach((e) => {
    const oneRm = estimateOneRepMax(e);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.date}</td><td>${escapeHtml(e.exercise)}</td><td>${e.sets}</td><td>${e.reps}</td><td>${e.weight}</td><td>${oneRm.toFixed(
      1
    )}</td><td>${calculateVolume(e).toFixed(1)}</td><td>${escapeHtml(
      e.notes || "-"
    )}</td><td><button type='button' class='inline-button' data-id='${e.id}'>Eliminar</button></td>`;
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

function renderWeightInsights() {
  if (!insightSummaryEl || !insightLoadEl || !insightProgressEl || !insightNextEl) return;
  if (!entries.length) {
    insightSummaryEl.textContent = "Sin datos aun.";
    insightLoadEl.textContent = "-";
    insightProgressEl.textContent = "-";
    insightNextEl.textContent = "-";
    return;
  }

  const sorted = entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const last = sorted[0];
  const weekEntries = sorted.filter((entry) => daysAgo(entry.date) <= 7);
  const weekVolume = weekEntries.reduce((acc, entry) => acc + calculateVolume(entry), 0);
  const avgLoad = weekEntries.length
    ? weekEntries.reduce((acc, entry) => acc + Number(entry.weight || 0), 0) / weekEntries.length
    : Number(last.weight || 0);

  const prev = sorted.find((entry) => entry.id !== last.id && entry.exercise.toLowerCase() === last.exercise.toLowerCase());
  const deltaWeight = prev ? Number(last.weight || 0) - Number(prev.weight || 0) : 0;
  const deltaPct = prev && Number(prev.weight || 0) > 0 ? (deltaWeight / Number(prev.weight)) * 100 : 0;

  const oneRm = estimateOneRepMax(last);
  const nextWeight = suggestNextWeight(last, prev);

  insightSummaryEl.textContent = `${weekEntries.length} ejercicios esta semana | ${weekVolume.toFixed(0)} kg de volumen`;
  insightLoadEl.textContent = `${avgLoad.toFixed(1)} kg promedio por ejercicio | 1RM est. ${oneRm.toFixed(1)} kg`;
  insightProgressEl.textContent = prev
    ? `${capitalize(last.exercise)}: ${formatSigned(deltaWeight.toFixed(1))} kg (${formatSigned(deltaPct.toFixed(1))}%) vs sesion anterior`
    : `Primer registro de ${capitalize(last.exercise)}.`;
  insightNextEl.textContent = `${last.exercise}: prueba ${nextWeight.toFixed(1)} kg manteniendo tecnica limpia`;
}

function renderGroupedStats() {
  if (!groupedStatsListEl || !aiCoachSummaryEl) return;
  groupedStatsListEl.innerHTML = "";
  const weekEntries = entries.filter((entry) => daysAgo(entry.date) <= 7);
  if (!weekEntries.length) {
    aiCoachSummaryEl.textContent = "No hay entrenamientos en los ultimos 7 dias.";
    groupedStatsListEl.innerHTML = "<li>Sin datos semanales.</li>";
    return;
  }

  const grouped = new Map();
  weekEntries.forEach((entry) => {
    const group = detectExerciseGroup(entry.exercise);
    if (!grouped.has(group)) grouped.set(group, { entries: 0, volume: 0, maxWeight: 0, exercises: new Set() });
    const bucket = grouped.get(group);
    bucket.entries += 1;
    bucket.volume += calculateVolume(entry);
    bucket.maxWeight = Math.max(bucket.maxWeight, Number(entry.weight || 0));
    bucket.exercises.add(entry.exercise.toLowerCase());
  });

  const sortedGroups = [...grouped.entries()].sort((a, b) => b[1].volume - a[1].volume);
  sortedGroups.forEach(([group, data]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${capitalize(group)}</strong><span>${data.entries} ejercicios | ${data.exercises.size} variantes | ${data.volume.toFixed(
      0
    )} kg volumen | carga tope ${data.maxWeight.toFixed(1)} kg</span>`;
    groupedStatsListEl.appendChild(li);
  });

  const topGroup = sortedGroups[0];
  const totalWeekVolume = weekEntries.reduce((acc, entry) => acc + calculateVolume(entry), 0);
  const weekDays = new Set(weekEntries.map((entry) => entry.date)).size;
  const planSignal = weekDays < 3 ? "Sube frecuencia a 3-4 dias para progresar." : "Buena frecuencia semanal, manten consistencia.";
  aiCoachSummaryEl.textContent = `AI Coach: esta semana moviste ${totalWeekVolume.toFixed(
    0
  )} kg en ${weekDays} dias. Enfasis principal en ${capitalize(topGroup[0])}. ${planSignal}`;
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

function renderDailyAnalysis() {
  if (!dailyDateInput || !dailySummaryEl || !dailyExerciseListEl || !dailyInsightEl) return;
  if (!entries.length) {
    dailySummaryEl.textContent = "Sin entrenamientos registrados.";
    dailyExerciseListEl.innerHTML = "<li>No hay ejercicios para mostrar.</li>";
    dailyInsightEl.textContent = "Carga un entrenamiento para generar interpretacion inteligente.";
    return;
  }

  if (!dailyDateInput.value) dailyDateInput.value = entries[0]?.date || new Date().toISOString().slice(0, 10);
  const selectedDate = dailyDateInput.value;
  const dayEntries = entries.filter((e) => e.date === selectedDate);

  if (!dayEntries.length) {
    dailySummaryEl.textContent = `No registraste ejercicios el ${selectedDate}.`;
    dailyExerciseListEl.innerHTML = "<li>Prueba otra fecha para ver el detalle diario.</li>";
    dailyInsightEl.textContent = "Sin sesion para analizar en ese dia.";
    return;
  }

  const sessionVolume = dayEntries.reduce((acc, e) => acc + calculateVolume(e), 0);
  const totalSets = dayEntries.reduce((acc, e) => acc + Number(e.sets || 0), 0);
  const avgWeight = dayEntries.reduce((acc, e) => acc + Number(e.weight || 0), 0) / dayEntries.length;
  const avgReps = dayEntries.reduce((acc, e) => acc + Number(e.reps || 0), 0) / dayEntries.length;
  const uniqueExercises = new Set(dayEntries.map((e) => e.exercise.toLowerCase())).size;
  const density = totalSets > 0 ? sessionVolume / totalSets : 0;

  dailySummaryEl.textContent = `${selectedDate} | ${dayEntries.length} ejercicios | ${totalSets} series | ${sessionVolume.toFixed(0)} kg de volumen`;

  dailyExerciseListEl.innerHTML = "";
  dayEntries.forEach((entry) => {
    const li = document.createElement("li");
    const oneRm = estimateOneRepMax(entry);
    li.innerHTML = `<strong>${escapeHtml(entry.exercise)}</strong><span>${entry.sets}x${entry.reps} con ${entry.weight} kg | 1RM est. ${oneRm.toFixed(1)} kg</span>`;
    dailyExerciseListEl.appendChild(li);
  });

  const intensityZone = density < 180 ? "Ligera" : density < 320 ? "Moderada" : "Alta";
  const adaptation = avgReps >= 10 && avgWeight > 0 ? "hipertrofia tecnica" : avgReps <= 6 ? "fuerza neural" : "mixta";
  const nextAction =
    intensityZone === "Ligera"
      ? "Puedes subir 2.5 kg en tu ejercicio principal."
      : intensityZone === "Alta"
      ? "Mantener carga y priorizar recuperacion 24-48h."
      : "Mantener esquema y mejorar tecnica o rango.";

  dailyInsightEl.textContent = `Lectura simple: intensidad ${intensityZone}, densidad ${density.toFixed(
    0
  )} kg/serie, foco ${adaptation}. Trabajaste ${uniqueExercises} ejercicios con ${avgWeight.toFixed(
    1
  )} kg promedio y ${avgReps.toFixed(1)} reps promedio. ${nextAction}`;
}

function renderMiniCalendar() {
  if (!calendarGridEl || !calendarMonthLabelEl) return;
  const selected = dailyDateInput?.value || "";
  const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const monthEndDay = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0).getDate();
  const mondayIndex = (monthStart.getDay() + 6) % 7;
  const monthKey = `${calendarCursor.getFullYear()}-${String(calendarCursor.getMonth() + 1).padStart(2, "0")}`;
  const dayVolumeMap = new Map();
  const dayCountMap = new Map();

  entries
    .filter((entry) => entry.date.startsWith(monthKey))
    .forEach((entry) => {
      dayVolumeMap.set(entry.date, (dayVolumeMap.get(entry.date) || 0) + calculateVolume(entry));
      dayCountMap.set(entry.date, (dayCountMap.get(entry.date) || 0) + 1);
    });

  const maxVolume = Math.max(0, ...dayVolumeMap.values());

  calendarMonthLabelEl.textContent = monthStart.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  calendarGridEl.innerHTML = "";

  for (let i = 0; i < mondayIndex; i += 1) {
    const filler = document.createElement("span");
    filler.className = "calendar-filler";
    filler.setAttribute("aria-hidden", "true");
    calendarGridEl.appendChild(filler);
  }

  for (let day = 1; day <= monthEndDay; day += 1) {
    const iso = toIsoDate(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), day));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    const volume = dayVolumeMap.get(iso) || 0;
    const count = dayCountMap.get(iso) || 0;
    if (volume > 0) {
      button.classList.add("has-workout");
      const ratio = maxVolume > 0 ? volume / maxVolume : 0;
      const level = ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
      button.classList.add(`level-${level}`);
    }
    if (selected === iso) button.classList.add("active");
    button.textContent = String(day);
    button.title = volume > 0 ? `${iso} | ${count} ejercicios | ${volume.toFixed(0)} kg` : iso;
    button.addEventListener("click", () => {
      if (dailyDateInput) dailyDateInput.value = iso;
      renderDailyAnalysis();
      renderMiniCalendar();
    });
    calendarGridEl.appendChild(button);
  }
}

function moveCalendarMonth(offset) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + offset, 1);
  renderMiniCalendar();
}

function onToggleNotifications() {
  if (!notificationPanel) return;
  notificationPanel.classList.toggle("hidden");
}

function renderNotifications() {
  if (!notificationListEl || !notificationCountEl) return;
  const notifications = buildSmartNotifications();
  notificationListEl.innerHTML = "";
  if (!notifications.length) {
    notificationListEl.innerHTML = "<li>Sin notificaciones por ahora.</li>";
    notificationCountEl.textContent = "0";
    return;
  }
  notifications.forEach((note) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(note.title)}</strong><span>${escapeHtml(note.text)}</span>`;
    notificationListEl.appendChild(li);
  });
  notificationCountEl.textContent = String(notifications.length);
}

function buildSmartNotifications() {
  const list = [];
  if (!entries.length) {
    list.push({ title: "Comienza hoy", text: "Registra tu primer entrenamiento para activar tu analisis inteligente." });
    return list;
  }

  const sorted = entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const last = sorted[0];
  const weekEntries = sorted.filter((entry) => daysAgo(entry.date) <= 7);
  const prevWeekEntries = sorted.filter((entry) => {
    const d = daysAgo(entry.date);
    return d > 7 && d <= 14;
  });

  const weekVolume = weekEntries.reduce((acc, entry) => acc + calculateVolume(entry), 0);
  const prevWeekVolume = prevWeekEntries.reduce((acc, entry) => acc + calculateVolume(entry), 0);
  const gapDays = Math.max(0, daysAgo(last.date));

  if (gapDays >= 3) {
    list.push({ title: "Recordatorio", text: `Llevas ${gapDays} dias sin entrenar. Te conviene volver hoy con una sesion moderada.` });
  }
  if (prevWeekVolume > 0) {
    const deltaPct = ((weekVolume - prevWeekVolume) / prevWeekVolume) * 100;
    const trend = deltaPct >= 0 ? `subio ${deltaPct.toFixed(1)}%` : `bajo ${Math.abs(deltaPct).toFixed(1)}%`;
    list.push({ title: "Tendencia semanal", text: `Tu volumen semanal ${trend} vs la semana anterior.` });
  }

  const bestByExercise = getBestSetByExercise(entries);
  const lastBest = bestByExercise.get(last.exercise.toLowerCase());
  if (lastBest && lastBest.id === last.id) {
    list.push({ title: "Nuevo record", text: `Lograste tu mejor marca en ${last.exercise}: ${last.weight} kg.` });
  }

  if (weekEntries.length < 4) {
    list.push({ title: "Frecuencia", text: "Para hipertrofia, apunta a 4-6 ejercicios por semana como base minima." });
  }

  return list.slice(0, 4);
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
  window.alert(`La eliminacion de usuarios esta bloqueada para proteger historiales. Usuario objetivo: ${username}.`);
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
  if (dailyDateInput && entries.length) dailyDateInput.value = entries[0].date;
  if (dailyDateInput?.value) {
    const selected = new Date(dailyDateInput.value);
    if (!Number.isNaN(selected.getTime())) calendarCursor = new Date(selected.getFullYear(), selected.getMonth(), 1);
  }
  renderFavorites();
}

function render() {
  renderHomeFeed();
  renderCommunityUsers();
  renderMyPosts();
  renderWorkoutRows();
  renderStats();
  renderWeightInsights();
  renderGroupedStats();
  renderPeriodResults();
  renderDailyAnalysis();
  renderMiniCalendar();
  renderRoutineRecommendation();
  renderNotifications();
  renderAdmin();
}

function seedAdmin() {
  if (users.some((u) => u.username.toLowerCase() === "admin")) return;
  users.push({ username: "admin", password: "12345", provider: "local" });
  write(KEYS.users, users);
}

function loadProfileForCurrentUser() {
  return profilesByUser[getAuthName()] || { name: "", age: "", height: "", weight: "", goal: "", routine: "hypertrophy", avatar: "" };
}

function applyProfileAvatar(value) {
  const fallback = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='24' fill='#dbeafe'/><circle cx='60' cy='44' r='20' fill='#1d4ed8'/><rect x='24' y='72' width='72' height='30' rx='15' fill='#1e3a8a'/></svg>");
  if (profileAvatar) profileAvatar.src = value || fallback;
}

function estimateOneRepMax(entry) {
  const weight = Number(entry.weight || 0);
  const reps = Number(entry.reps || 0);
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

function suggestNextWeight(last, previous) {
  const current = Number(last.weight || 0);
  if (current <= 0) return 0;
  if (!previous) return current + 2.5;
  if (last.reps >= previous.reps && current >= Number(previous.weight || 0)) return current + 2.5;
  return current;
}

function formatSigned(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric === 0) return "0";
  return numeric > 0 ? `+${numeric}` : `${numeric}`;
}

function detectExerciseGroup(exerciseName) {
  const key = String(exerciseName || "").toLowerCase().trim();
  if (EXERCISE_GROUP_MAP.has(key)) return EXERCISE_GROUP_MAP.get(key);
  if (key.includes("sentadilla") || key.includes("zancada") || key.includes("femoral") || key.includes("pierna")) return "pierna";
  if (key.includes("press banca") || key.includes("inclinado") || key.includes("apertur") || key.includes("pecho")) return "pecho";
  if (key.includes("remo") || key.includes("jalon") || key.includes("dominada") || key.includes("espalda")) return "espalda";
  if (key.includes("militar") || key.includes("lateral") || key.includes("hombro")) return "hombro";
  if (key.includes("gemelo") || key.includes("talones") || key.includes("calf")) return "gemelo";
  if (key.includes("gluteo") || key.includes("hip thrust") || key.includes("puente")) return "gluteo";
  return "otros";
}

function buildExerciseGroupMap(catalog) {
  const map = new Map();
  Object.entries(catalog).forEach(([group, list]) => {
    list.forEach((exercise) => map.set(exercise.toLowerCase(), group));
  });
  return map;
}

function formatPeriodResult(list) { return `${list.length} ejercicios | ${list.reduce((acc, e) => acc + calculateVolume(e), 0).toFixed(1)} kg`; }
function calculateVolume(e) { return e.sets * e.reps * e.weight; }
function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function getValue(id) { return q(`#${id}`).value.trim(); }
function formatDateTime(v) { try { return new Date(v).toLocaleString(); } catch { return v; } }
function capitalize(v) { return v.charAt(0).toUpperCase() + v.slice(1); }
function isAdmin() { return getAuthName().toLowerCase() === "admin"; }
function isAuthenticated() { try { return sessionStorage.getItem(KEYS.auth) === "1" || authFallback; } catch { return authFallback; } }
function setAuthState(v, name) { authFallback = v; authNameFallback = name; try { if (v) { sessionStorage.setItem(KEYS.auth, "1"); sessionStorage.setItem(KEYS.authName, name); } else { sessionStorage.removeItem(KEYS.auth); sessionStorage.removeItem(KEYS.authName); } } catch {} }
function getAuthName() { try { return sessionStorage.getItem(KEYS.authName) || authNameFallback || "admin"; } catch { return authNameFallback || "admin"; } }
function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); saveBackupSnapshot(); }
function loadUsers() { const v = read(KEYS.users, []); return Array.isArray(v) ? v : []; }
function loadEntriesByUser() { const v = read(KEYS.entries, {}); return v && typeof v === "object" ? v : {}; }
function loadProfilesByUser() { const v = read(KEYS.profiles, {}); return v && typeof v === "object" ? v : {}; }
function loadFavoritesByUser() { const v = read(KEYS.favorites, {}); return v && typeof v === "object" ? v : {}; }
function loadPosts() { const v = read(KEYS.posts, []); return Array.isArray(v) ? v : []; }
function persistEntriesForCurrentUser() { entriesByUser[getAuthName()] = entries; write(KEYS.entries, entriesByUser); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function buildBackupPayload() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    users,
    entriesByUser,
    profilesByUser,
    favoritesByUser,
    posts,
  };
}

function isValidBackupPayload(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.users) &&
    data.entriesByUser &&
    typeof data.entriesByUser === "object"
  );
}

function saveBackupSnapshot() {
  try {
    localStorage.setItem(KEYS.backup, JSON.stringify(buildBackupPayload()));
  } catch {}
}

function restoreFromBackupIfNeeded() {
  try {
    const hasMainData = !!localStorage.getItem(KEYS.users) || !!localStorage.getItem(KEYS.entries);
    const rawBackup = localStorage.getItem(KEYS.backup);
    if (hasMainData || !rawBackup) return;
    const data = JSON.parse(rawBackup);
    if (!isValidBackupPayload(data)) return;
    localStorage.setItem(KEYS.users, JSON.stringify(data.users || []));
    localStorage.setItem(KEYS.entries, JSON.stringify(data.entriesByUser || {}));
    localStorage.setItem(KEYS.profiles, JSON.stringify(data.profilesByUser || {}));
    localStorage.setItem(KEYS.favorites, JSON.stringify(data.favoritesByUser || {}));
    localStorage.setItem(KEYS.posts, JSON.stringify(data.posts || []));
    users = data.users || [];
    entriesByUser = data.entriesByUser || {};
    profilesByUser = data.profilesByUser || {};
    favoritesByUser = data.favoritesByUser || {};
    posts = data.posts || [];
  } catch {}
}

function requestPersistentStorage() {
  if (!navigator.storage?.persist) return;
  navigator.storage.persist().catch(() => {});
}
