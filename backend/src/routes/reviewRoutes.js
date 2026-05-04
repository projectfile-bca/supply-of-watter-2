import express from "express";
import { createReview, getMyDriverReviews } from "../controllers/reviewController.js";
import { requireApprovedDriver, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "reviews-ok" });
});

router.post("/", requireAuth, requireApprovedDriver, createReview);
router.get("/driver/mine", requireAuth, requireApprovedDriver, getMyDriverReviews);

export default router;
