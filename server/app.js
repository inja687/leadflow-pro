import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/requests", requestRoutes);
// Public Routes — no auth required
app.use("/api/public", publicRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LeadFlow Pro API Running 🚀",
  });
});

export default app;