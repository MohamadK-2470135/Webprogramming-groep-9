import db from "../db.js";
import { randomUUID } from "crypto";

/**
 * Recipe Model
 * Handles all database operations related to recipes
 * Stores ingredients and steps as JSON strings
 */
export class Recipe {
  /**
   * Create a new recipe
   * @param {number} userId - ID of the user creating the recipe
   * @param {object} recipeData - Recipe data object
   * @returns {string} - The UUID of the newly created recipe
   */
  static create(userId, recipeData) {
    const id = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO recipes (
        id, user_id, title, time, servings, category,
        source_url, image_url, image_path, ingredients,
        steps, notes, is_scraped
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      recipeData.title,
      recipeData.time || null,
      recipeData.servings || 2,
      recipeData.category || null,
      recipeData.source_url || null,
      recipeData.image_url || null,
      recipeData.image_path || null,
      JSON.stringify(recipeData.ingredients || []),
      JSON.stringify(recipeData.steps || []),
      recipeData.notes || null,
      recipeData.is_scraped ? 1 : 0
    );

    return id;
  }

  /**
   * Get all recipes for a specific user
   * @param {number} userId - User ID
   * @returns {array} - Array of recipe objects
   */
  static findByUserId(userId) {
    const stmt = db.prepare(`
      SELECT * FROM recipes 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    
    const recipes = stmt.all(userId);
    
    // Parse JSON fields back to arrays
    return recipes.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      is_scraped: Boolean(r.is_scraped)
    }));
  }

  /**
   * Get a single recipe by ID
   * @param {string} id - Recipe UUID
   * @param {number} userId - User ID (for authorization check)
   * @returns {object|undefined} - Recipe object or undefined if not found
   */
  static findById(id, userId) {
    const stmt = db.prepare(`
      SELECT * FROM recipes 
      WHERE id = ? AND user_id = ?
    `);
    
    const recipe = stmt.get(id, userId);
    
    if (!recipe) return undefined;
    
    // Parse JSON fields
    return {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      steps: JSON.parse(recipe.steps),
      is_scraped: Boolean(recipe.is_scraped)
    };
  }

  /**
   * Update an existing recipe
   * @param {string} id - Recipe UUID
   * @param {number} userId - User ID (for authorization check)
   * @param {object} recipeData - Updated recipe data
   * @returns {boolean} - True if updated, false if not found
   */
  static update(id, userId, recipeData) {
    const stmt = db.prepare(`
      UPDATE recipes SET
        title = ?,
        time = ?,
        servings = ?,
        category = ?,
        source_url = ?,
        image_url = ?,
        image_path = ?,
        ingredients = ?,
        steps = ?,
        notes = ?,
        updated_at = unixepoch()
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(
      recipeData.title,
      recipeData.time || null,
      recipeData.servings || 2,
      recipeData.category || null,
      recipeData.source_url || null,
      recipeData.image_url || null,
      recipeData.image_path || null,
      JSON.stringify(recipeData.ingredients || []),
      JSON.stringify(recipeData.steps || []),
      recipeData.notes || null,
      id,
      userId
    );

    return result.changes > 0;
  }

  /**
   * Delete a recipe
   * @param {string} id - Recipe UUID
   * @param {number} userId - User ID (for authorization check)
   * @returns {boolean} - True if deleted, false if not found
   */
  static delete(id, userId) {
    const stmt = db.prepare("DELETE FROM recipes WHERE id = ? AND user_id = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  /**
   * Search recipes by title
   * @param {number} userId - User ID
   * @param {string} query - Search query
   * @returns {array} - Array of matching recipe objects
   */
  static search(userId, query) {
    const stmt = db.prepare(`
      SELECT * FROM recipes 
      WHERE user_id = ? AND title LIKE ?
      ORDER BY created_at DESC
    `);
    
    const recipes = stmt.all(userId, `%${query}%`);
    
    return recipes.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      is_scraped: Boolean(r.is_scraped)
    }));
  }

  /**
   * Filter recipes by category
   * @param {number} userId - User ID
   * @param {string} category - Category name
   * @returns {array} - Array of recipe objects in that category
   */
  static findByCategory(userId, category) {
    const stmt = db.prepare(`
      SELECT * FROM recipes 
      WHERE user_id = ? AND category = ?
      ORDER BY created_at DESC
    `);
    
    const recipes = stmt.all(userId, category);
    
    return recipes.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      is_scraped: Boolean(r.is_scraped)
    }));
  }
}