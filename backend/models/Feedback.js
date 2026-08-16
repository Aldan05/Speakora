const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["GENERAL", "BUG", "FEATURE_REQUEST", "AI_FEEDBACK", "SUPPORT"],
      default: "GENERAL",
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    adminResponse: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["NEW", "REVIEWING", "RESOLVED", "REJECTED"],
      default: "NEW",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
