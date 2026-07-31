import express from "express";
import { submitPublicLead } from "../controllers/leadController.js";

const router = express.Router();

// POST /api/public/leads — No auth middleware, no JWT required
router.post("/leads", submitPublicLead);

export default router;
