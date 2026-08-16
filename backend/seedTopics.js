require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Topic = require("./models/Topic");

const seedTopics = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/speakora";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Seeding Topics...");

    const admin = await User.findOne({ role: "ADMIN" });
    if (!admin) {
      console.log("No admin found to seed topics. Please run seedAdmin.js first.");
      process.exit(1);
    }

    const topicsCount = await Topic.countDocuments();
    if (topicsCount === 0) {
      const sampleTopics = [
        {
          title: "Tell me about yourself",
          description: "Introduce yourself and briefly explain your educational background, skills, and career interests.",
          instructions: "Speak naturally and organize your answer clearly into background, passions, and goals.",
          category: "Self Introduction",
          difficulty: "BEGINNER",
          recommendedDuration: 120, // 2 mins
          preparationTime: 30,
          isActive: true,
          createdBy: admin._id,
        },
        {
          title: "What are your career goals?",
          description: "Discuss where you see yourself professionally in the next 3 to 5 years and how you plan to achieve it.",
          instructions: "Highlight key milestones, desired skills, and motivation.",
          category: "Career",
          difficulty: "INTERMEDIATE",
          recommendedDuration: 180, // 3 mins
          preparationTime: 45,
          isActive: true,
          createdBy: admin._id,
        },
        {
          title: "Describe your favorite technology",
          description: "Explain a tool, device, or software application that you use daily and why it makes your life better.",
          instructions: "Describe features, personal impact, and future expectations.",
          category: "Technology",
          difficulty: "BEGINNER",
          recommendedDuration: 120, // 2 mins
          preparationTime: 30,
          isActive: true,
          createdBy: admin._id,
        },
        {
          title: "Is social media beneficial for students?",
          description: "Provide arguments for and against student social media usage and share your personal conclusion.",
          instructions: "Use clear transitions (On one hand, However, In conclusion).",
          category: "Debate",
          difficulty: "ADVANCED",
          recommendedDuration: 300, // 5 mins
          preparationTime: 60,
          isActive: true,
          createdBy: admin._id,
        },
        {
          title: "Describe a challenging experience you faced",
          description: "Narrate an obstacle or problem you encountered, how you dealt with it, and what you learned from it.",
          instructions: "Use the STAR technique (Situation, Task, Action, Result).",
          category: "Interview",
          difficulty: "INTERMEDIATE",
          recommendedDuration: 180, // 3 mins
          preparationTime: 45,
          isActive: true,
          createdBy: admin._id,
        },
      ];

      await Topic.insertMany(sampleTopics);
      console.log(`Successfully seeded ${sampleTopics.length} initial speaking topics!`);
    } else {
      console.log(`Database already has ${topicsCount} topics.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Topic Seeding Error:", error);
    process.exit(1);
  }
};

seedTopics();
