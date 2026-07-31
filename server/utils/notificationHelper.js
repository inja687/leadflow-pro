import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * Utility to notify all active admin users of a new public lead request
 */
export const notifyAdminsNewLeadRequest = async ({ name, company }) => {
  try {
    const admins = await User.find({ role: "admin", status: "active" });
    if (!admins.length) return;

    const companyText = company ? ` (${company})` : "";
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title: "New Lead Request Received",
      message: `A new contact request was submitted by "${name}"${companyText}.`,
      type: "NEW_LEAD_REQUEST",
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Failed to notify admins of new lead request:", error.message);
  }
};

/**
 * Utility to notify a member when assigned a lead
 */
export const notifyMemberLeadAssigned = async ({ recipientId, leadId, leadName }) => {
  try {
    if (!recipientId) return;

    await Notification.create({
      recipient: recipientId,
      title: "New Lead Assigned",
      message: `You have been assigned lead: "${leadName}".`,
      type: "LEAD_ASSIGNED",
      relatedLead: leadId,
    });
  } catch (error) {
    console.error("Failed to notify member of lead assignment:", error.message);
  }
};

/**
 * Utility to notify a member when a lead is reassigned to them
 */
export const notifyMemberLeadReassigned = async ({ recipientId, leadId, leadName }) => {
  try {
    if (!recipientId) return;

    await Notification.create({
      recipient: recipientId,
      title: "Lead Reassigned",
      message: `You have been assigned lead: "${leadName}".`,
      type: "LEAD_REASSIGNED",
      relatedLead: leadId,
    });
  } catch (error) {
    console.error("Failed to notify member of lead reassignment:", error.message);
  }
};

/**
 * Utility to notify all active admins when a member updates lead status
 */
export const notifyAdminsStatusUpdated = async ({ leadId, leadName, updatedByName, newStatus }) => {
  try {
    const admins = await User.find({ role: "admin", status: "active" });
    if (!admins.length) return;

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title: "Lead Status Updated",
      message: `${updatedByName} updated status of "${leadName}" to "${newStatus}".`,
      type: "STATUS_UPDATED",
      relatedLead: leadId,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Failed to notify admins of status update:", error.message);
  }
};

/**
 * Utility to notify all active admins when a member adds a note to a lead
 */
export const notifyAdminsNoteAdded = async ({ leadId, leadName, addedByName }) => {
  try {
    const admins = await User.find({ role: "admin", status: "active" });
    if (!admins.length) return;

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title: "Note Added to Lead",
      message: `${addedByName} added a note to lead "${leadName}".`,
      type: "NOTE_ADDED",
      relatedLead: leadId,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Failed to notify admins of note addition:", error.message);
  }
};

/**
 * Legacy compatibility export for activity-based notification trigger
 */
export const createNotificationsForActivity = async (activity) => {
  // Main notifications are now handled directly by specific event triggers above
  return;
};

/**
 * Legacy compatibility export for system notifications
 */
export const createSystemNotification = async ({ title, message }) => {
  try {
    const admins = await User.find({ role: "admin", status: "active" });
    if (!admins.length) return;

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title,
      message,
      type: "NEW_LEAD_REQUEST",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Failed to create system notifications:", error.message);
  }
};
