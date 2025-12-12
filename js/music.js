/* ================================================================
   MUSIC MODULE – Background Music Engine
   Handles: autoplay, toggle, skip, mobile unlock, state sync
================================================================ */

import { state, saveState } from "./state.js";

let bgMusic = null;
let hasUserInteractedForMusic = false;

const bgTracks = [
  "sounds/bg-1.mp3",
  "sounds/bg-2.mp3",
  "sounds/bg-3.mp3"
];

let currentBgIndex = 0;

/* ================================================================
   INIT
================================================================ */
export function initMusicEngine() {
  bgMusic = document.getElementById("bgMusic");
  currentBgIndex = Math.floor(Math.random() * bgTracks.length);

  setBgTrack(currentBgIndex);

  /* Buttons */
  document.getElementById("musicToggle").addEventListener("click", toggleBackgroundMusic);
  document.getElementById("musicSkip").addEventListener("click", skipBackgroundTrack);

  /* Unlock audio after first tap (mobile requirement) */
  document.body.addEventListener("click", unlockAudioOnce, { once: true });
  document.body.addEventListener("touchstart", unlockAudioOnce, { once: true });

  /* Restore saved state */
  if (state.bgMusicOn) tryPlayBgMusic();
}

/* ================================================================
   AUDIO UNLOCK (Mobile autoplay fix)
================================================================ */
function unlockAudioOnce() {
  hasUserInteractedForMusic = true;
  if (state.bgMusicOn) tryPlayBgMusic();
}

/* ================================================================
   SET TRACK
================================================================ */
function setBgTrack(index) {
  currentBgIndex = index % bgTracks.length;
  if (!bgMusic) return;
  bgMusic.src = bgTracks[currentBgIndex];
  bgMusic.load();

  if (state.bgMusicOn && hasUserInteractedForMusic) {
    tryPlayBgMusic();
  }
}

/* ================================================================
   PLAY ATTEMPT WITH AUTOPLAY FALLBACK
================================================================ */
function tryPlayBgMusic() {
  if (!bgMusic) return;

  bgMusic.play().catch(() => {
    // silently ignore autoplay rejection
  });
}

/* ================================================================
   TOGGLE MUSIC
================================================================ */
function toggleBackgroundMusic() {
  state.bgMusicOn = !state.bgMusicOn;
  saveState();

  const btn = document.getElementById("musicToggle");
  btn.textContent = state.bgMusicOn ? "♫ On" : "♫ Off";

  if (state.bgMusicOn) {
    tryPlayBgMusic();
  } else {
    bgMusic.pause();
  }
}

/* ================================================================
   SKIP TRACK
================================================================ */
function skipBackgroundTrack() {
  currentBgIndex = (currentBgIndex + 1) % bgTracks.length;
  setBgTrack(currentBgIndex);
}

/* ================================================================
   EXTERNAL HOOKS
================================================================ */
export function forcePlayIfAllowed() {
  if (state.bgMusicOn && hasUserInteractedForMusic) {
    tryPlayBgMusic();
  }
}
