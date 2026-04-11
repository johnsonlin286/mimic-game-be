export {};

declare global {
  interface CreateRoomPayload {
    playerName: string;
    creatorEmail: string;
    roomName: string;
    roomMaxPlayers: number;
    roomPin: string;
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

  interface RoomData {
    creatorEmail: string;
    roomDisplayName: string;
    roomId: string;
    roomMaxPlayers: number;
    roomPin: string;
    roomPlayers: RoomPlayerData[];
    gameRule: GameRule;
    createdAt: Date;
    updatedAt: Date;
  }

  interface GameStartPayload {
    roomId: string;
  }

  interface GameConfigPayload {
    roomId: string;
    gameRule: GameRule;
  }
}
