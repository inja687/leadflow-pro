import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import request from "supertest";

import app from "../app.js";
import User from "../models/User.js";

process.env.JWT_SECRET = "test-only-jwt-secret-profile";
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(
  process.cwd(),
  ".cache",
  "mongodb-binaries"
);

let mongoServer;
let user;
let token;

const createToken = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await User.deleteMany({});

  const password = await bcrypt.hash("password123", 10);
  user = await User.create({
    name: "Profile Tester",
    email: "profile@example.com",
    password,
    role: "member",
  });

  token = createToken(user);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe("User Profile & Password API", () => {
  describe("GET /api/auth/profile", () => {
    test("returns user profile info", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe("profile@example.com");
      expect(response.body.user.name).toBe("Profile Tester");
      expect(response.body.user.role).toBe("member");
      expect(response.body.user.password).toBeUndefined(); // Should exclude password
    });
  });

  describe("PUT /api/auth/change-password", () => {
    test("changes password with valid inputs", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "password123",
          newPassword: "newsecurepassword123",
          confirmPassword: "newsecurepassword123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user can login with new password
      const dbUser = await User.findById(user._id);
      const isPasswordCorrect = await bcrypt.compare("newsecurepassword123", dbUser.password);
      expect(isPasswordCorrect).toBe(true);
    });

    test("fails if current password is incorrect", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newsecurepassword123",
          confirmPassword: "newsecurepassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Incorrect current password.");
    });

    test("fails if new password does not match confirm password", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "password123",
          newPassword: "newsecurepassword123",
          confirmPassword: "differentconfirm",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("New password and confirm password do not match.");
    });

    test("fails if new password is too short", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "password123",
          newPassword: "123",
          confirmPassword: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("New password must be at least 6 characters long.");
    });

    test("fails if new password is same as current password", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "password123",
          newPassword: "password123",
          confirmPassword: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("New password cannot be the same as the current password.");
    });
  });
});
