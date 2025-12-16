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

// Socket.io connection handling with authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to socket
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id} (User: ${socket.userId})`);

  // Automatically join user's own room
  socket.join(`user-${socket.userId}`);
  console.log(`Client ${socket.id} joined user room: user-${socket.userId}`);

  // Join task room for specific task updates (with validation)
  socket.on("join-task-room", (taskId) => {
    if (taskId && typeof taskId === "string") {
      socket.join(`task-${taskId}`);
      console.log(`Client ${socket.id} joined task room: task-${taskId}`);
    } else {
      console.error("Invalid task ID provided");
    }
  });

  // Leave task room
  socket.on("leave-task-room", (taskId) => {
    if (taskId && typeof taskId === "string") {
      socket.leave(`task-${taskId}`);
      console.log(`Client ${socket.id} left task room: task-${taskId}`);
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
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
