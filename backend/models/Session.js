const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    audioUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ["Completed", "Processing", "Failed", "Pending"],
      default: "Completed",
      index: true,
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "completed",
    },

    // Future AI Analysis Fields
    transcript: { type: String, default: "" },
    wordsSpoken: { type: Number, default: null },
    wordsPerMinute: { type: Number, default: null },
    fillerWordCount: { type: Number, default: null },
    uniqueWordCount: { type: Number, default: null },
    vocabularyRichness: { type: Number, default: null },

    grammarScore: { type: Number, default: null },
    vocabularyScore: { type: Number, default: null },
    fluencyScore: { type: Number, default: null },
    paceScore: { type: Number, default: null },
    pronunciationScore: { type: Number, default: null },
    overallScore: { type: Number, default: null },

    grammarIssues: { type: [String], default: [] },
    vocabularySuggestions: { type: [String], default: [] },
    fluencySuggestions: { type: [String], default: [] },
    pronunciationFeedback: { type: String, default: "" },

    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    improvementCards: { type: Array, default: [] },
    learningDetails: { type: Object, default: null },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Session", sessionSchema);
