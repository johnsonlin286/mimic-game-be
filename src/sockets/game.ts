import { Server, Socket } from "socket.io";

import rooms from "../rooms";
import { calculateRoles, fisherYatesShuffle } from "../algorithmScript";
import { randomWordPair } from "../wordsBank";

export default function registerGameHandlers(io: Server, socket: Socket) {
  const gameRuleUpdate = (payload: GameRuleUpdatePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-rule-update-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    room.gameRule = payload.gameRule;
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-rule-update-success", {
      success: true,
      message: "Game rule updated successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }
  
  const gameStart = (payload: GameStartPayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-start-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    // if (room.roomPlayers.length < 3) {
    //   socket.emit("game-start-failed", {
    //     success: false,
    //     message: "Room players are less than 3",
    //   });
    //   return;
    // }
    // if (room.gameRule.status !== "ready") {
    //   socket.emit("game-start-failed", {
    //     success: false,
    //     message: "Game is not in ready state",
    //   });
    //   return;
    // }
    room.gameRule.status = "playing";
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-start-success", {
      success: true,
      message: "Game started successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }

  const gameInitialize = (payload: GameInitializePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-initialize-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    if (room.gameRule.status !== "playing") {
      socket.emit("game-initialize-failed", {
        success: false,
        message: "Game is not in playing state",
      });
      return;
    }
    const { numMimics, numVoids, numOriginals } = calculateRoles(room.roomPlayers.length, room.gameRule.roles.void);
    const roleDeck = [];
    for (let i = 0; i < numMimics; i++) roleDeck.push("mimic");
    for (let i = 0; i < numVoids; i++) roleDeck.push("void");
    for (let i = 0; i < numOriginals; i++) roleDeck.push("original");

    const shuffledRoleDeck = fisherYatesShuffle(roleDeck);
    const playersWithRoles: PlayerWithRole[] = room.roomPlayers.map((player, index) => ({
      socketId: player.socketId,
      playerName: player.playerName,
      playerEmail: player.playerEmail,
      gameRole: shuffledRoleDeck[index],
    }));

    const wordPair = randomWordPair(room.gameRule.language, room.gameRule.category);

    const getGameWord = (gameRole: string) => {
      if (gameRole === "mimic") {
        return wordPair.mimicWord;
      } else if (gameRole === "void") {
        return null;
      } else if (gameRole === "original") {
        return wordPair.originalWord;
      }
      return null;
    }

    playersWithRoles.forEach(player => {
      player.gameWord = getGameWord(player.gameRole);
    });

    room.gameData = {
      wordPair: wordPair,
      players: playersWithRoles,
    };
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-initialize-success", {
      success: true,
      message: "Game initialized successfully",
      data: {
        updatedAt: room.updatedAt,
      },
    });
    room.roomPlayers.forEach(player => {
      io.to(player.socketId).emit("listen-game-initialized-player", {
        success: true,
        message: "Game initialized successfully",
        data: {
          gameRole: room.gameData?.players.find(p => p.socketId === player.socketId)?.gameRole || null,
          gameWord: room.gameData?.players.find(p => p.socketId === player.socketId)?.gameWord || null,
        },
      });
    });
  }

  socket.on("game:update-rule", gameRuleUpdate)
  socket.on("game:start", gameStart)
  socket.on("game:initialize", gameInitialize)
}