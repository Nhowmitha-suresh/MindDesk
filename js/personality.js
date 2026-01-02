const questions = [
  {
    q: "When starting a task, you usually:",
    options: [
      { t: "Plan everything", logic: 2, discipline: 2 },
      { t: "Start immediately", creativity: 2 },
      { t: "Wait for inspiration", emotional: 2 },
      { t: "Discuss with others", social: 2 }
    ]
  },
  {
    q: "You feel most confident when:",
    options: [
      { t: "Solving complex problems", logic: 2 },
      { t: "Creating new ideas", creativity: 2 },
      { t: "Helping people", emotional: 2 },
      { t: "Leading a group", social: 2 }
    ]
  }
];

let scores = {
  logic: 0,
  creativity: 0,
  emotional: 0,
  social: 0,
  discipline: 0
};

let current = 0;

function renderQuestion() {
  const q = questions[current];
  let html = `<h3>${q.q}</h3>`;

  q.options.forEach((opt, i) => {
    html += `<button class="option" onclick="selectOption(${i})">${opt.t}</button>`;
  });

  document.getElementById("questionBox").innerHTML = html;
}

function selectOption(i) {
  const selected = questions[current].options[i];
  Object.keys(selected).forEach(k => {
    if (k !== "t") scores[k] += selected[k];
  });

  current++;
  current < questions.length ? renderQuestion() : finishTest();
}

function finishTest() {
  localStorage.setItem("minddesk_scores", JSON.stringify(scores));
  document.getElementById("questionBox").innerHTML =
    "<h3>Test Completed ✅</h3><p>Check Insights to see your personality.</p>";
}
