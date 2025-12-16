# Socket.io Real-Time Implementation Guide

## 🔌 Overview

This application uses Socket.io for real-time task notifications. All WebSocket connections are **authenticated** and **secure**.

---

## 🔐 Authentication

### Server-Side (Automatic)

Socket connections require JWT authentication. The token is verified before any connection is established.

### Client-Side Connection

```javascript
import { io } from "socket.io-client";

const token = localStorage.getItem("token"); // Your JWT token

const socket = io("http://localhost:5000", {
  auth: {
    token: token,
  },
  // Alternative: pass as query parameter
  // query: { token: token }
});
```

---

## 📡 Events Reference

### Client → Server (Emit)

#### `join-task-room`

Join a specific task room to receive updates about that task.

```javascript
socket.emit("join-task-room", taskId);
```

#### `leave-task-room`

Leave a task room when no longer viewing the task.

```javascript
socket.emit("leave-task-room", taskId);
```

---

### Server → Client (Listen)

#### `task-created`

Triggered when a new task is created by the authenticated user.

```javascript
socket.on("task-created", (data) => {
  console.log("New task created:", data.task);
  // data = { success: true, task: {...}, timestamp: "..." }
});
```

#### `task-updated`

Triggered when a task is updated (either by you or broadcasted to task room).

```javascript
socket.on("task-updated", (data) => {
  console.log("Task updated:", data.task);
  // data = { success: true, task: {...}, timestamp: "..." }
});
```

#### `task-deleted`

Triggered when a task is deleted.

```javascript
socket.on("task-deleted", (data) => {
  console.log("Task deleted:", data.taskId);
  // data = { success: true, taskId: "...", timestamp: "..." }
});
```

#### `task-status-updated`

Triggered when a task status changes (pending, in-progress, completed, archived).

```javascript
socket.on("task-status-updated", (data) => {
  console.log("Task status updated:", data.task);
  // data = { success: true, task: {...}, timestamp: "..." }
});
```

---

## 🏠 Room Structure

### User Rooms

- **Format:** `user-${userId}`
- **Auto-join:** Users automatically join their own room on connection
- **Purpose:** Receive private notifications about their own tasks

### Task Rooms

- **Format:** `task-${taskId}`
- **Manual join:** Client must explicitly join via `join-task-room` event
- **Purpose:** Receive updates when viewing a specific task (useful for collaborative features)

---

## 🚀 Complete Frontend Example

```javascript
import { io } from "socket.io-client";

class TaskSocketManager {
  constructor(token) {
    this.socket = null;
    this.token = token;
    this.currentTaskRooms = new Set();
  }

  connect() {
    this.socket = io("http://localhost:5000", {
      auth: { token: this.token },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to WebSocket");
      console.log("Socket ID:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from WebSocket:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });

    // Listen for task events
    this.setupTaskListeners();
  }

  setupTaskListeners() {
    // Task created
    this.socket.on("task-created", (data) => {
      console.log("📝 New task created:", data.task);
      // Update UI - add new task to list
      this.onTaskCreated(data.task);
    });

    // Task updated
    this.socket.on("task-updated", (data) => {
      console.log("✏️ Task updated:", data.task);
      // Update UI - refresh task details
      this.onTaskUpdated(data.task);
    });

    // Task deleted
    this.socket.on("task-deleted", (data) => {
      console.log("🗑️ Task deleted:", data.taskId);
      // Update UI - remove task from list
      this.onTaskDeleted(data.taskId);
    });

    // Task status updated
    this.socket.on("task-status-updated", (data) => {
      console.log("🔄 Task status updated:", data.task);
      // Update UI - refresh task status
      this.onTaskStatusUpdated(data.task);
    });
  }

  // Join a task room (when viewing task details)
  joinTaskRoom(taskId) {
    if (!this.currentTaskRooms.has(taskId)) {
      this.socket.emit("join-task-room", taskId);
      this.currentTaskRooms.add(taskId);
      console.log(`Joined task room: ${taskId}`);
    }
  }

  // Leave a task room (when leaving task details page)
  leaveTaskRoom(taskId) {
    if (this.currentTaskRooms.has(taskId)) {
      this.socket.emit("leave-task-room", taskId);
      this.currentTaskRooms.delete(taskId);
      console.log(`Left task room: ${taskId}`);
    }
  }

  // Clean up all task rooms
  leaveAllTaskRooms() {
    this.currentTaskRooms.forEach((taskId) => {
      this.socket.emit("leave-task-room", taskId);
    });
    this.currentTaskRooms.clear();
  }

  disconnect() {
    if (this.socket) {
      this.leaveAllTaskRooms();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Callback methods (implement based on your UI framework)
  onTaskCreated(task) {
    // React: setTasks(prev => [...prev, task])
    // Vue: tasks.value.push(task)
    // Vanilla: updateTaskList(task)
  }

  onTaskUpdated(task) {
    // Update task in your state/UI
  }

  onTaskDeleted(taskId) {
    // Remove task from your state/UI
  }

  onTaskStatusUpdated(task) {
    // Update task status in your state/UI
  }
}

// Usage
const token = localStorage.getItem("token");
const socketManager = new TaskSocketManager(token);

// Connect when user logs in
socketManager.connect();

// Join task room when viewing task details
socketManager.joinTaskRoom("task-id-here");

// Leave task room when navigating away
socketManager.leaveTaskRoom("task-id-here");

// Disconnect when user logs out
socketManager.disconnect();
```

---

## 🔒 Security Features

### ✅ What's Implemented:

1. **JWT Authentication:** Every socket connection requires a valid JWT token
2. **Automatic Room Assignment:** Users automatically join only their own room
3. **Validated Task IDs:** Task room joins validate the taskId format
4. **User Isolation:** Users only receive notifications for their own tasks in user rooms
5. **Error Handling:** Connection errors and authentication failures are handled

### 🛡️ Best Practices:

- **Always validate tokens** - Token is verified on connection
- **Use HTTPS in production** - Update CORS and origins
- **Set proper CORS origins** - Configure `process.env.FRONTEND_URL`
- **Monitor connections** - Server logs all connections and events
- **Clean up on logout** - Call `socket.disconnect()` when user logs out

---

## 🐛 Debugging

### Check Connection Status

```javascript
socket.on("connect", () => {
  console.log("Connected:", socket.connected);
  console.log("Socket ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Error:", error.message);
});
```

### Server-Side Logs

The server logs all socket events:

- `🔌 New client connected: socket-id (User: user-id)`
- `Client socket-id joined user room: user-user-id`
- `Client socket-id joined task room: task-task-id`
- `Client disconnected: socket-id (Reason: ...)`

### Common Issues:

**Problem:** Connection fails with "Authentication error"

- **Solution:** Ensure token is passed in `auth.token` or `query.token`

**Problem:** Not receiving events

- **Solution:** Check if you're listening to the correct event names
- **Solution:** Verify user is authenticated and in the correct room

**Problem:** Receiving duplicate events

- **Solution:** Remove old listeners before adding new ones
- **Solution:** Don't create multiple socket connections

---

## 📊 Event Payload Structure

All events follow a consistent structure:

```typescript
interface SocketEventPayload {
  success: boolean;
  task?: Task; // For create, update, status-updated
  taskId?: string; // For delete
  timestamp: string; // ISO 8601 format
}
```

---

## 🎯 Use Cases

### 1. Task Dashboard (Real-time Updates)

```javascript
// Listen for all task events to update the dashboard
socket.on("task-created", updateDashboard);
socket.on("task-updated", updateDashboard);
socket.on("task-deleted", updateDashboard);
socket.on("task-status-updated", updateDashboard);
```

### 2. Task Detail Page (Collaborative View)

```javascript
// Join task room when viewing details
useEffect(() => {
  socketManager.joinTaskRoom(taskId);

  return () => {
    socketManager.leaveTaskRoom(taskId);
  };
}, [taskId]);
```

### 3. Notifications System

```javascript
socket.on("task-status-updated", (data) => {
  if (data.task.status === "completed") {
    showNotification("Task completed! 🎉");
  }
});
```

---

## 🚀 Testing Socket.io

### Using socket.io-client in Node.js:

```javascript
const { io } = require("socket.io-client");

const token = "your-jwt-token";
const socket = io("http://localhost:5000", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Connected!");
});

socket.on("task-created", (data) => {
  console.log("Task created:", data);
});
```

### Using Browser Console:

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "your-token-here" },
});

socket.on("connect", () => console.log("Connected"));
socket.on("task-created", (data) => console.log("Task:", data));
```

---

## ✅ Checklist

- [x] Socket.io server configured with CORS
- [x] JWT authentication middleware for sockets
- [x] User rooms auto-join on connection
- [x] Task room join/leave events
- [x] Real-time task creation notifications
- [x] Real-time task update notifications
- [x] Real-time task deletion notifications
- [x] Real-time task status update notifications
- [x] Error handling and logging
- [x] Secure room targeting (user-${userId}, task-${taskId})
- [x] Timestamp included in all events
- [x] Broadcasting to both user and task rooms

---

## 🔗 Related Files

- **Server Setup:** `src/server.js` (lines 15-96)
- **Task Controller:** `src/controllers/taskController.js`
- **Environment:** `.env` (set `FRONTEND_URL` and `JWT_SECRET`)

---

Happy Real-Time Coding! 🚀
