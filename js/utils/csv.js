/* =========================================================
   MindDesk – CSV Import / Export Utility
   Handles psychometric data interchange
   ========================================================= */

/*
SUPPORTED CSV FORMATS
---------------------
1️⃣ Time-series history:
timestamp,Logic,Creativity,Discipline
2025-12-01T10:00:00Z,70,60,80

2️⃣ Snapshot-only:
Logic,Creativity,Discipline
75,62,85
*/

/* =========================================================
   HELPERS
   ========================================================= */

/* Parse CSV string into rows */
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(row => row.split(",").map(v => v.trim()));
}

/* Detect if header contains timestamp */
function hasTimestamp(header) {
  return header[0].toLowerCase().includes("time") ||
         header[0].toLowerCase().includes("date");
}

/* Validate numeric value */
function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/* =========================================================
   IMPORT CSV
   ========================================================= */

export function importCSV(file, onComplete) {
  const reader = new FileReader();

  reader.onload = e => {
    try {
      const rows = parseCSV(e.target.result);
      const header = rows.shift();

      if (!header || header.length < 2) {
        throw new Error("Invalid CSV format");
      }

      const history =
        JSON.parse(localStorage.getItem("minddesk_scores_history")) || [];

      /* -----------------------------------------------
         TIME-SERIES FORMAT
      ------------------------------------------------ */
      if (hasTimestamp(header)) {
        rows.forEach(row => {
          const timestamp = new Date(row[0]).toISOString();
          const scores = {};

          header.slice(1).forEach((trait, i) => {
            const value = toNumber(row[i + 1]);
            if (value !== null) {
              scores[trait] = value;
            }
          });

          if (Object.keys(scores).length > 0) {
            history.push({ timestamp, scores });
          }
        });
      }

      /* -----------------------------------------------
         SNAPSHOT FORMAT
      ------------------------------------------------ */
      else {
        rows.forEach(row => {
          const scores = {};
          header.forEach((trait, i) => {
            const value = toNumber(row[i]);
            if (value !== null) {
              scores[trait] = value;
            }
          });

          if (Object.keys(scores).length > 0) {
            history.push({
              timestamp: new Date().toISOString(),
              scores
            });
          }
        });
      }

      localStorage.setItem(
        "minddesk_scores_history",
        JSON.stringify(history)
      );

      /* Update latest snapshot */
      if (history.length) {
        localStorage.setItem(
          "minddesk_scores",
          JSON.stringify(history[history.length - 1].scores)
        );
      }

      if (onComplete) onComplete(true);

    } catch (err) {
      console.error("CSV import failed:", err);
      if (onComplete) onComplete(false);
    }
  };

  reader.readAsText(file);
}

/* =========================================================
   EXPORT CSV
   ========================================================= */

export function exportCSV(range = "all") {
  const history =
    JSON.parse(localStorage.getItem("minddesk_scores_history")) || [];

  if (!history.length) return;

  /* Filter by time range */
  const now = new Date();
  const filtered = history.filter(entry => {
    const diff =
      (now - new Date(entry.timestamp)) / (1000 * 60 * 60 * 24);

    if (range === "today") return diff <= 1;
    if (range === "week") return diff <= 7;
    if (range === "month") return diff <= 30;
    return true;
  });

  if (!filtered.length) return;

  /* Collect all traits */
  const traits = new Set();
  filtered.forEach(e =>
    Object.keys(e.scores).forEach(t => traits.add(t))
  );

  const header = ["timestamp", ...traits];
  const rows = [header.join(",")];

  filtered.forEach(entry => {
    const row = [
      entry.timestamp,
      ...Array.from(traits).map(
        t => entry.scores[t] ?? ""
      )
    ];
    rows.push(row.join(","));
  });

  downloadCSV(
    rows.join("\n"),
    `minddesk_scores_${range}.csv`
  );
}

/* =========================================================
   FILE DOWNLOAD
   ========================================================= */

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =========================================================
   DEMO DATA LOADER (OPTIONAL)
   ========================================================= */

export function loadDemoCSVData() {
  const demo = [
    {
      timestamp: "2025-11-01T10:00:00Z",
      scores: { Logic: 65, Creativity: 60, Discipline: 70 }
    },
    {
      timestamp: "2025-12-01T10:00:00Z",
      scores: { Logic: 72, Creativity: 64, Discipline: 78 }
    },
    {
      timestamp: "2026-01-01T10:00:00Z",
      scores: { Logic: 80, Creativity: 68, Discipline: 85 }
    }
  ];

  localStorage.setItem(
    "minddesk_scores_history",
    JSON.stringify(demo)
  );
  localStorage.setItem(
    "minddesk_scores",
    JSON.stringify(demo[demo.length - 1].scores)
  );
}

