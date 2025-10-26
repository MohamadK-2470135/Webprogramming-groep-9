import { User } from "../models/User.js";
import { body, validationResult } from "express-validator";

/**
 * Authentication Controller
 * Handles user registration, login, and logout
 */

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export const register = [
  // Validation middleware using express-validator
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail()
    .toLowerCase(),
  
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
  
  // Controller logic
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed",
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Email already exists",
          message: "An account with this email already exists" 
        });
      }

      // Create new user (password will be hashed in User.create)
      const userId = User.create(name, email, password);
      
      // Set session
      req.session.userId = userId;
      req.session.email = email;
      req.session.name = name;

      console.log(`✅ New user registered: ${email} (ID: ${userId})`);

      res.json({ 
        success: true,
        message: "Account created successfully",
        user: { id: userId, name, email }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        error: "Registration failed",
        message: "An error occurred during registration" 
      });
    }
  }
];

/**
 * Login existing user
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = [
  // Validation middleware
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail()
    .toLowerCase(),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  
  // Controller logic
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed",
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    try {
      // Find user by email
      const user = User.findByEmail(email);

      // Check if user exists and password is correct
      if (!user || !User.verifyPassword(user, password)) {
        return res.status(401).json({ 
          error: "Invalid credentials",
          message: "Incorrect email or password" 
        });
      }

      // Update last activity
      User.updateActivity(user.id);

      // Set session
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.name = user.name;

      console.log(`✅ User logged in: ${email} (ID: ${user.id})`);

      res.json({ 
        success: true,
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        error: "Login failed",
        message: "An error occurred during login" 
      });
    }
  }
];

/**
 * Logout current user
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  const email = req.session.email;
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ 
        error: "Logout failed",
        message: "An error occurred during logout" 
      });
    }

    console.log(`✅ User logged out: ${email}`);

    res.json({ 
      success: true,
      message: "Logout successful" 
    });
  });
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getCurrentUser = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: "Not authenticated",
      message: "No active session" 
    });
  }

  const user = User.findById(req.session.userId);
  
  if (!user) {
    return res.status(404).json({ 
      error: "User not found",
      message: "Session user no longer exists" 
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
};