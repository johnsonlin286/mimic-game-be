import { Router } from "express";
import { roomBroadcast } from "../sockets/serializers";

import rooms from "../rooms";

const router = Router();

router.get("/all", (req, res) => {
  const roomData = Array.from(rooms.values()).map(room => ({
    ...roomBroadcast(room),
  }));
  res.json({ success: true, data: roomData });
});

router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  return res.status(200).json({ success: true, message: "Room found", data: roomBroadcast(room) });
});

router.post("/search", (req, res) => {
  const { roomId } = req.body;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  return res.status(200).json({ success: true, message: "Room found" });
});

export default router;