const express = require("express");
const router = express.Router();
const {
  getUserProgress,
  getUserTopicPerformance,
  getUserDashboardData,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

router.get("/dashboard", auth, getUserDashboardData);
router.get("/progress", auth, getUserProgress);
router.get("/topic-performance", auth, getUserTopicPerformance);

module.exports = router;
