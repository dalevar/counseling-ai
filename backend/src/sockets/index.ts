import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';
import { RoleName } from '@prisma/client';
import { setSocketIO } from '../services/notification.service';

interface SocketUser {
  id: string;
  role: RoleName;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

export const initializeSocket = (server: HttpServer): SocketServer => {
  const io = new SocketServer(server, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  // Authentication Middleware for Sockets
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded: any = jwt.verify(cleanToken, config.jwt.secret);
      
      socket.user = {
        id: decoded.sub,
        role: decoded.role as RoleName,
      };
      
      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Wire up notification service with socket instance
  setSocketIO(io);

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user?.id})`);

    // Automatically join personal notification room
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      logger.debug(`User ${socket.user.id} joined personal room user:${socket.user.id}`);
    }

    // Join room for a specific counseling session
    socket.on('join_session', async (payload: { sessionId: string }) => {
      try {
        const { sessionId } = payload;
        const userId = socket.user?.id;

        if (!userId) return;

        // Verify if user is part of the session
        const session = await prisma.sessionCounseling.findUnique({
          where: { id: sessionId },
        });

        if (!session) {
          socket.emit('error_message', { message: 'Sesi konseling tidak ditemukan' });
          return;
        }

        if (
          session.studentId !== userId &&
          session.counselorId !== userId &&
          session.teacherId !== userId &&
          socket.user?.role !== RoleName.ADMIN
        ) {
          socket.emit('error_message', { message: 'Anda tidak diizinkan masuk ke room sesi ini' });
          return;
        }

        const roomName = `session_${sessionId}`;
        await socket.join(roomName);
        logger.info(`User ${userId} joined room ${roomName}`);
        
        // Notify others
        socket.to(roomName).emit('user_joined', { userId, role: socket.user?.role });
      } catch (err) {
        logger.error('Error joining socket session:', err);
      }
    });

    // Handle sending message in session room
    socket.on('send_message', async (payload: { sessionId: string; content: string }) => {
      try {
        const { sessionId, content } = payload;
        const senderId = socket.user?.id;

        if (!senderId || !content?.trim()) return;

        // Double check session membership
        const session = await prisma.sessionCounseling.findUnique({
          where: { id: sessionId },
        });

        if (!session) return;

        if (
          session.studentId !== senderId &&
          session.counselorId !== senderId &&
          session.teacherId !== senderId
        ) {
          socket.emit('error_message', { message: 'Akses chat ditolak' });
          return;
        }

        // Save message to database
        const message = await prisma.counselingMessage.create({
          data: {
            sessionId,
            senderId,
            content,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        const roomName = `session_${sessionId}`;
        io.to(roomName).emit('receive_message', {
          id: message.id,
          sessionId: message.sessionId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
        });

        logger.debug(`Message sent in room ${roomName} by user ${senderId}`);
      } catch (err) {
        logger.error('Error handling socket message:', err);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
