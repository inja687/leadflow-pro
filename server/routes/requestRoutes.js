import express from "express";
import {
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All lead request routes are restricted to Admin role
router.use(protect, authorize("admin"));

router.route("/")
  .get(getRequests);

router.route("/:id")
  .get(getRequestById);

router.post("/:id/approve", approveRequest);
router.post("/:id/reject", rejectRequest);

export default router;
