import db from "../db.js";
import bcrypt from "bcrypt";

/**
 * User Model
 * Handles all database operations related to users
 * Uses bcrypt for secure password hashing
 */
export class User {
  /**
   * Create a new user with hashed password
   * @param {string} name - User's display name
   * @param {string} email - User's email (must be unique)
   * @param {string} password - Plain text password (will be hashed)
   * @returns {number} - The ID of the newly created user
   */
  static create(name, email, password) {
    // Hash password with bcrypt (salt rounds: 10)
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(name, email, passwordHash);
    return result.lastInsertRowid;
  }

  /**
   * Find a user by email address
   * @param {string} email - Email to search for
   * @returns {object|undefined} - User object or undefined if not found
   */
  static findByEmail(email) {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email);
  }

  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {object|undefined} - User object or undefined if not found
   */
  static findById(id) {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return stmt.get(id);
  }

  /**
   * Verify a password against the stored hash
   * @param {object} user - User object with password_hash field
   * @param {string} password - Plain text password to verify
   * @returns {boolean} - True if password matches, false otherwise
   */
  static verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password_hash);
  }

  /**
   * Update user's last activity timestamp
   * @param {number} id - User ID
   */
  static updateActivity(id) {
    const stmt = db.prepare("UPDATE users SET updated_at = unixepoch() WHERE id = ?");
    stmt.run(id);
  }
}