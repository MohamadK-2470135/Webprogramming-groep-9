import { Recipe } from "../models/Recipe.js";
import { body, validationResult } from "express-validator";

/**
 * Recipe Controller
 * Handles all recipe CRUD operations
 */

/**
 * Get all recipes for current user
 * GET /api/recipes
 */
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = Recipe.findByUserId(req.session.userId);
    
    res.json({
      success: true,
      recipes: recipes
    });
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({ 
      error: "Failed to fetch recipes",
      message: "An error occurred while fetching recipes" 
    });
  }
};

/**
 * Get a single recipe by ID
 * GET /api/recipes/:id
 */
export const getRecipeById = async (req, res) => {
  try {
    const recipe = Recipe.findById(req.params.id, req.session.userId);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: "Recipe not found",
        message: "Recipe does not exist or you don't have permission to view it" 
      });
    }

    res.json({
      success: true,
      recipe: recipe
    });
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(500).json({ 
      error: "Failed to fetch recipe",
      message: "An error occurred while fetching the recipe" 
    });
  }
};

/**
 * Create a new recipe
 * POST /api/recipes
 */
export const createRecipe = [
  // Validation middleware
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),
  
  body("time")
    .optional()
    .trim(),
  
  body("servings")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Servings must be between 1 and 100"),
  
  body("category")
    .optional()
    .trim(),
  
  body("source_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Source must be a valid URL"),
  
  body("image_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image URL must be a valid URL"),
  
  body("ingredients")
    .isArray()
    .withMessage("Ingredients must be an array"),
  
  body("steps")
    .isArray()
    .withMessage("Steps must be an array"),
  
  body("notes")
    .optional()
    .trim(),
  
  // Controller logic
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed",
        errors: errors.array() 
      });
    }

    try {
      const recipeData = {
        title: req.body.title,
        time: req.body.time,
        servings: req.body.servings,
        category: req.body.category,
        source_url: req.body.source_url,
        image_url: req.body.image_url,
        image_path: req.body.image_path,
        ingredients: req.body.ingredients,
        steps: req.body.steps,
        notes: req.body.notes,
        is_scraped: req.body.is_scraped || false
      };

      const recipeId = Recipe.create(req.session.userId, recipeData);

      console.log(`✅ Recipe created: ${recipeData.title} (ID: ${recipeId})`);

      res.status(201).json({
        success: true,
        message: "Recipe created successfully",
        recipeId: recipeId
      });
    } catch (error) {
      console.error("Create recipe error:", error);
      res.status(500).json({ 
        error: "Failed to create recipe",
        message: "An error occurred while creating the recipe" 
      });
    }
  }
];

/**
 * Update an existing recipe
 * PUT /api/recipes/:id
 */
export const updateRecipe = [
  // Validation middleware (same as create)
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),
  
  body("ingredients")
    .isArray()
    .withMessage("Ingredients must be an array"),
  
  body("steps")
    .isArray()
    .withMessage("Steps must be an array"),
  
  // Controller logic
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed",
        errors: errors.array() 
      });
    }

    try {
      const recipeData = {
        title: req.body.title,
        time: req.body.time,
        servings: req.body.servings,
        category: req.body.category,
        source_url: req.body.source_url,
        image_url: req.body.image_url,
        image_path: req.body.image_path,
        ingredients: req.body.ingredients,
        steps: req.body.steps,
        notes: req.body.notes
      };

      const updated = Recipe.update(req.params.id, req.session.userId, recipeData);

      if (!updated) {
        return res.status(404).json({ 
          error: "Recipe not found",
          message: "Recipe does not exist or you don't have permission to update it" 
        });
      }

      console.log(`✅ Recipe updated: ${recipeData.title} (ID: ${req.params.id})`);

      res.json({
        success: true,
        message: "Recipe updated successfully"
      });
    } catch (error) {
      console.error("Update recipe error:", error);
      res.status(500).json({ 
        error: "Failed to update recipe",
        message: "An error occurred while updating the recipe" 
      });
    }
  }
];

/**
 * Delete a recipe
 * DELETE /api/recipes/:id
 */
export const deleteRecipe = async (req, res) => {
  try {
    const deleted = Recipe.delete(req.params.id, req.session.userId);

    if (!deleted) {
      return res.status(404).json({ 
        error: "Recipe not found",
        message: "Recipe does not exist or you don't have permission to delete it" 
      });
    }

    console.log(`✅ Recipe deleted: ID ${req.params.id}`);

    res.json({
      success: true,
      message: "Recipe deleted successfully"
    });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ 
      error: "Failed to delete recipe",
      message: "An error occurred while deleting the recipe" 
    });
  }
};

/**
 * Search recipes
 * GET /api/recipes/search?q=query
 */
export const searchRecipes = async (req, res) => {
  try {
    const query = req.query.q || "";
    const recipes = Recipe.search(req.session.userId, query);

    res.json({
      success: true,
      recipes: recipes
    });
  } catch (error) {
    console.error("Search recipes error:", error);
    res.status(500).json({ 
      error: "Failed to search recipes",
      message: "An error occurred while searching recipes" 
    });
  }
};