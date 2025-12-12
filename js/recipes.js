/* ================================================================
   RECIPES MODULE  
   Sims 4 + New World Alchemy/Cooking hybrid UI
   Handles: add, edit, delete, render list, filter, image upload.
================================================================ */

import { state, saveState } from "./state.js";
import { awardXp } from "./xp.js";

/* ================================================================
   INIT
================================================================ */
export function initRecipes() {
  renderRecipes();
  setupRecipeForm();
  setupRecipeFilter();
}

/* ================================================================
   RENDER LIST
================================================================ */
export function renderRecipes() {
  const list = document.getElementById("recipeList");
  const bakingList = document.getElementById("bakingList");
  if (!list) return;

  list.innerHTML = "";
  bakingList.innerHTML = "";

  const filter = (document.getElementById("recipeFilter")?.value || "").toLowerCase();

  const sorted = [...state.recipes].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  sorted.forEach(recipe => {
    if (filter && !(recipe.category || "").toLowerCase().includes(filter)) return;

    const card = createRecipeCard(recipe);
    list.appendChild(card);

    if ((recipe.category || "").toLowerCase().includes("baking")) {
      bakingList.appendChild(card.cloneNode(true));
    }
  });
}

/* ================================================================
   CREATE CARD ELEMENT
================================================================ */
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.dataset.id = recipe.id;

  const img = recipe.image
    ? `<img class="recipe-thumb" src="${recipe.image}" alt="recipe image">`
    : `<div class="recipe-thumb placeholder">🧪</div>`;

  card.innerHTML = `
    <div class="recipe-card-header">
      <span class="recipe-card-title">${recipe.name}</span>
      <span class="recipe-card-cat">${recipe.category || "No tag"}</span>
    </div>

    ${img}

    <div class="recipe-card-notes">${(recipe.notes || "").replace(/\n/g, "<br>")}</div>

    <div class="recipe-actions">
      <button class="recipe-edit">✎ Edit</button>
      <button class="recipe-delete">🗑 Delete</button>
    </div>
  `;

  card.querySelector(".recipe-edit").onclick = () => openEditRecipe(recipe);
  card.querySelector(".recipe-delete").onclick = () => deleteRecipe(recipe.id);

  return card;
}

/* ================================================================
   ADD NEW RECIPE
================================================================ */
function setupRecipeForm() {
  const form = document.getElementById("recipeForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("recipeName").value.trim();
    const category = document.getElementById("recipeCategory").value.trim();
    const notes = document.getElementById("recipeNotes").value.trim();
    const imageFile = document.getElementById("recipeImage")?.files?.[0];

    if (!name) return;

    let imgData = null;
    if (imageFile) {
      imgData = await fileToBase64(imageFile);
    }

    const recipe = {
      id: Date.now().toString(36),
      name,
      category,
      notes,
      image: imgData || null
    };

    state.recipes.push(recipe);
    awardXp("nourish", 8, form);
    awardXp("homestead", 4, form);

    saveState();
    form.reset();
    renderRecipes();
  });
}

/* ================================================================
   EDIT RECIPE
================================================================ */
function openEditRecipe(recipe) {
  const name = prompt("Edit name:", recipe.name);
  if (name === null) return;

  const cat = prompt("Edit category:", recipe.category);
  if (cat === null) return;

  const notes = prompt("Edit notes:", recipe.notes);
  if (notes === null) return;

  recipe.name = name.trim();
  recipe.category = cat.trim();
  recipe.notes = notes.trim();

  saveState();
  renderRecipes();
}

/* ================================================================
   DELETE RECIPE
================================================================ */
function deleteRecipe(id) {
  if (!confirm("Delete this recipe?")) return;
  state.recipes = state.recipes.filter(r => r.id !== id);
  saveState();
  renderRecipes();
}

/* ================================================================
   FILTERING
================================================================ */
function setupRecipeFilter() {
  const filter = document.getElementById("recipeFilter");
  if (!filter) return;
  filter.addEventListener("input", renderRecipes);
}

/* ================================================================
   FILE → BASE64
================================================================ */
function fileToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}
