import { Server, Socket } from "socket.io";

import rooms from "../rooms";
import { calculateRoles, fisherYatesShuffle } from "../algorithmScript";
import { randomWordPair } from "../wordsBank";
import calculateVoteResults from "../voteScript";

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
        ...room,
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
    const player = room.roomPlayers.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("game-initialize-failed", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    if (player.role !== "host") {
      socket.emit("game-initialize-failed", {
        success: false,
        message: "Player is not the host",
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
      data: room,
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
      hasVoted: false,
      voters: [],
      isAlive: true,
    }));

    const newWordPair = randomWordPair(room.gameRule.language, room.gameRule.category, room.gameData?.wordPairList);

    const getGameWord = (gameRole: string) => {
      if (gameRole === "mimic") {
        return newWordPair.mimicWord;
      } else if (gameRole === "void") {
        return null;
      } else if (gameRole === "original") {
        return newWordPair.originalWord;
      }
      return null;
    }

    playersWithRoles.forEach(player => {
      player.gameWord = getGameWord(player.gameRole);
    });

    room.gameData = {
      wordPairList: [...room.gameData?.wordPairList || [], newWordPair],
      players: playersWithRoles,
    };
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-initialize-success", {
      success: true,
      message: "Game initialized successfully",
      data: {
        ...room,
        gameData: {
          wordPairList: undefined,
          players: room.gameData?.players.map(player => ({
            socketId: player.socketId,
            playerName: player.playerName,
            playerEmail: player.playerEmail,
            hasVoted: player.hasVoted,
            voters: player.voters || [],
            isAlive: player.isAlive,
          })) || [],
        },
      },
    });
    room.roomPlayers.forEach(player => {
      io.to(player.socketId).emit("listen-game-initialized-player", {
        success: true,
        message: "Game initialized successfully",
        data: {
          gameRole: room.gameData?.players.find(p => p.playerEmail === player.playerEmail)?.gameRole || null,
          gameWord: room.gameData?.players.find(p => p.playerEmail === player.playerEmail)?.gameWord || null,
        },
      });
    });
  }

  const gameStartVote = (payload: GameStartVotePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-start-vote-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    const player = room.roomPlayers.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("game-start-vote-failed", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    if (player.role !== "host") {
      socket.emit("game-start-vote-failed", {
        success: false,
        message: "Player is not the host",
      });
      return;
    }
    if (room.gameRule.status !== "playing") {
      socket.emit("game-start-vote-failed", {
        success: false,
        message: "Game is not in playing state",
      });
      return;
    }
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-start-vote", {
      success: true,
      message: "Game start vote requested",
      data: {
        ...room,
        gameData: {
          wordPairList: undefined,
          players: room.gameData?.players.map(player => ({
            socketId: player.socketId,
            playerName: player.playerName,
            playerEmail: player.playerEmail,
            hasVoted: player.hasVoted,
            voters: player.voters || [],
            isAlive: player.isAlive,
          })) || [],
        },
      }
    });
  }

  const gameVoteResponse = (payload: GameVoteResponsePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-vote-response-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    const player = room.gameData?.players.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("game-vote-response-failed", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    const allPlayers = room.gameData?.players || [];

    // If player already voted, we may need to no-op or move the vote.
    if (player.hasVoted) {
      const alreadyVotedForThisTarget = allPlayers
        .find(p => p.playerEmail === payload.votedEmail)
        ?.voters?.some(v => v.playerEmail === payload.playerEmail);

      // If they are voting for the same target again, do nothing.
      if (alreadyVotedForThisTarget) return;

      // Otherwise remove voter from any previous target(s).
      allPlayers.forEach(p => {
        if ((p.voters || []).some(v => v.playerEmail === payload.playerEmail)) {
          p.voters = (p.voters || []).filter(v => v.playerEmail !== payload.playerEmail);
        }
      });
    }

    // If votedEmail is provided, add the vote to that target.
    if (payload.votedEmail) {
      const votedPlayer = allPlayers.find(p => p.playerEmail === payload.votedEmail);
      if (!votedPlayer) {
        socket.emit("game-vote-response-failed", {
          success: false,
          message: "Voted player not found",
        });
        return;
      }

      // Idempotency guard: don't add duplicates.
      const alreadyInVoters = (votedPlayer.voters || []).some(v => v.playerEmail === payload.playerEmail);
      if (!alreadyInVoters) {
        votedPlayer.voters = votedPlayer.voters || [];
        votedPlayer.voters.push({
          socketId: player.socketId,
          playerName: player.playerName,
          playerEmail: player.playerEmail,
        });
      }

      // mark as voted when we have a valid target
      player.hasVoted = true;
    }

    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-vote-response", {
      success: true,
      message: "Game vote response received",
      data: {
        ...room,
        gameData: {
          wordPairList: undefined,
          players: room.gameData?.players.map(player => ({
            socketId: player.socketId,
            playerName: player.playerName,
            playerEmail: player.playerEmail,
            hasVoted: player.hasVoted,
            voters: player.voters || [],
            isAlive: player.isAlive,
          })) || [],
        }
      }
    });
    // check if all players have voted
    if (room.gameData?.players.every(player => player.hasVoted)) {
      room.updatedAt = new Date();
      io.to(payload.roomId).emit("listen-game-all-players-voted", {
        success: true,
        message: "All players have voted",
      });
    }
  }

  const gameCalculateVote = (payload: GameCalculateVotePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("game-calculate-results-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    if (room.gameRule.status !== "playing") {
      socket.emit("game-calculate-results-failed", {
        success: false,
        message: "Game is not in playing state",
      });
      return;
    }
    const player = room.roomPlayers.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("game-calculate-results-failed", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    if (player.role !== "host") {
      socket.emit("game-calculate-results-failed", {
        success: false,
        message: "Player is not the host",
      });
      return;
    }
    // calculate results
    const results = calculateVoteResults(room.gameData?.players || []);
    room.updatedAt = new Date();
    if (results.success) {
      // update room game data
      room.gameData = {
        wordPairList: room.gameData?.wordPairList || [],
        players: results.data.players,
      };
      const { message } = results;
      switch (message) {
        case "Mimic is the winner":
          io.to(payload.roomId).emit("listen-game-calculate-results", {
            success: true,
            message: "Mimic is the winner",
            data: {
              ...room,
              gameData: {
                wordPairList: undefined,
                players: room.gameData?.players.map(player => ({
                  socketId: player.socketId,
                  playerName: player.playerName,
                  playerEmail: player.playerEmail,
                  hasVoted: player.hasVoted,
                  voters: player.voters || [],
                  isAlive: player.isAlive,
                })) || [],
              },
            }
          });
          break;
        case "Void guess the word":
          const voidPlayer = room.gameData?.players.find(player => player.gameRole === "void" && player.isAlive);
          if (!voidPlayer) {
            io.to(payload.roomId).emit("game-calculate-results-failed", {
              success: false,
              message: "Void player not found",
            });
            return;
          }
          // emit the void player's game word
          io.to(voidPlayer.socketId).emit("listen-game-void-guess-the-word", {
            success: true,
            message: "Void guessed the word",
          });
          io.to(payload.roomId).emit("listen-game-void-got-caught", {
            success: true,
            message: "Void got caught!",
            data: {
              ...room,
              gameData: {
                wordPairList: undefined,
                players: room.gameData?.players.map(player => ({
                  socketId: player.socketId,
                  playerName: player.playerName,
                  playerEmail: player.playerEmail,
                  hasVoted: player.hasVoted,
                  voters: player.voters || [],
                  isAlive: player.isAlive,
                })) || [],
              },
            }
          });
          break;
        case "Void is the winner":
          io.to(payload.roomId).emit("listen-game-calculate-results", {
            success: true,
            message: "Void is the winner",
            data: {
              ...room,
            }
          });
          break;
        case "Original is the winner":
          io.to(payload.roomId).emit("listen-game-calculate-results", {
            success: true,
            message: "Original is the winner",
            data: {
              ...room,
              gameData: {
                wordPairList: undefined,
                players: room.gameData?.players.map(player => ({
                  socketId: player.socketId,
                  playerName: player.playerName,
                  playerEmail: player.playerEmail,
                  hasVoted: player.hasVoted,
                  voters: player.voters || [],
                  isAlive: player.isAlive,
                })) || [],
              },
            }
          });
          break;
        default:
          io.to(payload.roomId).emit("listen-game-calculate-results", {
            success: true,
            message: "Game continue",
            data: {
              ...room,
              gameData: {
                wordPairList: undefined,
                players: room.gameData?.players.map(player => ({
                  socketId: player.socketId,
                  playerName: player.playerName,
                  playerEmail: player.playerEmail,
                  hasVoted: player.hasVoted,
                  voters: player.voters || [],
                  isAlive: player.isAlive,
                })) || [],
              },
            }
          });
          break;
      }
    } else {
      socket.emit("game-calculate-results-failed", {
        success: false,
        message: results.message,
      });
    }
  }

  socket.on("game:update-rule", gameRuleUpdate)
  socket.on("game:start", gameStart)
  socket.on("game:initialize", gameInitialize)
  socket.on("game:start-vote", gameStartVote)
  socket.on("game:vote-response", gameVoteResponse)
  socket.on("game:calculate-results", gameCalculateVote)
}