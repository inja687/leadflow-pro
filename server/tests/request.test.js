import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import request from "supertest";

import app from "../app.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import LeadRequest from "../models/LeadRequest.js";
import Activity from "../models/Activity.js";

process.env.JWT_SECRET = "test-only-jwt-secret-request";
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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    LeadRequest.deleteMany({}),
    Activity.deleteMany({}),
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

describe("Lead Request Pipeline", () => {
  describe("POST /api/public/leads (Public Form Submission)", () => {
    test("creates a pending LeadRequest document and does not create a Lead", async () => {
      const response = await request(app)
        .post("/api/public/leads")
        .send({
          name: "Visitor Doe",
          email: "visitor@example.com",
          phone: "123-456-7890",
          company: "Visitor Co",
          subject: "Information request",
          message: "I am interested in your services.",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify a LeadRequest is created
      const dbRequest = await LeadRequest.findOne({ email: "visitor@example.com" });
      expect(dbRequest).not.toBeNull();
      expect(dbRequest.name).toBe("Visitor Doe");
      expect(dbRequest.status).toBe("pending");
      expect(dbRequest.subject).toBe("Information request");

      // Verify NO Lead is created yet
      const dbLeadsCount = await Lead.countDocuments({});
      expect(dbLeadsCount).toBe(0);
    });

    test("returns 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/public/leads")
        .send({
          name: "",
          email: "bad@email.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/requests (Admin List Requests)", () => {
    test("allows admin to view all requests", async () => {
      await LeadRequest.create([
        { name: "Req 1", email: "req1@example.com", phone: "111", message: "msg", status: "pending" },
        { name: "Req 2", email: "req2@example.com", phone: "222", message: "msg", status: "approved" },
      ]);

      const response = await request(app)
        .get("/api/requests")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.requests).toHaveLength(2);
    });

    test("filters requests by status", async () => {
      await LeadRequest.create([
        { name: "Req 1", email: "req1@example.com", phone: "111", message: "msg", status: "pending" },
        { name: "Req 2", email: "req2@example.com", phone: "222", message: "msg", status: "approved" },
      ]);

      const response = await request(app)
        .get("/api/requests?status=approved")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.requests).toHaveLength(1);
      expect(response.body.requests[0].email).toBe("req2@example.com");
    });

    test("prevents members from viewing requests list", async () => {
      const response = await request(app)
        .get("/api/requests")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/requests/:id/approve (Approval Flow)", () => {
    test("approves a request, creates a lead and logs activities", async () => {
      const leadReq = await LeadRequest.create({
        name: "Requester Approved",
        email: "approved@example.com",
        phone: "555-555",
        company: "Approved LLC",
        message: "Send proposal.",
        status: "pending",
      });

      const response = await request(app)
        .post(`/api/requests/${leadReq._id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          assignedTo: member._id,
          status: "qualified",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify request status is approved
      const updatedReq = await LeadRequest.findById(leadReq._id);
      expect(updatedReq.status).toBe("approved");
      expect(updatedReq.reviewedBy.toString()).toBe(admin._id.toString());
      expect(updatedReq.reviewedAt).not.toBeNull();

      // Verify Lead created in database
      const lead = await Lead.findOne({ email: "approved@example.com" });
      expect(lead).not.toBeNull();
      expect(lead.name).toBe("Requester Approved");
      expect(lead.status).toBe("qualified");
      expect(lead.assignedTo.toString()).toBe(member._id.toString());

      // Verify activity logs created
      const logs = await Activity.find({ lead: lead._id });
      expect(logs.length).toBe(2); // lead_created and lead_assigned
    });
  });

  describe("POST /api/requests/:id/reject (Rejection Flow)", () => {
    test("rejects request but does not delete it", async () => {
      const leadReq = await LeadRequest.create({
        name: "Requester Reject",
        email: "reject@example.com",
        phone: "555-555",
        message: "No follow up",
        status: "pending",
      });

      const response = await request(app)
        .post(`/api/requests/${leadReq._id}/reject`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verify status updated in database
      const updatedReq = await LeadRequest.findById(leadReq._id);
      expect(updatedReq.status).toBe("rejected");
      expect(updatedReq.reviewedBy.toString()).toBe(admin._id.toString());

      // Verify NO Lead created
      const leadCount = await Lead.countDocuments({ email: "reject@example.com" });
      expect(leadCount).toBe(0);
    });
  });
});
