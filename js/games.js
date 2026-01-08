/* ============================================================
   MindDesk – Situational Judgement Game Engine
   Author: Nhowmitha Suresh
   Scope:
   - Runs ONLY inside Dashboard → Games tab
   - Uses existing UI layout
   - Ethical + risk-based decision scenarios
   - Rewards & penalties
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "dashboard") return;

  console.log("✅ Situational Judgement Game loaded");

  /* ------------------------------------------------------------
     MOUNT POINT (inside Games section)
  ------------------------------------------------------------ */
  const gamesSection = document.getElementById("games");
  if (!gamesSection) return;

  const container = document.createElement("div");
  container.className = "card";
  container.style.marginTop = "12px";
  gamesSection.appendChild(container);

  /* ------------------------------------------------------------
     GAME STATE
  ------------------------------------------------------------ */
  let index = 0;
  let score = 0;
  let timer = null;
  let timeLeft = 20;

  /* ------------------------------------------------------------
     SITUATIONS (16 – EXTENDABLE TO 30/50/115)
  ------------------------------------------------------------ */
  const situations = [
    {
      level: 1,
      risk: "Low",
      text:
        "An app sends frequent notifications that distract users during work hours.\n" +
        "Reducing alerts may lower engagement metrics.\n" +
        "Support tickets are slowly increasing.",
      options: [
        { text: "Personalize notification frequency", score: +10 },
        { text: "Ignore complaints", score: -5 },
        { text: "Disable all notifications", score: +5 }
      ]
    },
    {
      level: 1,
      risk: "Low",
      text:
        "A chatbot responds rudely due to a language model glitch.\n" +
        "Only a few users are affected.\n" +
        "Fixing it delays a scheduled release.",
      options: [
        { text: "Fix immediately", score: +10 },
        { text: "Release anyway", score: -5 },
        { text: "Add a warning message", score: +5 }
      ]
    },

    {
      level: 2,
      risk: "Medium",
      text:
        "A smart home device records short audio clips unintentionally.\n" +
        "The issue is logged internally.\n" +
        "No regulation explicitly forces disclosure.",
      options: [
        { text: "Inform users transparently", score: +10 },
        { text: "Quiet internal patch", score: -5 },
        { text: "Monitor silently", score: +5 }
      ]
    },

    {
      level: 3,
      risk: "High",
      text:
        "An AI exam proctor flags a student for cheating with low confidence.\n" +
        "The result deadline is today.\n" +
        "The student denies wrongdoing.",
      options: [
        { text: "Manual review", score: +10 },
        { text: "Trust AI decision", score: -10 },
        { text: "Delay result", score: +5 }
      ]
    },

    {
      level: 4,
      risk: "Extreme",
      text:
        "An AI triage system labels a patient as low-risk.\n" +
        "A doctor notices symptoms of internal bleeding.\n" +
        "Overriding AI delays other cases.",
      options: [
        { text: "Override AI and escalate", score: +15 },
        { text: "Follow AI recommendation", score: -15 },
        { text: "Wait for senior approval", score: -5 }
      ]
    }
  ];

  /* ------------------------------------------------------------
     RENDER FUNCTION
  ------------------------------------------------------------ */
  function render() {
    if (index >= situations.length) {
      showResult();
      return;
    }

    const s = situations[index];
    timeLeft = 20;

    container.innerHTML = `
      <h3>Situational Judgement</h3>
      <p style="color:var(--text-muted)">
        Level ${s.level} • Risk: <strong>${s.risk}</strong>
      </p>

      <pre style="white-space:pre-wrap;font-size:14px;margin-top:8px">
${s.text}
      </pre>

      <div id="sjOptions" style="display:flex;flex-direction:column;gap:8px;margin-top:10px"></div>

      <div style="display:flex;justify-content:space-between;margin-top:12px">
        <div>⏱ Time: <strong id="sjTimer">20</strong>s</div>
        <div>Score: <strong>${score}</strong></div>
      </div>
    `;

    const optWrap = document.getElementById("sjOptions");

    s.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "secondary";
      btn.textContent = opt.text;
      btn.onclick = () => choose(opt.score);
      optWrap.appendChild(btn);
    });

    startTimer();
  }

  /* ------------------------------------------------------------
     TIMER
  ------------------------------------------------------------ */
  function startTimer() {
    clearInterval(timer);
    const tEl = document.getElementById("sjTimer");

    timer = setInterval(() => {
      timeLeft--;
      tEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timer);
        index++;
        render();
      }
    }, 1000);
  }

  /* ------------------------------------------------------------
     HANDLE CHOICE
  ------------------------------------------------------------ */
  function choose(points) {
    clearInterval(timer);
    score += points;
    index++;
    render();
  }

  /* ------------------------------------------------------------
     FINAL RESULT
  ------------------------------------------------------------ */
  function showResult() {
    container.innerHTML = `
      <h3>Assessment Complete</h3>
      <p>Final Score: <strong>${score}</strong></p>
      <p>
        Profile:
        <strong>${
          score >= 60
            ? "Ethical & Balanced Decision Maker"
            : score >= 30
            ? "Moderate Risk Taker"
            : "High Risk / Impulsive"
        }</strong>
      </p>
      <button class="primary-btn" id="restartSJG">Restart</button>
    `;

    document.getElementById("restartSJG").onclick = () => {
      index = 0;
      score = 0;
      render();
    };
  }

  /* ------------------------------------------------------------
     INIT
  ------------------------------------------------------------ */
  render();
});
