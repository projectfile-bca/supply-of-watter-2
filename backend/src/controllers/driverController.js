import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { getDriverRatingMap } from "../services/driverRatingService.js";
import {
  isStrongPassword,
  isValidPhone,
  PASSWORD_VALIDATION_MESSAGE,
  PHONE_VALIDATION_MESSAGE
} from "../utils/validation.js";

export async function applyDriver(req, res, next) {
  try {
    const { name, phone, email, password, aadhaarUrl, licenseUrl } = req.body;
    const normalizedPhone = String(phone || "").trim();

    if (!name || !phone || !email || !password || !aadhaarUrl || !licenseUrl) {
      return res.status(400).json({
        message: "Name, phone, email, password, Aadhaar image URL, and license image URL are required."
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ message: PHONE_VALIDATION_MESSAGE });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: PASSWORD_VALIDATION_MESSAGE });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const driver = await User.create({
      name,
      phone: normalizedPhone,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "driver",
      documents: {
        aadhaarUrl,
        licenseUrl
      },
      isApproved: false,
      isAvailable: true
    });

    res.status(201).json({
      message: "Driver application submitted. Awaiting admin approval.",
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        documents: driver.documents,
        isApproved: driver.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingDrivers(_req, res, next) {
  try {
    const drivers = await User.find({ role: "driver", isApproved: false })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

export async function getApprovedDrivers(_req, res, next) {
  try {
    const drivers = await User.find({ role: "driver", isApproved: true })
      .select("-passwordHash")
      .sort({ name: 1 });

    res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

export async function approveDriver(req, res, next) {
  try {
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: "driver" },
      { isApproved: true },
      { new: true }
    ).select("-passwordHash");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    res.json({ message: "Driver approved.", driver });
  } catch (error) {
    next(error);
  }
}

export async function updateDriverAvailability(req, res, next) {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can update availability." });
    }

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable: Boolean(req.body.isAvailable) },
      { new: true }
    ).select("-passwordHash");

    res.json({
      message: "Availability updated.",
      driver
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicDrivers(_req, res, next) {
  try {
    const drivers = await User.find({
      role: "driver",
      isApproved: true,
      isAvailable: true
    })
      .select("-passwordHash")
      .sort({ name: 1 });

    const ratingMap = await getDriverRatingMap(drivers.map((driver) => driver._id));

    const publicDrivers = drivers
      .map((driver) => {
        const ratingSummary = ratingMap.get(driver._id.toString()) || {
          reviewCount: 0,
          averageRating: 0,
          minAverageRequired: 3,
          minReviewsRequired: 2,
          isBlocked: false
        };

        return {
          id: driver._id,
          name: driver.name,
          phone: driver.phone,
          email: driver.email,
          isAvailable: driver.isAvailable,
          averageRating: ratingSummary.averageRating,
          reviewCount: ratingSummary.reviewCount,
          minAverageRequired: ratingSummary.minAverageRequired,
          minReviewsRequired: ratingSummary.minReviewsRequired,
          isEligible: !ratingSummary.isBlocked
        };
      })
      .filter((driver) => driver.isEligible);

    res.json({ drivers: publicDrivers });
  } catch (error) {
    next(error);
  }
}
