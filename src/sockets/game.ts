import { Server, Socket } from "socket.io";

import { assignRolesWithRotation, calculateRoles, calculateSuperpowers } from "../algorithmScript";
import { randomWordPair } from "../wordsBank";
import { assignSuperpowersForRound } from "../superpowers";
import calculateVoteResults from "../voteScript";
import { gameBroadcast } from "./serializers";
import {
  findGamePlayer,
  findRoom,
  findRoomPlayer,
  requireGameStatus,
  requireHost,
} from "./guards";
import { AGENT } from "../superpowers";

/** Returns the word a player should see for the chosen role. */
function wordForRole(role: GameRole, pair: WordPair): string | null {
  if (role === "minority") return pair.minorityWord;
  if (role === "majority") return pair.majorityWord;
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

    const { numMinorities, numBlinds } = calculateRoles(
      room.roomPlayers.length,
      room.gameRule.roles.blind,
    );

    const previousPairs = room.gameData?.wordPairList ?? [];
    const previousRoleHistory = room.gameData?.roleHistory ?? [];

    const newWordPair = randomWordPair(
      room.gameRule.language,
      room.gameRule.category,
      previousPairs,
    );

    const { roleMap, updatedHistory } = assignRolesWithRotation(
      room.roomPlayers,
      numMinorities,
      numBlinds,
      previousRoleHistory,
    );

    const playersWithRoles: PlayerWithRole[] = room.roomPlayers.map(p => {
      const role = roleMap.get(p.playerEmail) ?? "majority";
      return {
        socketId: p.socketId,
        playerName: p.playerName,
        playerEmail: p.playerEmail,
        gameRole: role,
        gameWord: wordForRole(role, newWordPair),
        superpower: null,
        hasUsedSuperpower: undefined,
        hasVoted: false,
        voters: [],
        isAlive: true,
      };
    });

    const { numActivePowers, numPassivePowers } = calculateSuperpowers(
      room.roomPlayers.length,
      room.gameRule.superpowers,
    );
    assignSuperpowersForRound(playersWithRoles, numActivePowers, numPassivePowers);

    // When the word category is exhausted we restart from the full pool.
    // roleHistory resets independently (via updatedHistory) when all players
    // have cycled through a special role.
    room.gameData = {
      players: playersWithRoles,
      wordPairList: newWordPair.hasNoMoreWords
        ? [newWordPair]
        : [newWordPair, ...previousPairs],
      roleHistory: updatedHistory,
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
          superpower: gamePlayer?.superpower ?? null,
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
      roleHistory: room.gameData?.roleHistory ?? [],
      players: results.data.players,
    };

    // Announce the round outcome. The "Void guess the word" branch also
    // notifies the void privately so they can submit a guess.
    if (results.message === "Blind guess the word") {
      const blindPlayer = room.gameData.players.find(p => p.gameRole === "blind");
      if (!blindPlayer) {
        io.to(payload.roomId).emit("game-calculate-results-failed", {
          success: false,
          message: "Blind player not found",
        });
        return;
      }
      io.to(blindPlayer.socketId).emit("listen-game-blind-got-caught", {
        success: true,
        message: "Blind guessed the word",
      });
    }

    const message =
      results.message === "Blind guess the word" ? "Blind got caught!" :
      results.message === "Game continue" ? "Game continue" :
      results.message;

    // Notify clients about any passive superpower effects that fired this round
    // so the UI can show an announcement before revealing the elimination result.
    if (results.triggeredEffects.length > 0) {
      io.to(payload.roomId).emit("listen-game-superpower-triggered", {
        success: true,
        message: "Passive superpower triggered",
        data: { triggeredEffects: results.triggeredEffects },
      });
    }

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
    const room = findRoom(socket, payload.roomId, "game-blind-guess-the-word-failed");
    if (!room) return;

    const player = findGamePlayer(socket, room, payload.playerEmail, "game-blind-guess-the-word-failed");
    if (!player) return;

    if (player.gameRole !== "blind") {
      socket.emit("game-blind-guess-the-word-failed", {
        success: false,
        message: "Player is not the blind",
      });
      return;
    }

    const targetWord = room.gameData?.wordPairList[0]?.majorityWord ?? "";
    if (targetWord.toLowerCase() === payload.guessWord.toLowerCase()) {
      io.to(payload.roomId).emit("listen-game-blind-guess-the-word-correctly", {
        success: true,
        message: "Blind guessed the word correctly",
      });
      return;
    }

    // Void guessed wrong: mark them dead and recompute the round outcome.
    const updatedPlayers = (room.gameData?.players ?? []).map(p =>
      p.playerEmail === payload.playerEmail ? { ...p, isAlive: false } : p,
    );
    room.gameData = {
      wordPairList: room.gameData?.wordPairList ?? [],
      roleHistory: room.gameData?.roleHistory ?? [],
      players: updatedPlayers,
    };
    room.updatedAt = new Date();

    let majorityCount = 0;
    let minorityCount = 0;
    let blindCount = 0;
    for (const p of updatedPlayers) {
      if (!p.isAlive) continue;
      if (p.gameRole === "majority") majorityCount++;
      else if (p.gameRole === "minority") minorityCount++;
      else if (p.gameRole === "blind") blindCount++;
    }

    let outcomeMessage = "Game continue";
    if (minorityCount === 0 && blindCount === 0) {
      outcomeMessage = "Majority is the winner";
    } else if (majorityCount === 0) {
      outcomeMessage = blindCount > 0 ? "Blind is the winner" : "Minority is the winner";
    } else if (majorityCount <= minorityCount + blindCount) {
      outcomeMessage = minorityCount > 0 ? "Minority is the winner" : "Blind is the winner";
    }

    io.to(payload.roomId).emit("listen-game-blind-guess-the-word-incorrectly", {
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
            superpower: AGENT,
          })),
        },
      },
    });
  };

  const gameRestart = (payload: GameRestartPayload) => {
    const room = findRoom(socket, payload.roomId, "game-restart-failed");
    if (!room) return;

    room.gameRule.status = "ready";
    room.gameData = { wordPairList: [], roleHistory: [], players: [] };
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
