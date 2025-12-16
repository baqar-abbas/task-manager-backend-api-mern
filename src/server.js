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

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://task-manager-client-csx8.onrender.com", // Your frontend on Render
      "https://task-manager-client.onrender.com", // Alternative frontend URL
      "https://task-manager-frontend.onrender.com", // Alternative name
    ];

    // Add FRONTEND_URL from environment if set
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    // Add NODE_ENV based origins
    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://localhost:*");
    }

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store io instance in app to access in controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running smoothly",
    timestamp: new Date().toISOString(),
    service: "Task Manager API",
    version: "1.0.0",
    database: "Connected to MongoDB Atlas",
    environment: process.env.NODE_ENV || "development",
    websocket: "active",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API",
    version: "1.0.0",
    documentation: "/api/health",
    endpoints: {
      auth: "/api/auth",
      tasks: "/api/tasks",
      health: "/api/health",
    },
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
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "CORS policy: Origin not allowed",
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.errors,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    status: "error",
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  📊 Health check: http://localhost:${PORT}/api/health
  🌍 Environment: ${process.env.NODE_ENV || "development"}
  🔌 WebSocket: Ready on port ${PORT}
  📍 Server URL: ${
    process.env.NODE_ENV === "production"
      ? "https://your-render-url.onrender.com"
      : `http://localhost:${PORT}`
  }
  `);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Don't exit in production, let the process manager restart it
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = { app, server, io };
