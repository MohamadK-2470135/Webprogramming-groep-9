import db from "../db.js";

/**
 * Favorite Model
 * Handles all database operations related to favorited recipes
 */
export class Favorite {
  /**
   * Add a recipe to favorites
   * @param {number} userId - User ID
   * @param {string} recipeId - Recipe UUID
   * @returns {boolean} - True if added, false if already favorited
   */
  static add(userId, recipeId) {
    try {
      const stmt = db.prepare(`
        INSERT INTO favorites (user_id, recipe_id)
        VALUES (?, ?)
      `);
      stmt.run(userId, recipeId);
      return true;
    } catch (error) {
      // If unique constraint fails, recipe is already favorited
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Remove a recipe from favorites
   * @param {number} userId - User ID
   * @param {string} recipeId - Recipe UUID
   * @returns {boolean} - True if removed, false if not found
   */
  static remove(userId, recipeId) {
    const stmt = db.prepare(`
      DELETE FROM favorites 
      WHERE user_id = ? AND recipe_id = ?
    `);
    const result = stmt.run(userId, recipeId);
    return result.changes > 0;
  }

  /**
   * Check if a recipe is favorited by user
   * @param {number} userId - User ID
   * @param {string} recipeId - Recipe UUID
   * @returns {boolean} - True if favorited, false otherwise
   */
  static isFavorited(userId, recipeId) {
    const stmt = db.prepare(`
      SELECT 1 FROM favorites 
      WHERE user_id = ? AND recipe_id = ?
    `);
    return !!stmt.get(userId, recipeId);
  }

  /**
   * Get all favorited recipe IDs for a user
   * @param {number} userId - User ID
   * @returns {array} - Array of recipe IDs
   */
  static getFavoriteIds(userId) {
    const stmt = db.prepare(`
      SELECT recipe_id FROM favorites 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId);
    return rows.map(row => row.recipe_id);
  }

  /**
   * Get all favorited recipes with full details for a user
   * @param {number} userId - User ID
   * @returns {array} - Array of recipe objects
   */
  static getFavoriteRecipes(userId) {
    const stmt = db.prepare(`
      SELECT r.* FROM recipes r
      INNER JOIN favorites f ON r.id = f.recipe_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `);
    
    const recipes = stmt.all(userId);
    
    // Parse JSON fields
    return recipes.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      is_scraped: Boolean(r.is_scraped)
    }));
  }
}