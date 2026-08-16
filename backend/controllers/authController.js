const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { logUserAction } = require("../services/auditService");

// Helper to safely trigger socket broadcast
const notifyRealtimeUpdate = (req) => {
  if (req.io) {
    User.find().select("-password").sort({ createdAt: -1 }).then(users => {
      const totalUsers = users.filter(u => u.role === "USER").length;
      const totalAdmins = users.filter(u => u.role === "ADMIN").length;
      req.io.emit("users_update", {
        users,
        stats: { totalUsers, totalAdmins, totalAccounts: users.length }
      });
    });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "your_super_secret_speakora_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Store plain text password directly in MongoDB without bcrypt hashing
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password,
      role: "USER",
    });

    await logUserAction(
      user,
      "USER_REGISTER",
      "USER",
      user._id,
      `New user registered account: ${user.email}`,
      req.ip,
      req
    );

    // Notify real-time WebSocket clients of new registration
    notifyRealtimeUpdate(req);

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact administrator." });
    }

    // Check plain text comparison OR bcrypt hash comparison
    let isMatch = (password === user.password);
    if (!isMatch && user.password && user.password.startsWith("$2b$")) {
      try {
        const bcrypt = require("bcryptjs");
        isMatch = await bcrypt.compare(password, user.password);
      } catch (err) {
        console.error("Bcrypt compare error:", err);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    await logUserAction(
      user,
      "USER_LOGIN",
      "USER",
      user._id,
      `User logged in: ${user.email} (${user.role})`,
      req.ip,
      req
    );

    // Trigger real-time active session update
    notifyRealtimeUpdate(req);

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error fetching profile." });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
