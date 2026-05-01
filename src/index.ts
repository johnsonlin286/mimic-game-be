import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "http";

import roomRoutes from "./routes/rooms";

import registerRoomHandlers from "./sockets/rooms";
import registerUtilsHandlers from "./sockets/utils";
import registerGameHandlers from "./sockets/game";

import { startRoomGarbageCollector } from "./roomGarbageCollector";

dotenv.config({
  quiet: true,
});

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/rooms", roomRoutes);

const onConnection = (socket: Socket) => {
  console.log("A user connected");

  registerRoomHandlers(io, socket);
  registerUtilsHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
}

io.on("connection", onConnection);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startRoomGarbageCollector(io);
});