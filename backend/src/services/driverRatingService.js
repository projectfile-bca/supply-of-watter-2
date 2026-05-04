import mongoose from "mongoose";
import Review from "../models/Review.js";

export const MIN_DRIVER_AVERAGE_RATING = Number(process.env.MIN_DRIVER_AVERAGE_RATING || 3);
export const MIN_DRIVER_REVIEW_COUNT = Number(process.env.MIN_DRIVER_REVIEW_COUNT || 2);

function normalizeDriverId(driverIdLike) {
  const value = driverIdLike?._id?.toString?.() || driverIdLike?.toString?.();
  return value || "";
}

function toEligibilitySummary(statsLike = {}) {
  const reviewCount = Number(statsLike.reviewCount || 0);
  const averageRaw = Number(statsLike.averageRating || 0);
  const averageRating = reviewCount ? Number(averageRaw.toFixed(1)) : 0;
  const isBlocked =
    reviewCount >= MIN_DRIVER_REVIEW_COUNT && averageRating < MIN_DRIVER_AVERAGE_RATING;

  return {
    reviewCount,
    averageRating,
    minAverageRequired: MIN_DRIVER_AVERAGE_RATING,
    minReviewsRequired: MIN_DRIVER_REVIEW_COUNT,
    isBlocked
  };
}

export async function getDriverRatingMap(driverIds = []) {
  const normalizedDriverIds = [...new Set(driverIds.map(normalizeDriverId).filter(Boolean))];
  const snapshotMap = new Map();

  if (!normalizedDriverIds.length) {
    return snapshotMap;
  }

  const objectIds = normalizedDriverIds.map((id) => new mongoose.Types.ObjectId(id));
  const aggregated = await Review.aggregate([
    {
      $match: {
        driver: { $in: objectIds }
      }
    },
    {
      $group: {
        _id: "$driver",
        reviewCount: { $sum: 1 },
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  for (const driverId of normalizedDriverIds) {
    snapshotMap.set(driverId, toEligibilitySummary());
  }

  for (const row of aggregated) {
    const driverId = row?._id?.toString?.();
    if (!driverId) continue;
    snapshotMap.set(driverId, toEligibilitySummary(row));
  }

  return snapshotMap;
}

export async function getDriverRatingSnapshot(driverId) {
  const normalizedDriverId = normalizeDriverId(driverId);
  if (!normalizedDriverId) {
    return toEligibilitySummary();
  }
  const ratingMap = await getDriverRatingMap([normalizedDriverId]);
  return ratingMap.get(normalizedDriverId) || toEligibilitySummary();
}
