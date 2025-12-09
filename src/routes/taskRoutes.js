const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createTaskValidation,
  updateTaskValidation,
  updateTaskStatusValidation,
} = require("../utils/validators");

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validate(createTaskValidation),
  taskController.createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for current user (with filtering, sorting, pagination)
 * @access  Private
 */
router.get("/", authenticate, taskController.getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get("/:id", authenticate, taskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  validate(updateTaskValidation),
  taskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete("/:id", authenticate, taskController.deleteTask);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status
 * @access  Private
 */
router.patch(
  "/:id/status",
  authenticate,
  validate(updateTaskStatusValidation),
  taskController.updateTaskStatus
);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get("/stats/overview", authenticate, taskController.getTaskStats);

/**
 * @route   GET /api/tasks/filter/options
 * @desc    Get available filter options (for frontend dropdowns)
 * @access  Private
 */
router.get("/filter/options", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      statuses: ["pending", "in-progress", "completed", "archived"],
      priorities: ["low", "medium", "high", "urgent"],
      sortOptions: [
        { value: "createdAt", label: "Creation Date" },
        { value: "dueDate", label: "Due Date" },
        { value: "priority", label: "Priority" },
        { value: "title", label: "Title" },
      ],
    },
  });
});

module.exports = router;
