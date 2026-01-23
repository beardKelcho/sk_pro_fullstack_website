/**
 * WebSocket Configuration
 * Socket.io entegrasyonu için yapılandırma
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { authenticateSocket } from '../middleware/socketAuth.middleware';
import logger from '../utils/logger';

let io: SocketIOServer | null = null;

/**
 * WebSocket server'ı başlat
 */
export const initWebSocket = (httpServer: HttpServer): SocketIOServer => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(authenticateSocket);

  interface AuthenticatedSocket extends Socket {
    user?: {
      id?: string;
      _id?: string;
      role?: string;
    };
  }

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.user?.id || authSocket.user?._id;
    const userRole = authSocket.user?.role;

    logger.info(`WebSocket: Kullanıcı bağlandı`, { userId, userRole, socketId: socket.id });

    // Kullanıcıyı kendi room'una ekle
    if (userId) {
      socket.join(`user:${userId}`);
      socket.join(`role:${userRole}`);
    }

    // Collaborative editing için room'lar
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.debug(`WebSocket: Kullanıcı proje room'una katıldı`, { userId, projectId });
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.debug(`WebSocket: Kullanıcı proje room'undan ayrıldı`, { userId, projectId });
    });

    // Collaborative editing events
    socket.on('project:edit', (data: { projectId: string; changes: any }) => {
      // Diğer kullanıcılara broadcast et
      socket.to(`project:${data.projectId}`).emit('project:update', {
        userId,
        changes: data.changes,
        timestamp: new Date().toISOString(),
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`WebSocket: Kullanıcı bağlantısı kesildi`, { userId, socketId: socket.id });
    });
  });

  logger.info('✅ WebSocket server başlatıldı');
  return io;
};

/**
 * WebSocket server instance'ını al
 */
export const getWebSocketServer = (): SocketIOServer | null => {
  return io;
};

/**
 * Belirli bir role mesaj gönder
 */
export const sendToRole = (role: string, event: string, data: any) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

/**
 * Belirli bir kullanıcıya mesaj gönder
 */
export const sendToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Tüm kullanıcılara broadcast et
 */
export const broadcast = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Belirli bir room'a mesaj gönder
 */
export const sendToRoom = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};
