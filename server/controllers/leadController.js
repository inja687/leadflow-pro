import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import LeadRequest from "../models/LeadRequest.js";
import { logActivity } from "../utils/activityHelper.js";
import { createSystemNotification } from "../utils/notificationHelper.js";

// =========================
// Public Lead Capture (No Auth Required)
// =========================
export const submitPublicLead = async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // Create a new LeadRequest instead of Lead directly
    const request = await LeadRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company ? company.trim() : "",
      subject: subject ? subject.trim() : "",
      message: message.trim(),
      status: "pending",
    });

    // Trigger notification to admins
    createSystemNotification({
      title: "New Incoming Request",
      message: `A new contact form was submitted by "${name.trim()}" (${company ? company.trim() : "No Company"}).`,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! We will get back to you shortly.",
      lead: {
        id: request._id,
        name: request.name,
        email: request.email,
      },
    });
  } catch (error) {
    console.error("Public lead request submission error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


// =========================
// Create Lead (Admin Only)
// =========================
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, assignedTo } = req.body;

    const leadData = { name, email, phone, company, status };

    // Only set assignedTo if provided
    if (assignedTo) {
      leadData.assignedTo = assignedTo;
    }

    const lead = await Lead.create(leadData);

    // Log: lead created
    await logActivity({
      lead: lead._id,
      action: "lead_created",
      performedBy: req.user._id,
      details: `Lead "${lead.name}" created`,
    });

    // Log: assignment if assigned at creation
    if (assignedTo) {
      const targetUser = await User.findById(assignedTo).select("name");
      await logActivity({
        lead: lead._id,
        action: "lead_assigned",
        performedBy: req.user._id,
        details: `Lead assigned to ${targetUser?.name || "a user"}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get All Leads (Search + Filter + Pagination)
// Admin: sees all leads
// Member: sees only leads assigned to them
// =========================
export const getLeads = async (req, res) => {
  try {
    const {
      search = "",
      status,
      page = 1,
      limit = 10,
      mine,
    } = req.query;

    const query = {};

    // Role-based filtering: members only see their assigned leads
    if (req.user.role === "member" || mine === "true") {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const total = await Lead.countDocuments(query);

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      leads,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get Single Lead
// Admin: any lead
// Member: only if assigned to them
// =========================
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("notes.addedBy", "name email");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Members can only access leads assigned to them
    if (
      req.user.role === "member" &&
      (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This lead is not assigned to you.",
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Update Lead
// Admin: full update on any lead
// Member: only status on assigned leads
// =========================
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const oldStatus = lead.status;

    // Members: restricted update
    if (req.user.role === "member") {
      // Check assignment
      if (
        !lead.assignedTo ||
        lead.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied. This lead is not assigned to you.",
        });
      }

      // Members can only update status
      const { status } = req.body;

      if (status && status !== oldStatus) {
        lead.status = status;
        await lead.save();

        // Log: status changed
        await logActivity({
          lead: lead._id,
          action: "status_changed",
          performedBy: req.user._id,
          details: `Status changed from "${oldStatus}" to "${status}"`,
        });
      }

      const updatedLead = await Lead.findById(lead._id)
        .populate("assignedTo", "name email role")
        .populate("notes.addedBy", "name email");

      return res.status(200).json({
        success: true,
        message: "Lead updated successfully",
        lead: updatedLead,
      });
    }

    // Admin: full update — detect what changed
    const statusChanged = req.body.status && req.body.status !== oldStatus;
    const fieldsChanged =
      (req.body.name && req.body.name !== lead.name) ||
      (req.body.email && req.body.email !== lead.email) ||
      (req.body.phone && req.body.phone !== lead.phone) ||
      (req.body.company !== undefined && req.body.company !== lead.company);

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("assignedTo", "name email role")
      .populate("notes.addedBy", "name email");

    // Log: status changed (only if actually different)
    if (statusChanged) {
      await logActivity({
        lead: lead._id,
        action: "status_changed",
        performedBy: req.user._id,
        details: `Status changed from "${oldStatus}" to "${req.body.status}"`,
      });
    }

    // Log: general update (only if fields other than status changed)
    if (fieldsChanged) {
      await logActivity({
        lead: lead._id,
        action: "lead_updated",
        performedBy: req.user._id,
        details: "Lead details updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Delete Lead (Admin Only — enforced at route level)
// =========================
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Log: lead deleted (we keep the activity even though the lead is gone)
    await logActivity({
      lead: lead._id,
      action: "lead_deleted",
      performedBy: req.user._id,
      details: `Lead "${lead.name}" deleted`,
    });

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Dashboard Statistics
// Admin: global stats
// Member: stats for assigned leads only
// =========================
export const getDashboardStats = async (req, res) => {
  try {
    const filter = {};

    // Members only see stats for their assigned leads
    if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }

    const totalLeads = await Lead.countDocuments(filter);
    const newLeads = await Lead.countDocuments({ ...filter, status: "new" });
    const contactedLeads = await Lead.countDocuments({ ...filter, status: "contacted" });
    const qualifiedLeads = await Lead.countDocuments({ ...filter, status: "qualified" });
    const lostLeads = await Lead.countDocuments({ ...filter, status: "lost" });
    const myLeads =
      req.user.role === "member"
        ? totalLeads
        : await Lead.countDocuments({ assignedTo: req.user._id });

    // Optional admin stats
    let pendingRequests = 0;
    let approvedToday = 0;
    let rejectedToday = 0;

    if (req.user.role === "admin") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      pendingRequests = await LeadRequest.countDocuments({ status: "pending" });
      approvedToday = await LeadRequest.countDocuments({
        status: "approved",
        reviewedAt: { $gte: startOfToday, $lte: endOfToday },
      });
      rejectedToday = await LeadRequest.countDocuments({
        status: "rejected",
        reviewedAt: { $gte: startOfToday, $lte: endOfToday },
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        lostLeads,
        myLeads,
        pendingRequests,
        approvedToday,
        rejectedToday,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Latest dashboard activities
// Admin: all activities
// Member: activities for their assigned leads only
// =========================
export const getDashboardActivities = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);
    const query = {};

    if (req.user.role === "member") {
      const assignedLeadIds = await Lead.find({ assignedTo: req.user._id }).distinct("_id");
      query.lead = { $in: assignedLeadIds };
    }

    const activities = await Activity.find(query)
      .populate("lead", "name status")
      .populate("performedBy", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Assign Lead (Admin Only)
// =========================
export const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "assignedTo (user ID) is required.",
      });
    }

    // Verify the target user exists
    const targetUser = await User.findById(assignedTo).select("name email role");

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found.",
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email role")
      .populate("notes.addedBy", "name email");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Log: lead assigned
    await logActivity({
      lead: lead._id,
      action: "lead_assigned",
      performedBy: req.user._id,
      details: `Lead assigned to ${targetUser.name}`,
    });

    res.status(200).json({
      success: true,
      message: `Lead assigned to ${targetUser.name} successfully`,
      lead,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Add Note to Lead
// Admin: any lead
// Member: only assigned leads
// =========================
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note text is required.",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Members can only add notes to their assigned leads
    if (
      req.user.role === "member" &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This lead is not assigned to you.",
      });
    }

    lead.notes.push({
      text: text.trim(),
      addedBy: req.user._id,
    });

    await lead.save();

    // Log: note added
    await logActivity({
      lead: lead._id,
      action: "note_added",
      performedBy: req.user._id,
      details: "Note added",
    });

    const updatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email role")
      .populate("notes.addedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get Activities for a Lead
// =========================
export const getActivities = async (req, res) => {
  try {
    // Verify the lead exists and user has access
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Members can only view activities for their assigned leads
    if (
      req.user.role === "member" &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This lead is not assigned to you.",
      });
    }

    const activities = await Activity.find({ lead: req.params.id })
      .populate("performedBy", "name email role")
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get Members List (Admin Only — for assign dropdown)
// =========================
export const getMembers = async (req, res) => {
  try {
    const members = await User.find({})
      .select("name email role")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get Personal Performance (My Performance)
// =========================
export const getPersonalPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Leads by status
    const totalLeads = await Lead.countDocuments({ assignedTo: userId });
    const newLeads = await Lead.countDocuments({ assignedTo: userId, status: "new" });
    const contactedLeads = await Lead.countDocuments({ assignedTo: userId, status: "contacted" });
    const qualifiedLeads = await Lead.countDocuments({ assignedTo: userId, status: "qualified" });
    const lostLeads = await Lead.countDocuments({ assignedTo: userId, status: "lost" });

    // Rates
    const conversionRate = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const completionRate = totalLeads ? Math.round(((qualifiedLeads + lostLeads) / totalLeads) * 100) : 0;

    // 2. Monthly activities performed by this user (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const activityGroups = await Activity.aggregate([
      {
        $match: {
          performedBy: userId,
          timestamp: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format Monthly Activities for last 6 months (ensure all months are present)
    const monthlyActivities = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const matchedGroup = activityGroups.find(
        (g) => g._id.year === year && g._id.month === month
      );

      const monthLabel = d.toLocaleString("default", { month: "short" });
      monthlyActivities.push({
        label: monthLabel,
        count: matchedGroup ? matchedGroup.count : 0,
      });
    }

    // 3. Today's Tasks (synthesized: leads in "new" status assigned to this user)
    const todaysTasks = await Lead.find({ assignedTo: userId, status: "new" })
      .select("name email phone company message")
      .sort({ createdAt: -1 });

    // 4. Pending Follow Ups (synthesized: leads in "contacted" status assigned to this user)
    const pendingFollowUps = await Lead.find({ assignedTo: userId, status: "contacted" })
      .select("name email phone company notes")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        lostLeads,
        conversionRate,
        completionRate,
      },
      monthlyActivities,
      todaysTasks,
      pendingFollowUps,
    });
  } catch (error) {
    console.error("Personal performance calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
