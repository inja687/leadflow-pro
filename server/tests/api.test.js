import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import request from "supertest";

import app from "../app.js";
import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";

process.env.JWT_SECRET = "test-only-jwt-secret";
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(
  process.cwd(),
  ".cache",
  "mongodb-binaries"
);

let mongoServer;
let admin;
let member;
let adminToken;
let memberToken;

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

const createLead = async (overrides = {}) =>
  Lead.create({
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "+1 555 010 0248",
    company: "Acme Inc.",
    ...overrides,
  });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await Promise.all([
    Activity.deleteMany({}),
    Lead.deleteMany({}),
    User.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);
  admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password,
    role: "admin",
  });
  member = await User.create({
    name: "Member User",
    email: "member@example.com",
    password,
    role: "member",
  });
  adminToken = createToken(admin);
  memberToken = createToken(member);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe("authentication", () => {
  test("registers a new member", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "new@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      user: { name: "New User", email: "new@example.com", role: "member" },
    });
    expect(await User.findOne({ email: "new@example.com" })).not.toBeNull();
  });

  test("logs in with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.role).toBe("admin");
  });

  test("rejects protected routes without a token", async () => {
    const response = await request(app).get("/api/leads");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Access denied. No token provided.",
    });
  });
});

describe("lead management", () => {
  test("allows an admin to create a lead and records activity", async () => {
    const response = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Taylor Kim",
        email: "taylor@example.com",
        phone: "+1 555 010 0756",
        company: "Northstar",
        status: "new",
      });

    expect(response.status).toBe(201);
    expect(response.body.lead).toMatchObject({
      name: "Taylor Kim",
      status: "new",
    });
    expect(await Activity.countDocuments({ action: "lead_created" })).toBe(1);
  });

  test("allows a member to update only the status of an assigned lead", async () => {
    const lead = await createLead({ assignedTo: member._id });

    const response = await request(app)
      .put(`/api/leads/${lead._id}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "contacted", name: "Attempted change" });

    expect(response.status).toBe(200);
    expect(response.body.lead.status).toBe("contacted");
    expect(response.body.lead.name).toBe("Jordan Lee");
    expect(await Activity.countDocuments({ action: "status_changed" })).toBe(1);
  });

  test("allows an admin to delete a lead", async () => {
    const lead = await createLead();

    const response = await request(app)
      .delete(`/api/leads/${lead._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(await Lead.findById(lead._id)).toBeNull();
    expect(await Activity.countDocuments({ action: "lead_deleted" })).toBe(1);
  });
});

describe("authorization and collaboration", () => {
  test("prevents members from using admin-only routes", async () => {
    const response = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        name: "Blocked Lead",
        email: "blocked@example.com",
        phone: "+1 555 010 0000",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Access denied. Insufficient permissions.");
  });

  test("allows an admin to assign a lead to a member", async () => {
    const lead = await createLead();

    const response = await request(app)
      .put(`/api/leads/${lead._id}/assign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ assignedTo: member._id.toString() });

    expect(response.status).toBe(200);
    expect(response.body.lead.assignedTo).toMatchObject({
      _id: member._id.toString(),
      name: "Member User",
    });
    expect(await Activity.countDocuments({ action: "lead_assigned" })).toBe(1);
  });

  test("allows a member to add a note only to an assigned lead", async () => {
    const lead = await createLead({ assignedTo: member._id });

    const response = await request(app)
      .post(`/api/leads/${lead._id}/notes`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ text: "Called and left a voicemail." });

    expect(response.status).toBe(201);
    expect(response.body.lead.notes[0]).toMatchObject({
      text: "Called and left a voicemail.",
      addedBy: { name: "Member User" },
    });
  });

  test("returns role-filtered latest activity", async () => {
    const lead = await createLead({ assignedTo: member._id });
    await Activity.create({
      lead: lead._id,
      action: "lead_created",
      performedBy: admin._id,
      details: "Lead created",
    });
    await Activity.create({
      lead: lead._id,
      action: "note_added",
      performedBy: member._id,
      details: "Note added",
    });

    const response = await request(app)
      .get("/api/leads/dashboard/activities?limit=1")
      .set("Authorization", `Bearer ${memberToken}`);

    expect(response.status).toBe(200);
    expect(response.body.activities).toHaveLength(1);
    expect(response.body.activities[0]).toMatchObject({
      action: "note_added",
      lead: { _id: lead._id.toString(), name: "Jordan Lee" },
      performedBy: { name: "Member User" },
    });
  });
});
