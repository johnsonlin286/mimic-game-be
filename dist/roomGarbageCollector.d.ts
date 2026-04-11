import type { Server } from "socket.io";
/** Deletes in-memory rooms whose `updatedAt` is older than 30 minutes. Runs every 30 minutes. */
export declare function startRoomGarbageCollector(io: Server): void;
//# sourceMappingURL=roomGarbageCollector.d.ts.map