"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
// import rooms from "./rooms";
const rooms_1 = __importDefault(require("./routes/rooms"));
const rooms_2 = __importDefault(require("./sockets/rooms"));
dotenv_1.default.config({
    quiet: true,
});
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api/rooms", rooms_1.default);
const onConnection = (socket) => {
    (0, rooms_2.default)(io, socket);
};
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
//# sourceMappingURL=index.js.map