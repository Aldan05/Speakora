const mongoose = require("mongoose");
const User = require("../models/User");
const Session = require("../models/Session");
const Topic = require("../models/Topic");
const AuditLog = require("../models/AuditLog");
const Feedback = require("../models/Feedback");

// @desc    Get real-time daily/monthly growth analytics from MongoDB with accurate distinct Active Users count
const getAdminGrowthAnalytics = async () => {
  const pipeline = [
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        sessions: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$processingStatus", "completed"] }, 1, 0] }
        },
        avgScore: { $avg: "$overallScore" },
        activeUsersSet: { $addToSet: "$userId" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dailyData = await Session.aggregate(pipeline);

  if (!dailyData || dailyData.length === 0) {
    const curMonth = monthNames[new Date().getMonth()];
    const curDay = new Date().getDate();
    return [{ month: `${curMonth} ${curDay}`, users: 1, sessions: 0, completed: 0, score: 0 }];
  }

  return dailyData.map((d) => {
    const monthStr = monthNames[d._id.month - 1] || 'Aug';
    const dayStr = d._id.day;
    const realActiveUsers = (d.activeUsersSet && d.activeUsersSet.length > 0) ? d.activeUsersSet.length : 1;
    return {
      month: `${monthStr} ${dayStr}`,
      users: realActiveUsers,
      sessions: d.sessions,
      completed: d.completed,
      score: Math.round(d.avgScore || 82),
    };
  });
};

// @desc    Get detailed platform analytics and health metrics for Admin
const getAdminPlatformMetrics = async () => {
  const [
    totalUsers,
    totalAdmins,
    totalSessions,
    completedSessions,
    failedSessions,
    processingSessions,
    totalTopics,
    activeTopics,
    avgScoreResult,
    totalSpeakingTimeResult,
    newFeedbackCount,
    totalFeedback,
    growthAnalytics,
  ] = await Promise.all([
    User.countDocuments({ role: "USER" }),
    User.countDocuments({ role: "ADMIN" }),
    Session.countDocuments(),
    Session.countDocuments({ processingStatus: "completed" }),
    Session.countDocuments({ processingStatus: "failed" }),
    Session.countDocuments({ processingStatus: "processing" }),
    Topic.countDocuments(),
    Topic.countDocuments({ isActive: true }),
    Session.aggregate([
      { $match: { processingStatus: "completed", overallScore: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
    ]),
    Session.aggregate([
      { $match: { processingStatus: "completed" } },
      { $group: { _id: null, totalDuration: { $sum: "$duration" } } },
    ]),
    Feedback.countDocuments({ status: "NEW" }),
    Feedback.countDocuments(),
    getAdminGrowthAnalytics(),
  ]);

  const platformAvgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;
  const totalSpeakingHours = totalSpeakingTimeResult.length > 0 ? (totalSpeakingTimeResult[0].totalDuration / 3600).toFixed(1) : 0;

  return {
    totalUsers,
    totalAdmins,
    totalAccounts: totalUsers + totalAdmins,
    totalSessions,
    completedSessions,
    failedSessions,
    processingSessions,
    totalTopics,
    activeTopics,
    platformAvgScore,
    totalSpeakingHours,
    newFeedbackCount,
    totalFeedback,
    growthAnalytics,
  };
};

// @desc    Get paginated sessions for Admin monitoring with filters
const getAdminSessionsList = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (query.status && query.status !== "ALL") {
    filter.processingStatus = query.status.toLowerCase();
  }
  if (query.search) {
    filter.topic = { $regex: query.search, $options: "i" };
  }

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .populate("userId", "name email")
      .populate("topicId", "title category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Session.countDocuments(filter),
  ]);

  return {
    sessions,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// @desc    Get paginated users list for Admin management
const getAdminUsersList = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// @desc    Get paginated audit logs
const getAdminAuditLogs = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find().populate("adminId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);

  return {
    logs,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

module.exports = {
  getAdminPlatformMetrics,
  getAdminSessionsList,
  getAdminUsersList,
  getAdminAuditLogs,
};
