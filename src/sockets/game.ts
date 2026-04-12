import { Server, Socket } from "socket.io";

import rooms from "../rooms";

export default function registerGameHandlers(io: Server, socket: Socket) {
  const gameConfig = (payload: GameConfigPayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-config-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    room.gameRule = payload.gameRule;
    room.updatedAt = new Date();
    socket.emit("game-config-success", {
      success: true,
      message: "Game config updated successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }
  
  const gameStart = (payload: GameStartPayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-start-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    if (room.gameRule.status !== "waiting") {
      socket.emit("game-start-failed", {
        success: false,
        message: "Game is not in waiting state",
      });
      return;
    }
    room.gameRule.status = "playing";
    room.updatedAt = new Date();
    socket.emit("game-start-success", {
      success: true,
      message: "Game started successfully",
    });
    io.to(payload.roomId).emit("game-start-success", {
      success: true,
      message: "Game started successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }

  socket.on("game:config", gameConfig)
  socket.on("game:start", gameStart)
}