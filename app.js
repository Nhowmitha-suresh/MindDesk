const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const session = load("session");
if (session) startApp(session);

function login() {
  if (!loginUser.value || !loginPass.value) return;
  save("user_" + loginUser.value, loginPass.value);
  save("session", loginUser.value);
  startApp(loginUser.value);
}

function startApp(user) {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  welcomeText.textContent = "👋 " + user;
}

function logout() {
  localStorage.removeItem("session");
  location.reload();
}

/* NAV */
function show(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* NOTES */
notesArea.value = load("notes") || "";
notesArea.oninput = () => save("notes", notesArea.value);

/* TASKS */
let tasks = load("tasks") || [];
function addTask() {
  if (!taskInput.value) return;
  tasks.push(taskInput.value);
  save("tasks", tasks);
  taskInput.value = "";
  renderTasks();
}
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.onclick = () => {
      tasks.splice(i, 1);
      save("tasks", tasks);
      renderTasks();
    };
    taskList.appendChild(li);
  });
}
renderTasks();

/* TIMER */
let t;
function startTimer() {
  let s = 1500;
  clearInterval(t);
  t = setInterval(() => {
    timer.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
    if (--s < 0) clearInterval(t);
  }, 1000);
}

/* PASSWORD */
function checkPassword() {
  const p = password.value;
  passwordResult.textContent =
    p.length < 6 ? "Weak" :
    /[A-Z]/.test(p) && /\d/.test(p) ? "Strong" :
    "Medium";
}

/* BMI */
function calcBMI() {
  const h = height.value / 100;
  const w = weight.value;
  const bmi = (w / (h*h)).toFixed(2);
  bmiResult.textContent = "BMI: " + bmi;
}

/* THEME */
function setTheme(t) {
  document.documentElement.className = t;
  save("theme", t);
}
document.documentElement.className = load("theme") || "";
