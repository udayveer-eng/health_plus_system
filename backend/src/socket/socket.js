import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient } from "../config/redis.js"; // Existing redis client
import socketAuth from "./socketAuth.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Will lock down to specific domains in production
      methods: ["GET", "POST"],
    },
  });

  // Setup Redis Adapter if Redis is connected
  if (redisClient.isOpen) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis adapter enabled for horizontal scaling.");
    }).catch(err => console.error("Redis Adapter setup failed:", err));
  }

  // Middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const { userId, role, city } = socket.user;
    
    // Automatically join identity rooms
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);
    
    // Join Regional Room for efficient geographic broadcasting (O(1) instead of O(N))
    if (city) {
      socket.join(`region:${city.toLowerCase()}`);
    }
    
    console.log(`Socket connected: User ${userId} (${role}) [SocketID: ${socket.id}, Region: ${city || 'None'}]`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: User ${userId}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    console.warn("Socket.io not initialized!");
  }
  return io;
};

export const getSocketMetrics = () => {
  if (!io) return { activeConnections: 0, totalRooms: 0 };
  
  const activeConnections = io.engine.clientsCount;
  const totalRooms = io.sockets.adapter.rooms.size;
  
  return { activeConnections, totalRooms };
};
