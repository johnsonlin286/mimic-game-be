export {};

declare global {
  interface CreateRoomPayload {
    creatorEmail: string;
    roomName: string;
    roomMaxPlayers: number;
    roomPin: string;
  }

  interface RoomJoinPayload {
    roomId: string;
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
    playerEmail: string;
  }

  interface RoomPlayerData {
    socketId: string;
    playerEmail: string;
    role: string;
  }

  interface RoomData {
    creatorEmail: string;
    roomDisplayName: string;
    roomId: string;
    roomMaxPlayers: number;
    roomPin: string;
    roomPlayers: RoomPlayerData[];
    createdAt: Date;
    updatedAt: Date;
  }
}
