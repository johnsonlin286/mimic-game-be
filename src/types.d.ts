export {};

declare global {
  type RoomRole = "host" | "player";
  type GameRole = "minority" | "majority" | "blind";
  type ActivePowers = "interrogator" | "detective";
  type PassivePowers = "chief" | "saboteur" | "briber";
  type Superpower = {
    name: string;
    type: "active" | "passive";
    description: string;
    allowedRoles: GameRole[];
  }
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
      minority: boolean;
      blind: boolean;
    }
    superpowers: boolean;
    category: string;
    language: string;
    status: GameStatus;
  }

  interface WordPair {
    majorityWord: string;
    minorityWord: string;
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
    superpower: Superpower | null;
    hasUsedSuperpower: boolean | undefined;
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
    creatorName: string;
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

  interface UseSuperpowerPayload {
    playerEmail: string;
    roomId: string;
    powerName: string;
  }

  interface UseDetectivePayload {
    roomId: string;
    playerEmail: string;
    targetPlayerEmail: string;
  }
}
