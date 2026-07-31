import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Admin
    const adminExists = await User.findOne({ email: "admin@leadflow.com" });
    if (!adminExists) {
      await User.create({
        name: "Admin User",
        email: "admin@leadflow.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      });
      console.log("✅ Admin created");
    } else {
      console.log("⏭️  Admin already exists");
    }

    // Member
    const memberExists = await User.findOne({ email: "member@leadflow.com" });
    if (!memberExists) {
      await User.create({
        name: "Member User",
        email: "member@leadflow.com",
        password: await bcrypt.hash("member123", 10),
        role: "member",
      });
      console.log("✅ Member created");
    } else {
      console.log("⏭️  Member already exists");
    }

    console.log("\n🎉 Seed complete!\n");
    console.log("Admin  → admin@leadflow.com  / admin123");
    console.log("Member → member@leadflow.com / member123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
