import { Server, Socket } from "socket.io";

import rooms from "../rooms";

export default function registerGameHandlers(io: Server, socket: Socket) {
  const gameRuleUpdate = (payload: GameRuleUpdatePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-rule-update-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    room.gameRule = payload.gameRule;
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-rule-update-success", {
      success: true,
      message: "Game rule updated successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        isPublic: room.isPublic,
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
    io.to(payload.roomId).emit("listen-game-start-success", {
      success: true,
      message: "Game started successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }

  socket.on("game:update-rule", gameRuleUpdate)
  socket.on("game:start", gameStart)
}