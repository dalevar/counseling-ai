import { Request, Response, NextFunction } from 'express';
import { CounselingService } from '../services/counseling.service';
import { sendCreated, sendSuccess } from '../helpers/response';
import { ApiError } from '../utils/ApiError';

export class CounselingController {
  private service = new CounselingService();

  bookSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.service.bookSession(req.user.id, req.body);
      sendCreated(res, 'Sesi konseling berhasil dipesan', result);
    } catch (error) {
      next(error);
    }
  };

  listSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.service.listSessions(req.user.id, req.user.role, req.query);
      sendSuccess(res, 'Daftar sesi konseling berhasil diambil', result.sessions, result.meta);
    } catch (error) {
      next(error);
    }
  };

  getSessionDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.service.getSessionDetail(req.params.id, req.user.id, req.user.role);
      sendSuccess(res, 'Detail sesi konseling berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.service.updateStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body.status
      );
      sendSuccess(res, 'Status sesi konseling berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  addNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.service.addNotes(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body.notes
      );
      sendSuccess(res, 'Catatan konselor berhasil ditambahkan', result);
    } catch (error) {
      next(error);
    }
  };

  submitFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const { rating, feedback } = req.body;
      const result = await this.service.submitFeedback(
        req.params.id,
        req.user.id,
        rating,
        feedback
      );
      sendSuccess(res, 'Feedback dan rating berhasil dikirim', result);
    } catch (error) {
      next(error);
    }
  };

  getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.service.getChatHistory(req.params.id, req.user.id, req.user.role);
      sendSuccess(res, 'Riwayat chat berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  };
}
