import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { getDriverRatingSnapshot } from "../services/driverRatingService.js";
import { materializeDueSubscriptions } from "../services/subscriptionService.js";

function isLikelyEmail(value) {
  return typeof value === "string" && value.includes("@");
}

function getDriverDisplayName(userLike) {
  if (!userLike) return "Driver";
  if (userLike.name && !isLikelyEmail(userLike.name)) return userLike.name;
  return "Driver";
}

function addStatusHistory(order, status, changedByRole, message) {
  order.statusHistory.push({
    status,
    changedByRole,
    message,
    changedAt: new Date()
  });
}

function toCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLocationInput(locationLike, label = "Location") {
  if (!locationLike) {
    return { location: null };
  }

  const latitude = toCoordinate(locationLike.latitude);
  const longitude = toCoordinate(locationLike.longitude);

  if (latitude === null || longitude === null) {
    return { error: `${label} latitude and longitude are required.` };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { error: `${label} latitude or longitude is out of valid range.` };
  }

  return {
    location: {
      latitude,
      longitude,
      updatedAt: new Date()
    }
  };
}

function calculateDistanceKm(fromLocation, toLocation) {
  if (!fromLocation || !toLocation) return null;

  const fromLatitude = toCoordinate(fromLocation.latitude);
  const fromLongitude = toCoordinate(fromLocation.longitude);
  const toLatitude = toCoordinate(toLocation.latitude);
  const toLongitude = toCoordinate(toLocation.longitude);

  if (fromLatitude === null || fromLongitude === null || toLatitude === null || toLongitude === null) {
    return null;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = toRadians(fromLatitude);
  const toLatitudeRadians = toRadians(toLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 * Math.cos(fromLatitudeRadians) * Math.cos(toLatitudeRadians);
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Number((earthRadiusKm * arc).toFixed(2));
}

const COMPLETION_MAX_DISTANCE_METERS = Number(process.env.COMPLETION_MAX_DISTANCE_METERS || 300);
const COMPLETION_GPS_MAX_AGE_MS = Number(process.env.COMPLETION_GPS_MAX_AGE_SECONDS || 180) * 1000;
const COMPLETION_CODE_TTL_MS = Number(process.env.COMPLETION_CODE_TTL_SECONDS || 180) * 1000;
const MAX_DRIVER_LOCATION_SPEED_KMPH = Number(process.env.MAX_DRIVER_LOCATION_SPEED_KMPH || 120);
const MAX_DRIVER_LOCATION_CHECK_WINDOW_MS =
  Number(process.env.MAX_DRIVER_LOCATION_CHECK_WINDOW_MINUTES || 20) * 60 * 1000;

function generateCompletionCode() {
  return String(randomInt(100000, 1000000));
}

function getCompletionReadiness(order) {
  const result = {
    isReady: false,
    distanceMeters: null,
    driverLocationAgeSeconds: null,
    reason: ""
  };

  if (!order.customerLocation) {
    result.reason = "Customer location is not available for this order.";
    return result;
  }
  if (!order.driverLocation || !order.driverLocation.updatedAt) {
    result.reason = "Driver location is not available. Sync GPS first.";
    return result;
  }

  const distanceKm = calculateDistanceKm(order.driverLocation, order.customerLocation);
  if (distanceKm === null) {
    result.reason = "Location data is invalid.";
    return result;
  }

  const distanceMeters = Math.round(distanceKm * 1000);
  const driverLocationAgeMs = Date.now() - new Date(order.driverLocation.updatedAt).getTime();
  const driverLocationAgeSeconds = Math.max(0, Math.round(driverLocationAgeMs / 1000));

  result.distanceMeters = distanceMeters;
  result.driverLocationAgeSeconds = driverLocationAgeSeconds;

  if (distanceMeters > COMPLETION_MAX_DISTANCE_METERS) {
    result.reason = `Driver is ${distanceMeters}m away. Must be within ${COMPLETION_MAX_DISTANCE_METERS}m.`;
    return result;
  }

  if (driverLocationAgeMs > COMPLETION_GPS_MAX_AGE_MS) {
    result.reason = `Driver GPS is outdated (${driverLocationAgeSeconds}s). Update location and try again.`;
    return result;
  }

  result.isReady = true;
  return result;
}

function getTravelSpeedKmph(fromLocation, toLocation) {
  if (!fromLocation?.updatedAt || !toLocation?.updatedAt) return null;

  const fromTime = new Date(fromLocation.updatedAt).getTime();
  const toTime = new Date(toLocation.updatedAt).getTime();
  if (!Number.isFinite(fromTime) || !Number.isFinite(toTime) || toTime <= fromTime) return null;

  const distanceKm = calculateDistanceKm(fromLocation, toLocation);
  if (distanceKm === null) return null;

  const elapsedHours = (toTime - fromTime) / (1000 * 60 * 60);
  if (!Number.isFinite(elapsedHours) || elapsedHours <= 0) return null;

  return distanceKm / elapsedHours;
}

const CHAT_ALLOWED_STATUSES = ["assigned", "out_for_delivery", "arrived"];
const CHAT_MAX_LENGTH = 500;
const CHAT_SPAM_WINDOW_MS = 30 * 1000;
const CHAT_SPAM_LIMIT = 5;
const CHAT_MUTE_MINUTES = 30;
const CHAT_ESCALATION_AFTER_VIOLATIONS = 3;
const ORDER_LIST_EXCLUDED_FIELDS = "-chatMessages -chatModeration -completionCodeHash -deliveryKeyHash";
const chatBlockedPatterns = [
  {
    reason: "Abusive language is not allowed.",
    regex: /\b(idiot|stupid|moron|fool|bastard|loser|hate you)\b/i
  },
  {
    reason: "Sharing phone numbers in chat is not allowed.",
    regex: /(?:\+?\d[\d\s-]{8,}\d)/
  },
  {
    reason: "Sharing email addresses in chat is not allowed.",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  },
  {
    reason: "Extra payment requests are not allowed in chat.",
    regex: /\b(extra|additional)\s+(money|payment|cash)\b/i
  }
];
const chatEscalationKeywords = /\b(threat|fraud|scam|harass|police|unsafe|abuse)\b/i;

function appendSystemChatMessage(order, message) {
  order.chatMessages.push({
    senderRole: "system",
    sender: null,
    message,
    createdAt: new Date()
  });
}

function getOrderParticipantRole(order, user) {
  if (!order || !user) return null;
  const userId = user._id?.toString?.();
  if (!userId) return null;

  const customerId = order.customer?._id?.toString?.() || order.customer?.toString?.();
  const driverId = order.driver?._id?.toString?.() || order.driver?.toString?.();

  if (user.role === "customer" && customerId === userId) return "customer";
  if (user.role === "driver" && driverId === userId) return "driver";
  return null;
}

function getRoleModeration(order, role) {
  if (!order.chatModeration) {
    order.chatModeration = {
      customer: { warnings: 0, violations: 0, muteUntil: null },
      driver: { warnings: 0, violations: 0, muteUntil: null }
    };
  }
  if (!order.chatModeration[role]) {
    order.chatModeration[role] = { warnings: 0, violations: 0, muteUntil: null };
  }
  return order.chatModeration[role];
}

function detectChatViolation(order, senderRole, message) {
  for (const item of chatBlockedPatterns) {
    if (item.regex.test(message)) {
      return item.reason;
    }
  }

  const now = Date.now();
  const recentMessages = (order.chatMessages || []).filter(
    (entry) =>
      entry.senderRole === senderRole &&
      entry.createdAt &&
      now - new Date(entry.createdAt).getTime() <= CHAT_SPAM_WINDOW_MS
  );
  if (recentMessages.length >= CHAT_SPAM_LIMIT) {
    return "Too many messages in a short time. Please slow down.";
  }

  return null;
}

async function createAutoEscalationComplaint(order, triggerRole, triggerMessage) {
  const customerId = order.customer?._id || order.customer;
  if (!customerId) return;

  const escalationText = `Auto-escalation: ${triggerRole} violated chat rules. Message: "${triggerMessage}".`;
  await Complaint.create({
    customer: customerId,
    order: order._id,
    message: escalationText,
    status: "open"
  });
}

function populateOrder(query) {
  return query
    .select(ORDER_LIST_EXCLUDED_FIELDS)
    .populate("customer", "name phone email")
    .populate("driver", "name phone email isAvailable")
    .populate("preferredDriver", "name phone email isAvailable")
    .populate("driverRequests", "name phone email isAvailable")
    .populate("sourceSubscription", "frequency nextRunAt isPaused");
}

export async function createOrder(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can create orders." });
    }

    const { deliveryAddress, litres, notes, customerLocation, preferredDriverId } = req.body;

    if (!deliveryAddress || !litres) {
      return res.status(400).json({ message: "Delivery address and litres are required." });
    }

    if (Number(litres) < 1) {
      return res.status(400).json({ message: "Litres must be at least 1." });
    }

    if (!customerLocation) {
      return res.status(400).json({
        message: "Customer live location is required for every order. Share GPS before placing order."
      });
    }

    const parsedCustomerLocation = parseLocationInput(customerLocation, "Customer location");
    if (parsedCustomerLocation.error) {
      return res.status(400).json({ message: parsedCustomerLocation.error });
    }

    let preferredDriver = null;
    if (typeof preferredDriverId === "string" && preferredDriverId.trim()) {
      preferredDriver = await User.findOne({
        _id: preferredDriverId.trim(),
        role: "driver",
        isApproved: true,
        isAvailable: true
      }).select("name email phone");

      if (!preferredDriver) {
        return res.status(400).json({
          message: "Selected preferred driver is not available."
        });
      }

      const preferredDriverRating = await getDriverRatingSnapshot(preferredDriver._id);
      if (preferredDriverRating.isBlocked) {
        return res.status(400).json({
          message:
            "Selected driver is temporarily blocked from new orders due to low rating performance."
        });
      }
    }

    const initialHistory = [
      {
        status: "pending",
        changedByRole: "customer",
        message: "Order placed by customer."
      }
    ];
    if (preferredDriver) {
      initialHistory.push({
        status: "pending",
        changedByRole: "customer",
        message: `Customer preferred ${getDriverDisplayName(preferredDriver)} for this order.`
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      deliveryAddress,
      litres: Number(litres),
      notes,
      preferredDriver: preferredDriver?._id || null,
      customerLocation: parsedCustomerLocation.location,
      statusHistory: initialHistory
    });

    res.status(201).json({
      message: "Order created.",
      order
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can view their orders." });
    }

    await materializeDueSubscriptions();

    const orders = await Order.find({ customer: req.user._id })
      .select(ORDER_LIST_EXCLUDED_FIELDS)
      .populate("driver", "name phone email")
      .populate("preferredDriver", "name phone email isAvailable")
      .populate("sourceSubscription")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function cancelMyOrder(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can cancel their own orders." });
    }

    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!["pending", "requested"].includes(order.status) || order.driver) {
      return res.status(400).json({ message: "Order can be cancelled only before driver assignment." });
    }

    order.status = "cancelled";
    addStatusHistory(order, "cancelled", "customer", "Order cancelled by customer.");
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate("driver", "name phone email");

    res.json({
      message: "Order cancelled.",
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmOrderDelivery(req, res, next) {
  try {
    const completionCode =
      typeof req.body?.completionCode === "string" ? req.body.completionCode.trim() : "";
    if (!completionCode) {
      return res.status(400).json({ message: "Completion code is required." });
    }

    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) {
      return res.status(403).json({
        message: `Only the customer who placed this order can confirm delivery. You are logged in as ${req.user?.role || "unknown"}.`
      });
    }

    if (order.status !== "arrived") {
      return res.status(400).json({ message: "Only arrived orders can be completed." });
    }

    const readiness = getCompletionReadiness(order);
    if (!readiness.isReady) {
      return res.status(400).json({
        message: readiness.reason || "Delivery completion checks failed.",
        readiness
      });
    }

    if (!order.completionCodeHash || !order.completionCodeExpiresAt) {
      return res.status(400).json({
        message: "Completion code is missing. Ask the driver to mark arrived again."
      });
    }

    if (new Date(order.completionCodeExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        message: "Completion code expired. Ask the driver to mark arrived again."
      });
    }

    const isValidCode = await bcrypt.compare(completionCode, order.completionCodeHash);
    if (!isValidCode) {
      return res.status(401).json({ message: "Invalid completion code." });
    }

    order.status = "completed";
    order.completionProof = {
      verifiedAt: new Date(),
      driverLocation: order.driverLocation
        ? {
            latitude: order.driverLocation.latitude,
            longitude: order.driverLocation.longitude,
            updatedAt: order.driverLocation.updatedAt
          }
        : null,
      customerLocation: order.customerLocation
        ? {
            latitude: order.customerLocation.latitude,
            longitude: order.customerLocation.longitude,
            updatedAt: order.customerLocation.updatedAt
          }
        : null,
      distanceMeters: readiness.distanceMeters,
      driverLocationAgeSeconds: readiness.driverLocationAgeSeconds
    };
    order.completionCodeHash = "";
    order.completionCodeExpiresAt = null;
    order.deliveryKeyHash = "";
    order.deliveryKeyForCustomer = "";
    order.deliveryKeyGeneratedAt = null;
    addStatusHistory(order, "completed", "customer", "Customer confirmed delivery after verified arrival.");
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate("driver", "name phone email");

    res.json({
      message: "Delivery confirmed. Order completed.",
      order: populatedOrder,
      completionProof: order.completionProof
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderCustomerLocation(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can update order location." });
    }

    const parsedCustomerLocation = parseLocationInput(req.body, "Customer location");
    if (parsedCustomerLocation.error || !parsedCustomerLocation.location) {
      return res.status(400).json({
        message: parsedCustomerLocation.error || "Customer location is required."
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: { $in: ["pending", "requested", "assigned", "out_for_delivery", "arrived"] }
    });

    if (!order) {
      return res.status(404).json({
        message: "Active order not found for this customer."
      });
    }

    order.customerLocation = parsedCustomerLocation.location;
    addStatusHistory(order, order.status, "customer", "Customer updated order GPS location.");
    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));
    res.json({
      message: "Order location updated.",
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(_req, res, next) {
  try {
    await materializeDueSubscriptions();
    const orders = await populateOrder(Order.find()).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function getDriverVisibleOrders(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can view driver orders." });
    }

    await materializeDueSubscriptions();

    const filters = {
      $or: [
        { status: { $in: ["pending", "requested"] } },
        {
          driver: req.user._id,
          status: { $in: ["assigned", "out_for_delivery", "arrived", "completed"] }
        }
      ]
    };

    const orders = await populateOrder(Order.find(filters)).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function requestOrderAsDriver(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can request orders." });
    }

    if (!req.user.isAvailable) {
      return res.status(403).json({ message: "Set yourself available before requesting an order." });
    }

    const driverRating = await getDriverRatingSnapshot(req.user._id);
    if (driverRating.isBlocked) {
      return res.status(403).json({
        message: `Your average rating (${driverRating.averageRating}/5 across ${driverRating.reviewCount} reviews) is below ${driverRating.minAverageRequired}. You are temporarily blocked from taking new orders.`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (["assigned", "out_for_delivery", "arrived"].includes(order.status)) {
      return res.status(409).json({ message: "Order is already assigned." });
    }

    if (
      order.preferredDriver &&
      order.preferredDriver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Customer selected another preferred driver for this order."
      });
    }

    const activeDriverOrder = await Order.findOne({
      _id: { $ne: order._id },
      status: { $in: ["requested", "assigned", "out_for_delivery", "arrived"] },
      $or: [{ driverRequests: req.user._id }, { driver: req.user._id }]
    });

    if (activeDriverOrder) {
      return res.status(409).json({
        message: "You already have an active order request. Please wait for admin approval or completion before requesting another order."
      });
    }

    const alreadyRequested = order.driverRequests.some(
      (driverId) => driverId.toString() === req.user._id.toString()
    );

    if (!alreadyRequested) {
      order.driverRequests.push(req.user._id);
    }

    order.status = "requested";
    addStatusHistory(order, "requested", "driver", `${getDriverDisplayName(req.user)} requested this order.`);
    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));

    res.json({
      message: "Order request sent for admin approval.",
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelDriverOrderEngagement(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can cancel their request or assignment." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const driverId = req.user._id.toString();
    const isAssignedToDriver = order.driver && order.driver.toString() === driverId;
    const hasRequested = order.driverRequests.some((requestDriverId) => requestDriverId.toString() === driverId);

    if (!isAssignedToDriver && !hasRequested) {
      return res.status(403).json({ message: "You are not linked to this order." });
    }

    if (["completed", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "This order is already closed." });
    }

    order.driverRequests = order.driverRequests.filter((requestDriverId) => requestDriverId.toString() !== driverId);

    if (isAssignedToDriver) {
      order.driver = null;
      order.driverLocation = null;
      order.arrivedAt = null;
      order.completionCodeHash = "";
      order.completionCodeExpiresAt = null;
      order.completionProof = null;
      order.deliveryKeyHash = "";
      order.deliveryKeyForCustomer = "";
      order.deliveryKeyGeneratedAt = null;

      order.status = order.driverRequests.length > 0 ? "requested" : "pending";
      addStatusHistory(
        order,
        order.status,
        "driver",
        `${getDriverDisplayName(req.user)} cancelled assignment and released this order.`
      );
    } else if (!order.driver) {
      order.status = order.driverRequests.length > 0 ? "requested" : "pending";
      addStatusHistory(order, order.status, "driver", `${getDriverDisplayName(req.user)} withdrew order request.`);
    } else {
      addStatusHistory(order, order.status, "driver", `${getDriverDisplayName(req.user)} withdrew order request.`);
    }

    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));
    res.json({
      message: "Order engagement cancelled.",
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
}

export async function approveOrderDriverRequest(req, res, next) {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "Driver is required." });
    }

    const driver = await User.findOne({ _id: driverId, role: "driver", isApproved: true });
    if (!driver) {
      return res.status(400).json({ message: "Approved driver not found." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const hasRequested = order.driverRequests.some(
      (requestDriverId) => requestDriverId.toString() === driverId
    );

    if (!hasRequested) {
      return res.status(400).json({ message: "This driver has not requested the order." });
    }

    order.driver = driverId;
    order.status = "assigned";
    addStatusHistory(order, "assigned", "admin", `Admin approved ${getDriverDisplayName(driver)} for this order.`);
    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));

    res.json({
      message: "Driver request approved. Order assigned.",
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDriverOrderStatus(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can update driver order status." });
    }

    const { status } = req.body;
    if (!["out_for_delivery", "arrived"].includes(status)) {
      return res.status(400).json({
        message: "Driver can only mark an order as out for delivery or arrived."
      });
    }

    if (status === "out_for_delivery") {
      const order = await Order.findOne({
        _id: req.params.id,
        driver: req.user._id,
        status: "assigned"
      });

      if (!order) {
        return res.status(404).json({ message: "Assigned order not found for this driver." });
      }

      order.status = "out_for_delivery";
      order.arrivedAt = null;
      order.completionCodeHash = "";
      order.completionCodeExpiresAt = null;
      order.completionProof = null;
      addStatusHistory(order, "out_for_delivery", "driver", "Driver marked order out for delivery.");
      await order.save();

      const populatedOrder = await populateOrder(Order.findById(order._id));
      return res.json({
        message: "Order status updated.",
        order: populatedOrder
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      driver: req.user._id,
      status: { $in: ["out_for_delivery", "arrived"] }
    });

    if (!order) {
      return res.status(404).json({
        message: "Out-for-delivery order not found for this driver. Mark out for delivery first."
      });
    }

    const readiness = getCompletionReadiness(order);
    if (!readiness.isReady) {
      return res.status(400).json({
        message: readiness.reason || "Cannot mark arrived yet.",
        readiness
      });
    }

    const completionCode = generateCompletionCode();
    const wasAlreadyArrived = order.status === "arrived";
    order.status = "arrived";
    order.arrivedAt = new Date();
    order.completionCodeHash = await bcrypt.hash(completionCode, 12);
    order.completionCodeExpiresAt = new Date(Date.now() + COMPLETION_CODE_TTL_MS);
    order.completionProof = null;
    addStatusHistory(
      order,
      "arrived",
      "driver",
      wasAlreadyArrived
        ? "Driver refreshed arrival code at customer location."
        : "Driver marked order as arrived at customer location."
    );
    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));

    return res.json({
      message: `Arrival verified. Share completion code within ${Math.round(
        COMPLETION_CODE_TTL_MS / 1000
      )} seconds.`,
      order: populatedOrder,
      completionCode,
      completionCodeExpiresAt: order.completionCodeExpiresAt,
      readiness
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderDriverLocation(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can update live location." });
    }

    const parsedDriverLocation = parseLocationInput(req.body, "Driver location");
    if (parsedDriverLocation.error || !parsedDriverLocation.location) {
      return res.status(400).json({ message: parsedDriverLocation.error || "Driver location is required." });
    }
    const nextDriverLocation = {
      ...parsedDriverLocation.location,
      updatedAt: new Date()
    };

    const order = await Order.findOne({
      _id: req.params.id,
      driver: req.user._id,
      status: { $in: ["out_for_delivery", "arrived"] }
    });

    if (!order) {
      return res.status(404).json({
        message: "Active out-for-delivery order not found for this driver."
      });
    }

    if (order.driverLocation?.updatedAt) {
      const previousUpdateTime = new Date(order.driverLocation.updatedAt).getTime();
      const elapsedMs = Date.now() - previousUpdateTime;

      if (elapsedMs > 0 && elapsedMs <= MAX_DRIVER_LOCATION_CHECK_WINDOW_MS) {
        const speedKmph = getTravelSpeedKmph(order.driverLocation, nextDriverLocation);
        if (speedKmph !== null && speedKmph > MAX_DRIVER_LOCATION_SPEED_KMPH) {
          return res.status(400).json({
            message:
              "Suspicious location jump detected. Please keep auto GPS on and retry from current location.",
            speedKmph: Number(speedKmph.toFixed(2)),
            maxAllowedKmph: MAX_DRIVER_LOCATION_SPEED_KMPH
          });
        }
      }
    }

    order.driverLocation = nextDriverLocation;
    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));

    res.json({
      message: "Live location updated.",
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderLocation(req, res, next) {
  try {
    const order = await populateOrder(Order.findById(req.params.id));
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const isAdmin = req.user.role === "admin";
    const isCustomerOwner =
      req.user.role === "customer" &&
      order.customer &&
      order.customer._id.toString() === req.user._id.toString();
    const isAssignedDriver =
      req.user.role === "driver" &&
      order.driver &&
      order.driver._id.toString() === req.user._id.toString();

    if (!isAdmin && !isCustomerOwner && !isAssignedDriver) {
      return res.status(403).json({ message: "You cannot view this order's location." });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      driver: order.driver || null,
      driverLocation: order.driverLocation || null,
      customerLocation: order.customerLocation || null,
      distanceKm: calculateDistanceKm(order.driverLocation, order.customerLocation)
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderChat(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("chatMessages.sender", "name role")
      .populate("customer", "name")
      .populate("driver", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const isAdmin = req.user.role === "admin";
    const participantRole = getOrderParticipantRole(order, req.user);
    if (!isAdmin && !participantRole) {
      return res.status(403).json({ message: "You cannot view this order chat." });
    }

    const moderation =
      participantRole && order.chatModeration
        ? order.chatModeration[participantRole] || { warnings: 0, violations: 0, muteUntil: null }
        : null;
    const isMuted = moderation?.muteUntil && new Date(moderation.muteUntil).getTime() > Date.now();
    const canSend =
      Boolean(participantRole) &&
      CHAT_ALLOWED_STATUSES.includes(order.status) &&
      !isMuted;

    const messages = (order.chatMessages || [])
      .slice(-120)
      .map((entry) => ({
        senderRole: entry.senderRole,
        senderName: entry.sender?.name || entry.senderRole,
        message: entry.message,
        createdAt: entry.createdAt
      }));

    res.json({
      orderId: order._id,
      role: participantRole || "admin",
      status: order.status,
      canSend,
      mutedUntil: moderation?.muteUntil || null,
      moderation: order.chatModeration || null,
      chatEscalatedAt: order.chatEscalatedAt || null,
      messages
    });
  } catch (error) {
    next(error);
  }
}

export async function sendOrderChatMessage(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const participantRole = getOrderParticipantRole(order, req.user);
    if (!participantRole) {
      return res.status(403).json({ message: "Only assigned customer or driver can send chat messages." });
    }

    if (!CHAT_ALLOWED_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: "Chat is allowed only after assignment and before completion." });
    }

    const rawMessage = typeof req.body.message === "string" ? req.body.message : "";
    const message = rawMessage.trim();
    if (!message) {
      return res.status(400).json({ message: "Chat message is required." });
    }
    if (message.length > CHAT_MAX_LENGTH) {
      return res.status(400).json({ message: `Chat message cannot exceed ${CHAT_MAX_LENGTH} characters.` });
    }

    const moderation = getRoleModeration(order, participantRole);
    const now = Date.now();
    if (moderation.muteUntil && new Date(moderation.muteUntil).getTime() > now) {
      return res.status(429).json({
        message: `Chat is muted for you until ${new Date(moderation.muteUntil).toLocaleString()}.`,
        mutedUntil: moderation.muteUntil
      });
    }

    const violationReason = detectChatViolation(order, participantRole, message);
    if (violationReason) {
      moderation.warnings = Number(moderation.warnings || 0) + 1;
      moderation.violations = Number(moderation.violations || 0) + 1;

      let policyMessage = violationReason;
      if (moderation.violations >= 2) {
        moderation.muteUntil = new Date(now + CHAT_MUTE_MINUTES * 60 * 1000);
        policyMessage = `${violationReason} You are muted for ${CHAT_MUTE_MINUTES} minutes.`;
      }

      if (moderation.violations >= CHAT_ESCALATION_AFTER_VIOLATIONS && !order.chatEscalatedAt) {
        order.chatEscalatedAt = new Date();
        await createAutoEscalationComplaint(order, participantRole, message);
        policyMessage = `${policyMessage} Auto complaint has been created for admin review.`;
      }

      appendSystemChatMessage(order, `${participantRole} message blocked: ${policyMessage}`);
      await order.save();

      return res.status(403).json({
        message: policyMessage,
        violation: true,
        mutedUntil: moderation.muteUntil || null,
        violations: moderation.violations
      });
    }

    order.chatMessages.push({
      senderRole: participantRole,
      sender: req.user._id,
      message,
      createdAt: new Date()
    });

    if (chatEscalationKeywords.test(message) && !order.chatEscalatedAt) {
      order.chatEscalatedAt = new Date();
      await createAutoEscalationComplaint(order, participantRole, message);
      appendSystemChatMessage(order, "Auto escalation ticket created for admin follow-up.");
    }

    await order.save();

    const hydratedOrder = await Order.findById(order._id).populate("chatMessages.sender", "name role");
    const messages = (hydratedOrder.chatMessages || [])
      .slice(-120)
      .map((entry) => ({
        senderRole: entry.senderRole,
        senderName: entry.sender?.name || entry.senderRole,
        message: entry.message,
        createdAt: entry.createdAt
      }));

    res.status(201).json({
      message: "Chat message sent.",
      role: participantRole,
      messages,
      mutedUntil: moderation.muteUntil || null,
      chatEscalatedAt: hydratedOrder.chatEscalatedAt || null
    });
  } catch (error) {
    next(error);
  }
}

export async function generateOrderDeliveryKey(req, res, next) {
  try {
    const order = await populateOrder(Order.findById(req.params.id));

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(410).json({
      message:
        "Manual admin delivery keys are disabled. Driver must mark arrived to generate a short-lived completion code."
    });
  } catch (error) {
    next(error);
  }
}
