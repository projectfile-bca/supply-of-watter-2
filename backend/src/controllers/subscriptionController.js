import Subscription from "../models/Subscription.js";
import {
  SUBSCRIPTION_FREQUENCIES,
  materializeDueSubscriptions
} from "../services/subscriptionService.js";

function parseRunDate(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function ensureCustomer(req, res) {
  if (req.user.role !== "customer") {
    res.status(403).json({ message: "Only customers can manage subscription plans." });
    return false;
  }

  return true;
}

export async function createSubscription(req, res, next) {
  try {
    if (!ensureCustomer(req, res)) return;

    const { deliveryAddress, litres, notes, frequency = "weekly", startDate } = req.body;

    if (!deliveryAddress || !litres) {
      return res.status(400).json({ message: "Delivery address and litres are required." });
    }

    if (!SUBSCRIPTION_FREQUENCIES.includes(frequency)) {
      return res.status(400).json({ message: "Invalid subscription frequency." });
    }

    if (Number(litres) < 1) {
      return res.status(400).json({ message: "Litres must be at least 1." });
    }

    const nextRunAt = parseRunDate(startDate);
    if (!nextRunAt) {
      return res.status(400).json({ message: "Invalid start date." });
    }

    const subscription = await Subscription.create({
      customer: req.user._id,
      deliveryAddress,
      litres: Number(litres),
      notes,
      frequency,
      nextRunAt
    });

    res.status(201).json({
      message: "Subscription created.",
      subscription
    });
  } catch (error) {
    next(error);
  }
}

export async function getMySubscriptions(req, res, next) {
  try {
    if (!ensureCustomer(req, res)) return;

    const subscriptions = await Subscription.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
}

export async function pauseSubscription(req, res, next) {
  try {
    if (!ensureCustomer(req, res)) return;

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    subscription.isPaused = true;
    await subscription.save();

    res.json({
      message: "Subscription paused.",
      subscription
    });
  } catch (error) {
    next(error);
  }
}

export async function resumeSubscription(req, res, next) {
  try {
    if (!ensureCustomer(req, res)) return;

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    subscription.isPaused = false;
    if (!subscription.nextRunAt || subscription.nextRunAt < new Date()) {
      subscription.nextRunAt = new Date();
    }
    await subscription.save();

    res.json({
      message: "Subscription resumed.",
      subscription
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubscription(req, res, next) {
  try {
    if (!ensureCustomer(req, res)) return;

    const deleted = await Subscription.findOneAndDelete({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    res.json({ message: "Subscription deleted." });
  } catch (error) {
    next(error);
  }
}

export async function runSubscriptionSync(_req, res, next) {
  try {
    const result = await materializeDueSubscriptions();
    res.json({
      message: "Subscription sync complete.",
      ...result
    });
  } catch (error) {
    next(error);
  }
}
