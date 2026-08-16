const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const topicRoutes = require("./routes/topicRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Speakora Backend API is running." });
});

io.on("connection", (socket) => {
  console.log("Client connected via Socket.io:", socket.id);

  const emitStats = async () => {
    try {
      const users = await User.find().select("-password").sort({ createdAt: -1 });
      const totalUsers = users.filter(u => u.role === "USER").length;
      const totalAdmins = users.filter(u => u.role === "ADMIN").length;
      
      socket.emit("users_update", {
        users,
        stats: {
          totalUsers,
          totalAdmins,
          totalAccounts: users.length,
        },
      });
    } catch (err) {
      console.error("Socket emit error:", err);
    }
  };

  emitStats();

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/speakora";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    server.listen(PORT, () => {
      console.log(`Server running with Socket.io on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (MongoDB disconnected)`);
    });
  });
