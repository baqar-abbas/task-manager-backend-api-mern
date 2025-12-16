const Task = require("../models/Task");
const { validationResult } = require("express-validator");

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      isPublic,
      estimatedTime,
    } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate,
      tags,
      isPublic: isPublic || false,
      estimatedTime,
      user: req.user.id,
    });

    // Emit socket event for real-time update
    if (req.app.get("io")) {
      req.app.get("io").to(`user-${req.user.id}`).emit("task-created", {
        success: true,
        task,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all tasks for current user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter
    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("user", "username email"), // Populate user info
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: {
        tasks,
        pagination: {
          total,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching tasks",
    });
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "user",
      "username email"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user owns the task or task is public
    if (task.user._id.toString() !== req.user.id && !task.isPublic) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching task",
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Update task
    const updates = req.body;
    task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "username email");

    // Emit socket event for real-time update
    if (req.app.get("io")) {
      const io = req.app.get("io");
      // Emit to user's room
      io.to(`user-${req.user.id}`).emit("task-updated", {
        success: true,
        task,
        timestamp: new Date().toISOString(),
      });
      // Emit to task-specific room (for other users viewing this task)
      io.to(`task-${task._id}`).emit("task-updated", {
        success: true,
        task,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating task",
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await task.deleteOne();

    // Emit socket event for real-time update
    if (req.app.get("io")) {
      const io = req.app.get("io");
      const taskId = req.params.id;
      // Emit to user's room
      io.to(`user-${req.user.id}`).emit("task-deleted", {
        success: true,
        taskId,
        timestamp: new Date().toISOString(),
      });
      // Emit to task-specific room (for other users viewing this task)
      io.to(`task-${taskId}`).emit("task-deleted", {
        success: true,
        taskId,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting task",
    });
  }
};

/**
 * @desc    Update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "in-progress", "completed", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Update status
    task.status = status;
    if (status === "completed") {
      task.completedAt = new Date();
    } else if (status !== "completed" && task.completedAt) {
      task.completedAt = null;
    }

    await task.save();
    await task.populate("user", "username email");

    // Emit socket event for real-time update
    if (req.app.get("io")) {
      const io = req.app.get("io");
      // Emit to user's room
      io.to(`user-${req.user.id}`).emit("task-status-updated", {
        success: true,
        task,
        timestamp: new Date().toISOString(),
      });
      // Emit to task-specific room (for other users viewing this task)
      io.to(`task-${task._id}`).emit("task-status-updated", {
        success: true,
        task,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating task status",
    });
  }
};

/**
 * @desc    Get task statistics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $match: { user: req.user._id },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalTime: { $sum: "$actualTimeSpent" },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: "$count" },
          totalTimeSpent: { $sum: "$totalTime" },
          byStatus: {
            $push: {
              status: "$_id",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalTasks: 1,
          totalTimeSpent: 1,
          byStatus: 1,
        },
      },
    ]);

    const result = stats[0] || {
      totalTasks: 0,
      totalTimeSpent: 0,
      byStatus: [],
    };

    res.status(200).json({
      success: true,
      message: "Task statistics fetched successfully",
      data: { stats: result },
    });
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching task statistics",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
};
