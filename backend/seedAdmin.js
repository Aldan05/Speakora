require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/speakora";
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const adminEmail = "admin@speakora.com";
    
    // Remove old hashed admin account to replace with plain text admin account
    await User.deleteOne({ email: adminEmail });

    await User.create({
      name: "Speakora Admin",
      email: adminEmail,
      password: "Admin@123", // Plain text password
      role: "ADMIN",
      isActive: true,
    });

    console.log("-----------------------------------------");
    console.log("Admin account seeded with plain text password!");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: Admin@123");
    console.log("Role: ADMIN");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
