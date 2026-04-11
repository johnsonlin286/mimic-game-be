import { Server, Socket } from "socket.io";

import rooms from "../rooms";

export default function registerRoomHandlers(io: Server, socket: Socket) {
  const roomCreate = (payload: CreateRoomPayload) => {
    console.log("Room create", payload);
    const { creatorEmail, roomName, roomMaxPlayers, roomPin } = payload;
    if (!creatorEmail) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Creator email is required!",
      });
      return;
    }
    if (!roomName) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Room name is required!",
      });
      return;
    } else if (roomName.length < 3 || roomName.length > 20) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Room name must be between 3 and 20 characters!",
      });
      return;
    }
    if (!roomMaxPlayers) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Room max players is required!",
      });
      return;
    } else if (roomMaxPlayers < 3 || roomMaxPlayers > 10) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Room max players must be between 3 and 10!",
      });
      return;
    }
    if (!roomPin) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Room pin is required!",
      });
      return;
    } else if (roomPin.length !== 4) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Room pin must be 4 characters!",
      });
      return;
    }
    const newName = `${payload.roomName}-${Date.now().toString()}`;
    const roomData: RoomData = {
      creatorEmail: payload.creatorEmail,
      roomDisplayName: payload.roomName,
      roomId: newName,
      roomMaxPlayers: payload.roomMaxPlayers,
      roomPin: payload.roomPin,
      roomPlayers: [
        { socketId: socket.id, playerEmail: payload.creatorEmail, role: "host" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rooms.set(newName, roomData);
    socket.join(newName);
    socket.emit("room-created", {
      success: true,
      message: "Room created successfully",
      data: {
        room: {
          roomId: roomData.roomId,
          roomDisplayName: roomData.roomDisplayName,
          roomMaxPlayers: roomData.roomMaxPlayers,
          roomPlayers: roomData.roomPlayers,
          createdAt: roomData.createdAt,
          updatedAt: roomData.updatedAt,
        },
        player: {
          playerEmail: payload.creatorEmail,
          role: "host",
        },
      },
    });
  };

  const roomJoin = (payload: RoomJoinPayload) => {
    console.log("Room join", payload);
    // TODO: validate payload
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("room-join-failed", {
        success: false,
        message: "Room not found!",
      });
      return;
    }
    if (room.roomPlayers.length >= room.roomMaxPlayers) {
      socket.emit("room-join-failed", {
        success: false,
        message: "Room is full!",
      });
      return;
    }
    if (payload.roomPin !== room.roomPin) {
      socket.emit("room-join-failed", {
        success: false,
        message: "Invalid room pin!",
      });
      return;
    }
    room.roomPlayers.push({ socketId: socket.id, playerEmail: payload.playerEmail, role: "player" });
    room.updatedAt = new Date();
    socket.join(payload.roomId);
    socket.emit("room-join-success", {
      success: true,
      message: "Room joined successfully",
      data: {
        room: {
          roomId: room.roomId,
          roomDisplayName: room.roomDisplayName,
          roomMaxPlayers: room.roomMaxPlayers,
          roomPlayers: room.roomPlayers,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
        player: {
          playerEmail: payload.playerEmail,
          role: "player",
        },
      },
    });
  }

  const roomRejoin = (payload: RoomRejoinPayload) => {
    console.log("Room rejoin", payload);
    
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("room-rejoin-not-found", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    const player = room.roomPlayers.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("room-rejoin-not-found", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    // update room updated at
    room.updatedAt = new Date();
    // update player socket id
    player.socketId = payload.socketId;
    socket.join(payload.roomId);
    io.to(payload.roomId).emit("room-rejoin-success", {
      success: true,
      message: "Room rejoined successfully",
      data: {
        room: {
          roomId: room.roomId,
          roomDisplayName: room.roomDisplayName,
          roomMaxPlayers: room.roomMaxPlayers,
          roomPlayers: room.roomPlayers,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      },
    });
  }

  const roomLeave = (payload: RoomLeavePayload) => {
    console.log("Room leave", payload);
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("room-leave-not-found", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    const player = room.roomPlayers.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("room-leave-not-found", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    if (player.role === "host") {
      console.log("Host left the room, kicking all players", payload.roomId);
      // kick all players
      room.roomPlayers.forEach(player => {
        const kickPayload: RoomLeavePayload = {
          roomId: payload.roomId,
          socketId: player.socketId,
          playerEmail: player.playerEmail,
        }
        roomKick(kickPayload);
      })
    } else {
      console.log("Room leave player");
      // update room updated at
      room.updatedAt = new Date();
      // remove player from room players
      room.roomPlayers = room.roomPlayers.filter(player => player.playerEmail !== payload.playerEmail);
      socket.leave(payload.roomId);
      io.to(payload.roomId).emit("listen-room-leave-success", {
        success: true,
        message: `${player.playerEmail} left the room`,
        data: {
          player: {
            playerEmail: payload.playerEmail,
            role: player.role,
          },
          room: {
            roomId: room.roomId,
            roomDisplayName: room.roomDisplayName,
            roomMaxPlayers: room.roomMaxPlayers,
            roomPlayers: room.roomPlayers,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
          },
        },
      });
    }
    socket.emit("room-leave-success", {
      success: true,
      message: `${player.playerEmail} left the room`,
    });
    // check room players count, if it's 0, dismiss the room
    if (room.roomPlayers.length === 0) {
      rooms.delete(payload.roomId);
    }
  }

  const roomKick = (payload: RoomLeavePayload) => {
    console.log("Room kick", payload);
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("room-kick-not-found", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    const player = room.roomPlayers.find(player => player.playerEmail === payload.playerEmail);
    if (!player) {
      socket.emit("room-kick-not-found", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    // update room updated at
    room.updatedAt = new Date();
    // remove player from room players
    room.roomPlayers = room.roomPlayers.filter(player => player.playerEmail !== payload.playerEmail);
    io.in(payload.socketId).socketsLeave(payload.roomId);
    io.to(payload.socketId).emit("listen-room-kicked-player", {
      success: true,
      message: "You have been kicked from the room",
      data: {
        playerEmail: payload.playerEmail,
      }
    });
    io.to(payload.roomId).emit("listen-room-kick-player", {
      success: true,
      message: `${payload.playerEmail} has been kicked from the room`,
      data: {
        room: {
          roomId: room.roomId,
          roomDisplayName: room.roomDisplayName,
          roomMaxPlayers: room.roomMaxPlayers,
          roomPlayers: room.roomPlayers,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      }
    });
    // check room players count, if it's 0, dismiss the room
    if (room.roomPlayers.length === 0) {
      rooms.delete(payload.roomId);
    }
  }

  socket.on("room:create", roomCreate)
  socket.on("room:join", roomJoin)
  socket.on("room:rejoin", roomRejoin)
  socket.on("room:leave", roomLeave)
  socket.on("room:kick", roomKick)
}