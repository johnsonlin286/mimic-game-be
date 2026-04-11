"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rooms_1 = __importDefault(require("../rooms"));
const router = (0, express_1.Router)();
router.get("/all", (req, res) => {
    const roomData = Array.from(rooms_1.default.values()).map(room => ({
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
exports.default = router;
//# sourceMappingURL=rooms.js.map