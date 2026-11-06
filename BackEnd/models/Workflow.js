const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workflow name is required."],
      trim: true,
      maxlength: [100, "Workflow name cannot exceed 100 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters."],
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Paused"],
      default: "Active",
    },
    triggerAt: {
      type: Date,
      default: null,
    },
    notificationEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid notification email address."],
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workflow", workflowSchema);
