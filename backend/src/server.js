import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dns from "dns";

import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Force Google DNS (Mongo fix)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = [...new Set([...configuredOrigins, ...localOrigins])];

// CORS (ONLY ONCE)
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Water Supply API is running...");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/drivers", driverRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/complaints", complaintRoutes);
app.use("/admin", adminRoutes);

// Error handler
app.use((error, _req, res, _next) => {
  let status = error.message?.includes("Only jpg") ? 400 : 500;

  if (error.name === "ValidationError" || error.name === "CastError") {
    status = 400;
  }

  res.status(status).json({
    message: error.message || "Server error"
  });
});

// DB + Server start
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
