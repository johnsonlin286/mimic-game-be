"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRoomGarbageCollector = startRoomGarbageCollector;
const rooms_1 = __importDefault(require("./rooms"));
const THIRTY_MIN_MS = 30 * 60 * 1000;
/** Deletes in-memory rooms whose `updatedAt` is older than 30 minutes. Runs every 30 minutes. */
function startRoomGarbageCollector(io) {
    const sweep = async () => {
        const now = Date.now();
        for (const [roomId, room] of [...rooms_1.default.entries()]) {
            const updatedAtMs = room.updatedAt.getTime();
            if (now - updatedAtMs < THIRTY_MIN_MS)
                continue;
            await io.in(roomId).disconnectSockets(true);
            rooms_1.default.delete(roomId);
        }
    };
    void sweep();
    setInterval(() => void sweep(), THIRTY_MIN_MS);
}
//# sourceMappingURL=roomGarbageCollector.js.map