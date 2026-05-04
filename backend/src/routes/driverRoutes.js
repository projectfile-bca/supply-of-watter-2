import express from "express";
import {
  applyDriver,
  getPublicDrivers,
  updateDriverAvailability
} from "../controllers/driverController.js";
import { requireApprovedDriver, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/apply", applyDriver);
router.get("/public", requireAuth, requireApprovedDriver, getPublicDrivers);
router.patch("/availability", requireAuth, requireApprovedDriver, updateDriverAvailability);

export default router;
