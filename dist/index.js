"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const rooms_1 = __importDefault(require("./routes/rooms"));
const rooms_2 = __importDefault(require("./sockets/rooms"));
const utils_1 = __importDefault(require("./sockets/utils"));
const game_1 = __importDefault(require("./sockets/game"));
const roomGarbageCollector_1 = require("./roomGarbageCollector");
dotenv_1.default.config({
    quiet: true,
});
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api/rooms", rooms_1.default);
const onConnection = (socket) => {
    console.log("A user connected");
    (0, rooms_2.default)(io, socket);
    (0, utils_1.default)(io, socket);
    (0, game_1.default)(io, socket);
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
};
io.on("connection", onConnection);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    (0, roomGarbageCollector_1.startRoomGarbageCollector)(io);
});
//# sourceMappingURL=index.js.map