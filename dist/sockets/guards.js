"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoom = findRoom;
exports.findRoomPlayer = findRoomPlayer;
exports.findGamePlayer = findGamePlayer;
exports.requireHost = requireHost;
exports.requireGameStatus = requireGameStatus;
const rooms_1 = __importDefault(require("../rooms"));
/**
 * Lookup helpers used by every game-channel handler. Each one emits the
 * provided `failureEvent` and returns `null` on failure so the caller can
 * just `if (!x) return;`. This collapses ~5 lines of boilerplate per check
 * into a single line and keeps error wording consistent.
 */
function findRoom(socket, roomId, failureEvent) {
    const room = rooms_1.default.get(roomId);
    if (!room) {
        socket.emit(failureEvent, { success: false, message: "Room not found" });
        return null;
    }
    return room;
}
function findRoomPlayer(socket, room, playerEmail, failureEvent) {
    const player = room.roomPlayers.find(p => p.playerEmail === playerEmail);
    if (!player) {
        socket.emit(failureEvent, { success: false, message: "Player not found" });
        return null;
    }
    return player;
}
function findGamePlayer(socket, room, playerEmail, failureEvent) {
    const player = room.gameData?.players.find(p => p.playerEmail === playerEmail);
    if (!player) {
        socket.emit(failureEvent, { success: false, message: "Player not found" });
        return null;
    }
    return player;
}
function requireHost(socket, player, failureEvent) {
    if (player.role !== "host") {
        socket.emit(failureEvent, {
            success: false,
            message: "Player is not the host",
        });
        return false;
    }
    return true;
}
function requireGameStatus(socket, room, status, failureEvent) {
    if (room.gameRule.status !== status) {
        socket.emit(failureEvent, {
            success: false,
            message: `Game is not in ${status} state`,
        });
        return false;
    }
    return true;
}
//# sourceMappingURL=guards.js.map