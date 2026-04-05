import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);
app.get("/", (req, res) => {
    res.send("Hello World");
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map