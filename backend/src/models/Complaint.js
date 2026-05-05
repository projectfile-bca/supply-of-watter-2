import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open"
    },
    resolutionNote: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

complaintSchema.index({ customer: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Complaint", complaintSchema);
