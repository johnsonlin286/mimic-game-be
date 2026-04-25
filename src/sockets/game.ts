import { Server, Socket } from "socket.io";

import rooms from "../rooms";
import { calculateRoles, fisherYatesShuffle } from "../algorithmScript";
import { randomWordPair } from "../wordsBank";
import calculateVoteResults from "../voteScript";
import { gameBroadcast } from "./serializers";
import {
  findGamePlayer,
  findRoom,
  findRoomPlayer,
  requireGameStatus,
  requireHost,
} from "./guards";

/** Returns the word a player should see for the chosen role. */
function wordForRole(role: GameRole, pair: WordPair): string | null {
  if (role === "mimic") return pair.mimicWord;
  if (role === "original") return pair.originalWord;
  return null;
}

/**
 * Resets per-round vote state on every player. Used between rounds so we
 * don't carry voters/hasVoted into the next vote.
 */
function clearVotes(players: PlayerWithRole[]): void {
  for (const p of players) {
    p.voters = [];
    p.hasVoted = false;
  }
}

/**
 * Removes any vote that was previously cast by `voterEmail`. We do a single
 * pass over players and only allocate a new voters array for the affected
 * target(s).
 */
function removeExistingVote(players: PlayerWithRole[], voterEmail: string): void {
  for (const p of players) {
    if (p.voters.some(v => v.playerEmail === voterEmail)) {
      p.voters = p.voters.filter(v => v.playerEmail !== voterEmail);
    }
  }
}

export default function registerGameHandlers(io: Server, socket: Socket) {
  const gameRuleUpdate = (payload: GameRuleUpdatePayload) => {
    const room = findRoom(socket, payload.roomId, "game-rule-update-failed");
    if (!room) return;

    room.gameRule = payload.gameRule;
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-rule-update-success", {
      success: true,
      message: "Game rule updated successfully",
      data: { ...room },
    });
  };

  const gameStart = (payload: GameStartPayload) => {
    const room = findRoom(socket, payload.roomId, "game-start-failed");
    if (!room) return;

    const player = findRoomPlayer(socket, room, payload.playerEmail, "game-start-failed");
    if (!player) return;
    if (!requireHost(socket, player, "game-start-failed")) return;

    if (room.roomPlayers.length < 3) {
      socket.emit("game-start-failed", {
        success: false,
        message: "Room players are less than 3",
      });
      return;
    }
    if (!requireGameStatus(socket, room, "ready", "game-start-failed")) return;

    room.gameRule.status = "playing";
    room.updatedAt = new Date();
    socket.emit("initialize-game", { success: true });
    io.to(payload.roomId).emit("listen-game-start-success", {
      success: true,
      message: "Game started successfully",
      data: room,
    });
  };

  const gameInitialize = (payload: GameInitializePayload) => {
    const room = findRoom(socket, payload.roomId, "game-initialize-failed");
    if (!room) return;
    if (!requireGameStatus(socket, room, "playing", "game-initialize-failed")) return;

    if (payload.playerEmail) {
      const player = findRoomPlayer(socket, room, payload.playerEmail, "game-initialize-failed");
      if (!player) return;
      if (!requireHost(socket, player, "game-initialize-failed")) return;
    }

    const { numMimics, numVoids, numOriginals } = calculateRoles(
      room.roomPlayers.length,
      room.gameRule.roles.void,
    );
    const roleDeck: GameRole[] = [
      ...Array<GameRole>(numMimics).fill("mimic"),
      ...Array<GameRole>(numVoids).fill("void"),
      ...Array<GameRole>(numOriginals).fill("original"),
    ];
    const shuffledRoleDeck = fisherYatesShuffle(roleDeck);

    const previousPairs = room.gameData?.wordPairList ?? [];
    const newWordPair = randomWordPair(
      room.gameRule.language,
      room.gameRule.category,
      previousPairs,
    );

    const playersWithRoles: PlayerWithRole[] = room.roomPlayers.map((p, i) => {
      const role = shuffledRoleDeck[i] ?? "original";
      return {
        socketId: p.socketId,
        playerName: p.playerName,
        playerEmail: p.playerEmail,
        gameRole: role,
        gameWord: wordForRole(role, newWordPair),
        hasVoted: false,
        voters: [],
        isAlive: true,
      };
    });

    // When the category is exhausted we restart with just the latest pair
    // instead of accumulating duplicates indefinitely.
    room.gameData = {
      players: playersWithRoles,
      wordPairList: newWordPair.hasNoMoreWords
        ? [newWordPair]
        : [newWordPair, ...previousPairs],
    };
    room.updatedAt = new Date();

    io.to(payload.roomId).emit("listen-game-initialize-success", {
      success: true,
      message: "Game initialized successfully",
      data: gameBroadcast(room),
    });

    // Build an email->player map so we don't .find() twice per recipient
    // (was O(n^2) before; now O(n)).
    const playerByEmail = new Map(playersWithRoles.map(p => [p.playerEmail, p]));
    for (const roomPlayer of room.roomPlayers) {
      const gamePlayer = playerByEmail.get(roomPlayer.playerEmail);
      io.to(roomPlayer.socketId).emit("listen-game-initialized-player", {
        success: true,
        message: "Game initialized successfully",
        data: {
          gameRole: gamePlayer?.gameRole ?? null,
          gameWord: gamePlayer?.gameWord ?? null,
        },
      });
    }
  };

  const gameStartVote = (payload: GameStartVotePayload) => {
    const room = findRoom(socket, payload.roomId, "game-start-vote-failed");
    if (!room) return;

    const player = findRoomPlayer(socket, room, payload.playerEmail, "game-start-vote-failed");
    if (!player) return;
    if (!requireHost(socket, player, "game-start-vote-failed")) return;
    if (!requireGameStatus(socket, room, "playing", "game-start-vote-failed")) return;

    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-start-vote", {
      success: true,
      message: "Game start vote requested",
      data: gameBroadcast(room),
    });
  };

  const gameVoteResponse = (payload: GameVoteResponsePayload) => {
    const room = findRoom(socket, payload.roomId, "game-vote-response-failed");
    if (!room) return;

    const player = findGamePlayer(socket, room, payload.playerEmail, "game-vote-response-failed");
    if (!player) return;

    if (!player.isAlive) {
      socket.emit("game-vote-response-failed", {
        success: false,
        message: "Player is not alive",
      });
      return;
    }

    const allPlayers = room.gameData?.players ?? [];

    if (player.hasVoted) {
      const alreadyVotedSameTarget = allPlayers
        .find(p => p.playerEmail === payload.votedEmail)
        ?.voters.some(v => v.playerEmail === payload.playerEmail);

      if (alreadyVotedSameTarget) return;
      removeExistingVote(allPlayers, payload.playerEmail);
    }

    if (payload.votedEmail) {
      const votedPlayer = allPlayers.find(p => p.playerEmail === payload.votedEmail);
      if (!votedPlayer) {
        socket.emit("game-vote-response-failed", {
          success: false,
          message: "Voted player not found",
        });
        return;
      }

      const alreadyInVoters = votedPlayer.voters.some(
        v => v.playerEmail === payload.playerEmail,
      );
      if (!alreadyInVoters) {
        votedPlayer.voters.push({
          socketId: player.socketId,
          playerName: player.playerName,
          playerEmail: player.playerEmail,
        });
      }
      player.hasVoted = true;
    }

    room.updatedAt = new Date();
    io.to(payload.roomId).emit("listen-game-vote-response", {
      success: true,
      message: "Game vote response received",
      data: gameBroadcast(room),
    });

    if (allPlayers.length > 0 && allPlayers.every(p => !p.isAlive || p.hasVoted)) {
      io.to(payload.roomId).emit("listen-game-all-players-voted", {
        success: true,
        message: "All players have voted",
      });
    }
  };

  const gameCalculateVote = (payload: GameCalculateVotePayload) => {
    const room = findRoom(socket, payload.roomId, "game-calculate-results-failed");
    if (!room) return;
    if (!requireGameStatus(socket, room, "playing", "game-calculate-results-failed")) return;

    const player = findRoomPlayer(socket, room, payload.playerEmail, "game-calculate-results-failed");
    if (!player) return;
    if (!requireHost(socket, player, "game-calculate-results-failed")) return;

    const results = calculateVoteResults(room.gameData?.players ?? []);
    room.updatedAt = new Date();

    if (!results.success) {
      socket.emit("game-calculate-results-failed", {
        success: false,
        message: results.message,
      });
      return;
    }

    room.gameData = {
      wordPairList: room.gameData?.wordPairList ?? [],
      players: results.data.players,
    };

    // Announce the round outcome. The "Void guess the word" branch also
    // notifies the void privately so they can submit a guess.
    if (results.message === "Void guess the word") {
      const voidPlayer = room.gameData.players.find(p => p.gameRole === "void");
      if (!voidPlayer) {
        io.to(payload.roomId).emit("game-calculate-results-failed", {
          success: false,
          message: "Void player not found",
        });
        return;
      }
      io.to(voidPlayer.socketId).emit("listen-game-void-got-caught", {
        success: true,
        message: "Void guessed the word",
      });
    }

    const message =
      results.message === "Void guess the word" ? "Void got caught!" :
      results.message === "Game continue" ? "Game continue" :
      results.message;

    // When someone has won we expose the full word history so the client can
    // show what every round's pair was. Mid-game broadcasts stay sanitized.
    const isWinner = message.endsWith("is the winner");

    io.to(payload.roomId).emit("listen-game-calculate-results", {
      success: true,
      message,
      data: gameBroadcast(room, { includeWordPairList: isWinner }),
    });
  };

  const gameVoidGuessTheWord = (payload: GameVoidGuessTheWordPayload) => {
    const room = findRoom(socket, payload.roomId, "game-void-guess-the-word-failed");
    if (!room) return;

    const player = findGamePlayer(socket, room, payload.playerEmail, "game-void-guess-the-word-failed");
    if (!player) return;

    if (player.gameRole !== "void") {
      socket.emit("game-void-guess-the-word-failed", {
        success: false,
        message: "Player is not the void",
      });
      return;
    }

    const targetWord = room.gameData?.wordPairList[0]?.originalWord ?? "";
    if (targetWord.toLowerCase() === payload.guessWord.toLowerCase()) {
      io.to(payload.roomId).emit("listen-game-void-guess-the-word-correctly", {
        success: true,
        message: "Void guessed the word correctly",
      });
      return;
    }

    // Void guessed wrong: mark them dead and recompute the round outcome.
    const updatedPlayers = (room.gameData?.players ?? []).map(p =>
      p.playerEmail === payload.playerEmail ? { ...p, isAlive: false } : p,
    );
    room.gameData = {
      wordPairList: room.gameData?.wordPairList ?? [],
      players: updatedPlayers,
    };
    room.updatedAt = new Date();

    let originalCount = 0;
    let mimicCount = 0;
    let voidCount = 0;
    for (const p of updatedPlayers) {
      if (!p.isAlive) continue;
      if (p.gameRole === "original") originalCount++;
      else if (p.gameRole === "mimic") mimicCount++;
      else if (p.gameRole === "void") voidCount++;
    }

    let outcomeMessage = "Game continue";
    if (mimicCount === 0 && voidCount === 0) {
      outcomeMessage = "Original is the winner";
    } else if (originalCount === 0) {
      outcomeMessage = voidCount > 0 ? "Void is the winner" : "Mimic is the winner";
    } else if (originalCount <= mimicCount + voidCount) {
      outcomeMessage = mimicCount > 0 ? "Mimic is the winner" : "Void is the winner";
    }

    io.to(payload.roomId).emit("listen-game-void-guess-the-word-incorrectly", {
      success: true,
      message: "Void guessed the word incorrectly",
      data: {
        outcomeMessage,
        room: gameBroadcast(room),
      },
    });
  };

  const gameContinue = (payload: GameContinuePayload) => {
    const room = findRoom(socket, payload.roomId, "game-continue-failed");
    if (!room) return;

    const player = findRoomPlayer(socket, room, payload.playerEmail, "game-continue-failed");
    if (!player) return;
    if (!requireHost(socket, player, "game-continue-failed")) return;
    if (!requireGameStatus(socket, room, "playing", "game-continue-failed")) return;

    if (room.gameData) clearVotes(room.gameData.players);
    room.updatedAt = new Date();

    io.to(payload.roomId).emit("listen-game-continue-success", {
      success: true,
      message: "Game continued successfully",
      data: {
        ...room,
        gameData: {
          players: (room.gameData?.players ?? []).map(p => ({
            ...p,
            gameRole: null,
            gameWord: null,
          })),
        },
      },
    });
  };

  const gameRestart = (payload: GameRestartPayload) => {
    const room = findRoom(socket, payload.roomId, "game-restart-failed");
    if (!room) return;

    room.gameRule.status = "ready";
    room.gameData = { wordPairList: [], players: [] };
    room.updatedAt = new Date();

    io.to(payload.roomId).emit("listen-game-restart-success", {
      success: true,
      message: "Game restarted successfully",
      data: {
        ...room,
        gameData: { players: [] },
      },
    });
  };

  socket.on("game:update-rule", gameRuleUpdate);
  socket.on("game:start", gameStart);
  socket.on("game:initialize", gameInitialize);
  socket.on("game:start-vote", gameStartVote);
  socket.on("game:vote-response", gameVoteResponse);
  socket.on("game:calculate-results", gameCalculateVote);
  socket.on("game:void-guess-the-word", gameVoidGuessTheWord);
  socket.on("game:continue", gameContinue);
  socket.on("game:restart", gameRestart);
}
