import mongoose from "mongoose";

const leadRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "Website",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const LeadRequest = mongoose.model("LeadRequest", leadRequestSchema);

export default LeadRequest;
