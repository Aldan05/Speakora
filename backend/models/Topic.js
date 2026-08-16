const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      required: [true, "Difficulty is required"],
      default: "BEGINNER",
      index: true,
    },
    recommendedDuration: {
      type: Number, // stored in seconds
      required: [true, "Recommended duration is required"],
      min: [1, "Recommended duration must be greater than 0"],
    },
    preparationTime: {
      type: Number, // stored in seconds
      default: 0,
      min: [0, "Preparation time cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance search & aggregation indexes
topicSchema.index({ isActive: 1, category: 1, difficulty: 1, createdAt: -1 });
topicSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Topic", topicSchema);
