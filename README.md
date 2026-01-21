# 🧠 MindDesk – Psychometric Personality Analytics Platform

MindDesk is a **frontend-only psychometric analytics platform** designed to explore personality traits and behavioral patterns through structured self-assessment questions and interactive mini-games.  
It provides visual insights via a modern dashboard and stores all data **locally in the browser**, with no backend dependency.

> ⚠️ This project is intended for **educational and demonstration purposes only**.

---

## 📸 Screenshots

<img width="1919" alt="Dashboard Overview" src="https://github.com/user-attachments/assets/076d87e5-da03-40c8-80f3-5648149d0d18" />
<img width="1919" alt="Personality Test" src="https://github.com/user-attachments/assets/915a54ef-1616-4fa6-b96a-36c431acfc67" />
<img width="1879" alt="Insights Panel" src="https://github.com/user-attachments/assets/6522c736-55ea-4a02-88c4-d49a1320f6f0" />
<img width="1895" alt="Games Section" src="https://github.com/user-attachments/assets/da18772b-e836-4654-983d-546f5dad281f" />
<img width="1919" alt="Themes & Appearance" src="https://github.com/user-attachments/assets/8657d4d5-df36-4d5d-9abb-e8b6ca55bed8" />

---

## ✨ Key Features

### 🔐 Authentication (Demo Mode)
- Simple login & signup UI
- Demo account access
- No backend or database integration
- Session handled via LocalStorage

---

### 🧩 Personality Test
- Likert-scale questions (1–5)
- Trait-based scoring model
- Paginated question flow
- Real-time response tracking

---

### 📊 Analytics Dashboard
- Overall personality score
- Focus index & growth indicator
- Trait-wise visualization
- Clean, professional dashboard layout

---

### 📈 Insights Panel
- Trait comparison against averages
- Historical score tracking
- Export data as **CSV**
- Copy data as **JSON**
- Dynamic explanations and insights

---

### 🎮 Psychometric Mini-Games
Mini-games are designed to subtly capture behavioral tendencies in an engaging way:

- Reaction Time
- Memory Sequence
- Quick Math
- Suspicious Button
- Random Pick
- Annoying Situation
- What Would You Do?

Each game provides lightweight behavioral signals related to attention, impulse control, memory, and decision-making.

---

### 🧠 Educational Insights
- Example behaviors linked to traits
- Recommended self-improvement exercises
- Celebrity trait associations *(for inspiration only)*

---

## 🛠️ Tech Stack

- **HTML5** – Application structure  
- **CSS3** – Styling, themes, animations  
- **JavaScript (ES Modules)** – Core logic & state handling  
- **LocalStorage** – Client-side persistence  

> ❌ No frameworks  
> ❌ No backend  
> ❌ No external APIs  

---

## 📁 Project Structure

<img width="378" alt="Project Structure" src="https://github.com/user-attachments/assets/c94b8b81-80e1-45fa-8bde-cc9d80bcadac" />

---

## ▶️ How to Run the Project

### Option 1: Using Live Server (Recommended)
1. Open the project folder in **VS Code**
2. Right-click `index.html`
3. Select **Open with Live Server**

---

### Option 2: Using Python HTTP Server
```bash
python -m http.server 5500
```

---

## 🚀 Deployment (recommended)

You can host this static site publicly so anyone with the link can use it. Two easy options:

- GitHub Pages (CI-driven): push your repository to GitHub `main` branch. A GitHub Actions workflow is included at `.github/workflows/deploy.yml` which will deploy the site to GitHub Pages automatically on push to `main` or `master`.

- Netlify / Vercel: connect your Git repository to Netlify or Vercel, and set the publish directory to the repository root (`/`). A sample `netlify.toml` is included for convenience.

Steps (GitHub Pages):
1. Create a GitHub repo and push this project.
2. Ensure the repository's default branch is `main` (or `master`).
3. The included workflow will run and publish to GitHub Pages; after the action completes your site will be available at `https://<your-username>.github.io/<repo-name>/`.

Steps (Netlify):
1. Sign in to Netlify and choose "New site from Git".
2. Connect your Git provider and select the repository.
3. Set build command to blank and publish directory to `/` (root).
4. Deploy — Netlify will give you a public URL.

Notes:
- All app data is stored in the browser (LocalStorage). Users share the same code and UI via the public URL, but their data remains local and private unless they export it.
- If you want dynamic multi-user data, you'll need to add a backend (API + DB). I can help scaffold one if you'd like.
