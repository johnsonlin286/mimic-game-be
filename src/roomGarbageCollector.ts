import type { Server } from "socket.io";

import rooms from "./rooms";

const THIRTY_MIN_MS = 30 * 60 * 1000;

/** Deletes in-memory rooms whose `updatedAt` is older than 30 minutes. Runs every 30 minutes. */
export function startRoomGarbageCollector(io: Server): void {
  const sweep = async () => {
    const now = Date.now();
    for (const [roomId, room] of [...rooms.entries()]) {
      const updatedAtMs = room.updatedAt.getTime();
      if (now - updatedAtMs < THIRTY_MIN_MS) continue;
      await io.in(roomId).disconnectSockets(true);
      rooms.delete(roomId);
    }
  };

  void sweep();
  setInterval(() => void sweep(), THIRTY_MIN_MS);
}
