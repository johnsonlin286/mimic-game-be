import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

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

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("room-create", (payload) => {
    console.log("Room create", payload);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});