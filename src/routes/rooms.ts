import { Router } from "express";
import rooms from "../rooms";

const router = Router();

router.get("/all", (req, res) => {
  const roomData = Array.from(rooms.values()).map(room => ({
    creatorEmail: room.creatorEmail,
    roomDisplayName: room.roomDisplayName,
    roomId: room.roomId,
    roomMaxPlayers: room.roomMaxPlayers,
    roomPlayers: room.roomPlayers,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  }));
  res.json({ success: true, data: roomData });
});

export default router;