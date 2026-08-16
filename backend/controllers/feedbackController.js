const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const { logAdminAction, logUserAction } = require("../services/auditService");

// @desc    Submit user feedback or AI session rating
// @route   POST /api/feedback
// @access  Private (Authenticated User)
const createFeedback = async (req, res) => {
  try {
    const { type, rating, subject, message, sessionId } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      sessionId: sessionId && mongoose.Types.ObjectId.isValid(sessionId) ? sessionId : null,
      type: type || "GENERAL",
      rating: parseInt(rating, 10) || 5,
      subject,
      message,
    });

    await logUserAction(
      req.user,
      "FEEDBACK_SUBMIT",
      "SYSTEM",
      feedback._id,
      `User submitted ${feedback.type} feedback: '${feedback.subject}'`,
      req.ip,
      req
    );

    if (req.io) {
      req.io.emit("feedback_new", feedback);
    }

    return res.status(201).json({
      message: "Thank you! Your feedback has been submitted successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Create Feedback Error:", error);
    return res.status(500).json({ message: "Failed to submit feedback." });
  }
};

// @desc    Get user's submitted feedback list & admin responses
// @route   GET /api/feedback/my
// @access  Private (Authenticated User)
const getMyFeedback = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const feedbackList = await Feedback.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ feedbackList });
  } catch (error) {
    console.error("Get My Feedback Error:", error);
    return res.status(500).json({ message: "Failed to load your feedback history." });
  }
};

// @desc    Get all feedback for Admin with filters and pagination
// @route   GET /api/admin/feedback
// @access  Private (Admin Only)
const getAdminFeedback = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10, search } = req.query;

    let filter = {};
    if (status && status !== "ALL") {
      filter.status = status;
    }
    if (type && type !== "ALL") {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [feedbackList, total] = await Promise.all([
      Feedback.find(filter)
        .populate("userId", "name email")
        .populate("sessionId", "topic overallScore")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Feedback.countDocuments(filter),
    ]);

    // Mark any NEW feedback as REVIEWING so badge counter clears permanently from DB
    await Feedback.updateMany({ status: "NEW" }, { $set: { status: "REVIEWING" } });

    return res.status(200).json({
      success: true,
      data: {
        feedbackList,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("Get Admin Feedback Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load feedback list." });
  }
};

// @desc    Respond to user feedback and update status
// @route   PATCH /api/admin/feedback/:id/respond
// @access  Private (Admin Only)
const respondToFeedback = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Feedback ID format." });
    }

    const { adminResponse, status } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback entry not found." });
    }

    if (adminResponse !== undefined) feedback.adminResponse = adminResponse;
    if (status && ["NEW", "REVIEWING", "RESOLVED", "REJECTED"].includes(status)) {
      feedback.status = status;
    }

    await feedback.save();

    await logAdminAction(
      req.user,
      "FEEDBACK_RESPOND",
      "SYSTEM",
      feedback._id,
      `Responded to feedback '${feedback.subject}' with status '${feedback.status}'`,
      req.ip,
      req
    );

    return res.status(200).json({
      message: "Feedback response saved successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Respond to Feedback Error:", error);
    return res.status(500).json({ message: "Failed to save response." });
  }
};

// @desc    Delete feedback entry (User owned or Admin)
// @route   DELETE /api/feedback/:id
// @access  Private (Authenticated User or Admin)
const deleteFeedback = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Feedback ID." });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback entry not found." });
    }

    if (req.user.role !== "ADMIN" && feedback.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. Cannot delete another user's feedback." });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Feedback entry deleted successfully." });
  } catch (error) {
    console.error("Delete Feedback Error:", error);
    return res.status(500).json({ message: "Failed to delete feedback entry." });
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  getAdminFeedback,
  respondToFeedback,
  deleteFeedback,
};
