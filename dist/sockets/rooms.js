"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoomHandlers;
const rooms_1 = __importDefault(require("../rooms"));
function registerRoomHandlers(io, socket) {
    const roomCreate = (payload) => {
        console.log("Room create", payload);
        // TODO: validate payload
        const newName = `${payload.roomName}-${Date.now().toString()}`;
        const roomData = {
            creatorEmail: payload.creatorEmail,
            roomDisplayName: payload.roomName,
            roomId: newName,
            roomMaxPlayers: payload.roomMaxPlayers,
            roomPin: payload.roomPin,
            roomPlayers: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        rooms_1.default.set(newName, roomData);
        socket.join(newName);
        socket.emit("room-created", {
            success: true,
            message: "Room created successfully",
            data: {
                roomDisplayName: roomData.roomDisplayName,
                roomId: roomData.roomId,
            },
        });
    };
    const roomJoin = (payload) => {
        console.log("Room join", payload);
        // TODO: validate payload
        const room = rooms_1.default.get(payload.roomId);
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
    };
    // socket.on("room-create", (payload: CreateRoomPayload) => {
    //   console.log("Room create", payload);
    //   // TODO: validate payload
    //   const newName = `${payload.roomName}-${Date.now().toString()}`;
    //   const roomData: RoomData = {
    //     creatorEmail: payload.creatorEmail,
    //     roomDisplayName: payload.roomName,
    //     roomId: newName,
    //     roomMaxPlayers: payload.roomMaxPlayers,
    //     roomPin: payload.roomPin,
    //     roomPlayers: [],
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   };
    //   rooms.set(newName, roomData);
    //   socket.join(newName);
    //   socket.emit("room-created", {
    //     success: true,
    //     message: "Room created successfully",
    //     data: {
    //       roomDisplayName: roomData.roomDisplayName,
    //       roomId: roomData.roomId,
    //     },
    //   });
    // });
    // socket.on("room-join", (payload: RoomJoinPayload) => {
    //   console.log("Room join", payload);
    //   // TODO: validate payload
    //   const room = rooms.get(payload.roomId);
    //   if (!room) {
    //     socket.emit("room-join-not-found", {
    //       success: false,
    //       message: "Room not found",
    //     });
    //     return;
    //   }
    //   room.roomPlayers.push({ playerEmail: payload.playerEmail });
    //   socket.join(payload.roomId);
    //   socket.emit("room-join-success", {
    //     success: true,
    //     message: "Room joined successfully",
    //     data: {
    //       roomDisplayName: room.roomDisplayName,
    //       roomId: room.roomId,
    //     },
    //   });
    // });
    socket.on("room:create", roomCreate);
    socket.on("room:join", roomJoin);
}
//# sourceMappingURL=rooms.js.map