import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getDashboardStats,
  getDashboardActivities,
  getPersonalPerformance,
  assignLead,
  addNote,
  getMembers,
  getActivities,
} from "../controllers/leadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Dashboard Statistics (controller handles role-based filtering)
// ⚠️ অবশ্যই "/:id" এর আগে থাকবে
router.get("/dashboard/stats", protect, getDashboardStats);
router.get("/dashboard/activities", protect, getDashboardActivities);
router.get("/dashboard/performance", protect, getPersonalPerformance);

// Get Members List (Admin Only — for assign dropdown)
router.get("/members", protect, authorize("admin"), getMembers);

// Create Lead (Admin Only) & Get All Leads (role-filtered in controller)
router
  .route("/")
  .post(protect, authorize("admin"), createLead)
  .get(protect, getLeads);

// Assign Lead (Admin Only)
router.put("/:id/assign", protect, authorize("admin"), assignLead);

// Add Note to Lead (both roles — controller checks assignment for members)
router.post("/:id/notes", protect, addNote);

// Get Single Lead, Update Lead & Delete Lead (Admin Only)
router
  .route("/:id")
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, authorize("admin"), deleteLead);

export default router;
