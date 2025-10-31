import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";

// Ensure data directory exists for persistent storage
const dataDir = "./data";
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Create database connection
// Using WAL mode for better concurrency and performance
const db = new Database("./data/database.db", { verbose: console.log });

/**
 * Initialize database with required tables and indexes
 * This function creates:
 * - users table: stores user authentication data
 * - recipes table: stores recipe information with JSON fields for ingredients/steps
 * - favorites table: stores user's favorited recipes
 * - sessions table: stores express-session data
 */
export function InitializeDatabase() {
  // Configure SQLite pragmas for optimal performance and safety
  db.pragma("journal_mode = WAL;");        // Write-Ahead Logging for better concurrency
  db.pragma("busy_timeout = 5000;");       // Wait up to 5 seconds if database is locked
  db.pragma("synchronous = NORMAL;");      // Balance between safety and speed
  db.pragma("cache_size = 1000000000;");   // Large cache for better performance
  db.pragma("foreign_keys = true;");       // Enable foreign key constraints
  db.pragma("temp_store = memory;");       // Store temporary tables in memory

  // Create all tables in a single transaction for atomicity
  db.exec(`
    -- Users table: stores user account information
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    ) STRICT;

    -- Index for fast email lookups during login
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Recipes table: stores recipe information
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      time TEXT,
      servings INTEGER DEFAULT 2,
      category TEXT,
      source_url TEXT,
      image_url TEXT,
      image_path TEXT,
      ingredients TEXT NOT NULL,
      steps TEXT NOT NULL,
      notes TEXT,
      is_scraped INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) STRICT;

    -- Indexes for efficient recipe queries
    CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
    CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
    CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);

    -- Favorites table: stores user's favorited recipes
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipe_id TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      UNIQUE(user_id, recipe_id)
    ) STRICT;

    -- Indexes for efficient favorite queries
    CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON favorites(recipe_id);

    -- Sessions table: stores express-session data
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired INTEGER NOT NULL
    ) STRICT;

    -- Index for cleaning up expired sessions
    CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);
  `);

  console.log("✅ Database initialized successfully");
}

export default db;