import User from "../models/User.js";
import Lead from "../models/Lead.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";


// =========================
// Get All Members with Lead Counts (Admin Only)
// =========================
export const getAllMembers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const total = await User.countDocuments(filter);

    const aggregatePipeline = [];

    if (search) {
      aggregatePipeline.push({ $match: filter });
    }

    // Sort by name
    aggregatePipeline.push({ $sort: { name: 1 } });

    // Pagination
    aggregatePipeline.push({ $skip: skip });
    aggregatePipeline.push({ $limit: limitNum });

    // Lookup leads assigned to user
    aggregatePipeline.push({
      $lookup: {
        from: "leads",
        localField: "_id",
        foreignField: "assignedTo",
        as: "assignedLeads",
      },
    });

    // Project fields needed
    aggregatePipeline.push({
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        status: { $ifNull: ["$status", "active"] },
        createdAt: 1,
        totalLeads: { $size: "$assignedLeads" },
      },
    });

    const members = await User.aggregate(aggregatePipeline);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limitNum),
      members,
    });
  } catch (error) {
    console.error("Error in getAllMembers:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get Member By ID (Admin Only)
// =========================
export const getMemberById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const totalLeads = await Lead.countDocuments({ assignedTo: user._id });

    res.status(200).json({
      success: true,
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        createdAt: user.createdAt,
        totalLeads,
      },
    });
  } catch (error) {
    console.error("Error in getMemberById:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Update Member details (Admin Only)
// =========================
export const updateMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user",
        });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) {
      if (!["admin", "member"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role value",
        });
      }
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in updateMember:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Toggle Member Status (Admin Only)
// =========================
export const toggleMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'active' or 'inactive'.",
      });
    }

    // Safety: Admin cannot deactivate themselves
    if (userId === req.user._id.toString() && status === "inactive") {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Member status updated to ${status} successfully`,
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in toggleMemberStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Create New Member (Admin Only)
// =========================
export const createMember = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // Determine temporary password
    let tempPassword = password;
    if (!tempPassword || !tempPassword.trim()) {
      // Generate a strong temporary password (12 chars: random string + specific suffix for strength)
      tempPassword = crypto.randomBytes(6).toString("hex") + "A1!";
    }

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "member", // default role = member
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Member created successfully.",
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      credentials: {
        email: user.email,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error) {
    console.error("Error in createMember:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

