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
export declare function publicPlayer(player: PlayerWithRole): PlayerWithRole;
/** Public player view that hides role/word — used during active rounds. */
export declare function maskedPlayer(player: PlayerWithRole): {
    socketId: string;
    playerName: string;
    playerEmail: string;
    hasVoted: boolean;
    voters: PlayerSummary[];
    isAlive: boolean;
};
/**
 * Broadcast view of a room used by `rooms.ts` events. Omits `creatorEmail`
 * and the entire `gameData` (rooms-channel events are pre-game / lobby state).
 */
export declare function roomBroadcast(room: RoomData): {
    roomId: string;
    roomMaxPlayers: number;
    roomPlayers: RoomPlayerData[];
    gameRule: GameRule;
    gameData: GameData | undefined;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
};
/**
 * Broadcast view of a room used by `game.ts` events while a round is active.
 * Strips `wordPairList` and any per-player role/word data.
 */
export declare function gameBroadcast(room: RoomData, includeRoles?: boolean): {
    gameData: {
        players: {
            socketId: string;
            playerName: string;
            playerEmail: string;
            hasVoted: boolean;
            voters: PlayerSummary[];
            isAlive: boolean;
        }[];
    };
    creatorEmail: string;
    roomId: string;
    roomMaxPlayers: number;
    roomPlayers: RoomPlayerData[];
    gameRule: GameRule;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
};
//# sourceMappingURL=serializers.d.ts.map