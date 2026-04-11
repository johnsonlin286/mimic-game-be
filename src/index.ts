import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "http";

// import rooms from "./rooms";

import roomRoutes from "./routes/rooms";

import registerRoomHandlers from "./sockets/rooms";

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
  
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
}

io.on("connection", onConnection);

/*
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("room-create", (payload) => {
    console.log("Room create", payload);
    // TODO: validate payload
    const newName = `${payload.roomName}-${Date.now().toString()}`;
    const roomData: RoomData = {
      creatorEmail: payload.creatorEmail,
      roomDisplayName: payload.roomName,
      roomId: newName,
      roomMaxPlayers: payload.roomMaxPlayers,
      roomPin: payload.roomPin,
      roomPlayers: [
        { playerEmail: payload.creatorEmail },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rooms.set(newName, roomData);
    socket.join(newName)
    
    socket.emit("room-created", {
      success: true,
      message: "Room created successfully",
      data: {
        roomDisplayName: roomData.roomDisplayName,
        roomId: roomData.roomId,
      },
    });
  });

  socket.on("room-join", (payload) => {
    console.log("Room join", payload);
    // TODO: validate payload
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("room-join-not-found", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    room.roomPlayers.push({ playerEmail: payload.playerEmail });
    socket.join(payload.roomId);
    socket.emit("room-join-success", {
      success: true,
      message: "Room joined successfully",
      data: {
        roomDisplayName: room.roomDisplayName,
        roomId: room.roomId,
      },
    });
  })

  socket.on("test-emit", (payload) => {
    console.log("Test emit", payload);
    socket.to(payload.roomId).emit("test-emit-response", { ...payload })
  })
});
*/

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});