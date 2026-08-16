require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Session = require("./models/Session");

const seedData = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/speakora";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Seeding...");

    // Find test user Aldan or create one
    let testUser = await User.findOne({ email: "aldan@example.com" });

    if (!testUser) {
      testUser = await User.create({
        name: "Aldan",
        email: "aldan@example.com",
        password: "password123",
        role: "USER",
        isActive: true,
      });
      console.log("Created test user: aldan@example.com / password123");
    }

    // Check if sessions exist for testUser
    const sessionCount = await Session.countDocuments({ userId: testUser._id });

    if (sessionCount === 0) {
      const sampleTopics = [
        "Self Introduction & Hobbies",
        "My Favorite Travel Destination",
        "The Impact of AI in Daily Life",
        "Healthy Habits and Fitness",
        "Public Speaking & Presentation Skills",
      ];

      const sessionsToInsert = sampleTopics.map((topic, index) => {
        const grammar = Math.floor(Math.random() * 20) + 75;
        const vocabulary = Math.floor(Math.random() * 20) + 75;
        const fluency = Math.floor(Math.random() * 20) + 70;
        const pronunciation = Math.floor(Math.random() * 20) + 75;
        const overall = Math.round((grammar + vocabulary + fluency + pronunciation) / 4);

        return {
          userId: testUser._id,
          topic,
          duration: Math.floor(Math.random() * 90) + 60,
          overallScore: overall,
          grammarScore: grammar,
          vocabularyScore: vocabulary,
          fluencyScore: fluency,
          pronunciationScore: pronunciation,
          status: "Completed",
          createdAt: new Date(Date.now() - (5 - index) * 86400000), // Spaced out days
        };
      });

      await Session.insertMany(sessionsToInsert);
      console.log(`Seeded ${sessionsToInsert.length} practice sessions for user Aldan.`);
    } else {
      console.log(`Test user Aldan already has ${sessionCount} practice sessions.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
