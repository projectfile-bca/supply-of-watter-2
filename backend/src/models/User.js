import mongoose from "mongoose";

const documentsSchema = new mongoose.Schema(
  {
    aadhaarUrl: {
      type: String,
      default: ""
    },
    licenseUrl: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits."]
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["customer", "driver"],
      default: "customer"
    },
    documents: {
      type: documentsSchema,
      default: () => ({})
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isApproved: 1, isAvailable: 1 });
userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model("User", userSchema);
