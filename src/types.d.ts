export {};

declare global {
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
    role: string;
  }

  interface GameRule {
    roles: {
      mimic: boolean;
      void: boolean;
    }
    category: string;
    language: string;
    status: "waiting" | "ready" | "playing" | "finished";
  }

  interface WordPair {
    originalWord: string;
    mimicWord: string;
  }

  interface PlayerWithRole {
    socketId: string;
    playerName: string;
    playerEmail: string;
    gameRole: string;
    gameWord?: string | null;
    hasVoted: boolean;
    voters: Partial<PlayerWithRole>[];
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
