import { Favorite } from "../models/Favorite.js";

/**
 * Favorite Controller
 * Handles favorite/unfavorite operations
 */

/**
 * Toggle favorite status for a recipe
 * POST /api/favorites/toggle
 * Body: { recipeId }
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    if (!recipeId) {
      return res.status(400).json({
        error: "Recipe ID is required"
      });
    }

    // Check if already favorited
    const isFavorited = Favorite.isFavorited(req.session.userId, recipeId);

    if (isFavorited) {
      // Remove from favorites
      Favorite.remove(req.session.userId, recipeId);
      console.log(`✅ Recipe unfavorited: ${recipeId} by user ${req.session.userId}`);
      
      res.json({
        success: true,
        favorited: false,
        message: "Recipe removed from favorites"
      });
    } else {
      // Add to favorites
      Favorite.add(req.session.userId, recipeId);
      console.log(`✅ Recipe favorited: ${recipeId} by user ${req.session.userId}`);
      
      res.json({
        success: true,
        favorited: true,
        message: "Recipe added to favorites"
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      error: "Failed to toggle favorite",
      message: "An error occurred while updating favorites"
    });
  }
};

/**
 * Get all favorite recipe IDs for current user
 * GET /api/favorites
 */
export const getFavorites = async (req, res) => {
  try {
    const favoriteIds = Favorite.getFavoriteIds(req.session.userId);
    
    res.json({
      success: true,
      favoriteIds: favoriteIds
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      error: "Failed to fetch favorites",
      message: "An error occurred while fetching favorites"
    });
  }
};

/**
 * Get all favorited recipes with full details
 * GET /api/favorites/recipes
 */
export const getFavoriteRecipes = async (req, res) => {
  try {
    const recipes = Favorite.getFavoriteRecipes(req.session.userId);
    
    res.json({
      success: true,
      recipes: recipes
    });
  } catch (error) {
    console.error("Get favorite recipes error:", error);
    res.status(500).json({
      error: "Failed to fetch favorite recipes",
      message: "An error occurred while fetching favorite recipes"
    });
  }
};