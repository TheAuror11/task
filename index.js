require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/authRoutes");
const { authenticateJWT } = require("./middlewares/authMiddleware");
const { cacheMiddleware, setCache } = require("./utils/cache");

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Caching Middleware
app.use("/api", cacheMiddleware);

// Routes
app.use("/api/auth", authRoutes);

// Socket.IO setup with JWT authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded; // Attach user information to the socket
    next();
  });
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room based on the user's ID
  socket.join(socket.user.id);

  socket.on("updateData", (data) => {
    // Emit the event to all clients in the user's room
    io.to(socket.user.id).emit("dataUpdated", data);
  });

  socket.on("broadcastMessage", (message) => {
    // Broadcast the message to all connected clients
    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = { io, setCache };
