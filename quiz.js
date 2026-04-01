// ── quiz.js ─────────────────────────────────────────────────────────────────
// Shared quiz engine. Each quiz page calls:
//   initQuiz(questions, config)
//
// config = { title, subtitle, icon, completionIcon }
// Each question = { cat, question, answer }
//   answer supports "," for multi-blank and "/" for alternate accepted answers

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function isFuzzyMatch(userVal, validOptions) {
  const u = normalize(userVal);
  for (const opt of validOptions) {
    const o = normalize(opt);
    if (u === o) return false;
    const maxLen = Math.max(u.length, o.length);
    if (maxLen === 0) continue;
    const dist = levenshtein(u, o);
    const threshold = maxLen <= 6 ? 1 : maxLen <= 10 ? 2 : 3;
    if (dist <= threshold) return true;
  }
  return false;
}

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of getPermutations(rest)) result.push([arr[i], ...perm]);
  }
  return result;
}

// ── State ────────────────────────────────────────────────────────────────────
let deck = [];
let idx = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let toastTimer = null;

// ── Init ─────────────────────────────────────────────────────────────────────
function initQuiz(questions, config = {}) {
  deck = shuffle(questions);

  if (config.completionIcon) {
    const el = document.querySelector('.complete-icon');
    if (el) el.textContent = config.completionIcon;
  }

  loadQuestion();

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (!answered) checkAnswer();
    else nextQuestion();
  });
}

// ── Load question ─────────────────────────────────────────────────────────────
function formatQuestion(q) {
  return q
    .replace(/\*{3,}/g, '<span style="color:var(--accent);font-weight:700">_____</span>')
    .replace(/_{5,}/g, '<span style="color:var(--accent);font-weight:700">_____</span>');
}

function loadQuestion() {
  answered = false;
  const q = deck[idx];
  const answers = q.answer.split(',');
  const isMulti = answers.length > 1;

  const badge = document.getElementById('category-badge');
  if (badge) badge.textContent = q.cat || '';

  document.getElementById('question-display').innerHTML = formatQuestion(q.question);
  document.getElementById('q-counter').textContent = `${idx + 1} / ${deck.length}`;
  document.getElementById('blank-label').textContent = isMulti ? `Fill in all ${answers.length} blanks` : 'Your answer';

  const area = document.getElementById('inputs-area');
  area.innerHTML = '';

  answers.forEach((ans, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'input-wrap';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'blank-input';
    input.id = `blank-${i}`;
    input.placeholder = isMulti ? `Blank ${i + 1}` : 'Type your answer...';
    input.autocomplete = 'off';
    input.autocorrect = 'off';
    input.spellcheck = false;

    const reveal = document.createElement('div');
    reveal.className = 'correct-answer-reveal';
    reveal.id = `reveal-${i}`;
    reveal.textContent = `✓ ${ans.split('/')[0]}`;

    wrap.appendChild(input);
    wrap.appendChild(reveal);
    area.appendChild(wrap);
  });

  const card = document.getElementById('question-card');
  card.className = 'card';

  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback';
  feedback.querySelector('.feedback-icon').textContent = '';
  feedback.querySelector('.feedback-text').textContent = '';

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Check Answer';
  btn.disabled = false;

  setTimeout(() => {
    const first = document.getElementById('blank-0');
    if (first) { first.focus(); first.select(); }
  }, 50);

  updateProgress();
}

// ── Check answer ─────────────────────────────────────────────────────────────
function checkAnswer() {
  if (answered) { nextQuestion(); return; }

  const q = deck[idx];
  const answers = q.answer.split(',');
  const userVals = answers.map((_, i) => document.getElementById(`blank-${i}`).value);

  let allCorrect = true;
  let fuzzyMessages = [];

  let swapped = false;
  if (answers.length > 1) {
    const permutations = getPermutations(userVals);
    for (const perm of permutations) {
      if (perm.join('|') === userVals.join('|')) continue;
      const allMatch = perm.every((val, i) => {
        const opts = answers[i].split('/');
        return opts.map(o => normalize(o)).includes(normalize(val)) || isFuzzyMatch(val, opts);
      });
      if (allMatch) { swapped = true; break; }
    }
  }

  answers.forEach((ans, i) => {
    const input = document.getElementById(`blank-${i}`);
    const reveal = document.getElementById(`reveal-${i}`);
    const actualUserVal = userVals[i];

    const validOptions = ans.split('/');
    const validNorm = validOptions.map(o => normalize(o));
    const isExact = validNorm.includes(normalize(actualUserVal));
    const isFuzzy = !isExact && isFuzzyMatch(actualUserVal, validOptions);
    const isRight = isExact || isFuzzy || swapped;

    if (isFuzzy) {
      fuzzyMessages.push(`You wrote <strong>"${actualUserVal}"</strong> — the answer is <strong>"${validOptions[0]}"</strong>`);
    }

    input.disabled = true;
    input.className = 'blank-input ' + (isRight ? 'correct' : 'wrong');

    if (!isRight) {
      allCorrect = false;
      reveal.className = 'correct-answer-reveal show';
    }
  });

  if (swapped && answers.length > 1) {
    const correctList = answers.map(a => `<strong>"${a.split('/')[0]}"</strong>`).join(' and ');
    fuzzyMessages = [`Your answers were in the wrong order — the correct order is ${correctList}`];
  }

  const card = document.getElementById('question-card');
  const feedback = document.getElementById('feedback');

  if (allCorrect) {
    correctCount++;
    card.className = 'card correct-state pop';
    feedback.className = 'feedback correct show';
    feedback.querySelector('.feedback-icon').textContent = '✓';
    feedback.querySelector('.feedback-text').textContent = fuzzyMessages.length > 0 ? 'Close enough — marked correct!' : 'Correct!';
    card.addEventListener('animationend', () => card.classList.remove('pop'), { once: true });
    if (fuzzyMessages.length > 0) showToast(fuzzyMessages.join('<br>'));
    setTimeout(() => nextQuestion(), fuzzyMessages.length > 0 ? 1400 : 900);
  } else {
    wrongCount++;
    card.className = 'card wrong-state shake';
    feedback.className = 'feedback wrong show';
    feedback.querySelector('.feedback-icon').textContent = '✗';
    feedback.querySelector('.feedback-text').textContent = 'Not quite — check the correct answer above.';
    card.addEventListener('animationend', () => {
      card.classList.remove('shake');
      card.classList.add('wrong-state');
    }, { once: true });
  }

  document.getElementById('correct-count').textContent = correctCount;
  document.getElementById('wrong-count').textContent = wrongCount;

  answered = true;
  document.getElementById('submit-btn').textContent = idx < deck.length - 1 ? 'Next Question →' : 'See Results →';
}

// ── Navigation ───────────────────────────────────────────────────────────────
function nextQuestion() {
  idx++;
  if (idx >= deck.length) { showComplete(); return; }
  loadQuestion();
}

function updateProgress() {
  document.getElementById('progress-fill').style.width = (idx / deck.length * 100) + '%';
}

function showComplete() {
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('complete-screen').classList.add('show');
  const sub = document.getElementById('complete-sub');
  if (sub) sub.textContent = `You've gone through all ${deck.length} questions.`;
  document.getElementById('final-correct').textContent = correctCount;
  document.getElementById('final-wrong').textContent = wrongCount;
  const total = correctCount + wrongCount;
  document.getElementById('final-pct').textContent = total > 0 ? Math.round(correctCount / total * 100) + '%' : '0%';
  document.getElementById('progress-fill').style.width = '100%';
}

function restart() {
  deck = shuffle(deck);
  idx = 0; correctCount = 0; wrongCount = 0; answered = false;
  document.getElementById('correct-count').textContent = 0;
  document.getElementById('wrong-count').textContent = 0;
  document.getElementById('complete-screen').classList.remove('show');
  document.getElementById('quiz-area').style.display = 'block';
  loadQuestion();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  clearTimeout(toastTimer);
  document.getElementById('toast-msg').innerHTML = msg;
  document.getElementById('fuzzy-toast').classList.add('show');
  toastTimer = setTimeout(() => dismissToast(), 4000);
}

function dismissToast() {
  document.getElementById('fuzzy-toast').classList.remove('show');
}
