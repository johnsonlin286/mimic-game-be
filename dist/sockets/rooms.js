"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoomHandlers;
const rooms_1 = __importDefault(require("../rooms"));
const serializers_1 = require("./serializers");
/** Returns true if `playerEmail` is currently in any room (optionally excluding one). */
function emailExistsInAnyRoom(playerEmail, exceptRoomId) {
    for (const room of rooms_1.default.values()) {
        if (exceptRoomId && room.roomId === exceptRoomId)
            continue;
        if (room.roomPlayers.some(p => p.playerEmail === playerEmail))
            return true;
    }
    return false;
}
/** Lobby threshold for moving between waiting/ready. */
const MIN_PLAYERS_TO_START = 3;
function syncLobbyStatus(room) {
    if (room.gameRule.status === "playing")
        return;
    room.gameRule.status =
        room.roomPlayers.length >= MIN_PLAYERS_TO_START ? "ready" : "waiting";
}
function registerRoomHandlers(io, socket) {
    const roomCreate = (payload) => {
        const { playerName, creatorEmail, roomMaxPlayers, isPublic } = payload;
        if (!playerName) {
            socket.emit("room-create-failed", {
                success: false,
                message: "Player name is required!",
            });
            return;
        }
        if (!creatorEmail) {
            socket.emit("room-create-failed", {
                success: false,
                message: "Creator email is required!",
            });
            return;
        }
        if (emailExistsInAnyRoom(creatorEmail)) {
            socket.emit("room-create-failed", {
                success: false,
                message: "Creator email already exists!",
            });
            return;
        }
        if (!roomMaxPlayers) {
            socket.emit("room-create-failed", {
                success: false,
                message: "Room max players is required!",
            });
            return;
        }
        if (roomMaxPlayers < 3 || roomMaxPlayers > 10) {
            socket.emit("room-create-failed", {
                success: false,
                message: "Room max players must be between 3 and 10!",
            });
            return;
        }
        const reformedPlayerName = playerName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const roomId = `${reformedPlayerName}-${Date.now()}`;
        const now = new Date();
        const roomData = {
            creatorEmail,
            roomId,
            roomMaxPlayers,
            roomPlayers: [
                { socketId: socket.id, playerName, playerEmail: creatorEmail, role: "host" },
            ],
            gameRule: {
                roles: { mimic: true, void: false },
                category: "food-drink",
                language: "en",
                status: "waiting",
            },
            isPublic,
            createdAt: now,
            updatedAt: now,
        };
        rooms_1.default.set(roomId, roomData);
        socket.join(roomId);
        socket.emit("room-created", {
            success: true,
            message: "Room created successfully",
            data: (0, serializers_1.roomBroadcast)(roomData),
        });
    };
    const roomJoin = (payload) => {
        const room = rooms_1.default.get(payload.roomId);
        if (!room) {
            socket.emit("room-join-failed", {
                success: false,
                message: "Room not found!",
            });
            return;
        }
        if (room.roomPlayers.length >= room.roomMaxPlayers) {
            socket.emit("room-join-failed", {
                success: false,
                message: "Room is full!",
            });
            return;
        }
        if (emailExistsInAnyRoom(payload.playerEmail)) {
            socket.emit("room-join-failed", {
                success: false,
                message: "Player already in another room!",
            });
            return;
        }
        socket.join(payload.roomId);
        room.roomPlayers.push({
            socketId: socket.id,
            playerName: payload.playerName,
            playerEmail: payload.playerEmail,
            role: "player",
        });
        syncLobbyStatus(room);
        room.updatedAt = new Date();
        const data = (0, serializers_1.roomBroadcast)(room);
        socket.emit("room-join-success", {
            success: true,
            message: "Room joined successfully",
            data,
        });
        io.to(payload.roomId).emit("listen-room-join-success", {
            success: true,
            message: `${payload.playerName} joined the room`,
            data,
        });
    };
    const roomRejoin = (payload) => {
        const room = rooms_1.default.get(payload.roomId);
        if (!room) {
            socket.emit("room-rejoin-not-found", {
                success: false,
                message: "Room not found",
            });
            return;
        }
        const player = room.roomPlayers.find(p => p.playerEmail === payload.playerEmail);
        if (!player) {
            socket.emit("room-rejoin-not-found", {
                success: false,
                message: "Player not found",
            });
            return;
        }
        // Reject only if the same email is registered in a *different* room. The
        // previous implementation searched all rooms (including this one) and
        // therefore always rejected — this is the bug fix.
        if (emailExistsInAnyRoom(payload.playerEmail, payload.roomId)) {
            socket.emit("room-rejoin-failed", {
                success: false,
                message: "Player already in another room!",
            });
            return;
        }
        socket.join(payload.roomId);
        player.socketId = payload.socketId;
        room.updatedAt = new Date();
        io.to(payload.roomId).emit("room-rejoin-success", {
            success: true,
            message: "Room rejoined successfully",
            data: (0, serializers_1.roomBroadcast)(room),
        });
    };
    const roomKick = (payload) => {
        const room = rooms_1.default.get(payload.roomId);
        if (!room) {
            socket.emit("room-kick-failed", {
                success: false,
                message: "Room not found",
            });
            return;
        }
        const player = room.roomPlayers.find(p => p.socketId === payload.socketId);
        if (!player) {
            socket.emit("room-kick-failed", {
                success: false,
                message: "Player not found",
            });
            return;
        }
        io.in(payload.socketId).socketsLeave(payload.roomId);
        room.roomPlayers = room.roomPlayers.filter(p => p.socketId !== payload.socketId);
        syncLobbyStatus(room);
        room.updatedAt = new Date();
        io.to(payload.socketId).emit("listen-room-kicked-player", {
            success: true,
            message: "You have been kicked from the room",
            data: { playerEmail: player.playerEmail },
        });
        io.to(payload.roomId).emit("listen-room-kick-player", {
            success: true,
            message: `${player.playerEmail} has been kicked from the room`,
            data: { room: (0, serializers_1.roomBroadcast)(room) },
        });
        if (room.roomPlayers.length === 0) {
            rooms_1.default.delete(payload.roomId);
        }
    };
    const roomLeave = (payload) => {
        const room = rooms_1.default.get(payload.roomId);
        if (!room) {
            socket.emit("room-leave-not-found", {
                success: false,
                message: "Room not found",
            });
            return;
        }
        const player = room.roomPlayers.find(p => p.socketId === payload.socketId);
        if (!player) {
            socket.emit("room-leave-not-found", {
                success: false,
                message: "Player not found",
            });
            return;
        }
        if (player.role === "host") {
            // Snapshot the players because roomKick mutates roomPlayers via
            // .filter() — iterating the live array would skip entries.
            const playersSnapshot = [...room.roomPlayers];
            for (const p of playersSnapshot) {
                roomKick({ roomId: payload.roomId, socketId: p.socketId });
            }
        }
        else {
            socket.leave(payload.roomId);
            room.roomPlayers = room.roomPlayers.filter(p => p.socketId !== payload.socketId);
            syncLobbyStatus(room);
            room.updatedAt = new Date();
            io.to(payload.roomId).emit("listen-room-leave-success", {
                success: true,
                message: `${player.playerEmail} left the room`,
                data: (0, serializers_1.roomBroadcast)(room),
            });
        }
        socket.emit("room-leave-success", {
            success: true,
            message: `${player.playerEmail} left the room`,
        });
        if (rooms_1.default.has(payload.roomId) && room.roomPlayers.length === 0) {
            rooms_1.default.delete(payload.roomId);
        }
    };
    socket.on("room:create", roomCreate);
    socket.on("room:join", roomJoin);
    socket.on("room:rejoin", roomRejoin);
    socket.on("room:leave", roomLeave);
    socket.on("room:kick", roomKick);
}
//# sourceMappingURL=rooms.js.map