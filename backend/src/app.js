import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import projectRouter from "./routes/project.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: " http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/project", projectRouter);
app.use(errorMiddleware);

export default app;
