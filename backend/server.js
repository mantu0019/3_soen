  import app from "./src/app.js";
  import dns from "dns";
  import connectToDb from "./src/config/db.js";
  import envConfig from "./src/config/env.js";

  import { createServer } from "http";
  import { Server } from "socket.io";

  import AppError from "./src/utils/appError.js";
  import jwt from "jsonwebtoken";
  import { parse } from "cookie-es";
  import mongoose from "mongoose";
  import projectModel from "./src/models/project.model.js";

  dns.setServers(["1.1.1.1", "8.8.8.8"]);

  connectToDb();

  const port = envConfig.PORT || 5000;

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // socket authenticate
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;

      if (!rawCookie) {
        return next(new AppError("Unauthorized", 401));
      }

      const projectId = socket.handshake.query.projectId;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new AppError("Invalid objectId", 401);
      }

      socket.project = await projectModel?.findById(projectId);

      const cookies = parse(rawCookie);

      const token = cookies?.token;

      if (!token) {
        return next(new AppError("Token not found", 401));
      }

      const decoded = jwt.verify(token, envConfig.JWT_SECRET);

      if (!decoded?.id) {
        return next(new AppError("Unauthorized", 401));
      }

      socket.userId = decoded.id;

      console.log("Socket authenticated:", socket.userId);

      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);

      next(new Error("Unauthorized"));
    }
  });

  //connection
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.userId);

    socket.join(socket?.project?._id);
    socket.on("project-message", (data) => {
      console.log("user message be like:", data);
      socket.broadcast.to(socket.project._id).emit("project-message", data);
    });
    socket.on("message", (data) => {
      console.log("User fired message");

      console.log("User ID:", socket.userId);

      console.log("Message:", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  // server
  httpServer.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
