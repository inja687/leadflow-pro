import LeadRequest from "../models/LeadRequest.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityHelper.js";
import { notifyMemberLeadAssigned } from "../utils/notificationHelper.js";

// =========================
// Get All Lead Requests (Admin Only)
// =========================
export const getRequests = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const query = {};

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

    const total = await LeadRequest.countDocuments(query);

    const requests = await LeadRequest.find(query)
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      requests,
    });
  } catch (error) {
    console.error("Error in getRequests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Get Request By ID (Admin Only)
// =========================
export const getRequestById = async (req, res) => {
  try {
    const request = await LeadRequest.findById(req.params.id)
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Error in getRequestById:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Approve Request (Admin Only)
// =========================
export const approveRequest = async (req, res) => {
  try {
    const { assignedTo, status } = req.body;

    const leadRequest = await LeadRequest.findById(req.params.id);
    if (!leadRequest) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (leadRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${leadRequest.status}.`,
      });
    }

    // Verify assigned user if provided
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ success: false, message: "Assigned member not found." });
      }
    }

    // 1. Create the real Lead
    const lead = await Lead.create({
      name: leadRequest.name,
      email: leadRequest.email,
      phone: leadRequest.phone,
      company: leadRequest.company,
      message: leadRequest.message,
      status: status || "new",
      assignedTo: assignedTo || undefined,
    });

    // 2. Log Activity
    await logActivity({
      lead: lead._id,
      action: "lead_created",
      performedBy: req.user._id,
      details: `Lead "${lead.name}" approved from contact submission`,
    });

    if (assignedTo && assignedUser) {
      await logActivity({
        lead: lead._id,
        action: "lead_assigned",
        performedBy: req.user._id,
        details: `Lead assigned to ${assignedUser.name}`,
      });

      await notifyMemberLeadAssigned({
        recipientId: assignedTo,
        leadId: lead._id,
        leadName: lead.name,
      });
    }

    // 3. Mark request as approved
    leadRequest.status = "approved";
    leadRequest.reviewedBy = req.user._id;
    leadRequest.reviewedAt = new Date();
    await leadRequest.save();

    res.status(200).json({
      success: true,
      message: "Lead request approved successfully.",
      request: leadRequest,
      lead,
    });
  } catch (error) {
    console.error("Error in approveRequest:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Reject Request (Admin Only)
// =========================
export const rejectRequest = async (req, res) => {
  try {
    const leadRequest = await LeadRequest.findById(req.params.id);
    if (!leadRequest) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (leadRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${leadRequest.status}.`,
      });
    }

    // Mark as rejected
    leadRequest.status = "rejected";
    leadRequest.reviewedBy = req.user._id;
    leadRequest.reviewedAt = new Date();
    await leadRequest.save();

    res.status(200).json({
      success: true,
      message: "Lead request rejected successfully.",
      request: leadRequest,
    });
  } catch (error) {
    console.error("Error in rejectRequest:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
