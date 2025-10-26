/**
 * Client-side Recipe Management Logic
 * Handles recipe CRUD operations, search, filtering, and modals
 * Uses Fetch API for all server communication
 */

// Global state
let recipesList = [];

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
      renderRecipes();
    } else {
      console.error('Failed to load recipes:', data);
    }
  } catch (error) {
    console.error('Error loading recipes:', error);
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
 * Generate HTML for a single recipe card
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
          ${r.source_url ? `<button class="btn small js-open-source" title="Open bron" data-url="${r.source_url}">↗ Open bron</button>` : ""}
          <button class="btn small p-save">Bewaar</button>
          <button class="btn small js-delete" data-id="${r.id}">Verwijderen</button>
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
      // Reload recipes from server
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
 * Delete a recipe
 * DELETE /api/recipes/:id
 */
async function deleteRecipe(id) {
  if (!confirm('Are you sure you want to delete this recipe?')) {
    return;
  }

  try {
    const response = await fetch(`/api/recipes/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Recipe deleted:', id);
      // Reload recipes from server
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
 * ADD RECIPE MODAL
 */
document.getElementById('cancelBtn').onclick = () => {
  modal.classList.remove('show');
  document.body.classList.remove('no-scroll');
};

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }
});

// Save new recipe
document.getElementById('saveBtn').onclick = async () => {
  const recipeData = {
    title: document.getElementById('title').value.trim(),
    time: document.getElementById('time').value,
    servings: parseInt(document.getElementById('servings').value) || 2,
    category: document.getElementById('tag').value,
    source_url: document.getElementById('source').value,
    image_url: document.getElementById('image').value,
    ingredients: parseBulletedList(document.getElementById('ingredients').value),
    steps: parseNumberedList(document.getElementById('steps').value),
    notes: document.getElementById('notes').value.trim()
  };

  // Basic validation
  if (!recipeData.title) {
    document.getElementById('title').focus();
    return;
  }

  // Create recipe via API
  const success = await createRecipe(recipeData);

  if (success) {
    // Close modal
    modal.classList.remove('show');
    document.body.classList.remove('no-scroll');

    // Clear inputs
    document.getElementById('title').value = "";
    document.getElementById('time').value = "";
    document.getElementById('source').value = "";
    document.getElementById('image').value = "";
    document.getElementById('tag').value = "";
    document.getElementById('servings').value = 2;
    document.getElementById('ingredients').value = "";
    document.getElementById('steps').value = "";
    document.getElementById('notes').value = "";
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
  // "Open bron" button
  const sourceBtn = e.target.closest('.js-open-source');
  if (sourceBtn) {
    const url = sourceBtn.getAttribute('data-url');
    if (url) window.open(url, '_blank', 'noopener');
    e.stopPropagation();
    return;
  }

  // Delete button
  const deleteBtn = e.target.closest('.js-delete');
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
      ${r.source_url ? `<button class="btn primary" id="detailOpenSourceBtn">↗ Open bron</button>` : ""}
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