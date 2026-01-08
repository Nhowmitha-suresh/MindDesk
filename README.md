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
