const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Session = require("../models/Session");
const {
  getAdminPlatformMetrics,
  getAdminSessionsList,
  getAdminUsersList,
  getAdminAuditLogs,
} = require("../services/adminService");
const { logAdminAction } = require("../services/auditService");
const { transcribeAudio, analyzeTranscript } = require("../services/aiService");

// @desc    Get Admin Dashboard Overview Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
const getAdminDashboard = async (req, res) => {
  try {
    const metrics = await getAdminPlatformMetrics();
    const recentUsers = await User.find().select("-password").sort({ createdAt: -1 }).limit(5);
    const recentSessions = await Session.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      data: {
        metrics,
        recentUsers,
        recentSessions,
      },
    });
  } catch (error) {
    console.error("Get Admin Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load admin metrics." });
  }
};

// @desc    Get Paginated Sessions List for Admin Monitoring
// @route   GET /api/admin/sessions
// @access  Private (Admin Only)
const getAdminSessions = async (req, res) => {
  try {
    const data = await getAdminSessionsList(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Admin Sessions Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch session list." });
  }
};

// @desc    Get Paginated Users List for Admin Management
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getAdminUsers = async (req, res) => {
  try {
    const data = await getAdminUsersList(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Admin Users Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users list." });
  }
};

// @desc    Toggle User Active/Deactivated Status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin Only)
const toggleUserStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAdminAction(
      req.user,
      "USER_STATUS_TOGGLE",
      "USER",
      user._id,
      `User ${user.email} set to ${user.isActive ? "ACTIVE" : "DEACTIVATED"}`,
      req.ip
    );

    return res.status(200).json({
      message: `User account ${user.isActive ? "activated" : "deactivated"} successfully.`,
      user: { id: user._id, email: user.email, isActive: user.isActive },
    });
  } catch (error) {
    console.error("Toggle User Status Error:", error);
    return res.status(500).json({ message: "Failed to update user status." });
  }
};

// @desc    Retry AI Processing for a Failed Session
// @route   POST /api/admin/sessions/:id/retry
// @access  Private (Admin Only)
const retrySessionProcessing = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Session ID." });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (session.processingStatus === "processing") {
      return res.status(400).json({ message: "Session is already being processed." });
    }

    const filename = path.basename(session.audioUrl);
    const absoluteFilePath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({ message: "Audio recording file missing on server." });
    }

    session.processingStatus = "processing";
    await session.save();

    await logAdminAction(
      req.user,
      "SESSION_RETRY",
      "SESSION",
      session._id,
      `Triggered AI retry for session ${session._id}`,
      req.ip
    );

    res.status(200).json({ message: "AI processing retry initiated.", session });

    // Background Async Retry Pipeline
    (async () => {
      try {
        const sttResult = await transcribeAudio(absoluteFilePath);
        session.transcript = sttResult.transcript;
        session.wordsSpoken = sttResult.wordsSpoken;

        const analysisData = await analyzeTranscript(session.transcript, session.duration, sttResult.language || "en");

        if (analysisData.insufficientData) {
          session.processingStatus = "completed";
          await session.save();
          return;
        }

        const scores = analysisData.scores || {};
        const stats = analysisData.statistics || {};

        session.grammarScore = scores.grammar;
        session.vocabularyScore = scores.vocabulary;
        session.fluencyScore = scores.fluency;
        session.pronunciationScore = scores.pronunciation;
        session.overallScore = scores.overall;

        session.wordsPerMinute = stats.wordsPerMinute;
        session.uniqueWordCount = stats.uniqueWordCount;
        session.vocabularyRichness = stats.vocabularyRichness;
        session.fillerWordCount = stats.fillerWordCount;

        session.grammarIssues = (analysisData.grammar?.issues || []).map((i) => `${i.text} -> ${i.message}`);
        session.vocabularySuggestions = analysisData.vocabulary?.suggestions || [];
        session.fluencySuggestions = analysisData.fluency?.suggestions || [];

        session.strengths = analysisData.strengths || [];
        session.improvements = analysisData.improvements || [];

        session.processingStatus = "completed";
        await session.save();
      } catch (err) {
        console.error(`[Admin Session Retry Failed] ${session._id}:`, err.message);
        session.processingStatus = "failed";
        await session.save();
      }
    })();
  } catch (error) {
    console.error("Retry Session Processing Error:", error);
    return res.status(500).json({ message: "Failed to initiate AI retry." });
  }
};

// @desc    Get Audit Logs for Admin
// @route   GET /api/admin/audit-logs
// @access  Private (Admin Only)
const getAuditLogs = async (req, res) => {
  try {
    const data = await getAdminAuditLogs(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs." });
  }
};

// @desc    Delete a Session as Admin
// @route   DELETE /api/admin/sessions/:id
// @access  Private (Admin Only)
const deleteAdminSession = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Session ID." });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (session.audioUrl) {
      const filename = path.basename(session.audioUrl);
      const audioPath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(audioPath)) {
        try {
          fs.unlinkSync(audioPath);
        } catch (e) {
          console.warn("Failed to unlink audio file:", e.message);
        }
      }
    }

    await Session.findByIdAndDelete(req.params.id);

    await logAdminAction(
      req.user,
      "SESSION_DELETE",
      "SESSION",
      req.params.id,
      `Deleted session "${session.topic}" (${session._id})`,
      req.ip
    );

    if (req.io) {
      req.io.emit("session_update");
      req.io.emit("metrics_update");
    }

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Admin Session Error:", error);
    return res.status(500).json({ message: "Failed to delete session." });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminSessions,
  getAdminUsers,
  toggleUserStatus,
  retrySessionProcessing,
  deleteAdminSession,
  getAuditLogs,
};
