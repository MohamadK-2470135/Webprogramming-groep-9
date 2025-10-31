import express from "express";
import session from "express-session";
import { InitializeDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipes.js";
import favoriteRoutes from "./routes/favorites.js";
import { Recipe } from "./models/Recipe.js";

/**
 * Main Express Application
 * Recipe Pinterest Web Application
 * 
 * This application provides:
 * - User authentication (register, login, logout)
 * - Recipe management (CRUD operations)
 * - Favorite recipes functionality
 * - Cook mode for step-by-step cooking
 * - Server-side session management
 * - RESTful API architecture
 */

const app = express();
const port = process.env.PORT || 8080;

// Initialize database on startup
// Creates tables if they don't exist
InitializeDatabase();

/**
 * VIEW ENGINE SETUP
 * Using EJS for server-side templating
 */
app.set("view engine", "ejs");

/**
 * MIDDLEWARE CONFIGURATION
 */

// Serve static files from the "public" directory
// This includes CSS, JavaScript, images, etc.
app.use(express.static("public"));

// Parse JSON request bodies
// Required for API endpoints that receive JSON data
app.use(express.json());

// Parse URL-encoded request bodies
// Required for form submissions
app.use(express.urlencoded({ extended: true }));

/**
 * SESSION MIDDLEWARE
 * Manages user sessions for authentication
 * Sessions are stored server-side, only session ID is sent to client
 */
app.use(session({
  // Secret key for signing session ID cookie
  // In production, use environment variable: process.env.SESSION_SECRET
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production-please",
  
  // Don't save session if unmodified
  resave: false,
  
  // Don't create session until something is stored
  saveUninitialized: false,
  
  // Cookie configuration
  cookie: { 
    // Use secure cookies in production (requires HTTPS)
    secure: process.env.NODE_ENV === "production",
    
    // Prevent client-side JavaScript from accessing the cookie
    httpOnly: true,
    
    // Session expires after 24 hours
    maxAge: 24 * 60 * 60 * 1000
  }
}));

/**
 * DEBUG LOGGING MIDDLEWARE
 * Logs all incoming requests with timestamp
 */
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.url} @ ${new Date().toLocaleString("nl-BE")}`
  );
  next();
});

/**
 * API ROUTES
 * All API endpoints are prefixed with /api
 */

// Authentication routes: /api/auth/*
app.use("/api/auth", authRoutes);

// Recipe routes: /api/recipes/*
app.use("/api/recipes", recipeRoutes);

// Favorite routes: /api/favorites/*
app.use("/api/favorites", favoriteRoutes);

/**
 * FRONTEND PAGE ROUTES
 * Serve HTML pages using EJS templates
 */

// Root route - redirect to appropriate page based on auth status
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/recipes");
  } else {
    res.redirect("/login");
  }
});

// Login/Register page
app.get("/login", (req, res) => {
  // If already logged in, redirect to recipes
  if (req.session.userId) {
    return res.redirect("/recipes");
  }
  res.render("auth", { 
    user: null,
    title: "SeMoRecepts – Aanmelden"
  });
});

// Recipes page (requires authentication)
app.get("/recipes", (req, res) => {
  // If not logged in, redirect to login page
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("recipes", { 
    user: {
      id: req.session.userId,
      name: req.session.name,
      email: req.session.email
    },
    title: "SeMoRecepts – Mijn recepten"
  });
});

// Cook mode page (requires authentication)
app.get("/recipes/:id/cook", (req, res) => {
  // If not logged in, redirect to login page
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  // Get recipe from database
  const recipe = Recipe.findById(req.params.id, req.session.userId);

  if (!recipe) {
    return res.status(404).send("Recipe not found");
  }

  res.render("cook", {
    user: {
      id: req.session.userId,
      name: req.session.name,
      email: req.session.email
    },
    recipe: recipe,
    title: `SeMoRecepts – ${recipe.title}`
  });
});

/**
 * ERROR HANDLING MIDDLEWARE
 */

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({ 
    error: "Not found",
    message: "The requested resource was not found" 
  });
});

// Global error handler - must be last middleware
app.use((error, req, res, next) => {
  console.error("Error:", error.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: "An unexpected error occurred" 
  });
});

/**
 * START SERVER
 */
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📁 Database: ./data/database.db`);
  console.log(`🔐 Session secret: ${process.env.SESSION_SECRET ? "✓ (from env)" : "⚠ (using default)"}`);
});