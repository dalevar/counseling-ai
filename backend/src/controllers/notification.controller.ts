import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../helpers/response';

export class NotificationController {
  private service = new NotificationService();

  // GET /api/v1/notifications
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getNotifications(req.user.id, req);
      sendSuccess(res, 'Notifikasi berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/notifications/unread-count
  unreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getUnreadCount(req.user.id);
      sendSuccess(res, 'Jumlah notifikasi belum dibaca berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/notifications/:id/read
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      await this.service.markAsRead(req.params.id, req.user.id);
      sendSuccess(res, 'Notifikasi ditandai sudah dibaca', null);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/notifications/read-all
  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      await this.service.markAllAsRead(req.user.id);
      sendSuccess(res, 'Semua notifikasi ditandai sudah dibaca', null);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/notifications/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      await this.service.delete(req.params.id, req.user.id);
      sendSuccess(res, 'Notifikasi berhasil dihapus', null);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/notifications
  deleteAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      await this.service.deleteAll(req.user.id);
      sendSuccess(res, 'Semua notifikasi berhasil dihapus', null);
    } catch (error) {
      next(error);
    }
  };
}
