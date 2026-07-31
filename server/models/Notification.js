import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_LEAD_REQUEST",
        "LEAD_ASSIGNED",
        "STATUS_UPDATED",
        "NOTE_ADDED",
        "LEAD_REASSIGNED",
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
