import { Server, Socket } from "socket.io";

import { maskWordWithHint } from "../algorithmScript";
import {
  findGamePlayer,
  findRoom,
} from "./guards";
import { maskedPlayer, publicPlayer } from "./serializers";

export default function registerSuperpowerHandlers(io: Server, socket: Socket) {
  const useSuperpower = (payload: UseSuperpowerPayload) => {
    const room = findRoom(socket, payload.roomId, "use-superpower-failed");
    if (!room) return;

    const player = findGamePlayer(socket, room, payload.playerEmail, "use-superpower-failed");
    if (!player) return;

    if (player.superpower?.name !== payload.powerName) {
      socket.emit("use-superpower-failed", { success: false, message: "You don't have this specialist" });
      return;
    }
    
    if (player.hasUsedSuperpower) {
      socket.emit("use-superpower-failed", { success: false, message: "You have already used your active specialist" });
      return;
    }

    room.updatedAt = new Date();
    
    let players: PlayerWithRole[] = room.gameData?.players?.filter(p => p.isAlive && p.playerEmail !== payload.playerEmail) ?? [];
    switch (payload.powerName) {
      case "interrogator":
        socket.emit("use-superpower-interrogator", {
          success: true,
          message: "You used the interrogator specialist",
          data: players.map(p => maskedPlayer(p)),
        });
        io.to(room.roomId).emit("listen-use-superpower-success", {
          success: true,
          message: `${player.playerName} used the ${'interrogator'.toUpperCase()} specialist`,
          data: {
            superpowerName: 'interrogator',
            message: `${player.playerName} used the ${'interrogator'.toUpperCase()} specialist`,
          }
        });
        break;
      case "detective":
        player.hasUsedSuperpower = true;
        socket.emit("use-superpower-detective", {
          success: true,
          message: "You used the detective specialist",
          data: players.map(p => (
            {
              socketId: p.socketId,
              playerName: p.playerName,
              playerEmail: p.playerEmail,
              gameRole: p.gameRole === "majority" ? "majority" : "minority",
              hasUsedSuperpower: p.hasUsedSuperpower,
            }
          )),
        });
        io.to(room.roomId).emit("listen-use-superpower-success", {
          success: true,
          message: `${player.playerName} used the ${'detective'.toUpperCase()} specialist`,
          data: {
            superpowerName: 'detective',
            message: `${player.playerName} used the ${'detective'.toUpperCase()} specialist`,
          }
        });
        break;
      case "wiretapper":
        player.hasUsedSuperpower = true;
        players = room.gameData?.players?.filter(p => p.isAlive && p.playerEmail !== payload.playerEmail) ?? [];
        const playersWords = players.map(p => (
          {
            socketId: p.socketId,
            playerName: p.playerName,
            playerEmail: p.playerEmail,
            gameWord: p.gameRole === "blind" ? "NO SIGNAL" : maskWordWithHint(p.gameWord),
          }
        ));
        socket.emit("use-superpower-wiretapper", {
          success: true,
          message: "You used the wiretapper specialist",
          data: playersWords,
        });
        io.to(room.roomId).emit("listen-use-superpower-success", {
          success: true,
          message: `${player.playerName} used the ${'wiretapper'.toUpperCase()} specialist`,
          data: {
            superpowerName: 'wiretapper',
            message: `${player.playerName} used the ${'wiretapper'.toUpperCase()} specialist`,
          }
        });
        break;
      default:
        socket.emit("use-superpower-failed", { success: false, message: "Invalid specialist" });
        return;
    }
  };

  const interrogatorPickTarget = (payload: InterrogatorPickTargetPayload) => {
    const room = findRoom(socket, payload.roomId, "interrogator-pick-target-failed");
    if (!room) return;

    const player = findGamePlayer(socket, room, payload.playerEmail, "interrogator-pick-target-failed");
    if (!player) return;

    if (player.superpower?.name !== "interrogator") {
      socket.emit("interrogator-pick-target-failed", { success: false, message: "You don't have the interrogator superpower" });
    }

    if (player.hasUsedSuperpower) {
      socket.emit("interrogator-pick-target-failed", { success: false, message: "You have already used your active superpower" });
      return;
    }

    const targetPlayer = findGamePlayer(socket, room, payload.targetPlayerEmail, "interrogator-pick-target-failed");
    
    if (!targetPlayer) {
      socket.emit("interrogator-pick-target-failed", { success: false, message: "Target player not found" });
      return;
    }

    room.updatedAt = new Date();
    player.hasUsedSuperpower = true;

    socket.emit("interrogator-pick-target-success", {
      success: true,
      message: "You picked the target",
    });

    io.to(room.roomId).emit("listen-interrogator-pick-target-success", {
      success: true,
      message: `${player.playerName} picked ${targetPlayer.playerName} as the target`,
      data: {
        superpowerName: 'interrogator',
        userName: player.playerName,
        message: `${player.playerName} picked ${targetPlayer.playerName} as the target`,
      }
    });
  }

  socket.on("superpower:use-power", useSuperpower);
  socket.on("superpower:interrogator-pick-target", interrogatorPickTarget);
}