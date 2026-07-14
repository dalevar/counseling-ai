import { prisma } from '../utils/prisma';

export interface CreateNotificationData {
  userId: string;
  title: string;
  content: string;
}

export class NotificationRepository {
  async create(data: CreateNotificationData) {
    return prisma.notification.create({ data });
  }

  async createMany(data: CreateNotificationData[]) {
    return prisma.notification.createMany({ data, skipDuplicates: true });
  }

  async getUserNotifications(userId: string, page: number, limit: number, unreadOnly = false) {
    const where = { userId, ...(unreadOnly && { isRead: false }) };
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);
    return { notifications, total };
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  }

  async deleteAll(userId: string) {
    return prisma.notification.deleteMany({ where: { userId } });
  }
}
