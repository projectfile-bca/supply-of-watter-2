import express from "express";
import {
  createSubscription,
  deleteSubscription,
  getMySubscriptions,
  pauseSubscription,
  resumeSubscription,
  runSubscriptionSync
} from "../controllers/subscriptionController.js";
import { requireApprovedDriver, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireApprovedDriver, createSubscription);
router.get("/mine", requireAuth, requireApprovedDriver, getMySubscriptions);
router.patch("/:id/pause", requireAuth, requireApprovedDriver, pauseSubscription);
router.patch("/:id/resume", requireAuth, requireApprovedDriver, resumeSubscription);
router.delete("/:id", requireAuth, requireApprovedDriver, deleteSubscription);
router.post("/sync", requireAuth, requireApprovedDriver, runSubscriptionSync);

export default router;
