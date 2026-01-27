# 🧠 MindDesk – Psychometric Personality Analytics Platform

MindDesk is a **frontend-only psychometric analytics platform** designed to explore personality traits and behavioral patterns through structured self-assessment questions and interactive mini-games.  
It provides visual insights via a modern dashboard and stores all data **locally in the browser**, with no backend dependency.

> ⚠️ This project is intended for **educational and demonstration purposes only**.

---

## 📸 Screenshots

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/cddd00fc-bfa2-4bf3-935f-6dafc13b354c" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/a5862a2d-32d3-4a58-b709-41453ea52a81" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/2d41307b-921b-478d-817e-1daab1c5c2c7" />
<img width="1903" height="1079" alt="image" src="https://github.com/user-attachments/assets/be1fc129-0626-4c1e-b379-1294ef4044c8" />
<img width="1918" height="1079" alt="image" src="https://github.com/user-attachments/assets/7f49bbe4-4627-44fb-b6e6-84f19d358887" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/648946e6-8c0e-497e-8045-4cc8aba499e8" />
<img width="1918" height="1079" alt="image" src="https://github.com/user-attachments/assets/17808abd-d58c-401c-bac2-b86a948c0aa2" />
<img width="1918" height="1079" alt="image" src="https://github.com/user-attachments/assets/b2ce599f-a050-4f79-85cf-4d98dd382176" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/5a0baf9e-790f-4306-a191-71721ca3af90" />



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
