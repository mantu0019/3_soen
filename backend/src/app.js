import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import projectRouter from "./routes/project.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import aiRouter from "./routes/ai.routes.js";
import envConfig from "./config/env.js";

const app = express();

const allowedOrigin =
  envConfig.FRONTEND_URL || "http://localhost:5173";

// CORS
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/project", projectRouter);
app.use("/ai/api", aiRouter);

// Error middleware
app.use(errorMiddleware);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("DevMate Backend is running!");
});

export default app;