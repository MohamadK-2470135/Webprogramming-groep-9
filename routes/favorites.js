import express from "express";
import { toggleFavorite, getFavorites, getFavoriteRecipes } from "../controllers/favoriteController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Favorite Routes
 * Base path: /api/favorites
 * All routes require authentication
 */

// Apply authentication middleware to all favorite routes
router.use(requireAuth);

// POST /api/favorites/toggle - Toggle favorite status
router.post("/toggle", toggleFavorite);

// GET /api/favorites - Get favorite recipe IDs
router.get("/", getFavorites);

// GET /api/favorites/recipes - Get favorite recipes with full details
router.get("/recipes", getFavoriteRecipes);

export default router;