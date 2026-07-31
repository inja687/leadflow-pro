import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import request from "supertest";

import app from "../app.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Activity from "../models/Activity.js";

process.env.JWT_SECRET = "test-only-jwt-secret-performance";
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(
  process.cwd(),
  ".cache",
  "mongodb-binaries"
);

let mongoServer;
let member;
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
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);
  member = await User.create({
    name: "Member User",
    email: "member@example.com",
    password,
    role: "member",
  });

  token = createToken(member);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe("Personal Performance Stats API", () => {
  test("returns stats and empty lists when member has no leads", async () => {
    const response = await request(app)
      .get("/api/leads/dashboard/performance")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.stats.totalLeads).toBe(0);
    expect(response.body.stats.conversionRate).toBe(0);
    expect(response.body.stats.completionRate).toBe(0);
    expect(response.body.todaysTasks).toHaveLength(0);
    expect(response.body.pendingFollowUps).toHaveLength(0);
    expect(response.body.monthlyActivities).toHaveLength(6); // should return 6 months
  });

  test("calculates rates correctly and synthesizes tasks and follow-ups", async () => {
    // Create leads assigned to this member
    // 2 Qualified, 1 Lost, 1 Contacted, 1 New
    const leads = await Lead.create([
      { name: "L1 New", email: "l1@example.com", phone: "111", status: "new", assignedTo: member._id },
      { name: "L2 Contacted", email: "l2@example.com", phone: "222", status: "contacted", assignedTo: member._id },
      { name: "L3 Qualified", email: "l3@example.com", phone: "333", status: "qualified", assignedTo: member._id },
      { name: "L4 Qualified", email: "l4@example.com", phone: "444", status: "qualified", assignedTo: member._id },
      { name: "L5 Lost", email: "l5@example.com", phone: "555", status: "lost", assignedTo: member._id },
      // Unassigned lead (should not affect member performance)
      { name: "L6 Unassigned", email: "l6@example.com", phone: "666", status: "new" },
    ]);

    // Create activity logs for this member
    await Activity.create([
      { lead: leads[0]._id, action: "lead_created", performedBy: member._id, timestamp: new Date() },
      { lead: leads[1]._id, action: "status_changed", performedBy: member._id, timestamp: new Date() },
    ]);

    const response = await request(app)
      .get("/api/leads/dashboard/performance")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    const { stats, todaysTasks, pendingFollowUps, monthlyActivities } = response.body;
    expect(stats.totalLeads).toBe(5);
    expect(stats.newLeads).toBe(1);
    expect(stats.contactedLeads).toBe(1);
    expect(stats.qualifiedLeads).toBe(2);
    expect(stats.lostLeads).toBe(1);
    
    // Conversion rate: (2 / 5) * 100 = 40%
    expect(stats.conversionRate).toBe(40);
    
    // Completion rate: ((2 + 1) / 5) * 100 = 60%
    expect(stats.completionRate).toBe(60);

    // Todays tasks: status is new
    expect(todaysTasks).toHaveLength(1);
    expect(todaysTasks[0].name).toBe("L1 New");

    // Pending follow ups: status is contacted
    expect(pendingFollowUps).toHaveLength(1);
    expect(pendingFollowUps[0].name).toBe("L2 Contacted");

    // Monthly activities for current month should be 2
    const currentMonthLabel = new Date().toLocaleString("default", { month: "short" });
    const currentMonthData = monthlyActivities.find(m => m.label === currentMonthLabel);
    expect(currentMonthData.count).toBe(2);
  });

  test("blocks request when token is missing", async () => {
    const response = await request(app)
      .get("/api/leads/dashboard/performance");

    expect(response.status).toBe(401);
  });
});
