import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import request from "supertest";

import app from "../app.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";

process.env.JWT_SECRET = "test-only-jwt-secret-member";
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(
  process.cwd(),
  ".cache",
  "mongodb-binaries"
);

let mongoServer;
let admin;
let member1;
let member2;
let adminToken;
let memberToken;

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);
  
  admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password,
    role: "admin",
  });
  
  member1 = await User.create({
    name: "Alice Member",
    email: "alice@example.com",
    password,
    role: "member",
  });

  member2 = await User.create({
    name: "Bob Member",
    email: "bob@example.com",
    password,
    role: "member",
  });

  adminToken = createToken(admin);
  memberToken = createToken(member1);

  // Create some leads assigned to alice
  await Lead.create([
    {
      name: "Lead 1",
      email: "lead1@example.com",
      phone: "123456",
      assignedTo: member1._id,
    },
    {
      name: "Lead 2",
      email: "lead2@example.com",
      phone: "654321",
      assignedTo: member1._id,
    }
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe("Admin Member Management API", () => {
  describe("GET /api/members (list members)", () => {
    test("allows admin to view all members with lead counts", async () => {
      const response = await request(app)
        .get("/api/members")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.members).toHaveLength(3); // admin, member1, member2

      // Check lead count for Alice
      const alice = response.body.members.find(m => m.email === "alice@example.com");
      expect(alice.totalLeads).toBe(2);

      // Check lead count for Bob
      const bob = response.body.members.find(m => m.email === "bob@example.com");
      expect(bob.totalLeads).toBe(0);
    });

    test("filters members by search query", async () => {
      const response = await request(app)
        .get("/api/members?search=alice")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].name).toBe("Alice Member");
    });

    test("prevents members from listing users", async () => {
      const response = await request(app)
        .get("/api/members")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/members/:id (single member)", () => {
    test("allows admin to get a single member profile", async () => {
      const response = await request(app)
        .get(`/api/members/${member1._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.member.name).toBe("Alice Member");
      expect(response.body.member.totalLeads).toBe(2);
    });

    test("returns 404 if member not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/members/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    test("prevents members from viewing another user profile", async () => {
      const response = await request(app)
        .get(`/api/members/${member2._id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/members/:id (update member)", () => {
    test("allows admin to update member details", async () => {
      const response = await request(app)
        .put(`/api/members/${member2._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Bob",
          email: "bob_updated@example.com",
          role: "admin",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.member.name).toBe("Updated Bob");
      expect(response.body.member.email).toBe("bob_updated@example.com");
      expect(response.body.member.role).toBe("admin");
    });

    test("returns 400 if email is already taken", async () => {
      const response = await request(app)
        .put(`/api/members/${member2._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "alice@example.com", // taken by member1
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("already taken");
    });

    test("prevents members from updating users", async () => {
      const response = await request(app)
        .put(`/api/members/${member2._id}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Hack attempt",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("PATCH /api/members/:id/status (toggle status)", () => {
    test("allows admin to toggle member status", async () => {
      const response = await request(app)
        .patch(`/api/members/${member1._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" });

      expect(response.status).toBe(200);
      expect(response.body.member.status).toBe("inactive");

      // Verify DB change
      const user = await User.findById(member1._id);
      expect(user.status).toBe("inactive");
    });

    test("prevents admin from deactivating themselves", async () => {
      const response = await request(app)
        .patch(`/api/members/${admin._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("You cannot deactivate your own admin account");
    });

    test("prevents members from modifying status", async () => {
      const response = await request(app)
        .patch(`/api/members/${member2._id}/status`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ status: "inactive" });

      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/members (create member)", () => {
    test("allows admin to create a member with auto-generated password", async () => {
      const response = await request(app)
        .post("/api/members")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "John Auto",
          email: "john_auto@example.com",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.member.name).toBe("John Auto");
      expect(response.body.member.role).toBe("member");
      expect(response.body.credentials.email).toBe("john_auto@example.com");
      expect(response.body.credentials.temporaryPassword).toHaveLength(15); // hex(12) + "A1!"
    });

    test("allows admin to create a member with manual password", async () => {
      const response = await request(app)
        .post("/api/members")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "John Manual",
          email: "john_manual@example.com",
          password: "mySecretPassword123!",
        });

      expect(response.status).toBe(201);
      expect(response.body.credentials.temporaryPassword).toBe("mySecretPassword123!");
    });

    test("returns 400 if email already exists", async () => {
      const response = await request(app)
        .post("/api/members")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Duplicate User",
          email: "alice@example.com", // existing from beforeEach
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("already exists");
    });

    test("prevents member from creating another user", async () => {
      const response = await request(app)
        .post("/api/members")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Unauthorized Member",
          email: "unauth@example.com",
        });

      expect(response.status).toBe(403);
    });
  });
});
