import express from "express";
import {
  register,
  login,
  getProfile,
  changePassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Routes
router.get("/profile", protect, getProfile);
router.put("/change-password", protect, changePassword);

export default router;