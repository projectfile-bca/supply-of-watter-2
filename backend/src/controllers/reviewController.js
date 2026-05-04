import Order from "../models/Order.js";
import Review from "../models/Review.js";

export async function createReview(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can review drivers." });
    }

    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ message: "Order and rating are required." });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
      status: "completed"
    });

    if (!order) {
      return res.status(404).json({ message: "Completed order not found." });
    }

    if (!order.driver) {
      return res.status(400).json({ message: "Order has no assigned driver to review." });
    }

    const review = await Review.create({
      order: order._id,
      customer: req.user._id,
      driver: order.driver,
      rating: Number(rating),
      comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate("customer", "name email phone")
      .populate("driver", "name email phone")
      .populate("order", "deliveryAddress litres status");

    res.status(201).json({
      message: "Review submitted.",
      review: populatedReview
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "This order already has a review." });
      return;
    }

    next(error);
  }
}

export async function getMyDriverReviews(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can view their reviews." });
    }

    const reviews = await Review.find({ driver: req.user._id })
      .populate("customer", "name email phone")
      .populate("order", "deliveryAddress litres status")
      .sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : 0;

    res.json({
      reviews,
      averageRating
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReviews(_req, res, next) {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email phone")
      .populate("driver", "name email phone")
      .populate("order", "deliveryAddress litres status")
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
}
