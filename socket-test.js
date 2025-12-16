// Socket.io Test Script for Node.js
// Usage: node socket-test.js

const { io } = require("socket.io-client");

const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSocketIO() {
  log("\n================================", "cyan");
  log("  Socket.io Connection Test", "cyan");
  log("================================\n", "cyan");

  try {
    // Step 1: Register a test user
    log("📝 Step 1: Registering test user...", "yellow");
    const fetch = (await import("node-fetch")).default;

    const random = Math.floor(Math.random() * 10000);
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `sockettest${random}`,
        email: `sockettest${random}@example.com`,
        password: "Test123456",
        confirmPassword: "Test123456",
      }),
    });

    const registerData = await registerResponse.json();

    if (!registerData.success) {
      log(`❌ Registration failed: ${registerData.message}`, "red");
      return;
    }

    const token = registerData.data.token;
    const userId = registerData.data.user.id;
    log(`✅ User registered successfully`, "green");
    log(`   User ID: ${userId}`, "blue");
    log(`   Token: ${token.substring(0, 20)}...`, "blue");

    // Step 2: Connect to Socket.io with authentication
    log("\n🔌 Step 2: Connecting to Socket.io...", "yellow");

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    // Setup event listeners
    socket.on("connect", () => {
      log("✅ Socket connected successfully!", "green");
      log(`   Socket ID: ${socket.id}`, "blue");
      log(`   Connected to user room: user-${userId}`, "blue");
    });

    socket.on("connect_error", (error) => {
      log(`❌ Connection error: ${error.message}`, "red");
      process.exit(1);
    });

    socket.on("disconnect", (reason) => {
      log(`⚠️  Disconnected: ${reason}`, "yellow");
    });

    // Listen for task events
    socket.on("task-created", (data) => {
      log("\n📝 EVENT: task-created", "cyan");
      log(JSON.stringify(data, null, 2), "blue");
    });

    socket.on("task-updated", (data) => {
      log("\n✏️  EVENT: task-updated", "cyan");
      log(JSON.stringify(data, null, 2), "blue");
    });

    socket.on("task-deleted", (data) => {
      log("\n🗑️  EVENT: task-deleted", "cyan");
      log(JSON.stringify(data, null, 2), "blue");
    });

    socket.on("task-status-updated", (data) => {
      log("\n🔄 EVENT: task-status-updated", "cyan");
      log(JSON.stringify(data, null, 2), "blue");
    });

    // Wait for connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 5000);

      socket.once("connect", () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    // Step 3: Create a task (should trigger socket event)
    log("\n📋 Step 3: Creating a task...", "yellow");

    const taskResponse = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Socket.io Test Task",
        description: "Testing real-time notifications",
        status: "pending",
        priority: "high",
      }),
    });

    const taskData = await taskResponse.json();

    if (taskData.success) {
      log("✅ Task created via API", "green");
      log(`   Task ID: ${taskData.data.task._id}`, "blue");
      log("   Waiting for socket event...", "yellow");
    }

    // Wait for socket event
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Update the task
    if (taskData.success) {
      log("\n📝 Step 4: Updating task status...", "yellow");

      const taskId = taskData.data.task._id;
      const updateResponse = await fetch(`${API_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "in-progress",
        }),
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        log("✅ Task status updated via API", "green");
        log("   Waiting for socket event...", "yellow");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 5: Join task room
      log("\n🏠 Step 5: Joining task room...", "yellow");
      socket.emit("join-task-room", taskId);
      log(`✅ Joined room: task-${taskId}`, "green");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 6: Delete the task
      log("\n🗑️  Step 6: Deleting task...", "yellow");

      const deleteResponse = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const deleteData = await deleteResponse.json();

      if (deleteData.success) {
        log("✅ Task deleted via API", "green");
        log("   Waiting for socket event...", "yellow");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Cleanup
    log("\n🧹 Cleaning up...", "yellow");
    socket.disconnect();

    log("\n================================", "cyan");
    log("  ✅ All Tests Completed!", "green");
    log("================================\n", "cyan");

    process.exit(0);
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testSocketIO();
