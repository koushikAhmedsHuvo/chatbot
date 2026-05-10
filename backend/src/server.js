import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import { initializeSocket } from "./socket.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import groupRoutes from "./routes/group.route.js";
import searchRoutes from "./routes/search.route.js";
import aiRoutes from "./routes/ai.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = initializeSocket(server);

// Updated CORS configuration to include the deployed frontend URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://finalprojectfrontend-flax.vercel.app",
      "http://192.168.137.1:5173", // Add your local IP
      "http://192.168.1.100:4173",
      "http://172.16.240.19:5173/",
      "https://chatbot-b8rxz8tw1-koushik-ahmeds-projects-6b305285.vercel.app", // Previous deployed frontend URL
      "https://chatbot-21lxdgssk-koushik-ahmeds-projects-6b305285.vercel.app", // New deployed frontend URL
      "https://chatbot-buuaezw29-koushik-ahmeds-projects-6b305285.vercel.app", // Added new deployed frontend URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, message });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
