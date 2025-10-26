import express from "express";
import { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe,
  searchRecipes 
} from "../controllers/recipeController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Recipe Routes
 * Base path: /api/recipes
 * All routes require authentication
 */

// Apply authentication middleware to all recipe routes
router.use(requireAuth);

// GET /api/recipes - Get all recipes for current user
router.get("/", getAllRecipes);

// GET /api/recipes/search?q=query - Search recipes
router.get("/search", searchRecipes);

// GET /api/recipes/:id - Get single recipe by ID
router.get("/:id", getRecipeById);

// POST /api/recipes - Create new recipe
router.post("/", createRecipe);

// PUT /api/recipes/:id - Update existing recipe
router.put("/:id", updateRecipe);

// DELETE /api/recipes/:id - Delete recipe
router.delete("/:id", deleteRecipe);

export default router;