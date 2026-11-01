const today = new Date().toISOString().split('T')[0];
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function loadToday() {
  const data = JSON.parse(localStorage.getItem('dailyReset') || '{}');
  const day = data[today] || {};
  document.getElementById('p1').value = day.p1 || '';
  document.getElementById('p2').value = day.p2 || '';
  document.getElementById('p3').value = day.p3 || '';
  document.getElementById('money').value = day.money || '';
  document.getElementById('health').value = day.health || '';
  document.getElementById('notes').value = day.notes || '';
}

function saveToday() {
  const data = JSON.parse(localStorage.getItem('dailyReset') || '{}');
  data[today] = {
    p1: document.getElementById('p1').value.trim(),
    p2: document.getElementById('p2').value.trim(),
    p3: document.getElementById('p3').value.trim(),
    money: document.getElementById('money').value.trim(),
    health: document.getElementById('health').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    completed: true,
    timestamp: Date.now()
  };
  localStorage.setItem('dailyReset', JSON.stringify(data));
  alert('Saved. Data stays on this device.');
  updateScore();
}

function getWeekDays() {
  const days = [];
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - mondayOffset + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function updateScore() {
  const data = JSON.parse(localStorage.getItem('dailyReset') || '{}');
  const week = getWeekDays();
  let completed = 0;
  week.forEach(d => {
    if (data[d] && data[d].completed) completed++;
  });
  const scoreEl = document.getElementById('scoreDisplay');
  scoreEl.textContent = `${completed} / 7`;
  document.getElementById('scoreSection').style.display = 'block';
}

function viewHistory() {
  const data = JSON.parse(localStorage.getItem('dailyReset') || '{}');
  const week = getWeekDays();
  let html = '<h3>This Week</h3>';
  week.forEach(d => {
    const entry = data[d];
    const dateStr = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (entry && entry.completed) {
      html += `<div style="margin:8px 0; padding:8px; background:#f8f9fa; border-radius:4px;"><strong>${dateStr}</strong><br>Priorities: ${entry.p1 || '-'}, ${entry.p2 || '-'}, ${entry.p3 || '-'}<br>Money: ${entry.money || '-'} | Health: ${entry.health || '-'}</div>`;
    } else {
      html += `<div style="margin:8px 0; color:#6c757d;">${dateStr}: —</div>`;
    }
  });
  document.getElementById('scoreSection').innerHTML = html + '<button onclick="updateScore()">Back to Score</button>';
  document.getElementById('scoreSection').style.display = 'block';
}

document.getElementById('saveBtn').addEventListener('click', saveToday);
document.getElementById('viewHistory').addEventListener('click', viewHistory);

loadToday();
updateScore();