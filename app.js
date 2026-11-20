const today = new Date().toISOString().split('T')[0];
const LINES = [
  "I only have to do the next small thing.",
  "Starting counts. Finishing can wait.",
  "I can come back after I drift.",
  "One finished thing is a full reset.",
  "I do not need the whole day to begin.",
  "A spoken line is enough. I do not have to polish it.",
  "I can leave the rest for later."
];

document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

function lineFor(dateStr) {
  const day = Math.floor(new Date(dateStr + 'T00:00:00').getTime() / 86400000);
  return LINES[((day % LINES.length) + LINES.length) % LINES.length];
}

const todayLine = lineFor(today);

function loadToday() {
  const data = JSON.parse(localStorage.getItem('dailyReset') || '{}');
  const day = data[today] || {};
  document.getElementById('p1').value = day.p1 || '';
  document.getElementById('p2').value = day.p2 || '';
  document.getElementById('p3').value = day.p3 || '';
  document.getElementById('money').value = day.money || '';
  document.getElementById('health').value = day.health || '';
  document.getElementById('grateful').value = day.grateful || '';
  const affirmation = document.getElementById('affirmation');
  affirmation.value = day.affirmation || todayLine;
  affirmation.dataset.fresh = day.affirmation ? '' : '1';
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
    grateful: document.getElementById('grateful').value.trim(),
    affirmation: document.getElementById('affirmation').value.trim() || todayLine,
    notes: document.getElementById('notes').value.trim(),
    completed: true,
    timestamp: Date.now()
  };
  localStorage.setItem('dailyReset', JSON.stringify(data));
  document.getElementById('affirmation').dataset.fresh = '';
  alert('Saved. Data stays on this device.');
  updateScore();
}

function getWeekDays() {
  const days = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
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
  document.getElementById('scoreSection').innerHTML =
    '<h2>Weekly score</h2><div id="scoreDisplay">' + completed + ' / 7</div><p>Days saved this week / 7</p>';
  document.getElementById('scoreSection').style.display = 'block';
}

function viewHistory() {
  const data = JSON.parse(localStorage.getItem('dailyReset') || '{}');
  const week = getWeekDays();
  let html = '<h3>This week</h3>';
  week.forEach(d => {
    const entry = data[d];
    const dateStr = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (entry && entry.completed) {
      html += '<div class="day"><strong>' + dateStr + '</strong><br>'
        + (entry.p1 || '-') + ', ' + (entry.p2 || '-') + ', ' + (entry.p3 || '-') + '<br>'
        + 'Money: ' + (entry.money || '-') + ' | Health: ' + (entry.health || '-') + '<br>'
        + 'Grateful: ' + (entry.grateful || '-') + '<br>'
        + 'Line: ' + (entry.affirmation || '-') + '</div>';
    } else {
      html += '<div class="miss">' + dateStr + ': \u2014</div>';
    }
  });
  document.getElementById('scoreSection').innerHTML = html + '<button type="button" id="backScore">Back to score</button>';
  document.getElementById('backScore').addEventListener('click', updateScore);
  document.getElementById('scoreSection').style.display = 'block';
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRec = null;
let activeBtn = null;

function stopListening() {
  if (activeRec) {
    const rec = activeRec;
    activeRec = null;
    rec.onend = null;
    try { rec.stop(); } catch (e) {}
  }
  if (activeBtn) {
    activeBtn.classList.remove('listening');
    activeBtn.textContent = 'Speak';
    activeBtn = null;
  }
}

function bindSpeech() {
  const note = document.getElementById('speechNote');
  if (!SpeechRecognition) {
    note.hidden = false;
    return;
  }
  document.querySelectorAll('.speak').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = document.getElementById(btn.dataset.for);
      if (activeBtn === btn) {
        stopListening();
        return;
      }
      stopListening();
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = false;
      const startValue = field.value;
      const replace = !startValue.trim() || field.dataset.fresh === '1';
      rec.onresult = (event) => {
        let spoken = '';
        for (let i = 0; i < event.results.length; i++) {
          spoken += event.results[i][0].transcript;
        }
        spoken = spoken.trim();
        field.value = replace ? spoken : (startValue.trim() + (spoken ? ' ' + spoken : ''));
        field.dataset.fresh = '';
      };
      rec.onerror = () => {
        note.hidden = false;
        note.textContent = 'The microphone was blocked. You can still type.';
      };
      rec.onend = () => {
        if (activeRec === rec) {
          activeRec = null;
          if (activeBtn) {
            activeBtn.classList.remove('listening');
            activeBtn.textContent = 'Speak';
            activeBtn = null;
          }
        }
      };
      activeRec = rec;
      activeBtn = btn;
      btn.classList.add('listening');
      btn.textContent = 'Listening';
      rec.start();
    });
  });
}

document.getElementById('affirmation').addEventListener('input', (event) => {
  event.target.dataset.fresh = '';
});
document.getElementById('saveBtn').addEventListener('click', saveToday);
document.getElementById('viewHistory').addEventListener('click', viewHistory);

loadToday();
updateScore();
bindSpeech();
