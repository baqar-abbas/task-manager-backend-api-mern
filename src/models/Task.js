const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "archived"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries by user
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    estimatedTime: {
      type: Number, // in minutes
      min: [0, "Estimated time cannot be negative"],
    },
    actualTimeSpent: {
      type: Number, // in minutes
      default: 0,
      min: [0, "Time spent cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// Virtual for overdue status (not stored in DB)
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "completed") return false;
  return new Date() > this.dueDate;
});

// Method to mark as complete
taskSchema.methods.markComplete = function () {
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

// Method to update progress
taskSchema.methods.updateProgress = function (minutesSpent) {
  this.actualTimeSpent += minutesSpent;
  if (this.status === "pending") {
    this.status = "in-progress";
  }
  return this.save();
};

// Ensure virtuals are included when converting to JSON
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
