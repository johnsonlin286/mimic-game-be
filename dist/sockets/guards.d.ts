import type { Socket } from "socket.io";
/**
 * Lookup helpers used by every game-channel handler. Each one emits the
 * provided `failureEvent` and returns `null` on failure so the caller can
 * just `if (!x) return;`. This collapses ~5 lines of boilerplate per check
 * into a single line and keeps error wording consistent.
 */
export declare function findRoom(socket: Socket, roomId: string, failureEvent: string): RoomData | null;
export declare function findRoomPlayer(socket: Socket, room: RoomData, playerEmail: string, failureEvent: string): RoomPlayerData | null;
export declare function findGamePlayer(socket: Socket, room: RoomData, playerEmail: string, failureEvent: string): PlayerWithRole | null;
export declare function requireHost(socket: Socket, player: RoomPlayerData, failureEvent: string): boolean;
export declare function requireGameStatus(socket: Socket, room: RoomData, status: GameStatus, failureEvent: string): boolean;
//# sourceMappingURL=guards.d.ts.map