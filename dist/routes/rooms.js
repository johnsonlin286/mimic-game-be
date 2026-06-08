"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serializers_1 = require("../sockets/serializers");
const rooms_1 = __importDefault(require("../rooms"));
const router = (0, express_1.Router)();
router.get("/all", (req, res) => {
    const roomData = Array.from(rooms_1.default.values()).map(room => ({
        ...(0, serializers_1.roomBroadcast)(room),
    }));
    res.json({ success: true, data: roomData });
});
router.get("/:roomId", (req, res) => {
    const { roomId } = req.params;
    const room = rooms_1.default.get(roomId);
    if (!room) {
        return res.status(404).json({ success: false, message: "Room not found" });
    }
    return res.status(200).json({ success: true, message: "Room found", data: (0, serializers_1.roomBroadcast)(room) });
});
router.post("/search", (req, res) => {
    const { roomId } = req.body;
    const room = rooms_1.default.get(roomId);
    if (!room) {
        return res.status(404).json({ success: false, message: "Room not found" });
    }
    return res.status(200).json({ success: true, message: "Room found" });
});
exports.default = router;
//# sourceMappingURL=rooms.js.map