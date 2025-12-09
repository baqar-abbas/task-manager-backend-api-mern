import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.isConnected) return;

    this.socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-user-room", userId);
    }
  }

  joinTaskRoom(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-task-room", taskId);
    }
  }

  onTaskCreated(callback) {
    if (this.socket) {
      this.socket.on("task-created", callback);
    }
  }

  onTaskUpdated(callback) {
    if (this.socket) {
      this.socket.on("task-updated", callback);
    }
  }

  onTaskDeleted(callback) {
    if (this.socket) {
      this.socket.on("task-deleted", callback);
    }
  }

  emitCreateTask(taskData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("create-task", taskData);
    }
  }

  emitUpdateTask(taskData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("update-task", taskData);
    }
  }
}

export default new SocketService();
