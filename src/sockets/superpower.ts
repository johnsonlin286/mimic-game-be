import { Server, Socket } from "socket.io";

import {
  findGamePlayer,
  findRoom,
  findRoomPlayer,
  requireGameStatus,
  requireHost,
} from "./guards";
import { maskedPlayer, publicPlayer } from "./serializers";

export default function registerSuperpowerHandlers(io: Server, socket: Socket) {
  
  const useDetective = (player: PlayerWithRole, room: RoomData) => {
    // TODO: implement
  }

  const useSuperpower = (payload: UseSuperpowerPayload) => {
    const room = findRoom(socket, payload.roomId, "use-superpower-failed");
    if (!room) return;

    const player = findGamePlayer(socket, room, payload.playerEmail, "use-superpower-failed");
    if (!player) return;

    if (player.superpower?.name !== payload.powerName) {
      socket.emit("use-superpower-failed", { success: false, message: "You don't have this superpower" });
      return;
    }
    
    if (player.hasUsedSuperpower) {
      socket.emit("use-superpower-failed", { success: false, message: "You have already used your active superpower" });
      return;
    }

    room.updatedAt = new Date();
    player.hasUsedSuperpower = true;
    switch (payload.powerName) {
      case "interrogator":
        // socket.emit("use-superpower-interrogator", {
        //   success: true,
        //   message: "You used the interrogator superpower",
        //   data: publicPlayer(player),
        // });
        io.to(room.roomId).emit("listen-use-superpower-success", {
          success: true,
          message: `${player.playerName} used the interrogator superpower`,
          data: maskedPlayer(player),
        });
        break;
      case "detective":
        // fetch all isAlive players in the room except the player and send them to the player
        const players = room.gameData?.players?.filter(p => p.isAlive && p.playerEmail !== payload.playerEmail) ?? [];
        socket.emit("use-superpower-detective", {
          success: true,
          message: "You used the detective superpower",
          data: players.map(p => (
            {
              socketId: p.socketId,
              playerName: p.playerName,
              playerEmail: p.playerEmail,
              gameRole: p.gameRole === "majority" ? "majority" : "minority",
            }
          )),
        });
        io.to(room.roomId).emit("listen-use-superpower-success", {
          success: true,
          message: `${player.playerName} used the detective superpower`,
          data: maskedPlayer(player),
        });
        break;
      default:
        socket.emit("use-superpower-failed", { success: false, message: "Invalid superpower" });
        return;
    }
  };

  socket.on("superpower:use-power", useSuperpower);
}