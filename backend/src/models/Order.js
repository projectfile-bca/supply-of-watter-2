import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ""
    },
    changedByRole: {
      type: String,
      enum: ["customer", "driver", "admin", "system"],
      default: "system"
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ["customer", "driver", "system"],
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const roleModerationSchema = new mongoose.Schema(
  {
    warnings: {
      type: Number,
      default: 0,
      min: 0
    },
    violations: {
      type: Number,
      default: 0,
      min: 0
    },
    muteUntil: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const completionProofSchema = new mongoose.Schema(
  {
    verifiedAt: {
      type: Date,
      default: null
    },
    driverLocation: {
      type: locationSchema,
      default: null
    },
    customerLocation: {
      type: locationSchema,
      default: null
    },
    distanceMeters: {
      type: Number,
      default: null
    },
    driverLocationAgeSeconds: {
      type: Number,
      default: null
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    preferredDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    driverRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    sourceSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null
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
    paymentMethod: {
      type: String,
      enum: ["cod"],
      default: "cod",
      required: true
    },
    deliveryKeyHash: {
      type: String,
      default: ""
    },
    deliveryKeyForCustomer: {
      type: String,
      default: ""
    },
    deliveryKeyGeneratedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["pending", "requested", "assigned", "out_for_delivery", "arrived", "completed", "cancelled"],
      default: "pending"
    },
    arrivedAt: {
      type: Date,
      default: null
    },
    completionCodeHash: {
      type: String,
      default: ""
    },
    completionCodeExpiresAt: {
      type: Date,
      default: null
    },
    completionProof: {
      type: completionProofSchema,
      default: null
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    },
    customerLocation: {
      type: locationSchema,
      default: null
    },
    driverLocation: {
      type: locationSchema,
      default: null
    },
    chatMessages: {
      type: [chatMessageSchema],
      default: []
    },
    chatModeration: {
      customer: {
        type: roleModerationSchema,
        default: () => ({})
      },
      driver: {
        type: roleModerationSchema,
        default: () => ({})
      }
    },
    chatEscalatedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ driver: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ driverRequests: 1, status: 1, createdAt: -1 });
orderSchema.index({ preferredDriver: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
