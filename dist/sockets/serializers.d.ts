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
    hasUsedSuperpower: boolean;
    voters: PlayerSummary[];
    isAlive: boolean;
};
/**
 * Broadcast view of a room used by `rooms.ts` events. Omits `creatorEmail`
 * (PII) but exposes `creatorName` so the lobby UI can label the host.
 */
export declare function roomBroadcast(room: RoomData): {
    creatorName: string;
    roomId: string;
    roomMaxPlayers: number;
    roomPlayers: RoomPlayerData[];
    gameRule: GameRule;
    gameData: GameData | undefined;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
};
interface GameBroadcastOptions {
    /** Reveal each player's `gameRole` and `gameWord`. Default: false. */
    includeRoles?: boolean;
    /** Include the historical `wordPairList`. Use when the round/game ends. */
    includeWordPairList?: boolean;
}
/**
 * Broadcast view of a room used by `game.ts` events while a round is active.
 * Strips `wordPairList` and any per-player role/word data by default; opt-in
 * via `options` when revealing end-of-round / end-of-game info.
 */
export declare function gameBroadcast(room: RoomData, options?: GameBroadcastOptions): {
    gameData: {
        wordPairList?: WordPair[];
        players: {
            socketId: string;
            playerName: string;
            playerEmail: string;
            hasVoted: boolean;
            hasUsedSuperpower: boolean;
            voters: PlayerSummary[];
            isAlive: boolean;
        }[];
    };
    creatorEmail: string;
    creatorName: string;
    roomId: string;
    roomMaxPlayers: number;
    roomPlayers: RoomPlayerData[];
    gameRule: GameRule;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export {};
//# sourceMappingURL=serializers.d.ts.map