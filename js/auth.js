/* =========================================================
   MindDesk – Authentication Engine
   Email-based Signup / Login (Frontend-only)
   ========================================================= */

const USERS_KEY = "minddesk_users";
const SESSION_KEY = "minddesk_session";

/* =========================================================
   INTERNAL STORAGE HELPERS
   ========================================================= */

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

/* =========================================================
   VALIDATION HELPERS
   ========================================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return password.length >= 6;
}

/* =========================================================
   PUBLIC AUTH API
   ========================================================= */

/* ------------------------
   SIGN UP
------------------------- */
export function signUp({ name, email, password }) {
  if (!name || !email || !password) {
    return { success: false, message: "All fields are required." };
  }

  if (!isValidEmail(email)) {
    return { success: false, message: "Invalid email format." };
  }

  if (!isStrongPassword(password)) {
    return { success: false, message: "Password must be at least 6 characters." };
  }

  const users = getUsers();
  const exists = users.find(u => u.email === email);

  if (exists) {
    return { success: false, message: "Account already exists with this email." };
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    password, // ⚠️ frontend-only demo (never store plain passwords in real apps)
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);

  return { success: true, user: newUser };
}

/* ------------------------
   LOGIN
------------------------- */
export function login({ email, password }) {
  if (!email || !password) {
    return { success: false, message: "Email and password required." };
  }

  const users = getUsers();
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return { success: false, message: "Invalid email or password." };
  }

  saveSession(user);
  return { success: true, user };
}

/* ------------------------
   LOGOUT
------------------------- */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

/* ------------------------
   SESSION CHECK
------------------------- */
export function getCurrentUser() {
  return getSession();
}

/* ------------------------
   AUTH GUARD
------------------------- */
export function requireAuth() {
  const user = getSession();
  if (!user) {
    window.location.href = "index.html";
  }
  return user;
}
