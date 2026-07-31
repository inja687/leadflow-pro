import express from "express";
import {
  getAllMembers,
  getMemberById,
  updateMember,
  toggleMemberStatus,
  createMember,
} from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All member management endpoints are Admin only
router.use(protect, authorize("admin"));

router.route("/")
  .get(getAllMembers)
  .post(createMember);

router.route("/:id")
  .get(getMemberById)
  .put(updateMember);

router.patch("/:id/status", toggleMemberStatus);

export default router;
