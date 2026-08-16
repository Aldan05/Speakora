const mongoose = require("mongoose");
const Session = require("../models/Session");

/**
 * Reusable MongoDB Aggregation service for user analytics & progress tracking
 */

// @desc    Get progress history for completed sessions within range
const getProgressHistory = async (userId, range = "all") => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  let dateFilter = {};
  const now = new Date();

  if (range === "7d") {
    dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
  } else if (range === "30d") {
    dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
  } else if (range === "90d") {
    dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 90)) } };
  }

  const pipeline = [
    {
      $match: {
        userId: userObjectId,
        processingStatus: "completed",
        overallScore: { $ne: null },
        ...dateFilter,
      },
    },
    { $sort: { createdAt: 1 } },
    {
      $project: {
        _id: 1,
        date: "$createdAt",
        topic: 1,
        overallScore: 1,
        grammarScore: 1,
        vocabularyScore: 1,
        fluencyScore: 1,
        pronunciationScore: 1,
        wordsPerMinute: 1,
        duration: 1,
      },
    },
  ];

  return await Session.aggregate(pipeline);
};

// @desc    Get topic performance grouped by topic title
const getTopicPerformance = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    {
      $match: {
        userId: userObjectId,
        processingStatus: "completed",
        overallScore: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$topic",
        sessionsCount: { $sum: 1 },
        avgScore: { $avg: "$overallScore" },
        bestScore: { $max: "$overallScore" },
        avgDuration: { $avg: "$duration" },
      },
    },
    {
      $project: {
        topic: "$_id",
        sessionsCount: 1,
        avgScore: { $round: ["$avgScore", 1] },
        bestScore: 1,
        avgDuration: { $round: ["$avgDuration", 0] },
        _id: 0,
      },
    },
    { $sort: { avgScore: -1 } },
  ];

  return await Session.aggregate(pipeline);
};

// @desc    Get user dashboard summary metrics
const getUserDashboardMetrics = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    {
      $match: {
        userId: userObjectId,
        processingStatus: "completed",
        overallScore: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgOverallScore: { $avg: "$overallScore" },
        avgGrammar: { $avg: "$grammarScore" },
        avgVocabulary: { $avg: "$vocabularyScore" },
        avgFluency: { $avg: "$fluencyScore" },
        avgPronunciation: { $avg: "$pronunciationScore" },
        bestScore: { $max: "$overallScore" },
        totalSpeakingTime: { $sum: "$duration" },
      },
    },
  ];

  const results = await Session.aggregate(pipeline);

  if (!results || results.length === 0) {
    return {
      totalSessions: 0,
      avgOverallScore: 0,
      avgGrammar: 0,
      avgVocabulary: 0,
      avgFluency: 0,
      avgPronunciation: 0,
      bestScore: 0,
      totalSpeakingTime: 0,
    };
  }

  const data = results[0];
  return {
    totalSessions: data.totalSessions,
    avgOverallScore: Math.round(data.avgOverallScore || 0),
    avgGrammar: Math.round(data.avgGrammar || 0),
    avgVocabulary: Math.round(data.avgVocabulary || 0),
    avgFluency: Math.round(data.avgFluency || 0),
    avgPronunciation: Math.round(data.avgPronunciation || 0),
    bestScore: data.bestScore || 0,
    totalSpeakingTime: data.totalSpeakingTime || 0,
  };
};

module.exports = {
  getProgressHistory,
  getTopicPerformance,
  getUserDashboardMetrics,
};
