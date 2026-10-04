import app from "./src/app.js";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import connectToDb from "./src/config/db.js";
import envConfig from "./src/config/env.js";
import { createServer } from "http";
import { Server } from "socket.io";

connectToDb();

const port = envConfig.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {});
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("message", (data) => {
    console.log("user fired message");
    console.log("hello", data)
  });
  socket.on("disconnect", () => {
    /* … */
  });
});

httpServer.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
