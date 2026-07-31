import Activity from "../models/Activity.js";
import { createNotificationsForActivity } from "./notificationHelper.js";

/**
 * Log a lead activity. Fire-and-forget — errors are logged but don't
 * break the calling request.
 *
 * @param {Object} params
 * @param {string} params.lead       - Lead ObjectId
 * @param {string} params.action     - One of the Activity enum values
 * @param {string} params.performedBy - User ObjectId
 * @param {string} [params.details]  - Human-readable description
 */
export const logActivity = async ({ lead, action, performedBy, details = "" }) => {
  try {
    const activity = await Activity.create({ lead, action, performedBy, details });
    
    // Automatically trigger notifications asynchronous hook
    createNotificationsForActivity(activity);
  } catch (error) {
    // Log but don't throw — activity logging should never break the main operation
    console.error("Activity log failed:", error.message);
  }
};
