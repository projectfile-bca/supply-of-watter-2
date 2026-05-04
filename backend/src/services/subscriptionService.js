import Order from "../models/Order.js";
import Subscription from "../models/Subscription.js";

export const SUBSCRIPTION_FREQUENCIES = ["daily", "alternate_day", "weekly"];

const frequencyDayMap = {
  daily: 1,
  alternate_day: 2,
  weekly: 7
};

export function getNextRunAt(fromDate, frequency) {
  const stepDays = frequencyDayMap[frequency] || 7;
  const nextRunAt = new Date(fromDate);
  nextRunAt.setUTCDate(nextRunAt.getUTCDate() + stepDays);
  return nextRunAt;
}

function buildRecurringStatusHistory(subscription) {
  return [
    {
      status: "pending",
      changedByRole: "system",
      message: `Recurring order generated from ${subscription.frequency.replaceAll("_", " ")} plan.`
    }
  ];
}

export async function materializeDueSubscriptions({ limit = 25 } = {}) {
  const now = new Date();
  const dueSubscriptions = await Subscription.find({
    isPaused: false,
    nextRunAt: { $lte: now }
  })
    .sort({ nextRunAt: 1 })
    .limit(limit);

  if (!dueSubscriptions.length) {
    return { createdCount: 0 };
  }

  for (const subscription of dueSubscriptions) {
    await Order.create({
      customer: subscription.customer,
      deliveryAddress: subscription.deliveryAddress,
      litres: subscription.litres,
      notes: subscription.notes,
      scheduledFor: subscription.nextRunAt,
      sourceSubscription: subscription._id,
      statusHistory: buildRecurringStatusHistory(subscription)
    });

    subscription.lastRunAt = subscription.nextRunAt;
    subscription.nextRunAt = getNextRunAt(subscription.nextRunAt, subscription.frequency);
    await subscription.save();
  }

  return { createdCount: dueSubscriptions.length };
}
