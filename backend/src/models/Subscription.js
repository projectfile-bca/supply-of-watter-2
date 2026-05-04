import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    },
    litres: {
      type: Number,
      required: true,
      min: 1
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    frequency: {
      type: String,
      enum: ["daily", "alternate_day", "weekly"],
      default: "weekly"
    },
    nextRunAt: {
      type: Date,
      required: true
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    isPaused: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
