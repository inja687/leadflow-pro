import Notification from "../models/Notification.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";

/**
 * Automatically analyze an activity log record and generate inside-app notifications
 * for relevant assignees (members) and workspace administrators.
 *
 * @param {Object} activity - The activity document
 */
export const createNotificationsForActivity = async (activity) => {
  try {
    const { lead, action, performedBy } = activity;
    if (!lead) return;

    // 1. Retrieve Lead with assignment detail
    const leadDoc = await Lead.findById(lead);
    if (!leadDoc) return;

    // 2. Retrieve actor information
    const performer = await User.findById(performedBy).select("name");
    const performerName = performer ? performer.name : "System";

    // 3. Find active admins
    const admins = await User.find({ role: "admin", status: "active" });

    // Helper to filter out the actor (so they don't receive alerts about their own actions)
    const isPerformer = (userId) => userId.toString() === performedBy.toString();

    const notifications = [];

    // Check action type and generate notifications
    switch (action) {
      case "lead_assigned": {
        // Find current assignee
        const assigneeId = leadDoc.assignedTo;
        if (assigneeId) {
          const assignee = await User.findById(assigneeId).select("name");
          // Notify Assignee
          notifications.push({
            recipient: assigneeId,
            title: "New Lead Assigned",
            message: `You have been assigned a new lead: "${leadDoc.name}" by ${performerName}.`,
            type: "assignment",
            lead: leadDoc._id,
          });

          // Notify other Admins about the assignment
          for (const admin of admins) {
            if (!isPerformer(admin._id) && admin._id.toString() !== assigneeId.toString()) {
              notifications.push({
                recipient: admin._id,
                title: "Lead Assigned",
                message: `${performerName} assigned lead "${leadDoc.name}" to ${assignee ? assignee.name : "Member"}.`,
                type: "assignment",
                lead: leadDoc._id,
              });
            }
          }
        }
        break;
      }

      case "status_changed": {
        const assigneeId = leadDoc.assignedTo;
        // Notify Assignee (if changed by someone else)
        if (assigneeId && !isPerformer(assigneeId)) {
          notifications.push({
            recipient: assigneeId,
            title: "Lead Status Updated",
            message: `The status of your assigned lead "${leadDoc.name}" was changed to "${leadDoc.status}" by ${performerName}.`,
            type: "status_change",
            lead: leadDoc._id,
          });
        }

        // Notify Admins
        for (const admin of admins) {
          if (!isPerformer(admin._id)) {
            notifications.push({
              recipient: admin._id,
              title: "Lead Status Updated",
              message: `${performerName} changed status of "${leadDoc.name}" to "${leadDoc.status}".`,
              type: "status_change",
              lead: leadDoc._id,
            });
          }
        }
        break;
      }

      case "note_added": {
        const assigneeId = leadDoc.assignedTo;
        // Notify Assignee
        if (assigneeId && !isPerformer(assigneeId)) {
          notifications.push({
            recipient: assigneeId,
            title: "New Note Added",
            message: `${performerName} added a new note to your assigned lead "${leadDoc.name}".`,
            type: "note_added",
            lead: leadDoc._id,
          });
        }

        // Notify Admins
        for (const admin of admins) {
          if (!isPerformer(admin._id)) {
            notifications.push({
              recipient: admin._id,
              title: "New Note Added",
              message: `${performerName} added a note to lead "${leadDoc.name}".`,
              type: "note_added",
              lead: leadDoc._id,
            });
          }
        }
        break;
      }

      case "lead_updated": {
        const assigneeId = leadDoc.assignedTo;
        // Notify Assignee
        if (assigneeId && !isPerformer(assigneeId)) {
          notifications.push({
            recipient: assigneeId,
            title: "Lead Profile Updated",
            message: `The details of your assigned lead "${leadDoc.name}" were updated by ${performerName}.`,
            type: "lead_updated",
            lead: leadDoc._id,
          });
        }

        // Notify Admins
        for (const admin of admins) {
          if (!isPerformer(admin._id)) {
            notifications.push({
              recipient: admin._id,
              title: "Lead Details Updated",
              message: `${performerName} updated details of lead "${leadDoc.name}".`,
              type: "lead_updated",
              lead: leadDoc._id,
            });
          }
        }
        break;
      }

      default:
        // Do not generate notifications for other action types
        break;
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Failed to generate notifications for activity:", error.message);
  }
};

/**
 * Creates system alerts for all active workspace administrators.
 * Used for incoming lead request captures.
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.message
 */
export const createSystemNotification = async ({ title, message }) => {
  try {
    const admins = await User.find({ role: "admin", status: "active" });
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title,
      message,
      type: "system",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Failed to create system notifications:", error.message);
  }
};
