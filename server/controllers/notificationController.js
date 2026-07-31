import Notification from "../models/Notification.js";

// =========================
// Get Notifications for Logged-In User
// =========================
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = "all" } = req.query;

    const query = { recipient: req.user._id };

    if (filter === "unread") {
      query.isRead = false;
    } else if (filter === "read") {
      query.isRead = true;
    }

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    let queryBuilder = Notification.find(query)
      .populate("relatedLead", "name email status company")
      .sort({ createdAt: -1 });

    if (parsedLimit > 0) {
      queryBuilder = queryBuilder
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit);
    }

    const notifications = await queryBuilder;

    res.status(200).json({
      success: true,
      total,
      unreadCount,
      page: parsedPage,
      totalPages: parsedLimit > 0 ? Math.ceil(total / parsedLimit) : 1,
      notifications,
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Get Unread Notification Count
// =========================
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
      count,
    });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Mark Single Notification as Read
// =========================
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Mark All Notifications as Read
// =========================
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Delete Notification
// =========================
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
