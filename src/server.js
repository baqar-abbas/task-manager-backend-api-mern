const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

// Import MongoDB connection
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// Store io instance in app to access in controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running smoothly",
    timestamp: new Date().toISOString(),
    service: "Task Manager API",
    version: "1.0.0",
    database: "Connected to MongoDB Atlas",
    environment: process.env.NODE_ENV,
    websocket: "active",
  });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Join user room for private updates
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Client ${socket.id} joined user room: ${userId}`);
  });

  // Join task room for specific task updates
  socket.on("join-task-room", (taskId) => {
    socket.join(`task-${taskId}`);
    console.log(`Client ${socket.id} joined task room: ${taskId}`);
  });

  // Handle task creation (from frontend)
  socket.on("create-task", (taskData) => {
    console.log("Task creation requested via socket:", taskData);
    // This would be handled by your API, socket just broadcasts
  });

  // Handle task updates (from frontend)
  socket.on("update-task", (updatedTask) => {
    // Broadcast to all users in the task room
    io.to(`task-${updatedTask._id}`).emit("task-updated", updatedTask);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Task routes
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  📊 Health check: http://localhost:${PORT}/api/health
  🌍 Environment: ${process.env.NODE_ENV}
  🔌 WebSocket: Ready on port ${PORT}
  `);
});
