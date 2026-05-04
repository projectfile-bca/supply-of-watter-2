import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminCredential from "../models/AdminCredential.js";
import User from "../models/User.js";
import {
  isStrongPassword,
  isValidPhone,
  PASSWORD_VALIDATION_MESSAGE,
  PHONE_VALIDATION_MESSAGE
} from "../utils/validation.js";

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function createAdminToken(admin) {
  return jwt.sign(
    {
      adminId: admin._id,
      role: "admin"
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function getAdminCredential() {
  const existingAdmin = await AdminCredential.findOne();
  if (existingAdmin) return existingAdmin;

  return AdminCredential.create({
    username: "admin",
    passwordHash: await bcrypt.hash("admin!@#", 12)
  });
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email || "",
    role: user.role,
    isApproved: user.isApproved,
    isAvailable: user.isAvailable
  };
}

export async function registerCustomer(req, res, next) {
  try {
    const { name, phone, email, password } = req.body;
    const normalizedPhone = String(phone || "").trim();

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "Name, phone, email, and password are required." });
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

    const customer = await User.create({
      name,
      phone: normalizedPhone,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "customer",
      isApproved: true
    });

    res.status(201).json({
      token: createToken(customer),
      user: serializeUser(customer)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, username, password } = req.body;
    const loginId = email || username;

    if (!loginId || !password) {
      return res.status(400).json({ message: "Username/email and password are required." });
    }

    const admin = await getAdminCredential();
    const isAdminLogin = admin.username === loginId;
    const isValidAdminPassword = isAdminLogin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (isValidAdminPassword) {
      return res.json({
        token: createAdminToken(admin),
        user: {
          id: admin._id,
          name: admin.username,
          username: admin.username,
          email: "",
          role: "admin",
          isApproved: true,
          isAvailable: true
        }
      });
    }

    const user = await User.findOne({ email: loginId });
    const isValidPassword = user?.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !isValidPassword) {
      return res.status(401).json({ message: "Invalid username/email or password." });
    }

    if (user.role === "driver" && !user.isApproved) {
      return res.status(403).json({ message: "Driver account is pending admin approval." });
    }

    res.json({
      token: createToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}
// j