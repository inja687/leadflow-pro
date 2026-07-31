import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
    index: true,
  },

  action: {
    type: String,
    enum: [
      "lead_created",
      "lead_assigned",
      "status_changed",
      "note_added",
      "lead_updated",
      "lead_deleted",
    ],
    required: true,
  },

  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  details: {
    type: String,
    default: "",
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast lead-scoped queries, newest first
activitySchema.index({ lead: 1, timestamp: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
