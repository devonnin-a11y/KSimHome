/* ================================================================
   BEHAVIOR MODULE – CAK & YAK Tracking
   Handles: logging, counters, timestamps, mood impact,
   panel rendering, auto-refresh.
================================================================ */

import { state, logBehavior, formatTimeSince, updateMoodFromNeeds, adjustNeed, saveState } from "./state.js";

let behaviorInterval = null;

/* ================================================================
   INIT – Called from app.js
================================================================ */
export function initBehaviorEngine() {
  renderBehaviorPanel();
  startBehaviorTimerLoop();
}

/* ================================================================
   TIMER LOOP – Updates “last time” every second
================================================================ */
function startBehaviorTimerLoop() {
  if (behaviorInterval) clearInterval(behaviorInterval);
  behaviorInterval = setInterval(() => {
    updateBehaviorSinceDisplay();
  }, 1000);
}

/* ================================================================
   UPDATE THE “SINCE LAST” TEXT WITHOUT RERENDER
================================================================ */
export function updateBehaviorSinceDisplay() {
  const cakSinceEl = document.getElementById("cakSince");
  const yakSinceEl = document.getElementById("yakSince");

  if (cakSinceEl) cakSinceEl.textContent = formatTimeSince(state.behavior.cak.last);
  if (yakSinceEl) yakSinceEl.textContent = formatTimeSince(state.behavior.yak.last);
}

/* ================================================================
   LOG CAK & YAK ACTION
================================================================ */
function handleBehaviorAction(type) {
  playSound(type === "cak" ? "log-cak" : "log-yak");

  logBehavior(type);

  /* Mood + needs reaction */
  if (type === "cak") {
    adjustNeed("quiet", -15);
    adjustNeed("fun", -10);
  } else {
    adjustNeed("quiet", -10);
    adjustNeed("fun", -15);
  }

  /* Save + recalc mood */
  updateMoodFromNeeds();
  saveState();

  /* Visual refresh */
  renderBehaviorPanel();
}

/* ================================================================
   RENDER THE ENTIRE REACTION TAB PANEL
================================================================ */
export function renderBehaviorPanel() {
  const view = document.querySelector(`[data-category-view="behavior"]`);
  if (!view) return;

  const cak = state.behavior.cak;
  const yak = state.behavior.yak;

  view.innerHTML = `
    <div class="behavior-list">

      <!-- ===== CAK CARD ===== -->
      <div class="behavior-card">
        <div class="behavior-header">
          <div>
            <div class="behavior-title">Cursed at Kids</div>
            <div class="behavior-sub">Reducing this builds calmer habits</div>
          </div>
          <button class="need-dot" data-behavior="cak">⚡</button>
        </div>

        <div class="behavior-metrics">
          <div class="metric"><div class="label">Today</div><div class="value">${cak.count}</div></div>
          <div class="metric"><div class="label">Weekly</div><div class="value">${cak.weekly}</div></div>
          <div class="metric"><div class="label">Monthly</div><div class="value">${cak.monthly}</div></div>
          <div class="metric"><div class="label">Yearly</div><div class="value">${cak.yearly}</div></div>
        </div>

        <div class="behavior-last">Last: <span id="cakSince">${formatTimeSince(cak.last)}</span></div>
      </div>

      <!-- ===== YAK CARD ===== -->
      <div class="behavior-card">
        <div class="behavior-header">
          <div>
            <div class="behavior-title">Yelled at Kids</div>
            <div class="behavior-sub">Tracking helps build awareness</div>
          </div>
          <button class="need-dot" data-behavior="yak">🔥</button>
        </div>

        <div class="behavior-metrics">
          <div class="metric"><div class="label">Today</div><div class="value">${yak.count}</div></div>
          <div class="metric"><div class="label">Weekly</div><div class="value">${yak.weekly}</div></div>
          <div class="metric"><div class="label">Monthly</div><div class="value">${yak.monthly}</div></div>
          <div class="metric"><div class="label">Yearly</div><div class="value">${yak.yearly}</div></div>
        </div>

        <div class="behavior-last">Last: <span id="yakSince">${formatTimeSince(yak.last)}</span></div>
      </div>
    </div>
  `;

  /* Attach button listeners */
  const buttons = view.querySelectorAll("[data-behavior]");
  buttons.forEach(btn =>
    btn.addEventListener("click", () => {
      const type = btn.dataset.behavior;
      handleBehaviorAction(type);
    })
  );
}

/* ================================================================
   SOUNDS
================================================================ */
function playSound(name) {
  const el = document.querySelector(`[data-sound="${name}"]`);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(()=>{});
}
