export {};

declare global {
  type RoomRole = "host" | "player";
  type GameRole = "mimic" | "void" | "original";
  type GameStatus = "waiting" | "ready" | "playing" | "finished";

  interface CreateRoomPayload {
    playerName: string;
    creatorEmail: string;
    roomMaxPlayers: number;
    isPublic: boolean;
  }

  interface RoomJoinPayload {
    roomId: string;
    playerName: string;
    playerEmail: string;
    roomPin: string;
  }

  interface RoomRejoinPayload {
    roomId: string;
    socketId: string;
    playerEmail: string;
  }

  interface RoomLeavePayload {
    roomId: string;
    socketId: string;
  }

  interface RoomPlayerData {
    socketId: string;
    playerName: string;
    playerEmail: string;
    role: RoomRole;
  }

  interface GameRule {
    roles: {
      mimic: boolean;
      void: boolean;
    }
    category: string;
    language: string;
    status: GameStatus;
  }

  interface WordPair {
    originalWord: string;
    mimicWord: string;
  }

  /** The minimal voter identity we expose alongside vote tallies. */
  interface PlayerSummary {
    socketId: string;
    playerName: string;
    playerEmail: string;
  }

  interface PlayerWithRole extends PlayerSummary {
    gameRole: GameRole;
    gameWord: string | null;
    hasVoted: boolean;
    voters: PlayerSummary[];
    isAlive: boolean;
  }

  interface GameData {
    wordPairList: WordPair[];
    players: PlayerWithRole[];
  }
  interface RoomData {
    creatorEmail: string;
    roomId: string;
    roomMaxPlayers: number;
    roomPlayers: RoomPlayerData[];
    gameRule: GameRule;
    gameData?: GameData;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  interface AwaitPlayersPayload {
    roomId: string;
  }

  interface GameRuleUpdatePayload {
    roomId: string;
    gameRule: GameRule;
  }

  interface GameStartPayload {
    playerEmail: string;
    roomId: string;
  }

  interface GameInitializePayload {
    playerEmail?: string;
    roomId: string;
  }

  interface GameStartVotePayload {
    playerEmail: string;
    roomId: string;
  }

  interface GameVoteResponsePayload {
    playerEmail: string;
    roomId: string;
    votedEmail: string;
  }

  interface GameCalculateVotePayload {
    playerEmail: string;
    roomId: string;
  }

  interface GameVoidGuessTheWordPayload {
    playerEmail: string;
    roomId: string;
    guessWord: string;
  }

  interface GameContinuePayload {
    playerEmail: string;
    roomId: string;
  }

  interface GameRestartPayload {
    playerEmail: string;
    roomId: string;
  }
}
