import type { Socket } from "socket.io";

import rooms from "../rooms";

/**
 * Lookup helpers used by every game-channel handler. Each one emits the
 * provided `failureEvent` and returns `null` on failure so the caller can
 * just `if (!x) return;`. This collapses ~5 lines of boilerplate per check
 * into a single line and keeps error wording consistent.
 */

export function findRoom(
  socket: Socket,
  roomId: string,
  failureEvent: string,
): RoomData | null {
  const room = rooms.get(roomId);
  if (!room) {
    socket.emit(failureEvent, { success: false, message: "Room not found" });
    return null;
  }
  return room;
}

export function findRoomPlayer(
  socket: Socket,
  room: RoomData,
  playerEmail: string,
  failureEvent: string,
): RoomPlayerData | null {
  const player = room.roomPlayers.find(p => p.playerEmail === playerEmail);
  if (!player) {
    socket.emit(failureEvent, { success: false, message: "Player not found" });
    return null;
  }
  return player;
}

export function findGamePlayer(
  socket: Socket,
  room: RoomData,
  playerEmail: string,
  failureEvent: string,
): PlayerWithRole | null {
  const player = room.gameData?.players.find(p => p.playerEmail === playerEmail);
  if (!player) {
    socket.emit(failureEvent, { success: false, message: "Player not found" });
    return null;
  }
  return player;
}

export function requireHost(
  socket: Socket,
  player: RoomPlayerData,
  failureEvent: string,
): boolean {
  if (player.role !== "host") {
    socket.emit(failureEvent, {
      success: false,
      message: "Player is not the host",
    });
    return false;
  }
  return true;
}

export function requireGameStatus(
  socket: Socket,
  room: RoomData,
  status: GameStatus,
  failureEvent: string,
): boolean {
  if (room.gameRule.status !== status) {
    socket.emit(failureEvent, {
      success: false,
      message: `Game is not in ${status} state`,
    });
    return false;
  }
  return true;
}
