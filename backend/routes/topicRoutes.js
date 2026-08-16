const express = require("express");
const router = express.Router();
const {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  toggleTopicStatus,
  deleteTopic,
} = require("../controllers/topicController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

// Public/User authenticated endpoints
router.get("/", auth, getTopics);
router.get("/:id", auth, getTopicById);

// Admin-only protected endpoints
router.post("/", auth, adminOnly, createTopic);
router.put("/:id", auth, adminOnly, updateTopic);
router.patch("/:id/status", auth, adminOnly, toggleTopicStatus);
router.delete("/:id", auth, adminOnly, deleteTopic);

module.exports = router;
