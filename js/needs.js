/* ================================================================
   NEEDS MODULE – Drink / Snack / Meal / Hygiene / Homeschool /
   Entertainment / Clean / Exercise
================================================================ */

import { state, adjustNeed, addXP, updateMoodFromNeeds, saveState } from "./state.js";

let hygieneMenuOpen = false;

/* ================================================================
   INIT – Call from app.js
================================================================ */
export function initNeedsEngine() {
  /* Quick-bar buttons */
  const bar = document.getElementById("needBarLeft");
  bar.addEventListener("click", handleNeedButton);

  /* Hygiene submenu */
  const hygieneMenu = document.getElementById("hygieneMenu");
  hygieneMenu.addEventListener("click", handleHygieneChoice);
}

/* ================================================================
   MAIN NEED BUTTON HANDLER
================================================================ */
function handleNeedButton(e) {
  const btn = e.target.closest(".need-dot");
  if (!btn) return;

  const action = btn.dataset.action;

  playSound("ui-click");

  switch (action) {
    case "drink": return performDrink();
    case "snack": return performSnack();
    case "meal": return performMeal();
    case "hygiene": return toggleHygieneMenu();
    case "homeschool": return performHomeschool();
    case "entertain": return performEntertainment();
    case "clean": return performCleaning();
    case "exercise": return performExercise();
  }
}

/* ================================================================
   DRINK – Small boost + hydration XP
================================================================ */
function performDrink() {
  adjustNeed("quiet", +5);
  adjustNeed("energy", +3);

  addXP("entertain", 5); // small
  commitNeedUpdate();
}

/* ================================================================
   SNACK – +25% of current hunger
================================================================ */
function performSnack() {
  const addAmt = Math.round((100 - state.needs.hunger) * 0.25);
  adjustNeed("hunger", +addAmt);

  addXP("cooking", 10);
  commitNeedUpdate();
}

/* ================================================================
   MEAL – Max hunger and boost energy
================================================================ */
function performMeal() {
  state.needs.hunger = 100;
  adjustNeed("energy", +20);

  addXP("cooking", 20);
  commitNeedUpdate();
}

/* ================================================================
   HOMESCHOOL – Teacher XP + drains energy + adds social
================================================================ */
function performHomeschool() {
  adjustNeed("energy", -10);
  adjustNeed("social", +10);

  addXP("teacher", 20);
  commitNeedUpdate();
}

/* ================================================================
   ENTERTAINMENT – Fun + social + XP
================================================================ */
function performEntertainment() {
  adjustNeed("fun", +20);
  adjustNeed("social", +5);

  addXP("entertain", 15);
  commitNeedUpdate();
}

/* ================================================================
   CLEANING – Energy cost but XP gain
================================================================ */
function performCleaning() {
  adjustNeed("energy", -8);
  adjustNeed("quiet", +4);

  addXP("cleaning", 15);
  commitNeedUpdate();
}

/* ================================================================
   EXERCISE – Lowers energy but increases mood indirectly
================================================================ */
function performExercise() {
  adjustNeed("energy", -15);
  adjustNeed("fun", +10);

  addXP("exercise", 20);
  commitNeedUpdate();
}

/* ================================================================
   HYGIENE MENU CONTROL
================================================================ */
function toggleHygieneMenu() {
  const menu = document.getElementById("hygieneMenu");
  hygieneMenuOpen = !hygieneMenuOpen;
  menu.classList.toggle("open", hygieneMenuOpen);
}

/* ================================================================
   HYGIENE SUB-CHOICES
================================================================ */
function handleHygieneChoice(e) {
  const choice = e.target.dataset.hygiene;
  if (!choice) return;

  playSound("ui-click");

  switch (choice) {
    case "toilet": return performToilet();
    case "shower": return performShower();
    case "teeth": return performTeeth();
    case "haircare": return performHair();
    case "skincare": return performSkin();
  }
}

/* INDIVIDUAL HYGIENE ACTIONS */
function performToilet() {
  adjustNeed("hygiene", -10);
  addXP("cleaning", 5);
  commitNeedUpdate(true);
}

function performShower() {
  adjustNeed("hygiene", +25);
  adjustNeed("energy", +10);

  addXP("cleaning", 10);
  commitNeedUpdate(true);

  playSound("feel-energized");
}

function performTeeth() {
  adjustNeed("hygiene", +10);
  addXP("cleaning", 5);
  commitNeedUpdate(true);
}

function performHair() {
  adjustNeed("hygiene", +15);
  addXP("cleaning", 8);
  commitNeedUpdate(true);
}

function performSkin() {
  adjustNeed("hygiene", +12);
  addXP("cleaning", 8);
  commitNeedUpdate(true);
}

/* ================================================================
   FINALIZE NEED CHANGE
================================================================ */
function commitNeedUpdate(closeMenu=false) {
  updateMoodFromNeeds();
  saveState();

  if (closeMenu) {
    hygieneMenuOpen = false;
    document.getElementById("hygieneMenu").classList.remove("open");
  }
}

/* ================================================================
   SOUND HANDLER
================================================================ */
function playSound(name) {
  const el = document.querySelector(`[data-sound="${name}"]`);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(()=>{});
}
