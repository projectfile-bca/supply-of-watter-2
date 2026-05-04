import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";

function populateComplaint(query) {
  return query
    .populate("customer", "name email phone")
    .populate({
      path: "order",
      select:
        "deliveryAddress litres status createdAt updatedAt scheduledFor notes paymentMethod driver customer sourceSubscription",
      populate: [
        { path: "driver", select: "name email phone" },
        { path: "customer", select: "name email phone" },
        { path: "sourceSubscription", select: "frequency nextRunAt isPaused" }
      ]
    });
}

export async function createComplaint(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can raise complaints." });
    }

    const { orderId, message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Complaint message is required." });
    }

    let order = null;
    if (orderId) {
      order = await Order.findOne({ _id: orderId, customer: req.user._id });
      if (!order) {
        return res.status(404).json({ message: "Order not found for complaint." });
      }
    }

    const complaint = await Complaint.create({
      customer: req.user._id,
      order: order?._id || null,
      message
    });

    const populatedComplaint = await populateComplaint(Complaint.findById(complaint._id));

    res.status(201).json({
      message: "Complaint submitted.",
      complaint: populatedComplaint
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyComplaints(req, res, next) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can view their complaints." });
    }

    const complaints = await populateComplaint(
      Complaint.find({ customer: req.user._id }).sort({ createdAt: -1 })
    );

    res.json({ complaints });
  } catch (error) {
    next(error);
  }
}

export async function getAllComplaints(_req, res, next) {
  try {
    const complaints = await populateComplaint(Complaint.find().sort({ createdAt: -1 }));
    res.json({ complaints });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { status, resolutionNote = "" } = req.body;
    const allowedStatuses = ["open", "in_progress", "resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status." });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    complaint.status = status;
    complaint.resolutionNote = resolutionNote;
    await complaint.save();

    const updated = await populateComplaint(Complaint.findById(complaint._id));

    res.json({
      message: "Complaint updated.",
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
}
