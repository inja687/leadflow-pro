import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require JWT authentication
router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
