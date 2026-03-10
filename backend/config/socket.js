const { Server } = require("socket.io");
const logger = require("../utils/logger");
const onlineStatusService = require("../services/onlineStatus.service");

let io;

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

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    onlineStatusService.sessionConnected(socket.id).then(async () => {
      const count = await onlineStatusService.getOnlineCount();
      io.emit("world_presence_update", { count });
    });
    socket.joinedAuthorRooms = new Set();
    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineStatusService.userConnected(userId);
      // Join individual notification room
      socket.join(`user_notification_${userId}`);
      logger.info(`User ${userId} joined notification room.`);
    }

    socket.on("join_room", (roomId) => {
      socket.join(`room_${roomId}`);
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(`room_${roomId}`);
    });

    socket.on("join_world_chat", async () => {
      if (!userId) {
        await onlineStatusService.worldGuestJoined(socket.id);
      }
      const count = await onlineStatusService.getOnlineCount();
      io.emit("world_presence_update", { count });
    });

    socket.on("leave_world_chat", async () => {
      if (!userId) {
        await onlineStatusService.worldGuestLeft(socket.id);
      }
      const count = await onlineStatusService.getOnlineCount();
      io.emit("world_presence_update", { count });
    });

    // --- AUTHOR ROOMS (Redis Optimized) ---
    socket.on("join_author_room", async ({ authorId }) => {
      if (!userId || !authorId) return;
      
      const ChatService = require("../services/chat.service");
      const { onlineCount, history } = await ChatService.joinAuthorRoom(userId, authorId);
      
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
      const { onlineCount } = await ChatService.leaveAuthorRoom(userId, authorId);
      
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
      const count = await onlineStatusService.getOnlineCount();
      io.emit("world_presence_update", { count });

      if (userId) {
        // Cleanup Author Room presence
        const ChatService = require("../services/chat.service");
        for (const authorId of socket.joinedAuthorRooms) {
          const { onlineCount } = await ChatService.leaveAuthorRoom(userId, authorId);
          io.to(`author_room_${authorId}`).emit("author_presence_update", { 
            authorId, 
            count: onlineCount 
          });
        }

        // Check if user has other active sockets before removing from online set
        const sockets = await io.fetchSockets();
        const hasOtherSessions = sockets.some(s => s.handshake.query.userId === userId && s.id !== socket.id);
        
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


