function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const today = localDateKey();
const $ = (id) => document.getElementById(id);

$("currentDate").textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});

function readData() {
  try {
    const value = JSON.parse(localStorage.getItem("dailyReset") || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function loadToday() {
  const day = readData()[today] || {};
  ["p1", "p2", "p3", "money", "health", "notes"].forEach(id => {
    $(id).value = typeof day[id] === "string" ? day[id] : "";
  });
}

function saveToday() {
  const data = readData();
  data[today] = {
    p1: $("p1").value.trim(), p2: $("p2").value.trim(), p3: $("p3").value.trim(),
    money: $("money").value.trim(), health: $("health").value.trim(), notes: $("notes").value.trim(),
    completed: true, timestamp: Date.now()
  };
  try {
    localStorage.setItem("dailyReset", JSON.stringify(data));
    updateScore();
    alert("Saved. Data stays on this device.");
  } catch {
    alert("Unable to save. Check available device storage and browser privacy settings.");
  }
}

function getWeekDays() {
  const days = [];
  const now = new Date();
  const mondayOffset = now.getDay() === 0 ? 6 : now.getDay() - 1;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset + i);
    days.push(localDateKey(d));
  }
  return days;
}

function renderScoreSection() {
  const section = $("scoreSection");
  section.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Weekly Score";
  const score = document.createElement("div");
  score.id = "scoreDisplay";
  const data = readData();
  const completed = getWeekDays().filter(day => data[day] && data[day].completed).length;
  score.textContent = `${completed} / 7`;
  const description = document.createElement("p");
  description.textContent = "Days completed this week / 7";
  section.append(heading, score, description);
  section.style.display = "block";
}

function updateScore() {
  renderScoreSection();
}

function viewHistory() {
  const section = $("scoreSection");
  const data = readData();
  section.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "This Week";
  section.appendChild(heading);

  getWeekDays().forEach(day => {
    const entry = data[day];
    const row = document.createElement("div");
    row.style.cssText = "margin:8px 0;padding:8px;border-radius:4px;";
    const date = new Date(day + "T00:00:00");
    const label = document.createElement("strong");
    label.textContent = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    row.appendChild(label);
    const details = document.createElement("p");
    if (entry && entry.completed) {
      const values = [entry.p1, entry.p2, entry.p3].map(v => typeof v === "string" && v ? v : "-");
      details.textContent = `Priorities: ${values.join(", ")} | Money: ${entry.money || "-"} | Health: ${entry.health || "-"}`;
    } else {
      details.textContent = "Not completed";
    }
    row.appendChild(details);
    section.appendChild(row);
  });

  const back = document.createElement("button");
  back.type = "button";
  back.textContent = "Back to Score";
  back.addEventListener("click", updateScore);
  section.appendChild(back);
  section.style.display = "block";
}

$("saveBtn").addEventListener("click", saveToday);
$("viewHistory").addEventListener("click", viewHistory);
loadToday();
updateScore();
