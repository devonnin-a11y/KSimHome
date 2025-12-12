/* ================================================================
   TIMERS MODULE – Drink, Snack, Meal, Hygiene countdowns
   Handles: countdown engine, UI rendering, alarm triggers,
   automatic refresh loop.
================================================================ */

import { state, saveState } from "./state.js";

let timersInterval = null;

/* ================================================================
   INIT – Called from app.js
================================================================ */
export function initTimersEngine() {
  renderTimersPanel();
  startTimersLoop();
}

/* ================================================================
   LOOP – Updates countdown timers every second
================================================================ */
function startTimersLoop() {
  if (timersInterval) clearInterval(timersInterval);

  timersInterval = setInterval(() => {
    tickTimers();
    updateTimersDisplay();
  }, 1000);
}

/* ================================================================
   REDUCE EACH TIMER BY ONE SECOND
================================================================ */
function tickTimers() {
  Object.keys(state.timers).forEach(key => {
    if (state.timers[key] > 0) {
      state.timers[key]--;

      if (state.timers[key] === 0) {
        playSound("timer-alarm");
      }
    }
  });

  saveState();
}

/* ================================================================
   RENDER PANEL UI
================================================================ */
export function renderTimersPanel() {
  const view = document.querySelector(`[data-category-view="timers"]`);
  if (!view) return;

  view.innerHTML = `
    <div class="timer-list">
      ${renderTimerRow("drink", "Drink Timer")}
      ${renderTimerRow("snack", "Snack Timer")}
      ${renderTimerRow("meal", "Meal Timer")}
      ${renderTimerRow("hygiene", "Hygiene Timer")}
    </div>
  `;

  attachTimerButtonEvents(view);
}

/* ================================================================
   RENDER A SINGLE TIMER ROW
================================================================ */
function renderTimerRow(key, label) {
  const value = state.timers[key];
  return `
    <div class="timer-card">
      <div class="timer-header">
        <div class="timer-title">${label}</div>
        <button class="timer-start" data-timer="${key}">▶ Start</button>
        <button class="timer-reset" data-reset="${key}">⟳ Reset</button>
      </div>
      <div class="timer-display" id="timer-${key}">
        ${formatTimer(value)}
      </div>
    </div>
  `;
}

/* ================================================================
   FORMAT SECONDS → MM:SS
================================================================ */
function formatTimer(seconds) {
  if (!seconds || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ================================================================
   UPDATE ALL DISPLAYED TIMERS
================================================================ */
function updateTimersDisplay() {
  Object.keys(state.timers).forEach(key => {
    const el = document.getElementById(`timer-${key}`);
    if (el) el.textContent = formatTimer(state.timers[key]);
  });
}

/* ================================================================
   BUTTON HANDLERS
================================================================ */
function attachTimerButtonEvents(view) {
  /* Start buttons */
  view.querySelectorAll("[data-timer]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.timer;
      startTimer(key);
    });
  });

  /* Reset buttons */
  view.querySelectorAll("[data-reset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.reset;
      resetTimer(key);
    });
  });
}

/* ================================================================
   START TIMERS (Defaults per category)
================================================================ */
function startTimer(key) {
  playSound("ui-click");

  const defaults = {
    drink: 900,   // 15 minutes
    snack: 1800,  // 30 minutes
    meal: 7200,   // 2 hours
    hygiene: 3600 // 1 hour
  };

  state.timers[key] = defaults[key] || 900;
  saveState();
  updateTimersDisplay();
}

/* ================================================================
   RESET A TIMER
================================================================ */
function resetTimer(key) {
  playSound("ui-click");
  state.timers[key] = 0;
  saveState();
  updateTimersDisplay();
}

/* ================================================================
   SOUND HELPER
================================================================ */
function playSound(name) {
  const el = document.querySelector(`[data-sound="${name}"]`);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(()=>{});
}
