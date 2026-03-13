const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const onlineStatusService = require("../services/onlineStatus.service");
const ChatRoomModel = require("../models/chat_room.model");

let io;

/**
 * JWT auth middleware: verify token at handshake, set socket.data.userId from payload.
 * Token from auth.token or query.token. Guests (no token) get socket.data.userId = null.
 */
const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    socket.data.userId = null;
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Socket handshake JWT invalid: ${err.message}`);
      socket.data.userId = null;
      return next();
    }
    socket.data.userId = decoded.id ? String(decoded.id) : null;
    next();
  });
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 30000, // Wait 30s for ping response
    pingInterval: 10000 // Send ping every 10s
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const userId = socket.data.userId; // From JWT, not query
    logger.info(`New client connected: ${socket.id}, userId: ${userId || "guest"}`);
    onlineStatusService.sessionConnected(socket.id).then(async () => {
      const count = await onlineStatusService.getWorldOnlineCount();
      io.emit("world_presence_update", { count });
    });
    socket.joinedAuthorRooms = new Set();
    socket.inWorldChat = false;

    if (userId) {
      onlineStatusService.userConnected(userId);
      // Join individual notification room
      socket.join(`user_notification_${userId}`);
      logger.info(`User ${userId} joined notification room.`);
    }

    socket.on("join_room", async (roomId) => {
      const rid = Number(roomId);
      if (!rid || rid < 1) return;
      if (rid === 1) {
        socket.join("room_1");
        return;
      }
      if (!userId) return;
      const room = await ChatRoomModel.getRoomById(rid);
      if (!room) return;
      const isMember = await ChatRoomModel.isMember(rid, userId);
      if (isMember) socket.join(`room_${rid}`);
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(`room_${roomId}`);
    });

    socket.on("join_world_chat", async () => {
      socket.inWorldChat = true;
      if (!userId) {
        await onlineStatusService.worldGuestJoined(socket.id);
      } else {
        await onlineStatusService.worldUserJoined(userId, socket.id);
      }
      const count = await onlineStatusService.getWorldOnlineCount();
      io.emit("world_presence_update", { count });
    });

    socket.on("leave_world_chat", async () => {
      socket.inWorldChat = false;
      if (!userId) {
        await onlineStatusService.worldGuestLeft(socket.id);
      } else {
        await onlineStatusService.worldUserLeft(userId, socket.id);
      }
      const count = await onlineStatusService.getWorldOnlineCount();
      io.emit("world_presence_update", { count });
    });

    // --- AUTHOR ROOMS (Redis Optimized) ---
    socket.on("join_author_room", async ({ authorId }) => {
      if (!userId || !authorId) return;
      
      const ChatService = require("../services/chat.service");
      const { onlineCount, history } = await ChatService.joinAuthorRoom(userId, authorId, socket.id);
      
      socket.join(`author_room_${authorId}`);
      socket.joinedAuthorRooms.add(authorId);
      
      // Notify the room about the new online count
      io.to(`author_room_${authorId}`).emit("author_presence_update", { 
        authorId, 
        count: onlineCount 
      });

      // Send history and current count to the joining user
      socket.emit("author_room_joined", { authorId, history, onlineCount });
    });

    socket.on("leave_author_room", async ({ authorId }) => {
      if (!userId || !authorId) return;
      
      const ChatService = require("../services/chat.service");
      const { onlineCount } = await ChatService.leaveAuthorRoom(userId, authorId, socket.id);
      
      socket.leave(`author_room_${authorId}`);
      socket.joinedAuthorRooms.delete(authorId);
      
      io.to(`author_room_${authorId}`).emit("author_presence_update", { 
        authorId, 
        count: onlineCount 
      });
    });

    socket.on("disconnect", async () => {
      logger.info(`Client disconnected: ${socket.id}`);
      await onlineStatusService.sessionDisconnected(socket.id);
      if (socket.inWorldChat) {
        if (!userId) {
          await onlineStatusService.worldGuestLeft(socket.id);
        } else {
          await onlineStatusService.worldUserLeft(userId, socket.id);
        }
      }
      const count = await onlineStatusService.getWorldOnlineCount();
      io.emit("world_presence_update", { count });

      if (userId) {
        const ChatService = require("../services/chat.service");
        for (const authorId of socket.joinedAuthorRooms) {
          const { onlineCount } = await ChatService.leaveAuthorRoom(userId, authorId, socket.id);
          io.to(`author_room_${authorId}`).emit("author_presence_update", { 
            authorId, 
            count: onlineCount 
          });
        }

        const sockets = await io.fetchSockets();
        const hasOtherSessions = sockets.some(s => s.data?.userId === userId && s.id !== socket.id);
        
        if (!hasOtherSessions) {
          onlineStatusService.userDisconnected(userId);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };

