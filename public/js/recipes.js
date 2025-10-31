/**
 * Client-side Recipe Management Logic
 * Handles recipe CRUD operations, favorites, search, filtering, and modals
 * Uses Fetch API for all server communication
 */

// Global state
let recipesList = [];
let favoriteIds = [];
let editingRecipeId = null; // Track which recipe is being edited

/**
 * Fetch all recipes from server
 * GET /api/recipes
 */
async function loadRecipes() {
  try {
    const response = await fetch('/api/recipes');
    const data = await response.json();
    
    if (response.ok && data.success) {
      recipesList = data.recipes;
      await loadFavorites(); // Load favorites after recipes
      renderRecipes();
    } else {
      console.error('Failed to load recipes:', data);
    }
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
}

/**
 * Fetch favorite recipe IDs
 * GET /api/favorites
 */
async function loadFavorites() {
  try {
    const response = await fetch('/api/favorites');
    const data = await response.json();
    
    if (response.ok && data.success) {
      favoriteIds = data.favoriteIds;
    } else {
      console.error('Failed to load favorites:', data);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
}

/**
 * Toggle favorite status for a recipe
 * POST /api/favorites/toggle
 */
async function toggleFavorite(recipeId) {
  try {
    const response = await fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipeId })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update local favorite IDs
      if (data.favorited) {
        favoriteIds.push(recipeId);
      } else {
        favoriteIds = favoriteIds.filter(id => id !== recipeId);
      }
      // Re-render to update heart icon
      renderRecipes();
    } else {
      console.error('Failed to toggle favorite:', data);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

/**
 * Parse bulleted list (ingredients)
 * Converts text like "- item1\n- item2" to array ["item1", "item2"]
 */
function parseBulletedList(text) {
  return (text || "")
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.replace(/^[-•]\s*/, ''));
}

/**
 * Parse numbered list (steps)
 * Converts text like "1. step1\n2. step2" to array ["step1", "step2"]
 */
function parseNumberedList(text) {
  return (text || "")
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.replace(/^\d+[\).\s-]?\s*/, ''));
}

/**
 * Convert array to bulleted list text
 */
function arrayToBulletedList(arr) {
  return arr.map(item => `- ${item}`).join('\n');
}

/**
 * Convert array to numbered list text
 */
function arrayToNumberedList(arr) {
  return arr.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

/**
 * Generate HTML for a single recipe card with icon buttons
 */
function pinHTML(r) {
  const img = (r.image_url && r.image_url.trim().length)
    ? `<img src="${r.image_url}" alt="${r.title}" onerror="this.remove()">`
    : "";

  const ingCount = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
  const stepCount = Array.isArray(r.steps) ? r.steps.length : 0;
  const extra = [ingCount ? `${ingCount} ing` : null, stepCount ? `${stepCount} stappen` : null]
    .filter(Boolean)
    .join(" • ");

  const isFavorited = favoriteIds.includes(r.id);

  return `
    <article class="p-pin" data-id="${r.id}">
      <div class="p-media">
        ${img}
      </div>

      <div class="p-body">
        <p class="p-title">${escapeHTML(r.title)}</p>
        <p class="p-meta">
          ${r.category ? r.category + " • " : ""}${r.time || "-"} • ${r.servings || "-"} p${extra ? " • " + extra : ""}
        </p>

        <div class="p-actions-row">
          <button class="p-icon-btn favorite ${isFavorited ? 'favorited' : ''}" 
                  data-id="${r.id}" 
                  title="Favoriet">
            ${isFavorited ? '❤️' : '🤍'}
          </button>
          
          <button class="p-icon-btn cook" 
                  data-id="${r.id}" 
                  title="Kook modus">
            👨‍🍳
          </button>
          
          <button class="p-icon-btn edit" 
                  data-id="${r.id}" 
                  title="Bewerken">
            ✏️
          </button>
          
          ${r.source_url ? `<button class="p-icon-btn link" data-url="${r.source_url}" title="Open bron">🔗</button>` : ""}
          
          <button class="p-icon-btn delete" 
                  data-id="${r.id}" 
                  title="Verwijderen">
            🗑️
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render recipes to the grid
 * Applies search and category filters
 */
function renderRecipes() {
  const q = (document.getElementById('q').value || "").toLowerCase();
  const activeChip = document.querySelector('.p-chip.active')?.textContent || "Alle";

  const filtered = recipesList.filter(r => {
    const matchQ = !q || (r.title || "").toLowerCase().includes(q);
    const matchC = activeChip === "Alle" || (r.category || "").toLowerCase() === activeChip.toLowerCase();
    return matchQ && matchC;
  });

  document.getElementById('grid').innerHTML = filtered.length
    ? filtered.map(r => pinHTML(r)).join("")
    : "<p class='small' style='padding:.75rem'>Nog geen recepten.</p>";
}

/**
 * Create a new recipe
 * POST /api/recipes
 */
async function createRecipe(recipeData) {
  try {
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipeData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Recipe created:', data.recipeId);
      await loadRecipes();
      return true;
    } else {
      console.error('Failed to create recipe:', data);
      alert('Failed to create recipe: ' + (data.message || data.error));
      return false;
    }
  } catch (error) {
    console.error('Error creating recipe:', error);
    alert('Connection error. Please try again.');
    return false;
  }
}

/**
 * Update an existing recipe
 * PUT /api/recipes/:id
 */
async function updateRecipe(recipeId, recipeData) {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipeData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Recipe updated:', recipeId);
      await loadRecipes();
      return true;
    } else {
      console.error('Failed to update recipe:', data);
      alert('Failed to update recipe: ' + (data.message || data.error));
      return false;
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    alert('Connection error. Please try again.');
    return false;
  }
}

/**
 * Delete a recipe
 * DELETE /api/recipes/:id
 */
async function deleteRecipe(id) {
  if (!confirm('Weet je zeker dat je dit recept wilt verwijderen?')) {
    return;
  }

  try {
    const response = await fetch(`/api/recipes/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Recipe deleted:', id);
      await loadRecipes();
    } else {
      console.error('Failed to delete recipe:', data);
      alert('Failed to delete recipe: ' + (data.message || data.error));
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    alert('Connection error. Please try again.');
  }
}

/**
 * Open edit modal with recipe data
 */
function openEditModal(recipeId) {
  const recipe = recipesList.find(r => r.id === recipeId);
  if (!recipe) return;

  // Set editing mode
  editingRecipeId = recipeId;

  // Update modal title
  document.querySelector('#backdrop h2').textContent = 'Recept bewerken';

  // Pre-fill form with existing data
  document.getElementById('title').value = recipe.title || '';
  document.getElementById('time').value = recipe.time || '';
  document.getElementById('servings').value = recipe.servings || 2;
  document.getElementById('tag').value = recipe.category || '';
  document.getElementById('source').value = recipe.source_url || '';
  document.getElementById('image').value = recipe.image_url || '';
  document.getElementById('ingredients').value = arrayToBulletedList(recipe.ingredients || []);
  document.getElementById('steps').value = arrayToNumberedList(recipe.steps || []);
  document.getElementById('notes').value = recipe.notes || '';

  // Change save button text
  document.getElementById('saveBtn').textContent = 'Bijwerken';

  // Show modal
  document.getElementById('backdrop').classList.add('show');
  document.body.classList.add('no-scroll');
}

/**
 * Reset modal to add mode
 */
function resetModal() {
  editingRecipeId = null;
  document.querySelector('#backdrop h2').textContent = 'Nieuw recept';
  document.getElementById('saveBtn').textContent = 'Opslaan';
  clearModalInputs();
}

/**
 * Clear all modal inputs
 */
function clearModalInputs() {
  document.getElementById('title').value = "";
  document.getElementById('time').value = "";
  document.getElementById('source').value = "";
  document.getElementById('image').value = "";
  document.getElementById('tag').value = "";
  document.getElementById('servings').value = 2;
  document.getElementById('ingredients').value = "";
  document.getElementById('steps').value = "";
  document.getElementById('notes').value = "";
  
  // Remove error message if exists
  const errorMsg = document.getElementById('titleError');
  if (errorMsg) errorMsg.remove();
}

/**
 * Validate title field
 */
function validateTitle() {
  const titleInput = document.getElementById('title');
  const titleValue = titleInput.value.trim();
  
  // Remove existing error message
  const existingError = document.getElementById('titleError');
  if (existingError) existingError.remove();
  
  if (!titleValue) {
    // Show error message
    const errorMsg = document.createElement('span');
    errorMsg.id = 'titleError';
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'Je moet recept titel invullen';
    titleInput.parentElement.appendChild(errorMsg);
    titleInput.focus();
    return false;
  }
  
  return true;
}

/**
 * Logout user
 * POST /api/auth/logout
 */
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      window.location.href = '/login';
    } else {
      console.error('Logout failed:', data);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Initialize on page load
loadRecipes();

/**
 * EVENT LISTENERS
 */

// Search input
document.getElementById('q').addEventListener('input', () => renderRecipes());

// Category chips
document.getElementById('chips').addEventListener('click', e => {
  if (e.target.classList.contains('p-chip')) {
    document.querySelectorAll('.p-chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    renderRecipes();
  }
});

// Logout button
document.getElementById('logoutBtn').onclick = logout;

/**
 * DROPDOWN MENU FOR "NIEUW RECEPT"
 */
const modal = document.getElementById('backdrop');
const addBtn = document.getElementById('addBtn');
const addMenu = document.getElementById('addMenu');
const btnAddOwn = document.getElementById('btnAddOwn');
const btnScrapUrl = document.getElementById('btnScrapUrl');

function toggleAddMenu() {
  addMenu.classList.toggle('hidden');
  addBtn.setAttribute('aria-expanded', addMenu.classList.contains('hidden') ? 'false' : 'true');
}

addBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleAddMenu();
});

window.addEventListener('click', (e) => {
  if (!e.target.closest('.p-add-menu')) {
    addMenu.classList.add('hidden');
    addBtn.setAttribute('aria-expanded', 'false');
  }
});

// "Eigen recept" button
btnAddOwn.addEventListener('click', () => {
  addMenu.classList.add('hidden');
  addBtn.setAttribute('aria-expanded', 'false');
  resetModal(); // Reset to add mode
  document.getElementById('backdrop').classList.add('show');
  document.body.classList.add('no-scroll');
});

/**
 * SCRAP URL MODAL (placeholder for future LLM integration)
 */
const scrapBackdrop = document.getElementById('scrapBackdrop');
const scrapUrlInput = document.getElementById('scrapUrl');
const scrapCancelBtn = document.getElementById('scrapCancelBtn');
const scrapSaveBtn = document.getElementById('scrapSaveBtn');

btnScrapUrl.addEventListener('click', () => {
  addMenu.classList.add('hidden');
  addBtn.setAttribute('aria-expanded', 'false');
  scrapBackdrop.classList.add('show');
  document.body.classList.add('no-scroll');
  setTimeout(() => scrapUrlInput?.focus(), 0);
});

scrapBackdrop.addEventListener('click', (e) => {
  if (e.target === scrapBackdrop) {
    scrapBackdrop.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }
});

scrapCancelBtn.addEventListener('click', () => {
  scrapBackdrop.classList.remove('show');
  document.body.classList.remove('no-scroll');
});

scrapSaveBtn.addEventListener('click', () => {
  const url = (scrapUrlInput.value || "").trim();
  if (!url) {
    scrapUrlInput.focus();
    return;
  }
  
  // TODO: Implement LLM scraping in later phase
  alert('URL scraping will be implemented in a later phase using LLM API');
  
  scrapUrlInput.value = "";
  scrapBackdrop.classList.remove('show');
  document.body.classList.remove('no-scroll');
});

/**
 * ADD/EDIT RECIPE MODAL
 */
document.getElementById('cancelBtn').onclick = () => {
  modal.classList.remove('show');
  document.body.classList.remove('no-scroll');
  resetModal();
};

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.classList.remove('no-scroll');
    resetModal();
  }
});

// Save or update recipe
document.getElementById('saveBtn').onclick = async () => {
  // Validate title (ONLY MANDATORY FIELD)
  if (!validateTitle()) {
    return;
  }

  const recipeData = {
    title: document.getElementById('title').value.trim(),
    time: document.getElementById('time').value || null,
    servings: parseInt(document.getElementById('servings').value) || 2,
    category: document.getElementById('tag').value || null,
    source_url: document.getElementById('source').value || null,
    image_url: document.getElementById('image').value || null,
    ingredients: parseBulletedList(document.getElementById('ingredients').value),
    steps: parseNumberedList(document.getElementById('steps').value),
    notes: document.getElementById('notes').value.trim() || null
  };

  let success;
  if (editingRecipeId) {
    // Update existing recipe
    success = await updateRecipe(editingRecipeId, recipeData);
  } else {
    // Create new recipe
    success = await createRecipe(recipeData);
  }

  if (success) {
    // Close modal
    modal.classList.remove('show');
    document.body.classList.remove('no-scroll');
    resetModal();
  }
};

/**
 * RECIPE DETAIL MODAL
 */
const gridEl = document.getElementById('grid');
const detailBackdrop = document.getElementById('detailBackdrop');
const detailModal = document.getElementById('detailModal');

// Delegate clicks inside the grid
gridEl.addEventListener('click', (e) => {
  // Favorite button
  const favoriteBtn = e.target.closest('.p-icon-btn.favorite');
  if (favoriteBtn) {
    const id = favoriteBtn.getAttribute('data-id');
    if (id) toggleFavorite(id);
    e.stopPropagation();
    return;
  }

  // Cook button
  const cookBtn = e.target.closest('.p-icon-btn.cook');
  if (cookBtn) {
    const id = cookBtn.getAttribute('data-id');
    const recipe = recipesList.find(r => r.id === id);
    
    // Validate recipe has ingredients and steps
    const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
    const hasSteps = recipe.steps && recipe.steps.length > 0;
    
    if (!hasIngredients && !hasSteps) {
      alert('Je moet eerst ingrediënten en kookstappen toevoegen voordat je kunt beginnen met koken.');
    } else if (!hasIngredients) {
      alert('Je moet eerst ingrediënten toevoegen voordat je kunt beginnen met koken.');
    } else if (!hasSteps) {
      alert('Je moet eerst kookstappen toevoegen voordat je kunt beginnen met koken.');
    } else {
      // Navigate to cook mode
      window.location.href = `/recipes/${id}/cook`;
    }
    e.stopPropagation();
    return;
  }

  // Edit button
  const editBtn = e.target.closest('.p-icon-btn.edit');
  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    if (id) openEditModal(id);
    e.stopPropagation();
    return;
  }

  // Link/Source button
  const linkBtn = e.target.closest('.p-icon-btn.link');
  if (linkBtn) {
    const url = linkBtn.getAttribute('data-url');
    if (url) window.open(url, '_blank', 'noopener');
    e.stopPropagation();
    return;
  }

  // Delete button
  const deleteBtn = e.target.closest('.p-icon-btn.delete');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    if (id) deleteRecipe(id);
    e.stopPropagation();
    return;
  }

  // Click on card: open detail modal
  const card = e.target.closest('.p-pin');
  if (!card) return;

  const id = card.getAttribute('data-id');
  const recipe = recipesList.find(r => r.id === id);
  if (recipe) openRecipeDetail(recipe);
});

function openRecipeDetail(r) {
  const hasImg = r.image_url && r.image_url.trim().length;
  const ing = Array.isArray(r.ingredients) ? r.ingredients : [];
  const steps = Array.isArray(r.steps) ? r.steps : [];
  const tagPart = r.category ? r.category + " • " : "";
  const meta = `${tagPart}${r.time || "-"} • ${r.servings || "-"} p`;

  const ingredientsHTML =
    ing.length
      ? `<ul class="p-detail-list">${ing.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>`
      : `<p class="small">Geen ingrediënten toegevoegd.</p>`;

  const stepsHTML =
    steps.length
      ? `<ol class="p-detail-list">${steps.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ol>`
      : `<p class="small">Geen stappen toegevoegd.</p>`;

  const notesHTML =
    (r.notes && r.notes.trim().length)
      ? `<div class="p-detail-notes">${escapeHTML(r.notes)}</div>`
      : `<p class="small">Geen notities.</p>`;

  detailModal.innerHTML = `
    <h2>${escapeHTML(r.title)}</h2>
    <div class="p-detail-content">
      ${hasImg ? `<div class="p-detail-media"><img src="${r.image_url}" alt="${escapeAttr(r.title)}" onerror="this.remove()"></div>` : ""}
      <div class="p-detail-meta">${meta}</div>

      <div class="p-detail-sections">
        <section class="p-detail-section">
          <h3>Ingrediënten</h3>
          ${ingredientsHTML}
        </section>

        <section class="p-detail-section">
          <h3>Stappen</h3>
          ${stepsHTML}
        </section>

        <section class="p-detail-section">
          <h3>Notities</h3>
          ${notesHTML}
        </section>
      </div>
    </div>
    <div class="p-modal-footer">
      <button class="btn" id="detailCloseBtn">Sluiten</button>
      ${r.source_url ? `<button class="btn primary" id="detailOpenSourceBtn">🔗 Open bron</button>` : ""}
    </div>
  `;

  detailModal.querySelector('#detailCloseBtn')?.addEventListener('click', closeRecipeDetail);
  detailModal.querySelector('#detailOpenSourceBtn')?.addEventListener('click', () => {
    if (r.source_url) window.open(r.source_url, '_blank', 'noopener');
  });

  detailBackdrop.classList.add('show');
  document.body.classList.add('no-scroll');
}

detailBackdrop.addEventListener('click', (e) => {
  if (e.target === detailBackdrop) closeRecipeDetail();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detailBackdrop.classList.contains('show')) {
    closeRecipeDetail();
  }
});

function closeRecipeDetail() {
  detailBackdrop.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

/**
 * UTILITY FUNCTIONS
 */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}