import express from "express";
import { getAdminAnalytics, getAdminProfile, updateAdminProfile } from "../controllers/adminController.js";
import { getAllComplaints, updateComplaint } from "../controllers/complaintController.js";
import { approveDriver, getApprovedDrivers, getPendingDrivers } from "../controllers/driverController.js";
import { getAllReviews } from "../controllers/reviewController.js";
import {
  approveOrderDriverRequest,
  generateOrderDeliveryKey,
  getAllOrders
} from "../controllers/orderController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", requireAuth, requireAdmin, getAdminProfile);
router.patch("/profile", requireAuth, requireAdmin, updateAdminProfile);
router.get("/analytics", requireAuth, requireAdmin, getAdminAnalytics);
router.get("/drivers/pending", requireAuth, requireAdmin, getPendingDrivers);
router.get("/drivers/approved", requireAuth, requireAdmin, getApprovedDrivers);
router.patch("/drivers/:id/approve", requireAuth, requireAdmin, approveDriver);
router.get("/orders", requireAuth, requireAdmin, getAllOrders);
router.patch("/orders/:id/approve-request", requireAuth, requireAdmin, approveOrderDriverRequest);
router.patch("/orders/:id/generate-delivery-key", requireAuth, requireAdmin, generateOrderDeliveryKey);
router.get("/complaints", requireAuth, requireAdmin, getAllComplaints);
router.patch("/complaints/:id", requireAuth, requireAdmin, updateComplaint);
router.get("/reviews", requireAuth, requireAdmin, getAllReviews);

export default router;
