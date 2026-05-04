import bcrypt from "bcryptjs";
import AdminCredential from "../models/AdminCredential.js";
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export async function getAdminProfile(req, res) {
  res.json({
    admin: {
      id: req.user._id,
      username: req.user.username,
      role: "admin"
    }
  });
}

export async function updateAdminProfile(req, res, next) {
  try {
    const { username, currentPassword, newPassword } = req.body;

    if (!username && !newPassword) {
      return res.status(400).json({ message: "Username or new password is required." });
    }

    const admin = await AdminCredential.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found." });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password." });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect." });
      }

      admin.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (username) {
      admin.username = username;
    }

    await admin.save();

    res.json({
      message: "Admin account updated.",
      admin: {
        id: admin._id,
        username: admin.username,
        role: "admin"
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminAnalytics(_req, res, next) {
  try {
    const now = new Date();
    const monthlyWindowStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [orders, complaintGroups, activeSubscriptions, approvedDrivers, customers, monthlySalesRaw] = await Promise.all([
      Order.find().select("status litres"),
      Complaint.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Subscription.countDocuments({ isPaused: false }),
      User.countDocuments({ role: "driver", isApproved: true }),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        {
          $match: {
            status: "completed",
            updatedAt: { $gte: monthlyWindowStart }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$updatedAt" },
              month: { $month: "$updatedAt" }
            },
            litres: { $sum: "$litres" },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ])
    ]);

    const statusCounts = {
      pending: 0,
      requested: 0,
      assigned: 0,
      out_for_delivery: 0,
      arrived: 0,
      completed: 0,
      cancelled: 0
    };

    let completedLitres = 0;
    for (const order of orders) {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status] += 1;
      }
      if (order.status === "completed") {
        completedLitres += Number(order.litres || 0);
      }
    }

    const complaintCounts = {
      open: 0,
      in_progress: 0,
      resolved: 0
    };

    for (const complaint of complaintGroups) {
      if (complaintCounts[complaint._id] !== undefined) {
        complaintCounts[complaint._id] = complaint.count;
      }
    }

    const monthKeyToSales = new Map(
      monthlySalesRaw.map((item) => [
        `${item._id.year}-${item._id.month}`,
        {
          litres: Number(item.litres || 0),
          orders: Number(item.orders || 0)
        }
      ])
    );

    const monthlyLitres = [];
    for (let offset = 0; offset <= 11; offset += 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;
      const key = `${year}-${month}`;
      const sales = monthKeyToSales.get(key) || { litres: 0, orders: 0 };

      monthlyLitres.push({
        year,
        month,
        label: monthDate.toLocaleString("default", { month: "short", year: "numeric" }),
        litres: sales.litres,
        completedOrders: sales.orders
      });
    }

    res.json({
      totals: {
        orders: orders.length,
        customers,
        approvedDrivers,
        activeSubscriptions,
        completedLitres
      },
      statusCounts,
      complaintCounts,
      monthlyLitres
    });
  } catch (error) {
    next(error);
  }
}
