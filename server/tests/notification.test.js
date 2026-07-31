import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import request from "supertest";

import app from "../app.js";
import Notification from "../models/Notification.js";
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
let member1;
let member2;
let adminToken;
let member1Token;
let member2Token;

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
    Notification.deleteMany({}),
    Lead.deleteMany({}),
    User.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);
  admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password,
    role: "admin",
    status: "active",
  });
  member1 = await User.create({
    name: "Member One",
    email: "member1@example.com",
    password,
    role: "member",
    status: "active",
  });
  member2 = await User.create({
    name: "Member Two",
    email: "member2@example.com",
    password,
    role: "member",
    status: "active",
  });

  adminToken = createToken(admin);
  member1Token = createToken(member1);
  member2Token = createToken(member2);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe("Notification Triggers", () => {
  test("1. Public lead submission triggers NEW_LEAD_REQUEST notification to Admins", async () => {
    const res = await request(app).post("/api/public/leads").send({
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 555 123 4567",
      company: "Acme Corp",
      message: "Looking for CRM pricing",
    });

    expect(res.status).toBe(201);
    const notifications = await Notification.find({ recipient: admin._id });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("NEW_LEAD_REQUEST");
    expect(notifications[0].title).toBe("New Lead Request Received");
  });

  test("2. Approving request with member assignment triggers LEAD_ASSIGNED to Member", async () => {
    // Submit a public request first
    const submitRes = await request(app).post("/api/public/leads").send({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 555 987 6543",
      company: "Innovate LLC",
      message: "Demo request",
    });
    const requestId = submitRes.body.lead.id;

    // Admin approves request and assigns member1
    const approveRes = await request(app)
      .post(`/api/requests/${requestId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ assignedTo: member1._id.toString() });

    expect(approveRes.status).toBe(200);

    const memberNotifs = await Notification.find({ recipient: member1._id });
    expect(memberNotifs).toHaveLength(1);
    expect(memberNotifs[0].type).toBe("LEAD_ASSIGNED");
    expect(memberNotifs[0].title).toBe("New Lead Assigned");
  });

  test("3. Admin reassigning a lead triggers LEAD_REASSIGNED to new Member", async () => {
    const lead = await Lead.create({
      name: "Alex Johnson",
      email: "alex@example.com",
      phone: "+1 555 444 3333",
      assignedTo: member1._id,
    });

    // Admin reassigns lead to member2
    const res = await request(app)
      .put(`/api/leads/${lead._id}/assign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ assignedTo: member2._id.toString() });

    expect(res.status).toBe(200);

    const newMemberNotifs = await Notification.find({ recipient: member2._id });
    expect(newMemberNotifs).toHaveLength(1);
    expect(newMemberNotifs[0].type).toBe("LEAD_REASSIGNED");
    expect(newMemberNotifs[0].title).toBe("Lead Reassigned");
  });

  test("4. Member updating lead status triggers STATUS_UPDATED to Admins", async () => {
    const lead = await Lead.create({
      name: "Sam Wilson",
      email: "sam@example.com",
      phone: "+1 555 222 1111",
      assignedTo: member1._id,
      status: "new",
    });

    const res = await request(app)
      .put(`/api/leads/${lead._id}`)
      .set("Authorization", `Bearer ${member1Token}`)
      .send({ status: "qualified" });

    expect(res.status).toBe(200);

    const adminNotifs = await Notification.find({ recipient: admin._id, type: "STATUS_UPDATED" });
    expect(adminNotifs).toHaveLength(1);
    expect(adminNotifs[0].message).toContain("Sam Wilson");
    expect(adminNotifs[0].message).toContain("qualified");
  });

  test("5. Member adding a note triggers NOTE_ADDED to Admins", async () => {
    const lead = await Lead.create({
      name: "Chris Evans",
      email: "chris@example.com",
      phone: "+1 555 777 8888",
      assignedTo: member1._id,
    });

    const res = await request(app)
      .post(`/api/leads/${lead._id}/notes`)
      .set("Authorization", `Bearer ${member1Token}`)
      .send({ text: "Follow-up call completed" });

    expect(res.status).toBe(201);

    const adminNotifs = await Notification.find({ recipient: admin._id, type: "NOTE_ADDED" });
    expect(adminNotifs).toHaveLength(1);
    expect(adminNotifs[0].message).toContain("Chris Evans");
  });
});

describe("Notification REST APIs", () => {
  test("GET /api/notifications returns logged-in user notifications and unread count", async () => {
    await Notification.create([
      {
        recipient: member1._id,
        title: "Test Notif 1",
        message: "Message 1",
        type: "LEAD_ASSIGNED",
        isRead: false,
      },
      {
        recipient: member1._id,
        title: "Test Notif 2",
        message: "Message 2",
        type: "LEAD_REASSIGNED",
        isRead: true,
      },
      {
        recipient: admin._id,
        title: "Admin Only Notif",
        message: "Should not be returned for member",
        type: "NEW_LEAD_REQUEST",
      },
    ]);

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${member1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(2);
    expect(res.body.unreadCount).toBe(1);
    expect(res.body.notifications).toHaveLength(2);
  });

  test("GET /api/notifications/unread-count returns correct count", async () => {
    await Notification.create([
      { recipient: member1._id, title: "Unread 1", message: "m1", type: "LEAD_ASSIGNED", isRead: false },
      { recipient: member1._id, title: "Unread 2", message: "m2", type: "LEAD_ASSIGNED", isRead: false },
      { recipient: member1._id, title: "Read 1", message: "m3", type: "LEAD_ASSIGNED", isRead: true },
    ]);

    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${member1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBe(2);
  });

  test("PATCH /api/notifications/:id/read marks single notification as read", async () => {
    const notif = await Notification.create({
      recipient: member1._id,
      title: "Unread Notif",
      message: "Message",
      type: "LEAD_ASSIGNED",
      isRead: false,
    });

    const res = await request(app)
      .patch(`/api/notifications/${notif._id}/read`)
      .set("Authorization", `Bearer ${member1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.notification.isRead).toBe(true);
  });

  test("PATCH /api/notifications/read-all marks all user notifications as read", async () => {
    await Notification.create([
      { recipient: member1._id, title: "Unread 1", message: "m1", type: "LEAD_ASSIGNED", isRead: false },
      { recipient: member1._id, title: "Unread 2", message: "m2", type: "LEAD_ASSIGNED", isRead: false },
    ]);

    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${member1Token}`);

    expect(res.status).toBe(200);
    const unreadAfter = await Notification.countDocuments({ recipient: member1._id, isRead: false });
    expect(unreadAfter).toBe(0);
  });

  test("DELETE /api/notifications/:id deletes user notification", async () => {
    const notif = await Notification.create({
      recipient: member1._id,
      title: "To Delete",
      message: "Message",
      type: "LEAD_ASSIGNED",
    });

    const res = await request(app)
      .delete(`/api/notifications/${notif._id}`)
      .set("Authorization", `Bearer ${member1Token}`);

    expect(res.status).toBe(200);
    expect(await Notification.findById(notif._id)).toBeNull();
  });
});
