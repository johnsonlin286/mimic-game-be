"use strict";
/**
 * Shared serializers for socket payloads.
 *
 * Two goals:
 *  - Strip server-only fields (`gameRole`, `gameWord`, `wordPairList`) before
 *    broadcasting, so we never accidentally leak roles or upcoming word pairs.
 *  - Keep the wire format identical across handlers so clients can rely on a
 *    single shape.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicPlayer = publicPlayer;
exports.maskedPlayer = maskedPlayer;
exports.roomBroadcast = roomBroadcast;
exports.gameBroadcast = gameBroadcast;
/** Fields safe to expose to every player in the room. */
function publicPlayer(player) {
    return {
        socketId: player.socketId,
        playerName: player.playerName,
        playerEmail: player.playerEmail,
        gameRole: player.gameRole,
        gameWord: player.gameWord,
        superpower: player.superpower,
        hasUsedSuperpower: player.hasUsedSuperpower,
        hasVoted: player.hasVoted,
        voters: player.voters,
        isAlive: player.isAlive,
    };
}
/** Public player view that hides role/word — used during active rounds. */
function maskedPlayer(player) {
    return {
        socketId: player.socketId,
        playerName: player.playerName,
        playerEmail: player.playerEmail,
        hasVoted: player.hasVoted,
        hasUsedSuperpower: player.hasUsedSuperpower,
        voters: player.voters,
        isAlive: player.isAlive,
    };
}
/**
 * Broadcast view of a room used by `rooms.ts` events. Omits `creatorEmail`
 * (PII) but exposes `creatorName` so the lobby UI can label the host.
 */
function roomBroadcast(room) {
    return {
        creatorName: room.creatorName,
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        gameData: room.gameData,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
    };
}
/**
 * Broadcast view of a room used by `game.ts` events while a round is active.
 * Strips `wordPairList` and any per-player role/word data by default; opt-in
 * via `options` when revealing end-of-round / end-of-game info.
 */
function gameBroadcast(room, options = {}) {
    const { includeRoles = false, includeWordPairList = false } = options;
    const players = room.gameData?.players ?? [];
    return {
        ...room,
        gameData: {
            players: players.map(includeRoles ? publicPlayer : maskedPlayer),
            ...(includeWordPairList
                ? { wordPairList: room.gameData?.wordPairList ?? [] }
                : {}),
        },
    };
}
//# sourceMappingURL=serializers.js.map