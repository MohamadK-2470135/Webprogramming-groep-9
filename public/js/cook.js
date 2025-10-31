/**
 * Cook Mode JavaScript
 * Handles step-by-step cooking interface
 */

// Get recipe data from window object (passed from EJS)
const recipe = window.recipeData;

// Check if recipe has required data
const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
const hasSteps = recipe.steps && recipe.steps.length > 0;

// DOM elements
const cookOverview = document.getElementById('cookOverview');
const cookSteps = document.getElementById('cookSteps');
const startCookingBtn = document.getElementById('startCookingBtn');
const exitCookBtn = document.getElementById('exitCookBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const stepNumber = document.getElementById('stepNumber');
const stepText = document.getElementById('stepText');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Current step index (0-based)
let currentStepIndex = 0;
const totalSteps = recipe.steps ? recipe.steps.length : 0;

/**
 * Start cooking mode
 * Validates that recipe has ingredients and steps before starting
 */
function startCooking() {
  // Validate recipe has required data
  if (!hasIngredients && !hasSteps) {
    alert('Je moet eerst ingrediënten en kookstappen toevoegen voordat je kunt beginnen met koken.');
    return;
  }
  
  if (!hasIngredients) {
    alert('Je moet eerst ingrediënten toevoegen voordat je kunt beginnen met koken.');
    return;
  }
  
  if (!hasSteps) {
    alert('Je moet eerst kookstappen toevoegen voordat je kunt beginnen met koken.');
    return;
  }

  // Hide overview, show steps
  cookOverview.classList.add('hidden');
  cookSteps.classList.remove('hidden');

  // Initialize to first step
  currentStepIndex = 0;
  displayStep(currentStepIndex);
}

/**
 * Exit cooking mode
 * Returns to overview
 */
function exitCooking() {
  // Show overview, hide steps
  cookSteps.classList.add('hidden');
  cookOverview.classList.remove('hidden');

  // Reset to first step
  currentStepIndex = 0;
}

/**
 * Display a specific step
 * @param {number} stepIndex - Index of step to display (0-based)
 */
function displayStep(stepIndex) {
  // Update step number and text
  stepNumber.textContent = `Stap ${stepIndex + 1}`;
  stepText.textContent = recipe.steps[stepIndex];

  // Update progress bar
  const progressPercentage = ((stepIndex + 1) / totalSteps) * 100;
  progressFill.style.width = `${progressPercentage}%`;
  progressText.textContent = `${stepIndex + 1} / ${totalSteps}`;

  // Update navigation buttons
  // Disable "Previous" button on first step
  prevStepBtn.disabled = stepIndex === 0;
  
  // Change "Next" button text on last step
  if (stepIndex === totalSteps - 1) {
    nextStepBtn.textContent = 'Klaar! ✓';
  } else {
    nextStepBtn.textContent = 'Volgende →';
  }
}

/**
 * Go to previous step
 */
function previousStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    displayStep(currentStepIndex);
  }
}

/**
 * Go to next step or finish
 */
function nextStep() {
  if (currentStepIndex < totalSteps - 1) {
    // Go to next step
    currentStepIndex++;
    displayStep(currentStepIndex);
  } else {
    // Last step - finish cooking
    if (confirm('Gefeliciteerd! Je bent klaar met koken. Wil je terug naar het overzicht?')) {
      exitCooking();
    }
  }
}

/**
 * EVENT LISTENERS
 */

// Start cooking button
startCookingBtn.addEventListener('click', startCooking);

// Exit cooking button
exitCookBtn.addEventListener('click', exitCooking);

// Previous step button
prevStepBtn.addEventListener('click', previousStep);

// Next step button
nextStepBtn.addEventListener('click', nextStep);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Only handle keyboard if in step mode
  if (!cookSteps.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft' && !prevStepBtn.disabled) {
      previousStep();
    } else if (e.key === 'ArrowRight') {
      nextStep();
    } else if (e.key === 'Escape') {
      exitCooking();
    }
  }
});