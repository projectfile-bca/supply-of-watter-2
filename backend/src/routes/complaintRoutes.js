import express from "express";
import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";
import { requireApprovedDriver, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireApprovedDriver, createComplaint);
router.get("/mine", requireAuth, requireApprovedDriver, getMyComplaints);

export default router;
