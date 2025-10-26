import express from "express";
import { register, login, logout, getCurrentUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Create new user account
router.post("/register", register);

// POST /api/auth/login - Login existing user
router.post("/login", login);

// POST /api/auth/logout - Logout current user
router.post("/logout", logout);

// GET /api/auth/me - Get current user info (requires authentication)
router.get("/me", requireAuth, getCurrentUser);

export default router;