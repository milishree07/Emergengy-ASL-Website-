/* ============================================================
   SIGNAL — script.js
   Plain JS. No build step. Session-only storage.
   ============================================================ */

(function () {
  "use strict";

  // ---------- DATA ----------
  const CHAPTERS = [
    {
      id: "help",
      num: 1,
      title: "Help",
      img: "help.png",
      steps: [
        "Open your non-dominant hand flat with the palm facing upward at chest level.",
        "Form a thumbs-up handshape with your dominant hand and place the base of the thumb in the center of the open palm.",
        "Keeping steady contact, slide the thumbs-up hand upward along the palm toward the fingertips in one smooth motion.",
        "Stop when the thumb reaches the top edge of the open hand. Keep both wrists relaxed, maintain continuous contact, and perform the movement slowly and naturally without lifting the dominant hand away."
      ]
    },
    {
      id: "emergency",
      num: 2,
      title: "Emergency",
      img: "emergency.png",
      steps: [
        "Raise your dominant hand and form the letter \u201CE\u201D with your fingers curled and the thumb resting across the fingertips.",
        "Hold the hand at shoulder height with the palm facing forward.",
        "Move the hand slightly to the left, then slightly to the right using quick, short shaking motions while keeping the \u201CE\u201D handshape unchanged.",
        "Repeat the left-and-right movement smoothly a few times. Keep your wrist relaxed, elbow mostly still, and maintain the same forward-facing palm throughout the motion."
      ]
    },
    {
      id: "fire",
      num: 3,
      title: "Fire",
      img: "fire.png",
      steps: [
        "Raise both hands in front of your upper chest with fingers spread wide in open \u201C5\u201D handshapes.",
        "Keep both palms facing toward your body.",
        "Begin moving the hands in alternating up-and-down motions while gently wiggling the fingers throughout the movement. One hand rises as the other lowers, then they switch positions in a smooth, continuous rhythm.",
        "Maintain relaxed wrists and natural motion. Continue alternating the movement with finger wiggling until the gesture is complete."
      ]
    },
    {
      id: "ambulance",
      num: 4,
      title: "Ambulance",
      img: "ambulance.png",
      steps: [
        "Raise both hands near shoulder level with fingers spread wide and palms facing forward.",
        "Twist both open hands inward at the wrists.",
        "Then twist them outward to return to the starting position.",
        "Repeat the gentle back-and-forth wrist twisting motion while keeping both hands raised."
      ]
    }
  ];

  const QUESTIONS = [
    {
      description: "Raise both hands near shoulder level with fingers spread wide and palms facing forward. Twist both open hands inward at the wrists, then twist them outward to return to the starting position. Repeat the gentle back-and-forth wrist twisting motion while keeping both hands raised.",
      options: ["Fire", "Help", "Ambulance"],
      correct: "Ambulance"
    },
    {
      description: "Raise both hands in front of your upper chest with fingers spread wide in open \u201C5\u201D handshapes. Keep both palms facing toward your body. Begin moving the hands in alternating up-and-down motions while gently wiggling the fingers throughout the movement. One hand rises as the other lowers, then they switch positions in a smooth, continuous rhythm. Maintain relaxed wrists and natural motion. Continue alternating the movement with finger wiggling until the gesture is complete.",
      options: ["Fire", "Help", "Ambulance"],
      correct: "Fire"
    },
    {
      description: "Raise your dominant hand and form the letter \u201CE\u201D with your fingers curled and the thumb resting across the fingertips. Hold the hand at shoulder height with the palm facing forward. Move the hand slightly to the left, then slightly to the right using quick, short shaking motions while keeping the \u201CE\u201D handshape unchanged. Repeat the left-and-right movement smoothly a few times. Keep your wrist relaxed, elbow mostly still, and maintain the same forward-facing palm throughout the motion.",
      options: ["Emergency", "Help", "Ambulance"],
      correct: "Emergency"
    },
    {
      description: "Open your non-dominant hand flat with the palm facing upward at chest level. Form a thumbs-up handshape with your dominant hand and place the base of the thumb in the center of the open palm. Keeping steady contact, slide the thumbs-up hand upward along the palm toward the fingertips in one smooth motion. Stop when the thumb reaches the top edge of the open hand. Keep both wrists relaxed, maintain continuous contact, and perform the movement slowly and naturally without lifting the dominant hand away.",
      options: ["Fire", "Help", "Ambulance"],
      correct: "Help"
    }
  ];

  // ---------- STATE ----------
  const SS = window.sessionStorage;
  const STATE = {
    name: SS.getItem("signal.name") || "",
    completed: JSON.parse(SS.getItem("signal.completed") || "[]"),
    quiz: JSON.parse(SS.getItem("signal.quiz") || "null"), // {score, total, percent}
    learningSec: parseInt(SS.getItem("signal.learningSec") || "0", 10),
    practiceSec: parseInt(SS.getItem("signal.practiceSec") || "0", 10),
    currentView: "welcome",
    quizIndex: 0,
    quizCorrectCount: 0
  };

  function persist() {
    SS.setItem("signal.name", STATE.name);
    SS.setItem("signal.completed", JSON.stringify(STATE.completed));
    if (STATE.quiz) SS.setItem("signal.quiz", JSON.stringify(STATE.quiz));
    SS.setItem("signal.learningSec", String(STATE.learningSec));
    SS.setItem("signal.practiceSec", String(STATE.practiceSec));
  }

  // ---------- ELEMENTS ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const topnav = $("#topnav");
  const navBtns = $$(".nav-btn");
  const navUserName = $("#navUserName");

  // ---------- VIEW SWITCHING ----------
  function show(viewId) {
    $$(".view").forEach(v => {
      const active = v.id === viewId;
      v.classList.toggle("is-active", active);
      v.hidden = !active;
    });
    navBtns.forEach(b => b.classList.toggle("is-active", b.dataset.target === viewId));
    STATE.currentView = viewId;
    updateTimers(); // switch which timer ticks
    if (viewId === "achievements") renderAchievements();
    if (viewId === "learning") renderChapters();
    if (viewId === "practice") renderQuiz();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navBtns.forEach(b => b.addEventListener("click", () => show(b.dataset.target)));

  // ---------- WELCOME ----------
  const welcomeForm = $("#welcomeForm");
  const nameInput = $("#nameInput");
  const nameError = $("#nameError");
  const welcomePopup = $("#welcomePopup");
  const popupName = $("#popupName");
  const popupEnter = $("#popupEnter");

  welcomeForm.addEventListener("submit", e => {
    e.preventDefault();
    const v = nameInput.value.trim();
    if (!v) {
      nameError.hidden = false;
      nameInput.focus();
      return;
    }
    nameError.hidden = true;
    STATE.name = v;
    persist();
    popupName.textContent = v;
    openModal(welcomePopup);
  });

  popupEnter.addEventListener("click", () => {
    closeModal(welcomePopup);
    topnav.hidden = false;
    navUserName.textContent = STATE.name;
    show("learning");
  });

  // ---------- LEARNING ----------
  const chapterGrid = $("#chapterGrid");
  const chapterModal = $("#chapterModal");
  const chapterModalBody = $("#chapterModalBody");

  function renderChapters() {
    chapterGrid.innerHTML = "";
    CHAPTERS.forEach(c => {
      const completed = STATE.completed.includes(c.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "chapter-card" + (completed ? " is-complete" : "");
      card.setAttribute("aria-label", `Open Chapter ${c.num}: ${c.title}`);
      card.innerHTML = `
        <span class="chapter-badge" aria-hidden="true">Completed ✓</span>
        <div class="chapter-thumb"><img src="${c.img}" alt="ASL sign for ${c.title}" loading="lazy" /></div>
        <div class="chapter-meta">
          <p class="chapter-num">Chapter ${c.num}</p>
          <h3 class="chapter-title">${c.title}</h3>
        </div>
      `;
      card.addEventListener("click", () => openChapter(c.id));
      chapterGrid.appendChild(card);
    });
  }

  function openChapter(id) {
    const c = CHAPTERS.find(x => x.id === id);
    if (!c) return;
    const isComplete = STATE.completed.includes(c.id);
    chapterModalBody.innerHTML = `
      <div class="chapter-detail">
        <p class="eyebrow">Chapter ${c.num}</p>
        <h3 class="detail-title" id="chapterModalTitle">ASL Sign: ${c.title}</h3>
        <img class="detail-image" src="${c.img}" alt="Step-by-step ASL sign for ${c.title}" />
        <ol class="steps">
          ${c.steps.map(s => `<li><span>${escapeHTML(s)}</span></li>`).join("")}
        </ol>
        <div class="complete-row">
          <button type="button" class="btn btn-ghost" data-close>Close</button>
          <button type="button" class="btn ${isComplete ? "btn-ghost" : "btn-primary"}" id="markCompleteBtn" ${isComplete ? "disabled" : ""}>
            ${isComplete ? "Completed ✓" : "Mark as complete"}
          </button>
        </div>
      </div>
    `;
    openModal(chapterModal);
    const btn = $("#markCompleteBtn");
    if (btn && !isComplete) {
      btn.addEventListener("click", () => {
        if (!STATE.completed.includes(c.id)) {
          STATE.completed.push(c.id);
          persist();
        }
        closeModal(chapterModal);
        renderChapters();
      });
    }
  }

  // ---------- PRACTICE / QUIZ ----------
  const quizArea = $("#quizArea");
  const feedbackPopup = $("#feedbackPopup");
  const feedbackTitle = $("#feedbackTitle");
  const feedbackBody = $("#feedbackBody");
  const feedbackIcon = $("#feedbackIcon");
  const feedbackBtn = $("#feedbackBtn");
  const flashCorrect = $("#flashCorrect");
  const flashWrong = $("#flashWrong");

  let pendingAdvance = false;

  function renderQuiz() {
    if (STATE.quizIndex >= QUESTIONS.length) {
      renderQuizComplete();
      return;
    }
    const q = QUESTIONS[STATE.quizIndex];
    const total = QUESTIONS.length;
    const pct = Math.round((STATE.quizIndex / total) * 100);
    quizArea.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">
          <span class="quiz-progress-label">Question ${STATE.quizIndex + 1} of ${total}</span>
          <div class="quiz-progress-bar" aria-hidden="true"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <h3 class="quiz-question-title">Which ASL emergency sign does this describe?</h3>
        <div class="quiz-description">${escapeHTML(q.description)}</div>
        <div class="quiz-options" role="group" aria-label="Answer options">
          ${q.options.map(opt => `<button type="button" class="quiz-option" data-answer="${escapeAttr(opt)}">${escapeHTML(opt)}</button>`).join("")}
        </div>
      </div>
    `;
    $$(".quiz-option", quizArea).forEach(b => {
      b.addEventListener("click", () => handleAnswer(b, q));
    });
  }

  function handleAnswer(btn, q) {
    const choice = btn.dataset.answer;
    const correct = choice === q.correct;
    if (correct) {
      btn.classList.add("is-correct");
      STATE.quizCorrectCount += 1;
      flash(flashCorrect);
      pendingAdvance = true;
      feedbackIcon.textContent = "✓";
      feedbackIcon.classList.remove("wrong");
      feedbackTitle.textContent = "Correct!";
      feedbackBody.textContent = `Great job! You correctly identified the ASL sign for ${q.correct}. Keep practicing to improve your emergency sign language skills.`;
      feedbackBtn.textContent = (STATE.quizIndex + 1 >= QUESTIONS.length) ? "See results" : "Next question";
      openModal(feedbackPopup);
    } else {
      btn.classList.add("is-wrong");
      flash(flashWrong);
      pendingAdvance = false;
      feedbackIcon.textContent = "!";
      feedbackIcon.classList.add("wrong");
      feedbackTitle.textContent = "Incorrect";
      feedbackBody.textContent = `Correct answer: ${q.correct}. Please revisit the Learning section and try again.`;
      feedbackBtn.textContent = "Try again";
      openModal(feedbackPopup);
    }
  }

  feedbackBtn.addEventListener("click", () => {
    closeModal(feedbackPopup);
    if (pendingAdvance) {
      STATE.quizIndex += 1;
      pendingAdvance = false;
      if (STATE.quizIndex >= QUESTIONS.length) {
        // save final score
        STATE.quiz = {
          score: STATE.quizCorrectCount,
          total: QUESTIONS.length,
          percent: Math.round((STATE.quizCorrectCount / QUESTIONS.length) * 100)
        };
        persist();
      }
      renderQuiz();
    } else {
      // re-render to clear wrong-state styling
      renderQuiz();
    }
  });

  function renderQuizComplete() {
    const s = STATE.quiz || { score: 0, total: QUESTIONS.length, percent: 0 };
    quizArea.innerHTML = `
      <div class="quiz-complete">
        <p class="eyebrow">Result</p>
        <h3>Quiz Completed</h3>
        <p class="page-sub">Excellent work, ${escapeHTML(STATE.name || "friend")}.</p>
        <div class="quiz-summary">
          <div><div class="big">${s.score}/${s.total}</div><div class="lbl">Score</div></div>
          <div><div class="big">${s.percent}%</div><div class="lbl">Accuracy</div></div>
        </div>
        <button type="button" class="btn btn-primary" id="retryBtn">Retry Quiz</button>
      </div>
    `;
    $("#retryBtn").addEventListener("click", () => {
      STATE.quizIndex = 0;
      STATE.quizCorrectCount = 0;
      renderQuiz();
    });
  }

  function flash(el) {
    el.classList.add("is-on");
    setTimeout(() => el.classList.remove("is-on"), 380);
  }

  // ---------- ACHIEVEMENTS ----------
  const RING_CIRC = 2 * Math.PI * 52; // ~326.7

  function renderAchievements() {
    $("#statLearningTime").textContent = fmtTime(STATE.learningSec);
    $("#statPracticeTime").textContent = fmtTime(STATE.practiceSec);
    const cc = STATE.completed.length;
    $("#chapterCountText").textContent = `${cc}/4`;
    setRing("#ringChapters", cc / 4);
    const pct = STATE.quiz ? STATE.quiz.percent : 0;
    $("#scoreText").textContent = `${pct}%`;
    setRing("#ringScore", pct / 100);
    $("#scoreFoot").textContent = STATE.quiz
      ? `${STATE.quiz.score} of ${STATE.quiz.total} correct on last attempt`
      : "No quiz attempted yet";
  }

  function setRing(sel, frac) {
    const el = $(sel);
    if (!el) return;
    const offset = RING_CIRC * (1 - Math.max(0, Math.min(1, frac)));
    el.style.strokeDashoffset = offset.toFixed(2);
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }

  // ---------- TIMERS ----------
  let timerHandle = null;
  function updateTimers() {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    if (STATE.currentView === "learning") {
      timerHandle = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        STATE.learningSec += 1;
        persist();
      }, 1000);
    } else if (STATE.currentView === "practice") {
      timerHandle = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        STATE.practiceSec += 1;
        persist();
      }, 1000);
    }
  }

  // ---------- MODAL HELPERS ----------
  function openModal(m) {
    m.hidden = false;
    document.body.style.overflow = "hidden";
    const focusable = m.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }
  function closeModal(m) {
    m.hidden = true;
    document.body.style.overflow = "";
  }
  document.addEventListener("click", e => {
    const t = e.target;
    if (t && t.matches("[data-close]")) {
      const m = t.closest(".modal");
      if (m) closeModal(m);
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      $$(".modal").forEach(m => { if (!m.hidden && m.id !== "welcomePopup") closeModal(m); });
    }
  });

  // ---------- UTIL ----------
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function escapeAttr(str) { return escapeHTML(str); }

  // ---------- INIT ----------
  // If session already has a name (e.g. soft reload), restore app state
  if (STATE.name) {
    topnav.hidden = false;
    navUserName.textContent = STATE.name;
    show("learning");
  } else {
    show("welcome");
  }
})();
