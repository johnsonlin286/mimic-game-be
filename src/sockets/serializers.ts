/**
 * Shared serializers for socket payloads.
 *
 * Two goals:
 *  - Strip server-only fields (`gameRole`, `gameWord`, `wordPairList`) before
 *    broadcasting, so we never accidentally leak roles or upcoming word pairs.
 *  - Keep the wire format identical across handlers so clients can rely on a
 *    single shape.
 */

/** Fields safe to expose to every player in the room. */
export function publicPlayer(player: PlayerWithRole): PlayerWithRole {
  return {
    socketId: player.socketId,
    playerName: player.playerName,
    playerEmail: player.playerEmail,
    gameRole: player.gameRole,
    gameWord: player.gameWord,
    hasVoted: player.hasVoted,
    voters: player.voters,
    isAlive: player.isAlive,
  };
}

/** Public player view that hides role/word — used during active rounds. */
export function maskedPlayer(player: PlayerWithRole) {
  return {
    socketId: player.socketId,
    playerName: player.playerName,
    playerEmail: player.playerEmail,
    hasVoted: player.hasVoted,
    voters: player.voters,
    isAlive: player.isAlive,
  };
}

/**
 * Broadcast view of a room used by `rooms.ts` events. Omits `creatorEmail`
 * and the entire `gameData` (rooms-channel events are pre-game / lobby state).
 */
export function roomBroadcast(room: RoomData) {
  return {
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
 * Strips `wordPairList` and any per-player role/word data.
 */
export function gameBroadcast(room: RoomData, includeRoles = false) {
  const players = room.gameData?.players ?? [];
  return {
    ...room,
    gameData: {
      wordPairList: room.gameData?.wordPairList ?? [],
      players: players.map(includeRoles ? publicPlayer : maskedPlayer),
    },
  };
}
