import { NotificationRepository, CreateNotificationData } from '../repositories/notification.repository';
import { parseQueryParams, getPaginationMeta } from '../helpers/query.helper';
import type { Request } from 'express';
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export const setSocketIO = (socketServer: IOServer) => {
  io = socketServer;
};

export class NotificationService {
  private repository = new NotificationRepository();

  /**
   * Send a notification to a single user and push via Socket.IO if connected.
   */
  async send(data: CreateNotificationData) {
    const notification = await this.repository.create(data);
    // Push real-time notification to connected socket client
    if (io) {
      io.to(`user:${data.userId}`).emit('notification', notification);
    }
    return notification;
  }

  /**
   * Broadcast a notification to multiple users at once.
   */
  async broadcast(userIds: string[], title: string, content: string) {
    const data = userIds.map((userId) => ({ userId, title, content }));
    await this.repository.createMany(data);
    if (io) {
      userIds.forEach((userId) => {
        io!.to(`user:${userId}`).emit('notification', { title, content });
      });
    }
    return { sent: userIds.length };
  }

  async getNotifications(userId: string, req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const unreadOnly = req.query.unread === 'true';
    const { notifications, total } = await this.repository.getUserNotifications(userId, page, limit, unreadOnly);
    return { data: notifications, meta: getPaginationMeta(total, page, limit) };
  }

  async getUnreadCount(userId: string) {
    const count = await this.repository.getUnreadCount(userId);
    return { unreadCount: count };
  }

  async markAsRead(id: string, userId: string) {
    await this.repository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    await this.repository.markAllAsRead(userId);
  }

  async delete(id: string, userId: string) {
    await this.repository.delete(id, userId);
  }

  async deleteAll(userId: string) {
    await this.repository.deleteAll(userId);
  }
}

export const notificationService = new NotificationService();
