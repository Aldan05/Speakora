const {
  getProgressHistory,
  getTopicPerformance,
  getUserDashboardMetrics,
} = require("../services/analyticsService");

// @desc    Get authenticated user's progress history (7d, 30d, 90d, all)
// @route   GET /api/users/progress
// @access  Private (Authenticated User)
const getUserProgress = async (req, res) => {
  try {
    const range = req.query.range || "all";
    const data = await getProgressHistory(req.user.id, range);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get User Progress Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load progress history." });
  }
};

// @desc    Get authenticated user's topic performance summary
// @route   GET /api/users/topic-performance
// @access  Private (Authenticated User)
const getUserTopicPerformance = async (req, res) => {
  try {
    const data = await getTopicPerformance(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Topic Performance Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load topic performance data." });
  }
};

// @desc    Get authenticated user dashboard statistics
// @route   GET /api/users/dashboard
// @access  Private (Authenticated User)
const getUserDashboardData = async (req, res) => {
  try {
    const metrics = await getUserDashboardMetrics(req.user.id);
    return res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    console.error("Get User Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load user dashboard metrics." });
  }
};

module.exports = {
  getUserProgress,
  getUserTopicPerformance,
  getUserDashboardData,
};
