const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Topic = require("../models/Topic");
const Session = require("../models/Session");
const { logAdminAction } = require("../services/auditService");

// @desc    Get all topics (Admins get all including inactive, users get active)
// @route   GET /api/topics
// @access  Private (Authenticated User or Admin)
const getTopics = async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (req.user.role !== "ADMIN") {
      filter.isActive = true;
    }

    if (category && category !== "ALL") {
      filter.category = category;
    }

    if (difficulty && difficulty !== "ALL") {
      filter.difficulty = difficulty.toUpperCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [topics, total] = await Promise.all([
      Topic.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate("createdBy", "name email"),
      Topic.countDocuments(filter),
    ]);

    return res.status(200).json({
      topics,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    console.error("Get Topics Error:", error);
    return res.status(500).json({ message: "Failed to fetch speaking topics." });
  }
};

// @desc    Get single topic by ID
// @route   GET /api/topics/:id
// @access  Private (Authenticated User or Admin)
const getTopicById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Topic ID format." });
    }

    const topic = await Topic.findById(req.params.id).populate("createdBy", "name email");

    if (!topic) {
      return res.status(404).json({ message: "Speaking topic not found." });
    }

    return res.status(200).json({ topic });
  } catch (error) {
    console.error("Get Topic By ID Error:", error);
    return res.status(500).json({ message: "Failed to fetch topic details." });
  }
};

// @desc    Create new topic
// @route   POST /api/topics
// @access  Private (ADMIN only)
const createTopic = async (req, res) => {
  try {
    const { title, description, instructions, category, difficulty, recommendedDuration, preparationTime } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const topic = await Topic.create({
      title,
      description,
      instructions: instructions || "",
      category: category || "General",
      difficulty: difficulty ? difficulty.toUpperCase() : "BEGINNER",
      recommendedDuration: parseInt(recommendedDuration, 10) || 120,
      preparationTime: parseInt(preparationTime, 10) || 30,
      createdBy: req.user.id,
    });

    await logAdminAction(
      req.user,
      "TOPIC_CREATE",
      "TOPIC",
      topic._id,
      `Created topic '${topic.title}'`,
      req.ip
    );

    return res.status(201).json({
      message: "Speaking topic created successfully",
      topic,
    });
  } catch (error) {
    console.error("Create Topic Error:", error);
    return res.status(500).json({ message: "Failed to create speaking topic." });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private (ADMIN only)
const updateTopic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Topic ID format." });
    }

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Speaking topic not found." });
    }

    const fields = ["title", "description", "instructions", "category", "difficulty", "recommendedDuration", "preparationTime"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "difficulty") {
          topic[field] = req.body[field].toUpperCase();
        } else {
          topic[field] = req.body[field];
        }
      }
    });

    await topic.save();

    await logAdminAction(
      req.user,
      "TOPIC_UPDATE",
      "TOPIC",
      topic._id,
      `Updated topic '${topic.title}'`,
      req.ip
    );

    return res.status(200).json({
      message: "Speaking topic updated successfully",
      topic,
    });
  } catch (error) {
    console.error("Update Topic Error:", error);
    return res.status(500).json({ message: "Failed to update speaking topic." });
  }
};

// @desc    Toggle topic active status
// @route   PATCH /api/topics/:id/status
// @access  Private (ADMIN only)
const toggleTopicStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Topic ID format." });
    }

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Speaking topic not found." });
    }

    topic.isActive = !topic.isActive;
    await topic.save();

    await logAdminAction(
      req.user,
      "TOPIC_STATUS_TOGGLE",
      "TOPIC",
      topic._id,
      `Toggled topic '${topic.title}' active status to ${topic.isActive}`,
      req.ip
    );

    return res.status(200).json({
      message: `Topic ${topic.isActive ? "activated" : "deactivated"} successfully.`,
      topic,
    });
  } catch (error) {
    console.error("Toggle Topic Status Error:", error);
    return res.status(500).json({ message: "Failed to toggle topic status." });
  }
};

// @desc    Safely delete topic with session safety check
// @route   DELETE /api/topics/:id
// @access  Private (ADMIN only)
const deleteTopic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Topic ID format." });
    }

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Speaking topic not found." });
    }

    // Safety check: if topic has existing practice sessions, deactivate instead
    const sessionCount = await Session.countDocuments({ topicId: topic._id });

    if (sessionCount > 0) {
      topic.isActive = false;
      await topic.save();

      await logAdminAction(
        req.user,
        "TOPIC_DEACTIVATE_SAFETY",
        "TOPIC",
        topic._id,
        `Deactivated topic '${topic.title}' because it has ${sessionCount} historical sessions`,
        req.ip
      );

      return res.status(409).json({
        message: `Topic has ${sessionCount} historical practice sessions. Topic was deactivated instead of deleted to protect user history.`,
        deactivated: true,
        topic,
      });
    }

    await Topic.findByIdAndDelete(req.params.id);

    await logAdminAction(
      req.user,
      "TOPIC_DELETE",
      "TOPIC",
      topic._id,
      `Permanently deleted topic '${topic.title}'`,
      req.ip
    );

    return res.status(200).json({
      message: "Speaking topic permanently deleted.",
    });
  } catch (error) {
    console.error("Delete Topic Error:", error);
    return res.status(500).json({ message: "Failed to delete speaking topic." });
  }
};

module.exports = {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  toggleTopicStatus,
  deleteTopic,
};
