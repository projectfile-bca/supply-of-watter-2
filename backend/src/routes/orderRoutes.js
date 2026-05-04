import express from "express";
import {
  cancelDriverOrderEngagement,
  cancelMyOrder,
  confirmOrderDelivery,
  createOrder,
  getOrderChat,
  getOrderLocation,
  getDriverVisibleOrders,
  getMyOrders,
  requestOrderAsDriver,
  sendOrderChatMessage,
  updateOrderCustomerLocation,
  updateOrderDriverLocation,
  updateDriverOrderStatus
} from "../controllers/orderController.js";
import { requireApprovedDriver, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireApprovedDriver, createOrder);
router.get("/mine", requireAuth, requireApprovedDriver, getMyOrders);
router.get("/driver", requireAuth, requireApprovedDriver, getDriverVisibleOrders);
router.get("/:id/location", requireAuth, requireApprovedDriver, getOrderLocation);
router.get("/:id/chat", requireAuth, requireApprovedDriver, getOrderChat);
router.post("/:id/request", requireAuth, requireApprovedDriver, requestOrderAsDriver);
router.post("/:id/chat", requireAuth, requireApprovedDriver, sendOrderChatMessage);
router.patch("/:id/driver-cancel", requireAuth, requireApprovedDriver, cancelDriverOrderEngagement);
router.patch("/:id/driver-status", requireAuth, requireApprovedDriver, updateDriverOrderStatus);
router.patch("/:id/location", requireAuth, requireApprovedDriver, updateOrderDriverLocation);
router.patch("/:id/customer-location", requireAuth, requireApprovedDriver, updateOrderCustomerLocation);
router.patch("/:id/confirm-delivery", requireAuth, requireApprovedDriver, confirmOrderDelivery);
router.patch("/:id/cancel", requireAuth, requireApprovedDriver, cancelMyOrder);

export default router;
