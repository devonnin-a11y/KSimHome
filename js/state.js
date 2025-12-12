/* ================================================================
   GLOBAL STATE MODULE
   Handles: needs, mood, XP, behavior logs, save/load, particles
================================================================ */

export const state = {
  mood: "fine",
  moodIcon: "😊",
  moodValue: 50, // 0–100
  simImage: "kelly-fine.png",
  hudImage: "kelly-fine-home.png",

  needs: {
    hunger: 70,
    energy: 60,
    social: 65,
    fun: 55,
    hygiene: 75,
    quiet: 60
  },

  skills: {
    baking: 0,
    cooking: 0,
    cleaning: 0,
    teacher: 0,
    exercise: 0,
    entertain: 0
  },

  behavior: {
    cak: { count: 0, weekly: 0, monthly: 0, yearly: 0, last: null },
    yak: { count: 0, weekly: 0, monthly: 0, yearly: 0, last: null }
  },

  timers: {
    drink: 0,
    snack: 0,
    meal: 0,
    hygiene: 0
  },

  bgMusicOn: false
};

/* ================================================================
   SAVE + LOAD
================================================================ */
export function saveState() {
  localStorage.setItem("ksimState", JSON.stringify(state));
}

export function loadState() {
  const stored = localStorage.getItem("ksimState");
  if (!stored) return;
  const parsed = JSON.parse(stored);

  Object.assign(state, parsed);
}

/* ================================================================
   NEEDS ADJUST HELPERS
================================================================ */
export function adjustNeed(key, amount) {
  if (!state.needs[key] && state.needs[key] !== 0) return;
  state.needs[key] = Math.max(0, Math.min(100, state.needs[key] + amount));
  saveState();
  updateMoodFromNeeds();
}

/* ================================================================
   BEHAVIOR EVENTS (CAK / YAK)
================================================================ */
export function logBehavior(type) {
  const obj = state.behavior[type];
  obj.count++;
  obj.weekly++;
  obj.monthly++;
  obj.yearly++;
  obj.last = Date.now();
  saveState();
}

/* ================================================================
   GET TIME SINCE LAST EVENT
================================================================ */
export function formatTimeSince(timestamp) {
  if (!timestamp) return "—";
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

/* ================================================================
   MOOD ENGINE
================================================================ */
export function updateMoodFromNeeds() {
  const avg = Object.values(state.needs).reduce((a,b)=>a+b,0) / 6;
  state.moodValue = avg;

  if (avg >= 75) state.mood = "happy";
  else if (avg >= 60) state.mood = "fine";
  else if (avg >= 45) state.mood = "uncomfortable";
  else if (avg >= 25) state.mood = "sad";
  else state.mood = "scared";

  updateMoodVisuals();
  saveState();
}

/* ================================================================
   MOOD → HUD + SIM CHARACTER SYNC
================================================================ */
export function updateMoodVisuals() {
  const sim = document.getElementById("simAvatar");
  const hud = document.getElementById("hudPortraitImg");
  const feelMain = document.getElementById("hudMoodMain");
  const feelSub = document.getElementById("hudMoodSub");
  const moodFill = document.getElementById("moodFill");
  const plumbob = document.getElementById("plumbobShape");

  const imgMap = {
    happy: "kelly-happy.png",
    fine: "kelly-fine.png",
    uncomfortable: "kelly-uncomfortable.png",
    sad: "kelly-sad.png",
    scared: "kelly-scared.png"
  };

  const hudMap = {
    happy: "kelly-happy-home.png",
    fine: "kelly-fine-home.png",
    uncomfortable: "kelly-uncomfortable-home.png",
    sad: "kelly-sad-home.png",
    scared: "kelly-scared-home.png"
  };

  /* Update images */
  sim.src = `images/${imgMap[state.mood] || "kelly-fine.png"}`;
  hud.src = `images/${hudMap[state.mood] || "kelly-fine-home.png"}`;

  /* Mood text */
  feelMain.textContent = state.mood.charAt(0).toUpperCase() + state.mood.slice(1);

  const subs = {
    happy: "Feeling bright and lifted ✨",
    fine: "Steady and grounded",
    uncomfortable: "A bit thrown off",
    sad: "Heart feels heavy",
    scared: "Energy is shaken"
  };
  feelSub.textContent = subs[state.mood] || "";

  /* Gauge value */
  moodFill.style.width = `${state.moodValue}%`;

  /* Plumbob color */
  const colors = {
    happy: "#6ae67e",
    fine: "#37e0ff",
    uncomfortable: "#c29a39",
    sad: "#6c4eff",
    scared: "#ff6a6a"
  };
  plumbob.style.background = colors[state.mood] || "#37e0ff";
  plumbob.style.boxShadow = `0 0 12px ${colors[state.mood]}`;
}

/* ================================================================
   XP SYSTEM (Soft Magical Particles)
================================================================ */
export function addXP(skill, amount=10) {
  if (!state.skills[skill] && state.skills[skill] !== 0) return;
  state.skills[skill] += amount;
  saveState();
  spawnMagicXPParticles();
}

/* PARTICLE EFFECT – New World Aether Sparks */
function spawnMagicXPParticles() {
  const container = document.body;
  for (let i=0;i<8;i++){
    const p = document.createElement("div");
    p.className = "xp-particle";

    const x = window.innerWidth/2 + (Math.random()*120 - 60);
    const y = window.innerHeight/2 + (Math.random()*80 - 40);

    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.opacity = 0;

    container.appendChild(p);

    setTimeout(()=>{ p.style.opacity = 1; p.style.transform="translateY(-40px)"; }, 10);
    setTimeout(()=>{ p.style.opacity = 0; }, 700);
    setTimeout(()=>{ container.removeChild(p); }, 1000);
  }
}
