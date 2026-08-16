const mongoose = require("mongoose");
const Session = require("c:/Users/Aldan/Downloads/speakora/backend/models/Session");

mongoose.connect("mongodb://127.0.0.1:27017/speakora").then(async () => {
  const res = await Session.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
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
  ]);
  
  console.log("REAL ACTIVE USERS COUNT PER DAY:");
  res.forEach((r) => {
    console.log(`Date: 2026-08-${r._id.day} => Sessions: ${r.sessions}, Active Users: ${r.activeUsersSet.length}`);
  });
  
  mongoose.disconnect();
});
