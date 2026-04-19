import { Server, Socket } from "socket.io";

import rooms from "../rooms";

export default function registerRoomHandlers(io: Server, socket: Socket) {
  const roomCreate = (payload: CreateRoomPayload) => {
    const { playerName, creatorEmail, roomMaxPlayers, isPublic } = payload;
    if (!playerName) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Player name is required!",
      });
      return;
    }
    if (!creatorEmail) {
      socket.emit("room-create-failed", { 
        success: false,
        message: "Creator email is required!",
      });
      return;
    } else if (Array.from(rooms.values()).some(room => room.creatorEmail === creatorEmail)) {
      socket.emit("room-create-failed", {
        success: false,
        message: "Creator email already exists!",
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
    const reformedPlayerName = playerName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const roomName = `${reformedPlayerName}-${Date.now().toString()}`;
    const roomData: RoomData = {
      creatorEmail: creatorEmail,
      roomId: roomName,
      roomMaxPlayers: roomMaxPlayers,
      roomPlayers: [
        { socketId: socket.id, playerName: playerName, playerEmail: creatorEmail, role: "host" },
      ],
      gameRule: {
        roles: {
          mimic: true,
          void: false,
        },
        category: "food-drink",
        language: "en",
        status: "waiting",
      },
      isPublic: isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rooms.set(roomName, roomData);
    socket.join(roomName);
    socket.emit("room-created", {
      success: true,
      message: "Room created successfully",
      data: {
        roomId: roomData.roomId,
        roomMaxPlayers: roomData.roomMaxPlayers,
        roomPlayers: roomData.roomPlayers,
        gameRule: roomData.gameRule,
        gameData: roomData.gameData,
        isPublic: roomData.isPublic,
        createdAt: roomData.createdAt,
        updatedAt: roomData.updatedAt,
      },
    });
  };

  const roomJoin = (payload: RoomJoinPayload) => {
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
    if (Array.from(rooms.values()).some(room => room.roomPlayers.some(player => player.playerEmail === payload.playerEmail))) {
      socket.emit("room-join-failed", {
        success: false,
        message: "Player already in another room!",
      });
      return;
    }
    socket.join(payload.roomId);
    room.roomPlayers.push({ socketId: socket.id, playerName: payload.playerName, playerEmail: payload.playerEmail, role: "player" });
    room.updatedAt = new Date();
    if (room.roomPlayers.length >= 3) {
      room.gameRule.status = "ready";
    } else {
      room.gameRule.status = "waiting";
    }
    socket.emit("room-join-success", {
      success: true,
      message: "Room joined successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        gameData: room.gameData,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
    io.to(payload.roomId).emit("listen-room-join-success", {
      success: true,
      message: `${payload.playerName} joined the room`,
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        gameData: room.gameData,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }

  const roomRejoin = (payload: RoomRejoinPayload) => {
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
    } else if (Array.from(rooms.values()).some(room => room.roomPlayers.some(player => player.playerEmail === payload.playerEmail))) {
      socket.emit("room-rejoin-failed", {
        success: false,
        message: "Player already in another room!",
      });
      return;
    }
    socket.join(payload.roomId);
    player.socketId = payload.socketId;
    room.updatedAt = new Date();
    io.to(payload.roomId).emit("room-rejoin-success", {
      success: true,
      message: "Room rejoined successfully",
      data: {
        roomId: room.roomId,
        roomMaxPlayers: room.roomMaxPlayers,
        roomPlayers: room.roomPlayers,
        gameRule: room.gameRule,
        gameData: room.gameData,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
    });
  }

  const roomLeave = (payload: RoomLeavePayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) {
      socket.emit("room-leave-not-found", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    const player = room.roomPlayers.find(player => player.socketId === payload.socketId);
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
        }
        roomKick(kickPayload);
      })
    } else {
      socket.leave(payload.roomId);
      // update room updated at
      room.updatedAt = new Date();
      // remove player from room players
      room.roomPlayers = room.roomPlayers.filter(player => player.socketId !== payload.socketId);
      if (room.gameRule.status !== "playing" && room.roomPlayers.length < 3) {
        room.gameRule.status = "waiting";
      }
      io.to(payload.roomId).emit("listen-room-leave-success", {
        success: true,
        message: `${player.playerEmail} left the room`,
        data: {
          roomId: room.roomId,
          roomMaxPlayers: room.roomMaxPlayers,
          roomPlayers: room.roomPlayers,
          gameRule: room.gameRule,
          gameData: room.gameData,
          isPublic: room.isPublic,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
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
      socket.emit("room-kick-failed", {
        success: false,
        message: "Room not found",
      });
      return;
    }
    // if (room.gameRule.status === "playing") {
    //   socket.emit("room-kick-failed", {
    //     success: false,
    //     message: "Game is in playing state",
    //   });
    //   return;
    // }
    const player = room.roomPlayers.find(player => player.socketId === payload.socketId);
    if (!player) {
      socket.emit("room-kick-failed", {
        success: false,
        message: "Player not found",
      });
      return;
    }
    io.in(payload.socketId).socketsLeave(payload.roomId);
    room.roomPlayers = room.roomPlayers.filter(player => player.socketId !== payload.socketId);
    room.updatedAt = new Date();
    if (room.roomPlayers.length < 3) {
      room.gameRule.status = "waiting";
    }
    io.to(payload.socketId).emit("listen-room-kicked-player", {
      success: true,
      message: "You have been kicked from the room",
      data: {
        playerEmail: player.playerEmail,
      }
    });
    io.to(payload.roomId).emit("listen-room-kick-player", {
      success: true,
      message: `${player.playerEmail} has been kicked from the room`,
      data: {
        room: {
          roomId: room.roomId,
          roomMaxPlayers: room.roomMaxPlayers,
          roomPlayers: room.roomPlayers,
          gameRule: room.gameRule,
          gameData: room.gameData,
          isPublic: room.isPublic,
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