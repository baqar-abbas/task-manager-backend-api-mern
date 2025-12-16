# 🚀 Task Manager Backend API

> A robust, production-ready RESTful API built with Node.js, Express, MongoDB, and Socket.io for real-time task management with authentication and authorization.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**Live API:** [https://task-manager-api-35i1.onrender.com](https://task-manager-api-35i1.onrender.com)  
**Health Check:** [https://task-manager-api-35i1.onrender.com/api/health](https://task-manager-api-35i1.onrender.com/api/health)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality

- ✅ **User Authentication** - Secure JWT-based auth with bcrypt password hashing
- ✅ **Task CRUD Operations** - Create, read, update, delete tasks with validation
- ✅ **Advanced Filtering** - Filter by status, priority, search, sort, and paginate
- ✅ **Task Statistics** - Real-time analytics on task completion and priorities
- ✅ **Profile Management** - Update user profile with duplicate checks

### Real-Time Features

- 🔌 **Socket.io Integration** - Real-time task notifications and updates
- 📡 **WebSocket Authentication** - Secure socket connections with JWT verification
- 🏠 **Room-Based Broadcasting** - User-specific and task-specific event channels
- ⚡ **Live Updates** - Instant notifications for task creation, updates, and deletion

### Security & Best Practices

- 🔐 **JWT Authentication** - Stateless, secure token-based authentication
- 🛡️ **Password Hashing** - Bcrypt with configurable salt rounds
- 🔒 **CORS Configuration** - Flexible origin management for production
- ✅ **Input Validation** - Express-validator for request sanitization
- 🚫 **Error Handling** - Comprehensive error middleware and logging
- 🔍 **Security Headers** - Helmet.js for HTTP security headers

### Developer Experience

- 📝 **API Documentation** - Detailed endpoint documentation with examples
- 🧪 **Automated Testing** - Socket.io test suite included
- 🔄 **Auto-Deploy** - CI/CD ready with Render auto-deployment
- 📊 **Health Checks** - Built-in health monitoring endpoint
- 🐛 **Development Logging** - Morgan HTTP request logger
- 🔧 **Environment-Based Config** - dotenv for flexible configuration

---

## 🛠️ Tech Stack

| Category           | Technology        | Purpose                               |
| ------------------ | ----------------- | ------------------------------------- |
| **Runtime**        | Node.js 18+       | JavaScript runtime environment        |
| **Framework**      | Express 5.x       | Web application framework             |
| **Database**       | MongoDB Atlas     | Cloud-hosted NoSQL database           |
| **ODM**            | Mongoose 9.x      | MongoDB object modeling               |
| **Authentication** | JWT + Bcrypt      | Secure authentication & hashing       |
| **Real-Time**      | Socket.io 4.x     | WebSocket bidirectional communication |
| **Validation**     | Express-validator | Request validation & sanitization     |
| **Security**       | Helmet.js         | HTTP security headers                 |
| **CORS**           | cors              | Cross-origin resource sharing         |
| **Logging**        | Morgan            | HTTP request logger                   |
| **Environment**    | dotenv            | Environment variable management       |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│         (React Frontend / Mobile App / API Client)          │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS + WebSocket
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                   API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express Server (Port: process.env.PORT)             │   │
│  │  - CORS Middleware                                   │   │
│  │  - Helmet Security                                   │   │
│  │  - Morgan Logger                                     │   │
│  │  - Body Parser                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────────┐      ┌──────────────────┐
│   REST Routes     │      │  Socket.io Hub   │
│  /api/auth        │      │  - JWT Auth      │
│  /api/tasks       │      │  - Room Manager  │
│  /api/health      │      │  - Event Broker  │
└─────────┬─────────┘      └────────┬─────────┘
          │                         │
          ▼                         ▼
┌─────────────────────────────────────────┐
│         Middleware Layer                │
│  - authenticate (JWT verification)      │
│  - validate (request validation)        │
│  - errorHandler (error management)      │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│        Controller Layer                 │
│  - authController (user ops)            │
│  - taskController (task ops)            │
│  - Emit Socket.io events                │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│          Service Layer                  │
│  - User Model (Mongoose)                │
│  - Task Model (Mongoose)                │
│  - JWT Utils                            │
│  - Validators                           │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│        Database Layer                   │
│  MongoDB Atlas (Cloud Database)         │
│  - Users Collection                     │
│  - Tasks Collection                     │
│  - Indexes on userId, status, priority  │
└─────────────────────────────────────────┘
```

### Request Flow

**HTTP Request Flow:**

```
Client → CORS → Helmet → Logger → Body Parser
  → Routes → Auth Middleware → Validation
    → Controller → Model → Database
      → Response → Socket.io Event Emission
```

**WebSocket Flow:**

```
Client → Socket.io Handshake → JWT Auth Middleware
  → Connection Established → Auto-join user-${userId} room
    → Listen for events (join-task-room, leave-task-room)
      → Broadcast to specific rooms
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **MongoDB Atlas** account (or local MongoDB)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/baqar-abbas/task-manager-backend-api-mern.git
   cd task-manager-backend-api-mern
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Verify server is running**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Quick Start with Docker (Optional)

```bash
docker build -t task-manager-api .
docker run -p 5000:5000 --env-file .env task-manager-api
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Optional: Redis (for future caching)
REDIS_URL=redis://localhost:6379
```

### Environment Variables Reference

| Variable             | Required | Default        | Description                                |
| -------------------- | -------- | -------------- | ------------------------------------------ |
| `NODE_ENV`           | No       | development    | Application environment                    |
| `PORT`               | No       | 5000           | Server port (Render injects automatically) |
| `MONGODB_URI`        | Yes      | -              | MongoDB connection string                  |
| `JWT_SECRET`         | Yes      | -              | Secret key for JWT signing (min 32 chars)  |
| `JWT_EXPIRES_IN`     | No       | 7d             | JWT token expiration time                  |
| `BCRYPT_SALT_ROUNDS` | No       | 10             | Bcrypt hashing rounds                      |
| `FRONTEND_URL`       | Yes      | localhost:5173 | Frontend origin for CORS                   |

---

## 📚 API Documentation

### Base URL

- **Production:** `https://task-manager-api-35i1.onrender.com/api`
- **Development:** `http://localhost:5000/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication Endpoints

| Method | Endpoint               | Auth      | Description       |
| ------ | ---------------------- | --------- | ----------------- |
| POST   | `/auth/register`       | Public    | Register new user |
| POST   | `/auth/login`          | Public    | Login user        |
| GET    | `/auth/me`             | Protected | Get current user  |
| PUT    | `/auth/update-profile` | Protected | Update profile    |
| POST   | `/auth/logout`         | Protected | Logout user       |

#### Task Endpoints

| Method | Endpoint                | Auth      | Description              |
| ------ | ----------------------- | --------- | ------------------------ |
| POST   | `/tasks`                | Protected | Create new task          |
| GET    | `/tasks`                | Protected | Get all tasks (filtered) |
| GET    | `/tasks/:id`            | Protected | Get single task          |
| PUT    | `/tasks/:id`            | Protected | Update task              |
| DELETE | `/tasks/:id`            | Protected | Delete task              |
| PATCH  | `/tasks/:id/status`     | Protected | Update task status       |
| GET    | `/tasks/stats/overview` | Protected | Get task statistics      |
| GET    | `/tasks/filter/options` | Protected | Get filter options       |

#### System Endpoints

| Method | Endpoint  | Auth   | Description  |
| ------ | --------- | ------ | ------------ |
| GET    | `/health` | Public | Health check |

### Detailed API Examples

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Test123456",
  "confirmPassword": "Test123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "673f1a2b3c4d5e6f7a8b9c0d",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2025-12-17T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Test123456"
}
```

#### 3. Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-30",
  "tags": ["documentation", "urgent"],
  "estimatedTime": 120
}
```

#### 4. Get Tasks with Filters

```http
GET /api/tasks?page=1&limit=10&status=pending&priority=high&search=project&sortBy=dueDate&sortOrder=asc
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [...],
    "pagination": {
      "total": 45,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 5. Update Task Status

```http
PATCH /api/tasks/673f1a2b3c4d5e6f7a8b9c0d/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress"
}
```

#### 6. Get Task Statistics

```http
GET /api/tasks/stats/overview
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "pending": 12,
      "in-progress": 8,
      "completed": 23,
      "archived": 2
    },
    "byPriority": {
      "low": 5,
      "medium": 15,
      "high": 20,
      "urgent": 5
    },
    "overdue": 3,
    "completionRate": 51.1
  }
}
```

### Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

For complete API documentation with request/response examples, see [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md).

---

## 🔌 Real-Time Features

### Socket.io Integration

The API uses Socket.io for real-time bidirectional communication.

#### Connection

```javascript
import { io } from "socket.io-client";

const socket = io("https://task-manager-api-35i1.onrender.com", {
  auth: {
    token: "your-jwt-token",
  },
  transports: ["websocket", "polling"],
});
```

#### Room Structure

- **User Rooms:** `user-${userId}` (auto-joined on connection)
- **Task Rooms:** `task-${taskId}` (manual join/leave)

#### Client → Server Events

```javascript
// Join a task room
socket.emit("join-task-room", taskId);

// Leave a task room
socket.emit("leave-task-room", taskId);
```

#### Server → Client Events

```javascript
// Task created
socket.on("task-created", (data) => {
  // data: { success: true, task: {...}, timestamp: "..." }
});

// Task updated
socket.on("task-updated", (data) => {
  // Emitted to user room + task room
});

// Task deleted
socket.on("task-deleted", (data) => {
  // data: { success: true, taskId: "...", timestamp: "..." }
});

// Task status updated
socket.on("task-status-updated", (data) => {
  // Emitted to user room + task room
});
```

#### Event Payload Structure

```typescript
interface SocketEventPayload {
  success: boolean;
  task?: Task; // For create, update, status-updated
  taskId?: string; // For delete
  timestamp: string; // ISO 8601 format
}
```

For complete Socket.io documentation, see [SOCKET_IO_GUIDE.md](SOCKET_IO_GUIDE.md).

---

## 🌐 Deployment

### Deployment on Render

This project is configured for seamless deployment on Render with auto-deployment from the `deploy` branch.

#### Prerequisites

- Render account
- MongoDB Atlas database
- GitHub repository connected

#### Deployment Steps

1. **Create Web Service on Render**

   - New → Web Service
   - Connect GitHub repository
   - Select branch: `deploy`
   - Region: Choose closest to your MongoDB region

2. **Configuration** (Auto-detected from `render.yaml`)

   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

3. **Environment Variables** (Set in Render Dashboard)

   ```
   NODE_ENV=production
   MONGODB_URI=<your-atlas-uri>
   JWT_SECRET=<strong-secret-key>
   FRONTEND_URL=https://your-frontend.onrender.com
   BCRYPT_SALT_ROUNDS=10
   ```

4. **Deploy**
   - Render automatically builds and deploys
   - Health check monitors `/api/health`
   - Auto-deploys on push to `deploy` branch

#### Manual Deployment

```bash
# Switch to deploy branch
git switch deploy

# Merge latest changes
git merge development

# Push to trigger deployment
git push origin deploy
```

### Other Platforms

<details>
<summary>Deploy to Heroku</summary>

```bash
heroku create task-manager-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-uri>
heroku config:set JWT_SECRET=<your-secret>
heroku config:set FRONTEND_URL=<your-frontend-url>
git push heroku main
```

</details>

<details>
<summary>Deploy to Railway</summary>

```bash
railway login
railway init
railway add
# Set environment variables in Railway dashboard
railway up
```

</details>

<details>
<summary>Deploy to AWS (EC2 + PM2)</summary>

```bash
# On EC2 instance
git clone <your-repo>
cd task-manager-backend-api-mern
npm install
npm install -g pm2

# Create .env file with production values
pm2 start src/server.js --name task-api
pm2 startup
pm2 save
```

</details>

---

## 📁 Project Structure

```
task-manager-backend-api-mern/
├── src/
│   ├── server.js                 # Application entry point
│   ├── config/
│   │   └── db.js                # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── taskController.js    # Task CRUD operations
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── role.js              # Role-based access control
│   │   └── validate.js          # Request validation middleware
│   ├── models/
│   │   ├── User.js              # User schema & methods
│   │   └── Task.js              # Task schema & methods
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoint definitions
│   │   └── taskRoutes.js        # Task endpoint definitions
│   ├── sockets/
│   │   └── (socket handlers)    # Socket.io event handlers
│   └── utils/
│       ├── jwt.js               # JWT token utilities
│       ├── socket.js            # Socket.io helpers
│       └── validators.js        # Validation rules
├── tests/
│   └── (test files)             # Unit & integration tests
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── render.yaml                  # Render deployment config
├── socket-test.js               # Socket.io test script
├── API_TESTING_GUIDE.md         # API documentation
├── SOCKET_IO_GUIDE.md           # Socket.io documentation
├── LICENSE                      # ISC License
└── README.md                    # This file
```

---

## 🧪 Testing

### Run Automated Tests

```bash
# Run all tests
npm test

# Run Socket.io integration test
node socket-test.js

# Run with coverage
npm run test:coverage
```

### Manual API Testing

#### Using cURL

```bash
# Health check
curl https://task-manager-api-35i1.onrender.com/api/health

# Register
curl -X POST https://task-manager-api-35i1.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123456","confirmPassword":"Test123456"}'

# Login
curl -X POST https://task-manager-api-35i1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

#### Using PowerShell

```powershell
# See API_TESTING_GUIDE.md for complete PowerShell examples
$BASE = "https://task-manager-api-35i1.onrender.com/api"
Invoke-RestMethod -Uri "$BASE/health" | ConvertTo-Json
```

#### Using Postman

Import the API collection from `API_TESTING_GUIDE.md` or use:

- Base URL: `https://task-manager-api-35i1.onrender.com/api`
- Set environment variable `{{token}}` after login

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**

   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Commit your changes**

   ```bash
   git commit -m "feat: add awesome feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/)

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Link related issues
   - Request review

### Code Style

- Use ES6+ features
- Follow ESLint rules (run `npm run lint`)
- Write meaningful commit messages
- Add JSDoc comments for functions
- Keep functions small and focused

### Branching Strategy

- `main` - Production-ready code
- `development` - Integration branch
- `deploy` - Deployment branch (auto-deploys to Render)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

---

## 📄 License

This project is licensed under the **ISC License**.

```
Copyright (c) 2025 Baqar Abbas

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 👤 Author

**Baqar Abbas**

- GitHub: [@baqar-abbas](https://github.com/baqar-abbas)
- Repository: [task-manager-backend-api-mern](https://github.com/baqar-abbas/task-manager-backend-api-mern)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - Document database
- [Socket.io](https://socket.io/) - Real-time bidirectional communication
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [JWT](https://jwt.io/) - JSON Web Tokens
- [Render](https://render.com/) - Cloud hosting platform

---

## 📞 Support

If you have any questions or need help:

1. Check the [API Testing Guide](API_TESTING_GUIDE.md)
2. Check the [Socket.io Guide](SOCKET_IO_GUIDE.md)
3. Open an [issue](https://github.com/baqar-abbas/task-manager-backend-api-mern/issues)
4. Contact: [Create an issue](https://github.com/baqar-abbas/task-manager-backend-api-mern/issues/new)

---

## 🗺️ Roadmap

- [ ] Add unit tests with Jest
- [ ] Implement Redis caching layer
- [ ] Add rate limiting per user
- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Task sharing between users
- [ ] File attachments for tasks
- [ ] Task comments and activity log
- [ ] Advanced analytics dashboard
- [ ] Export tasks to CSV/PDF
- [ ] GraphQL API alternative
- [ ] Swagger/OpenAPI documentation

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Baqar Abbas](https://github.com/baqar-abbas)

</div>
